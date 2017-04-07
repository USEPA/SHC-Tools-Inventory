/* DEV NOTES TO BE REPLACED WITH JSDOC-ADHERENT DOCS
############ updateAutocomplete([fieldNamesIterable]) = {fieldName:{phrase:{toolid:true}}} ############
- take optional iterable of fieldNames
- get ids of all tools in a decision-sector(this is how SHC's tools are currently identified)
  - for each decision-sector
    - search for decision-sector
    - add each result's id to tools
- for each field:
  - instantiate object keyed by phrases
    - scrape all phrases from tools into an array
      - get text from field into a string 
      - split delimited strings and append each to phrases
      - split nondelimited strings on spaces and append each to prases
    - remove phrases that are stopwords from iterable named phrases
    - create an object as a property of fieldNames with each phrase as a key
- combine all field-objects as properties of autocompletedPhrases keyed by respective fieldnames
- use autocompletedPhrases as the data-structure that autocompletes findable values when searching user-selected fields
*/
var autocompleteUpdater = {// user may pass an iterable list of fieldNames to be updated
  resourceAdvancedSearchURL: "https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch",// see READ web services' docs-page
  resourceDetailURL: "https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail",// see READ web services' docs-page
  decisionSectors: {'Transportation':null, 'Waste Management':null, 'Building Infrastructure':null, 'Land Use':null},
  fieldMap: {
    'acronym': ['READExportDetail','InfoResourceDetail','GeneralDetail','Acronym'], 
    'description': ['READExportDetail','InfoResourceDetail','GeneralDetail','ShortDescription'], 
    'title': ['READExportDetail','InfoResourceDetail','GeneralDetail','LongTitleText'], 
  },
  autocompleteData: {},
  tools: {},
  idRequests: [],
  data: {},
  descriptionText: '',
  acronym: [],
  title: [],
  description: [],
  allSet: new Set(),
  all: [],

  searchSHCTools: function(data) {// return ids of all tools with a decision sector by default; specify this.data to search for something
    for (var decisionSector in this.decisionSectors) {
      if (this.decisionSectors.hasOwnProperty(decisionSector)) {
        this.data['DecisionSector'] = decisionSector;// specify a decision-sector to find only tools in SHC's inventory including those added by others
        this.idRequests.push($.get(this.resourceAdvancedSearchURL, this.data));
      }
    }
    $.when.apply(autocompleteUpdater, this.idRequests).done(// awaits resolution of all deferred objects
      (function(){
        for (var i = 0; i < arguments.length; i++) {
          for (var j in arguments[i][0]){
            var toolId = arguments[i][0][j]['ResourceId'];
            autocompleteUpdater.tools[toolId] = true;
            $.get(resourceDetailURL, {'ResourceId':toolId}, function(detailData){
              autocompleteUpdater.descriptionText += ' ' + readSafe(detailData, autocompleteUpdater.fieldMap['description']);
              autocompleteUpdater.acronym.push(readSafe(detailData, autocompleteUpdater.fieldMap['acronym']));
              autocompleteUpdater.title.push(readSafe(detailData, autocompleteUpdater.fieldMap['title']));
            });
          }
        }
      }).bind(autocompleteUpdater)
    );
    setTimeout(function(){this.description = this.parseOneOff(this.descriptionText);}.bind(autocompleteUpdater), 10000);
  },

  /**
   * splits a given string into an array on a static regular expression
   */
  parseOneOff: function(wordString) {
    var i, j, regularExpressionToSplitOn, regularExpressionStringToSplitOn;
    var arrayOfStringsToSplitOn = ['\s+',';',',',':'];
    var wordArray = [];
    var words = new Set();
    regularExpressionString = '(';
    for (var i = 0; i < arrayOfStringsToSplitOn.length - 2; i++) {
      regularExpressionStringToSplitOn += arrayOfStringsToSplitOn[i] + '|';
    }
    regularExpressionString += arrayOfStringsToSplitOn[arrayOfStringsToSplitOn.length - 1] + ')';
    regularExpressionToSplitOn = /(\s+|;|,|:)+/;//DEV: FINISH BY REPLACING LITERAL REGEX WITH RegExp(regularExpressionString);
    wordArray = wordString.split(regularExpressionToSplitOn);
    for (var i = 0; i < wordArray.length; i++) {
      if (wordArray[i].match(regularExpressionToSplitOn) || wordArray[i].length < 2 && (stopWords.indexOf(wordArray[i]))) {
        continue;
      }
      words.add(wordArray[i].replace(/(\.|\(|\))/g, ''));
    }
    return [...words];
  },

  /**
   * Displays updated arrays for autocomplete
   */
  show: function() {
    var outputDiv = document.getElementById('output');
    var temporarilyAll = [];
    outputDiv.innerHTML = '';
    autocompleteUpdater.all = [];
    for (field in this.fieldMap) {
      if (this.hasOwnProperty(field)) {
        outputDiv.innerHTML = outputDiv.innerHTML + '<hr /><strong>' + field + '</strong>:<hr />' + JSON.stringify(autocompleteUpdater[field]);
        temporarilyAll = temporarilyAll.concat(autocompleteUpdater[field]);
      }
    }
    console.log('temporarilyAll:',temporarilyAll);
    for (var i = 0; i < temporarilyAll.length; i++) {
      if (autocompleteUpdater.all.indexOf(temporarilyAll[i]) == -1) {
        console.log('adding word:', temporarilyAll[i]);
        autocompleteUpdater.all.push(temporarilyAll[i]);
      }
    }
    outputDiv.innerHTML = outputDiv.innerHTML + '<hr /><strong>All</strong>:<hr />' + JSON.stringify(autocompleteUpdater.all);
  },

  /**
   * Return phrases split from phraseString on either default or custom substrings.
   * @param phraseString - required string to split into phrases
   * @param arrayOfStringsToSplitOn - optionally passes all strings which might delimit phrases
  parsePhrases: function(phraseString, arrayOfStringsToSplitOn) {
    var regularExpressionString;
    var i;
    var regularExpressionToSplitOn;
    var phraseArray = [];
    var phrases = {};
    if (typeof arrayOfStringsToSplitOn === 'undefined') {
      var arrayOfStringsToSplitOn = [';',' ','\/','\\',':','\|'];
    }
    regularExpressionString = '(';
    for (i = 0; i < arrayOfStringsToSplitOn.length - 2; i++) {
      regularExpressionString += arrayOfStringsToSplitOn[i] + '|';
    }
    regularExpressionString += arrayOfStringsToSplitOn[arrayOfStringsToSplitOn.length - 1] + ')';
    regularExpressionToSplitOn = RegExp(regularExpressionString);
    }
    phraseArray = phraseString.split(regularExpressionToSplitOn);
    for (i = 0; i < phraseArray.length; i++) {
      //STUB: REMOVE ELEMENTS THAT ARE STOPWORDS OR ARE ELEMENTS OF arrayOFStringsToSplitOn 
    }
  },
  if (typeof(optionalIterableOfFieldNames) === 'undefined') {// take optional argument to update arbitrary fields
    fieldNames = {'Name':true};
  }
  for (var fieldName in fieldNames) {
    if (fieldNames.hasOwnProperty(fieldName)) {
      autocompleteData[fieldName] = {};
      for (id in tools) {
        
      }
    }
    // collect data from this field-name for each result
  }
  this.toolIds = searchSHCTools(optionalIterableOfFieldNames);
   */

}
