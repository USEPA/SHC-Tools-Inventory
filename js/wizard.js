var advancedSearchFields = ["Name","Acronym","ShortDescriptionForReports","OwnershipType","OtherCostConsiderations","OpenSource","AlternativeNames","Keywords","Organization","ContactPerson","Email","Internet","LifeCycle","OperatingEnvironment","CompatibleOperatingSystems","OtherPropSoftwareReqs","ModelInputs","DataRequirements","ModelOutputTypes","OutputVariables","SourceOfSupportMaterials","TypesOfSupportMaterials","ModelEvaluation","ModelStructure","TimeScale","SpatialExtent","TechSkills","BaseCostOfSoftware","StewardDefinedTags","DecisionSector","Format"];
// details at READ web services' docs-page
var decisionSectors = ['land use','transportation','building infrastructure','waste management'];
var showToast = {'initialized':true};

var resultSet = new ToolSet(); // Create result and saved tool sets
var savedTools = new ToolSet();

var resultTable = new ToolDisplay('results-table', 'results-list', 'wizard'); // Create ToolDisplay Objects we need

/**
 * Create listener for changes in the URL hash fragment and changes the page if the URL fragment page is not the page being displayed
 * @listens onhashchange
 */
window.onhashchange = function () {
  if (location.hash === '') {
    $('#role-tab').parent().siblings('li').children('[role=tab][aria-selected=true]').attr('aria-selected', 'false'); // deactivate active tab
    $('#role-tab').attr('aria-selected', 'true') // list this tab as active
      .prop('disabled', false) // enable tab
      .click(); // activate tab
  }
  if ($(location.hash).attr('aria-selected') === 'false') {
    activateTab($(location.hash), 'wizard.html' + location.hash);
  }
};

/* Create listeners and execute procedures which need done
 at the document's convenience in order to avoid a
 noticeable delay in displaying the page.
*/
$(function () { // jquery's shorthand awaits readiness of document
  location.hash = '';
  updateInterface(Object.keys(subrolesByRole), $('#role'), "roleSelect()"); // populate roles into #role div
  initializeTabs(); // initialize tabs and their listeners
  loadCache(); //load cache from local storage
  $('#toggle-unsupported-1, #toggle-unsupported-2, #toggle-unsupported-3').prop('checked', true);
  loadSavedTools(); // load saved tools

  /**
   * Updates the interface when a concept checkbox changes state.
   * @listens change
   */
  $('#concept').on('change', '.concept-cb', function () {
    updateConceptsandResults();
  });

  /**
   * Toggles the saved state of a tool via a list div checkbox.
   * @listens change
   */
  $("#results-list-div, #saved-list-div, #browse-list-div").on("change", "input:checkbox", function () {
    var id = $(this).val();
    var rows = $('#results-table').DataTable().rows();
    var rowNodes = rows.nodes();
    if ($(this).prop('checked')) { // add selected class
      $("#results-table").DataTable().rows(function (idx, data, node) {
        return data[1] == id ? true: false;
      }).nodes().to$().addClass("selected");
      $('#' + id).prop('checked', true);
      savedTools.addTool(id);
      localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
      $('input[type="checkbox"]', rowNodes).each(function () {
        if ($(this).val() === id) {
          $(this).prop('checked', true);
        }
      });
    } else {
      $("#results-table").DataTable().rows(function (idx, data, node) {
        return data[1] == id ? true: false;
      }).nodes().to$().removeClass("selected");
      $('#' + id).prop('checked', false);
      savedTools.removeTool(id);
      localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
      $('input[type="checkbox"]', rowNodes).each(function () {
        if ($(this).val() === id) {
          $(this).prop('checked', false);
        }
      });
    }
    updateConcepts();
  });

  /**
   * Toggles the saved state of a tool via a DataTable row.
   * @listens click
   */
  $('tbody').on('click', 'input[type="checkbox"]', function () {
    var $parent = $(this).parent().parent();
    var tableId = $(this).closest('table').attr('id').slice(0, -6);
    var readId = $(this).val(); // get ID
    if ($parent.hasClass('selected')) { // remove selected class
      $('#' + tableId + '-list-cb-' + readId).prop('checked', false);
      savedTools.removeTool(readId);
      localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
      $('#' + tableId + '-table').DataTable().row($parent).deselect();
    } else {
      $('#' + tableId + '-list-cb-' + readId).prop('checked', true);
      savedTools.addTool(readId);
      localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
      $('#' + tableId + '-table').DataTable().row($parent).select();
    }
  });

  // create flags for controlling whether to show instructional notifications
  var instructionalCheckboxes = ['role', 'subrole', 'fundamental-objective', 'objective', 'concept',  'results-list', 'results-table'];
  for (var checkboxGroupIndex in instructionalCheckboxes) {
    var checkboxGroup = instructionalCheckboxes[checkboxGroupIndex];
    showToast[checkboxGroup] = true;
  }
});

/**
 * Initialize tabs; create listener for switching tabs
 * @function
 */
