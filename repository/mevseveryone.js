// ==UserScript==
// @name            Me vs Everyone
// @description     Shows my stats for both "With & Against" everyone I play with. Authenticated (green) players only.
// @version         0.2.2
//                   - Made compatible with new TagPro site design
//                   - Added "Favorite Players" (who I win/lose with/against the most)
// @include         https://tagpro.koalabeast.com*
// @updateURL       https://gist.github.com/nabbynz/043f92ab62d11ea3c6f4/raw/TagPro_Me_Vs_Everyone.user.js
// @downloadURL     https://gist.github.com/nabbynz/043f92ab62d11ea3c6f4/raw/TagPro_Me_Vs_Everyone.user.js
// @TPMUSJMURL	 	https://raw.githubusercontent.com/rfmx49/TagProMobileUserScripts/refs/heads/main/repository/mevseveryone.js
// @match           all
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// @customSettings  MVEmaximumNumberOfGamesToSave = {MaxGames: {value: 1000, description: "You can change this to whatever you want - 1000 is kind of like a 'Rolling 1000' games."}}
// ==/UserScript==

(function() {
    //TagPro Android Create Methods for GM_setValue, GM_getValue, and GM_deleteValue,
    //Will store these values into localStorage as strings.
    var userScriptKey = "GM_MVE";

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
			name: "Me vs Everyone",
			version: "0.2.2",
			author: "nabby"
		}
	}
console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

var $uHome = $('#userscript-home');
var $uTop = $('#userscript-top');
var $uBottom = $('#userscript-bottom');

var PageLoc = WhichPageAreWeOn();

const maximumNumberOfGamesToSave = MVEmaximumNumberOfGamesToSave ?? 1000; //You can change this to whatever you want - 1000 is kind of like a "Rolling 1000" games.


