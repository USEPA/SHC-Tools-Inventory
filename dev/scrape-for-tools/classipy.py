# load static file into input-line:
#   %load ./classipy.py
# save interactive work:
#   %hist -f proposed_classipy.py SOME_LINE_NUMBER
import requests
import json
import re
import os
from sklearn.feature_extraction.text import TfidfVectorizer

resource_advanced_search_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch'
resource_detail_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail'
decision_sectors = ['land use', 'waste management', 'transportation', 'building infrastructure']
response = []
descriptions = {}
details = {}
descriptions_file = 'descriptions.json'

# attempt to load descriptions and download them on exception
try:
    with open(descriptions_file) as f:
        descriptions = json.load(f)
except Exception:
    for decision_sector in decision_sectors:
        response += requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json()
    for summary in response:
        read_id = summary['ResourceId']
        descriptions[read_id] = ''
        details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
        descriptions[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
    with open(descriptions_file, 'w') as f:
        json.dump(descriptions, f)

# load concepts indexed by READ-Id to be training data
with open('../../wizard.html', encoding='utf8') as f:
    wizard = f.read()
readIdsByConcept = re.search('readIDsByConcept = (.+);\n', wizard).group(1)
if not os.path.exists(read_ids_by_concept_filename):

    file(read_ids_by_concept_filename, 'w').close()

# tokenize each description with sklearn, nltk, or a pipeline through both
# compute tf/idf for each label
# try k-fold cross validation to test on training data
