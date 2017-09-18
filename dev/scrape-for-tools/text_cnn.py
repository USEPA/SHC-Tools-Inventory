#NOTOUCHY!def original_classifier():
#NOTOUCHY!    import numpy as np
#NOTOUCHY!    np.random.seed(42)# reproducability
#NOTOUCHY!    from keras.models import Sequential
#NOTOUCHY!    from keras.layers import Dense, Dropout, Activation, Flatten
#NOTOUCHY!    from keras.layers import Convolution2D, MaxPooling2D
#NOTOUCHY!    from keras.utils import np_utils
#NOTOUCHY!    from keras.datasets import mnist
#NOTOUCHY!
#NOTOUCHY!    # DEBUG
#NOTOUCHY!    #import theano
#NOTOUCHY!    #theano.config.exception_verbosity = 'high'
#NOTOUCHY!
#NOTOUCHY!    (X_train, y_train), (X_test, y_test) = mnist.load_data()
#NOTOUCHY!    SIZE = X_train.shape[1]
#NOTOUCHY!    ## COMMENT OUT BELOW VISUALIZATION OF DATA FOR LATER USE
#NOTOUCHY!    #print("SIZE: ", SIZE)
#NOTOUCHY!    #from matplotlib import pyplot as plt
#NOTOUCHY!    #plt.imshow(X_train[0])
#NOTOUCHY!    #plt.show()
#NOTOUCHY!
#NOTOUCHY!    # EXPLICITLY CHANGE TO SINGLE CHANNEL
#NOTOUCHY!    X_train = X_train.reshape(X_train.shape[0], 1, SIZE, SIZE)
#NOTOUCHY!    X_test = X_test.reshape(X_test.shape[0], 1, SIZE, SIZE)
#NOTOUCHY!
#NOTOUCHY!    # NORMALIZE VALUES OF PIXELS
#NOTOUCHY!    X_train = X_train.astype('float32')
#NOTOUCHY!    X_test = X_test.astype('float32')
#NOTOUCHY!    X_train /= 255
#NOTOUCHY!    X_test /= 255
#NOTOUCHY!
#NOTOUCHY!    # ARRAY OF SCALAR LABELS -> ARRAY OF ONE-HOT VECTORS
#NOTOUCHY!    Y_train = np_utils.to_categorical(y_train, 10)
#NOTOUCHY!    Y_test = np_utils.to_categorical(y_test, 10)
#NOTOUCHY!
#NOTOUCHY!    model = Sequential()
#NOTOUCHY!    model.add(Convolution2D(32, (3, 3),
#NOTOUCHY!                            activation='relu',
#NOTOUCHY!                            input_shape=(1,SIZE,SIZE),
#NOTOUCHY!                            dim_ordering='th'))
#NOTOUCHY!    i = 0
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(Convolution2D(32, (3, 3), activation='relu'))
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(Convolution2D(32, (3, 3), activation='relu'))
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(MaxPooling2D(pool_size=(2,2)))
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(Dropout(0.25))
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(Flatten())
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(Dense(128, activation='relu'))
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(Dropout(0.5))
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!    model.add(Dense(10, activation='softmax'))
#NOTOUCHY!    i += 1
#NOTOUCHY!    print('after layer', i, ':', model.output_shape)
#NOTOUCHY!
#NOTOUCHY!    model.compile(loss='categorical_crossentropy',
#NOTOUCHY!                  optimizer='adam',
#NOTOUCHY!                  metrics=['accuracy'])
#NOTOUCHY!    model.fit(X_train,
#NOTOUCHY!              Y_train,
#NOTOUCHY!              batch_size=1,
#NOTOUCHY!              epochs=2,
#NOTOUCHY!              verbose=1)
#NOTOUCHY!    score = model.evaluate(X_test,
#NOTOUCHY!                           Y_test,
#NOTOUCHY!                           verbose=1)

def text_classifier():
    import numpy as np
    from keras.models import Sequential
    from keras.layers import Dense, Dropout, Activation, Flatten
    from keras.layers import Convolution1D, MaxPooling1D
    from keras.utils import np_utils
    from collect_data import collect_data
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import MultiLabelBinarizer
    from keras.preprocessing.sequence import pad_sequences
    from keras.preprocessing.text import Tokenizer

    MAX_NB_WORDS = 20000
    MAX_SEQUENCE_LENGTH = 1000

    read_ids, descriptions, labels = collect_data()# get data
    tokenizer = Tokenizer(num_words=MAX_NB_WORDS)
    tokenizer.fit_on_texts(descriptions)
    word_index = tokenizer.word_index
    index_word = {index: word for index, word in enumerate(word_index)}
    sequences = tokenizer.texts_to_sequences(descriptions, maxlen=MAX_SEQUENCE_LENGTH)
    X = pad_sequences(sequences)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1)
    SIZE = X_train.shape[1]

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

    # EXPLICITLY CHANGE SHAPE
    X_train = X_train.reshape(X_train.shape[0], 1, SIZE, SIZE)
    X_test = X_test.reshape(X_test.shape[0], 1, SIZE, SIZE)

    mlb = MultiLabelBinarizer()
    y = mlb.fit_transform(labels)
    # ARRAY OF SCALAR LABELS -> ARRAY OF ONE-HOT VECTORS
    Y_train = np_utils.to_categorical(y_train, 10)
    Y_test = np_utils.to_categorical(y_test, 10)

    model = Sequential()
    model.add(Convolution2D(32, (3, 3),
                            activation='relu',
                            input_shape=(1,SIZE,SIZE),
                            dim_ordering='th'))
    i = 0
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(Convolution2D(32, (3, 3), activation='relu'))
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(Convolution2D(32, (3, 3), activation='relu'))
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(MaxPooling2D(pool_size=(2,2)))
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(Dropout(0.25))
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(Flatten())
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(Dense(128, activation='relu'))
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(Dropout(0.5))
    i += 1
    print('after layer', i, ':', model.output_shape)
    model.add(Dense(10, activation='softmax'))
    i += 1
    print('after layer', i, ':', model.output_shape)

    model.compile(loss='categorical_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])
    model.fit(X_train,
              Y_train,
              batch_size=1,
              epochs=2,
              verbose=1)
    score = model.evaluate(X_test,
                           Y_test,
                           verbose=1)


if __name__ == '__main__':
    text_classifier()
