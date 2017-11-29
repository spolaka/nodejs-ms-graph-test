var ActivityType = require('../models/activitytype');
var Activity = require('../models/activity');
var async = require('async');


function getAllActivityTypes(callback) {
  ActivityType.find({} , function(err , ActivityTypes ) {
    if(!err){
      var resArray = [];
      console.log(ActivityTypes);
      async.forEachSeries(ActivityTypes, function(s , callback) {
        console.log(s.name);
        resArray.push(s.name);
        callback();
     }, function(err) {
         callback(resArray);
     });
    }
    else{
      console.log(err);
    }
  });
}

function addActivityType( name, points , callback) {
  var newActivityType = new ActivityType({
    name: name,
    points: points
  });
  newActivityType.save(function(err) {
    callback(err);
  });
}

function getActivityTypebyName(name , callback) {
  ActivityType.find({ name: name } , function(err , ActivityTypes) {
    callback(err , ActivityTypes);
  });
}

function addActivity( type , start_time , end_time ,points , participants, callback) {
  getActivityTypebyName(type , function (err , activitytype){
      var newActivity = new Activity({
        type: type,
        start_time: start_time,
        end_time: end_time,
        points:points,
        participants: participants
      });
      newActivity.save(function(err) {
        callback(err); 
      });
  });
}

function getActivityForUser( user, callback) {
  Activity.find({ participants: user } , function(err , Activities){
    callback(err , Activities);
  });
}

exports.getAllActivityTypes = getAllActivityTypes;
exports.addActivityType = addActivityType;
exports.getActivityTypebyName = getActivityTypebyName;
exports.addActivity = addActivity;
exports.getActivityForUser = getActivityForUser;
