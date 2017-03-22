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
