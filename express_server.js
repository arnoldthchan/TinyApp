'use strict';
//REQUIRED MODULES
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//Creates variable which is this express server
const app = express();
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
const PORT = process.env.PORT || 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ['moist'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Allow to view EJS files for EJS Template usage
app.set('view engine', 'ejs');

//Database object of shortened URLS and original URLs
const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'wqeqwe'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user3RandomID'
  },
  'aaaaaa': {
    longURL: 'http://www.youtube.com',
    userID: 'user4RandomID'
  },
  'TestTe': {
    longURL: 'http://spotify.com',
    userID: 'user5RandomID'
  }
};

//Object containing User object with ID, Email, pass
//the ID is a random 6digit alphanumeric string using the generateString function
const users = {};

//Adds user to users object when given randomID, email, and password parameters
function addUser(randID, email, password){
  users[randID] = {
    id: randID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  }
}

//Checks to see if user is logged in by seeing if their cookie value is empty
function isLoggedIn(req){
  if(req.session.length === 0){
    return false;
  } else {
    return true;
  }
}

//Checks URLs entered if they begin with 'http://'
//Will add to front of URL if not
function checkWWW(url){
  if (url.includes('http://') === 0){
    return 'http://'+ url;
  } else {
    return url;
  }
}

//Filters all of the urlDatabase to see which userIDs for the urls match the userid provided
//Then returns an object of URLs only accessible to that user
function urlsForUsers(user){
  let filteredList = {};
  for (let obj in urlDatabase){
    // console.log(urlDatabase[obj].userID, '===', user.id);
    if (urlDatabase[obj].userID === user.id){
      filteredList[obj] = urlDatabase[obj];
    }
  }
  return filteredList;
}

// Produces a random string of 6 alphanumeric characters:
function generateString() {
  let randomStr = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i = 0; i < 6; i++) {
      randomStr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomStr;
}

function checkUser(id){
  for (let user in users){
    for (let i in users[user]){
      if(users[user][i] === id){
        return users[user];
      }
    }
  }
}

//Checks key to reject if key already exists in users object
function checkNewVal(key, value){
  let correctUser = '';
  for (let user in users){
    let currVal = users[user][key]
    if (currVal === value){
      return false;
    } else {
      correctUser = user;
    }
  }
  return users[correctUser];
}


//Main page, does nothing
app.get('/', function(req, res) {
  if (isLoggedIn(req)){
    res.statusCode = 200;
    res.redirect('/urls');
  } else{
    res.redirect('/login');
  }
});

//Renders the ejs page with the for loop of shortened URLS
app.get('/urls', (req, res) => {
  // console.log(req);
  if(isLoggedIn(req)) {
    let templateVars = {
    urls: urlsForUsers(req.session.user_id),
    user_id: req.session.user_id
    };
    res.render('urls_index', templateVars);
  } else{
      res.send(`<b>Error: Not Logged in</b><p>
      <a href='/login'>Return to Login </a>`);
  }
});

//WHERE THE FORM IS
app.get('/urls/new', (req, res) => {
  if(isLoggedIn(req)) {
    let templateVars = {
      user_id: req.session.user_id
    }
    res.render('urls_new', templateVars);
  } else{
      res.redirect('/login');
  }
});

//Redirects to actual webpage based on shortenedURL
app.get('/u/:shortenedURL', (req, res) => {
  // let longURL = urlDatabase[req.params];
  let shortURL = req.params.shortenedURL;
  if (urlDatabase[shortURL]){
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send(`<b>Error: Shortened URL does not exist</b><p>
      <a href='/urls'>Back to URLs </a>`);
  }
});

//Goes to :ID, applies to anything entered after the /urls/
app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id };
  let fullURL = `localhost:8080/urls/${templateVars.shortURL}`;
  //CHECKS TO SEE IF LENGTH OF URL IS EXACTLY 6 DIGITS LONG
  if (!isLoggedIn){
    res.statusCode = 404;
    res.send(`<b>Error: You are not logged in</b><p>
    <a href='/login'>Return to Login </a>`);
  } else if (!templateVars.shortURL.length === 6 || !urlDatabase[req.params.id]){
    res.statusCode = 404;
    res.send(`<b>Error: URL does not exist</b><p>
      <a href='/login'>Return to Login </a>`);
  } else if(urlDatabase[req.params.id].userID !== req.session.user_id.id){
    res.statusCode = 404;
    res.send(`<b>Error: You do not own this URL</b><p>
    <a href='/login'>Return to Login </a>`);
  } else{
    res.render('urls_show', {
      templateVars:templateVars,
      longURL: urlDatabase[req.params.id].longURL,
      user_id: req.session.user_id
    });
  }
});

