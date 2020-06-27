const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
// const {check, validationResult} = require('express-validator/check');
// const {matchedData, sanitize} = require('express-validator/check');
const passport = require('passport');
const config = require('./config/database');


mongoose.connect(config.database);
let db = mongoose.connection;


//check connection
db.once('open',function(){
    console.log('Connected to Database');
})

//check db error
db.on('error',function(error){
    console.log(error);
})

//init app
const app = express();

//bringing models
let Article = require('./models/article');


//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
//parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));


//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
   
  }));



//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//passport config
require('./config/passport')(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', function (req, res, next) { 
    res.locals.user = req.user || null;
    next();
})


//home route
app.get('/', function(req, res, next){
    Article.find({}, function(err,articles){
        if(err) console.log(err);
        res.render('index', {
            title: 'Articles',
            articles: articles,
        });
    })
    
});

// Route files
let articles = require('./routes/articles');
let users = require('./routes/user');
app.use('/articles', articles);
app.use('/users', users);


//start server
app.listen(3000, ()=> console.log('Server running on http://localhost:3000'));