tagpro.ready(function() {
    if (PageLoc === 'ingame') { //in a game
        let joinTime;
        let gameData = {};
        let mapName='', mapAuthor='', mapType='';
        let pupsCount = 0;
        let result = 0;
        let saveAttempt = false;
        let groupPause = false;

        if ((tagpro.group.socket) && (tagpro.group.socket.connected)) {
            groupPause = true;
        }

        tagpro.socket.on('time', function(message) {
            if (tagpro.state === 3) { //before the actual start
                joinTime = new Date().getTime();
            } else if (tagpro.state === 1) { //game has started
                if (joinTime) {
                    //joinTime = Date.parse(tagpro.gameEndsAt) - 6 * 60 * 1000; //time game started (end - 6 mins)
                } else {
                    joinTime = new Date().getTime(); //time we joined (mid-game)
                }
            }
        });


        tagpro.socket.on('map', function(data) {
            mapName = data.info.name;
            mapAuthor = data.info.author;

            setTimeout(function() {
                for (let i=0; i<tagpro.map.length; i++) { //find the flags which will tell us if it's a CTF or NF map...
                    for (let j=0; j<tagpro.map[i].length; j++) {
                        let tileId = Math.floor(tagpro.map[i][j]);

                        if (tileId === 16) { //tagpro.map[i][j] == 16 || (tagpro.map[i][j] == 16.1)) { //yellow flag found
                            mapType = 2;
                        } else if (tileId === 3 || tileId === 4) { //(tagpro.map[i][j] == 3) || (tagpro.map[i][j] == 3.1) || (tagpro.map[i][j] == 4) || (tagpro.map[i][j] == 4.1)) { //red or blue flag found
                            mapType = 1;
                        } else if (tileId === 6) { //(tagpro.map[i][j] == 6) || (tagpro.map[i][j] == 6.1) || (tagpro.map[i][j] == 6.2) || (tagpro.map[i][j] == 6.3) || (tagpro.map[i][j] == 6.4)) { //counts the pups so we can work out potential pups later
                            pupsCount++;
                        }
                    }
                }
            }, 100);
        });


        tagpro.socket.on('end', function(data) {
            if ((!tagpro.spectator) && (!groupPause)) {
                let fullTime = Date.parse(tagpro.gameEndsAt); //expected end of game time after 6 mins
                let endTime = new Date().getTime(); //actual end of game time
                let startTime = fullTime - 6 * 60 * 1000; //start of game time
                let fullGameLength = (endTime-startTime)/1000; //how long the whole game lasted (with or without us)
                let playedGameLength = (endTime-joinTime)/1000; //how long we played for
                let playerCount = 0;

                for (let playerId in tagpro.players) {
                    playerCount++;
                }

                if ( (joinTime+30000 < endTime) && (playerCount >= 4) && (playerCount <= 8) ) { //check we didn't join in the last 30 seconds of the game, and there was between 4-8 players
                    gameData.mapName = mapName;
                    gameData.mapAuthor = mapAuthor;
                    gameData.gameMode = mapType;
                    gameData.playerCount = playerCount;

                    gameData.played = new Date(joinTime).toISOString();
                    gameData.timePlayed = playedGameLength;
                    gameData.fullGameLength = fullGameLength;

                    gameData.team = tagpro.players[tagpro.playerId].team;
                    gameData.redScore = tagpro.score.r;
                    gameData.blueScore = tagpro.score.b;

                    gameData.saved = 0;
                    if (data.winner === 'tie') {
                        gameData.outcome = 5; //tie
                    } else if ( ((data.winner === 'red') && (tagpro.players[tagpro.playerId].team === 1)) || ((data.winner === 'blue') && (tagpro.players[tagpro.playerId].team === 2)) ) {
                        gameData.outcome = 1; //win
                        if (saveAttempt) {
                            gameData.saved = 2; //successful save attempt
                        }
                    } else if ( ((data.winner === 'red') && (tagpro.players[tagpro.playerId].team === 2)) || ((data.winner === 'blue') && (tagpro.players[tagpro.playerId].team === 1)) ) {
                        if (saveAttempt) {
                            gameData.outcome = 4; //unsuccessful save attempt
                            gameData.saved = 1;
                        } else {
                            gameData.outcome = 2; //loss
                        }
                    } else { //probably an event, which we won't record...
                        return false;
                    }

                    gameData.tags = tagpro.players[tagpro.playerId]["s-tags"];
                    gameData.pops = tagpro.players[tagpro.playerId]["s-pops"];
                    gameData.grabs = tagpro.players[tagpro.playerId]["s-grabs"];
                    gameData.drops = tagpro.players[tagpro.playerId]["s-drops"];
                    gameData.hold = tagpro.players[tagpro.playerId]["s-hold"];
                    gameData.captures = tagpro.players[tagpro.playerId]["s-captures"];
                    gameData.prevent = tagpro.players[tagpro.playerId]["s-prevent"];
                    gameData.returns = tagpro.players[tagpro.playerId]["s-returns"];
                    gameData.support = tagpro.players[tagpro.playerId]["s-support"];
                    gameData.powerups = tagpro.players[tagpro.playerId]["s-powerups"];
                    gameData.score = tagpro.players[tagpro.playerId].score;
                    gameData.points = tagpro.players[tagpro.playerId].points;
                    gameData.potentialPowerups = pupsCount * Math.ceil(playedGameLength / 60); //is this right???

                    //save scoreboard...
                    gameData.playersData = [];
                    for (playerId in tagpro.players) {
                        gameData.playersData.push({
                            name:tagpro.players[playerId].name,
                            me:(tagpro.playerId === tagpro.players[playerId].id ? true : false),
                            id:tagpro.players[playerId].id,
                            team:tagpro.players[playerId].team,
                            auth:tagpro.players[playerId].auth,
                            tags:tagpro.players[playerId]["s-tags"],
                            pops:tagpro.players[playerId]["s-pops"],
                            grabs:tagpro.players[playerId]["s-grabs"],
                            drops:tagpro.players[playerId]["s-drops"],
                            hold:tagpro.players[playerId]["s-hold"],
                            captures:tagpro.players[playerId]["s-captures"],
                            prevent:tagpro.players[playerId]["s-prevent"],
                            returns:tagpro.players[playerId]["s-returns"],
                            support:tagpro.players[playerId]["s-support"],
                            powerups:tagpro.players[playerId]["s-powerups"],
                            score:tagpro.players[playerId].score,
                            points:tagpro.players[playerId].points
                        });
                    }
                    gameData.playersData.sort(function(a, b) {
                        return (b.score - a.score ? b.score - a.score : a.id - b.id);
                    });

                    let allGameData = GM_getValue('gameData', []);
                    allGameData.push(gameData);

                    while (allGameData.length > maximumNumberOfGamesToSave) {
                        allGameData.shift();
                    }

                    GM_setValue('gameData', allGameData);
                }
            }
        });
    }
});

