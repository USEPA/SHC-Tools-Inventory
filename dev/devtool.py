class Devtool:
    def status(self, url):
        from requests import get
        return get(url).status_code
