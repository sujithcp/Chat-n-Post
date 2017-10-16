var dbConnection = require('../db/')
var mongoose = dbConnection.mongoose
var db = dbConnection.db
var photoPostSchema = mongoose.Schema({
	name:String,
	user_email:String,
	time:String,
	location:String,
	click_count:Number,
	caption:String
})
var photoPostModel = mongoose.model('photo_post', photoPostSchema)

module.exports = photoPostModel