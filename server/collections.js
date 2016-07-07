import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

var database = new MongoInternals.RemoteCollectionDriver('mongodb://chatapp:123qweASD@ds027328.mlab.com:27328/chatapp');

let ChatMessages = new Mongo.Collection('messages', { _driver : database });

Meteor.publish("messages", function(skip, limit) {
    console.log(skip + "   " + limit);
    return ChatMessages.find({}, {
        'sort' : { time : -1},
        'skip' : skip,
        'limit' : limit
    });
});