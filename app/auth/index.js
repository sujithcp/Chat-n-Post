var Users = require('../models/user')
var PublicProfile = require('../models/public_profile')

function init() {
    var config = require('../auth/config')
    var passport = require('passport')
    var GoogleStrategy = require('passport-google-oauth2')
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://" + config.HOST + ":" + config.PORT + "/auth/google/callback"
    }, function(accessToken, refreshToken, profile, done) {
        Users.findOne({
            email: profile.email
        }, (err, result) => {
            if (err) {
                console.log(err.toString())
            }
            if (result) {
                var user = result
                return done(null, user)
            } else {
                var user = new Users({
                    name: profile.displayName,
                    email: profile.email,
                })
                new PublicProfile({
                    'email': profile.email,
                    'badge': 'A',
                    'score': 0,
                    'liked_photos': []
                }).save()
                user.save()
                return done(null, user)
            }

        })

    }))
    return passport
}

module.exports = init