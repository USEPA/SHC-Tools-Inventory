############################################################
# determine whether text describes sustainable software ####
############################################################
# load classipy.py into input-line in ipython:
#   %load ./classipy.py
# save interactive work:
#   %hist -f proposed_classipy.py SOME_LINE_NUMBER

#import pandas as pd
import sklearn
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.linear_model import LogisticRegressionCV

import requests
import json
import re
import os
from pprint import pprint
from time import time

resource_advanced_search_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch'
resource_detail_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail'
decision_sectors = ['land use', 'waste management', 'transportation', 'building infrastructure']
response = []
descriptions_by_read_id = {}
details = {}
descriptions_file = 'descriptions.json'
read_ids_by_concept_filename = 'READ-ids-by-concept.json'
wizard_filename = '../../wizard.html'

# try load descriptions indexed by READ-id
# download descriptions on exception
# hence deleting json-files forces update of data
try:
    with open(descriptions_file) as f:
        descriptions_by_read_id = json.load(f)
except Exception:
    print('CACHED DESCRIPTIONS NOT GOT; DOWNLOADING DESCRIPTIONS')
    for decision_sector in decision_sectors:
        response += requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json()
    for summary in response:
        read_id = summary['ResourceId']
        descriptions_by_read_id[read_id] = ''
        details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
        descriptions_by_read_id[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
    with open(descriptions_file, 'w') as f:
        json.dump(descriptions_by_read_id, f)

# try load concepts indexed by READ-id to be training data
# collect from wizard.html on exception
# hence deleting json-files forces update of data
try:
    with open(read_ids_by_concept_filename) as f:
        read_ids_by_concept = json.load(f)
except Exception:
    print('CACHED CONCEPTS NOT GOT; PARSING CONCEPTS FROM ' + wizard_filename)
    with open(wizard_filename, encoding='utf8') as f:
        wizard_text = f.read()
    read_ids_by_concept = re.search('readIDsByConcept = (.+);\n', wizard_text).group(1)
    with open(read_ids_by_concept_filename, 'w') as read_ids_by_concept_file:
        json.dump(read_ids_by_concept, read_ids_by_concept_file)

# preprocess priors as a training set:
# we have prior knowledge of what text labeled with
# concepts look like, so let the machine learn from that!
read_ids = sorted(descriptions_by_read_id.keys())
descriptions = [descriptions_by_read_id[read_id] for read_id in read_ids]
concepts_by_read_id = {}
for concept in read_ids_by_concept.keys():
    for read_id in read_ids_by_concept[concept]:
        if read_id not in concepts_by_read_id.keys():
            concepts_by_read_id[read_id] = []
        if concept not in concepts_by_read_id[read_id]:
            concepts_by_read_id[read_id] += concept
concepts = [concepts_by_read_id[read_id] for read_id in read_ids]
X = descriptions
y = concepts

# dev feedback intended to later succeed silently
print('X:')
pprint(X)
print('y:')
pprint(y)

# create a pipeline to act as a new transformer made from pipeline of transformers
# tokenize each description with sklearn, nltk, or a pipeline through both

# DEV-DESIRE:
# compute tf*idf for each word in each document
# try k-fold cross validation to test on training data
# implement adaboost for arbitrary accuracy given enough data

# create a pipeline of transformers ending in a classifier
# transform() called on all but last
# classifier get a different method called by Pipeline
pipeline = Pipeline([
    # transform data into term-frequency/document-frequency
    ('vect', TfidfVectorizer()),
    # classify with sarcastic greatest descent ;)
    # TRY CLASSIFYING WITH LogisticRegressionCV, too!
    ('clf', SGDClassifier()),
])

# define parameters to be explored
# parameters are keyed by <transformer>__<parameter>
parameters = {
    # use these maximal document-frequencies
    'vect__max_df': (0.5, 0.75, 1.0),
    #'vect__max_features': (None, 5000, 10000, 50000),
    'vect__ngram_range': ((1, 1), (1, 2)),  # unigrams or bigrams
    #'tfidf__use_idf': (True, False),
    #'tfidf__norm': ('l1', 'l2'),
    #'clf__alpha': (0.00001, 0.000001),
    'clf__penalty': ('l2', 'elasticnet'),
    #'clf__n_iter': (10, 50, 80),
}

if __name__ == "__main__":
    # prepare to search the grid in our parameter-space
    # defined in the variable named parameters
    grid_search = sklearn.model_selection.GridSearchCV(pipeline, parameters, n_jobs=-1, verbose=1)
    print("pipeline:", [name for name, _ in pipeline.steps])
    t0 = time()
    grid_search.fit(X, y)
    print("grid was searched in %0.3fs" % (time() - t0))
    print()

    print("Best score: %0.3f" % grid_search.best_score_)
    print("Best permutation of parameters:")
    bast_parameters = grid_search.best_estimator_.get_params()
    for param_name in sort(parameters.keys()):
        print("\t%s: %r" % (param_name, best_parameters[param_name]))