var initializeTabs = function () {
  $('#tabs > div').hide(); // hide all tab-panels
  $('#tabs div:first').show(); // show first tab-panel
  $('.menu-internal').click(function () { // add listener to tabbing elements
    if (!$(this).is('[aria-disabled]')) { // tab doesn't have an aria-disabled attribute...
      $('#tabsnav li a').removeClass('active'); // remove active styling from all tabs
      $(this).addClass('active'); // activate the clicked tab
      var currentPanel = '#' + $(this).attr('aria-controls');// make a jquery object selecting the panel associated with the clicked tab
      $('#tabs > div').hide(); // hide all panels
      $(currentPanel).show(); // show clicked tab's panel
    }
  });
};

/**
 * Show more or fewer objectives
 * @function
 * @param {number} - A number that symbolizes if we add or subtract objectives from displaying.
 */
var objectiveDisplay = function (adjust) {
  $('#objective-relevance').val(parseInt($('#objective-relevance').val()) + parseInt(adjust));
  var val = $('#objective-relevance').val();
  if (val <= 0) {
    $('#objective-relevance-decrease').prop('disabled', true);
  } else if (val >= 2) {
    $('#objective-relevance-increase').prop('disabled', true);
  } else {
    $('#objective-relevance-decrease').prop('disabled', false);
    $('#objective-relevance-increase').prop('disabled', false);
  }
  fundamentalObjectiveSelect();
};

/**
 * Handle selection and deselection to inform users of necessary information.
 * @function
 * @param {string} checkboxGroup - The ID of the container.
 */
var checkboxChangeHandler = function (checkboxGroup) {
  if (showToast[checkboxGroup] !== false && showToast['all'] !== false) {// condition: are these toasts unmuted?
    if (checkboxGroup.indexOf('table') === -1) {
      var buttonText = (checkboxGroup === 'concept') ? ($('#show-results-button').text()) : ('next'); //BOOKMARK: insert dynamically grabbed text for 'Display Tools' if checkboxGroup == 'concept'; else insert "next"
      var message = 'Select all desired ' + checkboxGroup + 's then press the button labeled "' + buttonText + '." Selections can be changed at any time by returning to the desired tab.';
        toast({html: message, close: true, disable: true});
        showToast[checkboxGroup] = false;
    } else {
      var message = 'Select all desired ' + checkboxGroup + 's then press the button labeled "next." Selections can be changed at any time.';
      showToast[checkboxGroup] = false;
      toast({html: message, close:true, disable: true});
    }
  }
};

/**
 * Updates the interface when a change occurs.
 * @function
 * @param {array} list - The list which we'll use to populate the checkboxes.
 * @param {object} $container - The container which we will place the checkboxes in.
 * @param {string} onChange - The function which will be run when the checkbox state is changed.
 */
var updateInterface = function (list, $container, onChange) {
  populate(list, $container, onChange);// populate list into $container
  toggleTab(list, $container);// enable next tab iff list not empty
  var nextButtonClassSubstring = $container.attr("id");// identify next button by who enables it
  toggleNext(list, nextButtonClassSubstring);// enable next button iff list not empty
};

/**
 * Populate list into specified $container; maintain selections when possible
 * @function
 * @param {array} list - The list which we'll use to populate the checkboxes.
 * @param {object} $container - The container which we will place the checkboxes in.
 * @param {string} onChange - The function which will be run when the checkbox state is changed.
 */
var populate = function (list, $container, onChange) {
  if (typeof list === 'undefined') { // ensure list is defined
    list = [];
  }
  var currentlySelected = []; // create container for current selections
  $container.find(':checked').each(function (i, v) {
    currentlySelected.push(v.value); // store current selections in container
  });
  var html = addCheckboxes(list.sort(), $container, onChange); // repopulate new selectables
  $container.html(html); // create contents of $container
  $container.find('input[type=checkbox]').each(function (i, v) { // look through each element in $container
    if (currentlySelected.indexOf(v.value) !== -1) { // check if item was selected
      $($(v)[0]).prop('checked', true); // select item
    }
  });
};

/**
 * Populate list with header values; maintain selections when possible
 * @function
 * @param {array} list - The list which we'll use to populate the checkboxes.
 * @param {object} $container - The container which we will place the checkboxes in.
 * @param {string} onChange - The function which will be run when the checkbox state is changed.
 */
