import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

let ChatMessages = new Mongo.Collection('messages');

window.ChatMessages = ChatMessages;

Meteor.subscribe("messages", 0, 5);

import './main.html';

var initialized = false;


Template.messages.helpers({
  messages() {
    return ChatMessages.find({}, { sort : { time : 1 } });
  },

  isMe(sender) {
        return sender == document.getElementById("username").value;
  },

});

function getTime0(time) {
    var options;
    var now = new Date();
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

var scheduled = false;

window.scrollBottom = function scrollBottom() {
    var dcm = $("#all-chat-messages");
    var messageH = $(".direct-chat-msg").outerHeight(true);
    console.log(dcm[0].scrollHeight - dcm.scrollTop() , dcm.outerHeight(), messageH);

    if (!scheduled) {
        setTimeout(function() { initialized = true; }, 1000);
        scheduled = true;
    }

    if (initialized && (dcm[0].scrollHeight - dcm.scrollTop()) - messageH > dcm.outerHeight()) {
        return;
    }
    dcm.scrollTop(dcm.prop("scrollHeight"));
}

Template.messageLeft.rendered = scrollBottom;
Template.messageRight.rendered = scrollBottom;

window.sendMessage = function sendMessage(e) {
    if (e.keyCode !== 13) {
        return;
    }
    var sender = document.getElementById("username").value;
    var message = document.getElementById("message").value;

    if (sender.length < 3 || message < 2) {
        return;
    }

    localStorage.username = sender;

    document.getElementById("message").value = "";
    initialized = true;

    ChatMessages.insert({time: new Date(), sender: sender, message : message });
}