############################################################
# determine whether text describes sustainable software ####
############################################################
# load classipy.py into input-line in ipython:
#   %load ./classipy.py
# save interactive work:
#   %hist -f proposed_classipy.py SOME_LINE_NUMBER

import numpy as np
import sklearn
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.linear_model import LogisticRegressionCV
from sklearn.svm import LinearSVC
from sklearn.multiclass import OneVsRestClassifier

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
concepts_by_read_id_filename = 'concepts-by-READ-id.json'
read_ids_by_concept_filename = 'READ-ids-by-concept.json'
wizard_filename = '../../wizard.html'

# try load descriptions indexed by READ-id
# download descriptions on exception
# hence deleting json-files forces update of data
try:
    with open(descriptions_file) as f:
        descriptions_by_read_id = json.load(f)
except Exception:
    print('CACHED DESCRIPTIONS NOT FOUND; DOWNLOADING DESCRIPTIONS')
    for decision_sector in decision_sectors:
        response += requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json()
    for summary in response:
        read_id = summary['ResourceId']
        descriptions_by_read_id[read_id] = ''
        details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
        descriptions_by_read_id[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
    with open(descriptions_file, 'w') as f:
        json.dump(descriptions_by_read_id, f)

# preprocess priors as a training set:
# we have prior knowledge of what text labeled with
# concepts look like, so let the machine learn from that!
try:
    with open(concepts_by_read_id_filename) as f:
        concepts_by_read_id = json.load(f)
        print('LOADED concepts_by_read_id')
except Exception:
    # try load concepts indexed by READ-id to be training data
    # collect from wizard.html on exception
    # hence deleting json-files forces update of data
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
read_ids = sorted(descriptions_by_read_id.keys())
descriptions = [descriptions_by_read_id[read_id] for read_id in read_ids]

# create an dict of concepts indexed by read id
concepts_by_read_id = {}
for concept in read_ids_by_concept.keys():
    for read_id in read_ids_by_concept[concept]:
        if read_id not in concepts_by_read_id.keys():
            concepts_by_read_id[read_id] = []
        if concept not in concepts_by_read_id[read_id]:
            concepts_by_read_id[read_id].append(concept)

# create a list of all concepts used as labels
label_list = [concept for concept in read_ids_by_concept.keys()]

# format training labels into dict associating read_id to a list of labels
training_labels = []
for i in range(len(read_ids)):
    training_labels.append(set())
    for k in range(len(label_list)):
        if label_list[k] in concepts_by_read_id[read_ids[i]]:
            training_labels[i].add(label_list[k])
mlb = MultiLabelBinarizer()
y = mlb.fit_transform(training_labels)

# create a pipeline to process data
pipeline = Pipeline([
    # transform training data into 
    # transform data into term-frequency/document-frequency
    ('vec', TfidfVectorizer()),
    # classify with sarcastic greatest descent ;)
    # TRY CLASSIFYING WITH LogisticRegressionCV, too!
    ('clf', SGDClassifier()),
])

# DEV-DESIRE:
# compute tf*idf for each word in each document
# try k-fold cross validation to test on training data
# implement adaboost for arbitrary accuracy given sufficient data

# define parameters to be explored
# parameters are keyed by <transformer>__<parameter>
parameters = {
    # use these maximal document-frequencies
    'vec__max_df': (0.5, 0.75, 1.0),
    #'vec__max_features': (None, 5000, 10000, 50000),
    'vec__ngram_range': ((1, 1), (1, 2)),  # unigrams or bigrams
    #'tfidf__use_idf': (True, False),
    #'tfidf__norm': ('l1', 'l2'),
    #'clf__alpha': (0.00001, 0.000001),
    'clf__penalty': ('l2', 'elasticnet'),
    #'clf__n_iter': (10, 50, 80),
}

#print('last few values of zip(descriptions, y):')
#print(list(zip(descriptions[-3:], y[-3:])))
#print('type of descriptions and y:')
#print('size of descriptions[:3] and y[:3]:')
#descriptions = np.array(descriptions)
#print(type(descriptions))
#print(descriptions[:3].size)
#y = np.array(y)
#print(type(y))
#print(len(y[:3]))

############################################################
# Form a one-off solution to extend with gridsearch ########
from sklearn.model_selection import train_test_split
from scipy.sparse import csr_matrix, issparse
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import confusion_matrix

descriptions = np.array(descriptions)
training_labels = np.array([list(item) for item in training_labels])
y = mlb.fit_transform(training_labels)
X_train, X_test, y_train, y_test = train_test_split(descriptions, y, test_size=0.1)

classifier = Pipeline([
    ('vec', CountVectorizer()),
    ('tfidf', TfidfTransformer()),
    ('clf', OneVsRestClassifier(SGDClassifier(alpha=2e-12, loss='squared_epsilon_insensitive')))
])
print(classifier.steps)

classifier_parameters = {
    # set threshold for estimator w/in OneVsRestClassifier
    'estimator__alpha': [2e-10, 2e-11, 2e-12, 2e-13, 2e-14],
}

# create a grid-searching object to find optimal parameters
grid_search_classifier = GridSearchCV(
        classifier,
        param_grid=classifier_parameters,
        score =#BOOKMARK: WIP CREATE SCORE FNCN 

# learn the classifier
classifier.fit(X_train, y_train)

# predict labels for test data
predictions = classifier.predict(X_test)

# check predicted labels against actual labels
def check_labels(predicted_labels):
    predicted_labels = dict()
    actual_labels = dict()
    for i in range(len(predictions)):
        predicted_labels[i] = dict()
        actual_labels[i] = dict()
        for j in range(len(predictions[i])):
            if y_test[i][j] == 1:
                actual_labels[i][j] = predictions[i][j]
            if predictions[i][j] == 1:
                predicted_labels[i][j]
    # measure precision and false omission rate between
    # predicted_labels and actual_labels. Find definitions
    # of these terms on wikipedia.org/wiki/Precision_and_recall
    for i in predicted_labels:
        for j in predicted_labels[i]:
            if predicted_labels[i][j] and not y_test[i]:
                pass# measure discrepency!
        print(zip(actual_labels[i].keys(), predicted_labels[i].keys()))
#check_labels(predictions)

# confusion matrices don't work with multilabel-indicators
def confusion_matrices(actual_labels, predicted_labels):
    for i in actual_labels:
        confusion_matrix_i = confusion_matrix(actual_labels[i], predicted_labels[i])
        print('confusion matrix for test %(index)' % {'index': i})
        print(confusion_matrix_i)
#confusion_matrices(y_test, predictions)

def ml_confusion_matrix(actual_labels, predicted_labels):
    # take labels as binarized multilabel-format
    # return [true_positives, false_positives, false_negatives, true_negatives], total_confusion_matrix
    total_confusion_matrix = np.array([[0, 0], [0, 0]])
    for i in range(len(actual_labels)):
        for j in range(len(actual_labels[i])):
            if not actual_labels[i][j]:
                if not predicted_labels[i][j]:
                    total_confusion_matrix[1][1] += 1
                else:
                    total_confusion_matrix[1][0] += 1
            else:
                if predicted_labels[i][j]:
                    total_confusion_matrix[0][0] += 1
                else:
                    total_confusion_matrix[0][1] += 1
    return total_confusion_matrix
total_confusion_matrix = ml_confusion_matrix(y_test, predictions)
print(total_confusion_matrix)

############################################################

if __name__ == "_main__":
    # prepare to search the grid in our parameter-space
    # defined in the variable named parameters
    grid_search = sklearn.model_selection.GridSearchCV(pipeline, parameters, verbose=1)
    print("pipeline:", [name for name, _ in pipeline.steps])
    t0 = time()
    grid_search.fit(X_train, y_train)
    print("grid was searched in %0.3fs" % (time() - t0))
    print()

    print("Best score: %0.3f" % grid_search.best_score_)
    print("Best permutation of parameters:")
    best_parameters = grid_search.best_estimator_.get_params()
    for param_name in sort(parameters.keys()):
        print("\t%s: %r" % (param_name, best_parameters[param_name]))
