def text_classifier():
    import numpy as np
    np.random.seed(42)# reproducibility
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
    EMBEDDING_DIMENSION = 50
    VALIDATION_SPLIT = 0.1
    EPOCHS = 20
    BATCH_SIZE = 4

    model_arch = 'cnn'

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
    if 'cnn' in model_arch:
        print('### model_arch: cnn ###')
        model.add(Conv1D(448, 3, input_shape=(1, 199), activation='relu'))
        model.add(Dropout(0.25))
        model.add(Conv1D(448, 1, activation='relu'))
        model.add(Dropout(0.5))
    if 'dense' in model_arch:
        print('### model_arch: dense ###')
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

    result = {'X_test': X_test,
              'Y_test': Y_test,
              'model': model,
              'score': score,
              'mlb': mlb,
              'index_to_word': index_to_word,
              'word_to_index': word_to_index,
             }

    return result

if __name__ == '__main__':
    d = text_classifier()
