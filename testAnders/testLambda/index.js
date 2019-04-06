const fetch = require('node-fetch');


// https://stackoverflow.com/questions/34437900/how-to-load-npm-modules-in-aws-lambda
const URL = 'https://api.sandbox.mobilepay.dk/bindings-restapi/api/v1/payments/payout-bankaccount';

exports.handler = (event, context, callback) => {
    
    var succes = false;

    //const body = JSON.parse(event.body)
    //const nameToPay = body.name;
    //const valuta = body.valuta;
    var amount = 1.92;

    // https://medium.freecodecamp.org/here-is-the-most-popular-ways-to-make-an-http-request-in-javascript-954ce8c95aaa
    const otherParams = {
        headers:{
            'Content-Type': 'application/json',
            'x-ibm-client-id': '1c0cd3ff-1143-476b-b136-efe9b1f5ecf3',
            'x-ibm-client-secret': 'L7yW0eV0eK5yX1nK4rO0lI8sX5aN2tL6aQ0sL7gM1xO6sW8kK1',
        },
        body: JSON.stringify({
            "merchantId": "510665bd-3d46-478f-a36e-e43826b89705",
            "merchantBinding": "whateverTest1",
            "receiverRegNumber": "3098",
            "receiverAccountNumber": "3100460793",
            "amount": amount
            
        }),
        method: "POST"
    };

    // https://github.github.io/fetch/
    fetch(URL,otherParams)
    .then(data => {
        var status = data.status;
        console.log(status);
        succes = status == 204;
        console.log(succes);
        
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                success: succes,
            }),
        };
        
        callback(null, response);
    })
    .catch(error => console.log(error));
    
};
