// ==UserScript==
// @name            Nabby's Scoreboard Enhancer
// @version         1.2.0
// @description     Adds multiple features and functionality to the game scoreboard
//                  - Note: TableScroll & Column Sort have been removed from this version of Scoreboard Enhancer
// @include         https://tagpro.koalabeast.com/game
// @include         https://tagpro.koalabeast.com/game?*
// @include         http://tagpro-maptest.koalabeast.com:*
// @match           game
/* @customSettings
NSE_SettingsObject = {
    onlyShowTeamStatsAtEOG: { value: true, description: 'if false Team Stats will update and show whenever the scoreboard is open' },
    useMinimumPopsAndDrops: { value: true, description: 'highlight the *lowest* values for Pops & Drops (only applies to Team Stats)' },
    showMyScoreboardPositions: { value: true, description: 'show My Scoreboard Positions on the scoreboard during the match' },
    showOverallPicture: { value: true, description: 'show Overall Picture on the scoreboard during the match' },
    showTripleDoubles: { value: true, description: 'highlight players who get a Triple Double at the end of the game' },
    showHatricks: { value: true, description: 'highlight players who get a Hatrick at the end of the game (3+ Caps)' },
    showComeback: { value: true, description: 'show a Comeback! message at the end of the game if it was a come-from-behind win.' },
    showCapsTimeline: { value: true, description: 'show a timeline of the caps at the end of the game' },
    showDegrees: { value: true, description: 'show player degrees next to their name (when they have stats on)' },
    showtimePlayed: { value: true, description: 'show player time next to their name (only if we played the whole game)' },
    showBuddyWins: { value: false, description: 'show wins when playing With and Against other players [default: false]' },
    buddyWinsAuthOnly: { value: false, description: 'only show for authenticated (green name) players [default: false]' },
    buddyWinsIgnoreSomeBalls: { value: true, description: 'ignore Some Balls [default: true]' },
    buddyWinsMinimumGameTime: { value: 20, description: 'minimum game time % before that player\'s data will save [default: 20]' },
    buddyWinsMinimumGames: { value: 1, description: 'number of games before the win % will show (0 for all) [default: 1]' },
    showKD: { value: true, description: 'replaces the Rank Pts column with K/D (only updated when the scoreboard is open)' },
    showHG: { value: true, description: 'replaces the Report column with Hold/Grab (only updated when the scoreboard is open)' },
    onlyShowKDatEOG: { value: true, description: 'only show the K/D column at the End of Game (and only if showKD is true)' },
    onlyShowHGatEOG: { value: true, description: 'only show the H/G column at the End of Game (and only if showHG is true)' },
    redTeamColor: { value: 'rgba(255, 0, 0, .35)', description: 'default \'rgba(255, 0, 0, .35)\'' },
    blueTeamColor: { value: 'rgba(20, 50, 200, .50)', description: 'default \'rgba(20, 50, 200, .50)\'' },
    scoreboardWidth: { value: 920, description: 'game default is 860' }
}
*/
// @updateURL       https://gist.github.com/nabbynz/e9547412adc90e4b45aee1498956f78f/raw/Nabbys_Scoreboard_Enhancer.user.js
// @downloadURL     https://gist.github.com/nabbynz/e9547412adc90e4b45aee1498956f78f/raw/Nabbys_Scoreboard_Enhancer.user.js
// @TPMUSJMURL	 	https://raw.githubusercontent.com/rfmx49/TagProMobileUserScripts/refs/heads/main/repository/Nabbys_Scoreboard_Enhancer.user.js

// @grant           GM_addStyle
// @grant           GM_getValue
// @grant           GM_setValue
// @author          Some Ball -1, thevdude, nabby
// ==/UserScript==


(function() {
    //TagPro Android Create Methods for GM_setValue, GM_getValue, and GM_deleteValue,
    //Will store these values into localStorage as strings.
    var userScriptKey = "GM_NSE";

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
            name: "Nabby's Scoreboard Enhancer",
            version: "1.2.0",
            author: "Some Ball -1, thevdude, nabby"
        }
    }

    console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');


