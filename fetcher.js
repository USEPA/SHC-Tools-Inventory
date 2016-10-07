var resourceSearchURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch";
var resourceDetailURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail";

var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js';
script.type = 'text/javascript';
//comment line below for use with node; investigate automation of a solution for thits
//document.getElementsByTagName('head')[0].appendChild(script);

searcher = function () {
  $.ajax({
    type: 'GET',
    url: resourceSearchURL,
    data: { Acronym: acronym_query, DecisionSector:decision_query, Format: 'JSON' },
    dataType: 'json',
    success: function (data) {
      console.log(data);
      for (i = 0; i < data.length; i++) {
        snooper(data[i].ResourceId);
      }
    },
  });
};

snooper = function (resourceID) {
  $.ajax({
    type: 'GET',
    url: resourceDetailURL,
    data: { ResourceId: resourceID, Format: 'JSON' },
    dataType: 'json',
    success: function (data) {
      console.log(data);
    }
  });
};

console.log("Now running searcher() .");
searcher();
