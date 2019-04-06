// require the http module of node.js
var http = require('http');
// require the dispatcher module
var HttpDispatcher = require('httpdispatcher');
var dispatcher     = new HttpDispatcher();

// https://stackoverflow.com/questions/48433783/referenceerror-fetch-is-not-defined
const fetch = require("node-fetch");

// define the port of access for your server
const PORT = 8080;

// We need a function which handles requests and send response
function handleRequest(request, response){
    try {
        // log the request on console
        console.log(request.url);
        // Dispatch
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

// Create a server
var myFirstServer = http.createServer(handleRequest);

// add some routes
// https://stackoverflow.com/questions/40612325/node-js-cannot-find-basic-functions
// https://ourcodeworld.com/articles/read/260/creating-your-first-self-implemented-basic-http-server-with-routing-in-node-js
//A sample GET request
dispatcher.onGet("/", function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Hey, this is the homepage of your server</h1>');
});


const URL = 'https://api.sandbox.mobilepay.dk/bindings-restapi/api/v1/payments/payout-bankaccount';


dispatcher.onGet("/welcome", function(req, res) {
    var succes = false;

    //const body = JSON.parse(event.body)
    //const nameToPay = body.name;
    //const valuta = body.valuta;
    var amount = 1.98;

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

        res.writeHead(200, {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin" : "*", 
            "Access-Control-Allow-Credentials" : true,
        });
        res.end(JSON.stringify({
            success: succes,
        }));
    })
    .catch(error => console.log(error));
});

dispatcher.onError(function(req, res) {
    res.writeHead(404);
    res.end("Error, the URL doesn't exist");
});

// Start the server !
myFirstServer.listen(PORT, function(){
    // Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});