//Setup the main div location depending on which page we are on...
var MVE_Div = '<div id="MVE" style="position:relative; margin:0 auto; padding:10px; width:-webkit-fit-content; color:#fff; text-align:center; text-shadow:2px 1px 2px #000000; border-radius:8px; box-shadow:#fff 0px 0px 10px; background:rgba(0,0,0,0.1);  white-space:nowrap;">' +
              '<div style="display:inline-block; width:300px; background:dodgerblue; color:white; padding:3px; margin:3px auto; border-radius:5px;">Me vs. Everyone</div>' +
              '<div style="font-size:11px;">' +
              '<label><input type="checkbox" id="MVE_ShowAllPlayers"'+(GM_getValue('ShowAllPlayers', false) ? ' checked' : '')+'>Show All Players</label>' +
              '<label><input type="checkbox" id="MVE_AltView"'+(GM_getValue('AltView', false) ? ' checked' : '')+(GM_getValue('ShowAllPlayers', true) ? '' : ' disabled')+'>Alt Table View</label>' +
              '<label><input type="checkbox" id="MVE_ShowStats"'+(GM_getValue('ShowStats', false) ? ' checked' : '')+(GM_getValue('ShowAllPlayers', true) ? '' : ' disabled')+'>Show Stats</label>' +
              '<label style="margin-left:5px;"><input type="number" id="MVE_MinimumGames" min="0" max="20" value="'+GM_getValue('MinimumGames', 1)+'" style="width:30px; font-size:11px;"> Min Games</label>' +
              '<label><input type="checkbox" id="MVE_ShowFavorites"'+(GM_getValue('ShowFavorites', true) ? ' checked' : '')+'>Show Favorites</label>' +
              '<label style="margin-left:5px;"><input type="number" id="MVE_ShowFavoritesAmount" min="1" max="20" value="'+GM_getValue('ShowFavoritesAmount', 5)+'"' + (GM_getValue('ShowFavorites', true) ? '' : ' disabled') + ' style="width:30px; font-size:11px;"> # Favorites</label>' +
              '<div></div>';

//Chosen server page...
if (PageLoc === 'server') {
    $uHome.find('.row').append(MVE_Div);
    $uHome.removeClass('hidden');

//Profile page...
} else if (PageLoc === 'profile') {
    //$uBottom.find('.row').append(MVE_Div);
    //$uBottom.removeClass('hidden');

//Joining page...
} else if (PageLoc === 'joining') {
    //$uBottom.find('.row').append(MVE_Div);
    //$uBottom.removeClass('hidden');
}