var populateWithHeader = function (list, $container, onChange) {
  if (typeof list === 'undefined') {
    list = {length:0}; // ensure list is defined
  }
  var currentlySelected = [];
  var containerID = $container.attr('id');
  var html = '';
  var count = 0;
  var previousValues = {};
  $container.find('input[type=checkbox]').each(function (i, v) { // create an array for currently selected values
    if ($(this).prop('checked')) {
      currentlySelected.push(v.value);
    }
    var fundamentalObjective = $('#' + $(this).attr('data-parent') + '-header').attr('data-value');
    if (!previousValues.hasOwnProperty(fundamentalObjective)) {
      previousValues[fundamentalObjective] = [];
    }
    previousValues[fundamentalObjective].push(v.value);
  });
  var newItemCount = 0;
  for (var key in list) {
    if (list.hasOwnProperty(key)) {
      html += '<h5 class="highlighted" data-parent="' + containerID + '" data-value="' + key + '" id="' + containerID + '-' + count + '-header' + '">' + key +
        '<button class="small-button" onclick="selectAll(\'' + containerID + '-' + count + '\', ' + containerID + 'Select)">Select All</button>' +
        '<button class="small-button" onclick="deselectAll(\'' + containerID + '-' + count + '\', ' + containerID + 'Select)">Deselect All</button></h5>' +
        '<div class="subclass" data-parent="' + containerID + '" id="' + containerID + '-' + count + '">';
      var newOnChange = 'onchange="checkboxChangeHandler(\'' + containerID + '\');' + onChange + '"';
      var inputs = $container.children('input');
      var id = inputs.length + 1;
      list[key].sort();
      for (var i = 0; i < list[key].length; i++) {
        var concept = list[key][i];
        var newItem = '';
        var newItemSpan = '';
        if (previousValues.hasOwnProperty(key)) {
          if (previousValues[key].indexOf(concept) === -1) {
            newItem = " new-item";
            newItemSpan = ' <span class="new-item">New</span>';
            newItemCount++;
          }
        }
        html += '<input class="' + containerID + '-cb" data-parent="' + containerID + '-' + count + '" data-value="' + concept.replace(/"/g, '\&quot;') + '" type="checkbox" id="cb-' + containerID + '-' + count + '-' + id + '" value="' + concept.replace(/"/g, '\&quot;') + '" name="' + containerID + '-checkbox" ' + newOnChange + ' />' +
        '<label for="cb-' + containerID + '-' + count + '-' + id + '" class="' + containerID + '-label' + newItem + '">' + concept + newItemSpan + '</label>';
        id++;
      }
      html += '</div>';
      count++;
    }
  }
  if (newItemCount > 0) {
    toast({html: 'Added ' + newItemCount + ' new items to the list.', close: true});
  }
  $container.html(html);
  toggleTab(list, $container); // enable next tab iff list not empty
  var nextButtonClassSubstring = containerID; // identify next button by who enables it
  toggleNext(list, nextButtonClassSubstring); // enable next button iff list not empty
  $container.find('input[type=checkbox]').each( function (i, v) { // look through each element in $container
    if (currentlySelected.indexOf(v.value) !== -1) { // check if item was currentlySelected
      $($(v)[0]).prop('checked', true); // select item
    }
  });
};

/**
 * Toggle disabled state of a next button
 * @function
 * @param {array} - The list of items we are loading into the next page.
 * @param {string} - The ID of the container the list comes from.
 */
var toggleNext = function (list, nextButtonClassSubstring) {
  var nextButtonSelector = '.enabled-by-' + nextButtonClassSubstring; // identify next button by who enables it
  if (list.length > 0 || Object.keys(list).length > 0) {
    $(nextButtonSelector + ':not(.persist)').prop('disabled', false).css('display', 'inline');
  } else {
    $(nextButtonSelector + ':not(.persist)').prop('disabled', true).css('display', 'none');
  }
};

/**
 * Show the tab if there is anything to display in that tab.
 * @function
 * @param {array} list - An array containing the list of elements to display on the particular tab.
 * @param {object} $container - The jQuery selection for the container we are loading the list into.
 */
var toggleTab = function (list, $container) {
  var tabAnchor = '#' + $container.parent().attr('aria-labelledby');
  if (list.length > 0 || Object.keys(list).length > 0) { // items in list enable tabs
    $(tabAnchor).removeAttr('aria-disabled');
    $(tabAnchor).attr('href', $(tabAnchor).attr('data-href'));
    $(tabAnchor).parent().removeAttr('aria-hidden');
    $(tabAnchor).removeAttr('aria-hidden');
    $(tabAnchor).show();
  } else { // no items in list disable tabs
    $(tabAnchor).attr('aria-disabled', 'true').removeAttr('href');
    $(tabAnchor).hide();
    $(tabAnchor).parent().attr('aria-hidden', 'true');
  }
};

/**
 * Get the subroles associated with the roles.
 * @function
 * @param {array} roles - An array containing the selected roles.
 * @return {array} - An array containing the subroles.
 */
function getSubrolesFromRoles(roles) {
  var subroles = [];
  for (var i = 0; i < roles.length; i++) { // find the concepts associated with these objectives
    for (var j = 0; j < subrolesByRole[roles[i]].length; j++) {
      if (subroles.indexOf(subrolesByRole[roles[i]][j]) === -1) {
        subroles.push(subrolesByRole[roles[i]][j]);
      }
    }
  }
  return subroles;
}

/**
 * Gets the concepts associated with the objectives.
 * @function
 * @param {array} objectives - An array containing the selected objectives.
 * @return {array} - An array containing the concepts
 */
function getConceptsFromObjectives(objectives) {
  var concepts = [];
  for (var i = 0; i < objectives.length; i++) { // find the concepts associated with these objectives
    for (var j = 0; j < conceptsByObjective[objectives[i]].length; j++) {
      if (concepts.indexOf(conceptsByObjective[objectives[i]][j].toLowerCase()) === -1) {
        concepts.push(conceptsByObjective[objectives[i]][j].toLowerCase());
      }
    }
  }
  return concepts;
}

/**
 * Calculates the number of tools assocated with the list of concepts and displays a notice to the user on the specified page.
 * @function
 * @param {array} concepts - An array containing the selected concepts.
 * @param {string} div - A string containing the partial id of the container to put the message.
 */
