import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

let ChatMessages = new Mongo.Collection('messages');

window.ChatMessages = ChatMessages;

Meteor.subscribe("messages", 0, 5);

import './main.html';

Template.message.onCreated(function helloOnCreated() {

});

Template.messages.helpers({
  messages() {
    return ChatMessages.find({}, { sort : { time : 1 } });
  },
});

Template.message.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});

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

  ChatMessages.insert({time: new Date(), sender: sender, message : message });
}
