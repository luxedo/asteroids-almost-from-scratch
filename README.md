# ASTEROIDS ALMOST FROM SCRATCH
This is an attempt of reproducing the game [asteroids](https://en.wikipedia.org/wiki/asteroids!) using modern programming languages. The idea is to track the progress and time each stage of development in this document. If possible, I want to finish this project in under 24h.

#### Check it out [here](https://armlessjohn404.github.io/asteroids-almost-from-scratch/)

The game is based in `html5 canvas`, `CSS` and `ES6 javascript`. No extra libraries or engines will be used.

Since I've already worked on a project to reproduce [spacewar-almost-from-scratch](https://armlessjohn404.github.io/spacewar-almost-from-scratch/), I'll be using much of it in here.

## GOALS
* ~~Add `LICENSE.md` and `README.md~~
* ~~Copy the `spacewar` files~~
* ~~Host somewhere~~
* ~~Make screens square~~
* ~~Remove gravity, player2 and `blackhole`~~
* ~~Modify `Ship` class~~
* ~~Modify `Shot` class~~
* Create `Asteroid` class
* Draw asteroids
* Create `Saucer` class
* Draw saucers
* Create `Score` class
* Modify collision mechanics
* Create life mechanics
* Create High scores screen
* Find someplace to host High scores
* Modify `start screen`
* Modify `credits screen`
* Modify `game over screen`
* Modify sounds
* Improve webpage
* Get play testers feedback
* List requests/bugs
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

## 01:30 - Modify `Shot` class
The shots were also easy. I just changed some properties and done.
