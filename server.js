var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var pg = require('pg');

app.use(bodyParser());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/docs'));
app.get('/highscores', getHighScores);
app.post('/sendscore', postHighScores); // please don't hack the scores
app.get('*', (req, res) => res.redirect('/'));

function getHighScores(req, res) {
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if (err) {
      { console.error(err); res.send([{name: 'Error', score: 0}]); }
    }
    client.query('SELECT * FROM scores ORDER BY score DESC LIMIT 50', (err, result) => {
      done();
      if (err)
       { console.error(err); res.send([{name: 'Error', score: 1}]); }
      else
       {
         res.send(result.rows)
       }
    });
  });
}

function postHighScores(req, res, next) {
  const player = req.body
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if (err) {
      return next(err)
    }
    if (typeof(parseInt(player.score)) == "number" && typeof(player.name) === "string") {
      client.query('INSERT INTO scores (name, score) VALUES ($1, $2);',
      [player.name, parseInt(player.score)], (err, result) => {
        done()
        if (err) {
          return next(err)
        }
        res.send(200)
      });
    } else {
      res.send(400)
    }
  });
}

app.listen(app.get('port'), () => {
  console.log("Asteroids app is running at localhost:" + app.get('port'));
});
