// ==UserScript==
// @name          Map Previewer
// @description   Shows a preview of the map pre-game.
// @version       0.2.5
// @author        nabby (some code based on "Pre-Match Map Preview" by happy)
// @match        game
/* @customSettings NMP_SettingsObject = {
    enableZooming: { value: true, description: 'set to false to disable the pre-game zooming.' },
    slowZoomOutAtEnd: { value: true, description: 'set to false to disable the post-game super-slow zooming out.' },
    showReadyGo: { value: true, description: 'show a \"3-2-1-Go!\" message as game is starting.' }
}*/

// @updateURL     https://gist.github.com/nabbynz/4a47546b18f03217a59e0405627b22e1/raw/TagPro_Map_Previewer.user.js
// @downloadURL   https://gist.github.com/nabbynz/4a47546b18f03217a59e0405627b22e1/raw/TagPro_Map_Previewer.user.js
// @grant         none
// ==/UserScript==

console.log('START: Map Previewer (v 0.2.5 by nabby (some code based on "Pre-Match Map Preview" by happy))');
(function() {
// ----- Options -----
var enableZooming = NMP_SettingsObject.enableZooming?.value === "true" ? true : NMP_SettingsObject.enableZooming?.value === "false" ? false : true;
var slowZoomOutAtEnd = NMP_SettingsObject.slowZoomOutAtEnd?.value === "true" ? true : NMP_SettingsObject.slowZoomOutAtEnd?.value === "false" ? false : true;
var showReadyGo = NMP_SettingsObject.showReadyGo?.value === "true" ? true : NMP_SettingsObject.showReadyGo?.value === "false" ? false : true;

var zoomFrom = 4.25;            //If this value is > 1, the initial map view will start zoomed out and zoom in. If < 1 it will start zoomed in and get bigger. Default is 4.
var zoomTo = 1;                 //how far to zoom the map to (eg: 0.5 = 50% or half-size). Default is: 1 (normal)
var extraTime = 3;              //increase this if you want more time between when the view zooms in and when the game starts. measured in seconds (default is 3)
var mapViewKey = 96;            //code for the key you want use to preview the whole map during the game (default is the '~' key, which is code 96). Set to 'null' to disable.
var hidePUPs = false;           //if true all Powerups, Boosts, Bombs & Spikes will be hidden until zooming stops.
// --- End Options ---


tagpro.ready(function() {
    var mapName = '';
    var actualSpectator;
    var pressDn = jQuery.Event("keydown");
    var pressUp = jQuery.Event("keyup");
    var wasPressingLeft = false;
    var wasPressingRight = false;
    var wasPressingUp = false;
    var wasPressingDown = false;
    var normalVPWidth = 1280;
    var normalVPHeight = 800;
    var normalZoom, fullZoom;
    var clearableId;

    $(document).on('keydown', function(e) {
        if (tagpro.spectator) {
            if (e.keyCode === 37) wasPressingLeft = true;
            else if (e.keyCode === 39) wasPressingRight = true;
            else if (e.keyCode === 38) wasPressingUp = true;
            else if (e.keyCode === 40) wasPressingDown = true;
        }
    });
    $(document).on('keyup', function(e) {
        if (tagpro.spectator) {
            if (e.keyCode === 37) wasPressingLeft = false;
            else if (e.keyCode === 39) wasPressingRight = false;
            else if (e.keyCode === 38) wasPressingUp = false;
            else if (e.keyCode === 40) wasPressingDown = false;
        }
    });

    $(document).on('keypress', function(e) {
        if (!actualSpectator && (e.keyCode === mapViewKey) && (tagpro.state !== 3)) {
            var playerId;

            if (!tagpro.spectator) {
                if (tagpro.state === 1) {
                    if (tagpro.players[tagpro.playerId].pressing.left) wasPressingLeft = true;
                    else wasPressingLeft = false;
                    if (tagpro.players[tagpro.playerId].pressing.right) wasPressingRight = true;
                    else wasPressingRight = false;
                    if (tagpro.players[tagpro.playerId].pressing.up) wasPressingUp = true;
                    else wasPressingUp = false;
                    if (tagpro.players[tagpro.playerId].pressing.down) wasPressingDown = true;
                    else wasPressingDown = false;

                    //this just "unsticks" the arrow keys if they were being pressed...
                    pressDn.keyCode = 37;
                    $(document).trigger(pressDn);
                    pressUp.keyCode = 37;
                    $(document).trigger(pressUp);

                    pressDn.keyCode = 39;
                    $(document).trigger(pressDn);
                    pressUp.keyCode = 39;
                    $(document).trigger(pressUp);

                    pressDn.keyCode = 38;
                    $(document).trigger(pressDn);
                    pressUp.keyCode = 38;
                    $(document).trigger(pressUp);

                    pressDn.keyCode = 40;
                    $(document).trigger(pressDn);
                    pressUp.keyCode = 40;
                    $(document).trigger(pressUp);

                } else if (tagpro.state === 2) {
                    if ($('#options').is(':visible')) { //hides the scoreboard
                        pressDn.keyCode = 27;
                        $(document).trigger(pressDn);
                        pressUp.keyCode = 27;
                        $(document).trigger(pressUp);
                    }
                }

                tagpro.viewport.followPlayer = false;
                resizeVP(true);
                if (hidePUPs && tagpro.renderer.layers.midground) tagpro.renderer.layers.midground.alpha = 0;
                $('#loadingMessage').text('Spectator View').css('color', 'orange').show(0);
            }

            tagpro.spectator = !tagpro.spectator;

            if (!tagpro.spectator) {
                if (wasPressingLeft) {
                    pressDn.keyCode = 37;
                    $(document).trigger(pressDn);
                }
                if (wasPressingRight) {
                    pressDn.keyCode = 39;
                    $(document).trigger(pressDn);
                }
                if (wasPressingUp) {
                    pressDn.keyCode = 38;
                    $(document).trigger(pressDn);
                }
                if (wasPressingDown) {
                    pressDn.keyCode = 40;
                    $(document).trigger(pressDn);
                }

                tagpro.viewport.followPlayer = true;
                resizeVP();
                if (hidePUPs && tagpro.renderer.layers.midground) tagpro.renderer.layers.midground.alpha = 1;
                $('#loadingMessage').hide(0);
            }
        }
    });

    function resizeVP(maximiseVP) {
        var playerId;

        if (maximiseVP) {
            $('#viewport').css('left', 0);
            $('#viewport').css('top', 0);
            tagpro.renderer.canvas_width = $(window).width();
            tagpro.renderer.canvas_height = $(window).height();
            var mapWidth = tagpro.map.length * 40 / tagpro.renderer.canvas_width;
            var mapHeight = tagpro.map[0].length * 40 / tagpro.renderer.canvas_height;
            tagpro.zoom = fullZoom;
            tagpro.renderer.resizeAndCenterView();
            if (tagpro.playerId && tagpro.players[tagpro.playerId].sprites) tagpro.players[tagpro.playerId].sprites.name.tint = 0xFF00FF; //make our name stand out a bit more

        } else {
            tagpro.renderer.canvas_width = normalVPWidth;
            tagpro.renderer.canvas_height = normalVPHeight;
            $('#viewport').css('left', $(window).width() / 2 - normalVPWidth / 2);
            $('#viewport').css('top', $(window).height() / 2 - normalVPHeight / 2);
            tagpro.renderer.resizeAndCenterView();
            if (tagpro.playerId && tagpro.players[tagpro.playerId].sprites) tagpro.players[tagpro.playerId].sprites.name.tint = 0xFFFFFF;
        }
    }

    if (showReadyGo) {
        $('#loadingMessage').after('<div id="MPV_Message" style="position:absolute; display:flex; justify-content:center; align-items:center; top:25%; left:0; right:0; margin:0 auto; width:175px; height:175px; font-size:80px; font-weight:bold; color:chartreuse; background:rgba(0,0,0,0.7); border:6px double; border-radius:50%;"></div>');
        $('#MPV_Message').show(0).hide(0);

        var showGo = function(message, size, color, hideDelay) {
            if (!message) return;

            $('#MPV_Message').text(message).css({ 'font-size':size, 'color':color }).show(0);

            if (hideDelay) {
                setTimeout(function() {
                    $('#MPV_Message').fadeOut(200);
                }, hideDelay);
            }
        };
    }

    tagpro.socket.on('spectator', function(data) {
        if ((data === 'watching') || (data === 'waiting')) {
            resizeVP(true);
        } else {
            resizeVP();
        }
    });


    var clearableCountdown;
    tagpro.socket.on('time', function(message) {
        if (enableZooming && (message.state === 3) && (message.time/1000 > extraTime-1)) { //before the actual start, and if we have enough time
            var frequency = 5;
            var zoomStop = normalZoom*zoomTo;
            var countdown = 100 * Math.round((message.time-1000) / 100);
            var interval = Math.abs(zoomFrom-zoomStop) / ((message.time/1000-extraTime-1)*(1000/frequency));

            if (showReadyGo) {
                clearableCountdown = setInterval(function() {
                    if (countdown === 3000) showGo('3', '40px', 'dodgerblue');
                    else if (countdown === 2000) showGo('2', '40px', 'crimson');
                    else if (countdown === 1000) showGo('1', '40px', 'gold');
                    countdown = countdown - 100;
                }, 100);
            }

            setTimeout(function() {
                actualSpectator = !!tagpro.spectator;
                if (zoomFrom < zoomTo) interval = interval * -1;
                //tagpro.zoom = zoomFrom;

                if (!actualSpectator) {
                    tagpro.zoom = zoomFrom;
                    setTimeout(function() {
                        if (tagpro.ui && tagpro.ui.sprites.spectatorInfo1) tagpro.ui.sprites.spectatorInfo1.alpha = 0;
                        if (tagpro.ui && tagpro.ui.sprites.spectatorInfo2) tagpro.ui.sprites.spectatorInfo2.alpha = 0;
                    }, 100);

                    tagpro.viewport.followPlayer = false;
                    if (tagpro.playerId && tagpro.players[tagpro.playerId].sprites) tagpro.players[tagpro.playerId].sprites.name.tint = 0xFF00FF;
                    $('#loadingMessage').hide(0);
                    $('#viewport').show(0);

                    tagpro.spectator = true;
                    if (mapName) $('#loadingMessage').text('Match Begins Soon...').css('color', 'white').show(0);
                    if (hidePUPs && tagpro.renderer.layers.midground) tagpro.renderer.layers.midground.alpha = 0;

                    clearableId = setInterval(function() {
                        tagpro.zoom -= interval;

                        if ((tagpro.zoom >= zoomStop && interval <= 0) || (tagpro.zoom <= zoomStop && interval >= 0)) {
                            clearInterval(clearableId);
                            $('#viewport').fadeOut(200, function() {
                                tagpro.zoom = 1;
                                tagpro.viewport.followPlayer = true;
                                if (tagpro.playerId && tagpro.players[tagpro.playerId].sprites) tagpro.players[tagpro.playerId].sprites.name.tint = 0xFFFFFF;
                                $('#viewport').fadeIn(200);
                                if (hidePUPs && tagpro.renderer.layers.midground) tagpro.renderer.layers.midground.alpha = 1;
                                if (!actualSpectator) tagpro.spectator = false;
                            });
                        }
                    }, frequency);

                } else {
                    $('#viewport').show(0);
                }
            }, 100);

        } else if (message.state === 1) {
            clearInterval(clearableId);
            clearInterval(clearableCountdown);
            setTimeout(function() { if (tagpro.playerId && tagpro.players[tagpro.playerId].sprites) tagpro.players[tagpro.playerId].sprites.name.tint = 0xFFFFFF; }, 100);
            $('#loadingMessage').hide(0);

            if (actualSpectator === undefined) { //joined mid-game
                setTimeout(function() {
                    if (tagpro.spectator) {
                        actualSpectator = true;
                        tagpro.viewport.followPlayer = false;
                        //resizeVP(true);
                        tagpro.zoom = fullZoom;
                    } else {
                        resizeVP();
                        if (showReadyGo) showGo('Go!', '80px', 'chartreuse', 800);
                    }
                    $('#viewport').show(0);
                }, 100);

            } else {
                if (showReadyGo) showGo('Go!', '80px', 'chartreuse', 800);

                if (actualSpectator === false) {
                    tagpro.spectator = false;
                    tagpro.viewport.followPlayer = true;
                    tagpro.zoom = 1;
                } else if (actualSpectator === true && tagpro.spectator) { //we joined as a spec pre-game?
                    tagpro.viewport.followPlayer = false;
                    //tagpro.zoom = normalZoom;
                    resizeVP(true);
                } else if (actualSpectator === true && !tagpro.spectator) {
                    actualSpectator = false;
                    tagpro.viewport.followPlayer = true;
                    tagpro.zoom = 1;
                    resizeVP();
                } else {
                    tagpro.viewport.followPlayer = true;
                    tagpro.zoom = 1;
                    resizeVP();
                }

                $('#viewport').fadeIn(200);
            }
        }
    });


    if (slowZoomOutAtEnd) {
        tagpro.socket.on('end', function(data) {
            if (!actualSpectator) { // && data.from !== null
                var frequency = 20;
                var zoomStop = 1.25;
                var interval = (zoomStop - 1) / (20 * (1000 / frequency));

                setTimeout(function() {
                    if (tagpro.playerId && tagpro.players[tagpro.playerId].sprites) tagpro.players[tagpro.playerId].sprites.name.tint = 0xFF00FF;
                    tagpro.spectator = true;
                    normalZoom = normalZoom * 0.8;

                    setTimeout(function() {
                        if (tagpro.ui && tagpro.ui.sprites.spectatorInfo1) tagpro.ui.sprites.spectatorInfo1.alpha = 0;
                        if (tagpro.ui && tagpro.ui.sprites.spectatorInfo2) tagpro.ui.sprites.spectatorInfo2.alpha = 0;
                    }, 100);

                    clearableId = setInterval(function() {
                        tagpro.zoom += interval;
                        if (tagpro.zoom >= zoomStop) {
                            clearInterval(clearableId);
                        }
                    }, frequency);
                }, 1000);
            }
        });
    }

    tagpro.socket.on('map', function(message) {
        mapName = message.info.name;
        normalVPWidth = tagpro.renderer.canvas_width;
        normalVPHeight = tagpro.renderer.canvas_height;
        var mapWidth = tagpro.map.length * 40;
        var mapHeight = tagpro.map[0].length * 40;
        normalZoom = Math.max(mapWidth / normalVPWidth, mapHeight / normalVPHeight);
        fullZoom = Math.max(mapWidth / $(window).width(), mapHeight / $(window).height());
        $('#viewport').hide(0);
        $('#loadingMessage').show(0);


        //hide 'game starting soon...' alert and or replace with name of map
        //setTimeout(function() {
            var original = tagpro.ui.largeAlert;
            var r = "";

            tagpro.ui.largeAlert = function (e,t,n,r,i) {
                if (mapName && r === "Match Begins Soon...") {
                    r = mapName;
                    i = 'orange';
                }
                return original(e,t,n,r,i);
            };
        //}, 600);
    });

});
})();