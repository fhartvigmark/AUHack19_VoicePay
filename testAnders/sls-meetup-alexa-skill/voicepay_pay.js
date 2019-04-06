'use strict';

module.exports.pay = async (event) => {

  const body = JSON.parse(event.body)
  const nameToPay = body.name;
  const amount = body.amount;
  const valuta = body.valuta;
  
  return {
    headers: {
      "Access-Control-Allow-Origin" : "*", 
      "Access-Control-Allow-Credentials" : true 
    },
    statusCode: 200,
    body: JSON.stringify({
      success: true,
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
