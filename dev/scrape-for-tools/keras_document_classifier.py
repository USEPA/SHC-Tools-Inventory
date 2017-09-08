# adapted from an example in keras's documentation
'''Trains a LSTM on the IMDB sentiment classification task.
The dataset is actually too small for LSTM to be of any advantage
compared to simpler, much faster methods such as TF-IDF + LogReg.
Notes:

- RNNs are tricky. Choice of batch size is important,
choice of loss and optimizer is critical, etc.
Some configurations won't converge.

- LSTM loss decrease patterns during training can be quite different
from what you see with CNNs/MLPs/etc.
'''
from __future__ import print_function

from keras.preprocessing import sequence
from keras.models import Sequential
from keras.layers import Dense, Embedding
from keras.layers import LSTM

from collect_data import collect_data
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from keras.preprocessing.text import Tokenizer

from pprint import pprint

max_features = 20000
maxlen = 80  # cut texts after this number of words (among top max_features most common words)
batch_size = 32

print('Preprocess data...')
#######################################
# create a one-hot-encoding of labels #
#######################################
read_ids, descriptions, labels = collect_data()
mlb = MultiLabelBinarizer()
onehot_labels = mlb.fit_transform(labels)
x_train, x_test, y_train, y_test = train_test_split(descriptions, onehot_labels, test_size=.2)
print(f"there are {len(x_train)} training-documents")
print(f"there are {len(x_test)} testing-documents")
####################################
# imported from an ipython-session #
####################################
# Create a bag of labels to encode as
# one-hot vectors for classification
vocab = set()
for description in descriptions:
    for character in description:
        if character not in vocab:
            vocab.add(character)
# create a list of all characters in training descriptions
vocab = sorted(list(vocab))
print(f"vocab is {len(vocab)} characters long")
# create a list of all labels tagged to training descriptions
bagged_labels = list(set([label for label_list in labels[:] for label in label_list]))
print(f"there are {len(bagged_labels)} labels")
label_to_index = dict((label, index) for index, label in enumerate(bagged_labels))
index_to_label = dict((index, label) for index, label in enumerate(bagged_labels))
integer_encoded_labels = [index for index in index_to_label]
onehot_encoded_labels = list()
for index in integer_encoded_labels:
    vector = [0 for _ in range(len(bagged_labels))]
    vector[index] = 1
    onehot_encoded_labels.append(vector)
print('onehot_encoded_labels:',onehot_encoded_labels)

print('Build model...')
model = Sequential()
#FIXME
#I SUSPECT I NEED THE FOLLOWING LINE ADAPTED TO WORK HERE
#model.add(Embedding(max_features, embedding_size, input_length=maxlen))
#PRECEDING LINE WAS LIFTED FROM A MULTICLASS DOC-CLASSIFICATION EXAMPLE IN KERAS' DOCS
#https://github.com/wetlife/keras/blob/master/examples/imdb_cnn_lstm.py
model.add(LSTM(len(bagged_labels), input_shape=(len(vocab),), dropout=0.2, recurrent_dropout=0.2, return_sequences=True))
model.add(LSTM(len(bagged_labels), dropout=0.2, recurrent_dropout=0.2))

print('Compile model...')
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
