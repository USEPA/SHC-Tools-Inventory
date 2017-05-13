# load static file into input-line:
#   %load ./classipy.py
# save interactive work:
#   %hist -f proposed_classipy.py SOME_LINE_NUMBER
import requests
import json
from sklearn.feature_extraction.text import CountVectorizer

resource_advanced_search_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch'
resource_detail_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail'
decision_sectors = ['land use', 'waste management', 'transportation', 'building infrastructure']
response = []
descriptions = {}
details = {}
filename = 'descriptions.json'

# attempt to load descriptions and download them on exception
try:
    with open(filename, 'r') as fyle:
        json.load(fyle)
except Exception:
    for decision_sector in decision_sectors:
        response += requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json()
    for summary in response:
        read_id = summary['ResourceId']
        descriptions[read_id] = ''
        details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
        descriptions[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
    with open(filename, 'w') as fyle:
        json.dump(descriptions, fyle)
    
# tokenize each description with either sklearn or nltk
# compute tf/idf for each label
# try k-fold cross validation to test on training data
