/**
 * One-shot model:
 *  Not Implemented (ie: "Alexa, ask Bookatable to book a table for [two] at [9PM]")
 * Dialog model:
 *  User: "Alexa, tell Bookatable to book a table at [9PM]"
 *  Alexa: "Of course! For how many people?"
 *  User: "[Two]"
 *  Alexa: "A table for [two] will be ready for you at [9PM] in your favourite restaurant"
 */

"use strict";

var APP_ID = process.env.APP_ID;
var API_HOST = process.env.API_HOST; 
var RESTAURANT_ID = process.env.RESTAURANT_ID;
var CREATE_BOOKING_ENDPOINT = "/v1/bookings";
var KEY_TIME = "time";

var AlexaSkill = require("./AlexaSkill");
var https = require("https");

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
    var speechOutput = "Hi Leo! Welcome to Omnia. At what time do you want me to book a table for you?";
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
    var addBookingCommand = getAddBookingCommand(time, partySize);
    console.log("BookatableSkill addBookingCommand: " + addBookingCommand);

     var postOptions = {
      host: API_HOST,
      path: CREATE_BOOKING_ENDPOINT,
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(addBookingCommand)
        }
    };

    var postReq = https.request(postOptions, function(res) {
        console.log("STATUS: " + res.statusCode);
        console.log("HEADERS: " + JSON.stringify(res.headers));
        res.setEncoding("utf8");
        res.on("data", function (chunk) {
            console.log("Response: " + chunk);
            bookingConfirmed(response, time, partySize);
        });
    });

    postReq.on("error", function(e) {
        console.log("problem with request: " + e.message);
    });

    postReq.write(addBookingCommand);
    postReq.end();
}

function bookingConfirmed(response, time, partySize) {
    var speechOutput = "A table for " + partySize + " will be ready for you at " + time + " in your favourite restaurant";
    var cardTitle = "Booking confirmed!";
    console.log("BookatableSkill bookingConfirmed: " + speechOutput);
    response.tellWithCard(speechOutput, cardTitle, speechOutput);
}

function getAddBookingCommand(time, partySize) {
    var bookingDateTimeUtc = getBookingDateTimeUtc(time);
    var addBookingCommand = {
        salesforceCustomerId: RESTAURANT_ID,
        partySize: partySize,
        dateTimeUtc: bookingDateTimeUtc,
        channel: "Alexa",
        bookingSource: "Alexa",
        timeZone:"Europe/London",
        cultureCode:"en-GB",
        walkIn: false,
        shiftId: null,
        restaurant: null,
        optInMarketingFromRestaurant:false,
        optInMarketingFromBookatable:false,
        guest: {
            firstName: "HAL",
            lastName: "9000",
            phoneNumber: "+44 9000",
            emailAddress: "hal@9000.ai",
        },
        notes: "I'm sorry, Dave. I'm afraid I can't do that."
    };
    return JSON.stringify(addBookingCommand);
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