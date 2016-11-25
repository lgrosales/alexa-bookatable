/**
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Bookatable to book a table at [9PM]"
 *  Alexa: "How many people do you need a table for?"
 *  User: "[Two]"
 *  Alexa: "A table for [two] will be ready for you at [9PM] in [La Patagonia]"
 */

var APP_ID = "amzn1.ask.skill.e6e3f015-f473-4c82-b3b7-aaa9332d81e5";

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
    var speechOutput = "Welcome to the Alexa Skills Kit, you can say hello";
    var repromptText = "You can say hello";
    response.ask(speechOutput, repromptText);
};

BookatableSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("BookatableSkill onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

BookatableSkill.prototype.intentHandlers = {
    "BookatableIntent": function (intent, session, response) {
        response.ask("Of course! How many people do you want me to book for?", "Of course! How many people do you want me to book for?");
    },
    "PartySizeIntent": function (intent, session, response) {
        response.tellWithCard("A table for two will be ready for you at 9PM in La Patagonia", "A table for two will be ready for you at 9PM in La Patagonia", "A table for two will be ready for you at 9PM in La Patagonia");
    }
};

exports.handler = function (event, context) {
    var bookatableSkill = new BookatableSkill();
    bookatableSkill.execute(event, context);
};