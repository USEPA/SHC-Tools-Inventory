response = requests.get('https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch?fakefield=')
idlist = [ item['ResourceId'] for item in response.json() ]
def keywordstring(id):
    'retrieve keyword string for read-resource with ResourceId == id'
    import requests
    response = requests.get('https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='+str(id))
    try:
        return(response.json()['READExportDetail']['InfoResourceDetail']['KeywordDetail']['KeywordText'])
    except:
        # if no keywords then return ''
        return('')
keywordstringlist = [ keywordstring(id) for id in idlist ]
keywordstringbyid = {}
for i in range(len(idlist)):
    keywordstringbyid[idlist[i]] = keywordstringlist[i]
def splitandsanitize(inputlist,delimiterlist=[';',',']):
    inputlist = [item for item in inputlist]
    for delimiter in delimiterlist:
        outputlist = []
        for item in inputlist:
            outputlist += str(item).split(delimiter)
        inputlist = outputlist
    inputlist = [item.strip() for item in inputlist]
    while '' in inputlist:
        inputlist.remove('')
        list(set(inputlist))
    return(sorted(inputlist))
keywordlist = splitandsanitize(keywordstringlist)
