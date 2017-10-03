from devtool import Devtool

tests = {'url': 'not implemented',
         'status': 'not implemented',
         'READ_id': 'not implemented',
         'tool_name': 'not implemented',}
devtool = Devtool()

# True on an http response of 200 for the supplied url
tests['status'] = devtool.status('http://www.google.com')

def check_coverage(tests):
    print('checking coverage')
    for test in tests.keys():
        if tests[test] == 'not implemented':# "==" not "is"
            print('Test failed:', test)

check_coverage(tests)
