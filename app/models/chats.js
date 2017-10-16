var dbConnection = require('../db/')
var mongoose = dbConnection.mongoose
var db = dbConnection.db
var chatSchema = mongoose.Schema({
	participants:Array,
	messages:Array,
})

var chats = mongoose.model('chats', chatSchema)

module.exports = chats