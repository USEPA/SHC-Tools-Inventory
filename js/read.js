// JavaScript Document
$(document).ready(function() {
  $("#Tabs1").tabs();

  $(function() {
    $("#dialog-message").dialog({
      dialogClass: "alert",
      autoOpen: false,
      resizable: false
    });
  });
  $("[href='#tabsBrowse']").hide();
  $("[href='#tabsResults']").hide();
  $("[href='#tabsSelected']").hide();
  $("[href='#tabsSaved']").hide();
  //    $(".ui-icon-close").hide();
  //    $("[name='resultclose']").click(function(){
  //            $("[href='#tabsResults']").hide();
  //            $(this).hide();
  //        }
  //    );
  //    $("[href='selectedclose']").click(function(){
  //                $("[href='#tabSelected']").hide();
  //                $(this).hide();
  //    });
  loadModels();
});

//var endpoint = 'http://localhost:8081/rest/read/';
var endpoint = '/rest/read/';
try {
  var huge_array = [
    "limited", "wetlands", "saver", "monte", "yellow", "facilities", "entropy", "integrity", "increase", "pedro", "Global Emission Model for Integrated Systems", "electricity", "disability", "bike", "communityviz", "under", "recycle", "updated", "risk", "regional", "handling", "every", "updates", "wikispaces", "electronics", "StreetMix", "upload", "browsers", "indices", "esight", "cmr", "methane", "force", "phones", "estimates", "direct", "tires", "second", "street", "estimated", "mega", "preferences", "selected", "profitability", "supplied", "fossil", "conduct", "new", "net", "increasing", "particulate", "med", "multifamily", "prepubc", "residual", "protection", "ET+", "active", "Watershed Management Optimization Support Tool v. 1", "cardboard", "culp", "dry", "property", "forum", "smartgap", "employees", "economics", "reports", "analysts", "suitable", "changes", "greyfield", "joshua", "topography", "projection", "classification", "mobility", "whprp", "conflicts", "unix", "socioeconomic", "counts", "total", "unit", "monetization", "hospital", "landfilled", "calc", "assessment", "eerpat", "watts", "toolkit", "phone", "warm", "biblio", "ware", "must", "springer", "word", "room", "mn", "GEMIS", "roof", "movies", "oxide", "GEM", "ms", "revenues", "could", "exterior", "mpg", "household", "reviewing", "want", "david", "argonne", "end", "recovery", "MSWDST", "eng", "travel", "feature", "hov", "how", "hot", "env", "iclei", "toxic", "harlan", "maizlish", "description", "manuals", "types", "mtco", "purchase", "chilled", "third", "greet", "maintain", "green", "order", "wind", "transporation", "operations", "cumulative", "office", "citiesthatwork", "defenders", "over", "thesis", "illuminance", "amgad", "orthophotos", "production", "uwe", "wales", "schmidt", "versus", "them", "affected", "diseases", "combination", "roost", "zoning", "gecsc", "penetration", "effects", "payback", "one", "competitiveness", "tvtz", "envionmental", "ventilation", "reasonable", "each", "expectancy", "blurbs", "series", "diane", "carry", "epawaste", "laboratory", "motorized", "enclosure", "burnham", "network", "driving", "quantify", "dst", "diesel", "content", "assignment", "gov", "grease", "linear", "ucdavis", "city", "threatened", "surveys", "free", "redution", "formation", "biological", "estimate", "topp", "delight", "iswm", "created", "days", "iso", "brownfields", "speeds", "benchmarking", "narratives", "features", "iinas", "floors", "insulation", "easewaste", "electronic", "mercury", "service", "engagement", "eqv", "needed", "rates", "miller", "percentage", "john", "exposures", "urban", "ceiling", "tool", "serve", "wastes", "warmong", "urbanfootprint", "western", "sulphur", "distance", "target", "project", "matter", "classes", "skimmed", "historical", "contribution", "enables", "acquisition", "displays", "bridge", "furans", "willingness", "equestv", "raw", "increment", "lbl", "contents", "implemented", "academic", "thorough", "sound", "recommended", "practices", "doors", "effectiveness", "wells", "metrics", "germany", "visualizations", "phase", "coil", "jean", "grave", "Waste Reduction Model", "zealand", "doi", "environmental", "medical", "flow", "doe", "freeway", "lpg", "quantifying", "calculates", "dot", "reductions", "Waste Target-Setting Tool", "random", "infrared", "solutions", "earth", "availability", "menz", "envisiontomorrow", "rico", "abs", "sustainabilityroadmap", "screening", "integrate", "ocr", "anlysis", "desorption", "RapidFire", "webarchive", "professionals", "de", "fluid", "naturalgas", "dr", "bat", "covering", "public", "AFLEET", "architecture", "percentile", "analytical", "freshwater", "steam", "reference", "characterisics", "zones", "result", "Intelligent Transportation System Deployment Analysis System", "best", "subject", "combustion", "capacity", "streetmix", "artificial", "injuries", "score", "conceptual", "approach", "wtp", "simapro", "stakeholder", "ws", "wp", "carbon", "climate", "accident", "dvrpc", "logix", "argus", "against", "planned", "uni", "login", "com", "and", "camsys", "widen", "kwh", "coolcalcenergy", "femp", "height", "tons", "WMOST", "applicability", "loaded", "rallapalli", "smith", "Targeted Retrofit Energy Analysis Tool", "billing", "basis", "holdings", "remanufacuring", "been", "blower", "commission", "bees", "interest", "basic", "tutorials", "flexible", "basin", "containers", "website", "Cool Roof Calculator", "life", "quantities", "SRI", "applied", "microns", "harms", "publicly", "air", "dept", "annelore", "energyplus", "aid", "balance", "study", "characterizing", "vulnerability", "is", "it", "conditioned", "soils", "C-Plan", "cans", "waddell", "in", "comparative", "conditioner", "seattle", "ie", "id", "surcharge", "bottles", "perform", "make", "format", "complex", "inventory", "elgowainy", "dhv", "several", "social", "rail", "workforce", "waterborne", "pubs", "runoff", "ownership", "opportunity", "cycle", "simulates", "prescribed", "enerlogic", "scenario", "programs", "weitz", "efficient", "savings", "materials", "epi", "quantitative", "the", "investments", "epa", "protocol", "proposed", "Surface Transportation Efficiency Analysis Model", "newcastle", "sequestration", "assigned", "purchasing", "human", "ghgprotocol", "facts", "yes", "previous", "visualization", "sciences", "haz", "jefferson", "board", "has", "egan", "municipal", "getrecord", "possible", "VE-Ware", "objective", "cultural", "performance", "streetscape", "UrbanSim", "advanced", "lci", "county", "manual", "specific", "groundwater", "security", "www", "decisionmaking", "envision", "orlando", "consultants", "thorneloe", "multiple", "tutorial", "embodied", "for", "collect", "ice", "totals", "landscape", "iwm", "participation", "core", "repository", "discount", "phev", "peer", "manufacturing", "permitted", "selva", "chapter", "empowerment", "census", "mswdst", "dollars", "beta", "annualized", "ensure", "horizon", "islands", "efforts", "considerations", "managers", "retrofits", "presence", "balances", "ecology", "ntaqs", "jena", "sox", "Solar Reflectance Index Calculator", "gis", "support", "initial", "virgin", "joseph", "fraction", "was", "lowest", "head", "medium", "hirsch", "FRESA", "notifications", "heat", "solar", "overburden", "analyst", "anjum", "toolkits", "construcion", "versions", "type", "maximum", "prioritization", "occupancies", "stages", "dues", "pricing", "passenger", "computing", "simulations", "accounting", "distributions", "trip", "physical", "nh", "vista", "no", "na", "generally", "leed", "setting", "alleghany", "digital", "test", "developers", "node", "ultrans", "combustor", "utilities", "diet", "scores", "variable", "nxt", "modules", "daily", "cohesion", "akbari", "time", "effluents", "itemid", "concept", "global", "alternatives", "ost", "osw", "england", "mile", "llc", "retrofit", "recharge", "layers", "depend", "zone", "environment", "charge", "aspx", "thho", "choice", "little", "governments", "perceived", "respiratory", "prohibitor", "solves", "level", "Municipal Solid Waste Decision Suppot Tool", "standards", "discrete", "defaults", "quick", "loads", "round", "dir", "Urban Footprint", "work", "rents", "htm", "obsolete", "mtce", "cost", "targets", "purchasers", "minimization", "assistance", "shares", "current", "international", "aquisistion", "supporting", "transportation", "water", "attainment", "groups", "alone", "along", "change", "institute", "commonly", "trial", "sparcindex", "potable", "studies", "spatially", "statewide", "iph", "bs", "dennison", "blcc", "market", "working", "msw", "properties", "scenarios", "andy", "bcsherrouse", "https", "criteria", "GHG Emissions from Transport or Mobile Sources Calculator", "diagrams", "athena", "sharing", "apparent", "envelope", "fuel", "cases", "car", "minimum", "values", "can", "benefitscalculator", "Alternative Fuel Life-Cycle Environmental and Economic Transportation", "following", "making", "cad", "stream", "predict", "incremental", "chin", "refine", "council", "dxf", "hydrogen", "swedish", "requirements", "septic", "azeam", "yld", "chemical", "criterion", "actual", "plus", "economy", "map", "product", "crashes", "may", "deforestation", "sustainability", "membership", "produce", "designed", "date", "such", "data", "aox", "stress", "natural", "sectors", "sr", "futures", "explicit", "st", "inform", "si", "ghg", "truck", "sm", "definitions", "vocs", "sf", "se", "sciencedirect", "feb", "mainly", "years", "lsu", "fatalities", "ttn", "nitrogen", "pitch", "cold", "group", "monitor", "facility", "methodology", "coordinates", "platform", "window", "policy", "mail", "main", "natureserve", "texas", "IDAS", "non", "usa", "toursolver", "views", "significance", "nation", "records", "ffuel", "nox", "not", "LCA in Sustainable Architecture", "nov", "provision", "clarklabs", "name", "james", "times", "Scenario Planning Analytical Resources Core INDEX", "hydrological", "xls", "el", "eo", "weighted", "ee", "viccy", "year", "eu", "et", "regionally", "es", "plans", "living", "space", "profit", "blm", "collisions", "hcf", "emerged", "dioxide", "hcl", "shows", "cars", "million", "mechanisms", "treatments", "AirCRED", "california", "org", "keith", "care", "training", "language", "setpoints", "emittance", "turn", "place", "routes", "employmen", "first", "hydrocarbons", "dwelling", "revenue", "The Greenhouse Gases, Regulated Emissions, and Energy Use in Transportation Model", "municipality", "comprised", "simplified", "specifically", "directly", "crit", "corporations", "calthorpe", "open", "tomorrow", "size", "gettingstarted", "given", "district", "opus", "wrate", "structured", "argusone", "uwaterloo", "households", "cooling", "conservation", "moisture", "convention", "targetwaste", "frame", "nutrition", "elasticity", "multiregional", "that", "pittsburgh", "accurately", "released", "deceleration", "than", "population", "wide", "future", "cooney", "LISA", "landuse", "browser", "pre", "manufacture", "register", "san", "anl", "brownfield", "locations", "sap", "any", "shtml", "conversion", "unsuitable", "INVEST", "ideas", "equipment", "potential", "online", "interior", "environ", "conductivity", "registered", "spattool", "aspen", "trace", "attractiveness", "price", "fca", "donation", "america", "especially", "considered", "average", "nuclear", "greehouse", "typically", "quantity", "shop", "rating", "walking", "certification", "raja", "spaces", "Landfill Gas Emissions Model", "modelers", "tonnage", "ozone", "ground", "boundaries", "ratio", "VE-Toolkit", "conduction", "proportion", "state", "going", "black", "lesbat", "assistant", "secondary", "regarding", "resource", "median", "thermal", "summary", "miles", "mapped", "where", "wiki", "affordable", "uq", "metadataprefix", "relative", "us", "parking", "calendar", "onlinepubs", "oeko", "surfaces", "voluntary", "compounds", "federal", "subsequent", "review", "sites", "its", "umerkdhhgzugr", "behind", "bureau", "between", "developer", "across", "aburnham", "infrastructure", "jobs", "uk", "screen", "sparc", "analyzed", "article", "cities", "dates", "region", "contract", "tour", "wheels", "nearby", "duty", "forecasting", "overview", "period", "pop", "CACP", "learning", "easetech", "bioregions", "arts", "capable", "walkability", "combined", "employments", "prototype", "engine", "ltrc", "lanes", "pesticide", "offered", "athenasmi", "disance", "external", "those", "pilot", "case", "klaus", "these", "might", "profiles", "NatureServe Vista", "diverse", "policies", "reflectance", "databases", "nonresidential", "ivl", "characteristics", "metric", "tonns", "telephone", "ambient", "return", "zonal", "technology", "The Energy and Emissions Reduction Policy Analysis Tool", "different", "etc", "media", "adsorption", "shifts", "enquiries", "html", "events", "week", "danatzko", "oil", "downloads", "assist", "tjpdc", "persons", "footprint", "urbansim", "railway", "renewable", "relies", "minimize", "Motor Vehicle Emission Simulator", "vacant", "ccp", "psdconsulting", "costs", "components", "model", "researchers", "outdoor", "excel", "compound", "valuable", "orcrwarmquestions", "civic", "recycled", "TREAT", "speed", "announcement", "autocad", "desktop", "aircred", "treatment", "extensive", "structural", "calculatelca", "inputhelp", "around", "gemis", "early", "inflation", "traffic", "preference", "schedules", "provided", "engineers", "pounds", "subarea", "conducts", "usermanual", "annually", "benefit", "either", "output", "reduced", "simulator", "calculated", "specified", "spasm", "gross", "luminaire", "dimensions", "usgbc", "models", "Envision Tomorrow", "infill", "provides", "cienve", "uploads", "measuring", "assembly", "contingent", "tdm", "equivalent", "credits", "lcd", "ratios", "found", "landcover", "sprunt", "manufacturer", "on", "om", "central", "stations", "of", "industry", "sri", "brittany", "mixes", "practical", "estimator", "stand", "act", "mixed", "or", "road", "lands", "gard", "rolling", "organics", "determine", "shrp", "financial", "your", "catc", "area", "there", "hazards", "start", "idrisi", "low", "lot", "valley", "fish", "municipalities", "complete", "fifecycle", "elimination", "technologies", "with", "buying", "default", "lca", "emissions", "trips", "emisions", "detailed", "ac", "required", "ae", "sales", "minneapolis", "deploymetn", "as", "reliability", "esightenergy", "at", "file", "lifetime", "moves", "tremble", "bicycling", "way", "storage", "usersguide", "spatial", "you", "pollutants", "streiner", "includes", "important", "nmvoc", "peak", "planners", "included", "equitable", "kleijer", "building", "vadim", "remote", "invest", "landfill", "corey", "mass", "wastewater", "all", "sci", "roi", "hamburg", "month", "traci", "commute", "decisions", "children", "tw", "subjected", "wyoming", "to", "tl", "program", "th", "equivalency", "health", "homepage", "activities", "parcel", "confidential", "very", "hema", "resistance", "oxides", "verb", "condition", "routeapp", "Quick Energy Simulation Tool", "cdph", "list", "large", "small", "lisa", "neighborhood", "escalation", "regression", "rate", "arizona", "design", "perspective", "teq", "attributable", "Food Waste Assessment Tool", "investment", "dissertation", "what", "nonlinear", "imported", "sub", "section", "thickness", "version", "attitudes", "consumptions", "cuel", "method", "deborah", "distillate", "full", "elecbenecalc", "component", "hours", "tracks", "operating", "berkeley", "respect", "labs", "search", "compliance", "allows", "experience", "UPlan: Urban Growth Model", "amount", "published", "action", "toxicity", "options", "via", "family", "buses", "requiring", "transit", "screens", "analyzing", "appliances", "pdfs", "esri", "ash", "takes", "objectives", "contains", "petroleum", "comparing", "soil", "injury", "refueling", "achieving", "more", "flat", "door", "cacp", "operators", "emission", "flag", "foundations", "none", "kneifel", "hour", "science", "vs", "sent", "learn", "strategies", "def", "compare", "impacts", "states", "tandfonline", "equest", "purchased", "species", "terrestrial", "information", "needs", "avg", "goal", "irreplacability", "departments", "clarke", "spreadsheet", "revit", "kockelman", "maps", "clarku", "csr", "plant", "ft", "intended", "derived", "long", "fhwa", "jlund", "connectivity", "cadmium", "lighting", "floor", "WAMPS", "response", "susan", "RUBMRIO", "documentation", "RSC", "coal", "pay", "turnover", "help", "reservoir", "developed", "trade", "attitude", "industrial", "through", "energetics", "environmentally", "cardiovascular", "sankey", "blast", "rapidly", "urbanization", "systems", "cool", "pcf", "motivated", "schematic", "food", "demographics", "primary", "framework", "walls", "cer", "cplan", "communities", "yr", "association", "ifu", "fully", "courses", "kkockelm", "fleetroute", "heavy", "breakdown", "neil", "weight", "generation", "energy", "reduce", "equivalence", "measurement", "http", "operation", "buffers", "funding", "E+", "epeat", "projected", "viability", "research", "participants", "safety", "evaluation", "highway", "asp", "asu", "lawrence", "roofs", "ecobat", "confidence", "pub", "recoveries", "geared", "Integrated Waste Management Tool for Municipalities", "base", "conditioning", "members", "earliest", "generate", "driven", "owners", "benefits", "computers", "american", "purhasing", "probability", "number", "preservation", "traveled", "feet", "cfm", "stormwater", "traveler", "wages", "visions", "occurrence", "treament", "temperature", "introduction", "together", "airborne", "regulation", "calculations", "master", "uyzgninwnirolhmbe", "option", "prediction", "SmartGAP", "part", "asce", "codeforamerica", "determines", "heatisland", "determined", "salazar", "inflow", "dtu", "preheating", "imports", "endaphic", "pedestrian", "kara", "concentration", "lid", "paths", "emmisions", "built", "self", "IDRISI", "internal", "square", "build", "MOVES", "electric", "index", "measures", "affordability", "architects", "kaw", "plan", "services", "grams", "mobile", "desity", "cover", "dalys", "clean", "gabi", "physics", "technical", "sector", "thomas", "dtic", "disturbances", "rti", "businesses", "diversity", "networks", "feedstock", "impact", "indicator", "parameters", "justice", "factor", "columns", "dominant", "beams", "express", "combinations", "during", "LandUse Analyst", "motorcycles", "crt", "recommendations", "switzerland", "river", "nonrecurring", "set", "art", "ser", "culture", "individual", "descriptions", "precursors", "currently", "formatted", "libraries", "various", "userguide", "conditions", "myriam", "available", "iron", "targeted", "fregonese", "incident", "intregrate", "tropospheric", "Electronics Environmental Benefits Calculator", "both", "useable", "toward", "last", "license", "annual", "foreign", "thom", "colostate", "pdf", "whole", "load", "otaq", "supply", "simple", "composting", "recycling", "community", "tennessee", "regulated", "adaptation", "direntryid", "linux", "improvement", "foodwaste", "perspectives", "monthly", "create", "landfilling", "due", "epamail", "strategy", "pb", "reduction", "maintenance", "meeting", "dk", "pm", "kilograms", "wet", "gas", "Infrastructure Voluntary Evaluation Sustainability Tool", "schwab", "understand", "systematic", "demand", "prices", "replaces", "solid", "bill", "budget", "evaluated", "precursor", "while", "optimization", "nate", "evaluating", "fleet", "guide", "redevelopment", "pound", "turchetta", "steelmaking", "calculator", "cec", "contex", "eSight", "loomis", "baseline", "vantilation", "wmost", "virtually", "corridor", "resulting", "composition", "higher", "development", "used", "valuation", "comprehensive", "Umberto NXT", "flows", "communt", "levels", "uses", "user", "aggregate", "placeways", "lower", "database", "percentages", "bod", "uplan", "analysis", "without", "person", "marxan", "organization", "parametric", "prevention", "ldc", "distances", "ldv", "using", "alternative", "continent", "timber", "tables", "eere", "source", "location", "input", "transformation", "australia", "emergency", "demands", "evaluate", "sightings", "reuse", "game", "damage", "sustainable", "projects", "formal", "sorting", "identifying", "consensus", "metroquest", "chemcad", "names", "sketch", "google", "methods", "Integrated Transport and Health Impact Modelling Tool", "creation", "some", "back", "trends", "economic", "examples", "delivered", "scale", "visioning", "decision", "integration", "per", "phasing", "prof", "anne", "prod", "be", "run", "origons", "processing", "agreement", "assists", "served", "plots", "by", "decommissioning", "wildlife", "goods", "consumption", "iesve", "simulation", "range", "ytzjlwiznjctzgjhy", "yll", "replacement", "geosciences", "pollution", "repair", "greenfield", "intl", "into", "within", "nse", "exercises", "appropriate", "landsystems", "primarily", "inventories", "clustering", "statistics", "renewal", "mpos", "Clean Air and Climate Protection Software", "gases", "pharmaceuticals", "summertime", "heritage", "dissertations", "analyze", "files", "healthful", "sketchup", "link", "info", "particulates", "nonspatial", "zhyi", "up", "lifespan", "windows", "eebctool", "mature", "heterogeneous", "called", "uc", "units", "associated", "defined", "metal", "BLCC5", "accessibility", "metals", "single", "associates", "curb", "modeling", "jcu", "amounts", "beessoftware", "application", "electrical", "income", "department", "influencing", "incidences", "elements", "users", "calculating", "osti", "regulations", "generated", "restoration", "fertilizer", "structure", "lang", "lane", "land", "ecocalculator", "sherrouse", "age", "vehicles", "biotics", "microsoft", "fresa", "weights", "code", "partial", "edg", "sustainablehighways", "results", "existing", "zobiak", "dioxins", "edu", "adjustment", "issues", "compact", "depletion", "disposal", "wizard", "compost", "stable", "decomposition", "include", "friendly", "resources", "jurisdiction", "sabbisetti", "gduke", "utexas", "acreage", "grid", "Waste and Resources Assessment Tool for the Environment", "matrices", "entire", "recreation", "leveled", "trb", "michael", "assignments", "discounting", "earthshift", "smaller", "Building for Environmental and Economic Sustainability", "recobaltic", "biomass", "gmbh", "download", "ithim", "acid", "carlo", "makers", "hourly", "optimize", "STEAM", "access", "calorific", "volatile", "capital", "shoreline", "cam", "degree", "commercial", "desired", "eprints", "biodiversity", "SolVES", "receive", "leaving", "implementation", "products", "transmittance", "firefox", "clark", "duct", "manage", "Social Values for Ecosystem Services", "outcomes", "boolean", "privately", "motor", "redd", "apa", "tools", "cloud", "Building Life Cycle Cost", "endangered", "use", "fee", "from", "fec", "zip", "process", "debbie", "vehicle", "chloride", "eutrophication", "comparison", "tax", "equity", "benchmark", "transient", "brochure", "heig", "pollutant", "customer", "account", "this", "challenge", "sutter", "publications", "island", "meet", "conformity", "control", "C2RouteApp", "links", "calculation", "proportions", "sokolov", "GREET", "high", "professor", "assumptions", "calculatior", "umberto", "metapress", "Environmental Assessment System for Environmental TECHnologies", "angeles", "united", "monoxide", "purpose", "six", "sidewalks", "regions", "Waste Management Planning system", "haight", "forest", "scitech", "Conservation Planning System", "profile", "buildings", "hashem", "sir", "farm", "designator", "collection", "inst", "isse", "readiness", "herold", "computations", "light", "element", "allow", "institutional", "meter", "fwha", "report", "feasibility", "including", "agricultural", "vmt", "glen", "delay", "decay", "neroth", "lo", "labor", "estimating", "EnergyPlus", "puerto", "defining", "designs", "auto", "material", "wamps", "autp", "transparent", "usgs", "successor", "articles", "Roof Savings Calculator", "intelligent", "university", "weather", "identifier", "constraints", "lfg", "attachments", "WRATE", "globe", "related", "ecoinvent", "variety", "measure", "margins", "agriculture", "out", "category", "matt", "matrix", "icleiusa", "ohiolink", "performs", "nationalarchives", "smog", "supports", "integrated", "math", "Clean Cities Area of Interest 4: Alternative Fuel and Advanced Technology Vehicles Pilot Program Emissions Benefit Tool", "christensen", "interactions", "eco", "activity", "payroll", "release", "york", "regulatory", "tenant", "interaction", "organic", "applications", "geometry", "route", "hes", "mac", "feasible", "ltd", "davis", "austin", "arterial", "plastics", "manuscript", "widely", "powerful", "owned", "improvements", "occurrences", "guidebook", "quality", "destinations", "management", "publication", "practitioners", "los", "energymanagertraining", "system", "occupancy", "priority", "their", "intermediate", "ton", "wrapped", "travelled", "final", "shell", "researchpapers", "academy", "rsc", "ornl", "suitability", "simulate", "interactively", "july", "ben", "liquid", "intrastructure", "sourcing", "providing", "distinguished", "are", "idas", "partnership", "sidewalk", "have", "need", "constrained", "pollutantsand", "linked", "viewed", "documents", "mil", "agency", "switch", "parks", "prototypical", "which", "so", "techniques", "daylighting", "vegetation", "accuracy", "fuels", "mileage", "SimaPro", "centre", "who", "characeristics", "WARM", "preliminary", "segment", "gallery", "fritsche", "ComPlan", "request", "disease", "graphs", "capita", "mechanical", "painting", "gain", "selection", "gramsper", "utk", "planning", "greenhouse", "shapefiles", "partners", "based", "knowledge", "rubmrio", "nitrous", "nonmethane", "controls", "afleet", "suppot", "micron", "equivalents", "sulfur", "local", "beau", "overall", "autos", "landgem", "ITHIM", "areas", "processes", "densities", "trucks", "denmark", "watershed", "streamlined", "ohio", "cycles", "qm", "nist", "view", "btu", "predictive", "statistical", "dillon", "national", "intensity", "computer", "terms", "responses", "epic", "complan", "incorporating", "written", "corplan", "aggregation", "janes", "webhome", "ability", "importance", "agencies", "efficiency", "job", "photovoltaics", "key", "approval", "configuration", "limits", "freely", "chosen", "BEES", "streams", "attributes", "estimation", "adjusted", "ch", "co", "pii", "wall", "invasive", "ca", "ce", "cd", "packaging", "interface", "news", "cr", "acres", "addition", "copies", "CommunityViz", "treat", "indicators", "waste", "recurring", "mike", "general", "caseline", "graphics", "atlanta", "an", "multi", "survey", "value", "choices", "will", "depreciation", "au", "aesthetics", "examines", "ve", "site", "surface", "heating", "landfills", "arrangements", "maxent", "conserve", "erie", "productivity", "cross", "nmhc", "kwkzidzzwekaaaangzky", "geographical", "docs", "habitats", "party", "cod", "columbia", "takeoffs", "effect", "vd", "php", "requests", "warming", "audit", "analsis", "off", "center", "corplanuserguide", "Federal Renewable Energy Screening Assistant", "builder", "modeled", "well", "composted", "patterns", "theses", "english", "comparisons", "nzcty", "sensing", "modeler", "rapidfire", "latest", "routinely", "percent", "proximity", "domestic", "nmoc", "sources", "underlying", "predicts", "paul", "web", "density", "residential", "point", "demographic", "lake", "day", "add", "book", "ada", "usage", "smart", "tests", "mehaight", "EERPAT", "Random-Utility-Based Multiregional Input-Output", "term", "historic", "cedar", "deployment", "irreplaceability", "necessary", "eQuest", "sized", "roth", "crawley", "scenic", "works", "sbem", "accessible", "glare", "ATHENA Impact Estimator for Buildings 4", "habitat", "footage", "daylight", "growth", "export", "monetized", "EASETECH", "employment", "transport", "cumulated", "encouraging", "lead", "broad", "hurricane", "cradle", "cfpub", "biology", "noise", "SPARC INDEX", "monetary", "paper", "lighing", "dieffenthaler", "analyses", "about", "rare", "greening", "compatible", "arcgis", "carrier", "insufficient", "ascelibrary", "software", "assess", "en", "roads", "utility", "ridge", "transfer", "housing", "apps", "joaquin", "mitigation", "fiscal", "bus", "hazardous", "but", "volume", "landscaping", "hh", "construction", "goals", "automated", "hf", "hg", "made", "compute", "ecosystem", "Eco-Bat", "record", "distribution", "dots", "hvac", "deaths", "int", "universal", "pid", "graphical", "consumed", "periods", "education", "tolling", "inc", "microsimulation", "calibration", "oak", "oai", "MetroQuest", "other", "details", "acidification", "star", "ecological", "modelling", "throughout", "exposure", "Wildlife Habitat Benefits Estimation Toolkit", "ranks", "factors", "rule", "status", "incresaes"
  ];
  console.log('building initial search cache');
  $("#simpleSearchText").autocomplete({
    minLength: 1,
    source: huge_array
  });
  $("#detailSearchText").autocomplete({
    minLength: 1,
    source: huge_array
  });
} catch (err) {
  console.log(err);
}