function calculateNumberOfTools(concepts, div) {
  var tools = [];
  for (var i = 0; i < concepts.length; i++) {
    if (readIDsByConcept.hasOwnProperty(concepts[i])) {
      for (var j = 0; j < readIDsByConcept[concepts[i]].length; j++) {
        var toolID = readIDsByConcept[concepts[i]][j];
        if (tools.indexOf(toolID) === -1) {
          tools.push(toolID);
        }
      }
    }
  }
  $('#' + div + '-tool-count').html(tools.length + (tools.length === 1 ? ' tool' : ' tools' ) + ' found for the selected ' + div.replace(/-/g, ' ') + '(s).');
}

/**
 * Populate the #subrole container with subrole options for the selected roles.
 * @function
 */
var roleSelect = function () {
  var selectedElements = scrapeDictionaryToObject($("input[name='role-checkbox']:checked"), subrolesByRole);
  populateWithHeader(selectedElements, $('#subrole'), "subroleSelect()");
  var subroles = getSubrolesFromRoles(Object.keys(selectedElements));
  var relevance = $('#objective-relevance').val();
  var objectivesFromSubroles = [];
  var objectivesFromSubrolesRelevance = [];
  for (var i = 0; i <= relevance; i++) {
    for (var k = 0; k < subroles.length; k++) {
      if (objectivesBySubroleRelevance[i].hasOwnProperty(subroles[k])) {
        for (var j = 0; j < objectivesBySubroleRelevance[i][subroles[k]].length; j++) {
          if (objectivesFromSubroles.indexOf(objectivesBySubroleRelevance[i][subroles[k]][j]) === -1) {
            objectivesFromSubroles.push(objectivesBySubroleRelevance[i][subroles[k]][j]);
          }
        }
      }
    }
  }
  var concepts = getConceptsFromObjectives(objectivesFromSubroles);
  calculateNumberOfTools(concepts, 'role'); // pass the concepts to calculate the number of tools

  subroleSelect();
};

/**
 * Populate the #objective container with objective options for the selected subroles.
 * @function
 */
var subroleSelect = function () {
  var relevance = $('#objective-relevance').val();
  var objectivesFromSubroles = [];
  var objectivesFromSubrolesRelevance = [];
  for (var i = 0; i <= relevance; i++) {
    objectivesFromSubrolesRelevance = scrapeDictionary($("input[name='subrole-checkbox']:checked"), objectivesBySubroleRelevance[i]);
    for (var j = 0; j < objectivesFromSubrolesRelevance.length; j++) {
      if (objectivesFromSubroles.indexOf(objectivesFromSubrolesRelevance[j]) === -1) {
        objectivesFromSubroles.push(objectivesFromSubrolesRelevance[j]);
      }
    }
  }
  var list = [];
  if (objectivesFromSubroles.length > 0) {
    for (var prop in objectivesByFundamentalObjective) {
      if (objectivesByFundamentalObjective.hasOwnProperty(prop)) {
        for (var k = 0; k < objectivesFromSubroles.length; k++) {
          if (objectivesByFundamentalObjective[prop].indexOf(objectivesFromSubroles[k]) !== -1) {
            if (list.indexOf(prop) === -1) {
              list.push(prop);
            }
            break;
          }
        }
      }
    }
  }
  updateInterface(list, $('#fundamental-objective'), "fundamentalObjectiveSelect()");
  fundamentalObjectiveSelect();
};

/**
 * Get the list of all the objectives tied to the selected subroles.
 * @function
 * @return {array} - An array containing the objectives.
 */
var getObjectivesFromSubroles = function () {
  var objectivesFromSubroles = [];
  var objectivesFromSubrolesRelevance = [];
  var relevance = $('#objective-relevance').val();
  for (var i = 0; i <= relevance; i++) {
    objectivesFromSubrolesRelevance = scrapeDictionary($("input[name='subrole-checkbox']:checked"), objectivesBySubroleRelevance[i]);
    for (var j = 0; j < objectivesFromSubrolesRelevance.length; j++) {
      if (objectivesFromSubroles.indexOf(objectivesFromSubrolesRelevance[j]) === -1) {
        objectivesFromSubroles.push(objectivesFromSubrolesRelevance[j]);
      }
    }
  }
  return objectivesFromSubroles;
};

/**
 * Populate the #objective container with objectives determined by selected subroles and fundamental objectives.
 * @function
 */
