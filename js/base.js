var $ = jQuery;// ensure jquery gets where it's expected
var resourceSearchURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceSearch"; // URLs are provided without a query (data following ?) to build requests with; details at READ web services' docs-page
var resourceAdvancedSearchURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch"; // details at READ web services' docs-page
var resourceDetailURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail";

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
        $.support.cors = true; // needed for < IE 10 versions
        $.get(resourceDetailURL, {ResourceId:id}).done(
          function (data) {
            setData(id, parseResult(data));
            callback(getData(id));
          }
        );
      }
    },
    handleToolSet: function (toolSet, callback) {
      var readIds = Object.keys(toolSet.getToolSet());
      var requests = [];
      for (var i = 0; i < readIds.length; i++) {
        if (!cache.hasOwnProperty(readIds[i])) {
          requests.push(executeSearch(resourceDetailURL, {ResourceId:readIds[i]}));
        }
      }
      $.when.apply(null, requests).done(function () {
        if (arguments[1] === 'success') {
          var result = parseResult(arguments[0]);
          setData(result['ID'], result);
        } else { 
          for (var i = 0; i < arguments.length; i++) {
            var result = parseResult(arguments[i][0]);
            setData(result['ID'], result);
          }
        }
        callback(toolSet);
      });
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
      this.toolSet[toolId] = 1;
      this.length++;
    } else {
      this.toolSet[toolId]++;
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
  this.toolIsUnique = function (toolId) {
    if (this.getToolSet().hasOwnProperty(toolId)) {
      if (this.toolSet[toolId] === 1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  this.isEqual = function (toolSet) {
    if (toolSet.getLength() !== this.length) {
      return false;
    }
    for (var toolId1 in this.toolSet) {
      if (this.toolSet.hasOwnProperty(toolId1)) {
        if (!toolSet.getToolSet().hasOwnProperty(toolId1)) {
          return false;
        }   
      }
    }
    for (var toolId2 in toolSet.getToolSet()) {
      if (toolSet.getToolSet().hasOwnProperty(toolId2)) {
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
var ToolDisplay = function (tableId, listId, type) {
  this.toolSet = new ToolSet();
  this.tableId = tableId;
  this.listId = listId;
  this.type = type; // Not an optimal solution
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

ToolDisplay.prototype.getType = function () { // Not an optimal solution
  return this.type;
};


ToolDisplay.prototype.isDisplayed = function () {
  return this.displayed;
};

ToolDisplay.prototype.displayTool = function (data) {
  this.getToolSet().addTool(data['ID']);
  addRow(data, this.getTableId(), createRow(data));
  addDiv(data, this.getListId());
};

ToolDisplay.prototype.displayTools = function (toolSet) {
  this.toolSet = _.extend({}, toolSet); // do not create a reference to the toolSet object, copy it
  var html = '';
  var rows = [];
  for (var toolId in toolSet.getToolSet()) {
    html += createDiv(toolCache.getParsedData(toolId), this.getListId());
    rows.push(createRow(toolCache.getParsedData(toolId)));
  }
  $('#loader').attr('aria-hidden', 'true').hide();
  $("#" + this.getListId()).append(html);
  $("#" + this.getTableId()).DataTable().rows.add(rows).draw();
};

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
  var rowData;
  rowData = [ //Create row
    "",
    parsedResult['ID'],
    parsedResult['Acronym'],
    parsedResult['Title'],
    parsedResult['Description'],
    parsedResult['Cost'],
    parsedResult['Spatial Extent'],
    parsedResult['Model Inputs'],
    parsedResult['Output Variables'],
    parsedResult['Operating Environment'],
    parsedResult['Operating System'],
    parsedResult['Keywords'],
    parsedResult['Decision Sector'],
    parsedResult['Open Source']
  ];
  for (var i = 0; i < rowData.length; i++) { // limit to 140 characters
     if (rowData[i].length > 140) {
      rowData[i] = rowData[i].substr(0, 140) + '...';
    }
  }
  return rowData;
}

/**
 * Add a row to a DataTable
 */
function addRow(parsedResult, tableId, rowData) {
  var $row = $('#' + tableId).DataTable() // add row
    .row.add(rowData)
    .draw()
    .nodes().to$();
  $row.addClass('results-row')
    .attr('data-read-id', parsedResult['ID'])
    .attr('data-table-id', tableId)
    .attr("id", tableId + '-' + parsedResult['ID']);
    $row.children().not(':first').click(function () {
      showDetails(parsedResult['ID']);
    });
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
function showDetails(id, origin) {
  var parsedData = toolCache.getParsedData(id);
  if (resultTable.getType() === 'wizard') {
    var html = '<button class="button button-grey" onclick="$(' + "'#" + origin + "'" +').click()">Return to Tool List</button><div id="selected-tool-div" data-read-id="' + parsedData['ID'] + '">'; 
  } else {
    var html = '<button class="button button-grey" onclick="$(' + "'#" + origin + "'" +').click()">Return to Tool List</button><button class="button button-white right" onclick="saveRecord()">Save This Tool</button><div id="selected-tool-div" data-read-id="' + parsedData['ID'] + '">'; 
  }  
  var $tab = $("#selected-tool");
  try {
    $tab.empty();
  } catch (error) {
    console.log(error);
  }
  if (parsedData) {
    html += "<span class='bold'>Title</span>: " + parsedData['Title'] + "<br>"
    + "<span class='bold'>Acronym</span>: " + parsedData['Acronym'] + "<br>"
    + "<span class='bold'>Description</span>: " + parsedData['Description'] + "<br>"
    + "<span class='bold'>Ownership Type</span>: " + parsedData['Ownership Type'] + "<br>"
    + "<span class='bold'>Cost Details</span>: " + parsedData['Cost'] + "<br>"
    + "<span class='bold'>Other Costs</span>: " + parsedData['Other Costs'] + "<br>"
    + "<span class='bold'>Open Source</span>: " + parsedData['Open Source'] + "<br>"
    + "<span class='bold'>Decision Sector</span>: " + parsedData['Decision Sector'] + "<br>"
    + "<span class='bold'>Keywords</span>: " + parsedData['Keywords'] + "<br>"
    + "<span class='bold'>User Support Name</span>: " + parsedData['Support Name'] + "<br>"
    + "<span class='bold'>User Support Phone</span>: " + parsedData['Support Phone'] + "<br>"
    + "<span class='bold'>User Support Email</span>: " + parsedData['Support Email'] + "<br>"
    + "<span class='bold'>User Support Material</span>: " + parsedData['Support Materials'] + "<br>"
    + "<span class='bold'>URL</span>: " + parsedData['URL'] + "<br>"
    + "<span class='bold'>Current Phase</span>: " + parsedData['Life Cycle Phase'] + "<br>"
    + "<span class='bold'>Last Modified</span>: " + parsedData['Last Modified'] + "<br>"
    + "<span class='bold'>Operating Environment</span>: " + parsedData['Operating Environment'] + "<br>"
    + "<span class='bold'>Operating System</span>: " + parsedData['Operating System'] + "<br>"
    + "<span class='bold'>Model Inputs</span>: " + parsedData['Model Inputs'] + "<br>"
    + "<span class='bold'>Model Output Variables</span>: " + parsedData['Output Variables'] + "<br>"
    + "<span class='bold'>Model Evaluation</span>: " + "<span class='bold'></span>: "+parsedData['Model Evaluation'] + "<br>"
    + "<span class='bold'>Scope and Time Scale</span>: " + parsedData['Time Scale'] + "<br>"
    + "<span class='bold'>Spatial Extent</span>: " + parsedData['Spatial Extent'] + "<br>"
    + "<span class='bold'>Inputs Data Requirements</span>: " + parsedData['Input Data Requirements'] + "<br>"
    + "</div>";
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
  var filename = 'sustainable_community_tools.csv';
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
    if (window.navigator.msSaveOrOpenBlob) {
      var blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
      });
      navigator.msSaveBlob(blob, filename);
    } else {
      var link = document.createElement("a");
      link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
            if (record.hasOwnProperty(prop) && record.hasOwnProperty(csvHeader)) {
                names.push(prop.csvHeader);
            }
          }
          csvContent = names.join() + '\n';
        }
        for (var property in record) {
          if (record.hasOwnProperty(property) && record.hasOwnProperty(csvHeader)) {
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
 * Save all tools from the the tools table
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
 * Save tools from the the selected tool panel
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

/**
 * display details of parsedResult in container #containerId
 * dev aspiration: dynamically append spans and dynamically apply
 *                 .left class or .right class to each in order
 *                 to balance columns
 */
function addDiv(parsedResult, containerId) {
  // append READ-ID of a tool to URL below to point to details via the EPA's System of Registries 
  var prefixForExternalDetails = 'https://ofmpub.epa.gov/sor_internet/registry/systmreg/resourcedetail/general/description/description.do?infoResourcePkId=';
  var $container = $('#' + containerId);

  var html = '<div id="' + containerId + '-' + parsedResult['ID'] + '" class="list-div">'
    + '<div class="row" role="button">'
      + '<div class="col size-95of100">'
        + '<input class="results-checkbox" type="checkbox" id="' + containerId + '-cb-' + parsedResult['ID'] + '" value="' + parsedResult['ID'] + '"/>'
        + '<label for="' + containerId + '-cb-' + parsedResult['ID'] + '" class="results-label"></label>'
        + '<span class="bold">' + parsedResult['Title'] + ' (' + parsedResult['Acronym'] + ')</span>: ' + parsedResult['Description']
      + '</div>'
    + '</div>'
    + '<div class="row expand" data-container="' + containerId + '"  data-id="' + parsedResult['ID'] + '" tabindex="0">'
      + '<button class="col bold button-grey" id="expand-message-' + containerId + '-' + parsedResult['ID'] + '">Show Tool Details</button>'
      + '<div class="col accordion-result"></div>'
    + '</div>'
    + '<div class="row" id="additional-details-' + containerId + '-' + parsedResult['ID'] + '" style="display:none;">'
      + '<div class="col size-1of2">'
        + '<span class="bold">Contact Name</span>: ' + parsedResult['Support Name'] + '<br />'
        + '<span class="bold">Contact Email</span>: ' + parsedResult['Support Email'] + '<br />'
        + '<span class="bold">URL</span>: ' + parsedResult['URL'] + '<br />'
        + '<span class="bold">Internet Help Desk Phone</span>: ' + parsedResult['Help Desk Phone'] + '<br />'
        + '<span class="bold">Internet Help Desk Email</span>: ' + parsedResult['Help Desk Email'] + '<br />'
        + '<span class="bold">Lifecycle Phase</span>: ' + parsedResult['Life Cycle Phase'] + '<br />'
        + '<span class="bold">Last Modified</span>: ' + parsedResult['Last Modified'] + '<br />'
        + '<span class="bold">Operating Environment</span>: ' + parsedResult['Operating Environment'] + '<br />'
        + '<span class="bold">Operating System</span>: ' + parsedResult['Operating System'] + '<br />'
        + '<span class="bold">Other Technical Requirements</span>: ' + parsedResult['Other Requirements'] + '<br />'
        + '<span class="bold">Selected Concepts</span>: ' +  getSelectedConceptsAssociatedWithTool(parsedResult['ID']) + '<br />'
        + '<span class="bold">View Details Externally</span>: <a href="' + prefixForExternalDetails + parsedResult['ID'] + '" target="_blank">View Details Externally</a><br />'
        + '<span class="bold">Model Output Variables</span>: ' + parsedResult['Output Variables'] + '<br />'
      + '</div>'
      + '<div class="col size-1of2">'
        + '<span class="bold">Keywords</span>: ' + parsedResult['Keywords'] + '<br />'
        + '<span class="bold">Alternative Names</span>: ' + parsedResult['Other Costs'] + '<br />'
        + '<span class="bold">Ownership</span>: ' + parsedResult['Ownership Type'] + '<br />'
        + '<span class="bold">Software Cost</span>: ' + parsedResult['Cost'] + '<br />'
        + '<span class="bold">Other Cost</span>: ' + parsedResult['Other Costs'] + '<br />'
        + '<span class="bold">Open Source</span>: ' + parsedResult['Open Source'] + '<br />'
        + '<span class="bold">Decision Sector</span>: ' + parsedResult['Decision Sector'] + '<br />'
        + '<span class="bold">Support Materials</span>: ' + parsedResult['Support Materials'] + '<br />'
        + '<span class="bold">Model Evaluation</span>: ' + parsedResult['Model Evaluation'] + '<br />'
        + '<span class="bold">Model Time Scale</span>: ' + parsedResult['Time Scale'] + '<br />'
        + '<span class="bold">Spatial Extent</span>: ' + parsedResult['Spatial Extent'] + '<br />'
        + '<span class="bold">Data Requirements</span>: ' + parsedResult['Input Data Requirements'] + '<br />'
        + '<span class="bold">Model Inputs</span>: ' + parsedResult['Model Inputs'] + '<br />'
      + '</div>'
    + '</div>'
  + '</div>';

  $container.append(html);
}

/**
 * Creates the HTML to create a Display DIV and returns it
 *
 */
function createDiv(parsedResult, containerId) {
  // append READ-ID of a tool to URL below to point to details via the EPA's System of Registries 
  var prefixForExternalDetails = 'https://ofmpub.epa.gov/sor_internet/registry/systmreg/resourcedetail/general/description/description.do?infoResourcePkId=';
  var $container = $('#' + containerId);

  var html = '<div id="' + containerId + '-' + parsedResult['ID'] + '" class="list-div">'
    + '<div class="row" role="button">'
      + '<div class="col size-95of100">'
        + '<input class="results-checkbox" type="checkbox" id="' + containerId + '-cb-' + parsedResult['ID'] + '" value="' + parsedResult['ID'] + '"/>'
        + '<label for="' + containerId + '-cb-' + parsedResult['ID'] + '" class="results-label">'
        + '<span class="bold">' + parsedResult['Title'] + ' (' + parsedResult['Acronym'] + ')</span></label>: ' + parsedResult['Description']
      + '</div>'
    + '</div>'
    + '<div class="row expand" data-container="' + containerId + '"  data-id="' + parsedResult['ID'] + '" tabindex="0">'
      + '<button class="col bold button-grey" id="expand-message-' + containerId + '-' + parsedResult['ID'] + '">Show Tool Details</button>'
    + '</div>'
    + '<div class="row" id="additional-details-' + containerId + '-' + parsedResult['ID'] + '" style="display:none;">'
      + '<div class="col size-1of2">'
        + '<span class="bold">Contact Name</span>: ' + parsedResult['Support Name'] + '<br />'
        + '<span class="bold">Contact Email</span>: ' + parsedResult['Support Email'] + '<br />'
        + '<span class="bold">URL</span>: ' + parsedResult['URL'] + '<br />'
        + '<span class="bold">Internet Help Desk Phone</span>: ' + parsedResult['Help Desk Phone'] + '<br />'
        + '<span class="bold">Internet Help Desk Email</span>: ' + parsedResult['Help Desk Email'] + '<br />'
        + '<span class="bold">Lifecycle Phase</span>: ' + parsedResult['Life Cycle Phase'] + '<br />'
        + '<span class="bold">Last Modified</span>: ' + parsedResult['Last Modified'] + '<br />'
        + '<span class="bold">Operating Environment</span>: ' + parsedResult['Operating Environment'] + '<br />'
        + '<span class="bold">Operating System</span>: ' + parsedResult['Operating System'] + '<br />'
        + '<span class="bold">Other Technical Requirements</span>: ' + parsedResult['Other Requirements'] + '<br />'
        + '<span class="bold">Model Inputs</span>: ' + parsedResult['Model Inputs'] + '<br />'
        + '<span class="bold">Selected Concepts</span>: ' +  getSelectedConceptsAssociatedWithTool(parsedResult['ID']) + '<br />'
        + '<span class="bold">External Details</span>: <a href="' + prefixForExternalDetails + parsedResult['ID'] + '" target="_blank">View Details Externally</a><br />'
      + '</div>'
      + '<div class="col size-1of2">'
        + '<span class="bold">Keywords</span>: ' + parsedResult['Keywords'] + '<br />'
        + '<span class="bold">Alternative Names</span>: ' + parsedResult['Other Costs'] + '<br />'
        + '<span class="bold">Ownership</span>: ' + parsedResult['Ownership Type'] + '<br />'
        + '<span class="bold">Software Cost</span>: ' + parsedResult['Cost'] + '<br />'
        + '<span class="bold">Other Cost</span>: ' + parsedResult['Other Costs'] + '<br />'
        + '<span class="bold">Open Source</span>: ' + parsedResult['Open Source'] + '<br />'
        + '<span class="bold">Decision Sector</span>: ' + parsedResult['Decision Sector'] + '<br />'
        + '<span class="bold">Support Materials</span>: ' + parsedResult['Support Materials'] + '<br />'
        + '<span class="bold">Model Evaluation</span>: ' + parsedResult['Model Evaluation'] + '<br />'
        + '<span class="bold">Model Time Scale</span>: ' + parsedResult['Time Scale'] + '<br />'
        + '<span class="bold">Spatial Extent</span>: ' + parsedResult['Spatial Extent'] + '<br />'
        + '<span class="bold">Data Requirements</span>: ' + parsedResult['Input Data Requirements'] + '<br />'
        + '<span class="bold">Model Output Variables</span>: ' + parsedResult['Output Variables'] + '<br />'
      + '</div>'
    + '</div>'
  + '</div>';

  return html;
}

/**
 * On click listener for the expandable details section of the lists
 */
$('.list').on('click', '.expand', function () {
  var $this = $(this);
  var $container = $this.attr('data-container');
  var $id = $this.attr('data-id');
  $("#additional-details-" + $container + '-' + $id).toggle();
  $("#additional-details-" + $container + '-' + $id).css('display') == 'block' ? $('#expand-message-' + $container + '-' + $id).html('Hide Tool Details') : $('#expand-message-' + $container + '-' + $id).html('Show Tool Details');
  $this.find('.accordian-result').toggleClass('collapsible');
})

/**
 * map details of a result into accessible locations
 */
var parseResult = function (result) {
  if(typeof(result) === 'undefined') {
    return;
  }// catch bad input
  var openSourceMap = {// map integral data-standard to text
    1:'Yes',
    2:'No',
    3:'Partial'
  };
  var dataRequirementsMap = {// map integral data-standard to text
    1:'All data is provided.',
    2:'Data is publicly available.',
    3:'Data is not publicly available but routinely available.',
    4:'New data must be created.'
  };
  var softwareCostMap = {// map integral data-standard to text
    1:'Free',
    2:'$1-$499',
    3:'$500-$1499',
    4:'$1500-$3999',
    5:'>$4000'
  };
  var parsedResult = {};
  parsedResult['ID'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'READResourceIdentifier']);
  parsedResult['Title'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'LongTitleText']);
  parsedResult['Acronym'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'Acronym']);
  parsedResult['Description'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'LongDescription']);
  parsedResult['Support Name'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportName']);
  parsedResult['Support Email'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportEmail']);
  parsedResult['Support Phone'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportPhoneNumber']);
  parsedResult['Keywords'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'KeywordDetail', 'KeywordText']);
  //parsedResult.InfoResourceStewardTagText = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'TagDetail', 'InfoResourceStewardTagText']);
  parsedResult['URL'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'InternetDetail', 'URLText']);
  parsedResult['Help Desk Email'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'InternetDetail', 'HelpDeskEmailAddressText']);
  parsedResult['Help Desk Phone'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'InternetDetail', 'HelpDeskTelephoneNumber']);
  //parsedResult.RCSResources = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'RCSDetail', 'RCSResources']);
  parsedResult['Ownership Type'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'OwnershipTypeName']);
  parsedResult['Cost'] = parseSoftwareCost(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsBaseSoftwareCost']));
  parsedResult['Other Costs'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsOtherCostConsiderations']);
  parsedResult['Open Source'] = parseOpenSource(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsOpenSource']));
  parsedResult['Last Software Update'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsLastKnownSoftwareUpdate']);
  parsedResult['Decision Sector'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelScopeDetail', 'ModelScopeDecisionSector']);
  parsedResult['Support Materials'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportSourceOfSupportMaterials']);
  parsedResult['Life Cycle Phase'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'LifeCycleDetail', 'CurrentLifeCyclePhase']);
  parsedResult['Last Modified'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'LastModifiedDateTimeText']);
  //parsedResult.LastModifiedPersonName = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'LastModifiedPersonName']);
  parsedResult['Operating Environment'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'TechRequirementsDetail', 'TechReqOperatingEnvironmentDetail', 'OperatingEnvironmentName']);
  parsedResult['Operating System'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'TechRequirementsDetail', 'TechReqCompatibleOSDetail', 'OSName']);
  parsedResult['Other Requirements'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'TechRequirementsDetail', 'TechReqOtherReqDetail', 'OtherReqName']);
  parsedResult['Model Inputs'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelInputsDetail', 'ModelInputsTextArea']);
  parsedResult['Output Variables'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelOutputsDetail', 'ModelOutputsModelVariablesTextArea']);
  parsedResult['Model Evaluation'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelEvaluationDetail', 'ModelEvaluationTextArea']);
  parsedResult['Time Scale'] = parseTimeScale(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelScopeDetail', 'ModelScopeTimeScaleDetail']));
  parsedResult['Spatial Extent'] = parseSpatialExtent(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelScopeDetail', 'ModelScopeSpatialExtentDetail']));
  parsedResult['Input Data Requirements'] = parseDataRequirements(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelInputsDetail', 'ModelInputsDataRequirements']));

  /**
   * return decoded value(s) accumulated into a string
   * @param field{object} contains either object[propertyName] or object[0][propertyName]
   * @param propertyName{string} name of the property that holds the desired value
   * @param map{object} decode values with map[object[propertyName]] or map[object[0][propertyName]]
   * READ Web Services return one value if only one value exists. If several values then they're in an array.
   * There are various data-standards used in READ, like storing integers in place of strings for options.
   */
  function mapAll(field, propertyName, map) {//
    if (typeof propertyName !== 'undefined') {// arg propertyName passed?
      if (field[propertyName]) {return map[field[propertyName]];}// money-shot!
      if (field.length) {
        var accumulatedString = '';// append accumulated values here
        for (var i = 0; i < field.length - 1; i++) {
          if (typeof map === 'undefined') {// no arg map passed...
            accumulatedString += field[i][propertyName] + ', ';// ...accumulate ith value
          } else {// arg map was passed...
            accumulatedString += map[field[i]][propertyName] + ', ';// ...accumulate ith value
          }
        }
        if (typeof map === 'undefined') {// no arg map passed...
          accumulatedString += 'and ' + field[field.length - 1][propertyName];// ...accumulate final value
        } else {// arg map was passed...
          accumulatedString += 'and ' + map[field[field.length - 1][propertyName]];// ...accumulate final value
        }
        return accumulatedString;
      }
    } else {// no arg propertyName
      if (field) {return field;}
      if (field.length) {
        var accumulatedString = '';// append accumulated values here
        for (var i = 0; i < field.length - 1; i++) {
          if (typeof map === 'undefined') {// no arg map passed...
            accumulatedString += field[i] + ', ';// ...accumulate ith value
          } else {// arg map was passed...
            accumulatedString += map[field[i]] + ', ';// ...accumulate ith value
          }
        }
        if (typeof map === 'undefined') {// no arg map passed...
          accumulatedString += 'and ' + field[field.length - 1][propertyName];// ...accumulate final value
        } else {// arg map was passed...
          accumulatedString += 'and ' + map[field[field.length - 1][propertyName]];// ...accumulate final value
        }
        return accumulatedString;
      }
    }
  }

  // DOCUMENT
  function parseSpatialExtent(extent) {// possibly joins strings in an array
    if (extent.SpatialExtentName) {
      return extent.SpatialExtentName;
    }// return desired value if it is a property of extent
    if (extent.length) {// is array?(this means several values instead of just one)
      if (typeof extent === 'string') {
        return extent;
      }
      var str = '';// create string for appending each spatial extent to while looping through array
      for (var i = 0; i < extent.length - 1; i++) {// loop through all elements except last...
        if(extent.length > 2) {
          str += parseSpatialExtent(extent[i]) + ", ";//...append ith value and a delimiter. comma if more than 2 in list
        } else {
          str += parseSpatialExtent(extent[i]) + " ";//...append ith value and a delimiter just a space if only 2 in list
        }
      }
      str += 'and ' + parseSpatialExtent(extent[extent.length - 1]);//append final value
      return str; // return accumulated values in a string
    }
  }

  // DOCUMENT
  function parseOpenSource(openSource) {
    if(openSourceMap.hasOwnProperty(openSource)) {
      return openSourceMap[openSource];
    } else{
      return openSource;
    }
  }// requires decoding a data-standard; will be mapped in parseResult['Open Source']Map[INTEGER]

  // DOCUMENT
  function parseDataRequirements(dataRequirements) {// requires decoding a data-standard
    return dataRequirementsMap[dataRequirements];// do work
  }

  // DOCUMENT
  function parseSoftwareCost(softwareCost) {// requires decoding a data-standard
    if (softwareCostMap.hasOwnProperty(softwareCost)) {
      return softwareCostMap[softwareCost];// do work
    } else {
      return "No Data";
    }
  }

  // DOCUMENT
  function parseTimeScale(timeScale) {//all that apply
    if (timeScale.TimeScaleName) {
      return timeScale.TimeScaleName;
    }// return value if possible
    if (timeScale.length) {
      if (typeof timeScale === 'string') {
        return timeScale;
      }// if it's a string then return it
      var timeStr = '';
      for (var i = 0; i < timeScale.length - 1; i++) {// loop through all elements except last...
        timeStr += timeScale[i].TimeScaleName;//...append ith value and a delimiter
        if (timeScale.length > 2) {
          timeStr += ',';
        }// append comma when appropriate
        timeStr += ' ';
      }
      if (timeScale.length > 2) {
        timeStr += 'and ';
      }// append 'and ' when appropriate
      timeStr += timeScale[i].TimeScaleName;//append final value from array
      return timeStr; // return accumulated values in string
    }
  }
  return parsedResult;
};

/**
 * return selected concepts associated with given toolID
 */
var getSelectedConceptsAssociatedWithTool = function (toolID) {
  if (typeof readIDsByConcept !== 'undefined') {
    var selectedConceptsAssociatedWithTool = [];
    var selectedConcepts = $('input[name="concept-checkbox"]:checked');
    var toolConcepts = getToolConcepts(toolID);
    // build array of tool's associated concepts that are selected
    for (var i in selectedConcepts) {
      for (var j in toolConcepts) {
        if (selectedConcepts[i].value === toolConcepts[j]) {
          selectedConceptsAssociatedWithTool.push(selectedConcepts[i].value);
        }
      }
    }
    // return array of selected concepts associated with tool
    return selectedConceptsAssociatedWithTool.join(', ');
  } else {
    return "none";
  }
};

/**
 * collect all concepts related to toolId in readIDsByConept
 */
function getToolConcepts(toolId) {
  var concepts = [];
  for (var concept in readIDsByConcept) {
    if (readIDsByConcept.hasOwnProperty(concept)) {
      if (readIDsByConcept[concept].indexOf(toolId + '') !== -1) {
        concepts.push(concept);
      }
    }
  }
  return concepts;
}

/**
 * check existence of each prop_i in obj.prop_1...prop_n
 * @param object{object} test the properties of object
 * @param propertyArray{array} [prop_1,...,prop_n] s.t.
 *      object[prop_1][...][prop_n] is the desired value
 * E.G.: readSafe(obj,['foo','bar','baz'])
 * safely returns obj.foo.bar.baz value if all properties exist
*/
var readSafe = function (object, propertyArray) {
  if(object[propertyArray[0]]) {// is first element of propertyArray a property of this object?
    var value = validata(object[propertyArray[0]]);// oft-used value is sensibly extant
    if (Object.keys(propertyArray).length === 1) {// is this the last property in the array?
      if (value.length) {
        if (typeof value === 'string') {
          // scrape value for URLs with regex
          var urlRegExp = /((http|ftp|https):\/\/[^ @"]+|[^@]\b[^ @"]+\.(com|gov|edu|org|net|info|io)[^ @"]*)/ig;
          // create a template of how to format the URL into a descriptive anchor
          var linkTemplate = '<a href="$1" target="_blank">$1</a>';
          // insert exit notification if an external link
          if (value.indexOf('epa.gov') === -1) {
            exitNotification = '<a class="exit-disclaimer" href="https://www.epa.gov/home/exit-epa" title="EPA\'s External Link Disclaimer">Exit</a>';
            linkTemplate += exitNotification;
          }
          // replace all matched URLs with formatted anchors
          value = value.replace(urlRegExp, linkTemplate).toString();
          // create a sadly buggy regex to find emails
          var emailRegExp = /(\S+@\S+\.(gov|edu|com|org|net|info))/ig;
          // create a template of a mailto link
          var mailtoTemplate = '<a href="mailto:$1">$1</a>';
          // replace all email addresses in text with mailto links
          value = value.replace(emailRegExp, mailtoTemplate);
        }else{// has length and isn't a string? Let's access it as an array!
          try{// try accumulating a string from all elements
            accumulatedString = '';
            for (i in value) {
              iValue = value[i][propertyArray[0].replace('Detail', 'Name').replace('ModelScope','')];
              if (i > 0 && value.length > 2) {
                accumulatedString += ', ';
              }
              if (value.length === 2) {
                accumulatedString += ' ';
              }
              if (i === value.length - 1) {
                accumulatedString += 'and ';
              }
              accumulatedString += iValue;
            }
            return accumulatedString;
          }catch(error) {// if fail by err then warn about possible need of extension
            console.log('readSafe() erred and might need extended. Logging object, propertyArray, value:' + object + propertyArray + value);
          }finally{
          }
        }
      }
      return value;// return possibly formatted contents of property
    }else{// there are multiple elements remaining in propertyArray that we need to descend into
      try{
        // recursion with obj[prop_1] as obj for next iteration
        return readSafe(value,propertyArray.slice(1));// pass the second element through the last element of the property array
      }catch(e) {
        console.log('error: ',e);// dev
        return 'no data'; // return 'no data'
      }
    }
  }else{// first element propertyArray isn't a property of this object
    var accumulatedString = '';
    if (object.length && typeof(object).toLowerCase !== 'string') {
      for (i in object) {
        accumulatedString += object[i][propertyArray[0]];
        if (object.length - i > 1) {
          if (object.length > 2) {
            accumulatedString += ', ';
          }
          if (object.length === 2) {
            accumulatedString += ' ';
          }
          if (object.length - i === 2) {
            accumulatedString += 'and ';
          }
        }
      }
    return accumulatedString;
    }else{
      return 'no data'; // fail safely: return 'no data'
    }
  }
};

/**
 * check if object represents xsi:nil or unsanitized absence of data
 */
var isNil = function (obj) {
  return Boolean(
      typeof(obj) === 'undefined' ||
      obj.hasOwnProperty('xsi:nil') ||
      obj === null ||
      obj === '' ||
      String(obj).toLowerCase() === 'no data'
  );
};

/**
 * return 'no data' if obj is invalid data
 * return obj otherwise
 */
var validata = function (obj) {
  try{
    if(isNil(obj)) {
      return 'no data on file';
    }else{
      return obj;
    }
  }catch(e) {
    console.log('ERROR: validata() returned "no data" for' + obj + 'because it threw error' + e);
    return 'no data';
  }
};

/**
 * Check all the checkboxes in the specified location
*/
function selectAll(divId, callback) {
  $('#' + divId + ' input:checkbox').prop('checked', true)
    .promise()
    .done(function () {
      if(callback) {
        callback();
      }
    });
}

/**
 * Uncheck all the checkboxes in the specified location
*/
function deselectAll(divId, callback) {
  $('#' + divId + ' input:checkbox').prop('checked', false)
    .promise()
    .done(function () {
      if(callback) {
        callback();
      }
    });
}

function saveAll(divId) {
  $('#' + divId + ' input:checkbox').each(function () {
    savedTools.addTool($(this).val());
  });
}

function unsaveAll() {
  savedTools.reset();
}

/**
 * Execute get request on specified url and data
*/
var executeSearch = function (url, data) {
  $.support.cors = true; // needed for < IE 10 versions
  return $.ajax({
    type: 'GET',
    url: url,
    data: data
  });
};

// stopwords to use in testing
var stopWords = [
  "&","a","about","above","across","after","afterwards","again","against","all","almost","alone","along","already","also","although","always","am","among","amongst","amoungst","amount","an","and","another","any","anyhow","anyone","anything","anyway","anywhere","are","around","as","at","back","be","became","because","become","becomes","becoming","been","before","beforehand","behind","being","below","beside","besides","between","beyond","bill","both","bottom","but","by","call","can","cannot","cant","co","computer","con","could","couldnt","cry","de","describe","detail","do","done","down","due","during","each","eg","eight","either","eleven","else","elsewhere","empty","enough","etc","even","ever","every","everyone","everything","everywhere","except","few","fifteen","fify","fill","find","fire","first","five","for","former","formerly","forty","found","four","from","front","full","further","get","give","go","had","has","hasnt","have","he","hence","her","here","hereafter","hereby","herein","hereupon","hers","herself","him","himself","his","how","however","hundred","i","ie","if","in","inc","indeed","interest","into","is","it","its","itself","keep","last","latter","latterly","least","less","ltd","made","many","may","me","meanwhile","might","mill","mine","more","moreover","most","mostly","move","much","must","my","myself","name","namely","neither","never","nevertheless","next","nine","no","nobody","none","noone","nor","not","nothing","now","nowhere","of","off","often","on","once","one","only","onto","or","other","others","otherwise","our","ours","ourselves","out","over","own","part","per","perhaps","please","put","rather","re","same","see","seem","seemed","seeming","seems","serious","several","she","should","show","side","since","sincere","six","sixty","so","some","somehow","someone","something","sometime","sometimes","somewhere","still","such","system","take","ten","than","that","the","their","them","themselves","then","thence","there","thereafter","thereby","therefore","therein","thereupon","these","they","thick","thin","third","this","those","though","three","through","throughout","thru","thus","to","together","too","top","toward","towards","twelve","twenty","two","un","under","until","up","upon","us","very","via","was","we","well","were","what","whatever","when","whence","whenever","where","whereafter","whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","whoever","whole","whom","whose","why","will","with","within","without","would","yet","you","your","yours","yourself","yourselves"
];
