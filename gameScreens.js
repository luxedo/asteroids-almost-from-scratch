/*
asteroids-almost-from-scratch
This is an attempt of making the game pong using modern programming languages

Copyright (C) 2016  Luiz Eduardo Amaral - <luizamaral306@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";

const p1Spawn = [150, 150];
const playerVectors = [[[5, 0], [-4, -3], [-3, -2], [-3, 2], [-4, 3], [5, 0]]];
const playerKeys = {
  keyUp: 32,
  keyDown: 38,
  keyLeft: 37,
  keyRight: 39,
};
const BIG_SAUCER = 5;
const SMA_SAUCER = 2;
const BIG_ASTEROID = 12;
const MED_ASTEROID = 6;
const SMA_ASTEROID = 3;
const ASTEROID_MAX_SPEED = 2;
const saucerVectors = [[[-1, 0], [1, 1], [5, 1], [7, 0], [5, -1], [1, -1], [-1, 0]],
                       [[2, 1], [2.5, 2], [3.5, 2], [4, 1]],
                       [[-1, 0], [7, 0]]];
const LEVEL_BASE = 4;

playScreen.init = () => {
  // Create players
  Game.player = new Ship(...p1Spawn, playerKeys, playerVectors, 1.5, Game.laser1);
  Game.asteroids = []
  Game.saucer = new Ship(0, 0, {}, saucerVectors, 5, Game.laser1);
  Game.saucer.dead = true;
  Game.saucer.hidden = true;
  Game.score = new Score(20, 20, 2);
  playScreen.ended = false;
}

playScreen.draw = function () {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw sprites
  Game.player.draw();
  Game.asteroids.forEach(value => value.draw());
  if (!Game.saucer.hidden) Game.saucer.draw();
  Game.score.draw();
}

playScreen.update = function () {
  // update sprites
  Game.player.update();
  Game.asteroids.forEach(value => value.update());
  Game.saucer.update();

  // check for collision
  Game.asteroids.forEach((asteroid) => {
    // Shot-Asteroid collision
    Game.player.shots.forEach(shot => {
      if (playScreen.checkCollision(asteroid, shot)) {
        asteroid.explode();
        shot.explode();
      }
    });
    // Asteroid-Player collision
    if (playScreen.checkCollision(Game.player, asteroid)) {
      if (asteroid.dead) return;
      Game.player.explode();
      asteroid.explode();
    }
    // destroy asteroids
    if (asteroid.dead && !asteroid.splitted) {
      asteroid.splitted = true;
      if (asteroid.size == BIG_ASTEROID) {
        Game.score.score += 20;
        Game.asteroids.push(randomAsteroid(MED_ASTEROID, ASTEROID_MAX_SPEED, asteroid.x, asteroid.y))
        Game.asteroids.push(randomAsteroid(MED_ASTEROID, ASTEROID_MAX_SPEED, asteroid.x, asteroid.y))
      }
      else if (asteroid.size == MED_ASTEROID) {
        Game.score.score += 50;
        Game.asteroids.push(randomAsteroid(SMA_ASTEROID, ASTEROID_MAX_SPEED, asteroid.x, asteroid.y))
        Game.asteroids.push(randomAsteroid(SMA_ASTEROID, ASTEROID_MAX_SPEED, asteroid.x, asteroid.y))
      } else Game.score.score += 100;
    }
  });
  // Player, Shot and Saucer collision
  let collisionArr1 = Game.player.shots.slice();
  collisionArr1.push(Game.player);
  let collisionArr2 = Game.saucer.shots.slice();
  collisionArr2.push(Game.saucer);
  for (let i=0; i<collisionArr1.length; i++) {
    for (let j=0; j<collisionArr2.length; j++) {
      let sprite1 = collisionArr1[i];
      let sprite2 = collisionArr2[j];
      if (playScreen.checkCollision(sprite1, sprite2) && !sprite1.dead && !sprite2.dead) {
        sprite1.explode();
        sprite2.explode();
        if (sprite2 === Game.saucer) {
          if (Game.saucer.size ===  BIG_SAUCER)  Game.score.score += 200;
          else  Game.score.score += 1000;
        }
      }
    }
  }
  // clear dead asteroids
  let removeAsteroids = [];
  Game.asteroids.forEach((asteroid, index) => {
    if (asteroid.done) removeAsteroids.push(index);
  });
  removeAsteroids.forEach(value => Game.asteroids.splice(value, 1))
  // go to the next level
  if (Game.asteroids.length === 0) {
    level++;
    while (Game.asteroids.length < LEVEL_BASE+level) {
      let asteroid = randomAsteroid(BIG_ASTEROID, ASTEROID_MAX_SPEED);
      let playerDistance = Math.hypot(asteroid.x - Game.player.x, asteroid.y - Game.player.y);
      if (playerDistance > 200) Game.asteroids.push(asteroid);
    }
  }
  // check if saucer is dead and schedule a spawn
  if (Game.saucer.dead && !playScreen.sauceScheduled) {
    playScreen.sauceScheduled = true;
    let nextSaucer = ((1/level + 1)+Math.random())*10000
    setTimeout(() => {
      Game.saucer = new Ship(300, 300, {}, saucerVectors, BIG_SAUCER, Game.laser1);
      playScreen.sauceScheduled = false;
    }, nextSaucer);
  }
  // check for game over
  if ((Game.player.dead) && !playScreen.ended) {
    playScreen.ended = true;
    setTimeout(() => Game.changeState(gameOverScreen), 1000);
  }
  if (Key.isDown(27)) {
    // Game.blip4();
    Game.changeState(startScreen);
  }
}

playScreen.rotateVector = (vector, angle) => {
  let x = (vector[0]*Math.cos(angle)-vector[1]*Math.sin(angle));
  let y = (vector[1]*Math.cos(angle)+vector[0]*Math.sin(angle));
  return [x, y]
}

playScreen.checkCollision = function(sprite1, sprite2) {
  // Limits of the sprite
  const p1c = sprite1.corners;
  const p2c = sprite2.corners;
  // Translate sprites to make p1c[0] the origin
  const p1cT = sprite1.corners.map(val => [val[0]-p1c[0][0], val[1]-p1c[0][1]]);
  const p2cT = sprite2.corners.map(val => [val[0]-p1c[0][0], val[1]-p1c[0][1]]);
  // Calculate the rotation to align the p1 bounding box
  const angle = Math.atan2(p1cT[2][1], p1cT[2][0]);
  // Rotate vetcors to align
  const p1cTR = p1cT.map(val => playScreen.rotateVector(val, angle));
  const p2cTR = p2cT.map(val => playScreen.rotateVector(val, angle));
  // Calculate extreme points of the bounding boxes
  const p1left = Math.min(...p1cTR.map(value => value[0]))
  const p1right = Math.max(...p1cTR.map(value => value[0]))
  const p1top = Math.min(...p1cTR.map(value => value[1]))
  const p1bottom = Math.max(...p1cTR.map(value => value[1]))
  const p2left = Math.min(...p2cTR.map(value => value[0]))
  const p2right = Math.max(...p2cTR.map(value => value[0]))
  const p2top = Math.min(...p2cTR.map(value => value[1]))
  const p2bottom = Math.max(...p2cTR.map(value => value[1]))
  // Check if shadows overlap in both axes
  // console.log(p1left, p1right, p1top, p1bottom, p2left, p2right, p2top, p2bottom);
  if (p2left < p1right && p1left < p2right && p2top < p1bottom && p1top < p2bottom) return true;
  return false;
}
