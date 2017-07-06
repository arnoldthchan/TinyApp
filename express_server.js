//REQUIRED MODULES
let express = require('express');
let ejs = require('ejs');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');


//Creates variable which is this express server
let app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

let PORT = process.env.PORT || 8080; // default port 8080


//Allow to view EJS files for EJS Template usage
app.set('view engine', 'ejs');

//Database object of shortened URLS and entered URLs
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'aaaaaa': 'http://www.youtube.com',
  'TestTe': 'http://spotify.com'
};

//Datebase object of Users containg ID, Email, pass
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
  }
}

// produces a string of 6 random alphanumeric characters:
function generateRandomString() {
  let randomStr = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i = 0; i < 6; i++) {
      randomStr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  // console.log(randomStr);
  return randomStr;
}

app.listen(PORT, function() {
  console.log(`Example Express app listening on port ${PORT}!`);
});

//Main page, does nothing
app.get('/', function(req, res) {
  res.statusCode = 200;
  // res.send('Hello!');
  res.redirect('urls');
});

//Renders the ejs page with the for loop of shortened URLS
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase,
    username: req.cookies['username']};
  res.render('urls_index', templateVars);
});

//WHERE THE FORM IS
app.get('/urls/new', (req, res) => {
  res.render('urls_new', {username: req.cookies['username']});
});

//Redirects to actual webpage based on shortenedURL
app.get('/u/:shortenedURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortenedURL];
  // console.log(req.params.shortenedURL); //Logs the generated 6-dig ID
  if (urlDatabase[req.params.shortenedURL]){
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send(`<b><marquee>URL DOES NOT EXIST</marquee></b><p><a href='/urls/new'>Back to Link Shortener </a>`);
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
      fullURL: fullURL,
      username: req.cookies['username']
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
    username: req.cookies['username']
  });
});

//Cat.
app.get('/cat', (req, res) => {
  res.statusCode = 200;
  res.setHeader('content-type', 'text/html');
  res.render('cat');
});

//POSTS
//POSTS
//POSTS


//Uses POST request to submit form data
app.post('/urls', (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  result = req.body;
  genURL = generateRandomString();
  urlDatabase[genURL] = result.longURL;
  res.redirect(`urls/${genURL}`);
});

//Deletes URL entry based on shortened URL entered
app.post('/urls/:shortenedURL/delete', (req, res) =>{
  let link = req.params.shortenedURL;
  console.log(`${link} at ${urlDatabase[link]}... Deleting`);
    delete urlDatabase[link];
    res.redirect('/urls');
});

//LOGIN ENDPOINT AFTER SUBMITTING FROM THE HEADER
app.post('/login', (req, res) =>{
  loggedName = req.body.username;
  res.cookie('username', loggedName);
  // console.log(`Logged in under username: ${loggedName}`);
  // res.send(`Logged in under username: ${loggedName}`);
  res.redirect('/urls');
});

app.post('/logout', (req, res) =>{
  res.clearCookie('username');
  // console.log(`Logging out`);
  res.redirect('/urls');
});

// POST /urls/:id to allow editing of longURL
app.post('/urls/:id/edit', (req, res) =>{
  let link = urlDatabase[req.params.id];
  newURL = req.body.newLongURL;
  // console.log(`CURRENT LINK: ${link}`);
  // console.log(`NEW LINK: ${newURL}`);
  urlDatabase[req.params.id] = newURL;
  res.redirect(`/urls`);
});

//redirects to url based on ID link
app.post('/urls/:id', (req, res) =>{
  res.redirect(`/urls/${req.params.id}`);
});

//POST REGISTER
app.post('/register', (req, res) =>{
  let email = req.body.email;
  let password = req.body.password;
  if (email && password){
    genCookie = generateRandomString();//Generates user_id cookie value
    res.cookie('user_id', genCookie);
    //ATTEMPTS TO ADD NEW OBJECT
    // let newNum = Object.keys(users).length+1;
    users[genCookie] = {
      id: genCookie,
      email: email,
      password: password,
    };
    console.log(users);
    res.redirect(`/urls`);
  } else {
    res.statusCode = 400;
    res.redirect(`/register`);
  }
});