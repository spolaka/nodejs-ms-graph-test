var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ActivitySchema = Schema({
  type: {type: String, required: true},
  start_time: { type: Date,  required: true },
  end_time: { type: Date,  required: true },
  points:{type: Number, required: true},
  participants: [{type: String}]
});

//Export model
module.exports = mongoose.model('Activity', ActivitySchema);
