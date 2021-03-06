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
def check_spec(tests, verbose=False):
    '''Run every test.'''
    print('checking coverage')
    for test in tests.keys():
        if verbose is True:
            print()
            print(test, ':')
            pprint(tests[test])
        if (tests[test] == not_implemented):#"==" not "is"
            print('Test failed:', test)
            print(tests[test])

############################################################
# Define and Parameterize. #################################
############################################################
verbose = True# parametrize defaults
not_implemented = 'not implemented'# parameterize defaults
url = 'http://epa.gov'# epa's URL for testing
read_id = '12522'# read-id of GEMIS for testing
# implement each key of tests as a method of Devtool
# each should be testable in isolation
tests = {'read_id': not_implemented,
         'acronym': not_implemented,
         'url': not_implemented,
         'response': not_implemented,
         'status': not_implemented,
         'get_details': not_implemented,
         'link_check': not_implemented,
         'get_ids': not_implemented,
         'validate_read_id': not_implemented,
         'check_link_for_all_ids': not_implemented,
         'send_to_csv': not_implemented,
         'describe_status': not_implemented,
         'gets_redirected': not_implemented,}
dt = Devtool()

############################################################
# Tests are the Spec. # Comment a test here to disable it. #
############################################################
# return ids in statically specified decision-sectors
tests['get_ids'] = dt.get_ids()
# get details of a specified tool
tests['get_details'] = str(dt.get_details(read_id))[:45]+'...TRUNCATED...'
# return the specified tool's read-id 
tests['read_id'] = dt.read_id(dt.get_details(read_id))
# validate a read-id
tests['validate_read_id'] = dt.validate_read_id(read_id)
# return the specified tool's acronym
tests['acronym'] = dt.acronym(dt.get_details(read_id))
# http response's status-code for a predefined URL
tests['status'] = dt.status(url)
# return a url-field and its value
tests['url'] = dt.url(read_id)
# return respone-object or None
tests['response'] = dt.response(url)
# return (read-id, acronym, url, url_status, field of url)
tests['link_check'] = dt.link_check(read_id)
# run link_check() for all ids
tests['check_link_for_all_ids'] = dt.check_link_for_all_ids()
## send check_link_for_all_ids() to CSV
#import csv
#csv_name = 'DELETE_ME_TESTING_DEVTOOL.SEND_TO_CSV.csv'
#dt.send_to_csv(dt.check_link_for_all_ids(), csv_name)
#checked_link_for_all_ids_csv = list()
#with open(csv_name) as infile:
#    reader = csv.reader(infile)
#    for row in reader:
#        checked_link_for_all_ids_csv.append(row)
#tests['send_to_csv'] = checked_link_for_all_ids_csv
## textually describe URL-status
#from http_status import STATUS_CODES
#tests['describe_status'] = {code: dt.describe_status(code) for code in STATUS_CODES.keys()}
## is final URL the original?
#tests['gets_redirected'] = dt.gets_redirected(url)

#DEV TODO finish caching mechanism of Devtool().get_details(read_id)
#DEV TODO write URL-extractor
#DEV TODO integrate tests into Devtool's class
#DEV TODO determine whether to pass details or the read-id as arg

############################################################
# Now, with definitions out of the way, ####################
# let's move on to the procedural play. ####################
############################################################
spec = check_spec(tests, verbose=verbose)
