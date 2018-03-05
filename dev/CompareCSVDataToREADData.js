for (var title in intendedData){
	console.log("###" + title + "###");
	if (actualData.hasOwnProperty(title.substr(0, 15))) {
		console.log(actualData[title.substr(0, 15)]['ID']);
        for (var i = 0; i < Object.keys(intendedData[title]).length; i++) {
            var colName = Object.keys(intendedData[title])[i];
            var intendedDatum = intendedData[title][colName];
            var actualDatum = actualData[title.substr(0, 15)][colName];

            if (colName === 'Acronym') {
                intendedDatum = intendedDatum.substr(0, 15); // length is capped in READ
            } else if (colName === 'Open Source') {
				if (intendedDatum == 1) {
					intendedDatum = "Yes";
				} else if (intendedDatum == 2){
					intendedDatum = "No";
                } else if (intendedDatum == 3) {
					intendedDatum = "Partial";
                } else if (intendedDatum.trim() === '') {
					intendedDatum = "No Data";
				} else {
					intendedDatum = "ERROR";
				}
			} else if (colName === "Ownership Type") {
				if (intendedDatum == 1) {
					intendedDatum = "External";
				} else if (intendedDatum == 2){
					intendedDatum = "Internal";
                } else if (intendedDatum.trim() === '') {
					intendedDatum = "No Data";
				} else {
					intendedDatum = "ERROR";
				}
			} else if (colName === "Resource Type") {
				if (intendedDatum == 1) {
					intendedDatum = "Model";
				} else if (intendedDatum == 2){
					intendedDatum = "System or Application";
				} else if (intendedDatum == 3) {
					intendedDatum = "Data Warehouse";
                } else if (intendedDatum.trim() === '') {
					intendedDatum = "No Data";
				} else {
					intendedDatum = "ERROR";
				}
            } else if (colName === "Base Cost") {
				if (intendedDatum == 1) {
					intendedDatum = "$0";
				} else if (intendedDatum == 2){
					intendedDatum = "$1-$499";
				} else if (intendedDatum == 3) {
					intendedDatum = "$500-$1499";
                } else if (intendedDatum == 4) {
					intendedDatum = "$1500-$4000";
                } else if (intendedDatum == 5) {
					intendedDatum = "> $4000";
                } else if (intendedDatum.trim() === '') {
					intendedDatum = "No Data";
				} else {
					intendedDatum = "ERROR";
				}
            } else if (colName === "Input Data Requirements") {
				if (intendedDatum == 1) {
					intendedDatum = "None - All Data Provided";
				} else if (intendedDatum == 2){
					intendedDatum = "Low - Data Generally Publicly Available";
				} else if (intendedDatum == 3) {
					intendedDatum = "Med - Not Publicly Available, but Routinely Available";
                } else if (intendedDatum == 4) {
					intendedDatum = "High - New Data Must be Created";
                } else if (intendedDatum == 5) {
					intendedDatum = "Insufficient Information";
                } else if (intendedDatum.trim() === '') {
					intendedDatum = "No Data";
				} else {
					intendedDatum = "ERROR";
				}
            }

            if (intendedDatum.toLowerCase().trim() === actualDatum.toLowerCase().trim()) {
                //console.log("MATCH");
            } else if (intendedDatum.trim() === "" && actualDatum.trim() === "No Data") {
				//console.log("MATCH - Both are blank");
			} else {
				console.log("Intended " + colName + ": " + intendedDatum);
            	console.log("Actual " + colName + ": " + actualDatum);
                console.log("MISMATCH");
            }

            console.log("\n");
        }
    } else {
		console.log("Tool not in inventory");
    }
	console.log("\n");
} 