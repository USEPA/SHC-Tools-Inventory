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
    np.random.seed(42)
    from keras.models import Sequential
    from keras.layers import Dense, Dropout, Activation, Flatten
    from keras.layers import Conv1D, MaxPooling1D
    from keras.utils import np_utils
    from collect_data import collect_data
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import MultiLabelBinarizer
    from keras.preprocessing.sequence import pad_sequences
    from keras.preprocessing.text import Tokenizer
    from pprint import pprint

    MAX_NB_WORDS = 20000
    MAX_SEQUENCE_LENGTH = 1500
    EMBEDDING_DIMENSION = 10
    VALIDATION_SPLIT = 0.1
    EPOCHS = 16
    BATCH_SIZE = 4

    embeddings_index = {}
    glove_data = '/Users/KThom02/data/glove.6B/glove.6B.50d.txt'
    f = open(glove_data, encoding='utf8')
    for line in f:
        values = line.split()
        word = values[0]
        value = np.asarray(values[1:], dtype='float32')
        embeddings_index[word] = value
    f.close()
    print('Loaded %s word vectors.' % len(embeddings_index)) 

    read_ids, descriptions, labels = collect_data()
    tokenizer = Tokenizer(num_words=MAX_NB_WORDS)
    tokenizer.fit_on_texts(descriptions)
    word_to_index = tokenizer.word_index
    index_to_word = dict((index, word) for word, index in word_to_index.items())
    sequences = tokenizer.texts_to_sequences(descriptions)
    X = pad_sequences(sequences, padding='post', truncating='post')

    # EXPLICITLY CHANGE TO SINGLE CHANNEL
    SIZE = X.shape[1]
    X = X.reshape(X.shape[0], 1, SIZE)
    

    embedding_dimension = EMBEDDING_DIMENSION

    embedding_matrix = np.zeros((len(word_to_index) + 1, embedding_dimension))
    for word, i in word_to_index.items():
        embedding_vector = embeddings_index.get(word)
        if embedding_vector is not None:
            # words not found in embedding index will all be zeros
            embedding_matrix[i] = embedding_vector[:embedding_dimension]

    mlb = MultiLabelBinarizer()
    Y = mlb.fit_transform(labels)
    Y = Y.reshape(Y.shape[0], 1, Y.shape[1])

    # split the data into a training set and a validation set
    indices = np.arange(X.shape[0])
    np.random.shuffle(indices)
    X = X[indices]
    Y = Y[indices]
    num_validation_samples = int(VALIDATION_SPLIT * X.shape[0])
    X_train = X[:-num_validation_samples]
    X_test = X[-num_validation_samples:]
    Y_train = Y[:-num_validation_samples]
    Y_test = Y[-num_validation_samples:]

    model = Sequential()
    #model.add(Conv1D(32, 1, input_shape=(None, 950), activation='relu'))
    #model.add(Dropout(0.25))
    #model.add(Conv1D(16, 1, activation='relu'))
    #model.add(Dropout(0.5))
    #model.add(Dense(448, activation='selu'))
    model.add(Dense(199, input_shape=(1, 199), activation='relu'))
    model.add(Dense(199, activation='relu'))
    model.add(Dense(100, activation='relu'))
    model.add(Dense(100, activation='relu'))
    model.add(Dense(50, activation='relu'))
    model.add(Dense(50, activation='relu'))
    model.add(Dense(25, activation='relu'))
    model.add(Dense(25, activation='relu'))
    model.add(Dense(50, activation='relu'))
    model.add(Dense(50, activation='relu'))
    model.add(Dense(100, activation='relu'))
    model.add(Dense(100, activation='relu'))
    model.add(Dense(199, activation='relu'))
    model.add(Dense(199, activation='relu'))
    model.add(Dense(448, activation='relu'))
    model.add(Dense(448, activation='relu'))
    model.summary()

    model.compile(loss='binary_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])
    model.fit(X_train,
              Y_train,
              batch_size=BATCH_SIZE,
              epochs=EPOCHS,
              verbose=1)
    score = model.evaluate(X_test,
                           Y_test,
                           verbose=1)

    return X_test, Y_test, model, score

if __name__ == '__main__':
    X_test, Y_test, model, score = text_classifier()