$('#MVE_ShowAllPlayers').on('click', function() {
    GM_setValue('ShowAllPlayers', $(this).is(':checked'));
    if ($(this).is(':checked')) {
        showData();
        $('#MVE_AltView').prop('disabled', false);
        $('#MVE_ShowStats').prop('disabled', false);
    } else {
        $('#MVE_Players_Outer').fadeOut(400);
        $('#MVE_AltView').prop('disabled', true);
        $('#MVE_ShowStats').prop('disabled', true);
    }
});
$('#MVE_AltView').on('click', function() {
    GM_setValue('AltView', $(this).is(':checked'));
    if (GM_getValue('ShowAllPlayers', true)) showData();
});
$('#MVE_ShowStats').on('click', function() {
    GM_setValue('ShowStats', $(this).is(':checked'));
    if ($('#MVE_Players_Outer').is(':visible')) showData();
});
$('#MVE_ShowFavorites').on('click', function() {
    GM_setValue('ShowFavorites', $(this).is(':checked'));
    if ($(this).is(':checked')) {
        showFavorites();
        $('#MVE_ShowFavoritesAmount').prop('disabled', false);
    } else {
        $('#MVE_TopPlayers').fadeOut(400);
        $('#MVE_ShowFavoritesAmount').prop('disabled', true);
    }
});
$('#MVE_MinimumGames').on('change', function() {
    GM_setValue('MinimumGames', this.value);
    if (GM_getValue('ShowAllPlayers', true)) showData();
    if (GM_getValue('ShowFavorites', true)) showFavorites();
});
$('#MVE_ShowFavoritesAmount').on('change', function() {
    GM_setValue('ShowFavoritesAmount', this.value);
    if (this.value > 0) {
        if (GM_getValue('ShowFavorites', true)) showFavorites();
    } else {
        $('#MVE_TopPlayers').fadeOut(400);
    }
});


function makeData() {
    let gameData = GM_getValue('gameData', []);

    if (gameData.length) {
        let players = {};

        $.each(gameData, function(index, game) {
            $.each(game.playersData, function(key, value) {
                if (value.auth || value.me) {
                    if (value.me) value.name = '♥'; //just a special name for us so we can find/highlight it easily later (no matter what name we are using)

                    if (!players.hasOwnProperty(value.name)) {
                        players[value.name] = {with:    { win:0, loss:0, tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0 },
                                               against: { win:0, loss:0, tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0 }
                                              };
                    }

                    let withOrAgainst;

                    if (game.team === value.team) {
                        withOrAgainst = 'with';
                        if (game.outcome === 1) {
                            players[value.name].with.win++;
                        } else {
                            players[value.name].with.loss++;
                        }
                    } else {
                        withOrAgainst = 'against';
                        if (game.outcome === 1) {
                            players[value.name].against.win++;
                        } else {
                            players[value.name].against.loss++;
                        }
                    }
                    players[value.name][withOrAgainst].tags += value.tags;
                    players[value.name][withOrAgainst].pops += value.pops;
                    players[value.name][withOrAgainst].grabs += value.grabs;
                    players[value.name][withOrAgainst].drops += value.drops;
                    players[value.name][withOrAgainst].hold += value.hold;
                    players[value.name][withOrAgainst].captures += value.captures;
                    players[value.name][withOrAgainst].prevent += value.prevent;
                    players[value.name][withOrAgainst].returns += value.returns;
                    players[value.name][withOrAgainst].support += value.support;
                    players[value.name][withOrAgainst].powerups += value.powerups;
                }
            });
        });

        GM_setValue('playersData', players);

    } else {
        $('#MVE').append('<div>No Data - Go Play Some Games!</div>');
    }
}

