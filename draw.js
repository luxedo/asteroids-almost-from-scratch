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

const ROTATION_SPEED = 6*Math.PI/180;
const THRUSTERS_ACCELERATION = 0.05;
const MAX_SPEED = 2;
const THRUSTERS_LENGTH = 5;
const SHOT_DISTANCE = 500;
const SHOT_SPEED = 5;
const SHOT_SIZE = 1;
const SHOT_INTERVAL = 200;
const BLAST_SIZE = 50;
const VECTOR_COLOR = "#FFF"

function drawArray(array, width=2, color=VECTOR_COLOR) {
  array = array.slice();
  // setup style
  Game.context.lineWidth = width;
  Game.context.strokeStyle = color;
  // go to starting position
  Game.context.beginPath();
  Game.context.moveTo(...array[0]);
  array.shift();
  // draw line
  array.forEach((value) => Game.context.lineTo(...value));
  Game.context.stroke();
}

function drawCircle(x, y, radius, width=1, color=VECTOR_COLOR) {
  // setup style
  Game.context.lineWidth = width;
  Game.context.strokeStyle = color;
  // draw circle
  Game.context.beginPath();
  Game.context.arc(x, y, radius, 0, 2*Math.PI);
  Game.context.stroke();
}

function drawPoint(x, y, width=1, color=VECTOR_COLOR) {
  drawArray([[x, y], [x+width, y+width]], width+1)
}

function parseLetter(letter) {
  let limits = alphabeth[letter]
    .match(/\D{2}/)[0]
    .split("")
    .map((value) => value.charCodeAt(0)-82);
  let coordinates = alphabeth[letter]
    .replace(/\d/g, "")
    .split(" ")
    .map((value, index) => (index === 0? value.slice(2): value.slice(1)))
    .map((value) => value.match(/(..?)/g))
  if (coordinates[0] !== null) {
    coordinates = coordinates.map((value0) => value0.map((value1) => [value1.charCodeAt(0)-82-limits[0], value1.charCodeAt(1)-82+6]));
  } else {
    coordinates = [[0, 0]]
  }
  let finalPosition = limits[1]-limits[0];
  return [coordinates, finalPosition];
}

function phraseLength(phrase, size) {
  // returns the final position of a phrase
  let lastPosition = 0;
  phrase.split("").forEach((letter) => {
      let [coordinates, finalPosition] = parseLetter(letter.toUpperCase());
      lastPosition += finalPosition;
  });
  return lastPosition*size;
}

function writeText(x, y, text, size=1, width=1, color=VECTOR_COLOR) {
  let lastPosition = 0;
  text.split("").forEach((letter) => {
      let [coordinates, finalPosition] = parseLetter(letter.toUpperCase());
      coordinates.forEach((value) => {
        value = value.map(element => [element[0]*size+x+lastPosition*size, element[1]*size+y])
        drawArray(value, width, color)
      });
      lastPosition += finalPosition;
  });
}

function writeCentered(y, text, size=1, width=1, color=VECTOR_COLOR) {
  const textLength = phraseLength(text, size);
  writeText(Game.width/2-textLength/2, y, text, size, width, color);
}

function checkNumber(number) {
  return !isNaN(parseFloat(number)) && isFinite(number);
}

function randomCoords(offsetX, offsetY) {
  return [Math.random()+offsetX, Math.random()+offsetY]
}

function makeAsteroidVectors() {
  let vectors = [randomCoords(0, 0), randomCoords(1, 0), randomCoords(2, 0), randomCoords(3, 0),
                 randomCoords(3, 1), randomCoords(2, 1), randomCoords(3, 2), randomCoords(3, 3),
                 randomCoords(2, 3), randomCoords(1, 3), randomCoords(0, 3), randomCoords(0, 2),
                 randomCoords(0, 1)];
  vectors.push(vectors[0])
  return [vectors];
}

