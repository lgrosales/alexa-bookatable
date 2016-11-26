/**
 * Dialog model:
 *  User: "Alexa, tell Bookatable to book a table at [9PM]"
 *  Alexa: "Of course! For how many people?"
 *  User: "[Two]"
 *  Alexa: "A table for [two] will be ready for you at [9PM] in your favourite restaurant"
 */

'use strict';

var APP_ID = "amzn1.ask.skill.e6e3f015-f473-4c82-b3b7-aaa9332d81e5";
var KEY_TIME = "time"

var AlexaSkill = require('./AlexaSkill');

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
    var speechOutput = "Welcome to Book a table, you can ask me to book a table at the time you want";
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
        handleBooking(intent, session, response);
    }
};

function handleBooking(intent, session, response) {
    var time = session.attributes[KEY_TIME];
    var partySize = intent.slots.PartySize.value;
    var speechOutput = "A table for " + partySize + " will be ready for you at " + time + " in your favourite restaurant";
    var cardTitle = "Your booking at La Patagonia";
    console.log("BookatableSkill handleBooking: " + speechOutput);
    response.tellWithCard(speechOutput, cardTitle, speechOutput);
}

exports.handler = function (event, context) {
    var bookatableSkill = new BookatableSkill();
    bookatableSkill.execute(event, context);
};