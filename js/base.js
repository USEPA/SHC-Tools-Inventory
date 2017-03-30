$ = jQuery;// ensure jquery gets where it's expected

/**
 * toolCache Object
*/
var toolCache = (function () {
  var cache = {};

  function setData(id, data) {
    cache[id] = data;
  }

  function getData(id) {
    if (cache.hasOwnProperty(id)) {
      return cache[id];
    }
  }

  return { // public interface
    handleParsedData: function (id, callback) {
      if (cache.hasOwnProperty(id)) {
        callback(getData(id));
      } else {
        $.get(resourceDetailURL, {ResourceId:id}).done(function (data) {
          setData(id, parseResult(data));
          callback(getData(id));
        });
      }
    },
    /**
     * WIP 
    */
    handleToolSet: function (toolSet, callback) {
      var readIds = Object.keys(toolSet.getToolSet());
      for (var i = 0; i < readIds.length; i++) {
        if (cache.hasOwnProperty(readIds[i])) {
          callback(getData(readIds[i]));
        } else {
          $.get(resourceDetailURL, {ResourceId:readIds[i]}).done(function (data) {
            setData(readIds[i], parseResult(data));
            callback(getData(readIds[i]));
          });
        }
      }
    },
    getParsedData: function (id) {
      if (cache.hasOwnProperty(id)) {
        return getData(id);
      } else {
        return null;
      }
    },
    getCache : function () {
      return cache;
    }
  };
})();

/**
 * ToolSet Object
*/
function ToolSet() {
  this.toolSet = {};
  this.length = 0;
  this.getToolSet = function () {
    return this.toolSet;
  };
  this.getLength = function () {
    return this.length;
  };
  this.addTool = function (toolId) {
    if (!this.getToolSet().hasOwnProperty(toolId)) {
      this.toolSet[toolId] = true;
      this.length++;
    }
  };
  this.removeTool = function (toolId) {
    if (this.getToolSet().hasOwnProperty(toolId)) {
      delete this.toolSet[toolId];
      this.length--;
    }
  };
  this.contains = function (toolId) {
    if (this.getToolSet().hasOwnProperty(toolId)) {
      return true;
    } else {
      return false;
    }
  };
  this.isEqual = function (toolSet) {
    for (var toolId1 in this.toolSet) {
      if (this.toolSet.hasOwnProperty(toolId1)) {
        if (!toolSet.hasOwnProperty(toolId1)) {
          return false;
        }   
      }
    }
    for (var toolId2 in toolSet) {
      if (toolSet.hasOwnProperty(toolId2)) {
        if (!this.toolSet.hasOwnProperty(toolId2)) {
          return false;
        }   
      }
    }
    return true;
  };
  this.reset = function () {
    this.toolSet = {};
    this.length = 0;
    this.displayed = false;
  };
}

/**
 * ToolDisplay Object
*/
var ToolDisplay = function (tableId, listId) {
  this.toolSet = new ToolSet();
  this.tableId = tableId;
  this.listId = listId;
};

ToolDisplay.prototype.getToolSet = function () {
  return this.toolSet;
};

ToolDisplay.prototype.getTableId = function () {
  return this.tableId;
};

ToolDisplay.prototype.getListId = function () {
  return this.listId;
};

ToolDisplay.prototype.isDisplayed = function () {
  return this.displayed;
};

ToolDisplay.prototype.displayTool = function (data) {
  this.getToolSet().addTool(data.READResourceIdentifier);
  addRow(data, this.getTableId(), createRow(data));
  addDiv(data, this.getListId());
};

