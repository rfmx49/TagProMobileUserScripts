// ==UserScript==
// @name         Sponge Mock Name
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  SpONgE mOcK your name
// @author       ArryKane
// @match        game
// @icon         https://www.google.com/s2/favicons?sz=64&domain=koalabeast.com
// @grant        none
// ==/UserScript==

(function() {
tagpro.ready(function() {
    //are we in the game?
    //what is our name currently
    function wonkoify(){
        let currentName = tagpro.players[tagpro.playerId].name.toLowerCase();
        let newName = spongeMoCk(currentName);
        tagpro.socket.emit("name", newName);
    }

    function spongeMoCk(input){
        input = input.toUpperCase();
        let output = "";
        for (let i = 0; i < input.length; i++) {
            let c = input[i];
            if (c >= "A" && c <= "Z") {
                output += Math.random() > 0.5 ? c : c.toLowerCase();
            } else if (c === " ") {
                output += c;
            } else {
                output += c;
            }
        }
        return output;
    }

    (function init(wonkoify, startTime) {
        if (Date.now() - startTime > 27500) {
            console.log("wonko timeout");
            return
        }
        if (window.tagpro && tagpro.players) {
            if (tagpro.playerId != null) {
                if (window.gameStarted == true) {
                    wonkoify();
                }
            } else {
                setTimeout(init, 500, wonkoify, startTime);
            }
        } else {
            setTimeout(init, 500, wonkoify, startTime);
        }
    })(wonkoify, Date.now());

})
})();