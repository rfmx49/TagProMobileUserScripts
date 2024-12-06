// ==UserScript==
// @name          TagPro Player Monitor with OpenSkill
// @version       4.10
// @author        bash#, Ko, Maelstrom, black orchid
// @description   Shows an on-screen list of players in the game and their current status
// @match         game
// @namespace     https://greasyfork.org/users/152992
// @icon          https://github.com/wilcooo/TagPro-ScriptResources/raw/master/playermonitor.png
// @supportURL    https://www.reddit.com/message/compose/?to=Wilcooo
// @website       https://redd.it/6pe5e9
// @require       https://greasyfork.org/scripts/371240/code/TagPro%20Userscript%20Library.js
// @grant         GM_getValue
// @grant         GM_setValue
/* @customSettings
TPMon_SettingsObject = {
    hide_flagTaken: { value: true, description: 'Hide the default taken flag indicators' },
    hide_playerIndicators: { value: true, description: 'Hide the default team count indicators' },
    position: { value: 'bot-mid', description: 'The position preset: top-left, top-mid, top-right, mid-left, mid-right, bot-left, bot-mid, bot-right,top-split, mid-split, bot-split'},
    order: { value: 'constant', description: 'Sorting order of the players: constant, alphabetic, score, skill' },
    show_hold: { value: false, description: 'Show a timer that counts how long the FC has been holding' }
}
*/
// @license       MIT
// @downloadURL https://gist.github.com/blackkorchid/eadf5b9413ba4f8e54a3797eb9c09721/raw/tagpro_player_monitor_with_openskill.user.js
// @updateURL https://gist.github.com/blackkorchid/eadf5b9413ba4f8e54a3797eb9c09721/raw/tagpro_player_monitor_with_openskill.user.js
// @TPMUSJMURL	 https://raw.githubusercontent.com/rfmx49/TagProMobileUserScripts/refs/heads/main/repository/Player_Monitor.js

// ==/UserScript==

(function() {

//TagPro Android Create Methods for GM_setValue, GM_getValue, and GM_deleteValue,
    //Will store these values into localStorage as strings.
    var userScriptKey = "GM_TPMon";

    function GM_setValue(key, value) {
        key = userScriptKey + key;
        localStorage.setItem(key, JSON.stringify(value));
    }

    function GM_getValue(key, defaultVal) {
        key = userScriptKey + key;
        let savedValue = localStorage.getItem(key);
        if (savedValue == null) {
            savedValue = defaultVal;
        } else {
            savedValue = JSON.parse(savedValue);
        }
        return savedValue;
    }

    function GM_deleteValue(key) {
        key = userScriptKey + key;
        localStorage.removeItem(key);
    }

    function GM_addStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css.replace(/;/g, ' !important;');
        head.appendChild(style);
    }
	var GM_info = {
		script: {
			name: "Rolling 300 Timeline",
			version: "4.10",
			author: "bash#, Ko, Maelstrom, black orchid"
		}
	}

	var short_name = 'monitor';            // An alphabetic (no spaces/numbers) distinctive name for the script.
    var version = GM_info.script.version;  // The version number is automatically fetched from the metadata.
    tagpro.ready(function(){ if (!tagpro.scripts) tagpro.scripts = {}; tagpro.scripts[short_name]={version:version};});
    console.log('START: ' + GM_info.script.name + ' (v' + version + ' by ' + GM_info.script.author + ')');

    const processedPlayers = new Set();
    const buddyWinProcessedPlayers = new Set();


// Fetch OpenSkill value and store on player monitor
async function fetchOpenSkill(player) {
    if(player.monitor === undefined)
        return null;

    // Construct the URL based on whether the player is authenticated
    const username = player.name;
    let url = `https://tagpro.dev/api/pub/openskill/${encodeURIComponent(username)}`;
    if (player.auth) {
        url += "?auth=true";
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        let openskill = parseFloat(data.openskill);
        if (isNaN(openskill))
            openskill = 0;
        const openskillEntry = {
            openskill: openskill,
            timestamp: Date.now()
        };

        player.monitor.openskillEntry = openskillEntry;
        return openskill;
    } catch (error) {
        console.error('Error fetching open skill for', username, ':', error);
        return null;
    }
}

//----------------------------------------------------------------------------
// Skill Updates
//----------------------------------------------------------------------------

function getLastUpdateTimestamp() {
    const now = new Date();
    const minutes = now.getMinutes();
    const lastUpdateMinute = minutes - (minutes % 15); // Rounds down to the nearest multiple of 15
    // Create a new date object representing the last update time
    const lastUpdateTime = new Date(now);
    lastUpdateTime.setMinutes(lastUpdateMinute, 0, 0); // Set to the last update minute, 0 seconds, 0 milliseconds
    return lastUpdateTime.getTime(); // Convert to timestamp
}

function shouldUpdateOpenskill(cachedTimestamp) {
    const lastUpdateTimestamp = getLastUpdateTimestamp();
    return cachedTimestamp < lastUpdateTimestamp; // True if cached data is before the last update period
}

//-----------------------------------------------------------------------------
// Buddy Wins
//-----------------------------------------------------------------------------

async function fetchBuddyWins(otherPlayer) {
    if(otherPlayer.monitor === undefined)
        return null;

    let myPlayer = tagpro.players[tagpro.playerId];

    const baseURL = 'https://tagpro.dev/api/pub/playercompare?';
    const params = new URLSearchParams({
        p1: myPlayer.name,
        p1_auth: myPlayer.auth,
        p2: otherPlayer.name,
        p2_auth: otherPlayer.auth
    });
    const url = baseURL + params.toString();

    console.log(url);


    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // response structure:
        //   together {
        //      games,
        //      wins,
        //      winrate
        //   },
        //   against {
        //      games,
        //      wins,
        //      winrate
        //   }
        otherPlayer.monitor.buddywins = data;
        return data;
    } catch (error) {
        console.error('Error fetching buddywins for', otherPlayer.name, ':', error);
        return null;
    }
}

