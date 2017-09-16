############################################################
# determine whether text describes sustainable software ####
############################################################
# load classipy.py into input-line in ipython:
#   %load ./classipy.py
# save interactive work:
#   %hist -f proposed_classipy.py SOME_LINE_NUMBER

import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import GridSearchCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import make_scorer
from sklearn.metrics import confusion_matrix
from collect_data import collect_data
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

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
descriptions_file = 'data/descriptions.json'
concepts_by_read_id_filename = 'data/concepts-by-READ-id.json'
read_ids_by_concept_filename = 'data/READ-ids-by-concept.json'
wizard_filename = '../../wizard.html'

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

def multilabel_accuracy_score(y, y_pred):
    correct = 0
    wrong = 0
    for i in range(len(y)):
        for j in range(len(y[i])):
            if y[i][j] == y_pred[i][j]:
                if y[i][j] == 0:
                    correct += 1./100.
                else:
                    correct += 1
            else:
                wrong += 1
    return float(correct)/(float(correct) + float(wrong))

def tfidf_sgd():
    
    # create a pipeline to process data
    pipeline = Pipeline([
        # transform training data into 
        # transform data into term-frequency/document-frequency
        ('vec', TfidfVectorizer()),
        # classify with sarcastic greatest descent ;)
        # TRY CLASSIFYING WITH LogisticRegressionCV, too!
        ('clf', SGDClassifier()),
    ])

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
    }



