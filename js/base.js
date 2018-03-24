var $ = jQuery;// ensure jquery gets where it's expected
var resourceSearchURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceSearch"; // URLs are provided without a query (data following ?) to build requests with; details at READ web services' docs-page
var resourceAdvancedSearchURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch"; // details at READ web services' docs-page
var resourceDetailURL = "https://ofmpub.epa.gov/readwebservices/v1/ResourceDetail";

/**
 * toolCache Object
*/
var toolCache = (function () {
  var cache = {};

  /**
   * Stores parsed data for a tool ID
   * @private @function
   * @param {string} id - The ID of the tool.
   * @param {object} data - The parsed data.
   */
  function setData(id, data) {
    cache[id] = {};
    cache[id]['data'] = data; // store the parsed data by the tool ID
    cache[id]['date'] = Date.now(); // store the parsed data by the tool ID
  }

  /**
   * Copies the specified data to the cache
   * @private @function
   * @param {string} id - The ID of the tool.
   * @param {object} data - The parsed data.
   */
  function copyData(id, data) {
    cache[id] = {};
    cache[id]['data'] = data.data; // store the parsed data by the tool ID
    cache[id]['date'] = data.date; // store the parsed data by the tool ID
  }

  /**
   * Sets the cache to the specified cache
   * @private @function
   * @param {object} newCache - The new data to set as cache.
   */
  function setCache(newCache) {
    cache = newCache;
  }

  /**
   * Checks if the cache contains the specified ID.
   * @private @function
   * @param {string} id - The ID of the tool.
   */
  function contains(id) {
    if (cache.hasOwnProperty(id)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Get data for a particular ID
   * @private @function
   * @param {string} id - The ID of the tool.
   * @return {object} - The parsed data.
   */
  function getData(id) {
    if (cache.hasOwnProperty(id)) {
      return cache[id]['data']; // return the data for a tool ID
    }
  }

  return { // public interface
    /**
     * Gets (or retrieves for the first time) and handles the parsed data
     * @function
     * @param {string} id - The ID of the tool.
     * @param {function} callback - The function which will handle the parsed data.
     */
    handleParsedData: function (id, callback) {
      if (cache.hasOwnProperty(id)) {
        callback(getData(id)); // run the passed in function on the parsed data for the Tool ID
      } else {
        $.support.cors = true; // needed for < IE 10 versions
        $.get(resourceDetailURL, {ResourceId:id}).done( // if we don't have the data, get the data and then run the passed in function
          function (data) {
            setData(id, parseResult(data)); // store the data in cache
            localStorageSetItem('toolCache', cache);          
            callback(getData(id)); // run the passed in function
          }
        );
      }
    },

    /**
     * Gets the data for a toolSet (or retrieves it for the first time) and then handles it.
     * @function
     * @param {object} toolSet - The ToolSet.
     * @param {function} data - The function that will handle the ToolSet data.
     */
    handleToolSet: function (toolSet, callback) {
      var readIds = Object.keys(toolSet.getToolSet());
      var requests = [];
      for (var i = 0; i < readIds.length; i++) {
        if (!cache.hasOwnProperty(readIds[i]) || (Date.now() - cache[readIds[i]]['date']) > 86400000) { // if the tool isn't in the cache or if the data is > 24 hours old request new data
          requests.push(executeSearch(resourceDetailURL, {ResourceId:readIds[i]}));
        }
      }
      /*
        .apply allows for variable parameters stored in an array
        .when then waits for the array of promises to be resolved
        .done then executes when all those promises are resolved
        arguments allows for the variable number of arguments to be accessed
      */
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
        localStorageSetItem('toolCache', cache);
        callback(toolSet);
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $('#loader').attr('aria-hidden', 'true').hide();
        toast({html: 'Could not load results. Try again later.', close: true});
      });
    },

    /**
     * Returns the parsed data for a tool ID.
     * @function
     * @param {string} - The tool ID.
     * @return {object|null} - The parsed data, or null.
     */
    getParsedData: function (id) {
      if (cache.hasOwnProperty(id)) {
        return getData(id);
      } else {
        return null;
      }
    },

    /**
     * Returns the ToolCache object.
     * @function
     * @return {object} - ToolCache.
     */
    getCache : function () {
      return cache;
    },

    /**
     * Load a data cache
     * @function
     * @param {object} newCache - The new data.
     */
    loadCache : function (newCache) {
      setCache(newCache);
    },

    /**
     * Update the cache with data from localStorage
     * @function
     */
    updateCache : function () {
      cachedToolCache = JSON.parse(localStorage.getItem('toolCache'));
      for (toolID in cachedToolCache) {
        if (!cache.hasOwnProperty(toolID) || cache[toolID].date < cachedToolCache[toolID].date) { //copy LS data if not in cache or is older in cache
          copyData(toolID, cachedToolCache[toolID]);
        }
      }
    }
  };
})();

/**
 * Represents a ToolSet.
 * @constructor
 */
