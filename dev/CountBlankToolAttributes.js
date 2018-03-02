var obj = {};

for (var ID in tools) {
	for (var prop in tools[ID]) {
		if (!obj.hasOwnProperty(prop)) {
			obj[prop] = 0;
		}
		if (tools[ID][prop] === "No Data") {
			console.log(prop);
			obj[prop]++;
		}
    }
}

var string = "Property (Tool Attribute),Count\n";
for (var item in obj) {
	string += item + ',' + obj[item] + '\n';
}