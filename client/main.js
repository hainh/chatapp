import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import messages_collection from '../import/collectionname.js';

let ChatMessages = new Mongo.Collection(messages_collection);

// ChatMessages.drop();

window.ChatMessages = ChatMessages;

var findOptions = {
    sort : { time : -1 },
    limit : 15
};

Meteor.subscribe("messages", findOptions);

import './main.html';

var initialized = false,
    loadingMore = false,
    newMessage = false,
    moreCount = 15,
    old_messages = [];

function findInMessages(id) {
    return function(m) {
        return m._id === id;
    }
}

Template.messages.helpers({
  messages() {
    var all_messages = ChatMessages.find({}, { sort : { time : 1 } }).fetch();
    // if (newMessage) {
        // all_messages.forEach(function (m) {
        //     if (old_messages.findIndex(findInMessages(m._id)) < 0) {
        //         m.hidden = "collapse";
        //     }
        // });
        // all_messages[all_messages.length - 1].hideThis = "transparent";
    // }
    // old_messages = all_messages;
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

window.scrollBottom = function scrollBottom(e) {
    var acm = $("#all-chat-messages");
    var messageH = $(".direct-chat-msg:last").outerHeight(true);

    // console.log(this);
    if (newMessage) {
        loadingMore = false;
    }
    if (loadingMore) {
        acm.scrollTop(messageH * moreCount);
        loadingMore = !1;
        return;
    }

    // if (newMessage) {
    //     //$(".fade").fadeIn(2000, "easeOutCubic");
    //     newMessage = false;
    // }
    newMessage = false;
    if (initialized && (acm[0].scrollHeight - acm.scrollTop()) - messageH > acm.outerHeight()) {
        // acm.scrollTop(acm.scrollTop() - messageH);
        return;
    }
    acm.scrollTop(acm.prop("scrollHeight"));
}

Template.messageLeft.rendered = scrollBottom;
Template.messageRight.rendered = scrollBottom;

Template.messages.rendered = function() {
    var acm = $("#all-chat-messages");
    acm.on('scroll', function () {
        initialized = !0;

        if (acm.scrollTop() === 0) {
            findOptions.limit += moreCount;
            loadingMore = !0;
            Meteor.subscribe("messages", findOptions);
        }
    }, 350);
};


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

    newMessage = true;
    findOptions.limit++;

    ChatMessages.insert({time: new Date(), sender: sender, message : message });
    Meteor.subscribe("messages", findOptions);
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