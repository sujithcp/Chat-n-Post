var photoList = []
var xhr = new XMLHttpRequest();
var photoContainer = document.getElementById('posts')
function expandPhoto(e){
	var div = e.target.getParantElement().getParantElement().getElementsByClassName('photo')[0]
	console.log("hello")
}
function createImageCard(image_data){
	//console.log(image_data)
	var div = document.createElement('div')
	div.setAttribute('class', 'material_card photo_div')
	var postedBy = document.createElement('div')
	postedBy.className = "author"
	var expandIcon = document.createElement("img")
	expandIcon.src = "/assets/expand.png"
	expandIcon.onclick = function(e){
		var photo = e.target.parentNode.parentNode.getElementsByClassName('photo')
		if(photo.length>0){
			photo = photo[0]
			console.log(photo.state)
			if(photo.state == "normal"){
				photo.style.maxHeight = "none"
				photo.state = "expanded"
				expandIcon.style.padding = "2px"
			}
			else{
				photo.style.maxHeight = "400px"
				photo.state = "normal"
				expandIcon.style.padding = "0"
			}
			
		}
	}
	div.appendChild(postedBy)
	if(image_data.name){
		postedBy.appendChild(expandIcon)
		var img = document.createElement('img')
		img.state = "normal"
		img.setAttribute('alt', "Image missing/loading")
		img.setAttribute('class', 'photo')
		img.setAttribute('src',"/photo?path=" + image_data.name)
		img.onclick = function(){
			sendXhr('POST', '/like/' + image_data.name, null, (response)=>{
				console.log(response)
			})
		}
		div.appendChild(img)
	}
	postedBy.appendChild(document.createTextNode(image_data.user_email))
	if(image_data.caption){
		var caption = document.createElement('div')
		caption.appendChild(document.createTextNode(image_data.caption))
		div.appendChild(caption)
	}		
	photoContainer.insertBefore(div, photoContainer.firstChild)
	
}
function createImageCards(response){
	var list = JSON.parse(response)
	document.getElementById('posts').innerHTML = ""
	for(var i in list){
		createImageCard(list[i])
	}
}

var ajaxPhotoRequest = function(){
	sendXhr('GET','/photo_list',null,(response)=>{
		//	console.log(response)
		if(response){
			createImageCards(response)
		}
	})
	
}
setInterval(ajaxPhotoRequest, 30000)