function ToolSet() {
  this.toolSet = {};
  this.length = 0;

  /**
   * Returns the ToolSet
   * @function
   * @return {object} - The ToolSet.
   */
  this.getToolSet = function () {
    return this.toolSet;
  };

  /**
   * Returns the number of tools in the ToolSet
   * @function
   * @return {number} - The number of tools.
   */
  this.getLength = function () {
    return this.length;
  };

  /**
   * Returns whether the ToolSet has a filter or not
   * @function
   * @return {bool} - The presence of filters.
   */
  this.hasFilters = function () {
    return Object.keys(this.filters).length !== 0;
  };

  /**
   * Adds a tool to the ToolSet. If it is already there, it increments the count of that tool.
   * @function
   * @param {string} toolId - The id of the tool.
   */
  this.addTool = function (toolId) {
    if (!this.getToolSet().hasOwnProperty(toolId)) {
      this.toolSet[toolId] = 1;
      this.length++;
    } else {
      this.toolSet[toolId]++;
    }
  };

  /**
   * Removes a tool from the ToolSet
   * @function
   * @param {string} toolId - The ID of the tool.
   */
  this.removeTool = function (toolId) {
    if (this.getToolSet().hasOwnProperty(toolId)) {
      delete this.toolSet[toolId];
      this.length--;
    }
  };

  /**
   * Checks if the ToolSet contains the specified Tool ID
   * @function
   * @param {string} toolId - The ID of the tool.
   * @return {bool} - The presense of the tool.
   */
  this.contains = function (toolId) {
    if (this.getToolSet().hasOwnProperty(toolId)) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Checks if the Tool is unique.
   * @function
   * @param {string} toolId - The ID of the tool.
   * @return {bool} - The presenece of a unique tool.
   */
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

  /**
   * Checks if the ToolSet is equal to the passed in ToolSet.
   * @function
   * @param {object} toolSet - A ToolSet.
   * @return {bool} - The presense of an equal ToolSet.
   */
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

  /**
   * Resets the ToolSet to the default state.
   * @function
   */
  this.reset = function () {
    this.toolSet = {};
    this.length = 0;
    this.displayed = false;
  };
}

/**
 * Represents a ToolDisplay.
 * @constructor
 * @param {string} tableId - The id of the table container.
 * @param {string} listId - The id of the list container.
 * @param {string} type - The type of app.
 */
var ToolDisplay = function (tableId, listId, type) {
  this.toolSet = new ToolSet();
  this.tableId = tableId;
  this.listId = listId;
  this.type = type; // Not an optimal solution
};

/**
 * Returns the ToolSet object tied to the ToolDisplay
 * @function
 * @return {object} - The ToolSet
 */
ToolDisplay.prototype.getToolSet = function () {
  return this.toolSet;
};

/**
 * Returns the ID of the table tied to this Display
 * @function
 * @return {string} - The ID of the container holding the table.
 */
ToolDisplay.prototype.getTableId = function () {
  return this.tableId;
};

/**
 * Returns the ID of the list tied to this Display
 * @function
 * @return {string} - The ID of the container holding the list.
 */
ToolDisplay.prototype.getListId = function () {
  return this.listId;
};

/**
 * Returns the type of app the display is used on.
 * @function
 * @return {string} - The type of app being used.
 */
ToolDisplay.prototype.getType = function () { // Not an optimal solution
  return this.type;
};

/**
 * Displays the specified data in a DataTable row and a div in the list.
 * @function
 * @param {object} data - The data for the tool to be displayed
 */
ToolDisplay.prototype.displayTool = function (data) {
  this.getToolSet().addTool(data['ID']);
  addRow(data, this.getTableId(), createRow(data));
  addDiv(data, this.getListId());
};

/**
 * Displays an entire ToolSet in the DataTable and List container tied to this Display.
 * @function
 * @param {object} toolSet - The ToolSet to be displayed.
 */
ToolDisplay.prototype.displayTools = function (toolSet) {
  var html = '';
  var rows = [];

  function sort(obj) {
    return Object.keys(obj).sort(function(a, b) {
      return obj[b] - obj[a];
    });
  }

  var sorted = sort(toolSet.getToolSet());

  for (var i = 0; i < sorted.length; i++) {
  	if (!this.toolSet.contains(sorted[i])) {
  		this.toolSet.addTool(sorted[i]);
  		html += createDiv(toolCache.getParsedData(sorted[i]), this.getListId());
    	rows.push(createRow(toolCache.getParsedData(sorted[i])));
  	}
  }

  $('#loader').attr('aria-hidden', 'true').hide();
  $("#" + this.getListId()).append(html);
  if ($.fn.DataTable.isDataTable("#" + this.getTableId())) {
    $("#" + this.getTableId()).DataTable().rows.add(rows).draw();
  }
  if ($.fn.DataTable.isDataTable("#" + this.getTableId())) {
    $("#" + this.getTableId()).DataTable().columns.adjust(); // adjust table cols to the width of the container
  }
};

/**
 * Toggle result table or list display styles
 * @listens change
 */
$('[name="display-type"]').change(function () {
  if ($(this).attr('id') === 'table-radio') {
    $('#results-list-div').attr('aria-hidden', true);
    $('#results-table-div').attr('aria-hidden', false);
    if ($.fn.DataTable.isDataTable('#results-table')) {
      $('#results-table').DataTable().columns.adjust(); // adjust table cols to the width of the container
    }
  } else if ($(this).attr('id') === 'list-radio') {
    $('#results-table-div').attr('aria-hidden', true);
    $('#results-list-div').attr('aria-hidden', false);
  }
});

/**
 * Toggle saved table or list display styles
 * @listens change
 */
$('[name="saved-display-type"]').change(function () {
  if ($(this).attr('id') === 'saved-table-radio') {
    $('#saved-list-div').attr('aria-hidden', true);
    $('#saved-table-div').attr('aria-hidden', false);
    if ($.fn.DataTable.isDataTable('#saved-table')) {
      $('#saved-table').DataTable().columns.adjust(); // adjust table cols to the width of the container
    }
  } else if ($(this).attr('id') === 'saved-list-radio') { // show list
    $('#saved-table-div').attr('aria-hidden', true);
    $('#saved-list-div').attr('aria-hidden', false);
  }
});

/**
 * Toggle browse table or list display styles
 * @listens change
 */
$('[name="browse-display-type"]').change(function () {
  if ($(this).attr('id') === 'browse-table-radio') {
    $('.browse-list-div').attr('aria-hidden', true);
    $('.browse-table-div').attr('aria-hidden', false);
    if ($.fn.DataTable.isDataTable('#building-infrastructure-table')) {
      $('#building-infrastructure-table').DataTable().columns.adjust(); // adjust table cols to the width of the container
    }
    if ($.fn.DataTable.isDataTable('#land-use-table')) {
      $('#land-use-table').DataTable().columns.adjust(); // adjust table cols to the width of the container
    }
    if ($.fn.DataTable.isDataTable('#waste-management-table')) {
      $('#waste-management-table').DataTable().columns.adjust(); // adjust table cols to the width of the container
    }
    if ($.fn.DataTable.isDataTable('#transportation-table')) {
      $('#transportation-table').DataTable().columns.adjust(); // adjust table cols to the width of the container
    }
  } else if ($(this).attr('id') === 'browse-list-radio') { // show list
    $('.browse-table-div').attr('aria-hidden', true);
    $('.browse-list-div').attr('aria-hidden', false);
  }
});

/**
 * Creates an array for use in creating a DataTable row.
 * @function
 * @param {object} parsedResult - The parsed data of a tool.
 * @return {array} - The array to be used to create the row.
 */
function createRow(parsedResult) {
  var rowData;
  rowData = [ //Create row
    "",
    parsedResult['ID'],
    '<span class="bold">' + (parsedResult['Title'].substr(0, 15) === parsedResult['Acronym'] ? parsedResult['Title'] : parsedResult['Title'] + ' (' + parsedResult['Acronym'] + ')') + '</span><br /><button class="col button-grey" onclick="showDetails(' + parsedResult['ID'] + ', this)">Tool Details</button>',
    parsedResult['Description'],
    parsedResult['Operating Environment'],
    parsedResult['Spatial Extent'],
    parsedResult['Decision Sector'],
    parsedResult['BaseCost'],
    parsedResult['AnnualCost'],
    parsedResult['Other Cost Considerations'],
    parsedResult['URL'],
    parsedResult['Life Cycle Phase'],
    parsedResult['Open Source'],
    parsedResult['Operating System'],
    parsedResult['Other Requirements'],
    parsedResult['Time Scale'],
    parsedResult['Technical Skills Needed'],
    parsedResult['Model Structure'],
    parsedResult['Model Inputs'],
    parsedResult['Input Data Requirements'],
    parsedResult['Model Output Types'],
    parsedResult['Output Variables'],
    parsedResult['Model Evaluation'],
    parsedResult['Keywords'],
    parsedResult['Support Name'],
    parsedResult['Support Phone'],
    parsedResult['Support Email'],
    parsedResult['Support Materials']
  ];
  for (var i = 0; i < rowData.length; i++) { // limit to 140 characters
    if (rowData[i].length > 280) {
      rowData[i] = rowData[i].substr(0, 280) + '...';
    }
  }
  return rowData;
}

/**
 * Adds a row to a DataTable.
 * @function
 * @param {object} parsedResult - The parsed data of a tool.
 * @param {string} tableId - The id of a table container.
 * @param {array} rowData - The array used for creating a row.
 */
function addRow(parsedResult, tableId, rowData) {
  if ($.fn.DataTable.isDataTable('#' + tableId)) {
    var $row = $('#' + tableId).DataTable() // add row
      .row.add(rowData)
      .draw()
      .nodes().to$();
    $row.addClass('results-row')
      .attr('data-read-id', parsedResult['ID'])
      .attr('data-table-id', tableId)
      .attr("id", tableId + '-' + parsedResult['ID']);
  }
}

/**
 * Remove the selected tool from the specified tools list.
 * @function
 * @param {string} divID - The ID of the tool to remove.
 */
function removeSelected(divID) {
  var $recordsToRemove = $('#' + divID + ' input:checked');
  if (!$recordsToRemove.length) {
    toast({html: 'Please select tools to remove.', close: true});
    return;
  }
  $recordsToRemove.each(function () {
    savedTools.removeTool($(this).val());
    savedTable.getToolSet().removeTool($(this).val()); //remove tool from saved tool display tool set
    $('#' + divID + ' > #' + divID + '-' + $(this).val()).remove();
  });
  localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
  if ($.fn.DataTable.isDataTable('#saved-table')) {
    $('#saved-table').DataTable().rows('.selected').remove().draw();
  }
  if (savedTools.length < 1) {
    $('#saved-tools-tab').parent().attr("aria-hidden", true);
    $('#saved-tools-panel').attr("aria-hidden", true);
    $('#tabs-nav > li').children().first().click();
  }
}

/**
 * Display the additional Tool data in the Selected Tool tab.
 * @function
 * @param {string} id - The tool ID.
 * @param {string} origin - The ID of the perviously selected tab.
 */
function showDetails(id, that) {
  var origin = $(that).closest('[role="tabpanel"]').attr('aria-labelledby');
  var parsedData = toolCache.getParsedData(id);
  var html = '';
  if (resultTable.getType() === 'wizard' || savedTools.contains(id)) {
    html = '<button class="button button-grey" onclick="$(' + "'#" + origin + "'" +').attr(\'aria-selected\', true);$(\'#selected-tool-tab\').attr(\'aria-selected\', false);$(' + "'#" + origin + "'" +')[0].click();">Return to Tool List</button><div id="selected-tool-div" data-read-id="' + parsedData['ID'] + '">';
  } else {
    html = '<button class="button button-grey" onclick="$(' + "'#" + origin + "'" +').attr(\'aria-selected\', true);$(\'#selected-tool-tab\').attr(\'aria-selected\', false);$(' + "'#" + origin + "'" +')[0].click();">Return to Tool List</button><button class="button button-white right" onclick="saveRecord()">Save This Tool</button><div id="selected-tool-div" data-read-id="' + parsedData['ID'] + '">';
  }
  var $tab = $("#selected-tool");
  try {
    $tab.empty();
  } catch (error) {
    console.log(error);
  }
  var $selectedToolTab = $('#selected-tool-tab');
  var $selectedToolPanel = $('#selected-tool-panel');
  if (parsedData) {
    html = createDetailedView(parsedData, html);
    $tab.append(html);
    $selectedToolPanel.removeAttr('aria-hidden');
    $('#' + origin).attr('aria-selected', false);
    $selectedToolTab.parent().removeAttr('aria-hidden');
    $selectedToolTab.removeAttr('aria-disabled');
    $selectedToolTab.removeAttr('aria-hidden');
    $selectedToolTab.attr('aria-selected', true);
    $selectedToolTab[0].click();
  } else {
    $tab.append(html);
    $selectedToolTab.parent().attr('aria-hidden', true);
    $selectedToolPanel.attr('aria-hidden', true);
  }
}

function createDetailedView(parsedData, html) {
  html += "" +
    '<div class="light-gray">' +
      "<span class='bold'>Title</span></strong>: " + (parsedData['Title'].substr(0, 15) === parsedData['Acronym'] ? parsedData['Title'] : parsedData['Title'] + ' (' + parsedData['Acronym'] + ')') + '<br>' +
      "<span class='bold'>Description</span></strong>: " + parsedData['Description'] + "<br>" +
      "<span class='bold'>Alternate Names</span></strong>: " + parsedData['Alternate Names'] + "<br>" +
      "<span class='bold'>URL</span></strong>: " + linkifyString(parsedData['URL']) + "<br>" +
      "<span class='bold'>Ownership Type</span></strong>: " + parsedData['Ownership Type'] + "<br>" +   
      "<span class='bold'>Resource Type</span></strong>: " + parsedData['Resource Type'] + "<br>" + 
      // "<span class='bold'>Relationships</span></strong>: " + parsedData['Relationships'] + "<br>" + // Not properly implemented in READ
    "</div>" +

    '<div class="light-gray">' +
      "<h4>Cost Details</h4>" +
      "<span class='bold'>Base Cost</span></strong>: " + parsedData['BaseCost'] + "<br>" +
      "<span class='bold'>Annual Cost</span></strong>: " + parsedData['AnnualCost'] + "<br>" +
      "<span class='bold'>Other Cost Considerations</span></strong>: " + parsedData['Other Cost Considerations'] + "<br>" +
    "</div>" +
      
    '<div class="light-gray">' +
      "<h4>Model Details</h4>" +
      "<span class='bold'>Decision Sector</span></strong>: " + parsedData['Decision Sector'] + "<br>" +
      "<span class='bold'>Life Cycle Phase</span></strong>: " + parsedData['Life Cycle Phase'] + "<br>" +
      "<span class='bold'>Scope and Time Scale</span></strong>: " + parsedData['Time Scale'] + "<br>" +
      "<span class='bold'>Spatial Extent</span></strong>: " + parsedData['Spatial Extent'] + "<br>" +
      "<span class='bold'>Model Structure</span></strong>: " + parsedData['Model Structure'] + "<br>" +
    "</div>" +

    '<div class="light-gray">' +
      "<h4>Technical Details</h4>" +
      "<span class='bold'>Operating System</span></strong>: " + parsedData['Operating System'] + "<br>" +
      "<span class='bold'>Operating Environment</span></strong>: " + parsedData['Operating Environment'] + "<br>" +
      "<span class='bold'>Other Proprietary Software Requirements</span></strong>: " + linkifyString(parsedData['Other Requirements']) + "<br />" +
      "<span class='bold'>Technical Skills Required</span></strong>: " + parsedData['Technical Skills Needed'] + "<br />" +
      "<span class='bold'>Open Source</span></strong>: " + parsedData['Open Source'] + "<br>" +
      "<span class='bold'>Last Software Update</span></strong>: " + parsedData['Last Software Update'] + "<br>" +
    "</div>" +

    '<div class="light-gray">' +
      "<h4>Model Input/Output Details</h4>" +
      "<span class='bold'>Model Inputs</span></strong>: " + linkifyString(parsedData['Model Inputs']) + "<br>" +
      "<span class='bold'>Model Inputs Data Requirements</span></strong>: " + linkifyString(parsedData['Input Data Requirements']) + "<br>" +
      "<span class='bold'>Model Output Types</span></strong>: " + parsedData['Model Output Types'] + "<br>" +
      "<span class='bold'>Model Output Variables</span></strong>: " + linkifyString(parsedData['Output Variables']) + "<br>" +
      "<span class='bold'>Model Evaluation</span></strong>: " + linkifyString(parsedData['Model Evaluation']) + "<br>" +
    "</div>" +
      
    '<div class="light-gray">' +
      "<span class='bold'>Keywords</span></strong>: " + parsedData['Keywords'] + "<br>" +
      "<span class='bold'>Selected Concepts</span></strong>: " +  getSelectedConceptsAssociatedWithTool(parsedData['ID']) + "<br />" +
    "</div>" +
      
    '<div class="light-gray">' +
      "<h4>Support Details</h4>" +
      "<span class='bold'>User Support Name</span></strong>: " + parsedData['Support Name'] + "<br>" +
      "<span class='bold'>User Support Phone</span></strong>: " + parsedData['Support Phone'] + "<br>" +
      "<span class='bold'>User Support Email</span></strong>: " + linkifyString(parsedData['Support Email']) + "<br>" +
      "<span class='bold'>User Support Material</span></strong>: " + linkifyString(parsedData['Support Materials']) + "<br>" +
    "</div>";

    return html;
}

/**
 * Export the selected (check marked) tools from the tools list to a downloaded CSV
 * @function
 * @param {string} resultsDiv - The ID of the div.
 */
function exportCSV(resultsDiv, records) {
  var filename = 'sustainable_community_tools.csv';
  records = (typeof records !== 'undefined') ?  records : records = $('#' + resultsDiv + ' input:checked');;
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
            if (record.hasOwnProperty(prop) && prop != 'ID') {
              var name = prop;
              names.push(name);
            }
          }
          csvContent = names.join() + '\n';
        }
        for (var property in record) {
          if (record.hasOwnProperty(property) && property != 'ID') {
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
  } else {
    toast({html: 'You must select tools to export.', close: true});
  }
}