var database_columns = [
  'Date',
  'User',
  'Information_Resource_Identifier',
  'Information_Resource_Title',
  'Information_Resource_Short_Title',
  'Name',
  'Acronym',
  'Short_Description_for_Reports',
  'Ownership_Type',
  'Information_Resource_Type',
  'Base_Cost_of_Software',
  'Other_Cost_Considerations',
  'Open_Source',
  'Alternative_Names',
  'Sustainability_Sector',
  'Constrained_Keywords',
  'Keywords',
  'Organization',
  'Contact_Person',
  'Phone_Number',
  'Email',
  'Internet',
  'Life_Cycle',
  'Last_Known_Software_Update',
  'READ_Info_Updated',
  'Operating_Environment',
  'Compatible_Operating_Systems',
  'Model_Inputs',
  'Data_requirements',
  'Model_Output_Types',
  'Output_Variables',
  'Source_of_Support_Materials',
  'Model_Evaluation',
  'Model_Structure',
  'Time_Scale',
  'Spatial_Extent'
];

function radiovalue(radios) {
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      // do whatever you want with the checked radio
      return radios[i].value;
      // only one radio can be logically checked, don't check the rest
      break;
    }
  }
}

function multiSelectValue(multiselect) {
  var selected = [];
  for (var i = 0; i < multiselect.length; i++) {
    if (multiselect.options[i].selected) selected.push(multiselect.options[i].value);
  }
  //return JSON.stringify(selected);
  return selected;
}