function getBuddyFlair(winsWith, winsAgainst) {
    if      (!winsWith || !winsAgainst)         return '';
    else if (winsWith >= 60 && winsAgainst >= 60) return '👍'; //high win with, high win against - you are a better player than them 💜🚑👍✌
    else if (winsWith >= 60 && winsAgainst <= 40) return '🔥'; //high win with, low win against - they are a better player than you 🔥⚡
    else if (winsWith <= 40 && winsAgainst <= 40) return '☢️'; //low win with, low win against - they play better against you (you suck when you're on the same team) ☢️
    else if (winsWith <= 40 && winsAgainst >= 60) return '👎'; //low win with, high win against - you play better against them (they suck) 🤔👎
    else return '🤝'; // close to 50/50, you are similarly good against each other
}



// SETTINGS (edit them on the TagPro homepage or on the scoreboard
    const show_honk = false;
    const hide_flagTaken = TPMon_SettingsObject.hide_flagTaken?.value === "true" ? true : TPMon_SettingsObject.hide_flagTaken?.value === "false" ? false : true;
    const hide_playerIndicators = TPMon_SettingsObject.hide_playerIndicators?.value === "true" ? true : TPMon_SettingsObject.hide_playerIndicators?.value === "false" ? false : true;
    const position = TPMon_SettingsObject.position?.value ?? 'bot-mid';
    const order = TPMon_SettingsObject.position?.order ?? 'constant';
    const show_hold = TPMon_SettingsObject.show_hold?.value === "true" ? true : TPMon_SettingsObject.show_hold?.value === "false" ? false : false;





// CONSTANTS

const size        = 16;     // Size of a ball icon
const space       = 18;     // Vertical space per name+icon
const textVshift  = 0;      // relative vertical shift of text
const textHLshift = -2;     // relative horizontal shift of text on the left of a ball
const textHRshift = 25;     // relative horizontal shift of text on the right of a ball

const show_ball = true;     // Whether to show the ball icon
                            //   (if you disable this, you might want to disable show_grip, show_speed, show_tagpro, show_bomb)
const show_dead = true;     // Whether to fade the ball when its dead/spawning
const show_name = true;     // Shows the playernames next to the corresponding balls (recommended)
const show_buddywins = true;// Shows the buddy wins icon next to the corresponding balls

