// ==UserScript==
// @name            Stars FTW
// @description     Shows lots of colorful stars when you win a game
// @version         1.3.5
// @match        game
// @updateURL       https://gist.github.com/nabbynz/e063466143699707e775d7b05dca7baa/raw/Stars_FTW.user.js
// @downloadURL     https://gist.github.com/nabbynz/e063466143699707e775d7b05dca7baa/raw/Stars_FTW.user.js
// @TPMUSJMURL	 https://raw.githubusercontent.com/rfmx49/TagProMobileUserScripts/refs/heads/main/repository/starsFTW.js

// @grant           none
// @author          nabby
// ==/UserScript==

(function() {

//console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

'use strict';

/* eslint-env jquery */
/* globals tagpro, PIXI, Tween */
/* eslint-disable no-multi-spaces */


const SHOW_FLAIRS_AT_EOG = true;



tagpro.ready(function() {
    let tr = tagpro.renderer;
    let explosions = [];

    let drawStarExplosion = function (x, y, radius = 60, length = 150, color = 0xFFFFFF) {
        let explosion = new PIXI.Graphics();

        explosion.tagpro = {
            started: performance.now(),
            length: length,
            x: x,
            y: y,
            size: radius,
            color: color,
        };

        if (Math.random() < 0.1) { // 10% 3-point star
            explosion.beginFill(color || 0xFFFF00).drawStar(0, 0, 3, radius, radius * 0.15, 0);
        } else if (Math.random() < 0.4) { // 30% 8-point star
            explosion.beginFill(color || 0xFFFF00).drawStar(0, 0, 8, radius, radius * 0.10, 0);
        } else if (Math.random() < 0.9) { // 50% 6-point star
            explosion.beginFill(color || 0xFFFF00).drawStar(0, 0, 6, radius, radius * 0.25, 0);
        } else { // 10% circles
            explosion.beginFill(color || 0xFFFF00).drawCircle(0, 0, radius / 3);
        }

        tr.layers.background.addChildAt(explosion, 0);
        explosions.push(explosion);
    };

    let updateExplosions = function() {
        let now = performance.now();

        explosions.slice().forEach(function(explosion) {
            let duration = now - explosion.tagpro.started;

            if (duration >= explosion.tagpro.length) {
                tr.layers.background.removeChild(explosion);
                explosions.splice(explosions.indexOf(explosion), 1);

                return;
            }

            let newSize = explosion.width + 1.5;

            explosion.width = explosion.height = newSize;
            explosion.alpha = 1 - (duration / explosion.tagpro.length);
            explosion.position.set(explosion.tagpro.x, explosion.tagpro.y);
        });
    };

    let hasEnded = false;

    let animateWinnerText = function(sprite) {
        if (!sprite.tween) {
            sprite.tween = new Tween(1.0, 0.1, 400, 'cubeInOut', true);
        }

        let tweenValue = sprite.tween.getValue();

        sprite.scale = new PIXI.Point(tweenValue, tweenValue);

        if (tweenValue === 1 && hasEnded) { // this adds a delay, because simple tween doesn't have a delay method
            sprite.tween.reset();
            delete sprite.tween;
            hasEnded = false;

            setTimeout(() => {
                requestAnimationFrame(() => {
                    animateWinnerText(sprite);
                });
            }, 2500);

        } else {
            if (tweenValue === 1.1 && !hasEnded) {
                hasEnded = true;
            }

            requestAnimationFrame(() => {
                animateWinnerText(sprite);
            });
        }
    };

    let emitter;
    let renderDelta;
    let updateEOGFlairEmitter;
    let makeFlairTextures;

    if (SHOW_FLAIRS_AT_EOG) {
        makeFlairTextures = function() {
            const allFlairTextures = [];

            for (let texture in PIXI.utils.TextureCache) {
                if (texture.startsWith('flair-') && !PIXI.utils.TextureCache[texture].noFrame) {
                    allFlairTextures.push(PIXI.utils.TextureCache[texture]);
                }
            }

            tagpro.particleDefinitions.flairsRectangle = {
                alpha: { start: 0.8, end: 0.2 },
                scale: { start: 0.6, end: 0.9, minimumScaleMultiplier: 1 },
                color: { start: '#ffffff', end: '#ffffff' },
                speed: { start: 10, end: 30, minimumSpeedMultiplier: 3 },
                acceleration: { x: 0, y: 0 },
                maxSpeed: 0,
                startRotation: { min: 0, max: 360 },
                noRotation: false,
                rotationSpeed: { min: 0, max: 1 },
                lifetime: { min: 0.5, max: 2.5 },
                frequency: 0.005,
                emitterLifetime: -1,
                maxParticles: 100,
                pos: { x: 0, y: 0 },
                addAtBack: false,
                spawnType: 'rect',
                spawnRect: { x: 0, y: 0, w: tagpro.map.length * 40, h: tagpro.map[0].length * 40 }
            };

            emitter = new PIXI.particles.Emitter(tr.layers.midground, allFlairTextures, tagpro.particleDefinitions.flairsRectangle);
            emitter.keep = true;
            emitter.emit = true;
        };

        updateEOGFlairEmitter = function() {
            let now = performance.now();

            requestAnimationFrame(updateEOGFlairEmitter);

            if (!renderDelta) {
                renderDelta = now;
            }

            emitter.update((now - renderDelta) * 0.001);
            renderDelta = performance.now();
        };
    }

    tagpro.socket.on('end', function(data) {
        if (tagpro.spectator || (data.winner === 'red' && tagpro.players[tagpro.playerId].team === 1) || (data.winner === 'blue' && tagpro.players[tagpro.playerId].team === 2)) {
            for (let x = 0; x < tagpro.map.length; x++) {
                for (let y = 0; y < tagpro.map[0].length; y++) {
                    if (Math.floor(tagpro.map[x][y]) === 0 && Math.random() < 0.3) { // only draw on empty tiles with ~30% coverage
                        setTimeout(function() {
                            let color = (Math.random() < 0.20 ? 0xEE0000 : Math.random() < 0.40 ? 0x00FF40 : Math.random() < 0.60 ? 0xFFFF00 : Math.random() < 0.80 ? 0xFF7700 : 0x00BBFF);

                            drawStarExplosion(x * 40 + 20, y * 40 + 20, Math.random() * 10, Math.random() * 2000, color);
                        }, Math.random() * 600);

                    }
                }
            }

            PIXI.Ticker.shared.add(updateExplosions);

            setTimeout(() => {
                if (tr.layers.ui.children[tr.layers.ui.children.length - 1].text && tr.layers.ui.children[tr.layers.ui.children.length - 1].text.includes('Wins!')) {
                    let sprite = tr.layers.ui.children[tr.layers.ui.children.length - 1];

                    sprite.anchor.y = 0.5;
                    sprite.position.y += sprite.height / 2;

                    animateWinnerText(sprite);
                }
            }, 1000);

            if (SHOW_FLAIRS_AT_EOG) {
                setTimeout(() => {
                    makeFlairTextures();

                    if (emitter) {
                        updateEOGFlairEmitter();
                    }
                }, 3000);
            }
        }
    });
});