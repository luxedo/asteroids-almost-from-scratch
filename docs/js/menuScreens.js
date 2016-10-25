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

const gameOverPositions = [[170, 420], [180, 470], [230, 520]]
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
  gameOverScreen.asteroids = makeAsteroids(2, 2, 2);
  gameOverScreen.cursor = 0;
  gameOverScreen.name = "";
}
gameOverScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  gameOverScreen.asteroids.forEach(asteroid => asteroid.draw());
  gameOverScreen.arrow.draw()
  writeCentered(60, "GAME OVER", 5);
  writeCentered(120, 'HIGH SCORE', 3);
  writeCentered(180, Game.score.score.toString(), 5);
  writeCentered(280, gameOverScreen.name, 5);
  writeCentered(330, "-".repeat(gameOverScreen.name===""?4:gameOverScreen.name.length*4), 1);
  writeCentered(360, "Enter your initials", 1.5);
  writeCentered(410, "play again", 2);
  writeCentered(460, "Save score", 2);
  writeCentered(510, "menu", 2);
  writeCentered(570, VERSION);
}
gameOverScreen.update = () => {
  gameOverScreen.arrow.update()
  gameOverScreen.asteroids.forEach(asteroid => asteroid.update());
  if (Game.keyTimeout > Date.now()) return
  Game.keyTimeout = Date.now()+150;
  for (let i=48; i<=90; i++) {
    if (Key.isDown(i) && gameOverScreen.name.length<=5) {
      gameOverScreen.name += String.fromCharCode(i);
    }
  }
  if (Key.isDown(8)) {
    gameOverScreen.name = gameOverScreen.name.substring(0, gameOverScreen.name.length - 1);
  }
  if (Key.isDown(13)) {
    Game.laser2();
    if (gameOverScreen.arrow.current === 0) {
      Game.changeState(playScreen);
    } else if (gameOverScreen.arrow.current === 1) gameOverScreen.postScore();
    else if (gameOverScreen.arrow.current === 2) Game.changeState(startScreen);
  } else if (Key.isDown(27)) {
    Game.laser1();
    Game.changeState(playScreen);
  }
}
gameOverScreen.postScore = () => {
  $.post("/sendscore", {"name": gameOverScreen.name, "score": parseInt(Game.score.score)})
    .done(() => Game.changeState(highScoreScreen));

}

highScoreScreen.init = () => {
  highScoreScreen.asteroids = makeAsteroids(3, 0, 1);
  highScoreScreen.scores = [];
  $.get("/highscores", data => highScoreScreen.scores = data);
}
highScoreScreen.draw = () => {
  Game.context.clearRect(0, 0, Game.width, Game.height);
  highScoreScreen.asteroids.forEach(asteroid => asteroid.draw());
  writeCentered(50, "asteroids", 4);
  writeCentered(100, "almost from scratch", 2);
  writeCentered(150, "high scores", 2);
  for (let i=0; i<8; i++) {
    if (highScoreScreen.scores[i] === undefined) break;
    let value = highScoreScreen.scores[i]
    writeText(180, 200+40*i, value.name+":", 2, 2);
    writeText(320, 200+40*i, value.score.toString(), 2, 2);
  }
  writeCentered(550, "esc - go back");
  writeCentered(570, VERSION);
}
highScoreScreen.update = () => {
  highScoreScreen.asteroids.forEach(asteroid => asteroid.update());
  if (Key.isDown(27)) {
    Game.laser1();
    Game.changeState(startScreen);
  }
}