const show_flag = true;     // Show a flag next to players with a flag
const flag_size = size;     // size of the flag icon next to an FC
const flag_x    = 10;       // Position of the flag, relative to the ball
const flag_y    = 0;

const show_grip = true;     // Show a JJ pup on balls with Juke Juice
const grip_size = 10;       // size of the Juke Juice icon
const grip_x    = -1;       // relative position
const grip_y    = 8;

const show_speed  = false;  // This won't work unless they put the topspeed pup back in the game (and even then probably not)
const speed_size  = 10;     // size of the Top Speed icon (a deprecated TagPro powerup)
const speed_x     = -1;     // relative position
const speed_y     = -3;

const show_tagpro = true;       // Show a green circle on balls with a TP
const tagpro_color = 0x00FF00;  // Color of the (usually green) TagPro powerup circle
const tagpro_thick = 1.5;       // Thickness of that circle

                                // Tip, use : https://www.google.com/search?q=pick+color

const show_bomb = true;         // Flash balls with a Rolling Bomb
const bomb_color = 0xFFFF00;    // Color of the flashing RollingBomb

const style =     // The style of the text (1: red, 2: blue)
      {
          1: {
              fontSize:        "8pt",
              fontWeight:      "bold",
              strokeThickness: 3,
              fill:            0xFFB5BD,       // text-color (Tip: https://www.google.com/search?q=pick+color)
          },
          2: {
              fontSize:        "8pt",
              fontWeight:      "bold",
              strokeThickness: 3,
              fill:            0xCFCFFF,
          },
      };

const presets = {    // 1: red team ,  2: blue team
    'top-left' : {
        1 : {  x:10, y:10,  },
        2 : {  x:10, y:10 + 5*space,  },
    },
    'mid-left' : {
        1 : {  x:10, y:-0.75*space, anchor : {x:0, y:0.5}, bottomToTop: true,  },
        2 : {  x:10, y: 0.75*space, anchor : {x:0, y:0.5},  },
    },
    'bot-left' : {
        1 : {  x:10, y:-10 - 6*space, anchor : {x:0, y:1}, bottomToTop: true,  },
        2 : {  x:10, y:-10 - space,     anchor : {x:0, y:1}, bottomToTop: true,  },
    },
    'top-mid' : {
        1 : {  x:-25, y:10, anchor : {x:0.5, y:0}, leftText: true,  },
        2 : {  x:5,   y:10, anchor : {x:0.5, y:0},  },
    },
    'bot-mid' : {
        1 : {  x:-135, y:-10 - space, anchor : {x:0.5, y:1}, bottomToTop: true, leftText: true,  },
        2 : {  x: 115, y:-10 - space, anchor : {x:0.5, y:1}, bottomToTop: true,  },
    },
    'top-right' : {
        1 : {  x:-30, y:10,             anchor : {x:1, y:0}, leftText: true,  },
        2 : {  x:-30, y:10 + 5*space, anchor : {x:1, y:0}, leftText: true,  },
    },
    'mid-right' : {
        1 : {  x:-30, y:-0.75*space, anchor : {x:1, y:0.5}, bottomToTop: true, leftText: true,  },
        2 : {  x:-30, y: 0.75*space, anchor : {x:1, y:0.5},                    leftText: true,  },
    },
    'bot-right' : {
        1 : {  x:-30, y:-10 - 6*space, anchor : {x:1, y:1}, bottomToTop: true, leftText: true,  },
        2 : {  x:-30, y:-10 - space,     anchor : {x:1, y:1}, bottomToTop: true, leftText: true,  },
    },
    'top-split' : {
        1 : {  x:10,  y:10,  },
        2 : {  x:-30, y:10, anchor : {x:1, y:0}, leftText: true, },
    },
    'mid-split' : {
        1 : {  x:10,  y:-2*space, anchor : {x:0, y:0.5},  },
        2 : {  x:-30, y:-2*space, anchor : {x:1, y:0.5}, leftText: true,  },
    },
    'bot-split' : {
        1 : {  x:10,  y:-10 - space, anchor : {x:0, y:1}, bottomToTop: true,  },
        2 : {  x:-30, y:-10 - space, anchor : {x:1, y:1}, bottomToTop: true, leftText: true,  },
    },
    'your-preset' : {             // A preset to experiment with!
                                  // Don't forget to add your-preset to the options list, search this script (ctrl+F) for LEOPARD
        1 : {  x:0, y:0,  },
        2 : {  x:0, y:0,  },
    },
};

