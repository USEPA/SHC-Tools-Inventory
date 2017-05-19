from nltk.corpus import movie_reviews as reviews
X = [reviews.raw(fileid) for fileid in reviews.fileids()]
y = [reviews.categories(fileid)[0] for fileid in reviews.fileids()]
import preprocessor
import pipe
