/**
  Output a dict where each value is an array of autocomplete-values keyed by its fieldname;
    { SOME_FIELD: [ AUTOCOMPLETED_STRING, ... ], ... }
  The values are scraped from READ's Web-Services.
*/
autocompleteUpdater = {// user may pass an iterable list of fieldNames to be updated
  resourceAdvancedSearchURL: "https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch",// see READ web services' docs-page
  resourceDetailURL: "https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail",// see READ web services' docs-page
  decisionSectors: {'Transportation':true, 'Waste Management':true, 'Building Infrastructure':true, 'Land Use':true},
  fieldMap: {
    'acronym': ['READExportDetail','InfoResourceDetail','GeneralDetail','Acronym'], 
    'description': ['READExportDetail','InfoResourceDetail','GeneralDetail','ShortDescription'], 
    'title': ['READExportDetail','InfoResourceDetail','GeneralDetail','LongTitleText'], 
    'modelInput': ['READExportDetail', 'InfoResourceDetail', 'ModelInputsDetail', 'ModelInputsTextArea'],
    'modelOutput': ['READExportDetail', 'InfoResourceDetail', 'ModelOutputsDetail', 'ModelOutputsModelVariablesTextArea'],
    'modelEvaluation': ['READExportDetail', 'InfoResourceDetail', 'ModelEvaluationDetail', 'ModelEvaluationTextArea'],
    'keyword': ['READExportDetail', 'InfoResourceDetail', 'KeywordDetail', 'KeywordText'],
  },
  tools: {},
  idRequests: [],
  relimitingRegularExpression: /\s*;+\s*|\s*\(\s*|\s*\)\s*/,
  acronym: [],
  title: [],
  descriptionText: '',
  description: [],
  modelInputText: [],
  modelInput: [],
  modelOutputText: [],
  modelOutput: [],
  modelEvaluationText: [],
  modelEvaluation: [],
  keywordText: [],
  keyword: [],
  all: [],

  /**
   * searchSHCTools(queryData) fill objects with keys of all tools' ids if queryData is undefined
   * @param{queryData} - object to specify search parameters
   *                   - see READ Web Services' docs online for allowable properties
   */
  searchSHCTools: function(queryData) {// return ids of all tools with a decision sector by default; specify this.queryData to search for something
    for (var decisionSector in this.decisionSectors) {
      if (this.decisionSectors.hasOwnProperty(decisionSector)) {
        if (typeof(queryData) === 'undefined') {
          this.queryData = {};
        }
        this.queryData['DecisionSector'] = decisionSector;// requiring results to be in a decision-sector finds only tools in SHC's inventory including those added by others
        this.idRequests.push($.get(this.resourceAdvancedSearchURL, this.queryData));
      }
    }
    $.when.apply(autocompleteUpdater, this.idRequests).done(// awaits resolution of each deferred object
      (function(){
        for (var i = 0; i < arguments.length; i++) {
          for (var j in arguments[i][0]){
            var toolId = arguments[i][0][j]['ResourceId'];
            autocompleteUpdater.tools[toolId] = true;
            $.get(resourceDetailURL, {'ResourceId': toolId}, function(detailData){
              autocompleteUpdater.descriptionText += ' ' + readSafe(detailData, autocompleteUpdater.fieldMap['description']);
              autocompleteUpdater.acronym.push(readSafe(detailData, autocompleteUpdater.fieldMap['acronym']));
              autocompleteUpdater.title.push(readSafe(detailData, autocompleteUpdater.fieldMap['title']));
              if (readSafe(detailData, autocompleteUpdater.fieldMap['modelInput']) != 'no data on file') {
                autocompleteUpdater.modelInputText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['modelInput']);
              }
              if (readSafe(detailData, autocompleteUpdater.fieldMap['modelOutput']) != 'no data on file') {
                autocompleteUpdater.modelOutputText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['modelOutput']);
              }
              if (readSafe(detailData, autocompleteUpdater.fieldMap['modelEvaluation']) != 'no data on file') {
                autocompleteUpdater.modelEvaluationText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['modelEvaluation']);
              }
              if (readSafe(detailData, autocompleteUpdater.fieldMap['keyword']) != 'no data on file') {
                autocompleteUpdater.keywordText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['keyword']);
              }
            });
          }
        }
      }).bind(autocompleteUpdater)
    );
    setTimeout(
      function(){
        this.description = this.parsem(this.descriptionText);
        this.modelInput = this.parsem(this.modelInputText, this.relimitingRegularExpression);
        this.modelOutput = this.parsem(this.modelOutputText, this.relimitingRegularExpression);
        this.modelEvaluation = this.parsem(this.modelEvaluationText, this.relimitingRegularExpression);
        this.keyword = this.parsem(this.keywordText, this.relimitingRegularExpression);
      }.bind(autocompleteUpdater), 10000
    );
  },

  /**
   * UpdateBasedOnREADIds(queryData) fill objects with keys of all tools' ids in readIDsByConcept
   */
  updateBasedOnREADIds: function() {
    var readIDs = [];
    for (var concept in readIDsByConcept) {
      for (var i = 0; i < readIDsByConcept[concept].length; i++) {
        if (readIDs.indexOf(readIDsByConcept[concept][i]) === -1) {
          readIDs.push(readIDsByConcept[concept][i]);
        }
      }
    }

      for (var i = 0; i < readIDs.length; i++) {
        var toolId = readIDs[i];
        autocompleteUpdater.tools[toolId] = true;
        $.get(resourceDetailURL, {'ResourceId': toolId}, function(detailData){
          autocompleteUpdater.descriptionText += ' ' + readSafe(detailData, autocompleteUpdater.fieldMap['description']);
          autocompleteUpdater.acronym.push(readSafe(detailData, autocompleteUpdater.fieldMap['acronym']));
          autocompleteUpdater.title.push(readSafe(detailData, autocompleteUpdater.fieldMap['title']));
          if (readSafe(detailData, autocompleteUpdater.fieldMap['modelInput']) != 'no data on file') {
            autocompleteUpdater.modelInputText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['modelInput']);
          }
          if (readSafe(detailData, autocompleteUpdater.fieldMap['modelOutput']) != 'no data on file') {
            autocompleteUpdater.modelOutputText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['modelOutput']);
          }
          if (readSafe(detailData, autocompleteUpdater.fieldMap['modelEvaluation']) != 'no data on file') {
            autocompleteUpdater.modelEvaluationText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['modelEvaluation']);
          }
          if (readSafe(detailData, autocompleteUpdater.fieldMap['keyword']) != 'no data on file') {
            autocompleteUpdater.keywordText += '; ' + readSafe(detailData, autocompleteUpdater.fieldMap['keyword']);
          }
        });
      }

    setTimeout(
      function(){
        this.description = this.parsem(this.descriptionText);
        this.modelInput = this.parsem(this.modelInputText, this.relimitingRegularExpression);
        this.modelOutput = this.parsem(this.modelOutputText, this.relimitingRegularExpression);
        this.modelEvaluation = this.parsem(this.modelEvaluationText, this.relimitingRegularExpression);
        this.keyword = this.parsem(this.keywordText, this.relimitingRegularExpression);
      }.bind(autocompleteUpdater), 10000
    );
  },

  /**
   * take an iterable of iterables
   * return a duplicate-free array of lowercased elements from each iterable
   */
  sanitizem: function(iterables) {
    var set = new Set();
    var item, iterable, innerarray;
    /**
     * add sanitized elements of iterable to set
     */
    var addToSet = function(iterable, set) {
      for (var index in iterable) {
        item = iterable[index].toLowerCase().replace(/<a.*<\/a>/g,' ').trim();
        if (item.length > 2 && !item.match('http:') && stopWords.indexOf(item) === -1) {
          if (item.length > 40) {
            innerArray = item.split(/\s*,\s*/g);
            for (var i in innerArray) {
              if (innerArray[i].length > 60) {
                console.log('ELEMENT IS > 60 CHARACTERS AFTER SPLITTING ON PARENS, COMMAS, AND SEMICOLONS:',innerArray[i]);
              }
              set.add(innerArray[i].trim());
            }
          } else {
          set.add(item.trim());
          }
        }
      }
    };
    for (var iterablesIndex in iterables) {
      addToSet(iterables[iterablesIndex], set);
    }
    return [...set];
  },

  /**
   * splits a string into an array on a specifyable regular expression
   */
  parsem: function(wordString, optionalRegularExpressionToSplitOn) {
    var i, j, regularExpressionToSplitOn;
    var wordArray = [];
    var words = new Set();
    var regularExpressionToSplitOn = /(\s+|;|,|:|\.|\(|\))+/g;
    var regularExpressionToReplace = /(\.|\(|\))/g;// replace matches
    if (typeof(optionalRegularExpressionToSplitOn) !== 'undefined') {
      regularExpressionToSplitOn = optionalRegularExpressionToSplitOn;
    }
    wordArray = wordString.split(regularExpressionToSplitOn);
    wordArray = this.sanitizem([wordArray]);
    for (var i = 0; i < wordArray.length; i++) {
      if (wordArray[i].match(regularExpressionToSplitOn)) {
        continue;
      }
      words.add(wordArray[i].replace(regularExpressionToReplace, ' '));
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
    for (var i = 0; i < temporarilyAll.length; i++) {
      if (autocompleteUpdater.all.indexOf(temporarilyAll[i]) == -1) {
        autocompleteUpdater.all.push(temporarilyAll[i]);
      }
    }
    outputDiv.innerHTML = outputDiv.innerHTML + '<hr /><strong>All</strong>:<hr />' + JSON.stringify(autocompleteUpdater.all);
    outputDiv.innerHTML += '<hr /><strong>Export</strong>:<hr />' + JSON.stringify(
      {
        'Title': this.title,
        'Description': this.description,
        'Acronym': this.acronym,
        'Keywords': this.keyword,
        'ModelInput': this.modelInput,
        'ModelOutput': this.modelOutput,
      }
    );
  },

}
