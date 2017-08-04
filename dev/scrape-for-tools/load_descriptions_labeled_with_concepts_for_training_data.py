if __name__ == "__main__":
    # load tools' READ-ids, descriptions, and labeled concepts
    # train and test models with this data
    import json
    import re
    from sklearn.preprocessing import MultiLabelBinarizer

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
    except Exception:
        print('CACHED DESCRIPTIONS NOT FOUND; DOWNLOADING LONG DESCRIPTIONS')
        for decision_sector in decision_sectors:
            response = []
            # query READ for READ-ids and short descriptions
            response += requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json()
        for summary in response:
            read_id = summary['ResourceId']
            descriptions_by_read_id[read_id] = ''
            details = {}
            details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
            descriptions_by_read_id[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
        with open(descriptions_file, 'w') as f:
            json.dump(descriptions_by_read_id, f)
            print('SAVED LONG DESCRIPTIONS TO FILE ' + descriptions_file)

    # preprocess priors as a training set:
    # we have prior knowledge of what text labeled with
    # concepts look like, so let the machine learn from that
    # try load concepts indexed by READ-id to be y
    # collect from wizard.html on exception
    # hence deleting json-files forces update of data from app
    try:
        with open(concepts_by_read_id_filename) as f:
            concepts_by_read_id = json.load(f)
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
            # create an dict of concepts indexed by read id
            concepts_by_read_id = {}
            for concept in read_ids_by_concept.keys():
                for read_id in read_ids_by_concept[concept]:
                    if read_id not in concepts_by_read_id.keys():
                        concepts_by_read_id[read_id] = []
                    if concept not in concepts_by_read_id[read_id]:
                        concepts_by_read_id[read_id].append(concept)

    # correspondingly ordered lists of each set from among
    # read_ids, labels, concepts used as labels
    read_ids = sorted(descriptions_by_read_id.keys())
    labels = [concepts_by_read_id[read_id] for read_id in read_ids]
    descriptions = [descriptions_by_read_id[read_id] for read_id in read_ids]

    mlb = MultiLabelBinarizer()
    y_bin = mlb.fit_transform(labels)
    #print(list(zip(read_ids, descriptions, labels, list(y_bin)))[0])
    import numpy as np
    X = np.array(descriptions) # X[i] is a string describing read_ids[i]
    y = labels # y[i] is a collection of labels for X[i] and read_ids[i]
    print(list(zip(X,y,y_bin))[0])
