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

const gameOverPositions = [[180, 410], [230, 460]]
const startScreenPositions = [[210, 310], [210, 360]]

creditsScreen.init = () => {
  creditsScreen.asteroids = makeAsteroids(3, 0, 1);
}
creditsScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  creditsScreen.asteroids.forEach(asteroid => asteroid.draw());
  // draw board
  // add text
  writeCentered(50, "asteroids", 4);
  writeCentered(100, "almost from scratch", 2);
  writeText(50, 200, "This is an attempt of making the game asteroids using", 1);
  writeText(50, 220, "modern programming languages. You can find more", 1);
  writeText(50, 240, "information about the project in it's github page:", 1);
  writeCentered(280, "https://github.com/ArmlessJohn404/asteroids-almost-from-scratch", 0.8);
  // writeText(50, 320, "Thanks to meroleroman7, Shaun105, jeremysykes and", 1);
  // writeText(50, 340, "ProjectsU012 for the sound assets.", 1);
  // writeText(50, 360, "Thanks to the playtesters 00jknight, Baino, Maria and", 1);
  // writeText(50, 380, "Thiago Harry", 1);
  // writeText(50, 400, "Thanks for the support of Kaska, rgk, 8Observer8, ", 1);
  // writeText(50, 420, "StorytellerVR and Igor Georgiev", 1);
  // writeText(50, 440, "Thanks to Lee Reilly for the PR fixing a typo", 1);
  writeCentered(480, "This project is under a GNU GPL3 license. Have fun! ;)", 0.9);
  writeCentered(500, "Copyright (C) 2016  Luiz Eduardo Amaral", 0.9);
  writeCentered(520, "<luizamaral306(at)gmail.com>", 0.9);

  writeCentered(550, "esc - go back");
  writeCentered(570, VERSION);
}
creditsScreen.update = () => {
  creditsScreen.asteroids.forEach(asteroid => asteroid.update());
  if (Key.isDown(27)) {
    Game.laser1();
    Game.changeState(startScreen);
  }
}

startScreen.init = () => {
  startScreen.arrow = new ShipCursor(startScreenPositions, playerVectors, 3);
  startScreen.asteroids = makeAsteroids(5, 3, 3);
}
startScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  startScreen.asteroids.forEach(asteroid => asteroid.draw());
  startScreen.arrow.draw()
  writeCentered(80, "asteroids", 5, 5);
  writeCentered(150, "almost from scratch", 2.7);
  writeCentered(300, "start", 2);
  writeCentered(350, "credits", 2);
  writeCentered(500, "enter - go        esc - go back", 1);
  writeCentered(520, "controls - arrows and spacebar", 1);
  writeCentered(560, VERSION);
}
startScreen.update = () => {
  startScreen.arrow.update()
  startScreen.asteroids.forEach(asteroid => asteroid.update());
  if (Key.isDown(13)) {
    if (Game.keyTimeout > Date.now()) return;
    Game.keyTimeout = Date.now()+200;
    Game.laser2();
    if (startScreen.arrow.current === 0) Game.changeState(playScreen);
    else if (startScreen.arrow.current === 1) Game.changeState(creditsScreen);
  }
}

gameOverScreen.init = () => {
  gameOverScreen.arrow = new ShipCursor(gameOverPositions, playerVectors, 3);
  gameOverScreen.asteroids = makeAsteroids(3, 2, 2);
}
gameOverScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  startScreen.asteroids.forEach(asteroid => asteroid.draw());
  gameOverScreen.arrow.draw()
  writeCentered(100, "GAME OVER", 5);
  writeCentered(200, 'HIGH SCORE', 3);
  writeCentered(250, Game.score.score.toString(), 5);
  writeCentered(400, "play again", 2);
  writeCentered(450, "menu", 2);
  writeCentered(570, VERSION);
}
gameOverScreen.update = () => {
  gameOverScreen.arrow.update()
  startScreen.asteroids.forEach(asteroid => asteroid.update());
  if (Key.isDown(13)) {
    if (Game.keyTimeout > Date.now()) return
    Game.keyTimeout = Date.now()+200;
    Game.laser2();
    if (gameOverScreen.arrow.current === 0) {
      Game.changeState(playScreen);
    }
    else if (gameOverScreen.arrow.current === 1) Game.changeState(startScreen);
  } else if (Key.isDown(27)) {
    Game.laser1();
    Game.changeState(playScreen);
  }
}
