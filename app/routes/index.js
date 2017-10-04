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
    .post('/register', controllers.upload.none(), controllers.postRegister)
    .post('/login', controllers.upload.none(), controllers.postLogin)
    .post('/post_photo', controllers.postPhoto);

module.exports = router;