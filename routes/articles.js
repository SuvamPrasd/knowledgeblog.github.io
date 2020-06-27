const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');

//bringing models
let Article = require('../models/article');
let User = require('../models/user');




//add route
router.get('/add', ensureAuthenticated, function(req,res,err){
    res.render('add_article', {
        title: 'Add articles'
    });
});


//add submit post route and add article
router.post('/add', [
    check('title').isLength({min: 1}).trim().withMessage('Title required'),
    // check('author').isLength({min: 1}).trim().withMessage('Author required'),
    check('body').isLength({min: 1}).trim().withMessage('Body required'),
    check('banner').notEmpty(),
], function(req,res,next){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.img = req.body.banner;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors);
        res.render('add_article', {
            article: article,
            errors: errors.mapped()
        });
    }
    else{
        article.save(function(err){
            if(err) console.log(err);
            req.flash('success', 'Article Added');
            res.redirect('/');
        });
    }
    
});


//load edit form
router.get('/edit/:id', ensureAuthenticated,  function(req,res,next){
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            req.flash('danger', 'Not authorized');
            res.redirect('/');
        }
        if(err) console.log(err);
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});



//edit the article
router.post('/edit/:id', [
    check('banner').isURL().withMessage('Invalid Image URL')
], function(req,res,next){
    let article = {};
    article.title = req.body.title;
    article.body = req.body.body;
    let imgUrl = req.body.banner;
    if(imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png')){
                article.img = imgUrl;
    }

    let query = {_id: mongoose.Types.ObjectId(req.params.id)};
    
    Article.updateOne(query, article , function(err){
        if(err) console.log(err);
        req.flash('success', 'Article Updated');
        res.redirect('/');
    });
    
    
});


// //check whether the url is a img url or not
// function checkUrl(req, res, next){
//     let imgUrl = req.body.banner;
//     if(imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png')){
//         return next();
//     }else{
//         req.flash('danger', 'wrong file type');
//     }
// }


//delete article
router.delete('/:id', function(req,res,next){
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id: req.params.id};

    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){   
            res.status(500).send();
        }else{
            Article.remove(query, function(err){
                if(err) console.log(err);
                res.send('Success');
            });
        }
    });

   
});

//get single article
router.get('/:id', function(req,res,next){
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(err, user){
            if(err) console.log(err);
            res.render('article', {
                article: article,
                author: user.name
            });
        });
       
    });
});

//Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}


module.exports = router;