/**
 * Save tools from the the selected tool panel
 * @function
 */
function saveRecord() {
  var recordIdToSave = $('#selected-tool-div').attr('data-read-id');
  if (!savedTools.contains(recordIdToSave)) {
    savedTools.addTool(recordIdToSave);
    localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
    toolCache.handleParsedData(recordIdToSave, savedTable.displayTool.bind(savedTable)); // populate divs
  }
  if (savedTools.getLength() > 0) {
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
    $('#saved-tools-panel').attr("aria-hidden", false);
  }
}

/**
 * Save all selected tools to the Saved Tools tab
 * @function
 * @param {string} resultsDiv - The ID of the div.
 */
function saveSelectedRecords(resultsDiv) {
  var recordsToSave = $('#' + resultsDiv + ' input:checked');
  if (!recordsToSave.length) {
    toast({html: 'Please select tools to save.', close: true});
    return;
  }
  recordsToSave.each(function () {
    if (!savedTools.contains($(this).val())) {
      savedTools.addTool($(this).val());
    }
  });
  localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
  if (savedTools.getLength() > 0) {
    $('#saved-tools-tab').parent().attr("aria-hidden", false);
    $('#saved-tools-panel').attr("aria-hidden", false);
    document.getElementById("saved-tools-tab").click();
    createDataTable('saved');
    toolCache.handleToolSet(savedTools, savedTable.displayTools.bind(savedTable)); // populate divs
  }
}

/**
 * Creates a div to display details of parsedResult appended to the specified container
 * @function
 * @param {object} parsedResult - The parsed data for the tool.
 * @param {string} containerId - The ID of the container the DIV will be appended to.
 */
function addDiv(parsedResult, containerId) {
  // append READ-ID of a tool to URL below to point to details via the EPA's System of Registries
  var prefixForExternalDetails = 'https://ofmpub.epa.gov/sor_internet/registry/systmreg/resourcedetail/general/description/description.do?infoResourcePkId=';
  var $container = $('#' + containerId);
  var html = '<div id="' + containerId + '-' + parsedResult['ID'] + '" class="list-div">' +
    '<div class="row" role="button">' +
      '<div class="col size-95of100">' +
        '<input class="results-checkbox" type="checkbox" id="' + containerId + '-cb-' + parsedResult['ID'] + '" value="' + parsedResult['ID'] + '"/>' +
        '<label for="' + containerId + '-cb-' + parsedResult['ID'] + '" class="results-label"></label>' +
        '<span class="bold">' + parsedResult['Title'] + ' (' + parsedResult['Acronym'] + ')</span></strong>: ' + parsedResult['Description'] +
      '</div>' +
    '</div>' +
    '<div class="row expand" data-id="' + parsedResult['ID'] + '" tabindex="0">' +
      '<button class="col bold button-grey">Show Tool Details</button>' +
      '<div class="col accordion-result"></div>' +
    '</div>' +
  '</div>';
  $container.append(html);
}

/**
 * Creates the HTML to create a Display DIV and returns it
 * @function
 * @param {object} parsedResult - The parsed data of a tool.
 * @param {string} containerId - The ID of the div.
 * @return {string} - The HTML to create a DIV.
 */
function createDiv(parsedResult, containerId) {
  // append READ-ID of a tool to URL below to point to details via the EPA's System of Registries
  var prefixForExternalDetails = 'https://ofmpub.epa.gov/sor_internet/registry/systmreg/resourcedetail/general/description/description.do?infoResourcePkId=';
  var $container = $('#' + containerId);
  var html = '<div id="' + containerId + '-' + parsedResult['ID'] + '" class="list-div">' +
    '<div class="row" role="button">' +
      '<div class="col size-95of100">' +
        '<input class="results-checkbox" type="checkbox" id="' + containerId + '-cb-' + parsedResult['ID'] + '" value="' + parsedResult['ID'] + '"/>' +
        '<label for="' + containerId + '-cb-' + parsedResult['ID'] + '" class="results-label">' +
        '<span class="bold">' + parsedResult['Title'] + (parsedResult['Title'].substr(0, 15) === parsedResult['Acronym'] ? '' : ' (' + parsedResult['Acronym'] + ')') + '</span></label>: ' + parsedResult['Description'] +
      '</div>' +
    '</div>' +
    '<div class="row expand" data-id="' + parsedResult['ID'] + '" tabindex="0">' +
      '<button class="col bold button-grey">Show Tool Details</button>' +
    '</div>' +
  '</div>';

  return html;
}

/**
 * On click listener for the expandable details section of the lists
 * @listens click
 */
$('.list').on('click', '.expand', function () {
  var $this = $(this);
  var readId = $this.attr('data-id');
  showDetails(readId, this);
});

/**
 * map details of a result into accessible locations
 * @function
 * @param {object} result - Unparsed data from READ Web Service.
 */
