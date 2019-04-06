/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const fetch = require("node-fetch");
const AWS = require("aws-sdk");

var docClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS()


//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;
const URL = 'https://api.sandbox.mobilepay.dk/bindings-restapi/api/v1/payments/payout-bankaccount';

const SKILL_NAME = 'Voice Pay';
const TRANSACTION_COMPLETE_MESSAGE = "Transaction completed ";
const ORDER_PLACED_MESSAGE = "Placed order for ";
const HELP_MESSAGE = 'You can say pay amount to recipient';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';




//=========================================================================================================================================
//Functions
//=========================================================================================================================================
function enqueue(product) {
    const params = {
        MessageBody: JSON.stringify({
            time: (new Date(Date.now())).toISOString(),
            product: product,
            phone: "+4564518696",
            name: "Mark",
            address: "Åbogade 34"
        }),
        QueueUrl: "https://sqs.eu-west-1.amazonaws.com/803992687199/orderq"
    }

    sqs.sendMessage(params, (err, data) => {
        if (err) {
            console.log('error:', err);
            //context.done('error', 'ERROR Put SQS')
        } else {
            console.log('data:', data.MessageId);
            //context.done(null, '')
        }
    })
}

function pay(amount, success, failure) {
    const otherParams = {
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
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

    fetch(URL, otherParams)
            .then(success)
            .catch(failure);
}

function isLocked(ID) {
    var params = {};

    params.TableName = "Lock";
    params.Key = {"lock" : ID};

    docClient.get(params, function(err, data) {
        if (err) {
            console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
            return true;
        } else if (!Object.keys(data).length){
            var params2 = {};
            params2.TableName = "Lock";
            params2.Item = { "lock": ID, "state": false }

            docClient.put(params2, function (err, data) {
                if (err) {
                    console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                    return true;
                } else {
                    return false;
                }
            });
        }else{
            console.log("Query succeeded.");
            console.log(data);
            return data.state;
        }
    });
}

function setLock(ID, newState) {
    var params = {
        TableName : "Lock",
        Key:{
            "lock": ID
        },
        UpdateExpression: "set info.state = :s",
        ExpressionAttributeValues:{
            ":s": newState
        },
        ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
        if (err) {
            console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
            return false;
        } else {
            return true;
        }
    });
}

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        var deviceID = this.event.context.System.user.userId;

        if (isLocked(deviceID)) {
            this.response.speak("Your account is locked");
            this.emit(':responseReady');
        }
        else{
            this.response.speak(SKILL_NAME);
            this.emit(':responseReady');
        }
        //this.emit('MakePayment');
    },
    'MakePayment': function () {
        const recipient = this.event.request.intent.slots.recipient.value;
        const amount = this.event.request.intent.slots.amount.value;
        const speechOutput = TRANSACTION_COMPLETE_MESSAGE + amount + ' to ' + recipient;

        var succes = false;
        
        const otherParams = {
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
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

        fetch(URL, otherParams)
            .then(data => {
                
                var status = data.status;
                console.log(status);
                succes = status == 204;
                console.log(succes);

                if (succes) {
                    console.log(this.response);
                    this.response.speak(speechOutput);
                    this.emit(':responseReady');
                } else {
                    console.log(this.response);
                    this.response.speak("Transaction failed");
                    this.emit(':responseReady');
                }
            })
            .catch(error => {
                console.log(error);
                this.response.speak("Shiityyy error");
                this.emit(':responseReady');
            });
    },
    "AnswerOrder": function () {
        var mythis = this;
        const product = this.event.request.intent.slots.order.value;
        const vendor = this.event.request.intent.slots.vendor.value;

        var params = {
            TableName : "Product",
            ProjectionExpression:"#pr, vendorname, vendor_loc, price",
            FilterExpression: "#pr = :pp and vendorname = :vv",
            ExpressionAttributeNames:{
                "#pr": "productname"
            },
            ExpressionAttributeValues: {
                ":pp": product,
                ":vv": vendor
            }
        };

        docClient.scan(params, function(err, data) {
            if (err) {
                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                mythis.response.speak("Sorry could not process order");

                mythis.emit(':responseReady');
            } else {
                console.log("Query succeeded.");
                var places = "";
                if (data.Count != 1) {
                    mythis.response.speak("Sorry could not process order");
                }
                else {
                    var price = data.Items[0].price;

                    enqueue(product);
                    pay(price, data => {
                        mythis.response.speak("Order placed");
                        mythis.emit(':responseReady');
                    }, data => {
                        mythis.response.speak("Order failed");
                        mythis.emit(':responseReady');
                    });
                }
            }
        });
    },
    'MakeOrder': function () {
        var mythis =this;
        const product = this.event.request.intent.slots.order.value;
        var params = {
            TableName : "Product",
            ProjectionExpression:"#pr, vendorname, vendor_loc, price",
            FilterExpression: "#pr = :pp",
            ExpressionAttributeNames:{
                "#pr": "productname"
            },
            ExpressionAttributeValues: {
                ":pp": product
            }
        };

        docClient.scan(params, function(err, data) {
            if (err) {
                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                const speechOutput = ORDER_PRODUCT_NOT_FOUND + product;
                this.response.speak(speechOutput);
                this.emit(':responseReady');
            } else {
                console.log("Query succeeded.");
                var places = ""

                data.Items.forEach(function(item) {
                    places += item.vendorname+ ", "
                });
                
                const speechOutput = "I found " + data.Count + " places you can order " + product + " from " + places + ". Where would you like to order " + product + " from?";
                const reprompt = "Where would you like to order " + product + " from?";
                mythis.response.speak(speechOutput).listen(reprompt);
                mythis.emit(':responseReady');
            }
        });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};