const express = require('express')
const homeRouter = express.Router()
const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy  
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const session = require("express-session")
const bodyParser = require('body-parser')
require("dotenv").config();
const mongo = process.env.mongo;
const Schema = mongoose.Schema
const saltRounds = 10;



homeRouter.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(mongo,{useNewUrlParser: true})
const userSchema = new Schema({
  username: {type:String, unique:true},
  password: String, 
  name: String,
  wpm: Number,
  cpm: Number,
  mistakes: Number,
  
})
const User = mongoose.model("User", userSchema);

homeRouter.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 5 * 60 * 60 * 24 * 1000},
 
}))

homeRouter.use(passport.initialize());
homeRouter.use(passport.session()) ;
 


passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

  passport.serializeUser((user,done)=>{
    if(user){
      return done(null,user.id)
    }
    return done(null,false)
  });
  passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
      if(err) return done(null,false);
      return done(null, user);
    })
  });


function checkAuth(req, res, next) {
  if (req.user) {
      next();
  } else {
      res.redirect('/login');
  }
}
function loggedin(req, res, next) {
  if (req.user) {
    res.redirect('/index');
      
  } else {
    next();
  }
}
homeRouter.get('/', checkAuth ,(req, res) => {
  res.render('login')
})
homeRouter.get('/index',checkAuth,  (req, res) => {
let name = req.user.name
let wpm = req.user.wpm
let cpm = req.user.cpm
let mistakes = req.user.mistakes

res.render('index',{name,wpm,cpm,mistakes})
})
homeRouter.get('/login', loggedin , (req, res) => {
 res.render('login')
})

homeRouter.get('/register' , loggedin,(req, res) => {
res.render('register')
})
homeRouter.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

homeRouter.post('/register',(req,res,done)=>{
  
        User.findOne({username:req.body.username},(err,user)=>{
          if(err) done(null,false)
       
          else if(user){res.redirect('/login')}
          else{
            
            let hash = bcrypt.hashSync(req.body.password, saltRounds);
              
            User.create({username: req.body.username, password: hash,  name: req.body.name, wpm : 0, cpm: 0, mistakes:0 }, (err,user)=>{
              if(err) done(null, false)
              done(null, user)               
              res.redirect('/index')
            })
          }
        })

})

homeRouter.post('/login', 
passport.authenticate('local', { failureRedirect: '/login' }), 
  function(req, res) {
   
    res.redirect('/index');
  })

//   homeRouter.post('/profile',(req,res)=>{
//     console.log("hello")
//     User.findByIdAndUpdate(req.session.passport.user, 
//       {
//          $set : {
//               wpm: req.body.avgwpm,
//               cpm: req.body.avgcpm,
//               mistakes: req.body.avgmistakes,
//           }

          
//       }, 
//       (err, user) => {
//         if(err) return done(err)
//         res.redirect('/index');
//          }
//       );
     
    
//  } );

homeRouter.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

module.exports = homeRouter
