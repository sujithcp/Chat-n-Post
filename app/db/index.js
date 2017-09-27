var mongoose = require('mongoose')
mongoose.connect("mongodb://localhost/final-project")
var db = mongoose.connection
db.on('error', (data)=>{
	console.log("Database connection error : " + (data)?data:"")
})
db.once('open', ()=>{
	console.log("Success fully connected to database.")
})
module.exports = {db, mongoose}