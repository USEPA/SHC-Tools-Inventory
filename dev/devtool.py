class Devtool:

    def __init__(self):
        self.read_ids = self.get_ids()
        self.details = {}
        self.responses = {}
        self.checked_links = {}
        #self.async_get_all_details()

    def async_get_all_details(self):
        '''Implement asynchronous requests with large
        thread-pool to speed testing.'''
        # Example 3: asynchronous requests with larger thread pool
        import asyncio
        import concurrent.futures
        import requests
        async def main():
            details_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='
            with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
                loop = asyncio.get_event_loop()
                read_ids = self.read_ids
                futures = [loop.run_in_executor(executor,
                                                self.get_details, # fncn to call
                                                read_id) # arg to fncn
                           for read_id in read_ids]
                for details in await asyncio.gather(*futures):
                    self.details[self.read_id(details)] = details
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())

    def probe_path(self, object_to_probe, path):
        '''Return element in given object at given path.

        Attempt to access data at path in object. Give prescibed data on error.
        '''

        probe = object_to_probe
        for key in path:
            if type(probe) is str:
                return probe
            elif key in probe.keys():
                probe = probe[key]
                continue
        if type(probe) is str:
            return probe
        return 'probe_path() was unable to follow ' + str(key) + ' through ' + str(probe)

        #OLD CODE COMMENTED BELOW:
        #probe = object
        #for key in path:
        #    if 'xsi:nil' in probe.keys():
        #        return str(probe)
        #    if key in probe.keys():
        #        probe = probe[key]
        #return str(probe)

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

    def get_details(self, read_id):
        '''Cache and return details from READ's Web-Services
        with read_id if details aren't cached.'''
        read_id = str(read_id) 
        if read_id in self.details.keys():
            return self.details[read_id]
        else:
            from requests import get
            details_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='
            details = get(details_url + read_id).json()
            self.details[read_id] = details
            return details

    def read_id(self, details):
        'Return read_id given json-encoded details from READ\'s Web-Services.'
        if not type(details) is dict: # handle details passed in as string
            from json import loads
            details = loads(details)
        read_id = details['READExportDetail']['InfoResourceDetail']['READResourceIdentifier']
        return read_id

    def acronym(self, details):
        '''Return acronym given json-encoded details from READ's Web-Services.
        '''
        return self.probe_path(details,
                ['READExportDetail',
                'InfoResourceDetail',
                'GeneralDetail',
                'Acronym'])

    def status(self, url):
        '''Return HTTP-status-code for url.
        '''
        if 'xsi:nil' in str(url):
            return str(url)
        if url in self.responses.keys():
            response = self.responses[url]
        else:
            from requests import get
            import json
            try:
                response = get(url)
                self.responses[url] = response
            except Exception as e:
                status = 'Devool().status(\'' + url + '\') caught an exception when getting an HTTP-status-code.'
                return status
        try:
            status = str(response.status_code)
        except AttributeError as e:
            status = 'ERROR'
        try:
            if response.history != []:
                for response_from_history in response.history[::-1]:
                    status = str(response_from_history.status_code) + ' ' + status
        except Exception as e:
            #FIXME gracefully handle exceptions
            #print(60*'#')
            #print('RETURNING EXCEPTION RAISED WHEN APPENDING REDIRECTS\' STATUS-CODES TO RETURN-VALUE NAMED status:')
            #print(e)
            status = '***EXCEPTION: ' + str(e) + '*** ' + status
        return status

    def get_url(self, read_id):
        '''Return url for READ-id.
        '''
        details = self.get_details(read_id)
        path = ['READExportDetail',
                'InfoResourceDetail',
                'AccessDetail',
                'InternetDetail',
                'URLDetail',
                'URLText']
        return self.probe_path(details, path)

    def response(self, url):
        'Return response to url or error.'
        if url in self.responses.keys():
            response = self.responses[url]
        else:
            try:
                from requests import get
                response = get(url)
            except Exception as e:
                response = str(e)
        self.responses[url] = response
        return response

    def link_check(self, read_id):
        'Return details of url for read_id.'
        details = self.get_details(read_id)
        info = {'read_id': self.read_id(details),
                'acronym': self.acronym(details),
                'requested url': self.get_url(read_id),
                'gets_redirected': self.gets_redirected(self.get_url(read_id)),
                'status': str(self.status(self.get_url(read_id))),
                'path': ['READExportDetail',
                         'InfoResourceDetail',
                         'AccessDetail',
                         'InternetDetail',
                         'URLDetail',
                         'URLText'],}
        try:
            info['final_url'] = self.response(self.get_url(read_id)).url
        except AttributeError as e:
            info['final_url'] = 'ERROR'
        return info

    def validate_read_id(self, read_id):
        '''Get and return read_id associated with argument read_id as validation.
        '''
        from requests import get
        details_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='
        return get(details_url + str(read_id)).json()['READExportDetail']['InfoResourceDetail']['READResourceIdentifier']

    def check_link_for_all_ids(self):
        '''Return HTTP-status-code and other details for url of each id in inventory.
        '''
        # original code
        read_ids = self.read_ids
        checked_links = {}
        for read_id in read_ids:
            read_id = str(read_id)
            checked_links[read_id] = self.link_check(read_id)
        return checked_links

        ## async version
        #import asyncio
        #import concurrent.futures
        #import requests
        #async def main():
        #    self.checked_links = {}
        #    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        #        loop = asyncio.get_event_loop()
        #        read_ids = self.details.keys()
        #        futures = [loop.run_in_executor(executor,
        #                                        self.link_check,
        #                                        read_id)
        #                   for read_id in read_ids]
        #        for link_check in await asyncio.gather(*futures):
        #            self.checked_links[link_check['read_id']] = link_check
        #    return self.checked_links
        #loop = asyncio.get_event_loop()
        #loop.run_until_complete(main())

    def send_to_csv(self, data, filename, verbose=False):
        'Write dict of dicts with top-level-keys as header to filename as CSV.'
        import csv
        from pprint import pprint
        if verbose != False:
            pprint('verbose != False => printing argument data:')
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
        with open(filename, 'w', newline='') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(data_for_csv)

    def describe_status(self, status_code):
        'Describe a numeric HTTP-status-code.'
        from http_status_codes_to_names import STATUS_CODES
        try:
            return STATUS_CODES[int(status_code)]
        except:
            return status_code

    def get_response(self, url):
        '''Return request or self.error.

        Use a cached response if present.
        Ensure response is cached when done.
        '''
        if url in self.responses.keys():
            response = self.responses[url]
        else:
            from requests import get
            try:
                response = get(url)
            except Exception as e:
                e.status = 'ERROR from Devtool().get_response(' + str(url) + ')'
                response = e
            self.responses[url] = response
        return response

    def gets_redirected(self, url):
        '''Compare requested url with the final url.
        '''
        response = self.get_response(url)
        if hasattr(response, 'status') and response.status[:5] == 'ERROR':
            return False
        if response.url != url:
            return True
        else:
            return False

if __name__ == '__main__':
    dt = Devtool()