var parseResult = function (result) {
  if (typeof(result) === 'undefined') { // catch bad input
    return;
  }
  var openSourceMap = { // map integral data-standard to text
    1:'Yes',
    2:'No',
    3:'Partial'
  };
  var dataRequirementsMap = { // map integral data-standard to text
    1:'None - All Data Provided',
    2:'Low - Data Generally Publicly Available',
    3:'Med - Not Publicly Available, but Routinely Available',
    4:'High - New Data Must be Created',
    5:'Insufficient Information'
  };
  var softwareCostMap = { // map integral data-standard to text
    1:'$0',
    2:'$1-$499',
    3:'$500-$1499',
    4:'$1500-$3999',
    5:'>$4000'
  };
  var parsedResult = {};
  parsedResult['ID'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'DatabaseIdentifier']);
  parsedResult['Title'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'LongTitleText']);
  parsedResult['Acronym'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'Acronym']);
  parsedResult['Description'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'LongDescription']);
  parsedResult['Decision Sector'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelScopeDetail', 'ModelScopeDecisionSector']);
  parsedResult['URL'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'AccessDetail', 'URLDetail', 'URLText']);
  parsedResult['Life Cycle Phase'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'LifeCycleDetail', 'CurrentLifeCyclePhase']);
  parsedResult['BaseCost'] = parseSoftwareCost(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsBaseSoftwareCost']));
  parsedResult['AnnualCost'] = parseSoftwareCost(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsRecurringAnnualCost']));
  parsedResult['Other Cost Considerations'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsOtherCostConsiderations']);
  parsedResult['Open Source'] = parseOpenSource(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsOpenSource']));
  parsedResult['Operating Environment'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'TechRequirementsDetail', 'TechReqOperatingEnvironmentDetail', 'OperatingEnvironmentName']);
  parsedResult['Operating System'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'TechRequirementsDetail', 'TechReqCompatibleOSDetail', 'OSName']);
  parsedResult['Other Requirements'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'TechRequirementsDetail', 'TechReqOtherReqDetail', 'OtherReqName']);
  parsedResult['Time Scale'] = parseTimeScale(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelScopeDetail', 'ModelScopeTimeScaleDetail']));
  parsedResult['Spatial Extent'] = parseSpatialExtent(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelScopeDetail', 'ModelScopeSpatialExtentDetail']));
  parsedResult['Technical Skills Needed'] = parseTechnicalSkill(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelScopeDetail', 'ModelScopeTechnicalSkillsNeededToApplyModelDetail']));
  parsedResult['Model Structure'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelStructureDetail', 'ModelStructureTextArea']);
  parsedResult['Model Inputs'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelInputsDetail', 'ModelInputsTextArea']);
  parsedResult['Input Data Requirements'] = parseDataRequirements(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelInputsDetail', 'ModelInputsDataRequirements']));
  parsedResult['Model Output Types'] = parseModelOutputType(readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelOutputsDetail', 'ModelOutputsModelOutputTypesDetail']));
  parsedResult['Output Variables'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelOutputsDetail', 'ModelOutputsModelVariablesTextArea']);
  parsedResult['Model Evaluation'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelEvaluationDetail', 'ModelEvaluationTextArea']);
  parsedResult['Keywords'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'KeywordDetail', 'KeywordText']);
  parsedResult['Support Name'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportName']);
  parsedResult['Support Email'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportEmail']);
  parsedResult['Support Phone'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportPhoneNumber']);
  parsedResult['Support Materials'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'UserSupportDetail', 'UserSupportSourceOfSupportMaterials']);
  parsedResult['Last Software Update'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'ModelDetailsDetail', 'DetailsLastKnownSoftwareUpdate']);
  parsedResult['Last Modified'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'LastModifiedDateTimeText']);
  parsedResult['Ownership Type'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'OwnershipTypeName']);
  parsedResult['Resource Type'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'ResourceTypeName']);
  parsedResult['Alternate Names'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'GeneralDetail', 'AlternateNamesDetail', 'AlternateName']);
  // parsedResult['Relationships'] = readSafe(result, ['READExportDetail', 'InfoResourceDetail', 'RelationshipDetail', 'InfoResourceRelationshipDetail', 'RelatedInfoResourceName']); // Not properly implemented in READ

  /**
   * return decoded value(s) accumulated into a string
   * @param field {object} contains either object[propertyName] or object[0][propertyName]
   * @param propertyName {string} name of the property that holds the desired value
   * @param map {object} decode values with map[object[propertyName]] or map[object[0][propertyName]]
   * READ Web Services return one value if only one value exists. If several values then they're in an array.
   * There are various data-standards used in READ, like storing integers in place of strings for options.
   */
  function mapAll(field, propertyName, map) { //
    if (typeof propertyName !== 'undefined') { // arg propertyName passed?
      if (field[propertyName]) {return map[field[propertyName]];}// money-shot!
      if (field.length) {
        var accumulatedString = ''; // append accumulated values here
        for (var i = 0; i < field.length - 1; i++) {
          if (typeof map === 'undefined') { // no arg map passed...
            accumulatedString += field[i][propertyName] + ', '; // ...accumulate ith value
          } else { // arg map was passed...
            accumulatedString += map[field[i]][propertyName] + ', '; // ...accumulate ith value
          }
        }
        if (typeof map === 'undefined') { // no arg map passed...
          accumulatedString += 'and ' + field[field.length - 1][propertyName]; // ...accumulate final value
        } else { // arg map was passed...
          accumulatedString += 'and ' + map[field[field.length - 1][propertyName]]; // ...accumulate final value
        }
        return accumulatedString;
      }
    } else { // no arg propertyName
      if (field) {return field;}
      if (field.length) {
        var accumulatedString = ''; // append accumulated values here
        for (var i = 0; i < field.length - 1; i++) {
          if (typeof map === 'undefined') { // no arg map passed...
            accumulatedString += field[i] + ', '; // ...accumulate ith value
          } else { // arg map was passed...
            accumulatedString += map[field[i]] + ', '; // ...accumulate ith value
          }
        }
        if (typeof map === 'undefined') { // no arg map passed...
          accumulatedString += 'and ' + field[field.length - 1][propertyName]; // ...accumulate final value
        } else { // arg map was passed...
          accumulatedString += 'and ' + map[field[field.length - 1][propertyName]]; // ...accumulate final value
        }
        return accumulatedString;
      }
    }
  }

  /**
   * Parse the technical skill array or object for the technical skill value(s).
   * @function
   * @param {object|array} ModelScopeTechnicalSkillsNeededToApplyModelDetail - An object containing the property, or an array of objects contain the property.
   * @param {string} extent.TechnicalSkillName - A string specifying the technical skill.
   * @return {string|object} - Either the value itself, or a string combining all the values.
   */
  function parseTechnicalSkill(ModelScopeTechnicalSkillsNeededToApplyModelDetail) { // possibly joins strings in an array
    if (ModelScopeTechnicalSkillsNeededToApplyModelDetail.TechnicalSkillName) {
      return ModelScopeTechnicalSkillsNeededToApplyModelDetail.TechnicalSkillName; // return desired value if it is a property of extent
    }
    return ModelScopeTechnicalSkillsNeededToApplyModelDetail;
  }

  /**
   * Parse the spatial extent array or object for the spatial extent value(s).
   * @function
   * @param {object|array} extent - An object containing the property, or an array of objects contain the property.
   * @param {string} extent.SpatialExtentName - A string specifying the spatial extent.
   * @return {string|object} - Either the value itself, or a string combining all the values.
   */
  function parseModelOutputType(ModelOutputsModelOutputTypesDetail) { // possibly joins strings in an array
    if (ModelOutputsModelOutputTypesDetail.ModelOutputTypeName) {
      return ModelOutputsModelOutputTypesDetail.ModelOutputTypeName; // return desired value if it is a property of extent
    }
    return ModelOutputsModelOutputTypesDetail;
  }

  /**
   * Parse the spatial extent array or object for the spatial extent value(s).
   * @function
   * @param {object|array} extent - An object containing the property, or an array of objects contain the property.
   * @param {string} extent.SpatialExtentName - A string specifying the spatial extent.
   * @return {string|object} - Either the value itself, or a string combining all the values.
   */
  function parseSpatialExtent(extent) { // possibly joins strings in an array
    if (extent.SpatialExtentName) {
      return extent.SpatialExtentName; // return desired value if it is a property of extent
    }
    return extent;
  }

  /**
   * Returns a string detailing if the tools is open source
   * @function
   * @param {number} openSource - An integer which represents an open source category.
   * @return {string|object} - Either the value itself, or the initial variable.
   */
  function parseOpenSource(openSource) {
    if (openSourceMap.hasOwnProperty(openSource)) {
      return openSourceMap[openSource];
    } else {
      return openSource;
    }
  }

  /**
   * Returns a string containing the data requirements
   * @function
   * @param {number} dataRequirements - An integer which represents a requirements category.
   * @return {string|string} - Either the value itself, or a string containing "No Data."
   */
  function parseDataRequirements(dataRequirements) { // requires decoding a data-standard
    if (dataRequirementsMap.hasOwnProperty(dataRequirements)) {
      return dataRequirementsMap[dataRequirements];
    }
    return dataRequirements;
  }

  /**
   * Returns a string containing the software cost.
   * @function
   * @param {number} softwareCost - An integer which represents a cost category.
   * @return {string|string} - Either the value itself, or a string containing "No Data."
   */
  function parseSoftwareCost(softwareCost) { // requires decoding a data-standard
    if (softwareCostMap.hasOwnProperty(softwareCost)) {
      return softwareCostMap[softwareCost];
    } else {
      return softwareCost;
    }
  }

  /**
   * Parse the time scale array or object for the time scale value(s).
   * @function
   * @param {object|array} timeScale - Either and object containing the relevant property, or an array of objects.
   * @param {string} timeScale.TimeScaleName - A string containing a timescale value.
   * @return {string|string} - Either the value itself, or a string containing all the values.
   */
  function parseTimeScale(timeScale) {
    if (timeScale.TimeScaleName) {
      return timeScale.TimeScaleName; // return value if possible
    }
    return timeScale; // if it's a string then return it
  }

  return parsedResult;
};

/**
 * Return selected concepts associated with given toolID
 * @function
 * @param {string} toolID - The tool ID.
 * @return {string|string} - A string which lists the selected concepts which are tied to the specified tool ID, or a string containing "none."
 */
var getSelectedConceptsAssociatedWithTool = function (toolID) {
  if (typeof readIDsByConcept !== 'undefined') {
    var selectedConceptsAssociatedWithTool = [];
    var selectedConcepts = $('input[name="concept-checkbox"]:checked');
    var toolConcepts = getToolConcepts(toolID);
    for (var i in selectedConcepts) { // build array of tool's associated concepts that are selected
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
 * Collect all concepts related to toolId in readIDsByConept
 * @function
 * @param {string} toolId - The tool ID.
 * @return {array} - The concepts tied to the specified tool ID.
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
 * Turn a valid URL into a proper HTML link.
 * @function
 * @param {string} value - The string containing the candidate URL to linkify.
 * @return {string|string} - The URL with proper HTML tags added, or the unchanged string value.
 */
function linkifyString(value) {
  if (typeof value === 'string') {
    var urlRegExp = /((http|ftp|https):\/\/[^ @"]+|[^@]\b[^ @"]+\.(com|gov|edu|org|net|info|io)[^ @"]*)/ig; // scrape value for URLs with regex
    var linkTemplate = '<a href="$1" target="_blank">$1</a>'; // create a template of how to format the URL into a descriptive anchor
    if (value.indexOf('epa.gov') === -1) { // insert exit notification if an external link
      var exitNotification = '<a class="exit-disclaimer" href="https://www.epa.gov/home/exit-epa" title="EPA\'s External Link Disclaimer">Exit</a>';
      linkTemplate += exitNotification;
    }
    value = value.replace(urlRegExp, linkTemplate).toString(); // replace all matched URLs with formatted anchors
    var emailRegExp = /(\S+@\S+\.(gov|edu|com|org|net|info))/ig; // create a sadly buggy regex to find emails
    var mailtoTemplate = '<a href="mailto:$1">$1</a>'; // create a template of a mailto link
    value = value.replace(emailRegExp, mailtoTemplate); // replace all email addresses in text with mailto links
    return value;
  }
  return value;
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
  if (object[propertyArray[0]]) { // is first element of propertyArray a property of this object?
    var value = validata(object[propertyArray[0]]); // oft-used value is sensibly extant
    if (Object.keys(propertyArray).length === 1) { // is this the last property in the array?
      if (value.length) {
        if (typeof value === 'string') {
        } else { // has length and isn't a string? Let's access it as an array!
          try { // try accumulating a string from all elements
            accumulatedString = '';
            for (var i = 0; i < value.length; i++) {
              var iValue;
              if (typeof(value[i]) === 'string') {
                iValue = value[i];
              } else {
                iValue = value[i][Object.keys(value[i])[0]];
              }
              if (i > 0) {
                accumulatedString += '; ';
              }
              accumulatedString += iValue;
            }
            return accumulatedString;
          } catch (error) { // if fail by err then warn about possible need of extension
            console.log('readSafe() erred and might need extended. Logging object, propertyArray, value:' + object + propertyArray + value);
          } finally {
          }
        }
      }
      return value; // return possibly formatted contents of property
    } else { // there are multiple elements remaining in propertyArray that we need to descend into
      try {
        return readSafe(value,propertyArray.slice(1)); // pass the second element through the last element of the property array
      } catch (e) {
        console.log('error: ',e); // dev
        return 'No Data'; // return 'No Data'
      }
    }
  } else { // first element propertyArray isn't a property of this object
    var accumulatedString = '';
    if (object.length && typeof(object) !== 'string') {
      for (i in object) {
        accumulatedString += object[i][propertyArray[0]];
        if (object.length - i > 1) {
          accumulatedString += '; ';
        }
      }
    return accumulatedString;
    } else {
      return 'No Data'; // fail safely: return 'No Data'
    }
  }
};

/**
 * Check if object represents xsi:nil or unsanitized absence of data
 * @function
 * @param {object} obj - The container holding all the checkboxes.
 * @return {bool} - Presense of a nil/null/blank/no data onject.
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
 * Validates the object.
 * @function
 * @param {object} obj - The container holding all the checkboxes.
 * @return {string|object} - If no data, return a string containing "No Data," or the original object if not nil.
 */
var validata = function (obj) {
  try {
    if (isNil(obj)) {
      return 'No Data';
    } else {
      return obj;
    }
  } catch (e) {
    console.log('ERROR: validata() returned "no data" for' + obj + 'because it threw error' + e);
    return 'No Data';
  }
};

/**
 * Check all the checkboxes in the specified location
 * @function
 * @param {string} divId - The container holding all the checkboxes.
 * @param {function} callback - The function that will be executed when done unselecting all the checkboxes.
 */
function selectAll(divId, callback) {
  //enabled functionality which allows for checking all instances of the checkbox value
  $('#' + divId + ' input:checkbox:not(:checked)').prop('checked', true);
  if (callback) {
    callback();
  }
}

/**
 * Uncheck all the checkboxes in the specified location
 * @function
 * @param {string} divId - The container holding all the checkboxes.
 * @param {function} callback - The function that will be executed when done unselecting all the checkboxes.
 */
function deselectAll(divId, callback) {
  //enabled functionality which allows for unchecking all instances of the checkbox value
  $('#' + divId + ' input:checkbox:checked').prop('checked', false);
  if (callback) {
    callback();
  }
}

/**
 * Save all the tools in a specified container
 * @function
 */
function saveAll(divId) {
  $('#' + divId + ' input:checkbox').each(function () {
    var readID = $(this).val();
    if (!savedTools.contains(readID)) {
      savedTools.addTool(readID);
    }
  });
  localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
}

/**
 * Unsave all the tools in the saved tools ToolSet.
 * @function
 */
function unsaveAll() {
  savedTools.reset();
  localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
}

/**
 * Execute get request on specified url and data
 * @function
 * @param {string} url - The URL we are attempting to reach.
 * @param {object} data - The query data/parameters we are sending to the URL.
 * @return {object} - The object holding result of the ajax request.
 */
var executeSearch = function (url, data) {
  $.support.cors = true; // needed for < IE 10 versions
  return $.ajax({
    type: 'GET',
    url: url,
    data: data
  });
};

/**
 * Create a DataTable in the specified container.
 * @function
 * @param {string} name - Partial ID of the table to be created.
 */
function createDataTable(name) {
  if (!$.fn.DataTable.isDataTable('#' + name + '-table')) {
    var paging = true;
    if (name === 'browse') {
      paging = false;
    }
    var table = $('#' + name + '-table').DataTable({
      dom: 'Bfrtip',
      processing: true,
      responsive: {
        details: false
      },
      paging: paging,
      columnDefs: [
        {
          targets: [0],
          searchable: false,
          orderable: false,
          className: 'dt-body-center',
          render: function (data, type, full, meta) {
            return '<input id="' + name + '-' + full[1] + '" type="checkbox" value="' + full[1] + '"><label for="' + name + '-' + full[1] + '"></label>';
          }
        },
        {
          targets: [1],
          visible: false
        },
        {
          targets: [3],
          width: '70em'
        },
        {
          targets: [2],
          width: '50em'
        }
      ],
      order: [[2, 'asc']],
      buttons: [
        {
          text: 'Select All Tools',
          action: function () {
            selectFilteredToolsButton(name);
          },
          className: 'button button-grey'
        },
        {
          text: 'Deselect All Tools',
          action: function () {
            deselectFilteredToolsButton(name);
          },
          className: 'button button-grey'
        }
      ]
    });

    var dtButtons = [];

    if (resultTable.getType() === 'search' || resultTable.getType() === 'browse') {
      dtButtons.push(
        {
          text: 'Export Selected Tools to CSV',
          action: function () {
            exportCSV(name + '-list');
          },
          className: 'button button-white'
        }
      );
    }

    if (name !== 'saved' && (resultTable.getType() === 'search' || resultTable.getType() === 'browse')) {
      dtButtons.push(
        {
          text: 'Save Selected Tools',
          action: function () {
            saveSelectedRecords(name + '-list');
          },
          className: 'button button-white'
        }
      );
    }

    if (name === 'browse') {
      $('.dataTables_empty').html('<img id="loader" src="img/loader.gif">');
    }

    if (name === 'saved' && (resultTable.getType() === 'search' || resultTable.getType() === 'browse')) {
      dtButtons.push(
        {
          text: 'Remove Selected Tools',
          action: function () {
            removeSelected(name + '-list');
          },
          className: 'button button-white'
        }
      );
    }

    new $.fn.dataTable.Buttons(table, {
        buttons: dtButtons
      }
    );

    table.buttons(0, null).container().css('display', 'block').wrap("<div></div>");
    if (name !== 'saved' && resultTable.getType() === 'search') {
      table.buttons(1, null).container().css('float', 'right').insertAfter('#' + name + '-table_wrapper > div > ' + '.dt-buttons');
    } else {
    	table.buttons(1, null).container().css('float', 'right').insertAfter('#' + name + '-table_wrapper > div > ' + '.dt-buttons');
    }

    $('.dt-button').removeClass('dt-button');
  }
}

/**
 * Selects all the tools in the specified container.
 * @function
 * @param {string} name - Partial ID of the table to be created.
 */
function selectAllToolsButton(name) {
  if (!$('#saved-list').length) {
    selectAll(name + '-list', saveAll(name + '-list'));
  } else {
    selectAll(name + '-list');
  }
  var rows = $('#' + name + '-table').DataTable().rows();
  var rowNodes = rows.nodes();
  rows.select();
  $('input[type="checkbox"]', rowNodes).prop('checked', true);
}

/**
 * deselects all the tools in the specified container.
 * @function
 * @param {string} name - Partial ID of the table to be created.
 */
function deselectAllToolsButton(name) {
  if (!$('#saved-list').length) {
    deselectAll(name + '-list', unsaveAll(name + '-list'));
  } else {
    deselectAll(name + '-list');
  }
  var rows = $('#' + name + '-table').DataTable().rows();
  var rowNodes = rows.nodes();
  rows.deselect();
  $('input[type="checkbox"]', rowNodes).prop('checked', false);
}

/**
 * Selects all the filtered tools in the specified container.
 * @function
 * @param {string} name - Partial ID of the table to be created.
 */
function selectFilteredToolsButton(name) {
  var rows = $('#' + name + '-table').DataTable().rows({ search: 'applied'});
  var rowNodes = rows.nodes();
  rows.select();
  $('input[type="checkbox"]', rowNodes).prop('checked', true);

  var toolsToSelect = [];
  rowNodes.to$().each(function() {
    $('#' + name + '-list-cb-' + $(this).find('input[type="checkbox"]').val()).prop('checked', true);
    toolsToSelect.push($(this).find('input[type="checkbox"]').val());
  });

  if (!$('#saved-list').length) {
    for (var i = 0, length = toolsToSelect.length; i < length; i++) {
      savedTools.addTool(toolsToSelect[i]);
    }
    localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
  }
}

/**
 * deselects all the filtered tools in the specified container.
 * @function
 * @param {string} name - Partial ID of the table to be created.
 */
function deselectFilteredToolsButton(name) {
  var rows = $('#' + name + '-table').DataTable().rows({ search: 'applied'});
  var rowNodes = rows.nodes();
  rows.deselect();
  $('input[type="checkbox"]', rowNodes).prop('checked', false);

  var toolsToDeselect = [];
  rowNodes.to$().each(function() {
    $('#' + name + '-list-cb-' + $(this).find('input[type="checkbox"]').val()).prop('checked', false);
    toolsToDeselect.push($(this).find('input[type="checkbox"]').val());
  });

  if (!$('#saved-list').length) {
    for (var i = 0, length = toolsToDeselect.length; i < length; i++) {
      savedTools.removeTool(toolsToDeselect[i]);
    }
    localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
  }
}

var timeouts = {};

/**
 * toast() accessibly notifies users of arbitrary information
 *
 * @param {object} parameters:
 *   { parameters.css : [ "contains arbitrary css for this notice
 *                        as parameters.css[<key>] = <value>",
 *                        "is JSON-object" ],
 *     parameters.disable : [ "true to show disabling-button" ],
 *     parameters.html : [ "html for notifier" ],
 *     parameters.priority : [ "sets priority-metadata for
 *                              assistive technology",
 *                             "can be 'polite' or 'assertive'",
 *                             "assertive interrupts user",
 *                             "see aria-live's values in html-spec" ],
 *     parameters.container : [ "ID of container to use for alert" ] }
 */
var toast = function (parameters) {
  clearToast();
  var noticeID = 'toast';
  var $notice = $('#' + noticeID);
  if (typeof parameters !== 'undefined') { // does parameters object exist?
    if (typeof parameters['container'] !== 'undefined') {
      var noticeID = parameters['container'];
      var $notice = $('#' + noticeID);
    }
    for (var parameter in parameters) {
      if (parameter === 'css') { // set css rules
        for (var property in parameters[parameter]) {
          $notice.css(property, parameters[parameter][property]);
        }
      }
      if (parameter === 'html') {
        $notice.html(parameters[parameter]);
      }
      if (parameter === 'close') {
        $notice.append('<span class="toast-close-button unselectable" onclick="clearToast()" role="button">&times;</span>');
      }
      if (parameter === 'priority') {
        if (parameters[parameter] === 'polite') {
          $notice.attr('aria-live', 'polite');
        }
        if (parameters[parameter] === 'assertive') {
          $notice.attr('aria-live', 'assertive');
        }
      }
      if (parameter === 'disable') {
        if (parameters[parameter] === true) {
          $notice.append($('<button>').text('Disable These Messages').addClass('button-grey toast-button').click(function () {disableToast(noticeID, showToast)}));
        }
      }
    }
  }
  $notice.removeAttr('aria-hidden');
  $notice.show();
  $notice.addClass('show');
  timeouts["toast"] = setTimeout(function () {
    clearToast();
  }, 20000);// remove the show class from notice after specified miliseconds
};

/**
 * Disable instructional toasts for all tab panels
 * @function
 * @param {string} noticeID - ID of the toast container.
 * @param {object} showToast - Object containing the properties for Toasts.
 */
function disableToast(noticeID, showToast) {
  showToast['all'] = false;
  $('#' + noticeID).hide();
}

/**
 * Clears the toast and the timeout for the toast
 * @function
 */
function clearToast() {
  var noticeID = 'toast';
  var $notice = $('#' + noticeID);
  clearTimeout(timeouts[noticeID]);
  $notice.removeClass('show');
  $notice.attr('aria-hidden','true');
  $notice.hide();
}

// stopwords to use in testing
var stopWords = [
  "&","a","about","above","across","after","afterwards","again","against","all","almost","alone","along","already","also","although","always","am","among","amongst","amoungst","amount","an","and","another","any","anyhow","anyone","anything","anyway","anywhere","are","around","as","at","back","be","became","because","become","becomes","becoming","been","before","beforehand","behind","being","below","beside","besides","between","beyond","bill","both","bottom","but","by","call","can","cannot","cant","co","computer","con","could","couldnt","cry","de","describe","detail","do","done","down","due","during","each","eg","eight","either","eleven","else","elsewhere","empty","enough","etc","even","ever","every","everyone","everything","everywhere","except","few","fifteen","fify","fill","find","fire","first","five","for","former","formerly","forty","found","four","from","front","full","further","get","give","go","had","has","hasnt","have","he","hence","her","here","hereafter","hereby","herein","hereupon","hers","herself","him","himself","his","how","however","hundred","i","ie","if","in","inc","indeed","interest","into","is","it","its","itself","keep","last","latter","latterly","least","less","ltd","made","many","may","me","meanwhile","might","mill","mine","more","moreover","most","mostly","move","much","must","my","myself","name","namely","neither","never","nevertheless","next","nine","no","nobody","none","noone","nor","not","nothing","now","nowhere","of","off","often","on","once","one","only","onto","or","other","others","otherwise","our","ours","ourselves","out","over","own","part","per","perhaps","please","put","rather","re","same","see","seem","seemed","seeming","seems","serious","several","she","should","show","side","since","sincere","six","sixty","so","some","somehow","someone","something","sometime","sometimes","somewhere","still","such","system","take","ten","than","that","the","their","them","themselves","then","thence","there","thereafter","thereby","therefore","therein","thereupon","these","they","thick","thin","third","this","those","though","three","through","throughout","thru","thus","to","together","too","top","toward","towards","twelve","twenty","two","un","under","until","up","upon","us","very","via","was","we","well","were","what","whatever","when","whence","whenever","where","whereafter","whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","whoever","whole","whom","whose","why","will","with","within","without","would","yet","you","your","yours","yourself","yourselves"
];

/**
 * Prints the leafNode array in a format that can be manually copied to create a hard coded version
 * @function
 * @param {array} arrayToPrint - An array that will be printed.
 */
function printArray(arrayToPrint) {
  var str = '[';
  for (var i = 0; i < arrayToPrint.length; i++) {
    str += '"' + arrayToPrint[i] + '", ';
  }

  str += "];";
  console.log(str);
}

/**
 * Returns an object containing all tools indexed by decision sector
 * @function
 * @return {object} - Object containing the Resource ID of all tools by decision sector.
 */
var allTools = function () {
  var tools = {};
  var decisionSectors = ['land use','transportation','building infrastructure','waste management'];
  tools.transportation = {};
  $.get(resourceAdvancedSearchURL, {DecisionSector:'Transportation'}).done(function (data) {$.each(data, function (i) {tools.transportation[data[i].ResourceId] = data[i].ResourceId;});});
  tools.wasteManagement = {};
  $.get(resourceAdvancedSearchURL, {DecisionSector:'Waste Management'}).done(function (data) {$.each(data, function (i) {tools.wasteManagement[data[i].ResourceId] = data[i].ResourceId;});});
  tools.buildingInfrastructure = {};
  $.get(resourceAdvancedSearchURL, {DecisionSector:'Building Infrastructure'}).done(function (data) {$.each(data, function (i) {tools.buildingInfrastructure[data[i].ResourceId] = data[i].ResourceId;});});
  tools.landUse = {};
  $.get(resourceAdvancedSearchURL, {DecisionSector:'Land Use'}).done(function (data) {$.each(data, function (i) {tools.landUse[data[i].ResourceId] = data[i].ResourceId;});});
  return tools;
};

/**
 * Returns an object containing parsed data for all tools in each decision sectors
 * @function
 * @return {object} - Object containing the parsed data of all tools by decision sector.
 */
var allToolDetails = function () {
  var tools = {};
  var decisionSectors = ['land use','transportation','building infrastructure','waste management'];
  for (var j = 0; j < decisionSectors.length; j++) {
    $.get(resourceAdvancedSearchURL, {DecisionSector:decisionSectors[j]}).done(function (data) { $.each(data, function (i) { $.get(resourceDetailURL, {ResourceId:data[i].ResourceId}).done(function (data) {var parsedResult = parseResult(data); tools[parsedResult['ID']] = parsedResult;});});});
  }
  return tools;
};

/**
 * Print details for a given READ ID in the console
 * @function
 * @param {string} id - The tool ID.
 */
var getDetailsFromId = function (id) {
  $.get(resourceDetailURL, {ResourceId:id}).done(function (data) {
    console.log(id + ': ' + data.READExportDetail.InfoResourceDetail);
  });
};

/**
 * return selected label for each checked element and
 * console-log each label
 */
var debugGetSelected = function(){
    var selected = [];
    $.each($(':checked').next('label'), function(i,d){
        console.log(i,d);
        selected += i + ' ' + d.className + ': ' + d.innerText + '; '
    });
    selected = JSON.stringify(selected);
	return selected
};

/**
 * Detects whether localStorage is both supported and available.
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 * @function
 */
function localStorageEnabled() {
  try {
    var storage = window['localStorage'],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      e.code === 22 || // everything except Firefox
      e.code === 1014 || // Firefox
      e.name === 'QuotaExceededError' || // test name field too, because code might not be present // everything except Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && // Firefox
      storage.length !== 0; // acknowledge QuotaExceededError only if there's something already stored
  }
}

/**
 * Sets a speficied key value to the specified data value
 * @function
 * @param {string} key - The key.
 * @param {string} value - The value.
 */
function localStorageSetItem(key, value) {
  if (localStorageEnabled()) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Loads saved tools from local storage into the current page.
 * @function
 */
function loadSavedTools() {
  if (localStorageEnabled()) {
    cachedSavedTools = JSON.parse(localStorage.getItem("savedTools"));
    if (cachedSavedTools && cachedSavedTools.length > 0) {
      savedTools.toolSet = cachedSavedTools.toolSet;
      savedTools.length = cachedSavedTools.length;
      if (typeof(savedTable) !== 'undefined') {
        createDataTable('saved');
        $('#saved-tools-tab').parent().attr("aria-hidden", false);
        $('#saved-tools-panel').attr("aria-hidden", false);
        toolCache.handleToolSet(savedTools, savedTable.displayTools.bind(savedTable));
      } else {
        createDataTable('results');
        $('#results-tab').parent().attr("aria-hidden", false); // enable tab button.
        $('#results-tab').removeAttr("aria-disabled")
          .attr("aria-hidden", false);
        toolCache.handleToolSet(savedTools, resultTable.displayTools.bind(resultTable));
        selectAllToolsButton('results');
      }
    }
  }
}

/**
 * Loads the localStorage tool cache into the current pages tool cache.
 * @function
 */
function loadCache() {
  if (localStorageEnabled()) {
    var newCache = JSON.parse(localStorage.getItem('toolCache'));
    if (newCache !== null) {
      toolCache.loadCache(newCache); //load cache
    }
  }
}

/**
 * Compares the values of two arrays.
 * @function
 * @param {array} a1 - The first array.
 * @param {array} a2 - The second array.
 * @return {boolean} - True if they are the same; False if they aren't.
 */
function arrayCompare(a1, a2) {
  if (a1.length !== a2.length) {
    return false;
  }
  for (var i = 0, length = a1.length; i < length; i++) {
    if (a1[i] !== a2[i]){
      return false;
    }
  }
  return true; 
}

/**
 * Listens for changes in the local storage. If 
 * @param {event} e - The storage event.
 * @listens storage
 */
$(window).bind('storage', function (e) {
  if (e.originalEvent.key === 'savedTools') {
    var newSavedTools = JSON.parse(e.originalEvent.newValue);
    if (arrayCompare(Object.keys(newSavedTools.toolSet).sort(), Object.keys(savedTools.toolSet).sort()) === true) { // if the saved tools are the same don't do anything
      return;
    }
    savedTools.toolSet = newSavedTools.toolSet;
    savedTools.length = newSavedTools.length;
    var type = resultTable.getType();
    if (type === 'wizard') {
      createDataTable('results'); // create table
      resultTable.getToolSet().reset(); // clear table/div
      $("#" + resultTable.getListId()).html('');
      $("#" + resultTable.getTableId()).DataTable().clear().draw();
      if (savedTools.length > 0) {
        toolCache.handleToolSet(savedTools, resultTable.displayTools.bind(resultTable)); // add saved tools
        selectAllToolsButton('results');
      }
      toolCache.handleToolSet(resultSet, resultTable.displayTools.bind(resultTable)); // add result current set
      $('#results-tab').parent().attr("aria-hidden", false); // enable tab button.
      $('#results-tab').removeAttr("aria-disabled")
    } else if (type === 'browse' || type === 'search') {
      createDataTable('saved'); // create table
      savedTable.getToolSet().reset();
      $("#" + savedTable.getListId()).html('');
      $("#" + savedTable.getTableId()).DataTable().clear().draw();
      if (savedTools.length > 0) {
        $('#saved-tools-tab').parent().attr("aria-hidden", false);
        $('#saved-tools-panel').attr("aria-hidden", false);
        toolCache.handleToolSet(savedTools, savedTable.displayTools.bind(savedTable));
      } else {
        $('#saved-tools-tab').parent().attr("aria-hidden", true);
        $('#saved-tools-panel').attr("aria-hidden", true);
        $('#tabs-nav > li').children().first().click();
      }
    }
  } else if (e.originalEvent.key === 'toolCache') {
    toolCache.updateCache();
  }
});

/**
 * Adds the tools associated with the concepts to the resultSet
 * @function
 * @param {array} concepts - Array containing the concepts to return tools for.
 */
function searchParsedConcepts(concepts) {
  for (var i = 0; i < concepts.length; i++) {
    if (readIDsByConcept[concepts[i]]) {
      for (var j = 0; j < readIDsByConcept[concepts[i]].length; j++) {
        if (!savedTools.contains(readIDsByConcept[concepts[i]][j])) {
          resultSet.addTool(readIDsByConcept[concepts[i]][j]);
        }
      }
    }
  }
}

/**
 * Finds concepts which match the search term
 * @param {string} searchTerm - The search term
 * @return {array} results - An array containing the DPL concepts which contain the search term.
 */
function findConcepts(searchTerms) {
	var results = [];
	var concepts = Object.keys(readIDsByConcept);
    for (var i = 0; i < searchTerms.length; i++) {
      for (var j = 0; j < concepts.length; j++) {
        if (concepts[j].indexOf(searchTerms[i]) > -1) {
          results.push(concepts[j]);
        }
      }
    }
	return results;
}

function exportTools(resultsDiv) {
  var radioValue = $('input[name="export-type"]:checked').val();
  var records = $('#' + resultsDiv + ' input:checked');

  if (records.length <= 0) { 
    toast({html: 'Select tools to export.', close: true});
    return;
  }

  if (radioValue === "csv") {
    exportCSV(resultsDiv, records);
    return;
  }

  var html = '';
  records.each(function () {
    var record = toolCache.getParsedData($(this).val());
    if (record) {
      html += "<h2>" + record.Title + "</h2>";
      html = createPDFHTML(record, html);
      html += "<hr>";
    }
  });

  html.replace('<a class="exit-disclaimer" href="https://www.epa.gov/home/exit-epa" title="EPA\'s External Link Disclaimer">Exit</a>','');
  
  console.log(html);

  if (radioValue === "html") {

  } else if (radioValue === "pdf") {
    text = textToPDF(document.querySelector('#results-list'));
  } else {
    toast({html: 'Select an export type.', close: true});
    return;
  }
}

/** digest text into lines of text to render individually in pdf */
var textToPDF = function(source) {
  var doc = new jsPDF('p', 'pt', 'letter');
  var margins = {left: 40, top: 40, width: 600};
  var lineNumber;
  var lineNumberWithinPage = 0;
  var iPage;
  var textArray = source.innerText.split(/\n/);
  var lineHeight = 15;
  var lineWidth = 65;
  var linesPerPage = 40;
  var wrap = function(doc, textArray, lineHeight, lineWidth, linesPerPage, lineNumberWithinPage) {
    for (var i = 0; i < textArray.length; i++) {
      text = textArray[i];
      var lines = Math.floor(text.length/lineWidth);
      for (lineNumber = 0; lineNumber < lines; lineNumber++) {
//console.log('The following arguments to `text` show their values...');
//console.log("text.substring(lineNumber * lineWidth, lineNumber * lineWidth + lineWidth), margins.left, margins.top + (lineHeight * lineNumber):", text.substring(lineNumber * lineWidth, lineNumber * lineWidth + lineWidth), margins.left, margins.top + (lineHeight * lineNumber));
        doc.text(text.substring(lineNumber * lineWidth, lineNumber * lineWidth + lineWidth),
                 margins.left,
                 margins.top + (lineHeight * lineNumber));
      }
    if (i !== textArray.length - 1) doc.addPage();
    }
    return lineNumber;
  };
  var newTextArray = [];
  for (elementIndex = 0; elementIndex < textArray.length; elementIndex++) {
    if (textArray[elementIndex] !== 'Show Tool Details') {
      newTextArray.push(textArray[elementIndex]);
    }
  }
  //TODO export to csv
  reportToFile('results-list');
  return;//FIXME finish TODO-list, remove console.log from everywhere, remove FIXME and TODO, then remove extra return-statements or code they shade
  //TODO insert \n where appropriate
    //TODO find 80th char
    //TODO find location of first preceding space
    //TODO insert replace this space with \n
    //TODO create report of form key: value
    //TODO text(report)
//console.log('The following arguments to `wrap` show their values...');
//console.log("doc, newTextArray, lineHeight, lineWidth, linesPerPage, lineNumber:", doc, newTextArray, lineHeight, lineWidth, linesPerPage, lineNumber);
  wrap(doc, newTextArray, lineHeight, lineWidth, linesPerPage, lineNumber);
  doc.output("dataurlnewwindow");
  return doc;
}

/** exports `text` from browser to a file */
var exportToFile = function(text, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    var blob = new Blob([text], {
      type: "text/plain;charset=utf-9;"
    });
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    link.setAttribute("href", 'data:text/plain;charset=utf-9,' + encodeURIComponent(text));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/** produce set of results for checked list-items */
function reportToFile(resultsDivId) {
  var filename = 'sustainable_community_tools.txt';
  records = document.querySelectorAll('#' + resultsDivId + ' input:checked');
  report = JSON.stringify(records, null, 4);
console.log("report:", report);
  exportToFile(report, filename);
  /*
  if (records.length > 0) {
    var reportContent = '';
    var names = [];
    var values;
    records.each(function () {
      values = [];
      var record = toolCache.getParsedData($(this).val());
      if (record) {
        if (names.length === 0) {
          for (var prop in record && property != 'ID') {
            if (record.hasOwnProperty(prop)) {
              var name = prop;
              names.push(name);
            }
          }
          reportContent = names.join() + '\n';
        }
        for (var property in record) {
          if (record.hasOwnProperty(property) && property != 'ID') {
            values.push('"' + record[property] + '"');
          }
        }
        reportContent += values.join() + '\n';
      }
    });
    if (window.navigator.msSaveOrOpenBlob) {
      var blob = new Blob([reportContent], {
        type: "text/plain;charset=utf-9;"
      });
      navigator.msSaveBlob(blob, filename);
    } else {
      var link = document.createElement("a");
      link.setAttribute("href", 'data:text/plain;charset=utf-9,' + encodeURIComponent(reportContent));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } else {
    toast({html: 'You must select tools to report.', close: true});
  }
  */
}

function demoFromHTML(element) {
  var pdf = new jsPDF('p', 'pt', 'letter');
  // source can be HTML-formatted string, or a reference
  // to an actual DOM element from which the text will be scraped.
  source = element[0];

  // we support special element handlers. Register them with jQuery-style 
  // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
  // There is no support for any other type of selectors 
  // (class, of compound) at this time.
  specialElementHandlers = {
      // element with id of "bypass" - jQuery style selector
      '#bypassme': function (element, renderer) {
          // true = "handled elsewhere, bypass text extraction"
          return true
      }
  };
  margins = {
      top: 80,
      bottom: 60,
      left: 40,
      width: 522
  };
  // all coords and widths are in jsPDF instance's declared units
  // 'inches' in this case
  pdf.fromHTML(
      source, // HTML string or DOM elem ref.
      margins.left, // x coord
      margins.top, { // y coord
          'width': margins.width, // max width of content on PDF
          'elementHandlers': specialElementHandlers
      },

      function (dispose) {
          // dispose: object with X, Y of the last line add to the PDF 
          //          this allow the insertion of new lines after html
          pdf.save('Test.pdf');
      }, margins
  );
}

function createPDFHTML1(parsedData, html) {
  html += "" +
    "<strong><span>Title</span></strong>: " + (parsedData['Title'].substr(0, 15) === parsedData['Acronym'] ? parsedData['Title'] : parsedData['Title'] + ' (' + parsedData['Acronym'] + ')') + '<br>' +
    "<strong><span>Description</span></strong>: " + parsedData['Description'] + "<br>" +
    (parsedData['Alternate Names'] === "No Data" ? "" : "<strong><span>Alternate Names</span></strong>: " + parsedData['Alternate Names'] + "<br>") +
    (parsedData['URL'] === "No Data" ? "" : "<strong><span>URL</span></strong>: " + linkifyString(parsedData['URL']) + "<br>") +
    (parsedData['Ownership Type'] === "No Data" ? "" : "<strong><span>Ownership Type</span></strong>: " + parsedData['Ownership Type'] + "<br>") +
    (parsedData['Resource Type'] === "No Data" ? "" : "<strong><span>Resource Type</span></strong>: " + parsedData['Resource Type'] + "<br>") +

    "<h3>Cost Details</h3>" +
    (parsedData['BaseCost'] === "No Data" ? "" : "<strong><span>Base Cost</span></strong>: " + parsedData['BaseCost'] + "<br>") +
    (parsedData['AnnualCost'] === "No Data" ? "" : "<strong><span>Annual Cost</span></strong>: " + parsedData['AnnualCost'] + "<br>") +
    (parsedData['Other Cost Considerations'] === "No Data" ? "" : "<strong><span>Other Cost Considerations</span></strong>: " + parsedData['Other Cost Considerations'] + "<br>") +
      
    "<h3>Model Details</h3>" +
    "<strong><span>Decision Sector</span></strong>: " + parsedData['Decision Sector'] + "<br>" +
    "<strong><span>Life Cycle Phase</span></strong>: " + parsedData['Life Cycle Phase'] + "<br>" +
    "<strong><span>Scope and Time Scale</span></strong>: " + parsedData['Time Scale'] + "<br>" +
    "<strong><span>Spatial Extent</span></strong>: " + parsedData['Spatial Extent'] + "<br>" +
    "<strong><span>Model Structure</span></strong>: " + parsedData['Model Structure'] + "<br>" +

    "<h3>Technical Details</h3>" +
    "<strong><span>Operating System</span></strong>: " + parsedData['Operating System'] + "<br>" +
    "<strong><span>Operating Environment</span></strong>: " + parsedData['Operating Environment'] + "<br>" +
    "<strong><span>Other Proprietary Software Requirements</span></strong>: " + linkifyString(parsedData['Other Requirements']) + "<br />" +
    "<strong><span>Technical Skills Required</span></strong>: " + parsedData['Technical Skills Needed'] + "<br />" +
    "<strong><span>Open Source</span></strong>: " + parsedData['Open Source'] + "<br>" +
    "<strong><span>Last Software Update</span></strong>: " + parsedData['Last Software Update'] + "<br>" +

    "<h3>Model Input/Output Details</h3>" +
    "<strong><span>Model Inputs</span></strong>: " + linkifyString(parsedData['Model Inputs']) + "<br>" +
    "<strong><span>Model Inputs Data Requirements</span></strong>: " + linkifyString(parsedData['Input Data Requirements']) + "<br>" +
    "<strong><span>Model Output Types</span></strong>: " + parsedData['Model Output Types'] + "<br>" +
    "<strong><span>Model Output Variables</span></strong>: " + linkifyString(parsedData['Output Variables']) + "<br>" +
    "<strong><span>Model Evaluation</span></strong>: " + linkifyString(parsedData['Model Evaluation']) + "<br>" +
      
    '<div>' +
    (parsedData['Keywords'] === "No Data" ? "" : "<strong><span>Keywords</span></strong>: " + parsedData['Keywords'] + "<br>") +
    "</div>" +
      
    "<h3>Support Details</h3>" +
    (parsedData['Support Name'] === "No Data" ? "" : "<strong><span>User Support Name</span></strong>: " + parsedData['Support Name'] + "<br>") +
    (parsedData['Support Phone'] === "No Data" ? "" : "<strong><span>User Support Phone</span></strong>: " + parsedData['Support Phone'] + "<br>") +
    (parsedData['Support Email'] === "No Data" ? "" : "<strong><span>User Support Email</span></strong>: " + linkifyString(parsedData['Support Email']) + "<br>") +
    (parsedData['Support Materials'] === "No Data" ? "" : "<strong><span>User Support Material</span></strong>: " + linkifyString(parsedData['Support Materials']) + "<br>");
    return html;
}

function createPDFHTML(parsedData, html) {
  html += "" +
    "<div>" + parsedData['Description'] + "</div>" +
    (parsedData['URL'] === "No Data" ? "" : "<span><strong>URL</strong>: " + linkifyString(parsedData['URL']) + "</span><br>") +
    (parsedData['Resource Type'] === "No Data" ? "" : "<span><strong>Resource Type</strong>: " + parsedData['Resource Type'] + "</span><br>") +
    (parsedData['BaseCost'] === "No Data" ? "" : "<span><strong>Base Cost</strong>: " + parsedData['BaseCost'] + "</span><br>") +
    (parsedData['AnnualCost'] === "No Data" ? "" : "<span><strong>Annual Cost</strong>: " + parsedData['AnnualCost'] + "</span><br>") +
    (parsedData['Other Cost Considerations'] === "No Data" ? "" : "<span><strong>Other Cost Considerations</strong>: " + parsedData['Other Cost Considerations'] + "</span><br>") +
    (parsedData['Decision Sector'] === "No Data" ? "" : "<span><strong>Decision Sector</strong>: " + parsedData['Decision Sector'] + "</span><br>") +
    (parsedData['Operating System'] === "No Data" ? "" : "<span><strong>Operating System</strong>: " + parsedData['Operating System'] + "</span><br>") +
    (parsedData['Operating Environment'] === "No Data" ? "" : "<span><strong>Operating Environment</strong>: " + parsedData['Operating Environment'] + "</span><br>") +
    (parsedData['Other Requirements'] === "No Data" ? "" : "<span><strong>Other Proprietary Software Requirements</strong>: " + linkifyString(parsedData['Other Requirements']) + "</span><br>") +
    (parsedData['Technical Skills Needed'] === "No Data" ? "" : "<span><strong>Technical Skills Required</strong>: " + parsedData['Technical Skills Needed'] + "</span><br>");
    return html;
}
