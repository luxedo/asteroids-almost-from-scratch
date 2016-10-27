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
"use strict"
const VERSION = "v1.0";

function startGame() {
  Game.start();
  if ('withCredentials' in new XMLHttpRequest() || typeof XDomainRequest !== "undefined" ) {
      /* supports cross-domain requests */
      //Use IE-specific "CORS" code with XDR
  } else {
    //Time to retreat with a fallback or polyfill
    $(".footer p:first").hide();
    $(".footer p:first").before(`
      <p>
        <h3>
          This host does not support high-scores. Try:<br>
          <a href="https://asteroids-almost-from-scratch.herokuapp.com/">
          asteroids-almost-from-scratch.herokuapp.com/</a>
        </h3>
      </p>`
    );
  }
}