function showData() {
    let players = GM_getValue('playersData', {});
    let MVE_Players = '';

    $('#MVE_Players_Outer').remove();

    MVE_Players = '<div id="MVE_Players_Outer"><table id="MVE_Players"><thead style="display:block; overflow-x:hidden; overflow-y:hidden">';

    if (GM_getValue('AltView', true)) {
        MVE_Players += '<tr><th class="MVE_Players_Name">&nbsp;</th><th class="MVE_With" colspan="3">Played With</th><th class="MVE_Against" colspan="3">Played Against</th></tr>' +
                       '<tr id="MVE_Players_Header"><th class="MVE_Players_Name">Player</th>' +
                       '  <th class="MVE_With MVE_Small">Total</th><th class="MVE_With MVE_Medium">Win</th><th class="MVE_With MVE_Medium">Loss</th>' +
                       '  <th class="MVE_Against MVE_Small">Total</th><th class="MVE_Against MVE_Medium">Win</th><th class="MVE_Against MVE_Medium">Loss</th>';

    } else {
        MVE_Players += '<tr><th class="MVE_Players_Name">&nbsp;</th><th class="MVE_Total MVE_Small" colspan="2">Total</th><th class="MVE_Win MVE_Medium" colspan="2">When I Win</th><th class="MVE_Loss MVE_Medium" colspan="2">When I Lose</th>';
        MVE_Players += '</tr>' +
            '<tr id="MVE_Players_Header"><th class="MVE_Players_Name">Player</th>' +
            '  <th class="MVE_Total MVE_Small">#W</th><th class="MVE_Total MVE_Small">#A</th>' +
            '  <th class="MVE_Win MVE_Medium">With</th><th class="MVE_Win MVE_Medium">Against</th>' +
            '  <th class="MVE_Loss MVE_Medium">With</th><th class="MVE_Loss MVE_Medium">Against</th>';
    }

    MVE_Players += '</tr></thead><tbody style="display:block; height:150px; overflow-x:hidden; overflow-y:auto"></tbody></table></div>';

    $('#MVE').append(MVE_Players);

    if (GM_getValue('ShowStats', true)) {
        $('#MVE_Players').find('tr:eq(0)').append('<th class="MVE_Stats MVE_Large" colspan="10">Per Game Stats (With:Against)</th>');
        $('#MVE_Players').find('tr:eq(1)').append('<th class="MVE_Stat_Odd MVE_Large">Tags</th>' +
                                                  '<th class="MVE_Stat_Even MVE_Large">Pops</th>' +
                                                  '<th class="MVE_Stat_Odd MVE_Large">Grabs</th>' +
                                                  '<th class="MVE_Stat_Even MVE_Large">Drops</th>' +
                                                  '<th class="MVE_Stat_Odd MVE_Large">Hold</th>' +
                                                  '<th class="MVE_Stat_Even MVE_Large">Caps</th>' +
                                                  '<th class="MVE_Stat_Odd MVE_Large">Prevent</th>' +
                                                  '<th class="MVE_Stat_Even MVE_Large">Returns</th>' +
                                                  '<th class="MVE_Stat_Odd MVE_Large">Support</th>' +
                                                  '<th class="MVE_Stat_Even MVE_Large">Powerups</th>');
    }

    $.each(players, function(key, value) {
        let totalWith = value.with.win + value.with.loss;
        let totalAgainst = value.against.win + value.against.loss;

        if (GM_getValue('MinimumGames', 0) <= totalWith + totalAgainst) {
            if (GM_getValue('AltView', true)) {
                MVE_Players = '<tr'+(key === '♥' ? ' class="MVE_HighlightSelf"' : '')+'><td class="MVE_Players_Name" data-raw="'+(key === '♥' ? '♥' : key)+'">'+(key === '♥' ? '<span style="color:#cdf">Me</span>' : key)+'</td>' +
                    '<td class="MVE_Small" data-raw="'+totalWith+'">'+totalWith+'</td><td class="MVE_Medium" data-raw="'+value.with.win/(totalWith||1)+'">'+(value.with.win/(totalWith||1)*100).toFixed(1)+'%</td><td class="MVE_Medium" data-raw="'+value.with.loss/(totalWith||1)+'">'+(value.with.loss/(totalWith||1)*100).toFixed(1)+'%</td>' +
                    '<td class="MVE_Small" data-raw="'+totalAgainst+'">'+totalAgainst+'</td><td class="MVE_Medium" data-raw="'+value.against.win/(totalAgainst||1)+'">'+(value.against.win/(totalAgainst||1)*100).toFixed(1)+'%</td><td class="MVE_Medium" data-raw="'+value.against.loss/(totalAgainst||1)+'">'+(value.against.loss/(totalAgainst||1)*100).toFixed(1)+'%</td>';

            } else {
                MVE_Players = '<tr'+(key === '♥' ? ' class="MVE_HighlightSelf"' : '')+'><td class="MVE_Players_Name" data-raw="'+(key === '♥' ? '♥' : key)+'">'+(key === '♥' ? '<span style="color:lightsteelblue">Me</span>' : key)+'</td>' +
                    '<td class="MVE_Small" data-raw="'+totalWith+'">'+totalWith+'</td><td class="MVE_Small" data-raw="'+totalAgainst+'">'+totalAgainst+'</td>' +
                    '<td class="MVE_Medium" data-raw="'+value.with.win/(totalWith||1)+'">'+(value.with.win/(totalWith||1)*100).toFixed(1)+'%</td><td class="MVE_Medium" data-raw="'+value.against.win/(totalAgainst||1)+'">'+(value.against.win/(totalAgainst||1)*100).toFixed(1)+'%</td>' +
                    '<td class="MVE_Medium" data-raw="'+value.with.loss/(totalWith||1)+'">'+(value.with.loss/(totalWith||1)*100).toFixed(1)+'%</td><td class="MVE_Medium" data-raw="'+value.against.loss/(totalAgainst||1)+'">'+(value.against.loss/(totalAgainst||1)*100).toFixed(1)+'%</td>';
            }

            if (GM_getValue('ShowStats', true)) {
                MVE_Players += '<td class="MVE_Large">'+(value.with.tags/(totalWith||1)).toFixed(2)+' : '+(value.against.tags/(totalAgainst||1)).toFixed(2)+'</td>' +
                    '<td class="MVE_Large">'+(value.with.pops/(totalWith||1)).toFixed(2)+' : '+(value.against.pops/(totalAgainst||1)).toFixed(2)+'</td>' +
                    '<td class="MVE_Large">'+(value.with.grabs/(totalWith||1)).toFixed(2)+' : '+(value.against.grabs/(totalAgainst||1)).toFixed(2)+'</td>' +
                    '<td class="MVE_Large">'+(value.with.drops/(totalWith||1)).toFixed(2)+' : '+(value.against.drops/(totalAgainst||1)).toFixed(2)+'</td>' +
                    '<td class="MVE_Large">'+secondsToHMS(value.with.hold/(totalWith||1))+' : '+secondsToHMS(value.against.hold/(totalAgainst||1))+'</td>' +
                    '<td class="MVE_Large">'+(value.with.captures/(totalWith||1)).toFixed(2)+' : '+(value.against.captures/(totalAgainst||1)).toFixed(2)+'</td>' +
                    '<td class="MVE_Large">'+secondsToHMS(value.with.prevent/(totalWith||1))+' : '+secondsToHMS(value.against.prevent/(totalAgainst||1))+'</td>' +
                    '<td class="MVE_Large">'+(value.with.returns/(totalWith||1)).toFixed(2)+' : '+(value.against.returns/(totalAgainst||1)).toFixed(2)+'</td>' +
                    '<td class="MVE_Large">'+(value.with.support/(totalWith||1)).toFixed(2)+' : '+(value.against.support/(totalAgainst||1)).toFixed(2)+'</td>' +
                    '<td class="MVE_Large">'+(value.with.powerups/(totalWith||1)).toFixed(2)+' : '+(value.against.powerups/(totalAgainst||1)).toFixed(2)+'</td>';
            }

            MVE_Players += '</tr>';

            $('#MVE_Players').append(MVE_Players);
        }
    });

    if ($('#MVE_TopPlayers').is(':visible')) $('#MVE_Players_Outer').after( $('#MVE_TopPlayers') );

    setTimeout(function() {
        let $table = $('#MVE_Players'), $column, prevMax;
        for (let i=2; i<=7; i++) {
            $column = $('#MVE_Players tr:gt(0) td:nth-child('+i+')');
            prevMax = 0;
            $( $column ).each(function(k, v) {
                if (!$(this).closest('tr').hasClass('MVE_HighlightSelf')) {
                    if ($(this).data('raw') > prevMax) {
                        $($column).removeClass('MVE_Max');
                        $(this).addClass('MVE_Max');
                        prevMax = $(this).data('raw');
                    } else if ($(this).data('raw') === prevMax) {
                        $(this).addClass('MVE_Max');
                    }
                }
            });
        }
    }, 500);

    $('#MVE_Players_Header').find('th').on('click', function(e, preventReverse) {
        if ($(this).index() <= 6) {
            if ($(this).index() !== GM_getValue('MVE_SortBy', $(this).index())) this.asc = false;
            GM_setValue('MVE_SortBy', $(this).index()); //save the header we're sorting by
            $('#MVE_Players').find('th').css('text-decoration', 'none');
            $(this).css('text-decoration', 'underline');
            let table = $('#MVE_Players tbody');
            let rows = table.find('tr').toArray().sort(comparer($(this).index()));
            if (!preventReverse) {
                this.asc = !this.asc;
                if (!this.asc) rows = rows.reverse();
            }
            for (let i = 0; i < rows.length; i++) { table.append(rows[i]); }
        }
    });

    //sort the table by last saved...
    $('#MVE_Players_Header').find('th:eq('+GM_getValue('MVE_SortBy', 1)+')').trigger('click', true);
}

