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

###################################################
# try to load descriptions, download on exception #
###################################################
try:
    with open(filename, 'r') as fyle:
        descriptions = json.load(fyle)
except:
    for decision_sector in decision_sectors:
        response.push(requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json())
    for summary in response:
        read_id = summary['ResourceId']
        descriptions[read_id] = ''
        details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
        descriptions[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
    with open(filename, 'w') as fyle:
        json.dump(descriptions, fyle)

#########################
# tokenize descriptions #
#########################
vectorizer = CountVectorizer(min_df=1)
X = vectorizer.fit_transform([descriptions[key] for key in descriptions.keys()])
print(X)