# first line of fn is 101 for easy reference to original
def pretrained_word_embeddings():
    '''This script loads pre-trained word embeddings (GloVe embeddings)
    into a frozen Keras Embedding layer, and uses it to
    train a text classification model on the 20 Newsgroup dataset
    (classification of newsgroup messages into 20 different categories).

    GloVe embedding data can be found at:
    http://nlp.stanford.edu/data/glove.6B.zip
    (source page: http://nlp.stanford.edu/projects/glove/)

    20 Newsgroup data can be found at:
    http://www.cs.cmu.edu/afs/cs.cmu.edu/project/theo-20/www/data/news20.html
    '''

    #from __future__ import print_function

    import os
    import sys
    import numpy as np
    from keras.preprocessing.text import Tokenizer
    from keras.preprocessing.sequence import pad_sequences
    from keras.utils import to_categorical
    from keras.layers import Dense, Input, Flatten
    from keras.layers import Conv1D, MaxPooling1D, Embedding
    from keras.models import Model
    #KYLE ADDED
    from collect_data import collect_data
    from sklearn.preprocessing import MultiLabelBinarizer
    from keras.layers.advanced_activations import LeakyReLU

    BASE_DIR = 'C:/Users/KThom02/'
    GLOVE_DIR = BASE_DIR + 'Downloads/glove.6B/'
    ORIGINAL_TEXT_DATA_DIR = BASE_DIR + 'data/20_newsgroup'
    TEXT_DATA_DIR = BASE_DIR + 'shc-tools-inventory/dev/'
    MAX_SEQUENCE_LENGTH = 1000
    MAX_NB_WORDS = 20000
    EMBEDDING_DIM = 100
    VALIDATION_SPLIT = 0.2
    # KYLE ADDED
    DATA_SOURCE = 'original'
    EPOCHS = 1

    # first, build index mapping words in the embeddings set
    # to their embedding vector

    print('Indexing word vectors.')

    embeddings_index = {}
    f = open(os.path.join(GLOVE_DIR, 'glove.6B.100d.txt'), encoding='utf8')
    for line in f:
        values = line.split()
        word = values[0]
        coefs = np.asarray(values[1:], dtype='float32')
        embeddings_index[word] = coefs
    f.close()

    print('Found %s word vectors.' % len(embeddings_index))

    # second, prepare text samples and their labels
    print('Processing text dataset')

    if DATA_SOURCE == 'original':
        # KYLE: ORIGINAL DATA-LOADING
        texts = []  # list of text samples
        labels_index = {}  # dictionary mapping label name to numeric id
        labels = []  # list of label ids
        for name in sorted(os.listdir(ORIGINAL_TEXT_DATA_DIR)):
            path = os.path.join(ORIGINAL_TEXT_DATA_DIR, name)
            if os.path.isdir(path):
                label_id = len(labels_index)
                labels_index[name] = label_id
                for fname in sorted(os.listdir(path)):
                    if fname.isdigit():
                        fpath = os.path.join(path, fname)
                        if sys.version_info < (3,):
                            f = open(fpath)
                        else:
                            f = open(fpath, encoding='latin-1')
                        t = f.read()
                        i = t.find('\n\n')  # skip header
                        if 0 < i:
                            t = t[i:]
                        texts.append(t)
                        f.close()
                        labels.append(label_id)

        # KYLE: CHECK ORIGINAL DATA-STRUCTURES
        print("labels[0]")
        print(labels[0])
        print("texts[0]")
        print(texts[0])

    if DATA_SOURCE == 'shc':
        # KYLE ADDED
        read_ids, texts, labels = collect_data()
        labels_index = {}
        for index, label_list in enumerate(labels):
            for label in label_list:
                if label not in labels_index.keys():
                    labels_index[label] = len(labels_index)
        mlb = MultiLabelBinarizer()
        labels_bin = mlb.fit_transform(labels)
        labels_bin_arrayed = np.array([np.array(label_list) for label_list in labels_bin])
        labels = labels_bin_arrayed

        # KYLE: CHECK SHC'S DATA-STRUCTURES
        print("labels[0]")
        print(labels[0])
        print("texts[0]")
        print(texts[0])

    print('Found %s texts.' % len(texts))

    # finally, vectorize the text samples into a 2D integer tensor
    tokenizer = Tokenizer(num_words=MAX_NB_WORDS)
    tokenizer.fit_on_texts(texts)
    sequences = tokenizer.texts_to_sequences(texts)

    word_index = tokenizer.word_index
    print('Found %s unique tokens.' % len(word_index))

    data = pad_sequences(sequences, maxlen=MAX_SEQUENCE_LENGTH)

    data = np.array(data)
    labels = np.array(labels)

    #labels = to_categorical(np.asarray(labels)) # see above
    print('Shape of data tensor:', data.shape)
    print('Shape of label tensor:', labels.shape)

    # split the data into a training set and a validation set
    indices = np.arange(data.shape[0])
    np.random.shuffle(indices)
    data = data[indices]
    labels = labels[indices]
    num_validation_samples = int(VALIDATION_SPLIT * data.shape[0])

    x_train = data[:-num_validation_samples]
    y_train = labels[:-num_validation_samples]
    x_val = data[-num_validation_samples:]
    y_val = labels[-num_validation_samples:]

    print('Preparing embedding matrix.')

    # prepare embedding matrix
    num_words = min(MAX_NB_WORDS, len(word_index))
    embedding_matrix = np.zeros((num_words, EMBEDDING_DIM)) # KYLE: CHANGED MAX_NB_WORDS to num_words TO SOLVE INDEX ISSUE(AND IT WORKED BEAUTIFULLY SO FAR; THE SCRIPT WAS COMPLAINING LIKE "[index 950 out of bounds in dimension with shape 950]," WHICH I TOOK TO BE AN OFF-BY-ONE-ERROR)
    for word, i in word_index.items():
        #if i >= 950: continue # SLOPPILY HACKED FIX FOR OVERRUNNING THE INDEX
        if i >= num_words:
            continue
        embedding_vector = embeddings_index.get(word)
        if embedding_vector is not None:
            # words not found in embedding index will be all-zeros.
            embedding_matrix[i] = embedding_vector

    # load pre-trained word embeddings into an Embedding layer
    # note that we set trainable = False so as to keep the embeddings fixed
    embedding_layer = Embedding(num_words,
                                EMBEDDING_DIM,
                                weights=[embedding_matrix],
                                input_length=MAX_SEQUENCE_LENGTH,
                                trainable=False)

    print('Training model.')

    # KYLE: CHANGED relu TO selu WITHIN MODEL
    # KYLE: CHANGED CATEGORICAL_CROSSENTROPY TO BINARY_CROSSENTROPY
    # train a 1D convnet with global maxpooling
    sequence_input = Input(shape=(MAX_SEQUENCE_LENGTH,), dtype='int32')
    embedded_sequences = embedding_layer(sequence_input)
    x = Conv1D(128, 5, activation='sigmoid')(x)
    x = MaxPooling1D(35)(x)
    x = Flatten()(x)
    preds = Dense(len(labels_index), activation='selu')(x)

    model = Model(sequence_input, preds)
    model.compile(loss='binary_crossentropy',
                  optimizer='rmsprop',
                  metrics=['acc'])

    model.fit(x_train, y_train,
              batch_size=128,
              epochs=EPOCHS,
              validation_data=(x_val, y_val))

