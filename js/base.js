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
  addRow(data, this.getTableId(), createRow(data));
  addDiv(data, this.getListId());
};

ToolDisplay.prototype.displayToolSet = function(data) {
  this.getToolSet().addTool(data.READResourceIdentifier);
  addRow(data, this.getTableId(), createRow(data));
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
 * Toggle result table or list display styles
*/
$('[name="display-type"]').change(function(){
  if($(this).attr('id') === 'table-radio'){ // show table;
    $('#results-list-div').attr('aria-hidden', true);
    $('#results-table-div').attr('aria-hidden', false);
  } else if ($(this).attr('id') === 'list-radio') { // show list
    $('#results-table-div').attr('aria-hidden', true);
    $('#results-list-div').attr('aria-hidden', false);
  }
});

/**
 * Toggle saved table or list display styles
*/
$('[name="saved-display-type"]').change(function(){
  if ($(this).attr('id') === 'saved-table-radio'){
    $('#saved-list-div').attr('aria-hidden', true);
    $('#saved-table-div').attr('aria-hidden', false);
  } else if ($(this).attr('id') === 'saved-list-radio') { // show list
    $('#saved-table-div').attr('aria-hidden', true);
    $('#saved-list-div').attr('aria-hidden', false);
  }
});

/**
 * Toggle browse table or list display styles
*/
$('[name="browse-display-type"]').change(function(){
  if ($(this).attr('id') === 'browse-table-radio'){
    $('.browse-list-div').attr('aria-hidden', true);
    $('.browse-table-div').attr('aria-hidden', false);
  } else if ($(this).attr('id') === 'browse-list-radio') { // show list
    $('.browse-table-div').attr('aria-hidden', true);
    $('.browse-list-div').attr('aria-hidden', false);
  }
});

/**
 * Create a DataTable row
*/
function createRow(parsedResult) {
  //Create row
  var rowData = [
    parsedResult.Acronym,
    parsedResult.LongTitleText,
    parsedResult.LongDescription,
    parsedResult.DetailsBaseSoftwareCost,
    parsedResult.ModelScopeSpatialExtentDetail,
    parsedResult.ModelInputsTextArea,
    parsedResult.ModelOutputsModelVariablesTextArea
  ];
  //limit to 140 characters
  for (var i=0;i<rowData.length;i++){
     if (rowData[i].length > 140) {
      rowData[i] = rowData[i].substr(0, 140) + '...';
    }
  }
  return rowData;
}
/**
 * Add a row to a data table
*/
function addRow(parsedResult, tableId, rowData) {
  //add row
  $('#'+tableId).DataTable()
    .row.add(rowData)
    .draw()
    .nodes().to$()
    .addClass('result-row')
    .attr('data-read-id',parsedResult.READResourceIdentifier)
    .attr("id", 'saved-table-' + parsedResult.READResourceIdentifier)
    /*.click(function() {
      showDetails(parsedResult.READResourceIdentifier);
    })*/
    ;
}

/**
 * Remove the selected tools from the saved tools list
*/
function removeSelected(divID) {
  $('#'+divID +' input').each(function(){
    if ($(this).prop("checked")) {
      savedTools.removeTool($(this).val());
      $('#'+divID + ' > #' + divID + '-' + $(this).val()).remove();
      $('#saved-table').DataTable().row('#saved-table-'+$(this).val()).remove().draw();
    }
  });
}

/**
 * Removes all tools from saved tools
*/
function clearSaved(divID) {
  $('#'+divID +' input').each(function(){
    savedTools.removeTool($(this).val());
    $('#'+divID + ' > #' + divID + '-' + $(this).val()).remove();
  });
  var table = $('#saved-table').DataTable(); 
  table
    .clear()
    .draw();
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
 * Export the selected Saved tools from the saved tools list to a downloaded CSV
*/
function exportCSV(savedResultsDiv) {
  var records = $('#'+savedResultsDiv+' input:checked');
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
 * Saved all tools from the the tools table
*/
function saveAllRecords(table_reference) {
  var recordsToSave = $('#'+table_reference+' > tbody  > tr');
  recordsToSave.each(function() {
    if(!savedTools.contains($(this).attr('data-read-id'))) {
      savedTools.addTool($(this).attr('data-read-id'));
      //populate divs
      toolCache.handleParsedData($(this).attr('data-read-id'), savedTable.displayTool.bind(savedTable));
    }
  });
  if (savedTools.getLength() > 0) {
    $('#saved-tools-panel').attr("aria-hidden", false);
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
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
/**
 * Save all selected tools to the Saved Tools tab
*/
function saveSelectedRecords(resultsDiv) {
  var recordsToSave = $('#'+resultsDiv+' input:checked');
  recordsToSave.each(function() {
    if(!savedTools.contains($(this).val())) {
      savedTools.addTool($(this).val());
      //populate divs
      toolCache.handleParsedData($(this).val(), savedTable.displayTool.bind(savedTable));
    }
  });
  if (savedTools.getLength() > 0) {
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    $('#saved-tools-panel').attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
  }
}
