sendXhr('GET', '/profile/data', null, (response) => {
	if(!response){
		console.log("No/empty response")
		return
	}
	var profile = JSON.parse(response)
	console.log(profile)
	console.log(profile.dp)
	document.getElementById('name').value = profile.name
	document.getElementById('dp').setAttribute('src',profile.dp)
	document.getElementById('email').innerText = profile.email
	document.getElementById('score').innerText = profile.score
	document.getElementById('badge').innerText = profile.badge
	document.getElementById('bio').value = profile.bio
})


