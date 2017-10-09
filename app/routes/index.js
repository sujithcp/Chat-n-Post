var express = require('express')
var router = express.Router()
var controllers = require('../controllers/')
router.get('/', controllers.getRoot)
    .get('/register', controllers.getRegister)
    .get('/login', controllers.getLogin)
    .get('/home', controllers.getHome)
    .get('/logout', controllers.getLogout)
    .get('/photo_list', controllers.getPhotoList)
    .get('/photo', controllers.getPhoto)
    .get('/get_user_list', controllers.getUserList)
    .get('/favicon.ico', controllers.getFavicon)
    .get('/dp', controllers.getDp)
    .get('/profile', controllers.getProfile)
    .get('/profile/:what', controllers.getProfile)
    .get('/auth/google', controllers.passport.authenticate('google', {scope:['https://www.googleapis.com/auth/plus.login', 'profile', 'email']}))
    .get('/auth/google/callback', controllers.passport.authenticate('google', {failureRedirect:'/', scope:['https://www.googleapis.com/auth/plus.login', 'profile', 'email']}), (req, res)=>{
        console.log('****************************Authenticated')
        var user = req.session.passport.user
        req.session.user_email = user.email
        res.redirect('/home')
    })
    .post('/register', controllers.upload.none(), controllers.postRegister)
    .post('/login', controllers.upload.none(), controllers.postLogin)
    .post('/post_photo', controllers.postPhoto)
    .post('/like/:photo', controllers.postLike)

module.exports = router;