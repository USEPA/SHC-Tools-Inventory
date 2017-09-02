from keras.models import Sequential
from keras.layers import Dense, Dropout
from keras.layers import Embedding
from keras.layers import LSTM
from load_shc_labeled_descriptions import load_shc_labeled_descriptions

from sklearn.model_selection import train_test_split
from pprint import pprint

max_features = 128
batch_size = 16
epochs = 10

X, y = load_shc_labeled_descriptions()
X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0_2, random_state=0)
# count labels (448 at writing)
number_of_labels = len(set([string for i in range(len(y)) for string in y[i]]))

model = Sequential()
model.add(Embedding(max_features, output_dim=256))
model.add(LSTM(128))
model.add(Dropout(0.5))
# create an output-neuron for each label
model.add(Dense(number_of_labels, activation='sigmoid'))

model.compile(loss='binary_crossentropy',
              optimizer='rmsprop',
              metrics=['accuracy'])

print('fitting model with batch_size=', batch_size, ' and epochs=', epochs)
model.fit(X_train, y_train, batch_size=batch_size, epochs=epochs)
print('evaluating performance on test-data')
score = model.evaluate(x_test, y_test, batch_size=batch_size)
print('score of evaluation:')
pprint(score)