function randomAsteroid(size, maxSpeed) {
  let quadrant = Math.floor(Math.random()*4-0.00001);
  let x = (quadrant==0?0:(quadrant==2?Game.width:Math.random()*Game.width));
  let y = (quadrant==1?0:(quadrant==3?Game.width:Math.random()*Game.width));
  let rotationSpeed = Math.random()*Math.PI/45-Math.PI/90;
  let speedX = Math.random()*maxSpeed - maxSpeed/2;
  let speedY = Math.random()*maxSpeed - maxSpeed/2;
  return new Asteroid(x, y, makeAsteroidVectors(), size, rotationSpeed, speedX, speedY)
}

class BaseSprite {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
  }
  draw() {}
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // border collision
    let spriteToBorder = Game.radius - Math.hypot(this.x-Game.width/2, this.y-Game.height/2)
    if (spriteToBorder <= 0) {
      let angle = Math.atan2(this.y-Game.height/2, this.x-Game.width/2)+Math.PI;
      let x = (Game.radius-10)*Math.cos(angle)+Game.width/2;
      let y = (Game.radius-10)*Math.sin(angle)+Game.height/2;
      this.resetSprite(x, y);
    }
  }
  get rear() {
    let retval = this.rotateVector([this.left*this.size+this.center[0], (this.top+this.bottom)/2+this.center[1]*this.size]);
    retval = [retval[0]+this.x, retval[1]+this.y]
    return retval;
  }

  get tip() {
    let retval = this.rotateVector([this.right*this.size+this.center[0], (this.top+this.bottom)/2+this.center[1]*this.size]);
    retval = [retval[0]+this.x, retval[1]+this.y]
    return retval;
  }

  get corners() {
    let lt = this.rotateVector([this.left, this.top]);
    let rt = this.rotateVector([this.right, this.top]);
    let lb = this.rotateVector([this.left, this.bottom]);
    let rb = this.rotateVector([this.right, this.bottom]);
    let retval = [lt, rt, lb, rb].map(value => [value[0]+this.x, value[1]+this.y])
    return retval;
  }
  resetSprite(x, y, rotation=false, speedX=false, speedY=false) {
    if (checkNumber(speedX)) this.speedX = speedX;
    if (checkNumber(speedY)) this.speedY = speedY;
    if (checkNumber(rotation)) this.updateRotation(rotation);
    this.x = x;
    this.y = y;
  }
  respawnSprite(speedX=false, speedY=false, angle=false) {
    let location = Math.random()*Math.PI*2;
    if (angle) location = angle;
    let x = (Game.radius-10)*Math.cos(location)+Game.width/2;
    let y = (Game.radius-10)*Math.sin(location)+Game.height/2;
    let rotation = Math.random()*Math.PI*2;
    this.resetSprite(x, y, rotation, speedX, speedY);
  }
  rotateVector(vector) {
    vector = [vector[0]-this.center[0], vector[1]-this.center[1]];
    let x = (vector[0]*Math.cos(this.rotation)-vector[1]*Math.sin(this.rotation));
    let y = (vector[1]*Math.cos(this.rotation)+vector[0]*Math.sin(this.rotation));
    return [x, y]
  }
  updateRotation(angle) {
    if (checkNumber(angle)) this.rotation = angle;
    this.showShape = this.shape
      .map(value0 => value0
        .map(value1 => this.rotateVector(value1)
      ));
  }
}

class Ship extends BaseSprite {
  constructor(x, y, keys, shape, size, sound) {
    super(x, y);
    this.keyUp = keys.keyUp;
    this.keyDown = keys.keyDown;
    this.keyLeft = keys.keyLeft;
    this.keyRight = keys.keyRight;
    this.shape = shape;
    this.size = size;
    this.rotation = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.shots = [];
    this.shotTimeout = Date.now();
    this.sound = sound;

    // find centroid
    let flat = [].concat.apply([], this.shape);
    this.left = Math.min(...flat.map(value => value[0]))
    this.right = Math.max(...flat.map(value => value[0]))
    this.top = Math.min(...flat.map(value => value[1]))
    this.bottom = Math.max(...flat.map(value => value[1]))
    this.center = [(this.left+this.right)/2, (this.top+this.bottom)/2];

    // translate center
    this.showShape = this.shape
      .map(value0 => value0
        .map(value1 => [value1[0]-this.center[0], value1[1]-this.center[1]]
    ));
  }

