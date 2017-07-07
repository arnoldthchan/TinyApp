// 'use strict';

//Modules
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//Creates variable which is this express server
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['moist'],

//Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Defines PORT, if PORT not found in .env, default to 8080
const PORT = process.env.PORT || 8080; // default port 8080

//Allow to view EJS files for EJS Template usage
app.set('view engine', 'ejs');

//Database object of shortened URLS, original links, and userID
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
    if (urlDatabase[obj].userID === user.id){
      filteredList[obj] = urlDatabase[obj];
    }
  }
  return filteredList;
}

// Produces a random string of 6 alphanumeric characters:
function generateString() {
  let randomStr = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i = 0; i < 6; i++) {
      randomStr += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return randomStr;
}

//Checks if user exists in users database
function checkUser(id){
  for (let user in users){
    for (let i in users[user]){
      if(users[user][i] === id){
        return users[user];
      }
    }
  }
}

//Checks if key already exists in users object
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

//Main get page, redirects based on if user is logged in
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

//Page for shortening URL links
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
  let shortURL = req.params.shortenedURL;
  if (urlDatabase[shortURL]){
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send(`<b>Error: Shortened URL does not exist</b><p>
      <a href='/urls'>Back to URLs </a>`);
  }
});

//Goes to shortURL
app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id };
  let fullURL = `localhost:8080/urls/${templateVars.shortURL}`;
  //Checks if logged in
  if (!isLoggedIn){
    res.statusCode = 404;
    res.send(`<b>Error: You are not logged in</b><p>
    <a href='/login'>Return to Login </a>`);
  //Checks if shortened URL is 6 digits and exists in urlDatabase
  } else if (!templateVars.shortURL.length === 6 || !urlDatabase[req.params.id]){
    res.statusCode = 404;
    res.send(`<b>Error: URL does not exist</b><p>
      <a href='/login'>Return to Login </a>`);
    //Checks current user is the same as the userID of the URL
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

//Registration page, redirects if already logged in
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

//Login page, will redirect to URLs if already logged in
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

/*

          POST ENDPOINTS

*/

//Uses POST request to submit form data
app.post('/urls', (req, res) => {
  const result = checkWWW(req.body.longURL);
  const genURL = generateString();
  urlDatabase[genURL] = {
    longURL: result,
    userID: req.session.user_id.id
  };
  res.redirect(`urls/${genURL}`);
});

//Deletes URL entry based on shortened URL query
app.post('/urls/:shortenedURL/delete', (req, res) =>{
  //Error if not logged in
  if(!isLoggedIn){
    res.send(`<b>Error: Not Logged in</b><p>
      <a href='/login'>Return to Login </a>`)
  } else{
    let cookie = req.session.user_id.id;
    let link = req.params.shortenedURL;
    let allowedUser = urlDatabase[req.params.shortenedURL].userID;
    //Checks if user is the one that created the URL
    if (cookie === allowedUser){
      delete urlDatabase[link];
      res.redirect('/urls');
      } else {
        res.redirect('/urls');
      }
  }
});

//Logs in if correct credentials
app.post('/login', (req, res) =>{
  const loggedName = req.body.email;
  const loggedPass = req.body.password;
  var hashed_password = '';
  //Errors if user or password entries not filled
  if(loggedName && checkUser(loggedName) && loggedPass.length > 0){
    hashed_password = checkUser(loggedName).password;
  } else{
    res.send(`<b>Error: Username and Password not entered correctly</b><p>
    <a href='/login'>Return to Login </a>`);
  }
  //Logs in if password matches hashed password in users object
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

//Logout post, deletes cookie and redirects to URL
app.post('/logout', (req, res) =>{
  req.session = null;
  res.redirect('/urls');
});

//Editing page for specific shortened URL in query
app.post('/urls/:id/edit', (req, res) =>{
  const cookie = req.session.user_id.id;
  const allowedUser = urlDatabase[req.params.id].userID;
  if (cookie === allowedUser){
    const newURL = req.body.newLongURL;
    urlDatabase[req.params.id].longURL = newURL;
    res.redirect(`/urls`);
  } else{
    res.redirect('/urls');
  }
});

//Redirects to url based on shortened URL query
app.post('/urls/:id', (req, res) =>{
  res.redirect(`/urls/${req.params.id}`);
});

//Registers new user to users object
app.post('/register', (req, res) =>{
  let newEmail = req.body.email;
  let password = req.body.password;
  //Checks if email and password are not empty
  if(!password || !newEmail){
    res.statusCode = 400;
    res.send(`<b>Error: Username or Password missing</b><p>
    <a href='/register'>Return to Register </a>`);
    //Passes if email is not in use
  } else if(!checkNewVal('email', newEmail)){
    res.statusCode = 400;
    res.send(`<b>Error: Username already exists</b><p>
    <a href='/register'>Return to Register </a>`);
  } else {
    //Adds to users object based on random string and credentials entered
    const randomStr = generateString();
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
