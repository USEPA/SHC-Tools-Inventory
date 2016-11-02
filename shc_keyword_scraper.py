'scrape keywords from all shc-records in read'
def shc_keyword_scraper(urlending=None):
    import requests
    import csv

    def checkstatus(response):
        if response.status_code != 200:
            raise Exception(response.status_code)

    bigdict = {}
    shckeywords = set()
    detail_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='

    if urlending == None:
        urlending = 'ResourceAdvancedSearch?name='
    url = 'https://ofmpub.epa.gov/v1/' + str(urlending)
    searchresponse = requests.get(url)
    checkstatus(searchresponse)
    biglist = searchresponse.json()
    for record in biglist:
        ResourceId = record['ResourceId']
        detailsresponse = requests.get(detail_url + str(ResourceId))
        ckeckstatus(detailsresponse)
        keyworddetail = detailsresponse.json()['READExportDetail']['InfoResourceDetail']['KeywordDetail']
        if keyworddetail['xsi:nil'] == True: next
        bigdict[ResourceId] = keyworddetail['KeywordText']
    for key in bigdict.keys():
        keywordstring = bigdict[key].strip(',;\s')
        if keywordstring == '': next
        for substring in keywords.split(','):
            for keyword in substring.split(';'):
                shckeywords.add(keyword)
    with open('shc_keywords.csv', 'w', newline='') as csvfile:
        spamwriter = csv.writer(csvfile)
        for keyword in list(shckeywords).sort():
            spamwriter.writerow([keyword])

if __name__ == '__main__': shc_keyword_scraper()