tagpro.ready(function() {
    //----- Options -----
    const redTeamColor = NSE_SettingsObject.redTeamColor?.value ?? "rgba(255, 0, 0, .35)";
    const blueTeamColor = NSE_SettingsObject.blueTeamColor?.value ?? "rgba(20, 50, 200, .50)";
    const scoreboardWidth = Number(NSE_SettingsObject.scoreboardWidth?.value ?? 920);
    const onlyShowTeamStatsAtEOG = NSE_SettingsObject.onlyShowTeamStatsAtEOG?.value === "true" ? true : NSE_SettingsObject.onlyShowTeamStatsAtEOG?.value === "false" ? false : true;
    const useMinimumPopsAndDrops = NSE_SettingsObject.useMinimumPopsAndDrops?.value === "true" ? true : NSE_SettingsObject.useMinimumPopsAndDrops?.value === "false" ? false : true;
    const showMyScoreboardPositions = NSE_SettingsObject.showMyScoreboardPositions?.value === "true" ? true : NSE_SettingsObject.showMyScoreboardPositions?.value === "false" ? false : true;
    const showOverallPicture = NSE_SettingsObject.showOverallPicture?.value === "true" ? true : NSE_SettingsObject.showOverallPicture?.value === "false" ? false : true;
    const showTripleDoubles = NSE_SettingsObject.showTripleDoubles?.value === "true" ? true : NSE_SettingsObject.showTripleDoubles?.value === "false" ? false : true;
    const showHatricks = NSE_SettingsObject.showHatricks?.value === "true" ? true : NSE_SettingsObject.showHatricks?.value === "false" ? false : true;
    const showComeback = NSE_SettingsObject.showComeback?.value === "true" ? true : NSE_SettingsObject.showComeback?.value === "false" ? false : true;
    const showCapsTimeline = NSE_SettingsObject.showCapsTimeline?.value === "true" ? true : NSE_SettingsObject.showCapsTimeline?.value === "false" ? false : true;
    const showDegrees = NSE_SettingsObject.showDegrees?.value === "true" ? true : NSE_SettingsObject.showDegrees?.value === "false" ? false : true;
    const showtimePlayed = NSE_SettingsObject.showtimePlayed?.value === "true" ? true : NSE_SettingsObject.showtimePlayed?.value === "false" ? false : true;
    const showBuddyWins = NSE_SettingsObject.showBuddyWins?.value === "true" ? true : NSE_SettingsObject.showBuddyWins?.value === "false" ? false : false;
    const buddyWinsAuthOnly = NSE_SettingsObject.buddyWinsAuthOnly?.value === "true" ? true : NSE_SettingsObject.buddyWinsAuthOnly?.value === "false" ? false : false;
    const buddyWinsIgnoreSomeBalls = NSE_SettingsObject.buddyWinsIgnoreSomeBalls?.value === "true" ? true : NSE_SettingsObject.buddyWinsIgnoreSomeBalls?.value === "false" ? false : true;
    const buddyWinsMinimumGameTime = Number(NSE_SettingsObject.buddyWinsMinimumGameTime?.value ?? 20);
    const buddyWinsMinimumGames = Number(NSE_SettingsObject.buddyWinsMinimumGames?.value ?? 1);
    const showKD = NSE_SettingsObject.showKD?.value === "true" ? true : NSE_SettingsObject.showKD?.value === "false" ? false : true;
    const showHG = NSE_SettingsObject.showHG?.value === "true" ? true : NSE_SettingsObject.showHG?.value === "false" ? false : true;
    const onlyShowKDatEOG = NSE_SettingsObject.onlyShowKDatEOG?.value === "true" ? true : NSE_SettingsObject.onlyShowKDatEOG?.value === "false" ? false : true;
    const onlyShowHGatEOG = NSE_SettingsObject.onlyShowHGatEOG?.value === "true" ? true : NSE_SettingsObject.onlyShowHGatEOG?.value === "false" ? false : true;


    //$('#options').css('background-color', 'rgba(0,0,0, 0.4)'); //slightly more transparent (default is 0.5)
    $('#options').css('border-radius', '8px'); //prettier?
    //$('.social-link').hide(0); //hide the social media links
    //$('#optionsAd').hide(0); //hide the advertisement
    $('#options').css({ 'box-shadow':'-10px 5px 20px black, 10px 5px 20px black' }); //add a shadow to the whole scoreboard
    GM_addStyle('#stats td { text-shadow: 1px 1px 2px black; }'); //add a shadow to the scoreboard text

    //--- End of Options ---


    tagpro.renderer.centerView = function() {
        let viewport = $('#viewport'),
            options = $("#options"),
            height = $(window).height(),
            width = $(window).width();

        viewport.css({
            position: 'absolute',
            left: (width - viewport.outerWidth()) / 2,
            top: (height - viewport.outerHeight()) / 2
        });

        let top = viewport.position().top + 130;
        options.css({
            position: 'absolute',
            left: (width - options.width()) / 2,
            top: top
        });

        tagpro.ui.resize(viewport.width(), viewport.height());
        tagpro.renderer.vpWidth = viewport.width();
        tagpro.renderer.vpHeight = viewport.height();
        tagpro.chat.resize();
    };

    let alwaysShowKDHG = showKD && !onlyShowKDatEOG || showHG && !onlyShowHGatEOG;
    let showKDHGatEOG = showKD && onlyShowKDatEOG || showHG && onlyShowHGatEOG;

    setTimeout(function() {
        let pos = tagproConfig.gameSocket.indexOf(':');
        let serverName = tagproConfig.gameSocket.substring(0, pos).replace('tagpro-', '').replace('.koalabeast.com', '');;
        let serverPort = tagproConfig.gameSocket.slice(-4);
        let gameId = tagproConfig.gameId;

        $('#stats').css({ 'margin':'10px 0' });
        $('#options').prepend('<div id="NSE_HeaderContainer" style="display:flex; flex-flow:row nowrap;">' +
                              '    <div id="NSE_MapNameContainer" style="width:35%; font-size:13px; font-weight:normal; text-shadow:1px 1px 1px black;"></div>' +
                              '    <div id="NSE_MessageContainer" style="width:30%; justify-self:center; text-align:center;"></div>' +
                              '    <div id="NSE_PostGameContainer" style="width:35%; text-align:right; font-size:12px; color:#ddd; text-shadow:1px 1px 1px black;"></div>' +
                              '</div>');
        $('#mapInfo').prev('div').remove();
        $('#NSE_MapNameContainer').append( $('#mapInfo') );
        $('#NSE_MapNameContainer').append( $('#musicInfo') );
        $('#NSE_MapNameContainer').append('<div>Server: <span style="text-transform:capitalize;">' + serverName + '</span>:' + serverPort + ' (GID: ' + gameId + ')</div>');
        $('#mapInfo').css('margin-bottom', '0px');

        $('#stats th').eq(3).text('Pops');
        $('#stats th').eq(11).text('PUPs');

        if (alwaysShowKDHG) {
            if (showKD) $('#stats th').eq(12).text('K/D');
            if (showHG) $('#stats th').eq(13).text('H/G');
        }

        tagpro.renderer.largeText = function(text, color1='#cccccc', color2='#ffffff', size=54, dropShadowBlur=true) {
            return new PIXI.Text(text, {
                dropShadow: dropShadowBlur,
                dropShadowAlpha: 0.6,
                dropShadowAngle: 0,
                dropShadowBlur: 10,
                dropShadowDistance: 0,
                dropShadowColor: color1,
                fill: [color2, color1],
                fontSize: size,
                fontWeight: "bold",
                letterSpacing: 1,
                padding: 10,
                strokeThickness: 2
            });
        };

        tagpro.ui.largeAlert = function(e, t, n, text, color1, color2='#ffffff', top=50, size=54, dropShadowBlur=true) {
            let s = tagpro.renderer.largeText(text, color1, color2, size, dropShadowBlur);
            s.x = Math.round(t.x - s.width / 2);
            s.y = top;
            e.addChild(s);
            return s;
        };
    }, 1500);



    /***********************************/
    /******* Scoreboard Enhancer *******/
    /***********************************/

    if ($('#options').css('width') === '860px' && scoreboardWidth !== 860) {
        $('#options').css('width', scoreboardWidth+'px');
        tagpro.renderer.centerView();
    }

    let cats = $('#stats').children().eq(0).find('th'); //grab column headers
    let order = ['name','score','s-tags','s-pops','s-grabs','s-drops','s-hold','s-captures','s-prevent','s-returns','s-support','s-powerups','points'];
    let sorted = [];

    for (let i=0; i<cats.length; i++) { //setup column names and ids
        let col = cats.eq(i);
        col.attr('id', i);
        if (!col.attr('name')) col.attr('name', order[i]);
    }

    tagpro.events.register({
        sortPlayers: function(players) {
            sorted = $.extend([], players);
        },

        modifyScoreUI: function() {
            let current;
            let max = [];

            //find the maximum values in each column...
            for (let i=0; i<sorted.length; i++) { //player
                for (let j=0; j<cats.length-3; j++) { //for each element that can be highlighted (-1 so no name, -2 no report, -3 no rank pts)
                    if (!max[j]) {
                        max[j] = [i];
                    } else {
                        if (sorted[i][cats.eq(j+1).attr('name')] > sorted[max[j][0]][cats.eq(j+1).attr('name')]) {
                            max[j] = [i];
                        } else if (sorted[i][cats.eq(j+1).attr('name')] === sorted[max[j][0]][cats.eq(j+1).attr('name')]) {
                            max[j].push(i);
                        }
                    }
                }
            }

            //highlight the correct cell/s in each column...
            for (let i=0; i<max.length; i++) {
                if (max[i].length !== sorted.length) { //don't highlight if everyone has max value
                    current = $('.template').next();
                    for (let j=0; j<sorted.length; j++) {
                        if (max[i].indexOf(j) > -1) {
                            current.children().eq(i+1).css('background-color', sorted[j].team === 1 ? redTeamColor : blueTeamColor);
                        } else {
                            current.children().eq(i+1).css('background-color', 'none');
                        }
                        current = current.next();
                    }
                }
            }

            //highlight the row we are positioned at...
            current = $('.template').next();
            for (let i=0; i<sorted.length; i++) {
                if (sorted[i].id === tagpro.playerId) {
                    current.children().eq(0).css({'border-left': '1px solid white'});
                } else {
                    current.children().eq(0).css({'border-left': 'none'});
                }
                current = current.next();
            }


            //changes the "Rank Pts" column into K/D, and "Report" to Hold/Grab
            if (alwaysShowKDHG || tagpro.state === 2 && showKDHGatEOG) {
                current = $('.template').next();
                let maxKD = -999, maxHG = -999;
                let maxKDs = [], maxHGs = [];

                if (showHG) {
                    $('#stats .kick').hide();
                    $('#stats .NSE_HoldGrab').remove();
                }

                for (let i=0; i<sorted.length; i++) {
                    if (showKD) {
                        let thisKD = (sorted[i]['s-tags'] / (sorted[i]['s-pops'] || 1)).toFixed(2);
                        if (+thisKD > maxKD) {
                            maxKDs = [];
                            maxKD = +thisKD;
                        }
                        if (+thisKD === maxKD) maxKDs.push(i);
                        current.children().eq(12).text(thisKD);
                    }

                    if (showHG) {
                        let thisHG = (sorted[i]['s-hold'] / (sorted[i]['s-grabs'] || 1)).toFixed(2);
                        if (+thisHG > maxHG) {
                            maxHGs = [];
                            maxHG = +thisHG;
                        }
                        if (+thisHG === maxHG) maxHGs.push(i);
                        current.children().eq(13).prepend('<span class="NSE_HoldGrab">' + thisHG + '</span>');
                    }

                    current = current.next();
                }

                current = $('.template').next();
                for (let i=0; i<sorted.length; i++) {
                    if (showKD) {
                        if (maxKDs.indexOf(i) >= 0) current.children().eq(12).css('background-color', sorted[i].team === 1 ? redTeamColor : blueTeamColor);
                        else current.children().eq(12).css('background-color', 'none');
                    }

                    if (showHG) {
                        if (maxHGs.indexOf(i) >= 0) current.children().eq(13).css('background-color', sorted[i].team === 1 ? redTeamColor : blueTeamColor);
                        else current.children().eq(13).css('background-color', 'none');
                    }

                    current = current.next();
                }
            }

        }
    });



    /*********************************/
    /******* TagPro Team Stats *******/
    /*********************************/
    let allPlayers = new Map();
    let teamStatsKeys = new Set(["score", "s-tags", "s-pops", "s-grabs", "s-drops", "s-hold", "s-captures", "s-prevent", "s-returns", "s-support", "s-powerups"]);
    let lastNameWidth = 110; //will be changed if necessary
    let clearable_TeamStats;

    let trackPlayers = function() {
        let now = Date.now();

        for (const id in tagpro.players) {
            if (!tagpro.players.hasOwnProperty(id)) {
                //alert('YAY SAVED A BUG IN NSE :)'); //this never seems to occur - please lmk if it does!
                console.log('YAY SAVED A BUG IN NSE :)'); //this never seems to occur - please lmk if it does!
                continue;
            }

            let tpP = tagpro.players[id];
            let value = {
                'firstseen': allPlayers.has(+id) ? allPlayers.get(+id).firstseen : now,
                'lastseen': now, //to track leavers (but only the last time someone leaves)
                'name': tpP.name, //for name changes
                'team': tpP.team, //for switches
                'degree': tpP.degree, //for total team degrees
                'score': tpP['score'],
                's-tags': tpP['s-tags'],
                's-pops': tpP['s-pops'],
                's-grabs': tpP['s-grabs'],
                's-drops': tpP['s-drops'],
                's-hold': tpP['s-hold'],
                's-captures': tpP['s-captures'],
                's-prevent': tpP['s-prevent'],
                's-returns': tpP['s-returns'],
                's-support': tpP['s-support'],
                's-powerups': tpP['s-powerups']
            };

            allPlayers.set(+id, value);

        }
    };

    let teamStatsTable = '<table id="NSE_TeamStats"><thead><tr><th style="width:110px; font-weight:normal;"></th><th>Score</th><th>Tags</th><th>Pops</th><th>Grabs</th><th>Drops</th><th>Hold</th><th>Captures</th><th>Prevent</th><th>Returns</th><th>Support</th><th>PUPs</th><th style="width:70px;" title="Tags/Pop">K/D</th><th style="width:50px;" title="Hold/Grab">H/G</th></tr></thead>' +
        '<tbody><tr class="redStats"><td class="scoreName" style="color:#FFB5BD; text-align:center;">Red</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>00:00</td><td>0</td><td>00:00</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>' +
        '<tr class="blueStats"><td class="scoreName" style="color:#CFCFFF; text-align:center;">Blue</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>00:00</td><td>0</td><td>00:00</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></tbody></table>';

    $('#stats').after(teamStatsTable);
    $('.redStats').css('background', 'rgba(50, 50, 50, .3)');
    $('.blueStats').css('background', 'rgba(50, 50, 50, .3)');

    let columns = ["", "score", "s-tags", "s-pops", "s-grabs", "s-drops", "s-hold", "s-captures", "s-prevent", "s-returns", "s-support", "s-powerups", "kd", "hg"];
    let alignColumns = function() {
        for (let i = 0; i < columns.length; i++) {
            let width = cats.eq(i).width();
            $('#NSE_TeamStats th').eq(i).css('width', width);
        }
    };

    GM_addStyle('#NSE_TeamStats { margin:20px auto; border:1px solid black; background:rgba(50,50,50, 0.6); overflow:hidden; }');
    GM_addStyle('#NSE_TeamStats thead { color:white; background:rebeccapurple; }');
    GM_addStyle('#NSE_TeamStats td { border:1px solid black; }');
    GM_addStyle('#NSE_TeamStats td.NSE_TS_RedMax { background:' + redTeamColor + '; }');
    GM_addStyle('#NSE_TeamStats td.NSE_TS_BlueMax { background:' + blueTeamColor + '; }');
    GM_addStyle('#NSE_TeamStats td { text-shadow: 1px 1px 1px black; }');

    if (onlyShowTeamStatsAtEOG) $('#NSE_TeamStats').hide();

    let redTeamStats = new Map();
    let blueTeamStats = new Map();

    let updateTeamStats = function() {
        for (const stat of teamStatsKeys) {
            redTeamStats.set(stat, 0);
            blueTeamStats.set(stat, 0);
        }

        for (const [id, player] of allPlayers) {
            let targetStats = player.team === 1 ? redTeamStats : blueTeamStats;

            for (const stat of teamStatsKeys) {
                if (stat === 'score' && !tagpro.players.hasOwnProperty(id)) {
                    //don't add 'score' for players that have left
                } else {
                    targetStats.set(stat, targetStats.get(stat) + player[stat]);
                }
            }
        }

        redTeamStats.set('kd', (redTeamStats.get('s-tags') / (redTeamStats.get('s-pops') || 1)).toFixed(2) );
        blueTeamStats.set('kd', (blueTeamStats.get('s-tags') / (blueTeamStats.get('s-pops') || 1)).toFixed(2) );
        redTeamStats.set('hg', (redTeamStats.get('s-hold') / (redTeamStats.get('s-grabs') || 1)).toFixed(2) );
        blueTeamStats.set('hg', (blueTeamStats.get('s-hold') / (blueTeamStats.get('s-grabs') || 1)).toFixed(2) );

        let redTDs = $('.redStats').find("td");
        let blueTDs = $('.blueStats').find("td");

        redTDs.eq(0).css('border-left', '1px solid black');
        blueTDs.eq(0).css('border-left', '1px solid black');

        let nameWidth = cats.eq(0).width() || 110;
        if (nameWidth !== lastNameWidth) { //so the columns still align if somebody changes their name
            lastNameWidth = nameWidth;
            alignColumns();
        }

        //highlight our team...
        if (tagpro.playerId) tagpro.players[tagpro.playerId].team === 1 ? redTDs.eq(0).css('border-left', '2px solid white') : blueTDs.eq(0).css('border-left', '2px solid white');

        //highlight maxs...
        $('#NSE_TeamStats').find('.NSE_TS_RedMax').removeClass('NSE_TS_RedMax');
        $('#NSE_TeamStats').find('.NSE_TS_BlueMax').removeClass('NSE_TS_BlueMax');

        for (let i=1; i<columns.length; i++) {
            redTDs.eq(i).text(i === 6 || i === 8 ? tagpro.helpers.timeFromSeconds(redTeamStats.get(columns[i]), true) : redTeamStats.get(columns[i]));
            blueTDs.eq(i).text(i === 6 || i === 8 ? tagpro.helpers.timeFromSeconds(blueTeamStats.get(columns[i]), true) : blueTeamStats.get(columns[i]));

            let useMinimum = useMinimumPopsAndDrops && (i === 3 || i === 5);

            if (useMinimum) {
                if (redTeamStats.get(columns[i]) < blueTeamStats.get(columns[i])) redTDs.eq(i).addClass('NSE_TS_RedMax');
                else if (blueTeamStats.get(columns[i]) < redTeamStats.get(columns[i])) blueTDs.eq(i).addClass('NSE_TS_BlueMax');
            } else {
                if (redTeamStats.get(columns[i]) > blueTeamStats.get(columns[i])) redTDs.eq(i).addClass('NSE_TS_RedMax');
                else if (blueTeamStats.get(columns[i]) > redTeamStats.get(columns[i])) blueTDs.eq(i).addClass('NSE_TS_BlueMax');
            }
        }
    };



    let entryTime, joinTime, startTime, gameEndsAt, endTime, fullGameLength, overtimeLength;
    let gameLengthMins = 6; //Assume a 6 min pub game. Will change if in a group.
    let gameLengthSecs = gameLengthMins * 60;
    let gameLengthMs = gameLengthSecs * 1000;
    let isPrivate = false; //private groups
    let mercyRule = 3; //Assume 3 for a pub game. Will change if in a group.
    let redTeamScore = 0;
    let blueTeamScore = 0;
    let redTeamName = 'Red';
    let blueTeamName = 'Blue';



    /***************************************/
    /******* My Scoreboard Positions *******/
    /***************************************/
    if (showMyScoreboardPositions) {
        GM_addStyle('.SNE_SB_Position { font-size:10px; color:#bbb; width:20px; height:20px; text-align:center; display:flex; justify-content:center; align-items:center; margin:0px auto; }');
        GM_addStyle('.SNE_SB_Position1 { color:#111; background:linear-gradient(35deg, #ff0, #f70); border:1px outset #ddd; border-radius:50%; }');
        GM_addStyle('.SNE_SB_Position2 { color:#111; background:linear-gradient(35deg, #eee, #777); border:1px outset #ddd; border-radius:50%; }');
        GM_addStyle('.SNE_SB_Position3 { color:#111; background:linear-gradient(35deg, #af824b, #c13f08); border:1px outset #ddd; border-radius:50%; }');

        let getScoreboardPositionByStat = function(players, stat) {
            players.sort(function(a, b) {
                if (stat === 'score') {
                    return a.score === b.score ? a.id - b.id : b.score - a.score;
                } else if (stat === 's-pops' || stat === 's-drops') {
                    return a[stat] === b[stat] ? b.score - a.score : a[stat] - b[stat]; //ascending
                } else {
                    return a[stat] === b[stat] ? b.score - a.score : b[stat] - a[stat]; //descending
                }
            });

            let last = 0;
            let pos = 1;

            for (let i=0; i<players.length; i++) {
                if (i === 0) {
                    last = players[i][stat];
                } else if (last !== players[i][stat]) {
                    last = players[i][stat];
                    pos++;
                }

                if (players[i].id === tagpro.playerId) {
                    if (players[i][stat] === 0 && (stat === 's-captures' || stat === 's-powerups')) return -1; //no position if you don't get any caps or pups
                    else return pos;
                }
            }
        };

        function updateMyPositions() {
            for (let playerId in tagpro.players) {
                if (tagpro.players.hasOwnProperty(playerId)) {
                    tagpro.players[playerId].kd = (tagpro.players[playerId]['s-tags'] / (tagpro.players[playerId]['s-pops'] || 1));
                    tagpro.players[playerId].hg = (tagpro.players[playerId]['s-hold'] / (tagpro.players[playerId]['s-grabs'] || 1));
                }
            }

            let players = $.extend([], tagpro.players);
            $('.SNE_SB_Position').remove();

            $('#NSE_TeamStats thead tr th').eq(0).html('&nbsp;<div style="text-align:right;">My Position:</div>');

            for (let i=1; i<columns.length; i++) {
                let pos = getScoreboardPositionByStat(players, columns[i]);
                let col = $('#NSE_TeamStats thead tr th').eq(i);

                if (pos === -1) col.append('<span class="SNE_SB_Position">-</span>');
                else col.append('<span class="SNE_SB_Position SNE_SB_Position' + pos + '">' + pos + nth(pos) + '</span>');
            }
        }
    }




    /*******************************/
    /******* Overall Picture *******/
    /*******************************/
    if (showOverallPicture) {
        $('#NSE_TeamStats').after('<div id="NSE_OP_Container" style="display:flex; flex-flow:row nowrap; align-items:center; justify-content:space-around; margin:10px auto 20px; font-size:9px;"></div>');

        GM_addStyle('#NSE_TeamStats td.NSE_OP_DominantStat { text-shadow:0px 0px 5px #f70, 0px 0px 5px #fa0, 0px 0px 5px #fa0; }');

        let stats = { "s-tags":0, "s-pops":0, "s-drops":0, "s-hold":0, "s-prevent":0, "s-powerups":0 };
        let statCols = { "s-tags":2, "s-pops":3, "s-drops":5, "s-hold":6, "s-prevent":8, "s-powerups":11 };
        let limits = {
            close: .10,
            comfortable: .20,
            dominant: .40
        };
        let containerWidth = 480;
        let barWidth = containerWidth / 6;
        let barWidth_D2 = barWidth / 2;
        let ratings = {
            L5: { result: { win: 'Dominant Win',     loss: 'We Were Rekt' },  position: { win: barWidth_D2 * 10, loss: barWidth_D2 * 0 } },
            L4: { result: { win: 'Excellent Win',    loss: 'Awful Loss' },    position: { win: barWidth_D2 *  9, loss: barWidth_D2 * 1 } },
            L3: { result: { win: 'Comfortable Win',  loss: 'Deserved Loss' }, position: { win: barWidth_D2 *  8, loss: barWidth_D2 * 2 } },
            L2: { result: { win: 'Good Win',         loss: 'Fair Loss' },     position: { win: barWidth_D2 *  7, loss: barWidth_D2 * 3 } },
            L1: { result: { win: 'Narrow Win',       loss: 'Narrow Loss' },   position: { win: barWidth_D2 *  6, loss: barWidth_D2 * 4 } },
            L0: { result: { win: 'Close Game!',      loss: 'Close Game!' },   position: { win: barWidth_D2 *  5, loss: barWidth_D2 * 5 } }
        };

        function updateOverallPicture() {
            if (!tagpro.playerId) return;

            let isWin = (tagpro.players[tagpro.playerId].team === 1 && tagpro.score.r > tagpro.score.b) || (tagpro.players[tagpro.playerId].team === 2 && tagpro.score.b > tagpro.score.r);
            let isTie = tagpro.score.r === tagpro.score.b;
            let winningTeam = (!isTie && isWin && tagpro.players[tagpro.playerId].team === 1) || (!isWin && tagpro.players[tagpro.playerId].team === 2) ? 1 : 2;
            let winningRow = !isTie && winningTeam === 1 ? $('.redStats').find("td") : $('.blueStats').find("td");
            let redStats = { "s-tags":0, "s-pops":0, "s-drops":0, "s-hold":0, "s-prevent":0, "s-powerups":0 };
            let blueStats = { "s-tags":0, "s-pops":0, "s-drops":0, "s-hold":0, "s-prevent":0, "s-powerups":0 };

            for (const [id, player] of allPlayers) {
                for (let stat in stats) {
                    if (player.team === 1) redStats[stat] += player[stat];
                    else blueStats[stat] += player[stat];
                }
            }

            let wS = tagpro.score.r > tagpro.score.b ? redStats : blueStats;
            let lS = tagpro.score.r > tagpro.score.b ? blueStats : redStats;

            Object.keys(stats).forEach(key => {
                if (key === 's-powerups') {
                    let d = Math.abs(wS[key] - lS[key]);
                    let r = wS[key] - lS[key] < 0 ? -1.01 : 1.01;

                    if (d <= 1) stats[key] = 0;
                    else if (d <= 2) stats[key] = limits.close * r;
                    else if (d <= 3) stats[key] = limits.comfortable * r;
                    else stats[key] = limits.dominant * r;
                } else {
                    stats[key] = (wS[key] - lS[key]) / (lS[key] || 1);
                }

                if (key === 's-pops' || key === 's-drops') stats[key] = -stats[key];
            });

            let sorted = Object.entries(stats).sort((a, b) => a[1] - b[1]);

            $('#NSE_OP_Container').empty();
            $('#NSE_TeamStats .NSE_OP_DominantStat').removeClass('NSE_OP_DominantStat');

            let aheadbehind = 0;
            for (let i=0; i<sorted.length; i++) {
                let key = sorted[i][0];
                let value = sorted[i][1];

                if (value > 0) {
                    if (value > limits.dominant) aheadbehind += 3;
                    else if (value > limits.comfortable) aheadbehind += 2;
                    else if (value > limits.close) aheadbehind += 1;
                    else aheadbehind += 0.5;
                } else if (value < 0) {
                    if (value < -limits.dominant) aheadbehind -= 3;
                    else if (value < -limits.comfortable) aheadbehind -= 2;
                    else if (value < -limits.close) aheadbehind -= 1;
                    else aheadbehind -= 0.5;
                }

                if (winningRow && statCols[key] && value > limits.dominant) winningRow.eq(statCols[key]).addClass('NSE_OP_DominantStat');
            }


            if (tagpro.overtimeStartedAt) {
                let secondsOver = (Date.now() - tagpro.overtimeStartedAt) / 1000;

                if      (secondsOver <  30) aheadbehind -= 0; //short overtime
                else if (secondsOver <  60) aheadbehind -= 2;
                else if (secondsOver <  90) aheadbehind -= 4;
                else if (secondsOver < 120) aheadbehind -= 6;
                else                        aheadbehind -= 8; //long overtime

            } else {
                let secondsLeft = (tagpro.gameEndsAt - Date.now()) / 1000;

                if      (secondsLeft < gameLengthSecs * 0.1667) aheadbehind -= 3; //5-6 min (long game) 60
                else if (secondsLeft < gameLengthSecs * 0.3333) aheadbehind -= 2; //4-5 120
                else if (secondsLeft < gameLengthSecs * 0.5000) aheadbehind -= 1; //3-4 180
                else if (secondsLeft < gameLengthSecs * 0.6667) aheadbehind += 1; //2-3 240
                else if (secondsLeft < gameLengthSecs * 0.8333) aheadbehind += 2; //1-2 300
                else if (secondsLeft < gameLengthSecs)          aheadbehind += 3; //0-1 (short game) 360

                aheadbehind += Math.abs(tagpro.score.r - tagpro.score.b);
            }

            let ratingsLevel = 'L0';

            if      (aheadbehind >= 14) ratingsLevel = 'L5';
            else if (aheadbehind >= 9)  ratingsLevel = 'L4';
            else if (aheadbehind >= 4)  ratingsLevel = 'L3';
            else if (aheadbehind >= -1) ratingsLevel = 'L2';
            else if (aheadbehind >= -6) ratingsLevel = 'L1';

            if (isTie) ratingsLevel = 'L0';

            $('#NSE_OP_Container').prepend('<div id="NSE_OP_WinLossRating" style="position:relative; width:' + containerWidth + 'px; background:linear-gradient(to right, #f00, #ff0, #0f0); height:14px; border-radius:5px; opacity:0.8;"></div>');
            $('#NSE_OP_WinLossRating').append('<span style="position:absolute; border-left:1px dotted #000; left:50%; width:1px; height:14px;"></span>');
            $('#NSE_OP_WinLossRating').append('<span style="position:absolute; padding:0 2px; text-align:center; overflow:hidden; text-shadow:1px 1px 1px black; background:rgba(0,0,0,0.5); top:1px; left:' + ratings[ratingsLevel].position[isWin ? 'win' : 'loss'] + 'px; height:12px; width:' + barWidth + 'px; border-radius:5px;">' + ratings[ratingsLevel].result[isWin ? 'win' : 'loss'] + '</span>');
        };
    }





    /*************************/
    /******* Comeback! *******/
    /*************************/
    let scores = [];

    tagpro.socket.on('score', function(data) {
        let scoreDiff = data.r - data.b;
        let redTeamCount = 0;
        let blueTeamCount = 0;

        if ((tagpro.state === 1 || tagpro.state === 5) && tagpro.ui.sprites && tagpro.ui.sprites.playerIndicators) {
            redTeamCount = tagpro.ui.sprites.playerIndicators.children[0].children.length;
            blueTeamCount = tagpro.ui.sprites.playerIndicators.children[1].children.length;
        }

        if (scores.length === 0) {
            scores.push({ score: { r:data.r, b:data.b }, diff:scoreDiff, time:0, redTeamCount:redTeamCount, blueTeamCount:blueTeamCount });
        } else if (scores[scores.length - 1].diff !== scoreDiff) {
            scores.push({ score: { r:data.r, b:data.b }, diff:scoreDiff, time:Date.now(), redTeamCount:redTeamCount, blueTeamCount:blueTeamCount });
        }
    });

    GM_addStyle('.NSE_CB_Comeback_Red { color:#fff; text-shadow:0px 0px 18px #f70, 0px 0px 10px #f00, 0px 0px 5px #f00, 1px 1px 2px black; }');
    GM_addStyle('.NSE_CB_Comeback_Blue { color:#fff; text-shadow:0px 0px 18px #0089ff, 0px 0px 10px #00ffdc, 0px 0px 5px #00ffdc, 1px 1px 2px black; }');

    function updateComeback() {
        for (let i = 0; i < scores.length; i++) {
            if (tagpro.score.b > tagpro.score.r && scores[i].diff !== 0) scores[i].diff = scores[i].diff * -1;
        }

        let lowestScoreDifferenceIndex;
        let i = scores.length - 1;

        while (i > 0) {
            if (scores[i - 1].diff < scores[i].diff) {
                if (scores[i - 1].diff < 0) {
                    lowestScoreDifferenceIndex = i - 1;
                }
            } else {
                break;
            }
            i--;
        }

        let colorClass = (tagpro.score.r > tagpro.score.b ? 'NSE_CB_Comeback_Red' : 'NSE_CB_Comeback_Blue');
        let isWin = (tagpro.players[tagpro.playerId].team === 1 && tagpro.score.r > tagpro.score.b) || (tagpro.players[tagpro.playerId].team === 2 && tagpro.score.b > tagpro.score.r);

        if (tagpro.score.r !== tagpro.score.b && lowestScoreDifferenceIndex >= 0) {
            $('#NSE_MessageContainer').append('<div class="' + colorClass + '" style="font-size:26px; font-family:Verdana; font-weight:bold; text-align:center;">' + scores[lowestScoreDifferenceIndex].score.r + '-' + scores[lowestScoreDifferenceIndex].score.b + ' Comeback!</div>');

            if (tagpro.overtimeStartedAt && isWin) {
                $('#NSE_MessageContainer').append('<div class="' + colorClass + '" style="font-size:18px; font-family:Verdana; font-weight:bold; font-style:italic; text-align:center;">Overtime Win</div>');
            }

        } else if (isWin) {
            if (mercyRule > 0 && (Math.abs(tagpro.score.r - tagpro.score.b) === mercyRule)) {
                $('#NSE_MessageContainer').append('<div class="' + colorClass + '" style="font-size:26px; font-family:Verdana; font-weight:bold; text-align:center;">+' + mercyRule + ' Mercy Win!</div>');
            } else if (tagpro.overtimeStartedAt) {
                $('#NSE_MessageContainer').append('<div class="' + colorClass + '" style="font-size:26px; font-family:Verdana; font-weight:bold; text-align:center;">Overtime Win!</div>');
            }
        }
    }





    /*****************************/
    /******* Caps Timeline *******/
    /*****************************/
    let timeMinutes;

    function drawLine(ctx, x1, y1, x2, y2, color='#ffffff', lineWidth=1, dash=[]) {
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }

    function updateCapsTimeline() {
        let totalWidth = 300;
        let minutesInterval = totalWidth / (Math.max(fullGameLength, gameLengthSecs) / 60);
        let normalTimeEndPoint = Math.min(fullGameLength, gameLengthSecs) / Math.max(fullGameLength, gameLengthSecs);
        let joinPoint = (joinTime - startTime) / (overtimeLength ? fullGameLength : gameLengthSecs) / 1000;
        let entryPoint = (entryTime - startTime) / (overtimeLength ? fullGameLength : gameLengthSecs) / 1000;
        let jP_tW = joinPoint * totalWidth;
        let eP_tW = entryPoint * totalWidth;
        let gameEndPoint = (endTime - startTime) / (overtimeLength ? fullGameLength : gameLengthSecs) / 1000;

        $('#NSE_OP_Container').append('<div style="position:relative; text-align:center; height:30px; background:rgba(0,0,0,0.6); border-radius:5px;"><canvas id="NSE_OP_CapTimelineCanvas" width="' + (totalWidth + 20) + '" height="30"></div>');

        let canvas = $('#NSE_OP_CapTimelineCanvas');
        let ctx = canvas.get(0).getContext('2d');

        ctx.translate(10.5, 0.5);
        ctx.lineWidth = 1;
        ctx.setLineDash([]);

        //minute markers...
        let count = 0;
        for (let x = 0; x <= Math.max(fullGameLength, gameLengthSecs, 300); x += minutesInterval) {
            if (x === 0) { //start marker
                drawLine(ctx, 0, 9, 0, 21, 'white'); //7, 23

            } else if (gameLengthMins % 2 === 0 && count === gameLengthMins / 2) { //halfway marker (only if even minutes)
                drawLine(ctx, x, 9, x, 21, 'white');

            } else if (count === gameLengthMins) { //end of game marker
                let endPoint = overtimeLength ? gameLengthSecs / fullGameLength * totalWidth : 300;
                drawLine(ctx, endPoint, 9, endPoint, 21, 'white');

            } else { //normal minute marker
                drawLine(ctx, x, 11, x, 19, 'white'); //10, 20
            }

            count++;
        }

        //horizontal game length lines...
        if (!overtimeLength) { //normal game...
            let endPoint = gameEndPoint * totalWidth;
            let wasWinByMercy = mercyRule > 0 && (Math.abs(tagpro.score.r - tagpro.score.b) === mercyRule); //check if was a mercy win or timer went to 00:00

            drawLine(ctx, 0, 15, jP_tW, 15, 'red', 1, [2, 2]); //pre-join
            drawLine(ctx, jP_tW, 15, normalTimeEndPoint * totalWidth, 15, 'white'); //game time

            if (fullGameLength < gameLengthSecs) { //game ended early...
                drawLine(ctx, endPoint, 15, totalWidth, 15, '#666', 1, [2, 2]); //post-game time not played
                if (wasWinByMercy) drawLine(ctx, endPoint, 8, endPoint, 22, '#bb00bb'); //end of normal time marker (if timer didn't run out)
            }

        } else { //overtime game...
            let endPoint = gameLengthSecs / fullGameLength * totalWidth;

            if (joinPoint < normalTimeEndPoint) { //joined before overtime started...
                drawLine(ctx, 0, 15, jP_tW, 15, 'red', 1, [2, 2]); //pre-join
                drawLine(ctx, jP_tW, 15, normalTimeEndPoint * totalWidth, 15, 'white'); //normal game time played
                drawLine(ctx, endPoint, 15, totalWidth, 15, 'orange'); //game time

            } else { //joined in overtime...
                drawLine(ctx, 0, 15, endPoint, 15, 'red', 1, [2, 2]); //pre-join normal time
                drawLine(ctx, endPoint, 15, jP_tW, 15, 'orange', 1, [2, 2]); //pre-join in overtime
                drawLine(ctx, jP_tW, 15, totalWidth, 15, 'orange'); //game time
            }

            //end of overtime marker...
            drawLine(ctx, 300, 8, 300, 22, 'orange');
        }

        //cap markers...
        for (let i = 1; i < scores.length; i++) {
            let x = (scores[i].time - startTime) / (overtimeLength ? fullGameLength : gameLengthSecs) / 1000 * totalWidth;
            let team = 'purple';

            if (scores[i].score.r > scores[i - 1].score.r) team = '#ff1717';
            else if (scores[i].score.b > scores[i - 1].score.b) team = '#0064f2';

            ctx.beginPath();
            ctx.fillStyle = team;
            ctx.arc(x, 15, 4, 0, Math.PI * 2);
            ctx.fill();

            if (scores[i].redTeamCount !== scores[i].blueTeamCount) { //cap when uneven teams
                ctx.beginPath();

                if (scores[i].redTeamCount > scores[i].blueTeamCount && scores[i].score.r > scores[i - 1].score.r || scores[i].blueTeamCount > scores[i].redTeamCount && scores[i].score.b > scores[i - 1].score.b) {
                    ctx.fillStyle = 'black'; //color when the scoring team has more players
                } else {
                    ctx.fillStyle = 'white'; //color when the scoring team has fewer players
                }
                ctx.arc(x, 15, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        //joiners/leavers...
        for (const [id, player] of allPlayers) {
            let color = player.team === 1 ? '#ff4747' : '#4494f2';

            if (!tagpro.players.hasOwnProperty(id)) { //add '-' where player left...
                let x = Math.floor((player.lastseen - startTime) / (overtimeLength ? fullGameLength : gameLengthSecs) / 1000 * totalWidth);
                let y = player.team === 1 ? 3 : 27;

                drawLine(ctx, x-1.5, y, x+1.5, y, color);
            }

            let x = Math.floor((player.firstseen - startTime) / (overtimeLength ? fullGameLength : gameLengthSecs) / 1000 * totalWidth);
            if (x >= eP_tW) { // + 1.5
                let y = player.team === 1 ? 8 : 22;

                drawLine(ctx, x, y-1.5, x, y+1.5, color);
                drawLine(ctx, x-1.5, y, x+1.5, y, color);
            }
        }

        ctx.translate(-10.5, -0.5);
    }




    /******************************/
    /******* Triple Doubles *******/
    /******************************/
    GM_addStyle('#stats tr.NSE_TripleDouble_Red { background:rgba(50,0,0,0.5) !important; }');
    GM_addStyle('#stats tr.NSE_TripleDouble_Blue { background:rgba(0,10,50,0.5) !important; }');
    GM_addStyle('#stats td.NSE_TripleDouble_Red, span.NSE_TripleDouble_Red { text-shadow:0px 0px 8px #f70, 0px 0px 5px #f00, 0px 0px 5px #f00; }');
    GM_addStyle('#stats td.NSE_TripleDouble_Blue, span.NSE_TripleDouble_Blue { text-shadow:0px 0px 8px #0089ff, 0px 0px 5px #00ffdc, 0px 0px 5px #00ffdc; }');
    GM_addStyle('#stats td.NSE_TripleDouble_Underline { text-decoration:underline; }');

    let td_ids = [];
    function updateTripleDoubles() {
        let doubles = {
            's-hold':     { limit: 120, column: 6 }, //120
            's-captures': { limit: 2,   column: 7 }, //2
            's-prevent':  { limit: 120, column: 8 }, //120
            's-returns':  { limit: 10,  column: 9 }, //10
            's-powerups': { limit: 5,   column: 11 } //5
        };

        for (const [id, player] of allPlayers) {
            let count = 0;

            Object.keys(doubles).forEach(stat => {
                if (player[stat] >= doubles[stat].limit) count++;
            });

            if (count >= 3) {
                td_ids.push(+id);
            }
        }

        if (td_ids.length) {
            let trs = $('#stats tbody').find('tr');

            $('#stats').after('<div id="NSE_TripleDoubles" style="text-align:center; margin:3px 15px 0px;"><span style="font-size:14px;">Triple Double' + (td_ids.length === 1 ? '' : 's') + ': </span></div>');

            trs.each(function() {
                let id = +$(this).find('td').eq(13).children('a').attr('href'); //get the playerId from the "report" link

                if (td_ids.indexOf(+id) >= 0) {
                    let team = allPlayers.get(id).team === 1 ? 'NSE_TripleDouble_Red' : 'NSE_TripleDouble_Blue';

                    //$(this).addClass(team); //Highlight Row
                    $(this).find('.scoreName').addClass(team); //Highlight Name

                    Object.keys(doubles).forEach(stat => {
                        if (allPlayers.get(id)[stat] >= doubles[stat].limit) $(this).find('td').eq(doubles[stat].column).addClass(team + ' NSE_TripleDouble_Underline'); //Highlight Stat
                    });

                    $('#NSE_TripleDoubles').append('<span class="' + team + '" style="padding:0 10px;">' + allPlayers.get(id).name + '</span>');
                }
            });
        }
    }




    /******************************/
    /******* Hatricks *******/
    /******************************/
    let ht_ids = [];
    function updateHatricks() {
        for (const [id, player] of allPlayers) {
            if (player['s-captures'] >= 3 && td_ids.indexOf(id) === -1) {
                ht_ids.push(id);
            }
        }

        if (ht_ids.length) {
            let trs = $('#stats tbody').find('tr');

            $($('#NSE_TripleDoubles').length ? '#NSE_TripleDoubles' : '#stats').after('<div id="NSE_Hatricks" style="text-align:center; margin:3px 15px 0px;"><span style="font-size:14px;">Hatrick' + (ht_ids.length === 1 ? '' : 's') + ': </span></div>');

            trs.each(function() {
                let id = +$(this).find('td').eq(13).children('a').attr('href'); //get the playerId from the "report" link

                if (ht_ids.indexOf(id) >= 0) {
                    let team = allPlayers.get(id).team === 1 ? 'NSE_TripleDouble_Red' : 'NSE_TripleDouble_Blue';

                    $(this).find('td').eq(7).addClass(team + ' NSE_TripleDouble_Underline'); //Highlight Stat

                    $('#NSE_Hatricks').append('<span class="' + team + '" style="padding:0 10px;">' + allPlayers.get(id).name + '</span>');
                }
            });
        }
    }


    let joinTimerText;
    let getJoinScoreText = function() {
        if (tagpro.score.b >= 0) {
            tagpro.joinscore = { r:tagpro.score.r, b:tagpro.score.b };
        } else {
            setTimeout(getJoinScoreText, 150); //sometimes the score hasn't been set yet so we need a delay
        }
    };


    tagpro.socket.on('time', function(data) {
        if (!startTime && data.state !== 3) { //if state === 3 then tagpro.gameEndsAt is when the pre-game period ends
            if (tagpro.gameEndsAt) gameEndsAt = (new Date(tagpro.gameEndsAt)).getTime(); //expected end of normal game time
            else if (tagpro.overtimeStartedAt) gameEndsAt = (new Date(tagpro.overtimeStartedAt)).getTime();
            else gameEndsAt = 0;

            if (gameEndsAt) startTime = gameEndsAt - gameLengthMs;
        }

        //start tracking players...
        if ((data.state === 1 || data.state === 5) && !clearable_TeamStats) {
            trackPlayers();
            clearable_TeamStats = setInterval(function() {
                if (data.state === 1 || data.state === 5) {
                    trackPlayers();
                    if (!onlyShowTeamStatsAtEOG && $('#options').is(':visible')) updateTeamStats();
                }
            }, 1000);
        }

        if (data.state === 3) { //before the actual start
            entryTime = Date.now();
            joinTime = entryTime;
            joinTimerText = '06:00';
            tagpro.joinscore = { r:redTeamScore, b:blueTeamScore };

        } else if (data.state === 1) { //game has started
            if (joinTime) {
                entryTime = startTime;
                joinTime = entryTime;
                joinTimerText = tagpro.helpers.timeFromSeconds(gameLengthSecs, true); //timer at the start of the game
            } else {
                entryTime = Date.now(); //time we joined (mid-game)
                joinTime = entryTime;
                joinTimerText = tagpro.helpers.timeFromSeconds(Math.round((gameEndsAt - joinTime) / 1000), true);
                getJoinScoreText();
            }

        } else if (data.state === 5) { //overtime
            if (!joinTime) { //joined in overtime
                entryTime = Date.now();
                joinTime = entryTime;
                joinTimerText = tagpro.helpers.timeFromSeconds(Math.round((joinTime - tagpro.overtimeStartedAt) / 1000), true) + ' (O/T)';
                getJoinScoreText();
            }
        }
    });

    tagpro.socket.on('spectator', function(spectator) {
        if (!spectator.type) { //we joined from spec
            joinTime = Date.now();
            joinTimerText = tagpro.helpers.timeFromSeconds(Math.round((gameEndsAt - joinTime) / 1000), true);
            getJoinScoreText();
            if (tagpro.overtimeStartedAt) joinTimerText += ' (O/T)';
        }
    });



    let updatePlayersDegrees = function() {
        let rStable = $('.redStats').find("td");
        let bStable = $('.blueStats').find("td");
        let redLeavers = 0;
        let blueLeavers = 0;

        for (const [id, player] of allPlayers) {
            if (!tagpro.players.hasOwnProperty(id)) {
                if (player.team === 1) redLeavers++;
                else blueLeavers++;
            }

            if (tagpro.players.hasOwnProperty(id)) {
                let color = player.team === 1 ? '#fcc' : '#ccf';
                let $scoreName = $('a.kick[href="' + id + '"]').parent().parent().find('.scoreName');

                $scoreName.parent().append('<div id="NSE_PlayerDegreeContainer_' + id + '" style="position:relative; margin:0;"></div>'); //we need this relative div to position our absolute spans in the td
                $('#NSE_PlayerDegreeContainer_' + id).append( $scoreName.parent().contents() ); //move the name to our new container

                if (showtimePlayed) {
                    if (entryTime <= startTime + 1500) {
                        let timePlayed = ((player.lastseen - player.firstseen) / fullGameLength / 1000);

                        if (showBuddyWins) { //right align if we're also using Buddy Wins
                            $('#NSE_PlayerDegreeContainer_' + id).append('<span style="color:' + color + '; position:absolute; font-size:8px; font-weight:normal; right:0px; top:7px; opacity:50%;">' + Math.min(Math.round(timePlayed * 100), 100) + '%</span>'); //sometimes rounds to 101%
                        } else { //otherwise left align
                            $('#NSE_PlayerDegreeContainer_' + id).append('<span style="color:' + color + '; position:absolute; font-size:9px; font-weight:normal; left:0px; top:-4px; opacity:60%;">' + Math.min(Math.round(timePlayed * 100), 100) + '%</span>');
                        }
                    }
                }

                if (showDegrees) {
                    if (tagpro.players[id].degree > 0) {
                        $('#NSE_PlayerDegreeContainer_' + id).append('<span style="color:' + color + '; position:absolute; font-size:9px; font-weight:normal; right:0px; top:-4px; opacity:75%;">' + tagpro.players[id].degree + '&deg;</span>');
                    }
                }
            }
        }

        if (redLeavers) rStable.eq(0).append('<span title="Includes ' + redLeavers + ' Leavers"> (*' + redLeavers + ')</span>');
        if (blueLeavers) bStable.eq(0).append('<span title="Includes ' + blueLeavers + ' Leavers"> (*' + blueLeavers + ')</span>');
    };




    let updateBuddyWins = function() {
        let buddyPlayers = GM_getValue('buddyPlayers', {});
        let myTeam = tagpro.players[tagpro.playerId].team;
        let isWin = (myTeam === 1 && tagpro.score.r > tagpro.score.b) || (myTeam === 2 && tagpro.score.b > tagpro.score.r);

        for (const [id, player] of allPlayers) {
            let saveThisPlayer = tagpro.players.hasOwnProperty(id) && tagpro.playerId !== id && (!buddyWinsAuthOnly || buddyWinsAuthOnly && tagpro.players[id].auth) && (!buddyWinsIgnoreSomeBalls || buddyWinsIgnoreSomeBalls && !player.name.startsWith('Some Ball ')); //skip us; only save authenticated; skip Some Balls

            if (saveThisPlayer) {
                let timePlayed = Math.min(Math.round(((player.lastseen - player.firstseen) / fullGameLength / 1000) * 100), 100);

                if (timePlayed > buddyWinsMinimumGameTime) { //minimum % of game time
                    if (!buddyPlayers.hasOwnProperty(player.name)) buddyPlayers[player.name] = { gamepid:0, gamesWith:0, winsWith:0, gamesAgainst:0, winsAgainst:0 };

                    buddyPlayers[player.name].gamepid = id;

                    if (player.team === myTeam) {
                        buddyPlayers[player.name].gamesWith++;
                        if (isWin) buddyPlayers[player.name].winsWith++;
                    } else {
                        buddyPlayers[player.name].gamesAgainst++;
                        if (isWin) buddyPlayers[player.name].winsAgainst++;
                    }
                }
            }
        }

        let trs = $('#stats tbody').find('tr');

        let getBuddyFlair = function(winsWith, winsAgainst) {
            //Happy to change these icons if someone can make them better :)
            if      (!winsWith || !winsAgainst)         return '';
            else if (winsWith >= 60 && winsAgainst >= 60) return '👍'; //high win with, high win against - you are a better player than them 💜🚑👍✌
            else if (winsWith >= 60 && winsAgainst <= 40) return '🔥'; //high win with, low win against - they are a better player than you 🔥⚡
            else if (winsWith <= 40 && winsAgainst <= 40) return '☢️'; //low win with, low win against - they play better against you (you suck when you're on the same team) ☢️
            else if (winsWith <= 40 && winsAgainst >= 60) return '👎'; //low win with, high win against - you play better against them (they suck) 🤔👎
            else return ''; //😐
        };

        trs.each(function(i, v) {
            if (i === 0) return true; //skip the header row

            let name = $(this).find('.scoreName').text().trim();
            let id = +$(this).find('td').eq(13).children('a').attr('href'); //get the playerId from the "report" link
            let color = tagpro.players[id].team === 1 ? '#fcc' : '#ccf';

            if (name && id && buddyPlayers.hasOwnProperty(name) && buddyPlayers[name].gamepid === id) { //gamepid is a check for when players have the same name
                let winsWithPC = buddyPlayers[name].winsWith / (buddyPlayers[name].gamesWith || 1) * 100;
                let winsAgainstPC = buddyPlayers[name].winsAgainst / (buddyPlayers[name].gamesAgainst || 1) * 100;
                let games = myTeam === tagpro.players[id].team ? buddyPlayers[name].gamesWith : buddyPlayers[name].gamesAgainst;

                if (games > buddyWinsMinimumGames) {
                    let flair = getBuddyFlair(winsWithPC, winsAgainstPC);

                    buddyPlayers[name].gamepid = 0;

                    let winsPC = myTeam === tagpro.players[id].team ? (buddyPlayers[name].winsWith > 0 ? winsWithPC.toFixed(0) + '%' : '-') : (buddyPlayers[name].winsAgainst > 0 ? winsAgainstPC.toFixed(0) + '%' : '-');
                    let title = 'Won ' + buddyPlayers[name].winsWith + ' / ' + buddyPlayers[name].gamesWith + ' Games With (' + winsWithPC.toFixed(0) + '%)\nWon ' + buddyPlayers[name].winsAgainst + ' / ' + buddyPlayers[name].gamesAgainst + ' Games Against (' + winsAgainstPC.toFixed(0) + '%)';

                    $('#NSE_PlayerDegreeContainer_' + id).append('<span style="position:absolute; width:12px; font-size:10px; font-weight:normal; text-align:center; left:0px; top:-1px; opacity:80%;" title="' + title + '">' + flair + '</span>');
                    $('#NSE_PlayerDegreeContainer_' + id).append('<span style="color:' + color + '; position:absolute; width:20px; font-size:8px; font-weight:normal; text-align:center; left:12px; top:-3px; opacity:60%; title="' + title + '"">' + winsPC + '</span>');
                    $('#NSE_PlayerDegreeContainer_' + id).append('<span style="color:' + color + '; position:absolute; width:20px; font-size:8px; font-weight:normal; text-align:center; left:12px; top:7px; opacity:60%;" title="' + title + '">(' + games + ')</span>');

                } else {
                    $('#NSE_PlayerDegreeContainer_' + id).append('<span style="color:' + color + '; position:absolute; width:20px; font-size:8px; font-weight:normal; text-align:center; left:12px; top:2px; opacity:60%;">-</span>');
                }

            } else {
                $(this).append('<td><div style="display:flex; position:absolute; margin-top:-5px; text-align:center;">-</div></td>');

                if (tagpro.playerId === id) $('#NSE_PlayerDegreeContainer_' + id).append('<span style="position:absolute; width:10px; font-size:10px; font-weight:normal; text-align:center; left:0px; top:-1px; opacity:80%;"></span>'); //me ⭐💜
                else $('#NSE_PlayerDegreeContainer_' + id).append('<span style="color:' + color + '; position:absolute; width:20px; font-size:8px; font-weight:normal; text-align:center; left:12px; top:2px; opacity:60%;">-</span>');
            }
        });

        cats.eq(0).width(cats.eq(0).width() + 10);
        alignColumns();

        GM_setValue('buddyPlayers', buddyPlayers);
    };


    tagpro.socket.on('end', function() {
        clearInterval(clearable_TeamStats);
        $('#stats').find('tbody').removeClass('stats'); //stop the scoreboard from updating
        tagpro.renderer.centerView();

        if (showKDHGatEOG) {
            if (showKD) $('#stats th').eq(12).text('K/D');
            if (showHG) $('#stats th').eq(13).text('H/G');
        }

        endTime = Date.now(); //actual end of game time
        overtimeLength = tagpro.overtimeStartedAt ? endTime - tagpro.overtimeStartedAt : 0;
        fullGameLength = (endTime - startTime) / 1000; //how long the whole game lasted (with or without us)
        let myTimePlayed = (endTime - joinTime) / 1000; //how long we played for

        $('#NSE_PostGameContainer').append('<div>Game lasted: ' + tagpro.helpers.timeFromSeconds(Math.round(fullGameLength), true) + '</div>');
        $('#NSE_PostGameContainer').append('<div>I started ' + (tagpro.spectator ? 'watching' : 'playing') + ' @ ' + joinTimerText + '</div>');
        $('#NSE_PostGameContainer').append('<div>Score was: ' + tagpro.joinscore.r + '-' + tagpro.joinscore.b + '</div>');
        $('#NSE_PostGameContainer').append('<div>I ' + (tagpro.spectator ? 'watched' : 'played') + ' for ' + tagpro.helpers.timeFromSeconds(Math.round(myTimePlayed), true) + ' (' + (myTimePlayed / fullGameLength * 100).toFixed(2) + '%)</div>');

        $('#switchButton').hide();
        $('#tutorialButton').hide();
        $('#optionsName').children('label').hide();
        $('#optionsLinks').css('padding-top', '0px');
        $('#mapRatingContainer').children('label').hide();

        if (showMyScoreboardPositions && (!isPrivate || isPrivate && !tagpro.spectator)) setTimeout(updateMyPositions, 400);
        if (showOverallPicture) setTimeout(updateOverallPicture, 300);

        setTimeout(function() {
            trackPlayers();
            updateTeamStats();
            $('.redStats').find('.scoreName').text(redTeamName);
            $('.blueStats').find('.scoreName').text(blueTeamName);
            $('#NSE_TeamStats').show();

            if (showComeback) updateComeback();
            if (showTripleDoubles) updateTripleDoubles();
            if (showHatricks) updateHatricks();
            if (showCapsTimeline) updateCapsTimeline();
            if (showDegrees || showtimePlayed) updatePlayersDegrees();
            if (showBuddyWins && !tagpro.spectator) updateBuddyWins();
        }, 365);

    });


    //detect some group settings...
    let startCounter = 0;
    let waitForGroupSocket = function() {
        if (!tagpro || !tagpro.group || tagpro.group.socket !== null && !tagpro.group.socket.connected) {
            startCounter++;

            if (startCounter < 50) {
                setTimeout(waitForGroupSocket, 20);
                return false;
            }
        }

        if (tagpro && tagpro.group && tagpro.group.socket !== null && tagpro.group.socket.connected) {
            let settingCount = 0;

            function handleSetting(data) {
                //console.log('NSE:: handleSetting():', data.name, data.value);

                if (data.name === 'mercyRule') {
                    mercyRule = data.value;
                    settingCount++;

                } else if (data.name === 'isPrivate') {
                    isPrivate = data.value;
                    settingCount++;

                } else if (data.name === 'redTeamScore') {
                    redTeamScore = data.value;
                    settingCount++;

                } else if (data.name === 'blueTeamScore') {
                    blueTeamScore = data.value;
                    settingCount++;

                } else if (data.name === 'redTeamName') {
                    redTeamName = data.value;
                    settingCount++;

                } else if (data.name === 'blueTeamName') {
                    blueTeamName = data.value;
                    settingCount++;

                } else if (data.name === 'time') {
                    if (tagpro.gameEndsAt) gameEndsAt = (new Date(tagpro.gameEndsAt)).getTime();
                    else if (tagpro.overtimeStartedAt) gameEndsAt = (new Date(tagpro.overtimeStartedAt)).getTime();
                    else gameEndsAt = 0;

                    gameLengthMins = data.value;
                    gameLengthSecs = gameLengthMins * 60;
                    gameLengthMs = gameLengthSecs * 1000;
                    if (gameEndsAt && tagpro.state !== 3) {
                        startTime = gameEndsAt - gameLengthMs;
                    }

                    settingCount++;
                }

                if (settingCount === 7) {
                    tagpro.group.socket.removeListener('setting', handleSetting);
                }
            }

            tagpro.group.socket.on('setting', handleSetting);
        }
    };
    waitForGroupSocket();


    //Helpers...
    function nth(n) {
        return [,'st','nd','rd'][n % 100 >> 3 ^ 1 && n % 10] || 'th';
    }

    function clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    }

});
console.log("TPMOBILE: LOADED Nabbys_Scoreboard_Enhancer")
})();