// EXPLANATION OF THE PRESETS:
//   'x' and 'y' form the position of the player monitor
//   'anchor' is the reference point from which the 'x' and 'y' above are calculated.
//     anchors 'x' and 'y' are position of the reference point, relative to the viewport size. (so 0.5 is in the middle of the screen)
//
//   The position described above is the position of the first ball in the player monitor.
//     The next balls are usually drawn below it, but when 'bottomToTop' is true, they are drawn above the first one.
//
//   'leftText' makes the name of the ball appear on the left side of the ball.
//
//   You may add a preset to the list, and select it in the options on the homepage





var preset = presets[position] || presets["bot-mid"];   // If no valid preset is chosen, fallback to 'bot-mid'

    const flagsprite =
          {
              1: "red",      // Note: 'flag' or 'potato' gets added to this later in this script
              2: "blue",
              3: "yellow",
          };
    const ballsprite =
          {
              1: "redball",
              2: "blueball",
          };

    const honksprite = PIXI.Texture.fromImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTZEaa/1AAACiUlEQVR4Xu3bMa7bQAwG4RwkZe5/s5zBiYoAgjFFJJPL1fgvPjxgDAjksn4/Xq/XV/n989ffP/ybEUar47j/vP9mhdEqB5bLgeVyYLkcWC4HlsuB5XJguRxYLgeWy4HlcmC5HFguB5bLgW940qM9ZdbKOTFecR6mYqBOT5jzPGPFnBiveB+oYqguu894nq9qToxXdQzWYef5zrNVzojxjq4Bq+041/u7Vc6I8a7OQa263wzjJ7oHNlnxVhg/tWLwp1v1RhgrrFrgiVa+DcYqKxd5itVvgrHS6oV2NvEWGKtNLLabqTfA2GFqwR1M7o6xy+SiU6Z3xthpctkJ0/ti7Da58GrTu2IMD4zhgTE8MIYHxvDAGB4YwwNjeGAMD4zhgTE8MIYHxvDAGB4YwwNjeGAMD4zhgTE8MIYHxvDAGB4YwwNjeGAMD4zhgTHmnP/V5VPH91o+GvfQe36q5aPvg8f/o/e86/hey0djHxjDA2N4YAwPjOGBMTwwhgfG8MAYHhjDA2N4YAwPjOGBMTwwhgfG8MAYHhjDA2N4YAwPjOGBMTwwhgfG8MAYHhjDA2N4YOz2Tf/qMr0rxk7nhaeWXml6X4xd3pedWHi16Z0xdphedNLk7hirTS64i6k3wFhparEdTbwFxioTC+1u9ZtgrLB6kSdZ+TYYP7Vygada9UYYP7FqcIMVb4XxrhUD23S/GcY7ugetsONMh/d3q5wT41WdA1bZebbDeb7KOTFe0TVYtd3nO5xnrJoV4xXVA3V5woyH85wVs2K8onKYTk+Z81A5K0ajykd7EoxGObBcDiyXA8vlwHI5sFwOLJcDy+XAcjmwXA4slwPL5cByObBcDvwFvu24r9frxx9ThG6n1YCdggAAAABJRU5ErkJggg==");

    const refresh_rate = 3e3;   // An interval (milliseconds), after which the order of the playerlists gets updated.

    tagpro.ready(function () {




        // Hide the flagTaken indicators

        if (hide_flagTaken)
            tagpro.renderer.updateFlagsFromPlayer = function() {
                console.warn('The flag indicators are blocked by the TagPro Player Monitor script');
                tagpro.renderer.updateFlagsFromPlayer = ()=>0;
            };

        // Hide TagPro's new Player Indicators

        if (hide_playerIndicators) {
            tagpro.ui.updatePlayerIndicators = function() {
                console.warn('The player indicators are blocked by the TagPro Player Monitor script');
                tagpro.ui.updatePlayerIndicators = ()=>0;
            };
        }


        // This function returns a summary of a player.
        // To be used to check whether something has changed.

        function getPlayer(player) {

            var state = {
                team: player.team,
                id:   player.id,
            };

            if (show_name)   state.name      = player.name;
            if (show_dead)   state.dead      = player.dead;
            if (show_flag)   state.flag      = player.flag;
            if (show_bomb)   state.bomb      = player.bomb;
            if (show_tagpro) state.tagpro    = player.tagpro;
            if (show_grip)   state.grip      = player.grip;
            if (show_speed)  state.speed     = player.speed;
            if (show_honk)   state.isHonking = player.isHonking;

            return state;
        }

        // Create PIXI containers for both player lists

        var redList = new PIXI.Container();
        tagpro.renderer.layers.ui.addChild(redList);

        var blueList = new PIXI.Container();
        tagpro.renderer.layers.ui.addChild(blueList);

        var teamLists =
            {
                1: redList,
                2: blueList,
            };

        tagpro.ui.sprites.redPlayerMonitor = redList;
        tagpro.ui.sprites.bluePlayerMonitor = blueList;


        // This function gets called when the browser window resizes
        // It moves the playerlists to the right location

        var org_alignUI = tagpro.ui.alignUI;
        tagpro.ui.alignUI = function() {
            redList.x = ( preset[1].anchor ? (tagpro.renderer.vpWidth * preset[1].anchor.x) : 0 ) + preset[1].x;
            redList.y = ( preset[1].anchor ? (tagpro.renderer.vpHeight * preset[1].anchor.y) : 0 ) + preset[1].y;
            blueList.x = ( preset[2].anchor ? (tagpro.renderer.vpWidth * preset[2].anchor.x) : 0 ) + preset[2].x;
            blueList.y = ( preset[2].anchor ? (tagpro.renderer.vpHeight * preset[2].anchor.y) : 0 ) + preset[2].y;

            // Move a few pixels down when overlapping with the FPS/ping
            if (tagpro.settings.ui.performanceInfo && ['top-left','top-split'].includes(position)) {
                redList.y += 20
                blueList.y += 20
            }
            org_alignUI();
        };

        tagpro.ui.alignUI();

        function format_time(seconds=0) { // example: 179 seconds will return (2:59)
            var minutes = Math.floor(seconds / 60),
                seconds = ("0" + seconds % 60).slice(-2)
            return " (" + minutes + ":" + seconds + ") "
        }

        // The rolling_bomb graphics are stored here, so that they can be updated (animated) seperately
        if (show_bomb) {
            var rolling_bombs = {};

            // Rewriting the TagPro's ui.update function to include the rendering of the RBs
            tagpro.ui.org_update = tagpro.ui.update;
            tagpro.ui.update = function () {
                for (var b in rolling_bombs) {
                    rolling_bombs[b].alpha = (show_dead && tagpro.players[b] && tagpro.players[b].dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150));
                }
                return tagpro.ui.org_update(...arguments)
            };
        }

        var hold_update_functions = {};

        function fetchAndUpdateAllPlayerSkills() {
            Object.values(tagpro.players).forEach( player => {
                fetchOpenSkill(player).then( openskill => {
                    drawPlayer(player);
                    orderTeamList(player.team);
                    console.log(`Fetched skill for player ${player.name}: ${skill}`);
                });
            });
        }

        function checkAndUpdatePlayerSkills() {
            const minutes = new Date().getMinutes();
            const updateTimes = [1, 16, 31, 46];
            if( updateTimes.includes(minutes) ) {
                fetchAndUpdateAllPlayerSkills();
            }
        }

        function fetchSkillIfNeeded(player) {
            // Check if the player has already been processed
            if (processedPlayers.has(player.name) || player.monitor === undefined) return; // Skill fetch already initiated, so skip
            processedPlayers.add(player.name);

            // Initiate skill fetch for the player
            fetchOpenSkill(player).then(skill => {
                if (player.monitor !== undefined && player.monitor.openskillEntry !== undefined) {
                    if (skill !== null) {
                    drawPlayer(player);
                    orderTeamList(player.team);
                    console.log(`Fetched skill for player ${player.name}: ${skill}`);
                    } else {
                        console.error(`Failed to fetch skill for player ${player.name}`, error);
                        processedPlayers.remove(player.name);
                    }
                }
            }).catch(error => {
                processedPlayers.remove(player.name);
                console.error(`Failed to fetch skill for player ${player.name}`, error);
            });
        }

        function fetchBuddyWinsIfNeeded(player) {
            // Check if the player has already been processed
            if (player.id === tagpro.playerId) return; // ignore my player
            if (buddyWinProcessedPlayers.has(player.name) || player.monitor === undefined) return; // Skill fetch already initiated, so skip
            buddyWinProcessedPlayers.add(player.name);

            // Initiate skill fetch for the player
            fetchBuddyWins(player).then(buddywins => {
                if (player.monitor !== undefined && player.monitor.buddywins !== undefined) {
                    if (buddywins !== null) {
                    drawPlayer(player);
                    orderTeamList(player.team);
                    console.log(`Fetched buddy wins for player ${player.name}`);
                    } else {
                        console.error(`Failed to fetch buddy wins for player ${player.name}`, error);
                        buddyWinProcessedPlayers.remove(player.name);
                    }
                }
            }).catch(error => {
                buddyWinProcessedPlayers.remove(player.name);
                console.error(`Failed to fetch buddy wins for player ${player.name}`, error);
            });
        }


        // Update a single player

        function drawPlayer(player) {

            if (typeof player.monitor === 'undefined') {
                player.monitor = new PIXI.Container();
                player.monitor.hold_time = null;
            }

            player.monitor.removeChildren();

            // Draw ball
            if (show_ball) tagpro.tiles.draw(player.monitor, ballsprite[player.team], { x: 0, y: 0 }, size, size, player.dead ? 0.5 : 1);

            // Draw bomb (rolling bomb)
            if (show_bomb && player.bomb) {
                var bomb = new PIXI.Graphics();
                bomb.beginFill(bomb_color, (player.dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150)) );
                bomb.drawCircle(size/2, size/2, size/2);

                player.monitor.addChild(bomb);

                rolling_bombs[player.id] = bomb;
            } else if (show_bomb) delete rolling_bombs[player.id];

            // Draw tagpro
            if (show_tagpro && player.tagpro) {
                var tp = new PIXI.Graphics();
                tp.lineStyle(tagpro_thick, tagpro_color, player.dead ? 0.5 : 1 );
                tp.drawCircle(size/2, size/2, size/2);

                player.monitor.addChild(tp);
            }

            // Draw honk
            if (show_honk && player.isHonking) {
                var honk = new PIXI.Sprite(honksprite);
                honk.width  = honksprite.width  * (size/40);
                honk.height = honksprite.height * (size/40);
                honk.x = ( -honk.width  + size ) / 2;
                honk.y = ( -honk.height + size ) / 2;

                player.monitor.addChild(honk);
            }

            // Draw grip (juke juice)
            if (show_grip && player.grip) {
                tagpro.tiles.draw(player.monitor, 'grip' , { x: grip_x, y: grip_y }, grip_size, grip_size, show_dead && player.dead ? 0.5 : 1);
            }

            // Draw speed (a deprecated powerup)
            if (show_speed && player.speed) {
                tagpro.tiles.draw(player.monitor, 'speed' , { x: speed_x, y: speed_y }, speed_size, speed_size, show_dead && player.dead ? 0.5 : 1);
            }
            let myPlayer = tagpro.players[tagpro.playerId];

            // Check if player is a someball. We don't want to show buddywins for Some Balls
            let someBallRegex = /^Some Ball \d+$/;
            let isSomeBall = someBallRegex.test(player.name) && !player.auth;

            if (show_buddywins && player.monitor.buddywins !== undefined && player.name !== myPlayer.name && !isSomeBall) {
                let totalGames = player.monitor.buddywins.together.games + player.monitor.buddywins.against.games;
                if (totalGames > 5) {
                    let winrateTogether = player.monitor.buddywins.together.winrate;
                    let winrateAgainst = player.monitor.buddywins.against.winrate;
                    let flair = getBuddyFlair(winrateTogether, winrateAgainst);
                    if (flair !== "") {
                        var buddyFlair = new PIXI.Text(flair, style[player.team]);
                        buddyFlair.interactive = true;

                        if (preset[player.team].leftText)   buddyFlair.x = textHLshift - buddyFlair.width;
                        else                                buddyFlair.x = textHRshift;

                        buddyFlair.y     = textVshift;

                        let tooltip = new PIXI.Text('', style[player.team]);
                        tooltip.visible = false; // Initially hidden
                        tagpro.renderer.layers.ui.addChild(tooltip);

                        buddyFlair.on('mouseover', (event) => {
                            let winrateText = player.team === myPlayer.team ? `${winrateTogether}%` : `${winrateAgainst}%`;

                            tooltip.text = winrateText;
                            tooltip.x = event.data.global.x;
                            tooltip.y = event.data.global.y - tooltip.height - 5;
                            tooltip.visible = true;
                        });

                        buddyFlair.on('mouseout', () => {
                            tooltip.visible = false;
                        });

                        player.monitor.addChild(buddyFlair);
                    }
                }
            }

            // Draw name
            if (show_name) {
                var name = new PIXI.Text(player.name, style[player.team]);

                if (preset[player.team].leftText)   name.x = textHLshift - name.width - (buddyFlair ? buddyFlair.width:0);
                else                                name.x = textHRshift + (buddyFlair ? buddyFlair.width:0);

                name.y     = textVshift;
                name.alpha = (show_dead && player.dead) ? 0.5 : 1;

                player.monitor.addChild(name);

                if (player.monitor.openskillEntry !== undefined) {
                    const openskill = player.monitor.openskillEntry.openskill;
                    var openskillText = new PIXI.Text(` (${openskill.toFixed(2)})`, style[player.team]);
                    if (preset[player.team].leftText) {
                        // Position to the left of the ball icon, adjusting for the existing name's width if needed
                        openskillText.x = textHLshift - openskillText.width - name.width - (buddyFlair ? buddyFlair.width:0) - 2;
                    } else {
                        openskillText.x = textHRshift + name.width + (buddyFlair ? buddyFlair.width:0);
                    }
                    openskillText.y = textVshift;
                    player.monitor.addChild(openskillText);
                }
            }

            // Draw flag/potato
            if (show_flag && player.flag && !player.dead) {
                tagpro.tiles.draw(player.monitor, flagsprite[player.flag]+(player.potatoFlag ? 'potato':'flag') , { x: flag_x, y: flag_y }, flag_size, flag_size);

                // Draw hold time
                if (show_hold) {

                    var hold = new PIXI.Text(format_time(player.monitor.hold_time), style[player.team])

                    if (preset[player.team].leftText)   hold.x = textHLshift - hold.width - (name ? name.width + openskillText.width:0) - (buddyFlair ? buddyFlair.width:0);
                    else                                hold.x = textHRshift + (name ? name.width + openskillText.width:0) + (buddyFlair ? buddyFlair.width:0);

                    hold.y = textVshift;
                    hold.alpha = (show_dead && player.dead) ? 0.5 : 1;

                    player.monitor.addChild(hold)

                    // Update the hold time every second

                    player.monitor.update_hold = function(t){
                        if (!(player.id in tagpro.players)) return
                        if (tagpro.state == 2) return

                        hold.text = format_time(++player.monitor.hold_time)
                        if (preset[player.team].leftText) hold.x = textHLshift - hold.width - (name ? name.width + openskillText.width:0) - (buddyFlair ? buddyFlair.width:0)

                        setTimeout( player.monitor.update_hold, 1000 - (Date.now()-t)%1000, t )
                    }

                    if (player.monitor.hold_time == null) {
                        setTimeout( player.monitor.update_hold, 1000, Date.now()%1000 )
                    }
                }
            } else {
                player.monitor.hold_time = null
                player.monitor.update_hold = ()=>{}
            }

        }






        // Update either the red or blue list

        function orderTeamList(team) {

            var teamList = teamLists[team];

            teamList.removeChildren();

            var teamPlayers = [];

            for (let p in tagpro.players) {

                let player = tagpro.players[p];

                if (player.team != team)    continue;

                if (!player.monitor) {
                    drawPlayer(player);
                }

                teamPlayers.push(player);
            }


            if (preset[team].bottomToTop) var sign = -1
            else var sign = 1

            switch (order) {
                case 'score':
                    teamPlayers.sort( (p1,p2) => sign * ( p2.score - p1.score ) );
                    // This sorts the teamPlayers list based on the .score of every player (desc.)
                    break;
                case 'alphabetic':
                    teamPlayers.sort( (p1,p2) => sign * ( p1.name.toLowerCase() > p2.name.toLowerCase() || -(p1.name.toLowerCase() < p2.name.toLowerCase()) ) );
                    // This sorts the teamPlayers list based on the .score of every player (asc.)
                    break;
                case 'skill':
                        teamPlayers.sort( (p1,p2) => {
                            const skill1 = p1.monitor.openskillEntry ? p1.monitor.openskillEntry.openskill : 0;
                            const skill2 = p2.monitor.openskillEntry ? p2.monitor.openskillEntry.openskill : 0;
                            return sign * ( skill2 - skill1 );
                        });
                    break;
                default:
                    // When something else, or 'constant' is chosen, the order of player id's is conserved
                    // which is the order that they joined the game.
            }

            var count = 1;
            let totalSkill = 0;
            teamPlayers.forEach(item => totalSkill += item.monitor.openskillEntry ? item.monitor.openskillEntry.openskill : 0);
            let averageSkill = teamPlayers.length > 0 ? (totalSkill / teamPlayers.length).toFixed(2) : "N/A";

            // Create average skill text
            let avgSkillTextStyle = new PIXI.TextStyle(style[team]); // Ensure style is defined
            let teamAverageSkillText = new PIXI.Text(`${averageSkill}`, avgSkillTextStyle) ;

            // Positioning average skill text
            if (preset[team].leftText) {
                teamAverageSkillText.x = -teamAverageSkillText.width + size; // Align left with the players
            } else {
                // Align right based on the updated teamList width
                teamAverageSkillText.x = 0;
            }
            teamAverageSkillText.y = 0;

            for (let player of teamPlayers) {
                teamList.addChild(player.monitor);
                player.monitor.y = sign * space * (count++);
            }
            teamList.addChild(teamAverageSkillText);
            teamAverageSkillText.y = sign * space * count;
        }


        tagpro.socket.on("p", function(data) {
            if (data instanceof Array) {
                let player = tagpro.players[data[0].id];
                if (player.monitor !== undefined) {
                    fetchSkillIfNeeded(player);
                    fetchBuddyWinsIfNeeded(player);
                }

                drawPlayer(player);
                //orderTeamList(player.team);
                return;
            }

            for (var p in data.u) {
                let player = tagpro.players[data.u[p].id];
                if (player.monitor !== undefined) {
                    fetchSkillIfNeeded(player);
                    fetchBuddyWinsIfNeeded(player);
                }

                var old_json = player.json;
                player.json = JSON.stringify(getPlayer(player));
                if (player.json != old_json) {
                    drawPlayer(player);
                }
            }
        });

        // When tagpro receives a playerLeft event, it deletes the player.
        // We want to know what team the player was on so we can update only the necessary teamlist.
        // So instead of using tagpro.socket.on, we use a trick to insert our listener
        // BEFORE all other listeners for the playerLeft event.
        tagpro.rawSocket.listeners('playerLeft').unshift( function(data) {
            let player = tagpro.players[data]; // < now we know for sure that the player still exists!
            //delete player.monitor;
            setTimeout(orderTeamList(player.team)) // update the teamlist AFTER TagPro has removed the player
        } )

        /*tagpro.socket.on('playerLeft', function(p) {
            orderTeamList(1); orderTeamList(2);
        }*/

        org_drawHonk = tagpro.drawHonk || (() => 0);
        tagpro.drawHonk = function(player, remove) {
            org_drawHonk(player, remove);
            drawPlayer(player);
        };

        // Just in case "something" happens, we update the teamlists every once in a while.
        setInterval(function() {orderTeamList(1); orderTeamList(2);}, refresh_rate);

        // Check the time every minute and update player skills if an update time has passed (15, 30, 45, 60)
        setInterval(checkAndUpdatePlayerSkills, 60000);
    });

})();