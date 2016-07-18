import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import messages_collection from '../import/collectionname.js';

var database = new MongoInternals.RemoteCollectionDriver('mongodb://chatapp:123qweASD@ds027328.mlab.com:27328/chatapp');

let ChatMessages = new Mongo.Collection(messages_collection, { _driver : database });
ChatMessages._createCappedCollection(200000000, 5000);
// ChatMessages.drop();

let findOptions = {
	sort : { time : -1 }
}

let lastDate = null;

Meteor.publish("messages", function(date) {
    // console.log(".=====Start publish for " + date);

    var _date = new Date(date);

    if (lastDate === null || _date - lastDate !== 0) {
        lastDate = _date;
        // console.log("query time = " + _date);
    	var temps = ChatMessages.find({time : {$lte: _date}}, {sort: {time : -1}, limit : 25}).fetch();
        // console.log("result = " + (temps.length ? temps[0].time : "nothing"));
        if (temps.length) {
            var last = temps[temps.length - 1];
            _date = last.time;
            // console.log("real query = " + lastDate);
        } else {
            // console.log("nothing to show");
            return ChatMessages.find({});
        }
    }

    var query = {
    	time : { $gte : _date }
    };

    var cursor = ChatMessages.find(query, findOptions);
    // console.log(cursor.count());
    
    return cursor;
});