def pipelined_random_searched_char_mlp():
    ############################################
    # deeply learn multilabeled classification #
    #------------------------------------------#
    from collect_data import collect_data
    from sklearn.preprocessing import MultiLabelBinarizer
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import GridSearchCV
    from sklearn.model_selection import RandomizedSearchCV

    NUM_CHARS = 71

    read_ids, descriptions, labels = collect_data()
    mlb = MultiLabelBinarizer()
    input_binarizer = MultiLabelBinarizer()
    read_ids = np.array(read_ids)
    descriptions_bin = input_binarizer.fit_transform(descriptions)
    labels = np.array(labels)
    y_bin = mlb.fit_transform(labels)
    x_train, x_test, y_train, y_test = train_test_split(descriptions_bin, y_bin, test_size=0.1)

    # scaler all data with scaler that is fit only on
    # training data to accurately predict 
    # out-of-sample-performance
    scaler = StandardScaler()
    scaler.fit(x_train)
    scaler.transform(x_train)
    scaler.transform(x_test)

    mlp_parameters = {
        'clf__alpha': [2**-k for k in range(20)],
        'clf__tol': [2**(-2-k) for k in range(10)],}
        #'clf__hidden_layer_sizes': ['constant', 'adaptive']}

    mlp = Pipeline([('clf',
        MLPClassifier( alpha=2e-2,
            hidden_layer_sizes=8*(NUM_CHARS),
            learning_rate='adaptive',
            verbose=True,))])

    #####################################################
    # below grid-search abandoned for randomized search #
    # commented lines are kept as records in source     #
    #####################################################

    # create a grid-searching object to find optimal parameters
    #grid_search_mlp = GridSearchCV(
    #        mlp,
    #        param_grid = mlp_parameters,
    #        scoring = make_scorer(multilabel_accuracy_score))

    # learn the mlp
    #mlp.fit(x_train, y_train) # replaced with grid_search
    # search specified parameters of mlp
    #print("pipeline named mlp:", [name for name, _ in mlp.steps])
    #t0 = time()
    #grid_search_mlp.fit(x_train, y_train)
    ##grid_search_mlp.fit(descriptions, y_bin)
    #print("grid was searched in %0.3fs" % (time() - t0))
    #print()

    #####################################################
    # above grid-search abandoned for randomized search #
    # commented lines are kept as records in source     #
    #####################################################

    # search stochastically over parameter-space as an
    # efficient and performant alternative to exhaustively
    # grid-searching
    random_search_mlp = RandomizedSearchCV(
            mlp,
            mlp_parameters,
            n_iter=3,
            scoring = make_scorer(multilabel_accuracy_score))

    # predict labels for test data
    #predictions = mlp.predict(x_test) # using GridSearchCV
    # use best_parameters from grid_search for predicting y_pred
    #predictions = grid_search_mlp.predict(x_test) # using RandomizedSearchCV
    random_search_mlp.fit(x_train, y_train)
    predictions = random_search_mlp.predict(x_test)
    print(random_search_mlp.best_params_)

    print('does scaler(x_train) == x_train:', x_train == StandardScaler(x_train))
    

    accuracy = multilabel_accuracy_score(y_test, predictions)
    print("accuracy:", accuracy)
    print('best paramaters:', random_search_mlp.best_params_)
    print('score:',random_search_mlp.score(x_test, y=y_test))
    return mlp, random_search_mlp, x_train, y_train, x_test, y_test, multilabel_accuracy_score

def simple(weights):
    from keras.preprocessing.text import Tokenizer

    tokenizer = Tokenizer()
    tokenizer.fit_on_texts(descriptions)
    tokenizer.texts_to_matrix(descriptions)
    #- this matrix can be investigated via word_index

    #TODO
    # - tokenize text
    # - for k<1000
    # - initialize weights matrix W
    # - y_pred = (x * W)
    # - 
    # - 

    def loss(input, weights=None):
        
        from numpy.random import rand
          
        # forward propagation through the below 
        y_pred = np.dot(input.T, weights)

    #for k < EPOCHS:
    #   this.loss - this.last_loss

if __name__ == "__main__":
    #mlp, rs_mlp, x_train, y_train, x_test, y_test, multilabel_accuracy_score  = char_mlp()
    #pretrained_word_embeddings()
    search = pipelined_random_searched_char_mlp()
