# test-driven development:
# specify all functionality via tests
# red->green->refactor
# red: simplest failing test
# green: simplest apparent success
# refactor to beautify transparently
from devtool import Devtool

verbose = True
not_implemented = 'not implemented'
# implement each key of tests as a function of Devtool
# each should be testable in isolation
tests = {'READ_id': not_implemented,
         'acronym': not_implemented,
         'url': not_implemented,
         'status': not_implemented,
         'get_details': not_implemented,
         'link_check': not_implemented,}
url = 'http://epa.gov'
READ_id = '12522'# READ-id of GEMIS

# get details of a specified tool
tests['get_details'] = str(Devtool().get_details(READ_id))[:50]+'...TRUNCATED...'
# return the specified tool's READ-id 
tests['READ_id'] = Devtool().READ_id(Devtool().get_details(READ_id))
# return the specified tool's acronym
tests['acronym'] = Devtool().acronym(Devtool().get_details(READ_id))
# http response's status-code
tests['status'] = Devtool().status(url)
# return a url-field and its value
tests['url'] = Devtool().url(Devtool().get_details(READ_id))
#TODO implement url-checker() -> list(read-id, acronym, url, url_status, field of url)
tests['link_check'] = Devtool().link_check(Devtool().get_details(READ_id))

# let the computer check whether all tests are passing
def check_coverage(tests):
    print('checking coverage')
    for test in tests.keys():
        if ((tests[test] == not_implemented)#"==" not "is"
        or (tests[test] is False)): #'is' works here
            print('Test failed:', test)
        elif verbose is True:
            print(test, ':', tests[test])

check_coverage(tests)