var fundamentalObjectiveSelect = function () {
  var objectivesFromSubroles = getObjectivesFromSubroles();
  var objectivesFromFundamentalObjectives = scrapeDictionaryToObject($("input[name='fundamental-objective-checkbox']:checked"), objectivesByFundamentalObjective);
  var objectives = [];
  var ObjectivesFromSelectionsByFundamentalObjective = {};
  for (var i = 0; i < objectivesFromSubroles.length; i++) {
    for (var fundamentalObjective in objectivesFromFundamentalObjectives) {
      if (objectivesFromFundamentalObjectives[fundamentalObjective].indexOf(objectivesFromSubroles[i]) !== -1) {
        if (objectives.indexOf(objectivesFromSubroles[i]) === -1) {
          objectives.push(objectivesFromSubroles[i]);
        }
        if (typeof ObjectivesFromSelectionsByFundamentalObjective[fundamentalObjective] === 'undefined') {
          ObjectivesFromSelectionsByFundamentalObjective[fundamentalObjective] = [];
        }
        ObjectivesFromSelectionsByFundamentalObjective[fundamentalObjective].push(objectivesFromSubroles[i]);
      }
    }
  }
  var concepts = getConceptsFromObjectives(objectivesFromSubroles);
  calculateNumberOfTools(concepts, 'subrole'); // pass the concepts to calculate the number of tools
  concepts = getConceptsFromObjectives(objectives);
  calculateNumberOfTools(concepts, 'fundamental-objective'); // pass the concepts to calculate the number of tools
  populateWithHeader(ObjectivesFromSelectionsByFundamentalObjective, $('#objective'), "catchObjectiveSelection(event)");
  toggleTab(objectives, $('#objective')); // enable next tab iff list not empty
  var nextButtonClassSubstring = $('#objective').attr("id"); // identify next button by who enables it
  toggleNext(objectives, nextButtonClassSubstring); // enable next button iff list not empty
  objectiveSelect();
};

/**
 * Prevents the default check event from occuring and then selects all checkboxes which match the checkbox value.
 * @function
 * @param {event}  - The change event for the checkbox change.
 */
var catchObjectiveSelection = function (event) {
  event.preventDefault();
  $('#objective :input[value="' + $(event.target).val() + '"]').prop('checked', $(event.target).prop('checked'));
  objectiveSelect();
};

/**
 * Populate the #concept container with the concept options for selected objectives.
 * @function
 */
var objectiveSelect = function () {
  var selectedElements = scrapeDictionary($("input[name='objective-checkbox']:checked"), conceptsByObjective);
  var checked = selectedElements.map(function (element) {
    return element.toLowerCase()
  });
  calculateNumberOfTools(checked, 'objective');
  $('#concept').html('');
  updateInterface(selectedElements, $('#concept'));
  updateConcepts();
};

/**
 * Create an array of values taken from dictionary for the selected options.
 * @function
 * @param {object} selectedOptions - A jQuery selection of the checked checkboxes
 * @param {object} dictionary - The dictionary we are taking values from.
 * @return {array} - An array containing the elements from the dictionary which match the values in selectedOptions
 */
var scrapeDictionary = function (selectedOptions, dictionary) {
  var selectedElement = '';
  var selectedElements = [];
  var allSelectedElements = [];
  for (var i = 0; i < selectedOptions.length; i++) {
    selectedElement = selectedOptions[i].value;
    selectedElements = dictionary[selectedElement];
    if (typeof selectedElements === 'undefined') {
      selectedElements = [];
    }
    for (var j = 0; j < selectedElements.length; j++) {
      if (allSelectedElements.indexOf(selectedElements[j]) === -1) {
        allSelectedElements.push(selectedElements[j]);
      }
    }
  }
  return allSelectedElements;
};

/**
 * Get child values (properties) for a selected option from a specified object while the key values retained for use in headers
 * @function
 * @param {object} selectedOptions - A jQuery selection of the checked checkboxes
 * @param {object} dictionary - The dictionary we are taking values from.
 * @return {object} - An object containing the elements from the dictionary which match the values in selectedOptions
 */
var scrapeDictionaryToObject = function (selectedOptions, dictionary) {
  var selectedElement = '';
  var selectedElements = [];
  var allSelectedElements = [];
  var selectedElementsObject = {};
  for (var i = 0; i < selectedOptions.length; i++) {
    selectedElement = selectedOptions[i].value;
    selectedElements = dictionary[selectedElement];
    selectedElementsObject[selectedElement] = dictionary[selectedElement];
    if (typeof selectedElements === 'undefined') {
      selectedElements = [];
    }
    for (var j = 0; j < selectedElements.length; j++) {
      if (allSelectedElements.indexOf(selectedElements[j]) === -1) {
        allSelectedElements.push(selectedElements[j]);
      }
    }
  }
  return selectedElementsObject;
};

/**
 * Add checkboxes with specified values to the specified container.
 * @function
 * @param {array} list - An array containing the values to populare the checkboxes with.
 * @param {object} container - The jQuery selection which will hold the checkboxes.
 * @param {string} onChange - The function which will run when a checkbox is changed.
 * @param {number} count - Optional parameter which is used when populating with headers.
 * @return {string} - The HTML to create checkboxes.
 */
