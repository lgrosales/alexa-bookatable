/**
 * One-shot model:
 *  Not Implemented
 * Dialog model:
 *  User: "Alexa, tell Bookatable to book a table at [9PM]"
 *  Alexa: "Of course! For how many people?"
 *  User: "[Two]"
 *  Alexa: "A table for [two] will be ready for you at [9PM] in your favourite restaurant"
 */

'use strict';

var APP_ID = "amzn1.ask.skill.e6e3f015-f473-4c82-b3b7-aaa9332d81e5"; // process.env.APP_ID
var CREATE_BOOKING_ENDPOINT = "https://{apiHost}/v2/bookings"; // process.env.CREATE_BOOKING_ENDPOINT
var RESTAURANT_ID = "f115f0f9a5d44318b64c7f84c94dd9fc"; // process.env.RESTAURANT_ID
var KEY_TIME = "time";

var AlexaSkill = require('./AlexaSkill');
// var http = require('http');

var BookatableSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

BookatableSkill.prototype = Object.create(AlexaSkill.prototype);
BookatableSkill.prototype.constructor = BookatableSkill;


BookatableSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("BookatableSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

BookatableSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("BookatableSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Hi! Welcome to Book a table, you can ask me to book a table at the time you want";
    var repromptText = "You can ask me to book a table at the time you want";
    response.ask(speechOutput, repromptText);
};

BookatableSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("BookatableSkill onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

BookatableSkill.prototype.intentHandlers = {
    "BookatableIntent": function (intent, session, response) {
        session.attributes[KEY_TIME] = intent.slots.Time.value;
        response.ask("Of course! For how many people?", "How many people do you want me to book for?");
    },
    "PartySizeIntent": function (intent, session, response) {
        handleCreateBooking(intent, session, response);
    }
};

function handleCreateBooking(intent, session, response) {
    var time = session.attributes[KEY_TIME];
    var partySize = intent.slots.PartySize.value;
    var speechOutput = "A table for " + partySize + " will be ready for you at " + time + " in your favourite restaurant";
    var cardTitle = "Booking confirmed!";
    
    console.log("BookatableSkill handleCreateBooking: " + speechOutput);
    
    createBooking(time, partySize);
    
    response.tellWithCard(speechOutput, cardTitle, speechOutput);
}

function createBooking(time, partySize) {
    var addBookingCommand = getAddBookingCommand(time, partySize);
    console.log("BookatableSkill addBookingCommand: " + JSON.stringify(addBookingCommand));

    //  var post_options = {
    //   host: CREATE_BOOKING_ENDPOINT,
    //   port: '80',
    //   path: '',
    //   method: 'POST',
    //   headers: {
    //       'Content-Type': 'application/json',
    //       'Content-Length': Buffer.byteLength(addBookingCommand)
    //     }
    // };

    // var post_req = http.request(post_options, function(res) {
    //     res.setEncoding('utf8');
    //     res.on('data', function (chunk) {
    //         console.log('Response: ' + chunk);
    //     });
    // });

    // post_req.write(addBookingCommand);
    // post_req.end();
}

function getAddBookingCommand(time, partySize) {
    var bookingDateTimeUtc = getBookingDateTimeUtc(time);
    return {
        salesforceCustomerId: RESTAURANT_ID,
        partySize: partySize,
        dateTimeUtc: bookingDateTimeUtc,
        channel: "Alexa",
        bookingSource: "Alexa",
        walkIn: false,
        shiftId: null,
        guest: {
            firstName: "HAL",
            lastName: "9000",
            phoneNumber: "9000",
            emailAddress: "hal@9000.ai",
        },
        notes: "I'm sorry, Dave. I'm afraid I can't do that."
    };
}

function getBookingDateTimeUtc(time) {
    var today = new Date();
    var month = today.getMonth() + 1;
    var bookingDateTimeString = today.getFullYear() + "-" + month + "-" + today.getDate() + "T" + time + "+00:00"; //"2016-11-26T19:00+00:00"
    return new Date(bookingDateTimeString);
}

exports.handler = function (event, context) {
    var bookatableSkill = new BookatableSkill();
    bookatableSkill.execute(event, context);
};