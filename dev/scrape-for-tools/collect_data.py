def collect_data():
    """return read_ids, descriptions, labeled_concepts"""
    import json
    from os.path import exists

    concepts_by_read_id = {}

    # dict of descriptions keyed by READ-id
    with open('data/descriptions.json') as f:
        descriptions_by_read_id = json.load(f)

    # load concepts indexed by READ-id
    if exists('data/concepts_by_READ_id.json'):
        with open('data/concepts_by_READ_id.json') as f:
            concepts_by_read_id = json.load(f)
    # create dict of concepts indexed by READ-id
    else:
        print('data/concepts_by_READ_id.json doesn\'t exist so can\'t be loaded into a dict named concepts_by_read_id')
        print('creating a dict of concepts indexed by READ-id from data/READ_ids_by_concept.json...')
        with open('data/READ_ids_by_concept.json') as f:
            read_ids_by_concept = json.load(f)
            for concept in read_ids_by_concept.keys():
                for id in read_ids_by_concept[concept]:
                    if id not in concepts_by_read_id.keys():
                        concepts_by_read_id[id] = [concept]
                    else:
                        concepts_by_read_id[id].append(concept)
        # dump concepts indexed by READ-id to a json-file
        with open('data/concepts_by_READ_id.json', 'w') as concepts_by_read_id_file:
            json.dump(concepts_by_read_id, concepts_by_read_id_file)

    # prepare and return collected data
    read_ids = [read_id for read_id in sorted(descriptions_by_read_id.keys())]
    descriptions = [descriptions_by_read_id[read_id] for read_id in read_ids]
    labeled_concepts = [concepts_by_read_id[read_id] for read_id in read_ids]
    return read_ids, descriptions, labeled_concepts

if __name__ == '__main__':
    print('exporting variables read_ids, descriptions, and labeled_concepts as returned from collect_data()')
    read_ids, descriptions, labeled_concepts = collect_data()
