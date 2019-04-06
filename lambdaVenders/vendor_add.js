// dependencies
var AWS = require("aws-sdk");
var uniq = require('uniqid');

var docClient = new AWS.DynamoDB.DocumentClient();

var lambda = new AWS.Lambda({
  region: 'eu-west-1' //change to your region
});

const table = "Vendor";

module.exports.handler = (event, context, callback) => {

	// content of the new vendor 
	// body: JSON.stringify({
	// 		"vendor_loc": "Århus N - Finlandsgade 20",
	// 		"vendorname": "Dominos",
	// 		"productname": "Pizzas",	
	// 		"account": 10000119798,		// TAL
	// 		"regnr": 14684116886, 		// TAL
	// 		"vendorID": 68168168186, 	// TAL
	// }),
  let content = JSON.parse(event.body);
	console.log(content);
	if (content === undefined){
		callback('Error in parsing body json vendor_add.js: ', null);
	}

	insertData(content, (err, result) => {
		if (err){
			callback('Error in insert: ' + err, null);
		}else {
			callback(null, { statusCode: 200, 
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(
        { success: true, data: result })
        });
		}
	});
};

const insertData = (content, fn) => {
	var id = uniq();
	var params = {
    	TableName:table,
    	Item: {
					"vendor_loc": content.vendor_loc,
					"vendorname": content.vendorname,
					"productname": content.productname,
					"account": content.account,
					"regnr": content.regnr,
	        "vendorID": id
	    }
	};
	
	console.log("Adding a new Product to database...");
	docClient.put(params, function(err, data) {
	  if (err) fn("Unable to add item. Error JSON: " + JSON.stringify(err, null, 2), null);
		else fn(null, data);
	});
};