class Devtool:

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
                'status': self.status(self.url(details)),
                'path': ['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'InternetDetail', 'URLText'],
               }
        return info

    def validate_READ_id(self, READ_id):
        '''Return details of link for given json-encoded details from READ's Web-Services.
        '''
        from requests import get
        details_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='
        return get(details_url + str(READ_id)).json()['READExportDetail']['InfoResourceDetail']['READResourceIdentifier']

    def check_link_for_all_ids(self):
        '''Return HTTP-status-code for url of each id in inventory.
        '''
        ids = self.get_ids()
        checked_links = {}
        for id in ids:
            id = str(id)
            checked_links[id] = self.link_check(self.get_details(id))
        return checked_links
