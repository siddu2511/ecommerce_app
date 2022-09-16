var express = require('express');
var router = express.Router();
var Page = require('../models/page');
var passport = require('passport');
var bcrypt = require('bcryptjs');

var User = require('../models/user');

router.get('/register', function(req, res) {
    res.render('register', {
        title: 'Register'
    });
});


router.post('/register', function(req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();
    if(errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    }else {
        User.findOne({unername: username}, function (err, user){
            if(err) console.log(err);
            if(user) {
                req.flash('danger','Username exists, choose another')
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(user.password,salt, function(err,hash){
                        if(err) console.log(err);
                        user.password = hash;
                        user.save(function(err){
                            if(err) {
                                console.log(err);
                            } else{
                                req.flash('success', 'You are now registered, Please login');
                                res.redirect('/users/register')
                            }
                        })
                    })
                })

            }
        })
    }
    

});

router.get('/login', function(req,res){
    if(res.locals.user) res.redirect('/');
    res.render('register',{
        title: 'log in'
    })
})

router.post('/login', function(req,res,next){
    
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);

})

router.get('/logout', function(req,res){
    req.logOut();
    req.flash('success','Logged out ');
    res.redirect('/users/login')
    

})

module.exports = router;
