import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import messages_collection from '../import/collectionname.js';

var database = new MongoInternals.RemoteCollectionDriver('mongodb://chatapp:123qweASD@ds027328.mlab.com:27328/chatapp');

let ChatMessages = new Mongo.Collection(messages_collection, { _driver : database, capped: true, size: 50000000, max: 500 });
// ChatMessages.drop();

Meteor.publish("messages", function(options) {
    console.log(options);
    var cursor = ChatMessages.find({}, options);
    console.log(cursor.count());
    
    return cursor;
});