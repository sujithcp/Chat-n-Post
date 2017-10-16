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
        connection.on('read_message', (data)=>{
            Unread.remove({from:data.from, to:user_email}, (err)=>{
                if(err)
                    console.log(err.toString())
                else
                    console.log("Removed messages from unread db")
            })
        })
        connection.emit('identity_from_server', user_email)
        console.log("New connection from : " + user_email)
        clients[user_email] = connection
        UserList.setUserList(Object.keys(clients))
        broadcast('user_list_update', user_email)
        connection.emit('group_special_from_server', 'You joined now.')
        broadcast('group_special_from_server', user_email, user_email + " joined.")
    })
}
module.exports = init