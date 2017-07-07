//REQUIRED MODULES
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//Creates variable which is this express server
const app = express();
app.use(cookieParser());
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
    userID: 'user2RandomID'
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

//Object containing Users with ID, Email, pass
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
 "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "pairsbot-pair"
  },
 "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: "johnbot-feauture"
  },
 "user5RandomID": {
    id: "user5RandomID",
    email: "hello@hello.com",
    password: "hello"
  }
}

function checkWWW(url){
  // console.log('URL:',url);
  if (!url.includes('http://')){
    return 'http://'+ url;
  } else {
    return url;
  }
}
//
function urlsForUsers(id){
  let filteredList = {};
  for (obj in urlDatabase){
    // console.log(urlDatabase[obj].userID, '===', id);
    if (urlDatabase[obj].userID === id){
      // console.log('yes');
      filteredList[obj] = urlDatabase[obj];
    }
  }
  return filteredList;
}
// produces a string of 6 random alphanumeric characters:
function generateRandomString() {
  let randomStr = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i = 0; i < 6; i++) {
      randomStr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomStr;
}

function checkUser(id){
  for (user in users){
    for (i in users[user]){
      if(users[user][i] === id){
        return users[user];
      }
    }
  }
}

//Checks key to reject if key already exists in users object
function checkNewVal(key, value){
  for (user in users){
    let currVal = users[user][key]
    if (currVal === value){
      return false;
    }
  }
  return users[user];
}

app.listen(PORT, function() {
  console.log(`Express app listening on port ${PORT}!`);
});

//Main page, does nothing
app.get('/', function(req, res) {
  res.statusCode = 200;
  // res.send('Hello!');
  res.redirect('/urls');
});

//Renders the ejs page with the for loop of shortened URLS
app.get('/urls', (req, res) => {
  let checkID = req.cookies.user_id;
  // console.log(req.cookies);
  if(checkID) {
    let templateVars = {
    urls: urlsForUsers(checkID.id),
    user_id: checkID
    };
    res.render('urls_index', templateVars);
  } else{
    res.redirect('/login');
  }
});

//WHERE THE FORM IS
app.get('/urls/new', (req, res) => {
  let templateVars = {
      user_id: req.cookies.user_id,
      }
  if (req.cookies.user_id){
    res.render('urls_new', templateVars)
  } else{
    res.redirect('/login');
  }
});

//Redirects to actual webpage based on shortenedURL
app.get('/u/:shortenedURL', (req, res) => {
  // let longURL = urlDatabase[req.params];
  let shortURL = req.params.shortenedURL;
  fullURL = urlDatabase[shortURL].longURL
  if (fullURL){
    res.redirect(fullURL);
  } else {
    res.statusCode = 404;
    res.send(`<b><marquee>URL DOES NOT EXIST</marquee></b><p>
      <a href='/urls/new'>Back to Link Shortener </a>`);
  }
});

//Goes to :ID, applies to anything entered after the /urls/
app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id };
  let fullURL = `localhost:8080/urls/${templateVars.shortURL}`;
  //CHECKS TO SEE IF LENGTH OF URL IS EXACTLY 6 DIGITS LONG
  if (templateVars.shortURL.length === 6){
    res.render('urls_show', {
      templateVars:templateVars,
      user_id: req.cookies.user_id
      });
  } else { //REDIRECTS BACK TO MAIN PAGE OTHERWISE
    res.statusCode = 404;
    res.redirect('/urls');
  }
});

//REGISTRATION PAGE
app.get('/register', (req, res) =>{
  let templateVars = { shortURL: req.params.id };
  res.render('register',{
    templateVars:templateVars,
    user_id: req.cookies.user_id
  });
});

app.get('/login', (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render('login',{
    templateVars:templateVars,
    user_id: req.cookies.user_id
  });
});

//POSTS
//POSTS
//POSTS

//Uses POST request to submit form data
app.post('/urls', (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  result = checkWWW(req.body.longURL);
  console.log('making');
  genURL = generateRandomString();
  urlDatabase[genURL] = {
    longURL: result,
    userID: req.cookies.user_id.id
  };
  // console.log(urlDatabase);
  res.redirect(`urls/${genURL}`);
});

//Deletes URL entry basedon shortened URL entered
app.post('/urls/:shortenedURL/delete', (req, res) =>{
  let cookie = req.cookies.user_id.id;
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
});

//LOGIN ENDPOINT AFTER SUBMITTING FROM THE HEADER
app.post('/login', (req, res) =>{
  const loggedName = req.body.email;
  const loggedPass = req.body.password;
  var hashed_password = '';
  if(checkUser(loggedName) && loggedPass.length > 0){
    hashed_password = checkUser(loggedName).password;
  } else{
    hashed_password = undefined;
  }
  if(hashed_password && bcrypt.compareSync(loggedPass, hashed_password)){
    userCode = checkUser(loggedName);
    res.cookie('user_id', userCode);
    res.redirect('/');
  } else if(checkNewVal('email', loggedName) && hashed_password !== undefined){
    res.statusCode = 403;
    res.redirect('/register');
  } else {
    // res.send('Incorrect Credentials');
    res.statusCode = 403;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) =>{
  console.log('LOGGED OUT SON');
  res.clearCookie('user_id');
  // console.log(`Logging out`);
  res.redirect('/login');
});

// POST /urls/:id to allow editing of longURL
app.post('/urls/:id/edit', (req, res) =>{
  const cookie = req.cookies.user_id.id;
  const allowedUser = urlDatabase[req.params.id].userID;
  // console.log(`${cookie} === ${allowedUser}??`)
  if (cookie === allowedUser){
    newURL = req.body.newLongURL;
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

//POST REGISTER
app.post('/register', (req, res) =>{
  let newEmail = req.body.email;
  let password = req.body.password;
  let hashed_password = bcrypt.hashSync(password, 10);
  //will pass if there is a UNIQUE email and a password
  if (newEmail && password && checkNewVal('email', newEmail)){
    strCookie = generateRandomString();//Generates user_id cookie value
    //ATTEMPTS TO ADD NEW OBJECT
    users[strCookie] = {
      id: strCookie,
      email: newEmail,
      password: hashed_password,
    };
    res.cookie('user_id', users[strCookie]);
    console.log(users);
    res.redirect(`/urls`);
  } else {
    res.statusCode = 400;
    res.redirect(`/register`);
  }
});