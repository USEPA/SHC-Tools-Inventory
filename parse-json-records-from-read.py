import json
from os import path
fp = path.join('.','console.json')
length = len(records)
with open(fp) as f:
    records = json.load(f)
acronyms = []
internet_accessible_urls = []
intranet_accessible_urls = []
titles = []

def scrape():
    'scrape data into lists'
    for i in range(length):
        acronyms.append(
            records[i]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['Acronym'])
        internet_accessible_urls.append(
            records[i]['READExportDetail']['InfoResourceDetail']['AccessDetail']['InternetDetail']['URLText'])
        titles.append(
            records[i]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongTitleText'])

def printem():
    for i in range(length):
        printf( '%1: %2\n%3\n\n' % acronyms[i], titles[i], internet_accessible_urls[i] )
