// JavaScript Document
//var endpoint = 'http://localhost:8081/rest/read/';
var endpoint = '/rest/read/';
try {
	var autocompleteArrays = {
		Name: ["The Energy and Emissions Reduction Policy Analysis Tool","Envision Tomorrow","Global Emission Model for Integrated Systems","Clean Air and Climate Protection Software","SmartGAP","Intelligent Transportation System Deployment Analysis System","The Greenhouse Gases, Regulated Emissions, and Energy Use in Transportation Model","Integrated Transport and Health Impact Modelling Tool","Surface Transportation Efficiency Analysis Model","GHG Emissions from Transport or Mobile Sources Calculator","Alternative Fuel Life-Cycle Environmental and Economic Transportation","Clean Cities Area of Interest 4: Alternative Fuel and Advanced Technology Vehicles Pilot Program Emissions Benefit Tool","AirCRED","Random-Utility-Based Multiregional Input-Output","C2RouteApp","StreetMix","Infrastructure Voluntary Evaluation Sustainability Tool","Hydrological Simulation Program - FORTRAN","Environmental Assessment System for Environmental TECHnologies","MetroQuest","National Stormwater Calculator","Scenario Planning Analytical Resources Core INDEX","Food Waste Assessment Tool","Waste Target-Setting Tool","System for Urban Stormwater Treatment and Analysis Integration","Waste Management Planning system","Electronics Environmental Benefits Calculator","Landfill Gas Emissions Model","Storm and Sanitary Analysis","InfoSWMM","MIKE URBAN","CivilStorm","PCSWMM","Source Loading and Management Model for Windows","Municipal Solid Waste Decision Suppot Tool","Stormwater & Wastewater Managment Model","SimaPro","Umberto NXT","Waste and Resources Assessment Tool for the Environment","Integrated Waste Management Tool for Municipalities","Regional Energy Deployment System Model","Targeted Retrofit Energy Analysis Tool","ATHENA Impact Estimator for Buildings 4","EnergyPlus","eSight","Solar Reflectance Index Calculator","Building Life Cycle Cost","VE-Ware","Eco-Bat","Quick Energy Simulation Tool","VE-Toolkit","Urban Footprint","Building for Environmental and Economic Sustainability","Roof Savings Calculator","Federal Renewable Energy Screening Assistant","Cool Roof Calculator","Forestry and Agricultural Sector Optimization Model - Greenhouse Gas Version","Global Timber Model","Social Values for Ecosystem Services","Watershed Management Optimization Support Tool v. 1","Wildlife Habitat Benefits Estimation Toolkit","ComPlan","UrbanSim","UPlan: Urban Growth Model","NatureServe Vista","RapidFire","CommunityViz","Conservation Planning System","LandUse Analyst","IDRISI"],
		Acronym: ["EERPAT","ET+","GEMIS","CACP","SmartGAP","IDAS","GREET","ITHIM","STEAM","GHG Emissions f","AFLEET","Clean Cities Ar","AirCRED","RUBMRIO","C2RouteApp","StreetMix","INVEST","HSPF","EASETECH","MetroQuest","SWC","SPARC INDEX","Food Waste Asse","Waste Target-Se","SUSTAIN","WAMPS","Electronics Env","LandGEM","Storm and Sanit","InfoSWMM","MIKE URBAN","CivilStorm","PCSWMM","WinSLAMM","MSWDST","XPSWMM","SimaPro","Umberto NXT","WRATE","Integrated Wast","ReEDS","TREAT","ATHENA Impact E","E+","eSight","SRI","BLCC5","VE-Ware","Eco-Bat","eQuest","VE-Toolkit","Urban Footprint","BEES","RSC","FRESA","Cool Roof Calcu","FASOM-GHG","GTM Model","SolVES","WMOST","Wildlife Habita","ComPlan","UrbanSim","UPlan: Urban Gr","NatureServe Vis","RapidFire","CommunityViz","C-Plan","LandUse Analyst","IDRISI"],
		ShortDescriptionForReports: ["EERPAT","was","developed","to","assist","state","transportation","agencies","with","analyzing","greenhouse","gas","reduction","scenarios","and","alternatives","for","use","in","the","planning","process","development","of","climate","action","plans","scenario","exercises","Envision","Tomorrow","is","set","urban","regional","tools","that","can","be","used","model","feasibility","on","site-by-site","basis","as","well","create","evaluate","multiple","land","test","refine","produce","small-area","Perform","complete","life-cycle","computations","variety","emissions","determine","resource","analyze","costs","allow","aggregation","into","so-called","CO2","equivalents","SO2","tropospheric","ozone","precursor","potential","TOPP","CACP","2009","an","management","tool","calculates","tracks","reductions","gases","criteria","air","pollutants","associated","electricity","fuel","waste","disposal","SmartGAP","evaluating","impact","various","smart","growth","policies","designed","high-level","evaluation","at","scale","bridge","distance","between","during","visioning","IDAS","sketch-planning","software","analysis","practitioners","estimate","benefits","Intelligent","Transportation","Systems","ITS","investments","predict","relative","more","than","60","types","To","fully","energy","emission","impacts","advanced","vehicle","technologies","new","fuels","cycle","from","wells","wheels","through","material","recovery","need","considered","GREET","allows","resea","ITHIM","provides","integrated","health","assessment","transport","changes","physical","activity","road","traffic","injury","risk","pollution","These","are","linked","either","STEAM","uses","information","travel","demand","modeling","compute","net","value","mobility","safety","attributable","regionally","important","projects","This","spreadsheet","CH4","N2O","privately","owned","vehicles","public","by","rail","or","water","agricultural","construcion","equipment","examines","both","environmental","economic","alternative","has","been","created","Clean","Cities","Funding","Opportunity","Announcement","Area","Interest","Alternative","Fuel","Advanced","Technology","Vehicles","Pilot","Program","The","based","off","AirCRED","model's","methodology","using","EPA's","MOBILE6","AirCred","estimates","fleet","alternative-fuel","states","estimating","credits","non-attainment","areas","help","operators","meet","Department","Energy's","Ene","RUBMRIO","freely","available","open-source","transportation-economic","simulates","flow","goods","labor","across","multiregional","area","trade","regions/zones","motivated","foreign","domestic","export","demands","Route","optimization","mainly","geared","toward","StreetMix","streetscape","design","visualization","Add","bike","paths","widen","sidewalks","lanes","learn","how","all","this","your","community","INVEST","practical","web-based","collection","voluntary","best","practices","integrate","sustainability","their","programs","While","it","HSPF","simulate","hydrologic","quality","processes","pervious","impervious","surfaces","streams","well-mixed","impoundments","Performs","life","LCA","complex","systems","handling","heterogeneous","flows","MetroQuest","online","engagement","platform","configuration","comprised","series","screens","guide","participants","learning","about","project","providing","valuable","input","pla","SWC","desktop","application","annual","amount","rainwater","frequency","runoff","specific","site","anywhere","United","States","including","Puerto","Rico","Estimates","local","soil","conditions","cover","historic","rainfall","SPARC","cloud-served","data","transformation","service","supports","INDEX","Online","Food","Waste","Assessment","Tools","cost","competitiveness","food","source","donation","composting","recycling","yellow","grease","Intended","serve","goal-setting","actual","reasonable","estimated","current","weights","leaving","care","facility","SUSTAIN","decision","support","system","assists","stormwater","professionals","developing","implementing","control","measures","protect","waters","goals","WAMPS","enables","users","via","web","interface","carry","out","calculations","order","compare","performance","different","institutional","purchasers","Federal","Electronic","Challenge","FEC","program","quantifying","environmentally","sound","electronic","Calculator","econom","Landfill","Gas","Emissions","Model","LandGEM","automated","estimation","Microsoft","Excel","rates","total","landfill","methane","carbon","dioxide","nonmethane","organic","compounds","individual","pollu","Modeling","package","designing","drainage","sewers","sanitary","InfoSWMM","dynamic","rainfall-runoff","simulation","single","event","long-term","continuous","quantity","primarily","MIKE","URBAN","modelling","storm","distribution","CivilStorm","performs","full","range","necessary","verification","hydraulic","capacity","demonstrating","compliance","GIS","spatial","EPA","SWMM5","wastewater","watershed","WinSLAMM","quantify","volume","loading","effectiveness","MSWDST","municipal","solid","strategies","XPSWMM","comprehensive","river","floodplains","combined","SimaPro","Life","Cycle","Software","user","collect","monitor","products","services","cycles","systematic","transparent","way","following","ISO","140","Multi-purpose","calculating","footprint","increasing","efficiency","production","ecological","WRATE","stages","processing","calculation","takes","account","infrastructure","its","operation","any","materials","ene","consumed","released","specified","structured","so","municipality","Regional","Energy","Deployment","System","ReEDS","capacity-expansion","deployment","electric","power","generation","transmission","throughout","contiguous","TREAT","audit","building","With","thorough","libraries","single-family","multifamily","versions","ability","savings","retrofits","comprehensiv","An","decision-support","selection","mixes","other","options","will","minimize","building's","EnergyPlus","thermal","load","Based","user's","description","perspective","make-up","mechanical","heating","coolin","Desktop","consumption","against","degree","day","Understand","where","made","on-going","usage","SRI","calculatior","Excel-based","surface","temperature","roof","product","under","prescribed","BLCC","conducts","analyses","buildings","building-related","components","Typically","designs","have","higher","initial","but","lower","operating","VE-Ware","whole-building","Eco-Bat","perform","anlysis","especially","conceptual","phase","It","architects","engineers","who","want","assess","envionmental","existing","eQuest","detailed","techniques","without","requiring","extensive","experience","\"art\"","Conduct","CAD","models","earliest","Quantify","early","ideas","daylight","LEED","Intregrate","‘Cycles","Analysis’into","UrbanFootprint","powerful","organization","framework","results","metrics","miles","traveled","VMT","BEES","approach","14040","standards","Roof","Savings","industry-consensus","calculator","commercial","residential","simulations","hour-by-hour","calculated","pr","FRESA","identifying","renewable","appropriate","implementation","several","reduce","Cooling","Heating","Flat","Roofs","Non-Black","Surfaces","version","small","medium-sized","facilities","purchase","charge","peak","monthly","FASOM-GHG","multi-period","intertemporal","price-endogenous","mathematical","programming","simulating","future","policy","markets","GHG","fluxes","within","US","forest","sectors","examine","global","timber","supply","accounting","GIS-based","map","perceived","social","values","ecosystem","such","aesthetics","biodiversity","recreation","analyzed","stakeholder","groups","distinguished","attitudes","objective","WMOST","resources","managers","planners","screen","wide-range","jurisdiction","cost-effectiveness","Wildlife","Habitat","Benefits","Estimation","Toolkit","user-friendly","generate","quantitative","generated","natural","interest","them","ComPlan","relies","prototypical","definitions","elements","patterns","resulting","socioeconomic","characteristics","those","UrbanSim","software-based","supporting","incorporating","interactions","economy","environment","UPlan","simple","rule-based","needed","space","each","type","demographics","assigned","attractiveness","locations","unsuitable","NatureServe","Vista","scenario-based","weight","diverse","making","suitable","conservation","species","ecosyst","RapidFire","spreadsheet-based","statewide","county","jurisdiction-level","emerged","could","inform","region","GIS-Based","sketch","3-D","suitability","C-Plan","links","achieving","explicit","targets","irreplaceability","landscape","terms","compositi","LandUse","Analyst","multi-category","Argus","ONE","conduct","subjected","leveled","influencing","Widely","prioritization","efforts","Land","Change","Modeler","you","rapidly","change","REDD"],
		Keywords: ["Placeholder1"],
		ModelInputs: ["Placeholder2"],
		OutputVariables: ["Placeholder3"],
		ModelEvaluation: ["Placeholder4"],
	};
	var defaultAutoComplete = [];
	defaultAutoComplete = defaultAutoComplete.concat(autocompleteArrays.Name, autocompleteArrays.Acronym, autocompleteArrays.ShortDescriptionForReports, autocompleteArrays.Keywords);
  $("#simpleSearchText").autocomplete({
    source: defaultAutoComplete
  });
  $("#detailed-search-text").autocomplete({
    source: defaultAutoComplete
  });
} catch (err) {
  console.log(err);
}

