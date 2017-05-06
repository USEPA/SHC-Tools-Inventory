import requests
import json

resource_advanced_search_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch'
resource_detail_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail'
decision_sectors = ['land use', 'waste management', 'transportation', 'building infrastructure']
response = []
descriptions = {}
details = {}
filename = 'descriptions.json'

try:
    with open(filename, 'r') as fyle
catch:
    
for decision_sector in decision_sectors:
    response += requests.request('GET', resource_advanced_search_url + '?DecisionSector=' + decision_sector).json()
for summary in response:
    read_id = summary['ResourceId']
    descriptions[read_id] = ''
    details[read_id] = requests.get(resource_detail_url + '?ResourceId=' + read_id).json()
    descriptions[read_id] = details[read_id]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongDescription']
with open(filename, 'w') as fyle:
    json.dump(descriptions, fyle)
