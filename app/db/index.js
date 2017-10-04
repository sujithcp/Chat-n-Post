var mongoose = require('mongoose')
mongoose.Promise = global.Promise
var db = null
mongoose.connect("mongodb://localhost/final-project", {useMongoClient: true}).then(()=>{
	console.log("Connection successful")
	db = mongoose.connection
	db.on('error', (data)=>{
		console.log("Database connection error : " + (data)?data:"")
	})
	db.once('open', ()=>{
		console.log("Success fully connected to database.")
	})
}).catch((err)=>{
	console.log("ERROR " + err.toString())
})
module.exports = {db, mongoose}
