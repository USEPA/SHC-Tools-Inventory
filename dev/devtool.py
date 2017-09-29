class Devtool:
    def get_details(self, READ_id):
        from requests import get
        details_url = 'https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail?ResourceId='
        return get(details_url + str(READ_id)).json()
    def READ_id(self, details):
        return details['READExportDetail']['InfoResourceDetail']['READResourceIdentifier']
    def acronym(self, details):
        return details['READExportDetail']['InfoResourceDetail']['GeneralDetail']['Acronym']
    def status(self, url):
        from requests import get
        return get(url).status_code
    def url(self, details):
        path_and_data = (['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'InternetDetail', 'URLText'],
                details['READExportDetail']['InfoResourceDetail']['AccessDetail']['InternetDetail']['URLText'])
        return path_and_data
    def link_check(self, details):
        url_info = self.url(details)
        return self.READ_id(details), self.acronym(details), self.url(details)[1], self.status(self.url(details)[1]), self.url(details)[0],
