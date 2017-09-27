var dbConnection = require('../db/')
var mongoose = dbConnection.mongoose
var db = dbConnection.db
var userSchema = mongoose.Schema({
	name:String,
	email:String,
	password:String
})
userSchema.methods.validatePassword = function(password){
	console.log(password + " " + this.password)
	return this.password==password;
}
var users = mongoose.model('users', userSchema)

module.exports = users