function compareOnKey(k1, k2) {
    return function(a, b) {
        if (a[k1] === b[k1]) {
            if (a[k2] === b[k2]) {
                return ((b.totalWith+b.totalAgainst) < (a.totalWith+a.totalAgainst)) ? -1 : ((b.totalWith+b.totalAgainst) > (a.totalWith+a.totalAgainst)) ? 1 : 0;
            } else {
                return (b[k2] < a[k2]) ? -1 : 1;
            }
        } else {
            return (b[k1] < a[k1]) ? -1 : 1;
        }
    };
}

function showFavorites() {
    let players = GM_getValue('playersData', {});
    let n = GM_getValue('ShowFavoritesAmount', 5);
    let all = [];

    $('#MVE_TopPlayers').remove();

    $.each(players, function(key, value) {
        let totalWith = value.with.win + value.with.loss;
        let totalAgainst = value.against.win + value.against.loss;

        if (GM_getValue('MinimumGames', 0) <= totalWith + totalAgainst) {
            if (key !== '♥') {
                all.push( { name:key, totalWith:totalWith, totalAgainst:totalAgainst, withWin:value.with.win, withLoss:value.with.loss, againstWin:value.against.win, againstLoss:value.against.loss,
                            withWinP:value.with.win/(totalWith||1)*100, withLossP:value.with.loss/(totalWith||1)*100, againstWinP:value.against.win/(totalAgainst||1)*100, againstLossP:value.against.loss/(totalAgainst||1)*100 } );
            }
        }
    });

    if (all.length >= n) {
        $('#MVE').append('<table id="MVE_TopPlayers"><tr><th style="background:darkgreen">Win Most With</th><th style="background:darkgreen">Win Most Against</th><th style="background:darkred">Lose Most With</th><th style="background:darkred">Lose Most Against</th></tr></table>');
        for (let i=0; i<n; i++) { $('#MVE_TopPlayers').append('<tr><td>-</td><td>-</td><td>-</td><td>-</td></tr>'); }

        all.sort(compareOnKey('withWinP', 'totalWith'));
        for (let i=0; i<n; i++) {
            $('#MVE_TopPlayers').find('tr:eq('+(i+1)+')').find('td:eq(0)').text( all[i].name + ' (' + all[i].withWinP.toFixed(2) + '%)' );
        }

        all.sort(compareOnKey('againstWinP', 'totalAgainst'));
        for (let i=0; i<n; i++) {
            $('#MVE_TopPlayers').find('tr:eq('+(i+1)+')').find('td:eq(1)').text( all[i].name + ' (' + all[i].againstWinP.toFixed(2) + '%)' );
        }

        all.sort(compareOnKey('withLossP', 'totalWith'));
        for (let i=0; i<n; i++) {
            $('#MVE_TopPlayers').find('tr:eq('+(i+1)+')').find('td:eq(2)').text( all[i].name + ' (' + all[i].withLossP.toFixed(2) + '%)' );
        }

        all.sort(compareOnKey('againstLossP', 'totalAgainst'));
        for (let i=0; i<n; i++) {
            $('#MVE_TopPlayers').find('tr:eq('+(i+1)+')').find('td:eq(3)').text( all[i].name + ' (' + all[i].againstLossP.toFixed(2) + '%)' );
        }
    }
}

