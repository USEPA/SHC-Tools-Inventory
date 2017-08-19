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

# imports added to example from keras's docs by kyle
from collect_data import collect_data
from sklearn.model_selection import train_test_split
from keras.np_utils
from sklearn.preprocessing import MultiLabelBinarizer
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences

max_features = 20000
maxlen = 80  # cut texts after this number of words (among top max_features most common words)
batch_size = 32

print('Loading data...')
read_ids, descriptions, labeled_concepts = collect_data()
x_train, x_test, y_train, y_test = train_test_split(descriptions, labeled_concepts, test_size=.1)
print(len(x_train), 'train sequences')
print(len(x_test), 'test sequences')

print('Preprocess data...')
# binarize labels and any other preprocessing of descriptions and their respectively labeled_concepts
# return (labels, label_indexed_by_label)
label_index = {}
mlb = MultiLabelBinarizer()
# map concepts to indices to create a reverse-map
for i in range(len(labeled_concepts)):
    label_index[labeled_concepts[i]] = i
binarized_labels = mlb.fit_transform(labeled_concepts)
tokenizer = Tokenizer(nb

print('Pad sequences (samples x time)')
x_train = sequence.pad_sequences(x_train, maxlen=maxlen)
x_test = sequence.pad_sequences(x_test, maxlen=maxlen)
print('x_train shape:', x_train.shape)
print('x_test shape:', x_test.shape)

print('Build model...')
model = Sequential()
#FIXME
#I SUSPECT I NEED THE FOLLOWING LINE ADAPTED TO WORK HERE
#model.add(Embedding(max_features, embedding_size, input_length=maxlen))
#PRECEDING LINE WAS LIFTED FROM A MULTICLASS DOC-CLASSIFICATION EXAMPLE IN KERAS' DOCS
#https://github.com/wetlife/keras/blob/master/examples/imdb_cnn_lstm.py
model.add(Embedding(max_features, 128))
model.add(LSTM(128, dropout=0.2, recurrent_dropout=0.2))
model.add(Dense(1, activation='sigmoid'))

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
