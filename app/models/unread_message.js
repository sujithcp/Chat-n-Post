var dbConnection = require('../db/')
var mongoose = dbConnection.mongoose
var db = dbConnection.db
var unreadSchema = mongoose.Schema({
	from:String,
	to:String,
	message:String
})

var unread = mongoose.model('unread', unreadSchema)

module.exports = unread