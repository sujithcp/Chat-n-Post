var photoList = []
var xhr = new XMLHttpRequest();
var photoContainer = document.getElementById('posts')
function createImageCard(image_data){
	//console.log(image_data)
	var div = document.createElement('div')
	div.setAttribute('class', 'material_card photo_div')
	var postedBy = document.createElement('div')
	postedBy.innerHTML = image_data.user_email
	div.appendChild(postedBy)
	if(image_data.name){
		var img = document.createElement('img')
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
	if(image_data.caption){
		var caption = document.createElement('div')
		caption.innerHTML = image_data.caption
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
	console.log("refreshing photo urls")
	sendXhr('GET','/photo_list',null,(response)=>{
		//	console.log(response)
		if(response){
			createImageCards(response)
		}
	})
	
}
setInterval(ajaxPhotoRequest, 5000)