function checkBoxValue(multiselect) {
  var selected = [];
  for (var i = 0, length = multiselect.length; i < length; i++) {
    if (multiselect[i].checked) selected.push(multiselect[i].value);
  }
  //return JSON.stringify(selected);
  return selected;
}

function parseResults(str, table_reference) {
    try {
      var row_template = {
        'Name': 0,
        'Short_Description_for_Reports': 1,
        'Base_Cost_of_Software': 2,
        'Spatial_Extent': 3,
        'Model_Inputs': 4,
        'Model_Output_Types': 5
      };
      if (typeof str == "string") {
        var result = JSON.parse(str);
      } else {
        result = str
      }
      if (result.length == 0) {
        return 'No Results Found';
      }
      var result_table = $(table_reference)[0];
      for (var i = 0; i < result.length; i++) {
        var row = result_table.insertRow(1);
        var result_row = result[i];
        jQuery.data(row, "record", result_row);
        for (var key in row_template) {
          var cell = row.insertCell(row_template[key]);
          cell.style.fontSize = 'x-small';
          if (result[i][key]) {
            var this_result = result[i][key];
            if (this_result.length > 140) {
              cell.title = this_result;
              this_result = this_result.substr(0, 140) + '...'
            }
            cell.innerHTML = this_result;
          } else {
            cell.innerHTML = "Unknown";
          }
        }
      }
      $(table_reference + " tr").click(function() {
        showDetails($(this).data());
      });
      if (table_reference == "#resultsTable") {
        jQuery.data(result_table, 'records', result);
        $("[href='#tabsResults']").show();
        $("[href='#tabsResults']").click();
      } else if (table_reference == "#savedTable") {
        $("[href='#tabsSaved']").show();
        $("[href='#tabsSaved']").click();
      } else {
        jQuery.data(result_table, 'records', result);
        $(table_reference).show()
      }
      return 'FOUND RESULTS!'
    } catch (err) {
      console.log(err);
      return 'No results found'
    }
  }

  /*
  function clearResults(){
      var result_table = document.getElementById('resultsTable');
      while (result_table.rows.length != 1){
          try {
              result_table.deleteRow(1);
          }
          catch (err){
              console.log(err)
          }
      }
  }
  */

