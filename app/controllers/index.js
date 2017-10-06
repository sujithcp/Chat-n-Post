var Users = require('../models/user')
var PhotPost = require('../models/photo_post')
var validator = require('validator')
var multer = require('multer')
var Path = require('path')
var UserList = require('../socket/user_list')
var photoList = null
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./app/uploads/")
    },
    filename: function(req, file, callback) {
        var date = new Date();
        callback(null, date.toISOString() + req.session.user_email + file.originalname.match(/\..*$/))
    }
})
var upload = this.upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000 * 1000
    }
})
this.getRoot = function(req, res) {
	if (req.session ? req.session.user_email : false) {
		res.redirect('/home')
		return;
	}
	res.render('login')
}
this.getRegister = function(req, res) {
	if (req.session ? req.session.user_email : false) {
		res.redirect('/home')
		return;
	}
	res.render('register')
}
this.getLogin = function(req, res) {
	if (req.session ? req.session.user_email : false) {
		res.redirect('/home')
		return;
	}
	res.render('login')
}
this.getHome = function(req, res) {
	// validate session here.
	if (!req.session.user_email) {
		res.redirect('/')
		return;
	}

	res.render('home')
}
this.getLogout = function(req, res) {
	req.session.user_email = null
	console.log("*** logout *** ")
	res.redirect('/')
}
this.getPhotoList = function(req, res) {
	if (!(req.session ? req.session.user_email : false)) {
		res.redirect('/');
		return;
	}
	if (!photoList) {
		PhotPost.find({}, (err, result) => {
			if (err) {
				console.log('error')
				res.json({
					status: false
				})
				return;
			}
			res.json(result)
		})
	} else {
		//console.log(photoList.length)
		res.json(photoList)
	}
}
this.getPhoto = (req, res) => {
	if (!(req.session ? req.session.user_email : false)) {
		res.redirect('/');
		return;
	}
	var path = req.query.path
	res.sendFile(Path.normalize(__dirname + "/../uploads/") + path, {
		dotfiles: 'deny'
	}, function(err) {
		if (err) {
			res.end("Error serving the file.")
			console.log("" + err.toString())
		}
	})
}
this.getUserList = (req, res) => {
	if (!(req.session ? req.session.user_email : false)) {
		res.redirect('/');
		return;
	}
	console.log(UserList.getUserList())
	res.json(UserList.getUserList())

}
this.getFavicon = (req, res) => {
	res.sendFile(Path.normalize(__dirname + "/../../favicon.png"))
}
this.getDp = (req, res) => {
	res.sendFile(Path.normalize(__dirname + "/../../favicon.png"))
}
this.postRegister = function(req, res) {
	var user = req.body
	if (!validator.isEmail(user.user_email)) {
		res.end('Invalid email!!')
		return;
	}
	var newUser = new Users({
		'name': user.user_name,
		'email': user.user_email,
		'password': user.user_password,
	})
	Users.findOne({
		'email': user.user_email
	}, function(err, result) {
		if (err) {
			console.log('Error while searching database ' + err)
			return
		}
		if (result) {
			res.end('This email already has an account!!')
		} else {
			newUser.save()
			res.redirect('/login')
		}
	});
}
this.postLogin = function(req, res) {
	if (req.session ? req.session.user_email : false) {
		res.redirect('/home')
		return;
	}
	var user = req.body
	Users.findOne({
		'email': user.user_email
	}, function(err, result) {
		if (err) {
			console.log(err)
			res.end('Internal error')
			return
		}
		if (result) {
			var status = result.validatePassword(user.user_password)
			console.log(status)
			if (status) {
				// set session here
				req.session.user_email = user.user_email
				console.log(req.session.user_email)
				res.redirect('/home')
			} else {
				res.end("" + status)
			}
		} else {
			res.end("Email does not exists")
		}
	});
}
this.postPhoto = function(req, res) {
	if (!(req.session ? req.session.user_email : false)) {
		res.redirect('/');
		return;
	}
	upload.single('photo')(req, res, (err) => {
		if (err) {
			console.log(err)
			res.end(err.toString())
			return;
		}
		var newPost = new PhotPost({
			'name': req.file.filename,
			'user_email': req.session.user_email,
			'time': new Date().toISOString(),
			'location': req.file.path
		})
		newPost.save((err, data, numAffected) => {
			if (err) {
				res.redirect('/home');
				return;
			}
			PhotPost.find({}, (err, result) => {
				if (err) {
					console.log('error')
					photoList = null
					return;
				}
				photoList = result
				global.io.emit('photo_update_broadcast')
			})
		})

		res.redirect('/home');
	});
}
this.postLike = function(req, res) {
	if (req.session ? req.session.user_email : false) {
		res.redirect('/home')
		return;
	}
	console.log(req.session.user_email + " liked " + request.params.photo)
}

module.exports = this