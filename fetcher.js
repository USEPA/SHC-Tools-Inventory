var resourceSearchURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch";
var resourceDetailURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail";

var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

simpleSearchClk3 = function () {
  var name_query = " ";
  var decision_query = "";
  $.ajax({
    type: 'GET',
    url: resourceSearchURL,
    data: { Name: name_query, DecisionSector:decision_query, Format: 'JSON' },
    dataType: 'json',
    success: function (data) {
      //console.log('set (auto-globally by not declaring w/ `var`): `allenRecords = []`');
      allenRecords = [];
      allenCheckEmail = [];
      allenCheckTelephone = [];
      for (i = 0; i < data.length; i++) {
        //console.log('Searching for details of ',data[i],' with simpleSearchClk4(data[i].ResourceId);');
        simpleSearchClk4(data[i].ResourceId);
      }
    },
  });
};

simpleSearchClk4 = function (resourceID) {
  $.ajax({
    type: 'GET',
    url: resourceDetailURL,
    data: { ResourceId: resourceID, Format: 'JSON' },
    //data: { Name: name_query, ShortDescriptionForReports: decision_query, Format: 'JSON' },
    dataType: 'json',
    success: function (data) {
      //console.log('simpleSearchClk4(data[i].ResourceId): ',data.READExportDetail.InfoResourceDetail.GeneralDetail.LongTitleText,data);
      //console.log('Scraping data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.EmailAddressText: ',data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.EmailAddressText);
      if (data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.FirstName == "Allen" && data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.LastName == "Brookes") {
        allenRecords.push(data);
        //console.log('first = Allen and last = Brookes: pushed data object onto auto-global-list allenRecords');
      }
      if (data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.EmailAddressText == "Brookes.Allen@epa.gov") {
        allenCheckEmail.push(data);
        //console.log('email = Brookes.Allen@epa.gov: pushed data object onto auto-global-list allenCheckEmail');
      }
      if (data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.TelephoneNumber == "(541) 754-4480") {
        allenCheckTelephone.push(data);
        //console.log('phone = "(541) 754-4480": pushed data object onto auto-global-list allenCheckTelephone');
      if (data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.FirstName == "Allen" && data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.LastName == "Brookes") {
        allenCheck.push(data);
        //console.log('first = Allen and last = Brookes: pushed data object onto auto-global-list allenRecords');
      }
      if (data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.EmailAddressText == "allenbrookes@epa.gov") {
        allenCheckEmail.push(data);
        console.log('email = Brookes.Allen@epa.gov: pushed data object onto auto-global-list allenCheckEmail');
      }
      if (data.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.EmailAddressText == "allenbrookes@epa.gov") {
        allenCheckTelephone.push(data);
        console.log('phone = "(541) 754-4480": pushed data object onto auto-global-list allenCheckTelephone');
      }
    }
  });
};
