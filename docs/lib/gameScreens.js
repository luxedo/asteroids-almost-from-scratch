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

const p1Spawn = [Game.width/2, Game.height/2];
const playerVectors = [[[5, 0], [-4, -3], [-3, -2], [-3, 2], [-4, 3], [5, 0]]];
const playerKeys = {
  keyUp: 32,
  keyDown: 38,
  keyLeft: 37,
  keyRight: 39,
};
const BIG_SAUCER = 5;
const SMA_SAUCER = 2.5;
const BIG_ASTEROID = 12;
const MED_ASTEROID = 6;
const SMA_ASTEROID = 3;
const ASTEROID_MAX_SPEED = 3;
const SAUCER_SCHEDULE = 6000;
const saucerVectors = [[[-1, 0], [1, 1], [5, 1], [7, 0], [5, -1], [1, -1], [-1, 0]],
                       [[2, 1], [2.5, 2], [3.5, 2], [4, 1]],
                       [[-1, 0], [7, 0]]];
const LEVEL_BASE = 3;
const NEW_LIFE_SCORE = 10000;
const SPAWN_DISTANCE = 200;
const STARTING_LIFES = 3;
const HALO_SIZE = 70;

playScreen.init = () => {
  // Create players
  Game.player = new Ship(...p1Spawn, playerKeys, playerVectors, 1.5, Game.firePlayer);
  Game.player.updateRotation(Math.random()*Math.PI*2);
  Game.asteroids = [];
  Game.saucer = new Ship(0, 0, {}, saucerVectors, 5, Game.fireSaucer);
  Game.saucer.updateRotation(Math.PI*2);
  Game.saucer.dead = true;
  Game.saucer.hidden = true;
  Game.debris = new Debris(Game.player.x, Game.player.y, Game.player.speedX, Game.player.speedY)
  Game.debris.hidden = true
  Game.score = new Score(20, 20, 2);
  Game.lifeIndicator = [];
  Game.level = 1;
  Game.life = STARTING_LIFES;
  for (let i=0; i<Game.life; i++) {
    let indicator = new ShipCursor([[30+20*i, 60]], playerVectors, 1.5)
    indicator.updateRotation(3*Math.PI/2);
    Game.lifeIndicator.push(indicator);
  }
  playScreen.interval = false;
  playScreen.newLifeAt = NEW_LIFE_SCORE;
  playScreen.loadAsteroids = true;
}

playScreen.draw = function () {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw sprites
  Game.player.draw();
  Game.asteroids.forEach(value => value.draw());
  if (!Game.saucer.hidden) Game.saucer.draw();
  if (!Game.debris.hidden) Game.debris.draw();


  Game.score.draw();
  Game.lifeIndicator.forEach(value => value.draw());
  if (!document.hasFocus()) {
    writeCentered(Game.height/2, "PAUSED", 4)
  }
  if (playScreen.spawnHalo) {
    drawCircle(Game.player.x, Game.player.y, playScreen.haloSize);
    playScreen.haloSize *= 0.90;
  }
}

