var socket = io();
current_chat = {
    partner: '',
    ready: false
}
var connected = false
var container = document.getElementById('chat')
var groupContainer = document.getElementById('chat_group')
var chat_msg = document.getElementById('msg')
var button = document.getElementById('send_button')
var me = ""
var chatArea = document.getElementById('chat_area')
var chatUserList = document.getElementById('chat_user_list')
var chatDiv = document.getElementById('chat_div')
var toggle = document.getElementById('chat_header')
var toggleIcon = document.getElementById('toggle_icon')
var singleChatDiv = document.getElementById('one_one_chat')
var groupChatDiv = document.getElementById('group_chat')
var groupChatButton = document.getElementById("group_chat_button")
var groupButton = document.getElementById('send_button_group')
var groupChatMsg = document.getElementById('msg_group')
var newChat = document.getElementById("new_chat")
toggleIcon.onclick = function(e) {
    if (chatArea.hidden) {
        chatArea.hidden = false
        chatUserList.hidden = true
		toggleIcon.setAttribute('src', "/assets/toggle-right.png")
        groupChatButton.hidden = true
        newChat.hidden = true
		singleChatDiv.hidden = false;
		groupChatDiv.hidden = true;
        fetchUserList()
    } else {
        chatArea.hidden = true
        chatUserList.hidden = false
		toggleIcon.setAttribute('src', "/assets/toggle-left.png")
        groupChatButton.hidden = false
        newChat.hidden = false
    }
}

function createMessageNode(msg, className) {
    var item = document.createElement('div')
    var p = document.createElement('p')
    item.className = className
    item.appendChild(p)
    p.appendChild(document.createTextNode(msg))
    return item;
}

function getChatMessages(e, mate_param){
    var div = e.target
    var mate = mate_param
    if(!mate)
        mate = div.id
    sendXhr('POST', '/chat_messages', JSON.stringify({'me':me, 'mate':mate}), (messages)=>{
        //console.log(messages)
        if(!messages)
            return
        messages = JSON.parse(messages)
        //console.log(messages)
        document.getElementById('chat').innerHTML = "";
        connected = true
        current_chat.partner = mate;
        document.getElementById('status').innerHTML = mate;
        if (chatArea.hidden) {
            toggleIcon.click()
        }
        singleChatDiv.hidden = false;
        groupChatDiv.hidden = true;
        for(var i in messages){
            msg = messages[i]
            if(msg.author==me){
                container.insertBefore(createMessageNode(msg.message, 'self'), container.firstChild)
            }
            else{
                container.insertBefore(createMessageNode(msg.message, 'chatmate'), container.firstChild)
            }
        }
        socket.emit('read_message', {from:mate})
    })
}

function updateCount(email, newCount){
    var div = document.getElementById(email)
    document.getElementById(email).innerHTML = ""
    div.appendChild(document.createTextNode("(" + newCount + ") " + email ))
    div.newMessageCount = newCount
}
function createUserItem(email){
    if (email == me)
            return null
    var div = document.createElement('div');
    div.setAttribute('class', 'user')
    div.id = email
    div.newMessageCount = 0
    var name = document.createTextNode('' + email)
    div.appendChild(name)
    div.onclick = getChatMessages
    return div   
}
function createUserItems(list) {
    document.getElementById('chat_user_list').innerHTML = ""
    var list = JSON.parse(list)
    for (var i in list) {
        var userDiv = createUserItem(list[i])
        if(userDiv)
            chatUserList.appendChild(userDiv)
    }
}

function createGroupMessageNode(object, className) {
    var item = document.createElement('div')
    var headP = document.createElement('p')
    if (object.sender != '') {
        headP.className = 'sender'
        headP.appendChild(document.createTextNode("" + object.sender))
        item.appendChild(headP)
    }

    var p = document.createElement('p')
    item.className = className
    item.appendChild(p)
    p.appendChild(document.createTextNode(object.msg))
    return item;
}
newChat.onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
        if(!newChat.value)
            return
        var mate = newChat.value.trim().toLowerCase()
        getChatMessages(e, mate)
    }
}
button.onclick = function(e) {
    console.log(connected)
    if (!connected || chat_msg.value.trim() == "")
        return
    socket.emit('chat_message', {to: current_chat.partner, message:chat_msg.value})
    chat_msg.value = ""
}
groupButton.onclick = function(e) {
    if (groupChatMsg.value.trim() == "")
        return
    socket.emit('group_message', groupChatMsg.value)
    groupContainer.insertBefore(createGroupMessageNode({
        'msg': groupChatMsg.value,
        'sender': ''
    }, 'self'), groupContainer.firstChild)
    groupChatMsg.value = ""
}
groupChatButton.onclick = function(e) {
    toggleIcon.click();
    singleChatDiv.hidden = true;
	groupChatDiv.hidden = false;
}
function fetchUserList() {

    sendXhr('GET', '/get_user_list', null, (response)=>{
        if(response){
            //console.log(response)
            createUserItems(response)
            console.log('USER_LIST_UPDATE')
            sendXhr('GET', 'new_messages', null, (response)=>{
                //console.log("New message : " + response)
                var newMessages = JSON.parse(response)
                for(var i in newMessages){
                    var user = document.getElementById(newMessages[i].from)
                    if(!user){
                        user = createUserItem(newMessages[i].from)
                        user.style.background = "#ffaaaa"
                        chatUserList.appendChild(user)
                        updateCount(newMessages[i].from, user.newMessageCount + 1)
                        
                    }
                    else{
                        user.style.background = "#ffaaaa"
                        updateCount(newMessages[i].from, user.newMessageCount + 1)
                    }
                }
            })
        }
    })   
}

socket.on('chat_message_from_server', function(data) {
    //console.log(data)
    if(current_chat.partner==data.from && !chatArea.hidden)
        container.insertBefore(createMessageNode(data.message, 'chatmate'), container.firstChild)
    else{
        var user = document.getElementById(data.from)
        //console.log(user)
        if(user){
            user.style.background = "#ffaaaa"
            updateCount(data.from, user.newMessageCount + 1)
        }
        else{
            user = createUserItem(data.from)
            user.style.background = "#ffaaaa"
            updateCount(data.from, user.newMessageCount + 1)
            chatUserList.appendChild(user)   
        }
    }
})

socket.on('status_from_server', function(msg) {
    document.getElementById('status').innerHTML = msg;
})
socket.on('feedback_from_server', function(msg) {
    container.insertBefore(createMessageNode(msg, 'self'), container.firstChild)
})
socket.on('identity_from_server', function(email) {
    me = email;
    //console.log(me)
    fetchUserList()
    document.getElementById('username').appendChild(document.createTextNode(me))
})
socket.on('user_list_update', function() {
    fetchUserList()
})

socket.on('group_message_from_server', function(obj) {
    groupContainer.insertBefore(createGroupMessageNode(obj, 'chatmate'), groupContainer.firstChild)
})
socket.on('group_special_from_server', function(msg) {
    var item = document.createElement('div')
    var p = document.createElement('p')
    item.className = 'special'
    item.appendChild(p)
    p.appendChild(document.createTextNode(msg))
    groupContainer.insertBefore(item, groupContainer.firstChild)
})
socket.on('group_status_from_server', function(obj) {

})
socket.on("photo_update", ()=>{
    console.log("Photo update event")
    ajaxPhotoRequest()
})
ajaxPhotoRequest()