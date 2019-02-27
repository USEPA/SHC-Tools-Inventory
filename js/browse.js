var resultSet = new ToolSet(); // Create result and saved tool sets
var savedTools = new ToolSet();

var resultTable = new ToolDisplay('browse-table', 'browse-list', 'browse'); // Create ToolDisplay Objects we need
var savedTable = new ToolDisplay('saved-table', 'saved-list', 'browse');

$(function () { // jquery's shorthand awaits readiness of document
  initializeTabs();// initialize tabs and their listeners
  loadCache(); //load cache from local storage
  loadSavedTools(); // load saved tools
  browseTools();

  /**
   * Toggles the selected state of tool via a list div checkbox.
   * @listens change
   */
  $("#results-list-div, #saved-list-div, #browse-list-div").on("change", "input:checkbox", function () {
    var id = $(this).val();
    var tableId = $(this).attr('id').slice(0, -14);
    var rows = $('#' + tableId + '-table').DataTable().rows();
    var rowNodes = rows.nodes();
    if ($(this).prop('checked')) { // add selected class
      $("#" + tableId + "-table").DataTable().rows(function (idx, data, node) {
        return data[1] == id ? true: false;
      }).nodes().to$().addClass("selected");
      $('#' + id).prop('checked', true);
      $('input[type="checkbox"]', rowNodes).each(function () {
        if ($(this).val() === id) {
          $(this).prop('checked', true);
        }
      });
    } else {
      $("#" + tableId + "-table").DataTable().rows(function (idx, data, node) {
        return data[1] == id ? true: false;
      }).nodes().to$().removeClass("selected");
      $('#' + id).prop('checked', false);
      $('input[type="checkbox"]', rowNodes).each(function () {
        if ($(this).val() === id) {
          $(this).prop('checked', false);
        }
      });
    }
  });

  /**
   * Toggles the selected state of a tool via a DataTable row
   * @listens click
   */
  $('tbody').on('click', 'input[type="checkbox"]', function () {
    var $parent = $(this).parent().parent();
    var tableId = $(this).closest('table').attr('id').slice(0, -6);
    var readId = $(this).val(); // get ID
    if ($parent.hasClass('selected')) { // remove selected class
      $('#' + tableId + '-list-cb-' + readId).prop('checked', false);
      $('#' + tableId + '-table').DataTable().row($parent).deselect();
    }
    else {
      $('#' + tableId + '-list-cb-' + readId).prop('checked', true);
      $('#' + tableId + '-table').DataTable().row($parent).select();
    }
  });
});

/**
 * Initialize tabs; create listener for switching tabs
 * @function
 */
  var initializeTabs = function () {
    $('#tabs > div').hide(); // hide all tab-panels
    $('#tabs div:first').show(); // show first tab-panel
    $('#tabs-nav li:first').addClass('active'); // class tabs active for styling
    $('.menu-internal').click(function () { // add listener to tabbing elements
      $('#tabs-nav li').removeClass('active'); // remove active styling from all tabs
      var currentTab = $(this).attr('href'); // get name of clicked tab
      $('#tabs-nav li a[href="' + currentTab + '"]').parent().addClass('active'); // activate the clicked tab
      $('#tabs > div').hide(); // hide all panels
      $(currentTab).show(); // show clicked tab's panel
      return false; // return false for success; conventionially return truthy description of failure
    });
  };

/**
 * Loads all the tools to allows users to browse them in a DataTable or list view.
 * @function
 */
function browseTools() {
  for (var i = 0; i < whitelist.length; i++) {
    resultSet.addTool(whitelist[i]);
  }
  createDataTable('browse');
  toolCache.handleToolSet(resultSet, resultTable.displayTools.bind(resultTable));
}

$("#select-all-saved-btn").on('click', function () {
  selectAllToolsButton('saved');
});
$("#deselect-all-saved-btn").on('click', function () {
  deselectAllToolsButton('saved');
});
$("#remove-selected-btn").on('click', function () {
  removeSelected('saved-list');
});
$("#export-selected-btn").on('click', function () {
  exportTools('saved-list');
});

$("#select-all-btn").on('click', function () {
  selectAllToolsButton('browse');
});
$("#deselect-all-btn").on('click', function () {
  deselectAllToolsButton('browse');
});
$("#save-selected-btn").on('click', function () {
  saveSelectedRecords('browse-list');
});
$("#export-btn").on('click', function () {
  exportTools('browse-list');
});

$("#browse-tools-tab").on('click', function () {
  browseTools();
});
