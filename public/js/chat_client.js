var socket = io();
current_chat = {
	partner : '',
	ready : false
}
var connected = false
var container = document.getElementById('chat')
var chat_msg = document.getElementById('msg')
var button = document.getElementById('send_button')
var me = ""
var chatArea = document.getElementById('chat_area')
var chatUserList = document.getElementById('chat_user_list')
var chatDiv = document.getElementById('chat_div')
var toggle = document.getElementById('chat_header')
var toggleIcon = document.getElementById('toggle_icon')
toggleIcon.onclick = function(e){
	if(chatArea.hidden){
		chatArea.hidden = false
		chatUserList.hidden = true
		toggleIcon.setAttribute('src',"/assets/toggle-right.png")
		fetchUserList()	
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
		toggleIcon.click()
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
		if(list[i]==me)
			continue;
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
				console.log('USER_LIST_UPDATE')
			}
			else{
				console.log("USER_LIST_UPDATE : ERROR")
			}
		}
	};
}
/*
setInterval(()=>{
	fetchUserList()
}, 6000)
*/
socket.on('connection_request_from_server', function(user){
	if(confirm('Connect to ' + user)){
		current_chat.partner = user;
		connected = true
		socket.emit('ready', user)
	}
	else{
		socket.emit('rejected', user)
	}
})
socket.on('ready_from_server', function(user){
	document.getElementById('chat').innerHTML = "";
	connected = true
	current_chat.partner = user;
	document.getElementById('status').innerHTML = "Connected.... to " + user;
	if(chatArea.hidden){
		toggleIcon.click()
	}
})
socket.on('chat_message_from_server', function(msg){
	console.log(msg)
	container.insertBefore(createMessageNode(msg, 'chatmate'), container.firstChild)
})

socket.on('status_from_server', function(msg){
	//console.log(msg)
	document.getElementById('status').innerHTML = msg;
})
socket.on('feedback_from_server', function(msg){
	container.insertBefore(createMessageNode(msg, 'self'), container.firstChild)
})
socket.on('identity_from_server', function(email){
	me = email;
	console.log(me)
	fetchUserList()
})
socket.on('user_list_update', function(){
	fetchUserList()	
})
socket.on('rejected_from_server', function(){
	document.getElementById('status').innerHTML = "Connection rejected";
})