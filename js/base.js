$ = jQuery;// ensure jquery gets where it's expected
/**
 * toolCache Object
*/
var toolCache = (function() {
  var cache = {};

  function _setData(id, data){
    //console.log("adding data to cache");
    cache[id] = data;
  }

  function _getData(id){
    //console.log("getting data from cache");
    if (cache.hasOwnProperty(id)) {
      return cache[id];
    }
  }

  return { // public interface
    handleParsedData: function(id, callback){
      if (cache.hasOwnProperty(id)) {
        callback(_getData(id));
      } else {
        $.get(resourceDetailURL,{ResourceId:id}).done(function(data) {
          _setData(id, parseResult(data));
          callback(_getData(id));
        });
      }
    },
    getParsedData: function(id){
      if (cache.hasOwnProperty(id)) {
        //console.log("in cache, returning");
        return _getData(id);
      } else {
        //console.log("not in cache");
        return null;
      }
    },
    getCache : function(){
      return cache;
    }
  };
})();
/**
 * ToolSet Object
*/
function ToolSet(){
  this.toolSet = {};
  this.length = 0;
  this.getToolSet = function(){
    return this.toolSet;
  };
  this.getLength = function(){
    return this.length;
  };
  this.addTool = function(toolId){
    if (!this.getToolSet().hasOwnProperty(toolId)){
      this.toolSet[toolId] = true;
      this.length++;
    }
  };
  this.removeTool = function(toolId){
    if (this.getToolSet().hasOwnProperty(toolId)){
      delete this.toolSet[toolId];
      this.length--;
    }
  };
  this.contains = function(toolId){
    if (this.getToolSet().hasOwnProperty(toolId)){
      return true;
    } else {
      return false;
    }
  };
  this.isEqual = function(toolSet){
    for (var toolId in this.toolSet){
      if (this.toolSet.hasOwnProperty(toolId)){
        if (!toolSet.hasOwnProperty(toolId)){
          return false;
        }   
      }
    }
    for (var toolId in toolSet){
      if (toolSet.hasOwnProperty(toolId)){
        if (!this.toolSet.hasOwnProperty(toolId)){
          return false;
        }   
      }
    }
    return true;
  };
  this.reset = function(){
    this.toolSet = {};
    this.length = 0;
    this.displayed = false;
  };
} 
/**
 * ToolDisplay Object
*/
var ToolDisplay = function(tableId, listId) {
  this.toolSet = new ToolSet();
  this.tableId = tableId;
  this.listId = listId;
};

ToolDisplay.prototype.getToolSet = function() {
  return this.toolSet;
};

ToolDisplay.prototype.getTableId = function() {
  return this.tableId;
};

ToolDisplay.prototype.getListId = function() {
  return this.listId;
};

ToolDisplay.prototype.isDisplayed = function() {
  return this.displayed;
};

