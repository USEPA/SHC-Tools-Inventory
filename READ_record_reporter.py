'This script is far longer than necessary for clarity'

import json
from os import path
import pdb
import pdb
import csv

file_path = path.join('.','records-listing-allen-as-contact.json')
with open(file_path) as json_file:
    records = json.load(json_file)
length = len(records)
# appending for only 10^3 ops is fine
READ_IDs = []
acronyms = []
internet_accessible_urls = []
titles = []
user_support_phone_numbers = []
lists = [
        acronyms,
        internet_accessible_urls,
        titles,
        user_support_phone_numbers]

def parse():
    'parse imported READ data into lists'
    for i in range(length):
        READ_IDs.append(
                records[i]['READExportDetail']['InfoResourceDetail']['READResourceIdentifier'])
        acronyms.append(
                records[i]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['Acronym'])
        titles.append(
                records[i]['READExportDetail']['InfoResourceDetail']['GeneralDetail']['LongTitleText'])
        internet_accessible_urls.append(
                records[i]['READExportDetail']['InfoResourceDetail']['AccessDetail']['InternetDetail']['URLText'])
        user_support_phone_numbers.append(
                records[i]['READExportDetail']['InfoResourceDetail']['UserSupportDetail']['UserSupportPhoneNumber'])

def report():
    'print  a formatted report of the desired data'
    for i in range(length):
        print('Record #{0}'.format(i+1))
        print(10*'-')
        print('READResourceIdentifier: ', READ_IDs[i])
        print('{0}: {1}\n{2}'.format(acronyms[i], titles[i], internet_accessible_urls[i]))
        # only print if string; will be dict for json repr of xsi:nil
        if type(user_support_phone_numbers[i]) == str:
            print(user_support_phone_numbers[i])
        print(30*'#','\n')

def idcsv(filename='records_to_remove_allen_brookes_from.csv'):
    #FINISH WRITING CSV-REPORTER FOR JOHN HARMON
    with open(filename, 'w', newline='') as csvfile:
        spamwriter = csv.writer(csvfile,delimiter=',')
        # write header
        spamwriter.writerow(['READ_Resource_Identifier'])
        for i in range(length):
            spamwriter.writerow(['{0}'.format(READ_IDs[i])])

def main():
    parse()
    idcsv()

if __name__ == '__main__': main()
