"use strict";
/* jshint node: true */

var mongoose = require('mongoose');

/**
 * Create a Mongoos Schema.
 */
var schemaInfo = new mongoose.Schema({
    version: String,
    load_date_time: {type: Date, default: Date.now},
});

/**
 * Create a Mongoose Model.
 */
var SchemaInfo = mongoose.model('SchemaInfo', schemaInfo);

/**
 * Make this available to our application.
 */
module.exports = SchemaInfo;