  draw() {
    // draw ship
    this.showShape.forEach(value => drawArray(value
      .map(vector => [vector[0]*this.size+this.x, vector[1]*this.size+this.y])));
    // draw thrusters fire
    if (this.thrusters && !this.dead) {
      let fireLength = Math.random()*THRUSTERS_LENGTH*this.size;
      let fireArray = [this.rear, [this.rear[0]-fireLength*Math.cos(this.rotation), this.rear[1]-fireLength*Math.sin(this.rotation)]];
      drawArray(fireArray, 4);
    }
    // draw shots
    this.shots.forEach(shot => shot.draw());
  }
  update() {
    super.update();
    this.thrusters = false;
    if (!this.dead) {
      if (Key.isDown(this.keyUp)) {
        // fire weapon
        this.fire();
      };
      if (Key.isDown(this.keyDown)) {
        this.fireThrusters()
      };
      if (Key.isDown(this.keyLeft) || Key.isDown(this.keyRight)) {
        // rotate ship
        this.rotation += (Key.isDown(this.keyRight)?ROTATION_SPEED:-ROTATION_SPEED)
        this.rotation %= 2*Math.PI;
        // rotate vectors around center
        this.updateRotation();
      };
    }
    // update shots
    let removeShots = []
    this.shots.forEach((shot, index) => {
      if (shot.distance > SHOT_DISTANCE) removeShots.push(shot);
      shot.update()
    });
    removeShots.forEach(val => this.shots.splice(val, 1));

    // limit max speed
    const speed = Math.hypot(this.speedX, this.speedY)
    if (speed > MAX_SPEED) {
      this.speedX *= MAX_SPEED/speed;
      this.speedY *= MAX_SPEED/speed;
    }
  }
  fire() {
    let now = Date.now();
    if (now >= this.shotTimeout) {
      this.shotTimeout = now+SHOT_INTERVAL;
      this.shots.push(new Shot(...this.tip, this.rotation, this.sound));
    }
  }
  fireThrusters() {
    // fire thrusters
    this.thrusters = true;
    // calculate new velocity vector
    this.speedX += THRUSTERS_ACCELERATION*Math.cos(this.rotation);
    this.speedY += THRUSTERS_ACCELERATION*Math.sin(this.rotation);
    Game.thrusters();
  }

  explode() {
    if (this.dead) return;
    this.dead = true;
    let spriteRadius = Math.max(...[this.top, this.bottom, this.left, this.right].map((val) => Math.abs(val)))
    let blast0 = this.fillExplosion(spriteRadius, BLAST_SIZE);
    let blast1 = this.fillExplosion(spriteRadius*2, BLAST_SIZE);
    let blast2 = this.fillExplosion(spriteRadius*5, BLAST_SIZE);
    let blast3 = this.fillExplosion(spriteRadius, BLAST_SIZE);
    let empty = []
    Game.explosion()
    this.showShape = blast0;
    setTimeout(()=> this.showShape = blast1, 60);
    setTimeout(()=> this.showShape = blast2, 120);
    setTimeout(()=> this.showShape = blast3, 180);
    setTimeout(()=> this.showShape = empty, 240);
  }
  fillExplosion(radius, debris) {
    let array = []
    while (array.length < debris) {
      let theta = Math.random()*2*Math.PI;
      let r = Math.random()*radius;
      let [x, y] = [r*Math.cos(theta), r*Math.sin(theta)]
      array.push([[x, y], [x+1, y+1]])
    }
    return array;
  }
}

