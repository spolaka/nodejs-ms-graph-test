var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ActivityTypeSchema = Schema({
  name: {type: String, required: true , unique : true},
  points: { type: Number, min: 1, max: 100},
});

//Export model
module.exports = mongoose.model('ActivityType', ActivityTypeSchema);
  