function addCheckboxes(list, container, onChange, count) {
  var containerID = container.attr('id');
  onChange = 'onchange="checkboxChangeHandler(\'' + containerID + '\');' + onChange + '"';
  count = (typeof count !== 'undefined') ? count : "0";
  var inputs = container.children('input');
  var id = inputs.length + 1;
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var concept = list[i];
    var numberOfToolsSpan = '';
    var numberOfTools = 0;
    if (containerID === 'concept') {
      var length = readIDsByConcept[concept.toLowerCase()].length;
      for (var j = 0; j < length; j++) {
        if (!resultSet.contains(readIDsByConcept[concept.toLowerCase()][j])) {
          numberOfTools++;
        }
      }
      if (numberOfTools === 1) {
        numberOfToolsSpan = ' <span class="tool-count">Add ' + numberOfTools + ' Tool' + '</span>';
      } else {
        numberOfToolsSpan = ' <span class="tool-count">Add ' + numberOfTools + ' Tools' + '</span>';
      }
    }
    html += '<input class="' + containerID + '-cb" data-parent="' + containerID + '" data-value="' + concept.replace(/"/g, '\&quot;') + '" type="checkbox" id="cb-' + containerID + '-' + count + '-' + id + '" value="' + concept.replace(/"/g, '\&quot;') + '" name="' + containerID + '-checkbox" ' + onChange + ' /><label for="cb-' + containerID + '-' + count + '-' + id + '" class="' + containerID + '-label">' + concept + numberOfToolsSpan + '</label>';
    id++;
  }
  return html;
}

/**
 * Search in descriptions for each word in query string from input and display results in div
 * @function
 * @deprecated
 */
var keywordSearch = function (div, input) {
  $('#' + div + ' *').remove();
  var keywords = getKeywords(input);
  for (var i = 0; i < keywords.length; i++) {
    for (var j = 0; j < decisionSectors.length; j++) {
      $.get('https://ofmpub.epa.gov/readwebservices/v1/ResourceAdvancedSearch',
        {
          ShortDescriptionForReports: keywords[i],
          DecisionSector: decisionSectors[j]
        }
      ).done(function (data) {
        for (var i = 0; i < data.length; i++) {
          getResourceDetail(data[i].ResourceId, div);
        }
      });
    }
  }
};

/**
 * Search for the READ IDs from the selected Concepts from input and display results in div
 * @function
 */
var conceptSearch = function () {
  resultSet.reset(); // remove from resultSet
  terminatedTools.reset();
  if ($.fn.DataTable.isDataTable('#results-table')) {
    $('#results-table').DataTable().rows('tr:not(.selected)').remove().draw(); // clear table of values not marked selected
  }
  $('#results-list .results-checkbox').each(function () { // clear results list of values not checked
    if (!$(this).prop('checked')) {
      $(this).parent().parent().parent().remove();
      resultTable.getToolSet().removeTool($(this).val()); // clear display data
    }
  });

  if (savedTools.getLength() === 0) {
    $('#results-tab').parent().attr('aria-hidden', 'true');
  }

  var concepts = getConcepts($('input[name="concept-checkbox"]:checked')); //get new concepts
  if (concepts.length < 1 && !savedTools.getLength()) {
    $('#results-container').hide();
    $('#results-container').attr('aria-hidden', 'true');
    $('.concept-search-button').text('Show Results');
    return;
  } else {
    searchParsedConcepts(concepts);
    localStorageSetItem('savedTools', { "toolSet" : savedTools.toolSet, "length" : savedTools.length });
  }
  var numberOfTools = resultSet.getLength();
  if (savedTools.getLength()) {
    for (var toolId in savedTools.getToolSet()) {
      if (!resultSet.getToolSet().hasOwnProperty(toolId)) {
        numberOfTools++;
      }
    }
  }
  if (numberOfTools === 1) {
    $('.concept-search-button').text('Show ' + numberOfTools + ' Result');
  } else {
    $('.concept-search-button').text('Show ' + numberOfTools + ' Results');
  }
};

/**
 * Displays the number of tools which will be added/removed from selecting/deselecting a particular concept
 * @function
 */
function updateConcepts() {
  $('#concept .tool-count').each(function () { // for each tool label
    var $conceptCheckbox = $('#' + $(this).parent().attr('for')); // get associated checkbox
    var concept = $conceptCheckbox.val().toLowerCase(); // get associated concept
    var length = readIDsByConcept[concept].length; // number of tools related to this concept
    var numberOfTools = 0;
    if (!$('#' + $(this).parent().attr('for')).prop('checked')) { // if this is not checked
      for (var j = 0; j < length; j++) {
        var toolId = readIDsByConcept[concept][j];
        if (!resultSet.contains(toolId) && !savedTools.contains(toolId)) { // count the number of tools that are not in the result set
          numberOfTools++;
        }
      }
      if (numberOfTools === 1) {
        $(this).text(numberOfTools + ' Tool');
      } else {
        $(this).text(numberOfTools + ' Tools');
      }
    } else {
      for (var k = 0; k < length; k++) {
        var toolId = readIDsByConcept[concept][k];
        if (resultSet.toolIsUnique(toolId) && !savedTools.contains(toolId)) { // count the number of unique tools tied to this concept
          numberOfTools++;
        }
      }
      if (numberOfTools === 1) {
        $(this).text(numberOfTools + ' Tool');
      } else {
        $(this).text(numberOfTools + ' Tools');
      }
    }
  });
}

/**
 * Runs a concept search and updates the list of concepts
 * @function
 */
function updateConceptsandResults() {
  conceptSearch('results-list', $('input[name="concept-checkbox"]:checked'));
  updateConcepts();
}

/**
 * Display the current result set.
 * @function
 */
