"use strict";
/* jshint node: true */

var mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Activity.
 */
var activitySchema = new mongoose.Schema({
  date_time: { type: Date, default: Date.now },
  user_name: String,
  activity_type: String,
  file_name: {type: String, default: null},
});

/**
 * Create a Mongoose Model for a Activity using the userSchema.
 */
var Activity = mongoose.model("Activity", activitySchema);

/**
 * Make this available to our application.
 */
module.exports = Activity;
