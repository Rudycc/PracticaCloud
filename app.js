// Modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const stemmer = require('porter-stemmer').stemmer;

//Own Modules
const dynamoDbTable = require('./keyvaluestore.js');

// Express
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));

app.use(function(req, res, next) {
    res.setHeader("Cache-Control", "no-cache must-revalidate");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/search/:word', function(req, res) {
  const stemmedword = stemmer(req.params.word); //stem the word
  console.log("Stemmed word: "+stemmedword);
  
  terms.get(stemmedword)
  .then(data => {
    if (data == null || data.length === 0) {
      console.log("getAttributes() returned no results");
      res.send(JSON.stringify({results: [], num_results: 0, error: undefined}));
    } else {
      let promises = data.map(attribute => images.get(attribute.value))

      Promise.all(promises).then(foundImages => {
        let results = foundImages.map(([{value}]) => value)
        res.send(JSON.stringify({results, num_results: results.length, error: undefined}));
      }).catch(console.log)
    }
  }).catch(err => {
    console.log("getAttributes() failed: "+err);
    res.send(JSON.stringify({results: undefined, num_results: 0, error: err}));
  })
});

//INIT Logic
const images = new dynamoDbTable('images');
const terms = new dynamoDbTable('terms');

images.init(
    function(){
        terms.init(
            function(){
                console.log("Images Storage Starter");
            }
        )
        console.log("Terms Storage Starter");
    }    
);

module.exports = app;
