# ASTEROIDS ALMOST FROM SCRATCH
This is an attempt of reproducing the game [asteroids](https://en.wikipedia.org/wiki/asteroids!) using modern programming languages. The idea is to track the progress and time each stage of development in this document. If possible, I want to finish this project in under 24h. Feel free to see the `diff` between the commits and maybe learn something just like I did.

#### Check it out [here](https://asteroids-almost-from-scratch.herokuapp.com/)

The game is based in `html5 canvas`, `CSS` and `ES6 javascript`. No extra libraries or engines will be used.

Since I've already worked on a project to reproduce [spacewar-almost-from-scratch](https://armlessjohn404.github.io/spacewar-almost-from-scratch/), I'll be using much of it in here. If you want to see how it was done, check it out on [GitHub](https://github.com/ArmlessJohn404/spacewar-almost-from-scratch).

## GOALS
* ~~Add `LICENSE.md` and `README.md~~
* ~~Copy the `spacewar` files~~
* ~~Host somewhere~~
* ~~Make screens square~~
* ~~Remove gravity, player2 and `blackhole`~~
* ~~Modify `Ship` class~~
* ~~Modify `Shot` class~~
* ~~Create `Asteroid` class~~
* ~~Draw asteroids~~
* ~~Create `Saucer` class~~
* ~~Draw saucers~~
* ~~Create `Score` class~~
* ~~Modify collision mechanics~~
  * ~~Collision with borders~~
  * ~~Create Asteroid breaking mechanics~~
  * ~~Collision Asteroid-Player~~
  * ~~Collision Shot-Asteroid~~
  * ~~Collision Saucer-Shot~~
  * ~~Collision Saucer Player~~
  * ~~Collision Saucer Shot-Player Shot~~
  * ~~Collision Saucer Shot-Player~~
* ~~Create level mechanics~~
* ~~Create life mechanics~~
* ~~Implement saucer AI~~
* ~~Modify menu screens~~
  * ~~Modify `start screen`~~
  * ~~Modify `credits screen`~~
  * ~~Modify `game over screen`~~
* ~~Create High scores screen~~
* ~~Find someplace to host high scores~~
* ~~Implement pause~~
* ~~Modify sounds~~
* ~~Improve webpage~~
* Get play testers feedback, List requests/bugs
* Fix requests/bugs
* Finished!

## Progress Reports
00:00 - Start! This project started October 23rd, 2016 at 17:30 (BRT). I'll be timing each step and will be placing the time it took from the beginning along with the achieved goal.

## 00:10 - LICENSE and README
This project is under a [GNU GPL3](https://www.gnu.org/licenses/gpl-3.0.en.html) license. Have fun! :wink:

## 00:15 - Host somewhere
For now, I'll be hosting it in [github pages](https://pages.github.com/) since it's easy deploy. Check it out [here](https://armlessjohn404.github.io/asteroids-almost-from-scratch/)

## 00:30 - Copy the `spacewar` files
Since this game is also made with vector graphics, I copied the [spacewar](https://armlessjohn404.github.io/spacewar-almost-from-scratch/) I made to the project folder and changed the favicon, the main color and a few tweaks. In the end it was looking like this:

![spacewar copy](report-assets/spacewar-copy.png "spacewar copy")

## 00:45 - Make screens square
Asteroids have a square screen, so I removed the stars and the round mask of the spacewar.

## 01:00 - Remove gravity, player2 and `blackhole`
The game does not have the `blackhole` (star) in the middle as `Spacewar` has, so it has been removed along with the gravity mechanics. Also, I don't want to add a 2 player mode because in the original game the players took turns playing. Instead I'll try to make a online highscore.

## 01:20 - Modify `Ship` class
The ship sprite is much simpler in Asteroids. So it was easy to draw: ![ship](report-assets/ship.png "ship")
![ship thrusters](report-assets/ship-thrusters.png "ship thrusters"). I changed some properties to make the ship more agile and interesting to play.
```javascript
const player1Vectors = [[[5, 0], [-4, -3], [-3, -2], [-3, 2], [-4, 3], [5, 0]]];
```

## 01:30 - Modify `Shot` class
The shots were also easy. I just changed some properties and done.

## 02:50 - Create `Asteroid` class and draw asteroids
To create the asteroid class, I inherited the `BaseClass`. The only addition was a rotation speed property that makes the asteroid spins continuously.

To draw the asteroids, I made a function that randomly generates points in a grid and used those vectors.

```javascript
function makeAsteroidVectors() {
  let vectors = [randomCoords(0, 0), randomCoords(1, 0), randomCoords(2, 0), randomCoords(3, 0),
                 randomCoords(3, 1), randomCoords(2, 1), randomCoords(3, 2), randomCoords(3, 3),
                 randomCoords(2, 3), randomCoords(1, 3), randomCoords(0, 3), randomCoords(0, 2),
                 randomCoords(0, 1)];
  vectors.push(vectors[0])
  return [vectors];
}
```

Luckly for me, in the constructor, I have made the vectors translate to make the centroid of the object the coordinates (0, 0), then it's easy to rotate the object around the centroid. And there's also a scaler in the constructor to chose the size of the objects which came in handy to make asteroids of different sizes.
This is the end result

![asteroid class](report-assets/asteroid-class.gif "asteroid class")

## 03:10 - Create `Saucer` class and draw saucers
Instead of making a `Saucer` class, I'm recycling the `Ship` class and will control it in the gameloop.
The vectors for the
![saucer](report-assets/saucer.png "saucer") are:
```javascript
const saucerVectors = [[[-1, 0], [1, 1], [5, 1], [7, 0], [5, -1], [1, -1], [-1, 0]],
                       [[2, 1], [2.5, 2], [3.5, 2], [4, 1]],
                       [[-1, 0], [7, 0]]];
```

## 03:20 - Create `Score` class
The score class is super simple, it took 10 min to make and test it.

![score](report-assets/score.png "score")
```javascript
class Score {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.score = 0;
  }
  draw() {
    writeText(this.x, this.y, this.score.toString(), this.size);
  }
}
```
I thought about making the score like the original game, but I really liked working with the [Hershey Vector Font](http://paulbourke.net/dataformats/hershey/).

## 03:25 - Modify collision mechanics - Collision with borders
It was changed in the `update` method of `BaseSprite` the way the game computes a collision with the borders.
```javascript
// border collision
if (this.x < 0) this.x = 600;
if (this.x > 600) this.x = 0;
if (this.y < 0) this.y = 600;
if (this.y > 600) this.y = 0;
```
## 04:10 - Modify collision mechanics - Collision Asteroid-Player
Since the collision function was implemented in `Spacewar`, it was easy to calculate the collisions with the asteroids. I just had to add a conditional to make the asteroids split in smaller ones.

## 05:00 - Modify collision mechanics - Collision Asteroid-Shot
The collision mechanics were easy to implement again, but this part took a while longer because I wasn't using correctly the splice method and along with the non-blocking property of JavaScript I was getting lots of bugs.

## 05:20 - Modify collision mechanics - Collision Saucer
The last part of the collisions was easier because there were code from Spacewar that did exactly that.

## 06:00 - Create level mechanics
The game is played in waves of increasing difficulty, so, when the count of asteroids is zero, a new level starts with more asteroids. The saucers appears randomly with increasing probability (1/level) over time.
Also, the score system was upgraded:
* Asteroids - 20 (large), 50 (medium), or 100 points (small).
* Saucers - 200 (large), or 1000 points (small).

## 06:00 - Pause!
Right now, October 24rd, 2016 at 00:45 (BRT), I'm giving a break from the project. About 2/3 of the goas are done, maybe I can finish it in under 12h, that would be neat!

## 06:45 - Create life mechanics
The life mechanics could have been a class, but I opted for implementing all in the gameloop. I used the `ShipCursor` class and an array to draw ships bellow the score that indicates the life of the player. Now the game is playable and looks like this:

![game so far](report-assets/game-so-far.gif "game so far")

## 07:30 - Implement saucer AI
The saucer AI was also salvaged from `spacewar`, the main change is that the saucer is much slower and the shots interval is much higher.

![saucer ai](report-assets/saucer-ai.gif "saucer ai")

## 08:00 - Modify menu screens
All the screens were partially done, so it was just a matter of changing the text and the position of some stuff. I added a few asteroids in the screens to make them look more interesting.

![new screens](report-assets/new-screens.gif "new screens")

## 08:40 Create high score screen
I copied the `credits screen` and modified it to make the `high score screen`. At this point I didn't worry about how I'm connecting the high scores with some server.
Also, I added a space for the player to put his/hers name in the `game over screen`.

![high score screen](report-assets/high-score-screen.png "high score screen")
![game over name](report-assets/gameover-name.png "game over name")

## 14:00 - Find someplace to host high scores
It took 5 hours to convert the project to be hosted at [Heroku](https://www.heroku.com/
), learn a bit of [Postgres](https://www.postgresql.org/) and learn how [Heroku Postgres](https://www.heroku.com/postgres) works. Phew, it took a while longer than I expected, but it's working!

I started by setting up a server with [node](https://nodejs.org/en/) and [express](http://expressjs.com/) and created some routes. I'm using [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) to GET and POST
the high scores. I didn't put the effort to make an authentication, so my API is compvarly exposed.

```javascript
let express = require('express')
let bodyParser = require('body-parser')
let app = express()
let pg = require('pg');

app.use(bodyParser());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/docs'));
app.get('/highscores', getHighScores);
app.post('/sendscore', postHighScores); // shhhh, pretend you didn't see this
app.get('*', (req, res) => res.redirect('/'));
```

When calling the high scores screen, I place the results of a query inside the screen
object which is rendered on screen. I used [jQuery](https://jquery.com/) for the requests,
I allowed myself to use an external library in this case because this is not related
to the game engine.

```javascript
$.get("/highscores", data => highScoreScreen.scores = data);
```

## 14:40 - Modify Sounds
Luckly for me, it was easy to find the sound assets. I downloaded all the sounds from
[http://www.classicgaming.cc/classics/asteroids/sounds](http://www.classicgaming.cc/classics/asteroids/sounds). Thanks guys! I just changed the names of the assets and done.

In html5 it's a bit hard to work with sounds, they sound choppy sometimes and the same
sound asset doesn't like to be called while it's playing.

## 15:40 - Improve webpage
For the webpage, I added a static page to get a list of the high scores.

![highscores](report-assets/highscores.png "highscores")

## Get play testers feedback, List requests/bugs
* Fix player explosion - `me`
* ~~Footer is leaking into game-frame - `Thiago Harry`, `Ule`, `Rodrigo Mendes`~~
* ~~Transpile code to ES5 - `permith`~~
* ~~Add a blinking cursor for the name input - `me`, `Rodrigo Mendes`~~
* Improve saucer and thruster sounds - `me`
* Improve keyboard input - `me`
* ~~Duplicating highscore - `Ule`~~
* Ship Spawn Effect - `Guno`, `poppij`
* Spawned outside the screen - `Cae`, `Guno`
* ~~Query for name in `gamover` screen - `me`~~
* Check multiple keypresses - `poppij`
