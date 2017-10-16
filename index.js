const http = require('http')
const express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport')
var app = express()
var server = http.Server(app)
var session = require('express-session')
var config = require('./app/auth/config')
app.set('views', __dirname+"/public/views/")
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
var routes = require('./app/routes/')
var currentSession = session({
	secret: config.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
  })
app.use(currentSession)
app.use(passport.initialize())
app.use(passport.session())
app.use('/', routes)
app.use((req, res)=>{
	res.statusCode = 404
	res.end("404 not found!")
})

var socket = require('./app/socket/')(server, currentSession)

server.listen(4002, ()=>{
	console.log("Server started.")
})