var displayResults = function () {
  if (resultSet.getLength() > 0 || savedTools.getLength() > 0) { // if there are saved tools or results
    toggleTab(Object.keys(resultSet.getToolSet()).concat(Object.keys(savedTools.getToolSet())), $('#tools')); // send an array containing the results and saved tools to toggle tab
    activateNextTab($('#results-tab'), 'wizard.html#results-tab'); // activate the reults tab
    if (!resultSet.isEqual(resultTable.getToolSet())) { // if the results are new create the table and display results
      $('#rl-loader').removeAttr('aria-hidden').show();
      $('#toggle-unsupported-1, #toggle-unsupported-2, #toggle-unsupported-3').prop('disabled', true);
      createDataTable('results');
      $('#result-info').html('<span id="number-of-results">' + resultSet.getLength() + " result(s) found</span> for selected concepts.");
      toolCache.handleToolSet(resultSet, resultTable.displayTools.bind(resultTable));
    }
  } else {
    $('#results-tab').parent().attr('aria-hidden', 'true'); // if no saved tools or results then hide the results tab and tell them to pick a concept
    toast({html: 'Please select a concept.', close: true});
  }
};

/**
 * Execute the conceptSearch and displayResults functions.
 * @function
 * @deprecated
 */
var findAndDisplayResults = function () {
  conceptSearch('results-list', $('input[name=\x22concept-checkbox\x22]:checked'));
  displayResults();
};

/**
 * Extract text values of the passed in jQuery object and store in an array.
 * @function
 * @param {object} input - jQuery selection of the checked concept checkboxes.
 * @return {array} - An array containing the selected concepts values.
 */
var getConcepts = function (input) {
  var concept = '';
  var concepts = [];
  $(input).each(function () {
    concept = $(this).val();
    if (concept.length > 1) {
      concepts.push(concept.toLowerCase());
    }
  });
  return concepts;
};

/**
 * Process the selected concepts into their constituent words to serve as keywords.
 * @function
 * @deprecated
 * @param {object} input - The jQuery selection containing the selected concepts.
 * @return {array} - An array of words.
 */
var getKeywords = function (input) {
  var concept = '';
  var concepts = [];
  var keyword = '';
  var keywords = [];
  $(input).each(function () {
    concept = $(this).val();
    if (concept.length > 1) {
      keywords = concept.split(' ');
      for (var i = 0; i < keywords.length; i++) {
        keyword = keywords[i];
        if ((concepts.indexOf(keyword) === -1) && (keyword.length > 3)) {
          concepts.push(keyword);
        }
      }
    }
  });
  return concepts;
};

/**
 * Finds all concepts that are associated with the selected concepts by finding all concepts which are connected to the same objectives.
 * @function
 */
var broadenConcepts = function () {
  if ($('input[name="concept-checkbox"]:checked').length === 0) {
    toast({html: 'Please select a concept.', close: true});
    return;
  }
  var allConcepts = [];
  var checkedConcepts = [];
  var associatedConcepts = [];
  $("input[name='concept-checkbox']").each(function () {
    if ($(this).prop("checked")) {
      checkedConcepts.push($(this).val());
    }
    allConcepts.push($(this).val());
  });

  for (var k = 0; k < checkedConcepts.length; k++) { // iterate through checkedConcepts
    for (var objective in conceptsByObjective) { // find objectives that have this concepts, and thus associated concepts
      if (conceptsByObjective.hasOwnProperty(objective)) {
        if (conceptsByObjective[objective].indexOf(checkedConcepts[k]) !== -1) {
          for (var j = 0; j < conceptsByObjective[objective].length; j++) {
            if (associatedConcepts.indexOf(conceptsByObjective[objective][j]) === -1 && conceptsByObjective[objective][j].length > 1 && allConcepts.indexOf(conceptsByObjective[objective][j]) === -1) {
              associatedConcepts.push(conceptsByObjective[objective][j]);
            }
          }
        }
      }
    }
  }
  if (associatedConcepts.length === 0) {
    toast({html: 'No related concepts found.', close: true});
  }
  var html = addCheckboxes(associatedConcepts, $('#concept'));
  $('#concept').append(html);
};

/**
 * Selects the next tab when next button is activated
 * @function
 * @param {object} $nextTab - The next tab
 * @param {string} URLToShow - thisDocument.html#someHashValueToJumpTo
 */
var activateNextTab = function ($nextTab, URLToShow) {
  var firstString;
  if ($nextTab.parent().attr('aria-hidden') === 'true') {
    if ('aeiouhAEIOUH'.indexOf($nextTab.attr('data-name')[0]) !== -1) {
      firstString = 'Select an ';
    } else {
      firstString = 'Select a ';
    }
    toast({html: firstString + $nextTab.attr('data-name') + ' to proceed.', close: true});
  } else {
    if (typeof(URLToShow) !== 'undefined' && window.innerWidth < 480) {
      window.location = URLToShow;
    }
    $nextTab.parent().siblings('li').children('[role=tab][aria-selected=true]').attr('aria-selected', 'false'); // deactivate active tab
    $nextTab.attr('aria-selected', 'true'); // list this tab as active
    $nextTab.prop('disabled', false); // enable tab
    $nextTab[0].click(); // activate tab
  }
};

