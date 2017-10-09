var dbConnection = require('../db/')
var mongoose = dbConnection.mongoose
var db = dbConnection.db
var userSchema = mongoose.Schema({
	email:String,
	badge:String,
	score:Number,
	liked_photos:Array
})
var users = mongoose.model('public_profile', userSchema)

module.exports = users