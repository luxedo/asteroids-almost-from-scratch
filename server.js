"use strict";
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let pg = require('pg');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/docs'));
app.get('/highscores', getHighScores);
app.post('/sendscore', postHighScores); // shhhh, pretend you didn't see this
app.get('*', (req, res) => res.redirect('/'));

function getHighScores(req, res) {
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if (err) {
      { console.error(err); res.send([{name: 'Error', score: 0}]); }
    } else {
      client.query('SELECT * FROM scores ORDER BY score DESC', (err, result) => {
        done();
        if (err)
        { console.error(err); res.send([{name: 'Error', score: 1}]); }
        else
        {
          res.send(result.rows)
        }
      });
    }
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
        res.sendStatus(200)
      });
    } else {
      res.sendStatus(400)
    }
  });
}

app.listen(app.get('port'), () => {
  console.log("Asteroids app is running at localhost:" + app.get('port'));
});
