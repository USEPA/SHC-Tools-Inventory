if __name__ == "__main__":
    # load tools' READ-ids, descriptions, and labeled concepts
    # train and test models with this data
    import json
    import re

    descriptions_by_read_id = {}
    descriptions_file = 'descriptions.json'
    concepts_by_read_id_filename = 'concepts_by_READ_id.json'
    read_ids_by_concept_filename = 'READ_ids_by_concept.json'
    wizard_filename = '../../wizard.html'

    # try load descriptions indexed by READ-id from a file
    # download descriptions on exception
    # hence deleting json-files forces update of data from app
    try:
        with open(descriptions_file) as f:
            descriptions_by_read_id = json.load(f)
            print(descriptions_by_read_id)
            import sys;sys.exit()
    except Exception:
        print('CACHED DESCRIPTIONS NOT FOUND; DOWNLOADING DESCRIPTIONS')
        for decision_sector in decision_sectors:
            response = []
            response += requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json()
        for summary in response:
            read_id = summary['ResourceId']
            descriptions_by_read_id[read_id] = ''
            details = {}
            details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
            descriptions_by_read_id[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
        with open(descriptions_file, 'w') as f:
            json.dump(descriptions_by_read_id, f)

    # preprocess priors as a training set:
    # we have prior knowledge of what text labeled with
    # concepts look like, so let the machine learn from that
    # try load concepts indexed by READ-id to be training data
    # collect from wizard.html on exception
    # hence deleting json-files forces update of data from app
    try:
        with open(concepts_by_read_id_filename) as f:
            concepts_by_read_id = json.load(f)
            print('LOADED concepts_by_read_id')
    except Exception:
        try:
            with open(read_ids_by_concept_filename) as f:
                read_ids_by_concept = json.load(f)
        except Exception:
            print('CACHED CONCEPTS NOT FOUND; PARSING CONCEPTS FROM ' + wizard_filename)
            with open(wizard_filename, encoding='utf8') as f:
                wizard_text = f.read()
            read_ids_by_concept = re.search('readIDsByConcept = (.+);\n', wizard_text).group(1)
            with open(read_ids_by_concept_filename, 'w') as read_ids_by_concept_file:
                json.dump(read_ids_by_concept, read_ids_by_concept_file)
                print('WROTE read_ids_by_concept.json')

    #DELETEME TEST!!!!!!!!!!!
    print('loading wizard\'s text to test re.search and json.dumps')
    with open(wizard_filename, encoding='utf8') as f:
        wizard_text = f.read()
    print(wizard_text[:60])
    print('testing writing to file DELETEME_TEST_JSON_DUMPS.json with json.dumps')
    read_ids_by_concept_test = re.search('readIDsByConcept = (.+);\n', wizard_text).group(1)
    print(read_ids_by_concept_test[:60])
    print(read_ids_by_concept_test)
    with open('DELETEME_TEST_JSON_DUMPS.json', 'w') as f:
        json.dump(read_ids_by_concept_test, f)

    # create an dict of concepts indexed by read id
    concepts_by_read_id = {}
    for concept in read_ids_by_concept.keys():
        for read_id in read_ids_by_concept[concept]:
            if read_id not in concepts_by_read_id.keys():
                concepts_by_read_id[read_id] = []
            if concept not in concepts_by_read_id[read_id]:
                concepts_by_read_id[read_id].append(concept)

    # create a list of all concepts used as labels
    read_ids = sorted(descriptions_by_read_id.keys())
    labels = [concept_list for concept_list in concepts_by_read_id]
    descriptions = [descriptions_by_read_id[read_id] for read_id in read_ids]

    # format training labels into dict associating read_id to a list of labels
    training_labels = []
    for i in range(len(read_ids)):
        training_labels.append(set())
        for k in range(len(labels)):
            if labels[k] in concepts_by_read_id[read_ids[i]]:
                training_labels[i].add(labels[k])
    mlb = MultiLabelBinarizer()
    y_bin = mlb.fit_transform(training_labels)
