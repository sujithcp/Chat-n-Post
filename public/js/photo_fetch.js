var photoList = []
var xhr = new XMLHttpRequest();
var photoContainer = document.getElementById('posts')
function createImageCard(image_data){
	var div = document.createElement('div')
	div.setAttribute('class', 'material_card photo_div')
	var img = document.createElement('img')
	img.setAttribute('alt', "Image missing/loading")
	img.setAttribute('class', 'photo')
	img.setAttribute('src',"/photo?path=" + image_data.name)
	div.appendChild(img)
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
	xhr.open('GET','/photo_list',true);
	xhr.withCredentials = true
	xhr.send(null)
	xhr.onreadystatechange = function (e){
		if(xhr.readyState==4){
			if(xhr.status==200){
				createImageCards(xhr.response)
			}
		}
	};
}
ajaxPhotoRequest()
setInterval(ajaxPhotoRequest, 10000)
