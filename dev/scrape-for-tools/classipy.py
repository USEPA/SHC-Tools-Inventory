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
read_ids_by_concept_filename = 'readIdsByConcept.json'
wizard_filename = '../../wizard.html'

# load descriptions indexed by READ-id
# download descriptions on exception
# hence deleting json-files forces update of data
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

# load concepts indexed by READ-id to be training data
# collect from wizard.html on exception
# hence deleting json-files forces update of data
try:
    with open(read_ids_by_concept_filename) as f:
        read_ids_by_concept = json.load(f)
except Exception:
    with open(wizard_filename, encoding='utf8') as f:
        wizard_text = f.read()
    read_ids_by_concept = re.search('readIDsByConcept = (.+);\n', wizard_text).group(1)
    with open(read_ids_by_concept_filename, 'w') as read_ids_by_concept_file:
        json.dump(read_ids_by_concept, read_ids_by_concept_file)

# tokenize each description with sklearn, nltk, or a pipeline through both
# compute tf/idf for each label
# try k-fold cross validation to test on training data