//REGISTRATION PAGE
app.get('/register', (req, res) =>{
  if (isLoggedIn(req)){
    res.redirect('/urls');
  } else{
    let templateVars = { shortURL: req.params.id };
    res.render('register',{
      templateVars:templateVars,
      user_id: req.session.user_id
    });
  }
});

app.get('/login', (req, res) => {
  if(isLoggedIn(req)){
    res.redirect('/urls');
  } else{
  let templateVars = { shortURL: req.params.id };
  res.render('login',{
    templateVars:templateVars,
    user_id: req.session.user_id
  });
  }

});

//POSTS
//POSTS
//POSTS

//Uses POST request to submit form data
app.post('/urls', (req, res) => {
  const result = checkWWW(req.body.longURL);
  const genURL = generateString();
  urlDatabase[genURL] = {
    longURL: result,
    userID: req.session.user_id.id
  };
  // console.log(urlDatabase);
  res.redirect(`urls/${genURL}`);
});

//Deletes URL entry basedon shortened URL entered
app.post('/urls/:shortenedURL/delete', (req, res) =>{
  if(!isLoggedIn){
    res.send(`<b>Error: Not Logged in</b><p>
      <a href='/login'>Return to Login </a>`)
  } else{
    let cookie = req.session.user_id.id;
    let link = req.params.shortenedURL;
    let allowedUser = urlDatabase[req.params.shortenedURL].userID;
    if (cookie === allowedUser){
      // console.log(`${link} at ${urlDatabase[link]}... Deleting`);
      delete urlDatabase[link];
      res.redirect('/urls');
      } else {
        console.log('no deleteo, no matcho');
        res.redirect('/urls');
      }
  }
});

//LOGIN ENDPOINT
app.post('/login', (req, res) =>{
  const loggedName = req.body.email;
  const loggedPass = req.body.password;
  var hashed_password = '';
  if(loggedName && checkUser(loggedName) && loggedPass.length > 0){
    hashed_password = checkUser(loggedName).password;
  } else{
    res.send(`<b>Error: Username and Password not entered correctly</b><p>
    <a href='/login'>Return to Login </a>`);
  }
  //Password matches, logging in
  if(bcrypt.compareSync(loggedPass, hashed_password)){
    const user_id = checkUser(loggedName);
    req.session.user_id = user_id;
    res.redirect('/urls');
  } else {
    res.statusCode = 403;
    res.send(`<b>Error: Incorrect Username or Password</b><p>
    <a href='/login'>Return to Login </a>`);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) =>{
  req.session = null;
  res.redirect('/urls');
});

// POST /urls/:id to allow editing of longURL
app.post('/urls/:id/edit', (req, res) =>{
  const cookie = req.session.user_id.id;
  const allowedUser = urlDatabase[req.params.id].userID;
  if (cookie === allowedUser){
    const newURL = req.body.newLongURL;
    urlDatabase[req.params.id].longURL = newURL;
    res.redirect(`/urls`);
  } else{
    console.log('no permission');
    res.redirect('/urls');
  }
});

//redirects to url based on ID link
app.post('/urls/:id', (req, res) =>{
  res.redirect(`/urls/${req.params.id}`);
});

//POST endpoint for
app.post('/register', (req, res) =>{
  let newEmail = req.body.email;
  let password = req.body.password;
  //will pass if there is a UNIQUE email and a password
  if(!password || !newEmail){
    res.statusCode = 400;
    res.send(`<b>Error: Username or Password missing</b><p>
    <a href='/register'>Return to Register </a>`);
  } else if(!checkNewVal('email', newEmail)){
    res.statusCode = 400;
    res.send(`<b>Error: Username already exists</b><p>
    <a href='/register'>Return to Register </a>`);
  } else {
    const randomStr = generateString();
    //ATTEMPTS TO ADD NEW OBJECT
    addUser(randomStr, newEmail, password);
    req.session.user_id = users[randomStr];
    console.log(users);
    res.redirect(`/urls`);
  }

});

//
app.listen(PORT, function() {
  console.log(`Express app listening on port ${PORT}!`);
});

//Creates users into users object database
addUser('aaaaaa', 'hello@hello.com', 'hello');
addUser('wqeqwe', 'asd@asd.com', 'asd');
addUser('user2RandomID', 'user2@example.com', 'dishwasher-funk');
addUser('user2RandomID', 'pairsbot@pair.com', 'pair');
