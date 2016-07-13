import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

let ChatMessages = new Mongo.Collection('messages');

window.ChatMessages = ChatMessages;

Meteor.subscribe("messages", 0, 5);

import './main.html';


Template.messages.helpers({
  messages() {
    return ChatMessages.find({}, { sort : { time : 1 } });
  },

  isMe(sender) {
    console.log("sender = " + sender);
        return sender == document.getElementById("username").value;
  },

});

function getTime0(time) {
    var options;
    var now = new Date();
    console.log(now.toLocaleDateString() , time.toLocaleDateString());
    if (now.toLocaleDateString() == time.toLocaleDateString()){
        options = { hour: "2-digit", minute: "2-digit", hour12: false };
    } else {
        options = { year: '2-digit', month: '2-digit', day: '2-digit', hour: "2-digit", minute: "2-digit", hour12: false };
    }

    return time.toLocaleString("en-US", options);
}

Template.messageLeft.helpers({

    getTime(time) {
        return getTime0(time);
    }
});

Template.messageRight.helpers({

    getTime(time) {
        return getTime0(time);
    }
});

function scrollBottom() {
    var dcm = $("#all-chat-messages");
    dcm.scrollTop(dcm.prop("scrollHeight"));
}

Template.messageLeft.rendered = scrollBottom;
Template.messageRight.rendered = scrollBottom;

window.sendMessage = function sendMessage(e) {
    console.log(e.keyCode);
    if (e.keyCode !== 13) {
        return;
    }
    var sender = document.getElementById("username").value;
    var message = document.getElementById("message").value;
    console.log(sender, message);

    if (sender.length < 3 || message < 2) {
        return;
    }

    localStorage.username = sender;

    document.getElementById("message").value = "";

    ChatMessages.insert({time: new Date(), sender: sender, message : message });
}