if ($('#MVE').length) {
    makeData();

    if (GM_getValue('ShowAllPlayers', true)) showData();
    if (GM_getValue('ShowFavorites', true)) showFavorites();

    GM_addStyle('#MVE_Players { margin:5px auto; font-size:10px; color:#bbb; line-height:8px; text-align:center; border-collapse:collapse; border-spacing:1px; cursor:default }');
    GM_addStyle('#MVE_Players .MVE_Players_Name { min-width:80px; max-width:80px; border:1px solid #555; }');
    GM_addStyle('#MVE_Players td { border:1px solid #555; }');
    GM_addStyle("#MVE_Players tbody tr:hover { background:rgba(50,100,222,0.33) }");
    GM_addStyle('#MVE_Players th.MVE_With { border:1px solid #555; color:green; }');
    GM_addStyle('#MVE_Players th.MVE_Against {border:1px solid #555; color:yellow; }');
    GM_addStyle('.MVE_Total { border:1px solid #555; color:dodgerblue; }');
    GM_addStyle('.MVE_Win {border:1px solid #555; color:lightgreen; }');
    GM_addStyle('.MVE_Loss {border:1px solid #555; color:coral; }');
    GM_addStyle('.MVE_Stats {border:1px solid #555; }');
    GM_addStyle('.MVE_Stat_Odd {border:1px solid #555; color:darkcyan; }');
    GM_addStyle('.MVE_Stat_Even {border:1px solid #555; color:lightskyblue; }');
    GM_addStyle(".MVE_HighlightSelf { background:rgba(150,200,255,0.25) }");
    GM_addStyle('.MVE_Max { color:gold }');
    GM_addStyle('.MVE_Small { min-width:25px; max-width:25px; }');
    GM_addStyle('.MVE_Medium { min-width:45px; max-width:45px; }');
    GM_addStyle('.MVE_Large { min-width:65px; max-width:65px; }');

    GM_addStyle('#MVE input { margin:0; padding:0; height:17px; color:black; font:11px Arial; }');
    GM_addStyle('#MVE input[type="checkbox"] { width:11px; height:11px; }');
    GM_addStyle('#MVE label { margin:0 4px 0 0; }');

    GM_addStyle('#MVE_Players_Outer { margin:0 auto; overflow-x:hidden; overflow-y:auto; }');
    GM_addStyle('#MVE_Players tbody::-webkit-scrollbar { width:2px }');
    GM_addStyle('#MVE_Players tbody::-webkit-scrollbar-thumb { background:dodgerblue; border-radius:2px; }');
    GM_addStyle('#MVE_Players tbody::-webkit-scrollbar-track { background:#ddd; border-radius:2px; }');

    GM_addStyle('#MVE_TopPlayers { margin:5px auto; font-size:11px; color:#bbb; text-align:center; border-collapse:collapse; cursor:default }');
    GM_addStyle('#MVE_TopPlayers th { color:#eee; font-weight:bold; border:1px solid #569; }');
    GM_addStyle('#MVE_TopPlayers td { padding:0 10px; border:1px solid #569; }');
}



//helpers...

function secondsToHMS(d) {
    d = Number(d);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}

function comparer(index) {
    return function(a, b) {
        let valA = getCellValue(a, index), valB = getCellValue(b, index);
        return $.isNumeric(valA) && $.isNumeric(valB) ? valB - valA : valA.localeCompare(valB);
    };
}
function getCellValue(row, index) {
    return $(row).children('td').eq(index).data('raw');
}

function WhichPageAreWeOn() {
    if (location.port || location.pathname === '/game') { //In a real game
        return('ingame');
    } else if (location.pathname === '/games/find') { //Joining page
        return('joining');
    } else if (location.pathname === '/') { //Chosen server homepage
        return('server');
    } else if (location.pathname.indexOf('/profile/') >= 0) {
        if ($('#saveSettings').length) {
            return('profile'); //Our profile page and logged in
        } else {
            return('profileNotOurs'); //Profile page, but not our one (or we're logged out)
        }
    } else if (location.pathname === '/groups') {
        return('groups');
    } else if (location.pathname === '/boards') {
        return('boards');
    } else if (location.pathname === '/maps') {
        return('maps');
    } else if (location.pathname === '/textures') {
        return('textures');
    }
}
})();