/**
 * Resets the Autocomplete source based on which Search Fields are checked
 */
$('input[name="search-field"]').click(function () {
	var $textField = $("#detailed-search-text");
	var autocomplete = [];
	$textField.autocomplete('destroy');
	$('input[name="search-field"]:checked').each(function () { // for each checked Search Field
		autocomplete = autocomplete.concat(autocompleteArrays[$(this).val()]); // concat the array of terms
	});
	$textField.autocomplete({
    source: autocomplete // create new auto complete with new terms 
  });
});

function radiovalue(radios) {
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
}

function multiSelectValue(multiselect) {
  var selected = [];
  for (var i = 0; i < multiselect.length; i++) {
    if (multiselect.options[i].selected) {
    	selected.push(multiselect.options[i].value);
    }
  }
  return selected;
}

function checkBoxValue(multiselect) {
  var selected = [];
  for (var i = 0; i < multiselect.length; i++) {
    if (multiselect[i].checked) {
    	selected.push(multiselect[i].value);
    }
  }
  return selected;
}

function getDetails(id) {
	var xmlhttp;
  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else { // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET", endpoint + "record?id=" + id, false);
  xmlhttp.send();
  if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    var raw_response = xmlhttp.responseText;
    var response = raw_response.replace(/^"/, '').replace(/"$/, '').replace(/\\/g, '');
    var json_obj = JSON.parse(response);
    return json_obj[0];
  }
}

function radioClear(radio) {
  for (var i = 0, length = radio.length; i < length; i++) {
    if (radio[i].checked) {
      // do whatever you want with the checked radio
      radio[i].checked = false;
      // only one radio can be logically checked, don't check the rest
      break;
    }
  }
}

function checkboxClear(checkbox) {
  for (var i = 0, length = checkbox.length; i < length; i++) {
    if (checkbox[i].checked) {
      checkbox[i].checked = false;
    }
  }
}

function multiselectClear(multiselect) {
  for (var i = 0, length = multiselect.length; i < length; i++) {
    if (multiselect[i].selected) {
      multiselect[i].selected = false;
    }
  }
}

function detailClearForm() {
  $("#detailDecisionSelect")[0].value = "undefined";
  $("#detailSearchText")[0].value = "";
  checkboxClear(document.getElementsByName('RadioEnvironment'));
  checkboxClear(document.getElementsByName('CheckBase'));
  multiselectClear(document.getElementById('selectExtent'));
  //multiselectClear(document.getElementById('selectOutput'));
  //radioClear(document.getElementsByName('RadioSoftware'));
}