function clearSaved() {
  var result_table = document.getElementById('savedTable');
  $("[href='#tabsSaved']").hide();
  $("[href='#tabsSimple']").click();
  while (result_table.rows.length != 1) {
    try {
      result_table.deleteRow(1);
    } catch (err) {
      console.log(err)
    }
  }
}

function getDetails(id) {
  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else { // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET", endpoint + "record?id=" + id, false);
  xmlhttp.send();
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    var raw_response = xmlhttp.responseText;
    var response = raw_response.replace(/^"/, '').replace(/"$/, '').replace(/\\/g, '');
    var json_obj = JSON.parse(response);
    return json_obj[0]
  };
}

function showDetails(id) {
  var detail_obj = id['record'];
  console.log("showDetails");
  console.log(detail_obj);
  var tab = $("#selectedAccordion");
  try {
    tab.empty();
  } catch (error) {
    console.log(error)
  }
  var columns = [
    'Name',
    'Acronym',
    'Short_Description_for_Reports',
    'Ownership_Type',
    'Last_Known_Software_Update',
    'Base_Cost_of_Software',
    'Other_Cost_Considerations',
    'Open_Source',
    'Sustainability_Sector',
    'Keywords',
    'Organization',
    'Contact_Person',
    'Phone_Number',
    'Email',
    'Internet',
    'Life_Cycle',
    'READ_Info_Updated',
    'Operating_Environment',
    'Compatible_Operating_Systems',
    'Model_Inputs',
    'Data_requirements',
    'Model_Output_Types',
    'Output_Variables',
    'Source_of_Support_Materials',
    'Model_Evaluation',
    'Model_Structure',
    'Time_Scale',
    'Spatial_Extent'
  ];
  for (i in columns) {
    var this_key = columns[i];
    var name = columns[i].replace(/_/g, ' ');
    var this_name = $("<h3>");
    this_name.text(name + ':');
    if (detail_obj[this_key] != '') {

      //Name
      if (this_key == "Name") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.GeneralDetail.ShortTitleText;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //Acronym
      if (this_key == "Acronym") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.GeneralDetail.Acronym;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //Short_Description_for_Reports
      if (this_key == "Short_Description_for_Reports") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.GeneralDetail.ShortDescription;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //Ownership_Type
      if (this_key == "Ownership_Type") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.GeneralDetail.OwnershipTypeName;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //Ownership_Type
      if (this_key == "Base_Cost_of_Software") {
        try {
          var DetailsBaseSoftwareCostData = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsBaseSoftwareCost;
          switch (DetailsBaseSoftwareCostData) {
            case 1:
              detail_obj[this_key] = "Free";
              break;
            case 2:
              detail_obj[this_key] = "$1-$499";
              break;
            case 3:
              detail_obj[this_key] = "$500-$1499";
              break;
            case 4:
              detail_obj[this_key] = "$1500-$3999";
              break;
            case 5:
              detail_obj[this_key] = ">$4000";
              break;
            default:
              detail_obj[this_key] = "No Data Available"
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //Other_Cost_Considerations
      if (this_key == "Other_Cost_Considerations") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOtherCostConsiderations;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //Open_Source
      if (this_key == "Open_Source") {
        try {
          var DetailsOpenSource = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOpenSource;
          switch (DetailsOpenSource) {
            case 1:
              detail_obj[this_key] = "Yes";
              break;
            case 2:
              detail_obj[this_key] = "No";
              break;
            case 3:
              detail_obj[this_key] = "Partial";
              break;
            default:
              detail_obj[this_key] = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Alternative_Names'
      /*
      if(this_key == "Alternative_Names") {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOtherCostConsiderations;
      }
      */

      // 'Sustainability_Sector'
      if (this_key == "Sustainability_Sector") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelScopeDetail.ModelScopeDecisionSector;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Constrained_Keywords'
      /*
      if(this_key == "Constrained_Keywords") {
          //detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOtherCostConsiderations;
      }
      */

      // 'Keywords'
      if (this_key == "Keywords") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.KeywordDetail.KeywordText;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      // 'Organization'
      if (this_key == "Organization") {
        try {
          if (id.record.READExportDetail.InfoResourceDetail.ContactDetail.OrganizationContactDetail) {
            detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ContactDetail.OrganizationContactDetail.OrganizationName;
          } else {
            detail_obj[this_key] = "No Data Provided"
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      // 'Contact_Person'
      if (this_key == "Contact_Person") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.FirstName + " " + id.record.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.LastName;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      // 'Phone_Number'
      if (this_key == "Phone_Number") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.TelephoneNumber;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      // 'Email'
      if (this_key == "Email") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ContactDetail.IndividualContactDetail.EmailAddressText;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      // 'Internet'
      if (this_key == "Internet") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.AccessDetail.InternetDetail.URLText;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Life_Cycle'
      if (this_key == "Life_Cycle") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.LifeCycleDetail.CurrentLifeCyclePhase;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Last_Known_Software_Update'
      if(this_key == "Last_Known_Software_Update") {
        detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.LastModifiedDateTimeText;
      }

      //'READ_Info_Updated'
      if (this_key == "READ_Info_Updated") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.LastModifiedDateTimeText + ", " + id.record.READExportDetail.InfoResourceDetail.LastModifiedPersonName;
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Operating_Environment'
      if (this_key == "Operating_Environment") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.TechRequirementsDetail.TechReqCompatibleOSDetail.OSName;
        } catch (err) {
          detail_obj[this_key] = "NoData";
          console.log(err);
        }
      }

      //'Compatible_Operating_Systems'
      if (this_key == "Compatible_Operating_Systems") {
        try {
          detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.TechRequirementsDetail.TechReqCompatibleOSDetail.OSName;
        } catch (err) {
          detail_obj[this_key] = "NoData";
          console.log(err);
        }
      }

      //'Other_proprietary_software_requirements_if_any'
      if (this_key == "Other_proprietary_software_requirements_if_any") {
        //detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOtherCostConsiderations;
      }

      //'Model_Inputs'
      if (this_key == "Model_Inputs") {
        try {
          var ModelOutputsTextAreaData = id.record.READExportDetail.InfoResourceDetail.ModelInputsDetail.ModelInputsTextArea;
          if (ModelOutputsTextAreaData) {
            detail_obj[this_key] = ModelOutputsTextAreaData;
          } else {
            this_result = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Model_Output_Types'
      if (this_key == "Model_Output_Types") {
        try {
          var ModelOutputsTextAreaData = id.record.READExportDetail.InfoResourceDetail.ModelOutputsDetail.ModelOutputsModelVariablesTextArea;
          if (ModelOutputsTextAreaData) {
            detail_obj[this_key] = ModelOutputsTextAreaData;
          } else {
            this_result = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Output_Variables'
      if (this_key == "Output_Variables") {
        try {
          var ModelOutputsVariables = id.record.READExportDetail.InfoResourceDetail.ModelOutputsDetail.ModelOutputsModelVariablesTextArea;
          if (ModelOutputsVariables) {
            detail_obj[this_key] = ModelOutputsVariables;
          } else {
            this_result = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Source_of_Support_Materials'
      if (this_key == "Source_of_Support_Materials") {
        try {
          var UserSupportSource = id.record.READExportDetail.InfoResourceDetail.UserSupportDetail.UserSupportSourceOfSupportMaterials;
          if (UserSupportSource) {
            detail_obj[this_key] = UserSupportSource;
          } else {
            this_result = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Model_Evaluation'
      if (this_key == "Model_Evaluation") {
        try {
          var ModeEvaluation = id.record.READExportDetail.InfoResourceDetail.ModelEvaluationDetail.ModelEvaluationTextArea;
          if (ModeEvaluation) {
            detail_obj[this_key] = ModeEvaluation;
          } else {
            this_result = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Model_Structure'
      if (this_key == "Model_Structure") {
        try {
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Time_Scale'
      if (this_key == "Time_Scale") {
        try {
          var TimeScaleData = id.record.READExportDetail.InfoResourceDetail.ModelScopeDetail.ModelScopeTimeScaleDetail;
          if (TimeScaleData.length != 0) {
            detail_obj[this_key] = "";
            for (i = 0; i < TimeScaleData.length; i++) {
              if (i < TimeScaleData.length - 1) {
                detail_obj[this_key] += TimeScaleData[i].TimeScaleName + ", ";
              } else {
                detail_obj[this_key] += TimeScaleData[i].TimeScaleName;
              }
            }
          } else {
            detail_obj[this_key] = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Spatial_Extent'
      if (this_key == "Spatial_Extent") {
        try {
          var SpatialExtentData = id.record.READExportDetail.InfoResourceDetail.ModelScopeDetail.ModelScopeSpatialExtentDetail;
          if (SpatialExtentData.length != 0) {
            detail_obj[this_key] = "";
            for (i = 0; i < SpatialExtentData.length; i++) {
              if (i < SpatialExtentData.length - 1) {
                detail_obj[this_key] += SpatialExtentData[i].SpatialExtentName + ", ";
              } else {
                detail_obj[this_key] += SpatialExtentData[i].SpatialExtentName;
              }
            }
          } else {
            detail_obj[this_key] = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      //'Technical_skills_needed_to_apply_model'
      if (this_key == "Technical_skills_needed_to_apply_model") {
        //detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOtherCostConsiderations;
      }

      //'Interfaces_to_other_Resources'
      if (this_key == "Interfaces_to_other_Resources") {
        //detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOtherCostConsiderations;
      }

      // 'Notes'
      if (this_key == "Notes") {
        //detail_obj[this_key] = id.record.READExportDetail.InfoResourceDetail.ModelDetailsDetail.DetailsOtherCostConsiderations;
      }
      if (this_key == "Data_requirements") {
        try {
          var DataRequirements = id.record.READExportDetail.InfoResourceDetail.ModelInputsDetail.ModelInputsDataRequirements;
          //console.log("Data_requirements", DataRequirements);
          switch (DataRequirements) {
            case 1:
              detail_obj[this_key] = "None – All Data Supported";
              break;
            case 2:
              detail_obj[this_key] = "Low – Data Generally Publicly Available";
              break;
            case 3:
              detail_obj[this_key] = "Med – Not Publicly Available, but Routinely Available";
              break;
            case 4:
              detail_obj[this_key] = "High – New Data Must Be Created";
              break;
            default:
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }

      // 'Model_Output_Types'
      if (this_key == "Model_Output_Types") {
        try {
          var ModelOutputsTextAreaData = id.record.READExportDetail.InfoResourceDetail.ModelOutputsDetail.ModelOutputsModelVariablesTextArea;
          if (ModelOutputsTextAreaData) {
            detail_obj[this_key] = ModelOutputsTextAreaData;
          } else {
            this_result = "No Data Available";
          }
        } catch (err) {
          detail_obj[this_key] = "No Data";
          console.log(err);
        }
      }
      var this_value = $("<p>");
      this_value.text(detail_obj[this_key]);
    }

    else {
      var this_value = $("<p>");
      this_value.text("No Data");
    }
    tab.append(this_name, this_value);
  }
  $("[href='#tabsSelected']").data("record", detail_obj);
  $("[href='#tabsSelected']").show();
  $("[href='#tabsSelected']").click();
}

function saveRecord() {
  var record = Array($("[href='#tabsSelected']").data()["record"]);
  parseResults(record, "#savedTable");
  var data = $("#savedTable").data();
  if (data.hasOwnProperty("records")) {
    data["records"] = data["records"].concat(record);
  } else {
    data["records"] = record;
  }
  $("#savedTable").data("records", data["records"]);

}

function saveAllRecords(table_reference) {
  var records = $("#" + table_reference).data().records;
  parseResults(records, "#savedTable");
  var data = $("#savedTable").data();
  if (data.hasOwnProperty("records")) {
    data["records"] = data["records"].concat(records);
  } else {
    data["records"] = records;
  }
  $("#savedTable").data("records", data["records"]);

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

function exportCSV(tablereference) {
  var records = $("#" + tablereference).data().records;
  var csvContent = '';
  var columns = [
    'Name',
    'Acronym',
    'Short_Description_for_Reports',
    'Ownership_Type',
    'Base_Cost_of_Software',
    'Other_Cost_Considerations',
    'Open_Source',
    'Alternative_Names',
    'Sustainability_Sector',
    'Constrained_Keywords',
    'Keywords',
    'Organization',
    'Contact_Person',
    'Phone_Number',
    'Email',
    'Internet',
    'Life_Cycle',
    'Last_Known_Software_Update',
    'READ_Info_Updated',
    'Operating_Environment',
    'Compatible_Operating_Systems',
    'Other_proprietary_software_requirements_if_any',
    'Model_Inputs',
    'Data_requirements',
    'Model_Output_Types',
    'Output_Variables',
    'Source_of_Support_Materials',
    'Types_of_Support_Materials',
    'Model_Evaluation',
    'Model_Structure',
    'Time_Scale',
    'Spatial_Extent',
    'Technical_skills_needed_to_apply_model',
    'Interfaces_to_other_Resources',
    'Notes'
  ];
  var names = [];
  for (i in columns) {
    var name = columns[i].replace(/_/, ' ');
    names.push(name);
  };
  csvContent = names.join() + '\n'
  for (i in records) {
    var this_record = records[i];
    var values = [];
    for (j in columns) {
      values.push('"' + this_record[columns[j]] + '"');
    };
    csvContent = csvContent + values.join() + '\n'
  }

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
  link.setAttribute("download", "my_data.csv");
  link.click();
}
