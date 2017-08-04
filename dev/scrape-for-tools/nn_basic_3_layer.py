# funcify for fun # build a basic 3-layered neural network from memory # accept gracious help from # http://iamtrask.github.io/2015/07/12/basic-python-network/
def learn(X = None, recursions = None):
    import numpy as np

    # sigmoid gives probability
    def nonlin(x, deriv = False):
        if deriv == True:
            return x*(1 - x)
        return 1/(1 + np.exp(-x))

    # extend example by parametrizing the number of recursions
    recursions = 10000

    # input data
    X = np.array([[1, 0, 0],
                  [0, 1, 0],
                  [0, 0, 1]])

    # output data
    y = np.array([[1, 1, 1]]).T

    np.random.seed(1)

    # randomly choose initial weights uniformly from [-1, 1)
    syn0 = 2*np.random.random((3, 4)) - 1
    syn1 = 2*np.random.random((4, 1)) - 1

    # parameterize recursions for exploration
    for j in range(recursions):

        # feed forward through layers 0, 1, and 2
        l0 = X
        l1 = nonlin(np.dot(l0, syn0))
        l2 = nonlin(np.dot(l1, syn1))

        # first backpropagating-error-value
        l2_error = y - l2

        # what does this line even DO? Perhaps report too many recursions?
        if (j%1000) == 0:
            print("Convergence at " + str(j) + "iterations: " + str(np.mean(np.abs(l2_error))))

        # generate a "confidence-weighted error"
        l2_delta = l2_error * nonlin(l2, deriv = True)

        # 2nd backpropagating error
        l1_error = l2_delta.dot(syn1.T)

        # 2nd "confidence-weighted error"
        l1_delta = l1_error * nonlin(l1, deriv = True)

        # update synapses
        syn1 += l1.T.dot(l2_delta)
        syn0 += l0.T.dot(l1_delta)

    return l2
