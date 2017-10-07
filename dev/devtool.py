class Devtool:

    async def async_example(self):
        '''Implement asynchronous requests with large
        thread-pool to speed testing.'''
        # Example 3: asynchronous requests with larger thread pool
        import asyncio
        import concurrent.futures
        import requests
        async def main():
            with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
                loop = asyncio.get_event_loop()
                futures = [
                    loop.run_in_executor(
                        executor, 
                        requests.get, 
                        'http://example.org/'
                    )
                    for i in range(20)
                ]
                for response in await asyncio.gather(*futures):
                    pass
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())

    def probe_path(self, object, path):
        '''Return element in given object at given path.

        Attempt to access data at path in object. Give prescibed data on error.
        '''
        probe = object
        for key in path:
            if 'xsi:nil' in probe.keys():
                return str(probe)
            if key in probe.keys():
                probe = probe[key]
            else:
                print('Report: probe_path(object, path) got to its else condition.')
                return 'probe_path(): key ' + key + 'is not in object' + object + ' with key-set ' + probe.keys()
        return str(probe)

    def get_ids(self):
        '''Query READ's Web-Services for id of every tool in SHC's inventory.
        '''
        from requests import get
        url_advanced_search = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch'
        decision_sectors = [ 'Building+Infrastructure',
                             'Land+Use',
                             'Transportation',
                             'Waste+Management' ]
        ids = []
        for decision_sector in decision_sectors:
            results = get(url_advanced_search
                          + '?DecisionSector='
                          + decision_sector).json()
            for result in results:
                ids += [result['ResourceId']]
        return ids

    def get_details(self, READ_id):
        '''Get details from READ's Web-Services with READ-id.
        '''
        from requests import get
        details_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='
        return get(details_url + str(READ_id)).json()

    def READ_id(self, details):
        '''Return READ-id given json-encoded details from READ's Web-Services.
        '''
        if type(details) != type(dict()):
            from json import loads
            details = loads(details)
        READ_id = self.probe_path(details,
                ['READExportDetail','InfoResourceDetail','READResourceIdentifier'])
        return READ_id

    def acronym(self, details):
        '''Return acronym given json-encoded details from READ's Web-Services.
        '''
        return self.probe_path(details,
                ['READExportDetail',
                'InfoResourceDetail',
                'GeneralDetail',
                'Acronym'])

    def status(self, url):
        '''Return HTTP-status-code given a URL.
        '''
        from requests import get
        import json
        if 'xsi:nil' in str(url):
            return str(url)
        try:
            status = get(url).status_code
        except Exception as e:
            status = 'Devool().status(\'' + url + '\') caught an error when getting an HTTP-status-code.'
        return status

    def url(self, details):
        '''Return url given json-encoded details from READ's Web-Services.
        '''
        path = ['READExportDetail',
                'InfoResourceDetail',
                'AccessDetail',
                'InternetDetail',
                'URLText']
        return self.probe_path(details, path)

    def link_check(self, details):
        '''Return details of link for given json-encoded details from READ's Web-Services.
        '''
        info = {'READ_id': self.READ_id(details),
                'acronym': self.acronym(details),
                'url': self.url(details),
                'status': self.describe_status(self.status(self.url(details))),
                'path': ['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'InternetDetail', 'URLText'],}
        return info

    def validate_READ_id(self, READ_id):
        '''Get and return READ-id associated with argument READ_id as validation.
        '''
        from requests import get
        details_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='
        return get(details_url + str(READ_id)).json()['READExportDetail']['InfoResourceDetail']['READResourceIdentifier']

    def check_link_for_all_ids(self):
        '''Return HTTP-status-code and other details for url of each id in inventory.
        '''
        ids = self.get_ids()
        checked_links = {}
        for id in ids:
            id = str(id)
            checked_links[id] = self.link_check(self.get_details(id))
        return checked_links

    def send_to_csv(self, data, filename):
        '''Write dict of dicts with top-level-keys as header to filename as CSV.
        '''
        import csv
        from pprint import pprint
        pprint('data')
        pprint(data)
        ids = list(data.keys())
        keys = list(data[ids[0]].keys())
        data_for_csv = list()
        data_for_csv.append(keys)
        for id in ids:
            data_for_csv.append(list())
            row = data_for_csv[len(data_for_csv) - 1]
            for key in keys:
                row.append(data[id][key])
        print(data_for_csv)
        with open(filename, 'w') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(data_for_csv)

    def describe_status(self, status_code):
        from http_status import STATUS_CODES
        try:
            return STATUS_CODES[int(status_code)]
        except:
            return status_code