/**
 * Select the previous visible tab.
*/
var activatePreviousUnhiddenTab = function () {
  var pageName = 'wizard.html'; // parametrize the name of the page
  var $currentTab = $('.menu-internal[aria-selected="true"]')[0]; // get the active tab
  for (var i = $('.menu-internal').length - 1; i >= 0; i--) { // cycle backwards through menu
    var $tab = $('.menu-internal')[i]; // get the ith tab once
    if ($tab.id === $currentTab.id) {
      var activateNextUnhiddenTabFlag = true; // flag when current tab is seen
      continue;
    }
    if (activateNextUnhiddenTabFlag === true
        && $tab.getAttribute('aria-hidden') == null
        && $tab.getAttribute('aria-disabled') !== 'true') {
      var $tabToActivate = $('#' + $tab.id); // refer to tab to activate
      activateTab($tabToActivate, pageName + '#' +  $tab.id); // activate previous tab shown
      break;
    }
  }
}

/**
 * Selects the specified tab
 * @function
 * @param {object} $nextTab - The tab to show.
 * @param {string} URLToShow - thisDocument.html#someHashValueToJumpTo
 */
var activateTab = function ($nextTab, URLToShow) {
  if (typeof(URLToShow) !== 'undefined' && window.innerWidth < 480) {
    window.location = URLToShow;
  }
  $nextTab.parent().siblings('li').children('[role=tab][aria-selected=true]').attr('aria-selected', 'false'); // deactivate active tab
  $nextTab.attr('aria-selected', 'true'); // list this tab as active
  $nextTab.prop('disabled', false); // enable tab
  $nextTab[0].click(); // activate tab
};

$('#role-help-button').on('click', function () {
  $('#role-help').toggle();
});

$('#subrole-help-button').on('click', function () {
  $('#subrole-help').toggle();
});

$('#fundamental-objective-help-button').on('click', function () {
  $('#fundamental-objective-help').toggle();
});

$('#objective-help-button').on('click', function () {
  $('#objective-help').toggle();
});

$('#concept-help-button').on('click', function () {
  $('#concept-help').toggle();
});

// Select roles, subroles... etc.
$('#select-roles, #deselect-roles').on('click', function () {
  selectAll('role', roleSelect);
});
$('#deselect-roles').on('click', function () {
  deselectAll('role', roleSelect);
});

$('#select-subroles').on('click', function () {
  selectAll('subrole', subroleSelect);
});
$('#deselect-subroles').on('click', function () {
  deselectAll('subrole', subroleSelect);
});

$('#select-fundamental-objectives').on('click', function () {
  selectAll('fundamental-objective', fundamentalObjectiveSelect);
});
$('#deselect-fundamental-objectives').on('click', function () {
  deselectAll('fundamental-objective', fundamentalObjectiveSelect);
});

$('#select-objectives').on('click', function () {
  selectAll('objective', objectiveSelect);
});
$('#deselect-objectives').on('click', function () {
  deselectAll('objective', objectiveSelect);
});

$('#select-concepts').on('click', function () {
  selectAll('concept');
  updateConceptsandResults();
});
$('#deselect-concepts').on('click', function () {
  deselectAll('concept');
  updateConceptsandResults();
});

// Next button listeners
$('#role-next-button, #role-next-button-mobile').on('click', function () {
  activateNextTab($('#subrole-tab'), 'wizard.html#subrole-tab');
});

$('#subrole-next-button, #subrole-next-button-mobile').on('click', function () {
  activateNextTab($('#fundamental-objective-tab'), 'wizard.html#fundamental-objective-tab');
});

$('#fundamental-objective-next-button, #fundamental-objective-next-button-mobile').on('click', function () {
  activateNextTab($('#objective-tab'), 'wizard.html#objective-tab');
});

$('#objective-next-button, #objective-next-button-mobile').on('click', function () {
  activateNextTab($('#concept-tab'), 'wizard.html#concept-tab');
  updateConcepts();
});

$('#show-results-button, #show-results-button-mobile').on('click', function () {
  displayResults();
});

// Back button listeners
$('#subrole-back-button, #subrole-back-button-mobile').on('click', function () {
  activateTab($('#role-tab'), 'wizard.html#role-tab');
});

$('#fundamental-objective-back-button, #fundamental-objective-back-button-mobile').on('click', function () {
  activateTab($('#subrole-tab'), 'wizard.html#subrole-tab');
});

$('#objective-back-button, #objective-back-button-mobile').on('click', function () {
  activateTab($('#fundamental-objective-tab'), 'wizard.html#fundamental-objective-tab');
});

$('#concept-back-button, #concept-back-button-mobile').on('click', function () {
  activateTab($('#objective-tab'), 'wizard.html#objective-tab');
});

$('#navbar-back, #bottom-bar-back').on('click', function () {
  activatePreviousUnhiddenTab();
});

$('#feedback-form').on('click', function () {
  submitFeedback(event);
});

// Expand concept 
$('#expand-concepts').on('click', function () {
  broadenConcepts();
});

// Select all buttons
$("#select-all-btn").on('click', function () {
  selectAllToolsButton('results');
});
$("#deselect-all-btn").on('click', function () {
  deselectAllToolsButton('results');
});

// Save selected
$("#save-selected-btn").on('click', function () {
  saveSelectedRecords('results-list');
});

// Export button
$("#export-btn").on('click', function () {
  exportTools('results-list');
});
