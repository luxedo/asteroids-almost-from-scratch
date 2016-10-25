var express = require('express')
var app = express()
var pg = require('pg');

app.set('view engine', 'html');
console.log('Hello!!!');
console.log(process.env.DATABASE_URL);
app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    console.log(err);
    client.query('SELECT * FROM scores', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         console.log('inside query');
         console.log(result);
       }
       console.log('heloo!');

    });
  });
});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/docs'));
// app.get('/db', function (request, response) {

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
