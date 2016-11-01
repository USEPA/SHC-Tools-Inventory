# scrape keywords from all shc-records in read
import requests

bigdict = {}
resource_advanced_search_url = 'https://ofmpub.epa.gov/v1/ResourceAdvancedSearch?name='

biglist = requests.get(resource_advanced_search_url).json()
for record in biglist:
    ResourceId = record['ResourceId']
    response = requests.get('https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='+
          str(ResourceId))
    try:
        bigdict[ResourceId] = response.json()['READExportDetail']['InfoResourceDetail']['KeywordDetail']['KeywordTex
t']
    except:
        bigdict[ResourceId] = ''