class Shot extends BaseSprite {
  constructor(x, y, direction, sound) {
    super(x, y);
    this.direction = direction;
    this.rotation = direction;
    this.center = [0, 0];
    this.speedX = Math.cos(direction)*SHOT_SPEED;
    this.speedY = Math.sin(direction)*SHOT_SPEED;
    this.size = SHOT_SIZE;
    sound();
    this.distance = 0;
  }
  get corners() {
    let lt = this.rotateVector([-1, 3]);
    let rt = this.rotateVector([1, 3]);
    let lb = this.rotateVector([-1, -3]);
    let rb = this.rotateVector([1, -3]);

    let retval = [lt, rt, lb, rb].map(value => [value[0]+this.x, value[1]+this.y])
    return retval;
  }
  draw() {
    drawArray([[this.x, this.y], [this.xf, this.yf]]);
    if (SHOT_DISTANCE-this.distance<=20) {
      this._explode()
    }
  }
  update() {
    super.update();
    this.xf = this.x+Math.cos(this.direction)*this.size
    this.yf = this.y+Math.sin(this.direction)*this.size
    this.distance += SHOT_SPEED;
  }
  explode() {
    this.distance = SHOT_DISTANCE - 10;
  }
  _explode() {
    // center of rotation
    let xc = this.x+Math.cos(this.direction)*this.size/2
    let yc = this.y+Math.sin(this.direction)*this.size/2
    // rotate vector
    let x0 = this.x-xc
    let y0 = this.y-yc
    let xr0 = x0*Math.cos(Math.PI/2)-y0*Math.sin(Math.PI/2)+xc;
    let yr0 = y0*Math.cos(Math.PI/2)+x0*Math.sin(Math.PI/2)+yc;
    let x1 = this.xf-xc
    let y1 = this.yf-yc
    let xr1 = x1*Math.cos(Math.PI/2)-y1*Math.sin(Math.PI/2)+xc;
    let yr1 = y1*Math.cos(Math.PI/2)+x1*Math.sin(Math.PI/2)+yc;
    drawArray([[xr0, yr0], [xr1, yr1]])
    this.size -= 0.5;
  }
}

class ShipCursor extends Ship {
  constructor(positions, shape, size) {
    super(...positions[0], {}, shape, size)
    this.positions = positions;
    this.timeout = Date.now()+200
    this.current = 0;
    this.dead = true;
  }
  update() {
    if (Date.now()>this.timeout) {
      if (Key.isDown(38) || Key.isDown(87)) {
        Game.thrusters();
        this.current-=1;
        this.timeout = Date.now()+200;
      };
      if (Key.isDown(40) || Key.isDown(83)) {
        Game.thrusters();
        this.current+=1;
        this.timeout = Date.now()+200;
      };
      if (this.current >= this.positions.length) this.current = 0;
      if (this.current < 0) this.current = this.positions.length-1;
      [this.x, this.y] = this.positions[this.current];
    }
  }
}

class Asteroid extends BaseSprite {
  constructor(x, y, shape, size, rotationSpeed, speedX, speedY) {
    super(x, y);
    this.shape = shape;
    this.size = size;
    this.rotationSpeed = rotationSpeed;
    this.speedX = speedX;
    this.speedY = speedY;
    this.rotation = Math.random()*Math.PI/90

    // find centroid
    let flat = [].concat.apply([], this.shape);
    this.left = Math.min(...flat.map(value => value[0]))
    this.right = Math.max(...flat.map(value => value[0]))
    this.top = Math.min(...flat.map(value => value[1]))
    this.bottom = Math.max(...flat.map(value => value[1]))
    this.center = [(this.left+this.right)/2, (this.top+this.bottom)/2];

    // translate center
    this.showShape = this.shape
      .map(value0 => value0
        .map(value1 => [value1[0]-this.center[0], value1[1]-this.center[1]]
    ));
  }
  update() {
    super.update();
    this.updateRotation(this.rotation+this.rotationSpeed);
  }
  draw() {
    // draw ship
    this.showShape.forEach(value => drawArray(value
      .map(vector => [vector[0]*this.size+this.x, vector[1]*this.size+this.y])));
  }
}