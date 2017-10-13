var io = null
var clients = []
var sharedSession = require("express-socket.io-session");
var UserList = require('../socket/user_list')
var Chats = require('../models/chats')
var Unread = require('../models/unread_message')
function broadcast(event_type, cause, obj) {
    Object.keys(clients).forEach(function(element) {
        if (element == cause)
            return
        clients[element].emit(event_type, obj)
    }, this);
}
/*
function bind(a_user_email, b_user_email) {
    var a = clients[a_user_email]
    var b = clients[b_user_email]
    a.on('disconnect', function() {
        b.emit('status_from_server', 'Disconnected')
        clients[a_user_email] = null
        delete clients[a_user_email]
    })
    b.on('disconnect', function() {
        a.emit('status_from_server', 'Disconnected')
        clients[b_user_email] = null
        delete clients[b_user_email]
    })
    console.log(a_user_email + " - " + b_user_email);
    a.emit('server_message_from_server', 'Connected to chat mate');
    b.emit('server_message_from_server', 'Connected to chat mate');
    a.emit('ready_from_server', b_user_email)
    b.emit('ready_from_server', a_user_email)
    a.removeAllListeners('chat_message')
    b.removeAllListeners('chat_message')
    a.on('chat_message', function(data) {
        console.log("CHAT MESSAGE " + a_user_email)
        a.emit('feedback_from_server', data)
        b.emit('chat_message_from_server', data);
    })
    b.on('chat_message', function(data) {
        console.log("CHAT MESSAGE " + b_user_email)
        b.emit('feedback_from_server', data)
        a.emit('chat_message_from_server', data);
    })
}
*/
var init = function(server, session) {
    global.io = require('socket.io')(server)
    io = global.io
    io.use(sharedSession(session, {
        autosave: true
    }))
    prepareIo()
    return this
}
setInterval(() => {
    console.log(Object.keys(clients).length)
}, 5000)
var prepareIo = function() {
    io.on('connection', function(connection) {
        var session = connection.handshake.session
        var user_email = session.user_email
        console.log("user " + user_email)
        if (!user_email) {
            connection.disconnect()
            return
        }
        if (clients[user_email]) {
            clients[user_email].disconnect()
        }
        connection.on('group_message', function(msg) {
            broadcast('group_message_from_server', user_email, {
                'msg': msg,
                'sender': user_email
            })
        })

        connection.on('disconnect', function() {
            console.log("Connection end : " + user_email)
            delete clients[user_email]
            UserList.setUserList(Object.keys(clients))
            broadcast('user_list_update', user_email)
            broadcast("group_special_from_server", user_email, user_email + " left.")
            connection.removeAllListeners('chat_message')
            connection.removeAllListeners('chat_message_from_server')

        })
        /*
        connection.on('connection_request', function(user) {
            if (!clients[user]) {
                connection.emit('status_from_server', 'Requested client not online!')
            } else {
                clients[user].emit('connection_request_from_server', user_email)
            }
        })
        connection.on('rejected', function(user) {
            clients[user].emit('rejected_from_server', user_email)
        })
        
        connection.on('ready', function(user) {
            console.log("session-name : " + user_email)
            clients[user].emit('ready_from_server', user_email)
            bind(user_email, user)

        })
        */
        connection.on('chat_message', function(data){
            console.log(data)
            connection.emit('feedback_from_server', data.message)
            Chats.findOne({participants:{$all:[data.to, user_email]}}, (err, result)=>{
                if(result){
                    result.messages.push({author:user_email, message:data.message, read:false})
                    result.save()
                }
            })
            if(data.to in clients){
                clients[data.to].emit('chat_message_from_server', {from:user_email, message:data.message});
            }
            else{
                new Unread({
                    from:user_email,
                    to:data.to,
                    message:data.message
                }).save()
            }
        })
        connection.emit('identity_from_server', user_email)
        console.log("New connection from : " + user_email)
        clients[user_email] = connection
        UserList.setUserList(Object.keys(clients))
        broadcast('user_list_update', user_email)
        connection.emit('group_special_from_server', 'You joined now.')
        broadcast('group_special_from_server', user_email, user_email + " joined.")
    })
    io.on("photo_update_broadcast", ()=>{
        broadcast('photo_update', null, null)
    })
}
module.exports = init