ToolDisplay.prototype.displayToolSet = function (toolSet) {
  console.log("this.toolSet");
  console.log(this.toolSet);
  console.log("toolSet");
  console.log(toolSet);
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
$('[name="display-type"]').change(function () {
  if($(this).attr('id') === 'table-radio') {
    $('#results-list-div').attr('aria-hidden', true);
    $('#results-table-div').attr('aria-hidden', false);
    $('#results-table').DataTable().columns.adjust().draw(); // adjust table cols to the width of the container
  } else if ($(this).attr('id') === 'list-radio') {
    $('#results-table-div').attr('aria-hidden', true);
    $('#results-list-div').attr('aria-hidden', false);
  }
});

/** DEPRECATED if no longer using Saved Tools tab
 * Toggle saved table or list display styles
*/
$('[name="saved-display-type"]').change(function () {
  if ($(this).attr('id') === 'saved-table-radio') {
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
$('[name="browse-display-type"]').change(function () {
  if ($(this).attr('id') === 'browse-table-radio') {
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
  var rowData = [ //Create row
    parsedResult.Acronym,
    parsedResult.LongTitleText,
    parsedResult.LongDescription,
    parsedResult.DetailsBaseSoftwareCost,
    parsedResult.ModelScopeSpatialExtentDetail,
    parsedResult.ModelInputsTextArea,
    parsedResult.ModelOutputsModelVariablesTextArea,
    parsedResult.OperatingEnvironmentName,
    parsedResult.OSName,
    parsedResult.KeywordText,
    parsedResult.ModelScopeDecisionSector,
    parsedResult.DetailsOpenSource
  ];
  for (var i = 0; i < rowData.length; i++) { //limit to 140 characters
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
  $('#' + tableId).DataTable() //add row
    .row.add(rowData)
    .draw()
    .nodes().to$()
    .addClass('result-row')
    .attr('data-read-id', parsedResult.READResourceIdentifier)
    .attr("id", tableId + '-' + parsedResult.READResourceIdentifier)
    /*.click(function () {
      showDetails(parsedResult.READResourceIdentifier);
    })*/
    ;
}

/** DEPRECATED if no longer using Saved Tools tab
 * Remove the selected tools from the saved tools list
*/
function removeSelected(divID) {
  $('#' + divID + ' input').each(function () {
    if ($(this).prop("checked")) {
      savedTools.removeTool($(this).val());
      $('#' + divID + ' > #' + divID + '-' + $(this).val()).remove();
      $('#saved-table').DataTable().row('#saved-table-' + $(this).val()).remove().draw();
    }
  });
}

/** DEPRECATED if no longer using Saved Tools tab
 * Removes all tools from saved tools
*/
function clearSaved(divID) {
  $('#' + divID + ' input').each(function () {
    savedTools.removeTool($(this).val());
    $('#' + divID + ' > #' + divID + '-' + $(this).val()).remove();
  });
  var table = $('#saved-table').DataTable(); 
  table.clear().draw();
}

/** DEPRECATED if no longer using Selected Tools tab
 * Refactored code to display the selected tool data
*/
function showDetails(id) {
  var parsedData = toolCache.getParsedData(id);
  var html = '<div id="selected-tool-div" data-read-id="' + parsedData.READResourceIdentifier + '">'; 
  var $tab = $("#selected-tool");
  try {
    $tab.empty();
  } catch (error) {
    console.log(error);
  }
  if (parsedData) {
    html += "<span class='bold'>Title</span>: " + parsedData.LongTitleText + "<br>";
    html += "<span class='bold'>Acronym</span>: " + parsedData.Acronym + "<br>";
    html += "<span class='bold'>Description</span>: " + parsedData.LongDescription + "<br>";
    html += "<span class='bold'>Ownership Type</span>: " + parsedData.OwnershipTypeName + "<br>";
    html += "<span class='bold'>Cost Details</span>: " + parsedData.DetailsBaseSoftwareCost + "<br>";
    html += "<span class='bold'>Other Costs</span>: " + parsedData.DetailsOtherCostConsiderations + "<br>";
    html += "<span class='bold'>Open Source</span>: " + parsedData.DetailsOpenSource + "<br>";
    html += "<span class='bold'>Decision Sector</span>: " + parsedData.ModelScopeDecisionSector + "<br>";
    html += "<span class='bold'>Keywords</span>: " + parsedData.KeywordText + "<br>";
    html += "<span class='bold'>User Support Name</span>: " + parsedData.UserSupportName + "<br>";
    html += "<span class='bold'>User Support Phone</span>: " + parsedData.UserSupportPhoneNumber + "<br>";
    html += "<span class='bold'>User Support Email</span>: " + parsedData.UserSupportEmail + "<br>";
    html += "<span class='bold'>User Support Material</span>: " + parsedData.UserSupportSourceOfSupportMaterials + "<br>";
    html += "<span class='bold'>URL</span>: " + parsedData.URLText + "<br>";
    html += "<span class='bold'>Current Phase</span>: " + parsedData.CurrentLifeCyclePhase + "<br>";
    html += "<span class='bold'>Last Modified</span>: " + parsedData.LastModifiedDateTimeText + "<br>";
    html += "<span class='bold'>Operating Environment</span>: " + parsedData.OperatingEnvironmentName + "<br>";
    html += "<span class='bold'>Operating System</span>: " + parsedData.OSName + "<br>";
    html += "<span class='bold'>Model Inputs</span>: " + parsedData.ModelInputsTextArea + "<br>";
    html += "<span class='bold'>Model Output Variables</span>: " + parsedData.ModelOutputsModelVariablesTextArea + "<br>";
    html += "<span class='bold'>Model Evaluation</span>: " + "<span class='bold'></span>: "+parsedData.ModelEvaluationTextArea + "<br>";
    html += "<span class='bold'>Scope and Time Scale</span>: " + parsedData.ModelScopeTimeScaleDetail + "<br>";
    html += "<span class='bold'>Spatial Extent</span>: " + parsedData.ModelScopeSpatialExtentDetail + "<br>";
    html += "<span class='bold'>Inputs Data Requirements</span>: " + parsedData.ModelInputsDataRequirements + "<br>";
    html += "</div>";
    $tab.append(html);
    $('#selected-tool-tab').parent().attr('aria-hidden', false);
    $('#selected-tool-panel').attr('aria-hidden', false);
    $("#selected-tool-tab").click();
    $("#selected-tool-tab").focus();
  } else {
    $tab.append(html);
    $('#selected-tool-tab').parent().attr('aria-hidden', true);
    $('#selected-tool-panel').attr('aria-hidden', true);
  }
}

/**
 * Export the selected (check marked) tools from the tools list to a downloaded CSV
*/
function exportCSV(resultsDiv) {
  var records = $('#' + resultsDiv + ' input:checked');
  if (records.length > 0) {
    var csvContent = '';
    var names = [];
    var values;
    records.each(function () {
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

/** DEPRECATED if no longer exporting all instead of just the selected tools
 * Export all tools from the tools table to a downloaded CSV
*/
function exportAllCSV(resultsDiv) {
  var records = $('#' + resultsDiv + ' input');
  if (records.length > 0) {
    var csvContent = '';
    var names = [];
    var values;
    records.each(function () {
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

/** DEPRECATED if no longer using Saved Tools tab
 * Saved all tools from the the tools table
*/
function saveAllRecords(table_reference) {
  var recordsToSave = $('#' + table_reference + ' > tbody  > tr');
  recordsToSave.each(function () {
    if(!savedTools.contains($(this).attr('data-read-id'))) {
      savedTools.addTool($(this).attr('data-read-id'));
      toolCache.handleParsedData($(this).attr('data-read-id'), savedTable.displayTool.bind(savedTable)); // populate divs
    }
  });
  if (savedTools.getLength() > 0) {
    $('#saved-tools-panel').attr("aria-hidden", false);
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
  }
}

/** DEPRECATED if no longer using Saved Tools tab
 * Saved tools from the the selected tool panel
*/
function saveRecord() {
  var recordIdToSave = $('#selected-tool-div').attr('data-read-id');
  if(!savedTools.contains(recordIdToSave)) {
    savedTools.addTool(recordIdToSave);
    toolCache.handleParsedData(recordIdToSave, savedTable.displayTool.bind(savedTable)); // populate divs
  }
  if (savedTools.getLength() > 0) {
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
    $('#saved-tools-panel').attr("aria-hidden", false);
  }
}

/** DEPRECATED if no longer using Saved Tools tab
 * Save all selected tools to the Saved Tools tab
*/
function saveSelectedRecords(resultsDiv) {
  var recordsToSave = $('#' + resultsDiv + ' input:checked');
  recordsToSave.each(function () {
    if(!savedTools.contains($(this).val())) {
      savedTools.addTool($(this).val()); 
      toolCache.handleParsedData($(this).val(), savedTable.displayTool.bind(savedTable)); // populate divs
    }
  });
  if (savedTools.getLength() > 0) {
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    $('#saved-tools-panel').attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
  }
}
