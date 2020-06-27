const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const bCrypt = require('bcryptjs');
const passport = require('passport');
// const flash = require('connect-flash');

//bringing user models
let User = require('../models/user');

// Register form
router.get('/register', function(req, res, next){
    res.render('register');
});


//Register process
router.post('/register', [
    check('name').notEmpty().withMessage('Name required'),
    check('username').notEmpty().withMessage('Username required'),
    check('email').isEmail(),
    check('password').notEmpty().withMessage('Password required'),
    check('password2').exists().custom((value, {req}) => value === req.body.password),
], function(req,res, next){
    let newUser = new User();
    newUser.name = req.body.name;
    newUser.username = req.body.username;
    newUser.email = req.body.email;
    newUser.password = req.body.password;
    const password2 = req.body.password2;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors);
        res.render('register', {
            errors: errors.mapped(), 
        });
    }else{
        bCrypt.genSalt(10, function(err, salt){
            bCrypt.hash(newUser.password, salt, function(err, hash){
                if(err) console.log(err);
                newUser.password = hash;
                newUser.save(function(err){
                    if(err) {
                        console.log(err);
                        return;
                    }else{
                        req.flash('success', 'You are now registered');
                        res.redirect('/users/login');
                    }
                })
            });
        })
    }
});

//Login form
router.get('/login', function(req,res,next){
    res.render('login');
});


//Login process
router.post('/login', function(req,res, next){
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true,
        successMessage: 'Successfully logged in'
    })(req,res,next);
});


//Logout
router.get('/logout', function (req,res,next) { 
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;