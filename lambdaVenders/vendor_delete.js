// dependencies
var AWS = require("aws-sdk");

var docClient = new AWS.DynamoDB.DocumentClient();

const table = "Vendor";

module.exports.handler = (event, context, callback) => {
  
  const body = JSON.parse(event.body);
  const vendorID = body.vendorID;

  //const tid = event.pathParameters.tid;
  //const timestamp = body.timestamp;
    
  deleteProduct(vendorID, (err, result) => {
      if (err){
          callback(err, null);
      }else {
          callback(null, { statusCode: 200, 
          headers: {
            "Access-Control-Allow-Origin" : "*", 
            "Access-Control-Allow-Credentials" : true 
          },
          body: JSON.stringify(result)});
      }
  });
};

const deleteProduct = (vendorID, fn) => {
  var params = {
      TableName:table,
      Key:{
          "vendorID": vendorID,
      }
  };

  console.log("Attempting to delete Vendor " + vendorID + "...");
  docClient.delete(params, function(err, data) {
      if (err) fn("Unable to delete item. Error JSON:" + JSON.stringify(err, null, 2), null);
      else fn(null, { success: true });
  });
};
