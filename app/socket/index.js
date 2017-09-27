var io = null
var clients = []
var sharedSession = require("express-socket.io-session");
var UserList = require('../socket/user_list')
function bind(a_user_email,b_user_email)
{
	var a = clients[a_user_email]
	var b = clients[b_user_email]
	a.on('disconnect', function(){
		delete clients[a_user_email]
		UserList.setUserList(clients)
		b.emit('status', 'Disconnected')
	})
	b.on('disconnect', function(){
		delete clients[b_user_email]
		UserList.setUserList(clients)
		a.emit('status', 'Disconnected')
	})
	console.log(a_user_email + " - " + b_user_email);
	a.emit('server message','Connected to chat mate');
	b.emit('server message','Connected to chat mate');
	a.emit('ready')
	b.emit('ready')
	a.on('chat_message', function(data){
		a.emit('feedback', data)
		b.emit('chat_message',data);
	})
	b.on('chat_message', function(data){
		b.emit('feedback', data)
		a.emit('chat_message',data);
	})
}
var init = function(server, session){
	io = require('socket.io')(server)
	io.use(sharedSession(session, {
		autosave:true
	}))
	prepareIo()
	return this
}
setInterval(()=>{
	console.log(Object.keys(clients).length)
}, 5000)
var prepareIo = function(){
	io.on('connection', function(connection){
		var session = connection.handshake.session
		var user_email = session.user_email
		console.log("user " + user_email)
		if(!user_email){
			connection.disconnect()
			return
		}
		connection.on('disconnect', function(){
			console.log("Connection end : " + user_email)
			delete clients[user_email]
		})
		connection.on('connection_request', function(user){
			if(!clients[user]){
				connection.emit('status','Requested client not online!')
			}
			else{
				clients[user].emit('connection_request', user_email)
			}
		})
		connection.on('rejected', function(user){
			clients[user].emit('rejected', user_email)
		})
		connection.on('ready', function(user){
			console.log("session-name : " + user_email)
			clients[user].emit('ready', user_email)
			bind(user_email, user)
			
		})
		console.log("New connection from : " + user_email)
		clients[user_email] = connection
		UserList.setUserList(Object.keys(clients))
	})
}
module.exports = init