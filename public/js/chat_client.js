var socket = io();
current_chat = {
	partner : '',
	ready : false
}
var connected = false
var container = document.getElementById('chat')
var chat_msg = document.getElementById('msg')
var button = document.getElementById('send_button')

/*
var container = document.getElementById('chat')
var connected = false
var button = document.getElementById('send_button')
var msg_field = document.getElementById('message_field')
var search = document.getElementById('search_mate')
var mate = document.getElementById('pair')
var chat_msg = document.getElementById('msg')
current_chat = {
	partner : '',
	ready : false
}
function createMessageNode(msg, className){
	var item = document.createElement('div')
	var p = document.createElement('p')
	item.className = className
	item.appendChild(p)
	p.appendChild(document.createTextNode(msg))
	return item;
}
search.onclick = function(e){
	if(!mate.value)
		return
	socket.emit('connection_request',mate.value)
	document.getElementById('status').innerHTML = "Requesting connection to " + mate.value;
}
button.onclick = function (e){
	console.log(connected)
	if(!connected || chat_msg.value.trim()=="")
		return
	socket.emit('chat_message', chat_msg.value)
	container.insertBefore(createMessageNode(chat_msg.value, 'self'), container.firstChild)
	chat_msg.value = ""
}
socket.on('connection_request', function(user){
	if(confirm('Connect to ' + user)){
		current_chat.partner = user;
		connected = true
		socket.emit('ready', user)
	}
	else{
		socket.emit('rejected', user)
	}
})
socket.on('chat_message', function(msg){
	console.log(msg)
	container.insertBefore(createMessageNode(msg, 'chatmate'), container.firstChild)
})

socket.on('status', function(msg){
	//console.log(msg)
	document.getElementById('status').innerHTML = msg;
})
socket.on('ready', function(user){
	document.getElementById('chat').innerHTML = "";
	connected = true
	current_chat.partner = user
	document.getElementById('status').innerHTML = "Connected.... to " + user;
})
socket.on('disconnect', function(){
	document.getElementById('status').innerHTML = "Disconnected..";
	connected = false
})
socket.on('rejected', function(data){
	document.getElementById('status').innerHTML = "Request rejected by " + data;
})

*/
/// ***************** new
var chatArea = document.getElementById('chat_area')
var chatUserList = document.getElementById('chat_user_list')
var chatDiv = document.getElementById('chat_div')
var toggle = document.getElementById('chat_header')
var toggleIcon = document.getElementById('toggle_icon')
toggle.onclick = function(e){
	if(chatArea.hidden){
		chatArea.hidden = false
		chatUserList.hidden = true
		toggleIcon.setAttribute('src',"/assets/toggle-right.png")
	}
	else{
		chatArea.hidden = true
		chatUserList.hidden = false
		toggleIcon.setAttribute('src',"/assets/toggle-left.png")
	}
}
function createMessageNode(msg, className){
	var item = document.createElement('div')
	var p = document.createElement('p')
	item.className = className
	item.appendChild(p)
	p.appendChild(document.createTextNode(msg))
	return item;
}
function sendRequest(e){
	if(chatArea.hidden){
		toggle.click()
	}
	var div = e.target
	console.log(e.target)
	socket.emit('connection_request',div.innerHTML)
	document.getElementById('status').innerHTML = "Requesting connection to " + div.innerHTML;
}
function createUserItems(list){
	document.getElementById('chat_user_list').innerHTML = ""
	var list = JSON.parse(list)
	for(var i in list){
		var div = document.createElement('div');
		div.setAttribute('class', 'user')
		var name = document.createTextNode('' + list[i])
		div.appendChild(name)
		div.onclick = sendRequest
		chatUserList.appendChild(div)
	}
}
button.onclick = function (e){
	console.log(connected)
	if(!connected || chat_msg.value.trim()=="")
		return
	socket.emit('chat_message', chat_msg.value)
	chat_msg.value = ""
}
var xhr = new XMLHttpRequest();
function fetchUserList(){
	xhr.open('GET', '/get_user_list', true);
	xhr.withCredentials = true
	xhr.send(null)
	xhr.onreadystatechange = function (e){
		if(xhr.readyState==4){
			if(xhr.status==200){
				console.log(xhr.response)
				createUserItems(xhr.response)
			}
		}
	};
}
setInterval(()=>{
	fetchUserList()
}, 6000)

socket.on('connection_request', function(user){
	if(confirm('Connect to ' + user)){
		current_chat.partner = user;
		connected = true
		socket.emit('ready', user)
	}
	else{
		socket.emit('rejected', user)
	}
})
socket.on('ready', function(user){
	document.getElementById('chat').innerHTML = "";
	connected = true
	current_chat.partner = user;
	document.getElementById('status').innerHTML = "Connected.... to " + user;
	if(chatArea.hidden){
		toggle.click()
	}
})
socket.on('chat_message', function(msg){
	console.log(msg)
	container.insertBefore(createMessageNode(msg, 'chatmate'), container.firstChild)
})

socket.on('status', function(msg){
	//console.log(msg)
	document.getElementById('status').innerHTML = msg;
})
socket.on('feedback', function(msg){
	container.insertBefore(createMessageNode(msg, 'self'), container.firstChild)
})