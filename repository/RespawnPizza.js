// ==UserScript==
// @name            Respawn Pizzas (Replays Edition)
// @description     Replace Respawn Warnings by a "growing pizza animation" to know exactly when the respawn happens!
// @author          Ko (modified by nabby)
// @version         2.1.3
// @match           game
// @customSettings  RespawnPizzaCustomSettings = {slices: {value: 16, description: "The number of pizza slices to use (2-180)"}}
// @updateURL       https://gist.github.com/nabbynz/6d8d989aaa1d3c281aaf04b82063a4d8/raw/Respawn_Pizzas_(Replays_Edition).user.js
// @downloadURL     https://gist.github.com/nabbynz/6d8d989aaa1d3c281aaf04b82063a4d8/raw/Respawn_Pizzas_(Replays_Edition).user.js
// @grant           none
// ==/UserScript==

(function() {


    var GM_info = {
        script: {
            name: "Respawn Pizzas",
            version: "2.1.3",
            author: "Ko (modified by nabby)"
        }
    }
    console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');
    'use strict';

    /* eslint-env jquery */
    /* globals tagpro, tagproConfig, PIXI */
    /* eslint-disable no-multi-spaces */


    //const slices = 60; //values like: 3, 6, 10, 20, 30 or 60 work well
    const slices = Number(RespawnPizzaCustomSettings.slices.value ?? 16);

    tagpro.ready(function() {
        const elements = tagpro.renderer.dynamicSprites;
        const start = 1.5 * Math.PI; // The first slice should be at the top
        const tau = Math.PI * 2;
        const slice_size = tau / slices;

        // Listen for respawn warnings...
        tagpro.socket.on('mapupdate', function(mapupdates) {
            if (!Array.isArray(mapupdates)) mapupdates = [mapupdates];

            for (let mapupdate of mapupdates) {
                let element = elements && elements[mapupdate.x] && elements[mapupdate.x][mapupdate.y];

                if (!element) {
                    continue;
                }

                if (/.\d1$/.test(String(mapupdate.v)) ) { // .test should be slightly faster
                    // We got a respawn warning!
                    // Bake a new pizza if it's the first time
                    if (!element.pizza) {
                        element.pizza = new PIXI.Graphics();
                        element.pizza.center = element.width / 2;
                        element.addChild(element.pizza);
                    }

                    // Reset the pizza
                    element.mask = element.pizza;
                    element.slices = 0;
                    element.delta = 3000 / slices / (tagpro.replaySpeed || 1); // takes in account replays speed
                    element.lastDraw = performance.now();

                    // Let it grow!
                    updatePizza(element);

                } else if (element.pizza) {
                    element.mask = null; // <<-- Hide the pizza once respawned.
                }
            }
        });

        function updatePizza(element) { // Adds a slice
            if (element.mask !== null) {
                requestAnimationFrame(() => {
                    updatePizza(element);
                });

                // Draw the pizza!
                if (element.lastDraw < performance.now() - element.delta) {
                    const portion = ++element.slices * slice_size;

                    if (portion < tau) {
                        element.pizza.clear().beginFill().moveTo(element.pizza.center, element.pizza.center).arc(element.pizza.center, element.pizza.center, 16, start, start + portion);
                        element.lastDraw = performance.now();
                    } else {
                        element.mask = null;
                    }
                }
            }
        }
    });

})();