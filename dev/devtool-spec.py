############################################################
# Comment Like You'll Need It. #############################
############################################################
# test-driven development:
# specify all functionality via tests
# red->green->refactor
# red: simplest failing test
# green: simplest apparent success
# refactor to beautify transparently
from devtool import Devtool
from pprint import pprint

############################################################
# Get all Methods Straight Following PEP8. #################
############################################################
def check_spec(tests):
    '''Run every test.'''
    print('checking coverage')
    for test in tests.keys():
        if ((tests[test] == not_implemented)#"==" not "is"
        or (tests[test] is False)): #'is' works here
            print('Test failed:', test)
            print(tests[test])
        elif verbose is True:
            print(test, ':')
            pprint(tests[test])

############################################################
# Define and Parameterize. #################################
############################################################
verbose = True
not_implemented = 'not implemented'
url = 'http://epa.gov'
READ_id = '12522'# READ-id of GEMIS
# implement each key of tests as a method of Devtool
# each should be testable in isolation
tests = {'READ_id': not_implemented,
         'acronym': not_implemented,
         'url': not_implemented,
         'status': not_implemented,
         'get_details': not_implemented,
         'link_check': not_implemented,
         'get_ids': not_implemented,
         'validate_READ_id': not_implemented,
         'check_link_for_all_ids': not_implemented,}

############################################################
# Tests are the Spec. ######################################
############################################################
# return ids in statically specified decision-sectors
tests['get_ids'] = Devtool().get_ids()
# get details of a specified tool
tests['get_details'] = str(Devtool().get_details(READ_id))[:50]+'...TRUNCATED...'
# return the specified tool's READ-id 
tests['READ_id'] = Devtool().READ_id(Devtool().get_details(READ_id))
# validate a READ-id
tests['validate_READ_id'] = Devtool().validate_READ_id(READ_id)
# return the specified tool's acronym
tests['acronym'] = Devtool().acronym(Devtool().get_details(READ_id))
# http response's status-code for a predefined URL
tests['status'] = Devtool().status(url)
# return a url-field and its value
tests['url'] = Devtool().url(Devtool().get_details(READ_id))
# return (read-id, acronym, url, url_status, field of url)
tests['link_check'] = Devtool().link_check(Devtool().get_details(READ_id))
# run link_check() for all ids
tests['check_link_for_all_ids'] = Devtool().check_link_for_all_ids()

#TODO send link_check() to CSV
#TODO record final URL with status()
#TODO compare final URL to the original
#TODO textually describe URL-status
#DEV TODO integrate tests into Devtool's class
#DEV TODO determine whether to pass details or the READ-id as arg

############################################################
# Now, with all those definitions out of the way, on to ####
# the procedural play. #####################################
############################################################
spec = check_spec(tests)
