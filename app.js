//  To run this code, you must do the following:

//  1. Deploy this code to a server running Node.js
//  2. Run `yarn install`
//  3. Add your VERIFY_TOKEN and PAGE_ACCESS_TOKEN to your environment vars
const axios = require('axios');

'use strict';

// Use dotenv to read .env vars into Node
require('dotenv').config();

// Imports dependencies and set up http server
const
    request = require('request'),
    express = require('express'),
    { urlencoded, json } = require('body-parser'),
    app = express();

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond with 'Hello World' when a GET request is made to the homepage
app.get('/', function (_req, res) {
    res.send('Hello World');
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});



// Creates the endpoint for your webhook
app.post('/webhook', (req, res) => {
    // let senderPsid;
    console.log("webhook post API call:");
    let body = req.body;
    console.log("body from post API call: ", body);
    // Checks if this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched

        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhookEvent = entry.messaging[0];
            console.log(webhookEvent);

            // Get the sender PSID
            let senderPsid = webhookEvent.sender.id;
            console.log('Sender PSID: ' + senderPsid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);
            } else if (webhookEvent.postback) {
                handlePostback(senderPsid, webhookEvent.postback);
            }
        }
        );

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {

        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});

async function handleMessage(sender_psid, received_message) {
    console.log("PSID: ", sender_psid);
    console.log("Recieved message: ", received_message);
    console.log("Handle Message function call");
    const PAGE_ID = process.env.PAGE_ID;
    console.log("page_id: ", PAGE_ID)
    const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
    console.log("PAGE_ACCESS_TOKEN: ", PAGE_ACCESS_TOKEN);
    if (received_message.text === 'hi') {
        try {
            const response = await axios.post(`https://graph.facebook.com/v17.0/${PAGE_ID}/messages?recipient={id:${sender_psid}}&message={text:'You Texted ${received_message.text}!'}&messaging_type=RESPONSE&access_token=${PAGE_ACCESS_TOKEN}`)
            // console.log("Response is : ", response)
            return response;
        } catch (err) {
            console.log("Error is : ", err.response.data);
        }
    }
    else {
        // try {
        //     const response = await axios.post(`https://graph.facebook.com/v17.0/${PAGE_ID}/messages?recipient={id:${sender_psid}}&message={text:'You did it!'}&messaging_type=RESPONSE&access_token=${PAGE_ACCESS_TOKEN}`)
        //     // console.log("Response is : ", response)
        //     return response;
        // } catch (err) {
        //     console.log("Error is : ", err.response.data);
        // }
        try {
            const response = await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
                "recipient": {
                    "id": "6348126255224814" // PSID
                },
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": "What do you want to do next?",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Postback Button",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                },
                                {
                                    "type": "web_url",
                                    "url": "https://www.messenger.com",
                                    "title": "Visit Messenger"
                                },
                                {
                                    "type": "web_url",
                                    "url": "https://www.google.com/",
                                    "title": "Visit Google"
                                }
                            ]
                        }
                    }
                }
            })
            return response;
        } catch (err) {
            console.log("Error is : ", err.response.data);
        }
    }
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    console.log("Handle Postback function call");
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    console.log("Call SendAPI function call");
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});