playScreen.update = function () {
  if (Key.isDown(27)) {
    // Game.blip4();
    Game.changeState(startScreen);
  }
  if (!document.hasFocus()) {
    return
  }
  // update sprites
  Game.asteroids.forEach(value => value.update());
  if (!Game.debris.hidden) Game.debris.update();
  if (!Game.saucer.hidden) Game.saucer.update();
  Game.player.update();
  Game.debris.update()

  // check for collision
  Game.asteroids.forEach((asteroid) => {
    // Shot-Asteroid collision
    Game.player.shots.forEach(shot => {
      if (playScreen.checkCollision(asteroid, shot) && !asteroid.dead && !shot.dead) {
        asteroid.explode();
        shot.explode();
      }
    });
    // Asteroid-Player collision
    if (playScreen.checkCollision(Game.player, asteroid) && !asteroid.dead && !Game.player.dead) {
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
  if (Game.asteroids.length === 0 && Game.saucer.dead && playScreen.loadAsteroids) {
    setTimeout(() => {
      Game.level++;
      while (Game.asteroids.length < LEVEL_BASE+Game.level) {
        let asteroid = randomAsteroid(BIG_ASTEROID, ASTEROID_MAX_SPEED);
        let playerDistance = Math.hypot(asteroid.x - Game.player.x, asteroid.y - Game.player.y);
        if (playerDistance > SPAWN_DISTANCE) Game.asteroids.push(asteroid);
      }
      playScreen.loadAsteroids = true;
    }, 1000)
    playScreen.loadAsteroids = false;
  }
  // check if saucer is dead and schedule a spawn
  if (Game.saucer.dead && !playScreen.sauceScheduled) {
    playScreen.sauceScheduled = true;
    let nextSaucer = ((1/Game.level + 1)+Math.random())*SAUCER_SCHEDULE
    setTimeout(playScreen.spawnSaucer, nextSaucer);
  }
  // check for dead player
  if (Game.player.dead && !playScreen.interval) {
    // game over when out of lifes
    playScreen.interval = true;
    Game.player.hidden = true;
    Game.debris = new Debris(Game.player.x, Game.player.y, Game.player.speedX, Game.player.speedY)
    setTimeout(() => Game.debris.hidden = true, 2000)
    if (Game.life <= 1) {
      setTimeout(() => Game.changeState(gameOverScreen), 1000);
    } else {
      Game.life--;
      Game.lifeIndicator.pop()
      setTimeout(playScreen.spawnPlayer, 1000)
    }
  }
  // Add new life when reaches a score
  if (Game.score.score >= playScreen.newLifeAt) {
    playScreen.newLifeAt += NEW_LIFE_SCORE;
    Game.extraShip();
    Game.life++;
    let indicator = new ShipCursor([[30+20*Game.lifeIndicator.length, 60]], playerVectors, 1.5)
    indicator.updateRotation(3*Math.PI/2);
    Game.lifeIndicator.push(indicator);
  }

  // saucer AI
  if (!Game.saucer.dead) {
    // basic vectors
    let p1dx = Game.player.x-Game.saucer.x;
    let p1dy = Game.player.y-Game.saucer.y;
    let p1r = Math.hypot(p1dx, p1dy);
    // player angle in relation to saucer
    let angleDelta = (Math.atan2(p1dy, p1dx)-Game.saucer.rotation)%(Math.PI*2)
    // Adjust angles and limit to ROTATION_SPEED
    angleDelta = (angleDelta<Math.PI?angleDelta:angleDelta-2*Math.PI)
    angleDelta = (angleDelta<-Math.PI?angleDelta+2*Math.PI:angleDelta)
    angleDelta = (Math.abs(angleDelta)<ROTATION_SPEED?angleDelta:Math.sign(angleDelta)*ROTATION_SPEED);
    // Apply actions
    Game.saucer.updateRotation(Game.saucer.rotation+angleDelta);
    if (p1r < SHOT_DISTANCE && angleDelta<ROTATION_SPEED) {
      Game.saucer.fire();
    }
    Game.saucer.fireThrusters()
  }
}

playScreen.spawnPlayer = () => {
  let x = Math.random()*Game.width;;
  let y = Math.random()*Game.height;;
  let objectTooClose = false;
  Game.asteroids.forEach(asteroid => {
    let playerDistance = Math.hypot(asteroid.x - x, asteroid.y - y);
    if (playerDistance < SPAWN_DISTANCE) objectTooClose = true;
  });
  let playerDistance = Math.hypot(Game.saucer.x - x, Game.saucer.y - y);
  if (playerDistance < SPAWN_DISTANCE || objectTooClose) objectTooClose=true;
  if (objectTooClose) {
    playScreen.spawnPlayer();
    return;
  }
  playScreen.interval = false;
  playScreen.haloSize = HALO_SIZE;
  playScreen.spawnHalo = true;
  setTimeout(() => playScreen.spawnHalo = false, 5000);
  Game.player = new Ship(x, y, playerKeys, playerVectors, 1.5, Game.firePlayer);
  Game.player.updateRotation(Math.random()*Math.PI*2)
}

playScreen.spawnSaucer = () => {
  let x = (Math.round(Math.random())? 0: Game.width);;
  let y = Math.random()*Game.height;;
  let saucerSize = (Math.random()>=0.5? BIG_SAUCER:SMA_SAUCER);
  if (Math.hypot(Game.player.x-x, Game.player.y-y) < SPAWN_DISTANCE) {
      playScreen.spawnSaucer();
      return;
  }
  Game.saucer = new Ship(x, y, {}, saucerVectors, saucerSize, Game.fireSaucer);
  Game.saucer.updateRotation(Math.PI)
  Game.saucer.updateRotation = (angle) => Game.saucer.rotation = angle;
  Game.saucer.thrustersLength = 0;
  Game.saucer.shotDistance = SHOT_DISTANCE/3;
  Game.saucer.maxSpeed = MAX_SPEED/3;
  Game.saucer.shotInterval = SHOT_INTERVAL*10;
  Game.saucer.thrustersAcceleration = THRUSTERS_ACCELERATION/2;
  Game.saucer.blastSize = BLAST_SIZE/2;
  Game.saucer.thrustSound = (saucerSize===BIG_SAUCER?Game.saucerBig:Game.saucerSmall);
  playScreen.sauceScheduled = false;
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
  if (p2left < p1right && p1left < p2right && p2top < p1bottom && p1top < p2bottom) return true;
  return false;
}
