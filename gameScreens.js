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
const player1Keys = {
  keyUp: 32,
  keyDown: 38,
  keyLeft: 37,
  keyRight: 39,
};

playScreen.init = () => {
  // Create players
  Game.player1 = new Ship(...p1Spawn, player1Keys, player1Vectors, 1.5, Game.laser1);
  playScreen.ended = false;
}

playScreen.draw = function () {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  // draw sprites
  Game.player1.draw();
}

playScreen.update = function () {
  Game.player1.update();

  // check for collision
  // let collisionArr1 = Game.player1.shots.slice();
  // collisionArr1.push(Game.player1);
  // for (let i=0; i<collisionArr1.length; i++) {
  //   for (let j=0; j<collisionArr2.length; j++) {
  //     let sprite1 = collisionArr1[i];
  //     let sprite2 = collisionArr2[j];
  //     if (playScreen.checkCollision(sprite1, sprite2)) {
  //       sprite1.explode();
  //       sprite2.explode();
  //     }
  //   }
  // }
  if ((Game.player1.dead) && !playScreen.ended) {
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
