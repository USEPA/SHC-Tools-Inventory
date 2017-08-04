import json
from os.path import exists

concepts_by_read_id = {}

# dict of descriptions keyed by READ-id
with open('descriptions.json') as f:
    descriptions = json.load(f)

if not exists('concepts-by-READ-id.json'):
    # create dict of concepts indexed by READ-id
    with open('READ-ids-by-concept.json') as f:
        read_ids_by_concept = json.load(f)
        for concept in read_ids_by_concept.keys():
            for id in read_ids_by_concept[concept]:
                if id not in concepts_by_read_id.keys():
                    concepts_by_read_id[id] = [concept]
                else:
                    concepts_by_read_id[id].append(concept)

    # dump concepts indexed by READ-id to a json-file
    with open('concepts-by-READ-id.json', 'w') as outfile:
        json.dump(concepts_by_read_id, outfile)
else:
    print('concepts-by-READ-id.json exists and will be loaded into dict concepts_by_read_id')
    # load concepts indexed by READ-id
    with open('concepts-by-READ-id.json') as f:
        concepts_by_read_id = json.load(f)
print('concepts_by_read_id:')
print(len(concepts_by_read_id))

## descriptions and labeled concepts into a single ndarray
#import numpy as np
#type(np.random.random((1000, 20)))
#print(np.random.random((1000, 20)))
#type(np.random.randint(10, size=(1000,1)))
#print(np.random.randint(10, size=(1000,1)))
