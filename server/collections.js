import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import messages_collection from '../import/collectionname.js';

var database = new MongoInternals.RemoteCollectionDriver('mongodb://chatapp:123qweASD@ds027328.mlab.com:27328/chatapp');

let ChatMessages = new Mongo.Collection(messages_collection, { _driver : database, capped: true, size: 50000000, max: 500 });
// ChatMessages.drop();

let findOptions = {
	sort : { time : -1 }
}

let lastDate = null;

Meteor.publish("messages", function(date) {
    console.log(date);

    var _date = new Date(date);

    if (lastDate === null || _date - lastDate !== 0) {
    	var temps = ChatMessages.find({time : {$lte: _date}}, {sort: {time : -1}, limit : 25}).fetch();
    	var last = temps[temps.length - 1];
    	lastDate = last.time;
    }

    var query = {
    	time : { $gte : lastDate }
    };

    var cursor = ChatMessages.find(query, findOptions);
    console.log(cursor.count());
    
    return cursor;
});