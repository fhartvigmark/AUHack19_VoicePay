// dependencies
var AWS = require("aws-sdk");

var docClient = new AWS.DynamoDB.DocumentClient();

const table = "Vendor";

module.exports.handler = (event, context, callback) => {

    const content = JSON.parse(event.body);
        
    updateData(content, function(err,result){
        if (err) {
            
            //context.fail('Error in get: ' + err);
            callback(err, null);
        }else {
            //context.succeed(result);
            callback(null, { statusCode: 200, 
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify(result)});
        }
    });
  };


const updateData = (content, fn) => {
    var params = {
        TableName:table,
        Key:{
            "vendorID": content.vendorID
        },
        UpdateExpression: "set vendor_loc = :l, vendorname = :n, productname = :m, account = :c, regnr = :r",
        ExpressionAttributeValues:{
            ":l": content.vendor_loc,
            ":n": content.vendorname,
            ":m": content.productname,
            ":c": content.account,
            ":r": content.regnr

        },
        ReturnValues:"UPDATED_NEW"
    };
    
    console.log("Update " + content.vendorID + " new item in VendorDB...");
    docClient.update(params, function(err, data) {
        if (err) {
            fn("Unable to update item. Error JSON:" + JSON.stringify(err, null, 2), null);
        } else {
            fn(null, data);
        }
    });
};