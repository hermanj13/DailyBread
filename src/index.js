var Alexa = require('alexa-sdk');

var states = {
    STARTMODE: '_STARTMODE',
    ASKMODE: '_ASKMODE',
    RESPONSEMODE: '_RESPONSEMODE'
};

var nodes = [{ "node": 1, "message": "Do you want breakfast food?", "yes": 2, "no": 3 },
             { "node": 2, "message": "Do you want something warm?", "yes": 4, "no": 5 },
             { "node": 3, "message": "Do you want something sweet?", "yes": 6, "no": 7 },
             { "node": 4, "message": "Do you have chocolate chips?", "yes": 8, "no": 9 },
             { "node": 5, "message": "Do you have cereal in the house?", "yes": 10, "no": 11 },
             { "node": 6, "message": "Do you want something cold?", "yes": 12, "no": 13 },
             { "node": 7, "message": "Do you want something healthy?", "yes": 14, "no": 15 },

             { "node": 8, "message": "Chocolate chip pancakes are the only option in this case.", "yes": 0, "no": 0 },
             { "node": 9, "message": "Bacon, bacon, and more bacon", "yes": 0, "no": 0 },
             { "node": 10, "message": "Go pour yourself a nice big bowl of your favorite cereal", "yes": 0, "no": 0 },
             { "node": 11, "message": "Enter answer here", "yes": 0, "no": 0 },
             { "node": 12, "message": "Go for the double dunker!", "yes": 0, "no": 0 },
             { "node": 13, "message": "A nice piece of cake is the way to go.", "yes": 0, "no": 0 },
             { "node": 14, "message": "Get the spinach and make a nice salad!", "yes": 0, "no": 0 },
             { "node": 15, "message": "Pick up the phone and call your favorite pizza place. It's pizza night.", "yes": 0, "no": 0 },
];

var skillName = "Daily Bread";
var welcomeMessage = "Welcome to Daily Bread, are you ready to find out what you should eat?";
var repeatWelcomeMessage = "Say yes to start the meal process or no to quit.";
var promptToSayYesNo = "Say yes or no to answer the question.";
var promptToStartMessage = "Say yes to continue, or no to end.";
var helpMessage = "I will ask you some questions that will help you decide what to eat. Want to start now?";
var mealRecomendation = "Here's your meal recomendation:";
var goodbyeMessage = "Enjoy your meal!";
var playAgainMessage = "Want a different meal option? say start over to begin again.";
var startNode = 1;

// Called when the session starts.
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandler, startHandlers, askQuestionHandlers, responseHandlers);
    alexa.execute();
};

// set state to start up and  welcome the user
var newSessionHandler = {
  'LaunchRequest': function () {
    this.handler.state = states.STARTMODE;
    this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
  },
  'AMAZON.HelpIntent': function () {
    this.handler.state = states.STARTMODE;
    this.emit(':ask', helpMessage, helpMessage);
  },
  'Unhandled': function () {
    this.handler.state = states.STARTMODE;
    this.emit(':ask', promptToStartMessage, promptToStartMessage);
  }
};

var startHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'yesIntent': function () {
        this.handler.state = states.ASKMODE;
        var message = helper.getSpeechForNode(startNode);
        this.attributes.currentNode = startNode;
        this.emit(':ask', message, message);
    },
    'noIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.StartOverIntent': function () {
         this.emit(':ask', promptToStartMessage, promptToStartMessage);
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', helpMessage, helpMessage);
    },
    'Unhandled': function () {
        this.emit(':ask', promptToStartMessage, promptToStartMessage);
    }
});

var askQuestionHandlers = Alexa.CreateStateHandler(states.ASKMODE, {
    'yesIntent': function () {
        helper.yesOrNo(this,'yes');
    },
    'noIntent': function () {
         helper.yesOrNo(this, 'no');
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', promptToSayYesNo, promptToSayYesNo);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.StartOverIntent': function () {
        this.handler.state = states.STARTMODE;
        this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
    },
    'Unhandled': function () {
        this.emit(':ask', promptToSayYesNo, promptToSayYesNo);
    }
});

var responseHandlers = Alexa.CreateStateHandler(states.RESPONSEMODE, {
 'yesIntent': function () {
        this.handler.state = states.STARTMODE;
        this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
    },
    'noIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', promptToSayYesNo, promptToSayYesNo);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'AMAZON.StartOverIntent': function () {
        this.handler.state = states.STARTMODE;
        this.emit(':ask', welcomeMessage, repeatWelcomeMessage);
    },
    'Unhandled': function () {
        this.emit(':ask', promptToSayYesNo, promptToSayYesNo);
    }
});

var helper = {
    yesOrNo: function (context, reply) {
        var nextNodeId = helper.getNextNode(context.attributes.currentNode, reply);
        var message = helper.getSpeechForNode(nextNodeId);
        if (helper.isAnswerNode(nextNodeId) === true) {
            context.handler.state = states.RESPONSEMODE;
            message = mealRecomendation + ' ' + message + ' ,' + playAgainMessage;
        }
        context.attributes.currentNode = nextNodeId;
        context.emit(':ask', message, message);
    },
    getSpeechForNode: function (nodeId) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                return nodes[i].message;
            }
        }
    },
    isAnswerNode: function (nodeId) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                if (nodes[i].yes === 0 && nodes[i].no === 0) {
                    return true;
                }
            }
        }
        return false;
    },
    getNextNode: function (nodeId, yesNo) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                if (yesNo == "yes") {
                    return nodes[i].yes;
                }
                return nodes[i].no;
            }
        }
    },
};