ToolDisplay.prototype.displayTool = function(data) {
  this.getToolSet().addTool(data.READResourceIdentifier);
  addRow(data, this.getTableId());
  addDiv(data, this.getListId());
};
/**
 * Create result and saved tool sets
*/
var resultSet = new ToolSet();
var savedTools = new ToolSet();
/**
 * Create ToolDisplay Objects we need 
*/
var resultTable = new ToolDisplay('results-table', 'results-list');
var savedTable = new ToolDisplay('saved-table', 'saved-list');
var buildingInfrastructureTable = new ToolDisplay('building-infrastructure-table', 'building-infrastructure-list');
var landUseTable = new ToolDisplay('land-use-table', 'land-use-list');
var wasteManagementTable = new ToolDisplay('waste-management-table', 'waste-management-list');
var transportationTable = new ToolDisplay('transportation-table', 'transportation-list');
/**
 * Adapted parseResults function from search.html to add a row to a table
*/
function addRow(str, table_reference) {
  try {
    var row_template = {
      "Acronym": 0,
      "ShortTitleText": 1,
      "ShortDescription": 2,
      "BaseCostOfSoftware": 3,
      "SpatialExtent": 4,
      "ModelInputs": 5,
      "ModelOutputTypes": 6
    };
    var id = table_reference+'-'+str.READResourceIdentifier;
    table_reference = '#'+table_reference;
    result = str;
    var result_table = $(table_reference)[0];
    var row = result_table.insertRow(1);
    row.id = id;
    row.setAttribute("data-read-id", str.READResourceIdentifier);
    for (var key in row_template) {
      var cell = row.insertCell(row_template[key]);
      var columnnumber = row_template[key];
      cell.style.fontSize = 'x-small';
      var this_result;
      switch (columnnumber) {
        case 0: //Acronym
          var AcronymData = str
            .Acronym;
          this_result = AcronymData;
          break;
        case 1: //ShortTitleText
          var ShortTitleTextData = str
            .LongTitleText;
          this_result = ShortTitleTextData;
          break;
        case 2: //ShortDescription
          var ShortDescriptionData = str
            .LongDescription;
          this_result = ShortDescriptionData;
          break;
        case 3: //DetailsBaseSoftwareCost
          var DetailsBaseSoftwareCostData = str
            .DetailsBaseSoftwareCost;
          this_result = DetailsBaseSoftwareCostData;
          break;
        case 4: //SpatialExtent
          var SpatialExtentData = str
            .ModelScopeSpatialExtentDetail;
          this_result = SpatialExtentData;
          break;
        case 5: //Model Inputs
          var ModelOutputsTextAreaData = str
            .ModelInputsTextArea;
          this_result = ModelOutputsTextAreaData;
          break;
        case 6: //ModelOutputs
          var ModelOutputsTextAreaData = str
            .ModelOutputsModelVariablesTextArea;
          this_result = ModelOutputsTextAreaData;
        default:
          this_result = "No Data Available";
      }
      if (this_result.length > 140) {
        this_result = this_result.substr(0, 140) + '...';
      }
      cell.innerHTML = this_result;
    }
    $(table_reference + " tr").click(function() {
      showDetails(str.READResourceIdentifier);
    });
  } catch (err) {
    console.log(err);
    $(table_reference+' tr:last').remove();
  }
/**
 * Removes all tools from saved tools
*/
function clearSaved(divID) {
  $('#'+divID +' input').each(function(){
    savedTools.removeTool($(this).val());
    $('#'+divID + ' > #' + divID + '-' + $(this).val()).remove();
    $('#saved-table-' + $(this).val()).remove();
  });
}

/**
 * Refactored code to display the selected tool data
*/
function showDetails(id) {
  var parsedData = toolCache.getParsedData(id);
  var html = '<div id="selected-tool-div" data-read-id="'+parsedData.READResourceIdentifier+'">'; 
  var $tab = $("#selected-tool");
  try {
    $tab.empty();
  } catch (error) {
    console.log(error);
  }
  if (parsedData){
    html+= "<span class='bold'>Title</span>: "+parsedData.LongTitleText+"<br>";
    html+= "<span class='bold'>Acronym</span>: "+parsedData.Acronym+"<br>";
    html+= "<span class='bold'>Description</span>: "+parsedData.LongDescription+"<br>";
    html+= "<span class='bold'>Ownership Type</span>: "+parsedData.OwnershipTypeName+"<br>";
    html+= "<span class='bold'>Cost Details</span>: "+parsedData.DetailsBaseSoftwareCost+"<br>";
    html+= "<span class='bold'>Other Costs</span>: "+parsedData.DetailsOtherCostConsiderations+"<br>";
    html+= "<span class='bold'>Open Source</span>: "+parsedData.DetailsOpenSource+"<br>";
    html+= "<span class='bold'>Decision Sector</span>: "+parsedData.ModelScopeDecisionSector+"<br>";
    html+= "<span class='bold'>Keywords</span>: "+parsedData.KeywordText+"<br>";
    html+= "<span class='bold'>User Support Name</span>: "+parsedData.UserSupportName+"<br>";
    html+= "<span class='bold'>User Support Phone</span>: "+parsedData.UserSupportPhoneNumber+"<br>";
    html+= "<span class='bold'>User Support Email</span>: "+parsedData.UserSupportEmail+"<br>";
    html+= "<span class='bold'>User Support Material</span>: "+parsedData.UserSupportSourceOfSupportMaterials+"<br>";
    html+= "<span class='bold'>URL</span>: "+parsedData.URLText+"<br>";
    html+= "<span class='bold'>Current Phase</span>: "+parsedData.CurrentLifeCyclePhase+"<br>";
    html+= "<span class='bold'>Last Modified</span>: "+parsedData.LastModifiedDateTimeText+"<br>";
    html+= "<span class='bold'>Operating Environment</span>: "+parsedData.OperatingEnvironmentName+"<br>";
    html+= "<span class='bold'>Operating System</span>: "+parsedData.OSName+"<br>";
    html+= "<span class='bold'>Model Inputs</span>: "+parsedData.ModelInputsTextArea+"<br>";
    html+= "<span class='bold'>Model Output Variables</span>: "+parsedData.ModelOutputsModelVariablesTextArea+"<br>";
    html+= "<span class='bold'>Model Evaluation</span>: "+"<span class='bold'></span>: "+parsedData.ModelEvaluationTextArea+"<br>";
    html+= "<span class='bold'>Scope and Time Scale</span>: "+parsedData.ModelScopeTimeScaleDetail+"<br>";
    html+= "<span class='bold'>Spatial Extent</span>: "+parsedData.ModelScopeSpatialExtentDetail+"<br>";
    html+= "<span class='bold'>Inputs Data Requirements</span>: "+parsedData.ModelInputsDataRequirements+"<br>";
    html+= "</div>";
    $tab.append(html);
    $('#selected-tool-tab').parent().attr('aria-hidden',false);
    $('#selected-tool-panel').attr('aria-hidden',false);
    $("#selected-tool-tab").click();
    $("#selected-tool-tab").focus();
  } else {
    $tab.append(html);
    $('#selected-tool-tab').parent().attr('aria-hidden',true);
    $('#selected-tool-panel').attr('aria-hidden',true);
  }
}

/**
 * Export all Saved tools from the saved tools table to a downloaded CSV
*/
function exportAllCSV(savedResultsDiv) {
  var records = $('#'+savedResultsDiv+' input');
  if (records.length > 0) {
    var csvContent = '';
    var names = [];
    var values;
    records.each(function(){
      values = [];
      var record = toolCache.getParsedData($(this).val());
      if (record) {
        if (names.length === 0) {
          for (var prop in record) {
            if (record.hasOwnProperty(prop)) {
              var name = prop;
              names.push(name);
            }
          }
          csvContent = names.join() + '\n';
        }
        for (var property in record) {
          if (record.hasOwnProperty(property)) {
            values.push('"' + record[property] + '"');
          }
        }
        csvContent += values.join() + '\n';
      }
    });
    var link = document.createElement("a");
    link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    link.setAttribute("download", "my_data.csv");
    link.click();
  }
}
/**
 * Saved tools from the the selected tool panel
*/
function saveRecord() {
  var recordIdToSave = $('#selected-tool-div').attr('data-read-id');
  if(!savedTools.contains(recordIdToSave)) {
    savedTools.addTool(recordIdToSave);
    //populate divs
    toolCache.handleParsedData(recordIdToSave, savedTable.displayTool.bind(savedTable));
  }
  if (savedTools.getLength() > 0) {
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
    $('#saved-tools-panel').attr("aria-hidden", false);
  }
}