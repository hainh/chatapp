import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import messages_collection from '../import/collectionname.js';

let ChatMessages = new Mongo.Collection(messages_collection);

// ChatMessages.drop();

// window.ChatMessages = ChatMessages;

var queryTime = new Date();

function subscribe() {
    Meteor.subscribe("messages", queryTime);
}

subscribe();

import './main.html';

var initialized = false,
    loadingMore = false,
    newMessage = false,
    moreCount = 15,
    old_messages = [],
    old_msg_count = 0,
    old_zip_msg_count = 0;

function findInMessages(id) {
    return function(m) {
        return m._id === id;
    }
}

function zipMessages(all_messages){
    for (var i = 0; i < all_messages.length; i++) {
        var current_message = all_messages[i];
        for (var j = i + 1; j < all_messages.length; j++) {
            var next_message = all_messages[j];
            if (current_message.sender === next_message.sender && inDuration(1800, current_message.time, next_message.time)) {
                current_message.message = current_message.message.concat(next_message.message);
                all_messages.splice(j, 1);
                j--;
            } else { 
                break;
            }
        }
    }
}

function inDuration(seconds, time, timeOfNext) {
    return Math.abs(timeOfNext - time) < seconds * 1000;
}

Template.messages.helpers({
  messages() {
    var all_messages = ChatMessages.find({}, { sort : { time : 1 } }).fetch();
    var msg_count = all_messages.length;
    if (msg_count) {
        queryTime = all_messages[0].time;
        console.log("old message will start from" + queryTime);
        all_messages.forEach(function(m) {
            if (m.message.substring) {
                m.message = [m.message];
            }
        });
        zipMessages(all_messages);
        var zip_msg_count = all_messages.count;

        if (msg_count > old_messages && zip_msg_count == old_zip_msg_count) {
            setTimeout(onMessageRendered, 10); // new msg comes so we need to update scroll bar
        }
        old_msg_count = msg_count;
        old_zip_msg_count = zip_msg_count;
    }

    // console.log(all_messages);
    return all_messages;
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

window.onMessageRendered = function onMessageRendered(e) {
    var acm = $("#all-chat-messages");
    var messageH = $(".direct-chat-msg:last").outerHeight(true);

    if (newMessage) {
        loadingMore = false;
    }
    if (loadingMore) {
        acm.scrollTop(messageH * moreCount);
        loadingMore = !1;
        return;
    }

    newMessage = false;
    if (initialized && (acm[0].scrollHeight - acm.scrollTop()) - messageH > acm.outerHeight()) {
        return;
    }
    acm.scrollTop(acm.prop("scrollHeight"));
}

Template.messageLeft.rendered = onMessageRendered;
Template.messageRight.rendered = onMessageRendered;

Template.messages.rendered = function() {
    var acm = $("#all-chat-messages");
    acm.on('scroll', function () {
        initialized = !0;

        if (acm.scrollTop() === 0) {
            loadingMore = !0;
            subscribe();
        }
    }, 350);
};


window.sendMessage = function sendMessage(e) {
    if (e.keyCode !== 13) {
        return;
    }
    var sender = document.getElementById("username").value;
    var message = document.getElementById("message").value;

    if (sender.length < 3 || message.length < 2) {
        return;
    }

    localStorage.username = sender;

    document.getElementById("message").value = "";

    newMessage = true;

    ChatMessages.insert({time: new Date(), sender: sender, message : message });
};

(function ($) {
    var on = $.fn.on, timer;
    $.fn.on = function () {
        var args = Array.apply(null, arguments);
        var last = args[args.length - 1];

        if (isNaN(last) || (last === 1 && args.pop())) return on.apply(this, args);

        var delay = args.pop();
        var fn = args.pop();

        args.push(function () {
            var self = this, params = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(self, params);
            }, delay);
        });

        return on.apply(this, args);
    };
}($));