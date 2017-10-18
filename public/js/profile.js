sendXhr('GET', '/profile/data', null, (response) => {
	if(!response){
		console.log("No/empty response")
		return
	}
	var profile = JSON.parse(response)
	console.log(profile)
	console.log(profile.dp)
	document.getElementById('name').innerText = profile.name
	document.getElementById('dp').setAttribute('src',"/photo?email=" + profile.email)
	document.getElementById('email').innerText = profile.email
	document.getElementById('score').innerText = profile.score
	document.getElementById('badge').innerText = profile.badge
})


