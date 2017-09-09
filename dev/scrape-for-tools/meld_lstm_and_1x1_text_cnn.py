def lstm_document_classifier():
    '''Trains an LSTM model on the IMDB sentiment classification task.
    The dataset is actually too small for LSTM to be of any advantage
    compared to simpler, much faster methods such as TF-IDF + LogReg.
    Notes:

    - RNNs are tricky. Choice of batch size is important,
    choice of loss and optimizer is critical, etc.
    Some configurations won't converge.

    - LSTM loss decrease patterns during training can be quite different
    from what you see with CNNs/MLPs/etc.
    '''
    #from __future__ import print_function

    from keras.preprocessing import sequence
    from keras.models import Sequential
    from keras.layers import Dense, Embedding
    from keras.layers import LSTM
    from keras.datasets import imdb


    max_features = 20000
    maxlen = 80  # cut texts after this number of words (among top max_features most common words)
    batch_size = 32

    print('Loading data...')
    (x_train, y_train), (x_test, y_test) = imdb.load_data(num_words=max_features)
    print(len(x_train), 'train sequences')
    print(len(x_test), 'test sequences')

    print('Pad sequences (samples x time)')
    x_train = sequence.pad_sequences(x_train, maxlen=maxlen)
    x_test = sequence.pad_sequences(x_test, maxlen=maxlen)
    print('x_train shape:', x_train.shape)
    print('x_test shape:', x_test.shape)

    print('Build model...')
    model = Sequential()
    model.add(Embedding(max_features, 128))
    model.add(LSTM(128, dropout=0.2, recurrent_dropout=0.2))
    model.add(Dense(1, activation='sigmoid'))

    # try using different optimizers and different optimizer configs
    model.compile(loss='binary_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])

    print('Train...')
    model.fit(x_train, y_train,
              batch_size=batch_size,
              epochs=15,
              validation_data=(x_test, y_test))
    score, acc = model.evaluate(x_test, y_test,
                                batch_size=batch_size)
    print('Test score:', score)
    print('Test accuracy:', acc)

def autoencoder():
    '''Example script to generate text from Nietzsche's writings.

    At least 20 epochs are required before the generated text
    starts sounding coherent.

    It is recommended to run this script on GPU, as recurrent
    networks are quite computationally intensive.

    If you try this script on new data, make sure your corpus
    has at least ~100k characters. ~1M is better.
    '''

    #from __future__ import print_function#COMMENTED BY KYLE
    from keras.models import Sequential
    from keras.layers import Dense, Activation
    from keras.layers import LSTM
    from keras.optimizers import RMSprop
    from keras.utils.data_utils import get_file
    import numpy as np
    import random
    import sys
    # KYLE ADDED
    from collect_data import collect_data

    path = get_file('nietzsche.txt', origin='https://s3.amazonaws.com/text-datasets/nietzsche.txt')
    text = open(path).read().lower()
    print('nietzche\'s corpus length:', len(text))
    # KYLE ADDED
    read_ids, descriptions, labeled_concepts = collect_data()
    read_ids = np.array(read_ids)
    descriptions = np.array(descriptions)
    labeled_concepts = np.array(labeled_concepts)
    print(read_ids.shape, descriptions.shape, labeled_concepts.shape)

    chars = sorted(list(set(text)))
    print('total chars:', len(chars))
    char_indices = dict((c, i) for i, c in enumerate(chars))
    indices_char = dict((i, c) for i, c in enumerate(chars))
    # KYLE ADDED
    shc_chars = sorted(list(set([character for description in descriptions for character in description])))
    print('total shc_chars:', len(shc_chars))
    shc_char_indices = dict((c, i) for i, c in enumerate(shc_chars))
    shc_indices_char = dict((i, c) for i, c in enumerate(shc_chars))

    # cut the text in semi-redundant sequences of maxlen characters
    maxlen = 40
    step = 3
    sentences = []
    next_chars = []
    for i in range(0, len(text) - maxlen, step):
        sentences.append(text[i: i + maxlen])
        next_chars.append(text[i + maxlen])
    print('nb sequences:', len(sentences))
    # KYLE ADDED
    shc_sentences = []
    shc_next_chars = []
    for i in range(0, len(text) - maxlen, step):
        sentences.append(text[i: i + maxlen])
        next_chars.append(text[i + maxlen])
    print('nb sequences:', len(sentences))




    print('Vectorization...')
    X = np.zeros((len(sentences), maxlen, len(chars)), dtype=np.bool)
    y = np.zeros((len(sentences), len(chars)), dtype=np.bool)
    for i, sentence in enumerate(sentences):
        for t, char in enumerate(sentence):
            X[i, t, char_indices[char]] = 1
        y[i, char_indices[next_chars[i]]] = 1


    # build the model: a single LSTM
    print('Build model...')
    model = Sequential()
    model.add(LSTM(128, input_shape=(maxlen, len(chars))))
    model.add(Dense(len(chars)))
    model.add(Activation('softmax'))

    optimizer = RMSprop(lr=0.01)
    model.compile(loss='categorical_crossentropy', optimizer=optimizer)


    def sample(preds, temperature=1.0):
        # helper function to sample an index from a probability array
        preds = np.asarray(preds).astype('float64')
        preds = np.log(preds) / temperature
        exp_preds = np.exp(preds)
        preds = exp_preds / np.sum(exp_preds)
        probas = np.random.multinomial(1, preds, 1)
        return np.argmax(probas)

    # train the model, output generated text after each iteration
    for iteration in range(1, 60):
        print()
        print('-' * 50)
        print('Iteration', iteration)
        model.fit(X, y,
                  batch_size=128,
                  epochs=1)

        start_index = random.randint(0, len(text) - maxlen - 1)

        for diversity in [0.2, 0.5, 1.0, 1.2]:
            print()
            print('----- diversity:', diversity)

            generated = ''
            sentence = text[start_index: start_index + maxlen]
            generated += sentence
            print('----- Generating with seed: "' + sentence + '"')
            sys.stdout.write(generated)

            for i in range(400):
                x = np.zeros((1, maxlen, len(chars)))
                for t, char in enumerate(sentence):
                    x[0, t, char_indices[char]] = 1.

                preds = model.predict(x, verbose=0)[0]
                next_index = sample(preds, diversity)
                next_char = indices_char[next_index]

                generated += next_char
                sentence = sentence[1:] + next_char

                sys.stdout.write(next_char)
                sys.stdout.flush()
            print()

def simple_multiclassifier():
	from keras.models import Sequential
	from keras.layers import Dense, Dropout, Activation
	from keras.optimizers import SGD

	model = Sequential()
	model.add(Dense(5000, activation='relu', input_dim=X_train.shape[1]))
	model.add(Dropout(0.1))
	model.add(Dense(600, activation='relu'))
	model.add(Dropout(0.1))
	model.add(Dense(y_train.shape[1], activation='sigmoid'))

	sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
	model.compile(loss='binary_crossentropy',
				  optimizer=sgd)

	model.fit(X_train, y_train, epochs=5, batch_size=2000)

	preds = model.predict(X_test)
	preds[preds>=0.5] = 1
	preds[preds<0.5] = 0
	# score = compare preds and y_test

from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation, LSTM
from keras.optimizers import SGD
# KYLE ADDED
import numpy as np
from collect_data import collect_data
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split

# KYLE ADDED
def multilabel_loss(y_pred, y):
    # nomalization: /np.sum(np.ones_like(y))
    return np.sum(y-y_pred)

# KYLE ADDED
# gather data as lists with corresponding indices
read_ids, descriptions, labels = collect_data()
arrayed_descriptions = np.array([np.array(description) for description in descriptions])
# bag characters from descriptions in training corpus
bagged_characters = set(str().join(descriptions))
print(f"There are {len(bagged_characters)} unique characters in X, the shc-descriptions.")
# bag labels to onehot-encode each label eigenvectors for y's space
# each set of labels, y_i in y, is a superposition of these eigenvectors
bagged_labels = set()
for label_list in labels:
    for label in label_list:
        bagged_labels.add(label)
bagged_labels = set(sorted(bagged_labels))
print(f"There are {len(bagged_labels)} unique labels in y, the shc-labeled-concepts.")
# create multilabel binarizer for binarizing y
mlb = MultiLabelBinarizer()
arrayed_labels = np.array([np.array(label_list) for label_list in labels])
binarized_arrayed_labels = mlb.fit_transform(arrayed_labels)
# EXAMPLE OF HOW TO ACCESS LABELS WITH MLB:
# print(mlb.inverse_transform(np.array([[1,0,0,0,1]+[0]*443])))

# split data for training and testing
X = arrayed_descriptions
max_description_length = max((len(X[i]) for i in range(X.shape[0])))
from keras.preprocessing.sequence import pad_sequences
X_padded = pad_sequences(X, dtype='str', value=' ') #FIXME: RESUME
y = binarized_arrayed_labels
X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.33, random_state=42)

model = Sequential()
model.add(Dense(5000, activation='relu', input_dim=max_description_length))#was input_dim=X_train.shape[1]
model.add(Dropout(0.1))
model.add(Dense(600, activation='relu'))
model.add(Dropout(0.1))
model.add(Dense(y_train.shape[1], activation='sigmoid'))

sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
model.compile(loss='mse', optimizer=sgd)

model.fit(X_train, y_train, epochs=5, batch_size=1)

preds = model.predict(X_test)
preds[preds>=0.5] = 1
preds[preds<0.5] = 0
# score = compare preds and y_test
# mean loss over all labels:
multilabel_loss(preds, y_test)/np.sum(np.ones_like(y_test))

def integrate_this_code():
	# place code to integrate here to monitor progress
	# remove integrated code to show only unintegrated code
	pass
