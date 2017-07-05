let express = require('express');
let ejs = require('ejs');
let bodyParser = require('body-parser');

//Creates variable which is this express server
let app = express();
app.use(bodyParser.urlencoded({extended: true}));

let PORT = process.env.PORT || 8080; // default port 8080


//Allow to view EJS files for EJS Template usage
app.set('view engine', 'ejs');

//Database object of shortened URLS and entered URLs
let urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'aaaaaa': 'http://youtube.com'
};

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

// function findURL(obj){
//   var URL = '';
//   for each (var link in obj){
//     //if obj == in database
//   }
//   return URL
// }

app.listen(PORT, function() {
  console.log(`Example Express app listening on port ${PORT}!`);
});

//Main page, does nothing
app.get('/', function(req, res) {
  res.statusCode = 200;
  res.send('Hello!');
});

//Renders the ejs page with the for loop of shortened URLS
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//Uses POST request to submit form data
app.post('/urls', (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  result = req.body;
  genURL = generateRandomString();
  urlDatabase[genURL] = result.longURL;
  res.redirect(`urls/${genURL}`);
});

app.post('/urls/:shortenedURL/delete', (req, res) =>{
  let link = req.params.shortenedURL;
  console.log(`${link} at ${urlDatabase[link]}... Deleting`);
    delete urlDatabase[link];
    res.redirect('/urls');
});

//WHERE THE FORM IS
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//Redirects to actual webpage based on shortenedURL
app.get('/u/:shortenedURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortenedURL];
  console.log(req.params.shortenedURL);
  if (urlDatabase[req.params.shortenedURL]){
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send(`<b><marquee>URL DOES NOT EXIST</marquee></b><p><a href='/urls/new'>Back to Link Shortener </a>`);
  }
});

//:id refers to anything after /url
app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id };
  let fullURL = `localhost:8080/urls/${templateVars.shortURL}`;
  res.render('urls_show', {
    templateVars:templateVars,
    fullURL: fullURL
    });
});

//Cat.
app.get('/cat', (req, res) => {
  res.statusCode = 200;
  res.setHeader('content-type', 'text/html');
  res.render('cat');
});
