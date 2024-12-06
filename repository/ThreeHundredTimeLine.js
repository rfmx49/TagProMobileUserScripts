// ==UserScript==
// @name            Rolling 300 Timeline
// @description     Shows your Rolling 300 Timeline & Streaks (using the official game data) on your chosen server homepage.
// @version         2.0.10
// @match           all
// @require         https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.3.0/Chart.min.js
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_addStyle
// @updateURL       https://gist.github.com/nabbynz/23a54cace27ad097d671/raw/TagPro_Rolling300Timeline.user.js
// @downloadURL     https://gist.github.com/nabbynz/23a54cace27ad097d671/raw/TagPro_Rolling300Timeline.user.js
// @license         GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author          nabby
// ==/UserScript==


(function() {
    //TagPro Android Create Methods for GM_setValue, GM_getValue, and GM_deleteValue,
    //Will store these values into localStorage as strings.
    var userScriptKey = "GM_R300";

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
			version: "2.0.10",
			author: "nabby"
		}
	}

	//Load required libaraies
	function loadScript(url, callback) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onload = callback; // Set the callback function to execute once the script is loaded
		document.head.appendChild(script);
	}

	console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

	// Specify the URL of the external JavaScript file
	var externalScriptURL = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.3.0/Chart.min.js';
	console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');
	function loadR300Script(){
		console.log('START: ' + GM_info.script.name + ' (v' + GM_info.script.version + ' by ' + GM_info.script.author + ')');

		/* eslint-env jquery */
		/* eslint-disable no-multi-spaces */
		/* eslint-disable dot-notation */
		/* globals tagpro, tagproConfig, Chart */

		'use strict'


		var windowPosition_Home = 'middle';   //can be: 'top', 'middle' or 'bottom'
		var windowPosition_Profile = 'top';   //can be: 'top' or 'bottom'
		var windowPosition_Joiner = 'bottom'; //can be: 'top' or 'bottom'




		/*************************************************************************************************************************************/
		var $uHome = $('#userscript-home');
		var $uTop = $('#userscript-top');
		var $uBottom = $('#userscript-bottom');


		var options = { //defaults
			//Best not to edit these ones (you can select them through the on-page menu)...
			'R300MainPages':                          { display:'Home,Profile,Joiner',                           type:'checkbox',      value:0,             title:'Home,Profile'},
			'R300HeaderPages':                        { display:'Home,Profile,Joiner,Game',                      type:'checkbox',      value:0,             title:'Home,Profile,Joiner,Game'},
			'R300HeaderShowNGames':                   { display:'# Oldest/Newest Games in Header: ',             type:'number',        value:3,             title:'Oldest & Newest'},
			'MaxR300Games':                           { display:'# Games to View: ',                             type:'overwritten',   value:50,            title:''},
			'ShowR300Timeline':                       { display:'Show Timeline',                                 type:'checkbox',      value:true,          title:''},
			'ShowR300Intervals':                      { display:'Show Win % Bands for...',                       type:'checkbox',      value:true,          title:''},
			'R300WinBands':                           { display:'20,25,30,50,75,100,150',                        type:'subradio',      value:50,            title:''},
			'ShowR300WinPercentage':                  { display:'Show Win %',                                    type:'checkbox',      value:true,          title:''},
			'ShowR300Count':                          { display:'Show Count',                                    type:'checkbox',      value:true,          title:''},
			'ShowR300HighestLowestEver':              { display:'Show Highest/Lowest %\'s (ever)',               type:'checkbox',      value:true,          title:''},
			'ShowR300CTFNF':                          { display:'Show CTF/NF Win %\'s',                          type:'checkbox',      value:true,          title:''},
			'ShowR300OldestGame':                     { display:'Show "Oldest Game"',                            type:'checkbox',      value:false,         title:''},
			'ShowR300NextGameAffect':                 { display:'Show "Next Game" effect',                       type:'checkbox',      value:true,          title:''},
			'ShowR300GamesPieChart':                  { display:'Show Pie Chart',                                type:'checkbox',      value:true,          title:''},
			'ShowR300BestStreak':                     { display:'Show Best Streak',                              type:'checkbox',      value:true,          title:''},
			'ShowR300CurrentStreak':                  { display:'Show Current Streak',                           type:'checkbox',      value:true,          title:''},
			'ShowR300WinStreakMessage':               { display:'Show "Best Streak" Messages',                   type:'checkbox',      value:true,          title:'Show messages like: &quot;You are currently on your best win streak!&quot;'},
			'ShowR300LossStreakMessage':              { display:'Show "Worst Streak" Messages',                  type:'checkbox',      value:false,         title:'Show messages like: &quot;You are currently on your worst losing streak&quot;'},
			'ShowR300PerDayGraph':                    { display:'Show # Games Per Day Graph',                    type:'checkbox',      value:true,          title:''},
			'ShowR300PerDay':                         { display:'Show # Games Per Day',                          type:'checkbox',      value:true,          title:''},
			'ShowR300PUPs':                           { display:'Show My Average Stats',                         type:'checkbox',      value:true,          title:''},
			'ShowR300PUPsPerGame':                    { display:'Show values as "Per-Game"',                     type:'overwritten',   value:true,          title:'Click to change between per-game averages & totals'},
			'ShowOtherPlayers':                       { display:'Show Other Players Win%',                       type:'checkbox',      value:true,          title:''},
			'ShowR300ShowGap':                        { display:'Show a gap between games in Timeline',          type:'checkbox',      value:true,          title:''},
			'ShowBoxShadowBorder':                    { display:'Show Shadow around Border?',                    type:'checkbox',      value:false,         title:''},

			'ShowLessThan300GamesWarning':            { display:'Show the "Mini Selection" Window',              type:'checkbox',      value:true,          title:''},
			'ShowR300TrimmedGamesPieChart':           { display:'Show Mini Pie Chart',                           type:'checkbox',      value:true,          title:''},
			'ShowR300TrimmedPUPs':                    { display:'Show Power-Up Stats',                           type:'checkbox',      value:true,          title:''},
			'AlwaysShowLastDayPlayed':                { display:'Always Start With Last Day Played',             type:'checkbox',      value:true,          title:''},

			//You can manually edit the "value" for these options if you want (but they will revert when the script updates)...
			'Win_Color':                              { display:' Color for a "Win"',                            type:'manual',        value:'#22DD22',     title:''},
			'Loss_Color':                             { display:' Color for a "Loss"',                           type:'manual',        value:'#EE2020',     title:''},
			'DC_Color':                               { display:' Color for a "DC (Loss)"',                      type:'manual',        value:'#FFFF00',     title:''},
			'SSA_Color':                              { display:' Color for a "Successful Save Attempt (Win)"',  type:'manual',        value:'#166C16',     title:''},
			'FSA_Color':                              { display:' Color for a "Unsuccessful Save Attempt"',      type:'manual',        value:'#157798',     title:''},
			'Tie_Color':                              { display:' Color for a "Tie (Loss)"',                     type:'manual',        value:'#ff9900',     title:''},
			'Unknown_Color':                          { display:' Color for a "Unknown"',                        type:'manual',        value:'#888888',     title:''}, //just in case!

			//These are updated by the script...
			'R300SavedGames':                         { type:'script', display:'', value:'' },
		};
		var R300_Selections; // = options;

		var $R300_Timeline;
		var $R300_Messages;
		var $R300T_Timeline;
		var $R300T_Messages;

		//Header div...
		var WinP_Div = '<div id="R300_WinNextHeader" style="position:relative; width:100%; top:1px; font-size:12px;font-weight:bold; color:#fff; text-align:center; text-shadow:1px 2px 1px #222; clear:both"></div>';


		$.get('https://i.imgur.com/WKZPcQA.gif'); //preload the ajax loading gif

		function secondsToHMS(d) {
			d = Number(d);
			var h = Math.floor(d / 3600);
			var m = Math.floor(d % 3600 / 60);
			var s = Math.floor(d % 3600 % 60);
			return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
		}

		function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max){
			return (maxAllowed-minAllowed) * (unscaledNum-min) / (max-min || 1) + (max-min ? minAllowed : maxAllowed);
		}

		function capitaliseFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		var WhichPageAreWeOn = function() {
			if (window.location.pathname === '/game' && !tagproConfig.replay) { //In a real game
				return('ingame');
			} else if (document.URL.includes('/games/find')) { //Joining page
				return('joining');
			} else if ($('#userscript-home').length) { //Chosen server homepage
				return('server');
			} else if (document.URL.includes('/profile/')) {
				if ($('#saveSettings').length) {
					return('profile'); //Profile page and logged in
				} else {
					return('profileNotOurs'); //Profile page, but not our one (or we're logged out)
				}
			} else if (document.URL.includes('/groups')) {
				return('groups');
			} else if (document.URL.includes('/boards')) {
				return('boards');
		    } else if (document.URL.includes('/leaders')) {
                return('boards');
			} else if (document.URL.includes('/maps')) {
				return('maps');
			} else if (document.URL.includes('/settings')) {
				return('settings');
			} else if (document.URL.includes('/textures')) {
				return('textures');
			}
		};
		var PageLoc = WhichPageAreWeOn();

		function getUsefulText(value, what){
			if (what == 'gamemode') {
				if (value === 1) {
					return 'CTF';
				} else if (value === 2) {
					return 'Neutral Flag';
				} else {
					return '';
				}
			} else if (what == 'outcome') {
				if (value === '10') { //value must be passed as a string ('outcome'+'saved')
					return 'Win';
				} else if (value === '20') {
					return 'Loss';
				} else if (value === '30') {
					return 'DC';
				} else if (value === '41') {
					return 'Unsuccessful Save Attempt';
				} else if (value === '12') {
					return 'Successful Save Attempt';
				} else if (value === '50') {
					return 'Tie';
				}
			}
		}

		function getOldestGamesBlock(data, numberGamesToShow) {
			if (numberGamesToShow === 0) {
				return '';
			} else {
				numberGamesToShow = numberGamesToShow || 3;
			}

			if (data.length > numberGamesToShow) {
				var blocks = '<div style="display:inline-block; margin-right:5px" title="Oldest '+numberGamesToShow+' Games">';
				for (var i=0; i<(numberGamesToShow); i++) {
					if (data[i].outcome === 1) {
						if (data[i].saved === 2) {
							blocks += '<div class="fl_ssa" title="'+getGameInfoAsText(data[i])+'"></div>';
						} else {
							blocks += '<div class="fl_win" title="'+getGameInfoAsText(data[i])+'"></div>';
						}
					} else if (data[i].outcome === 2) {
						blocks += '<div class="fl_loss" title="'+getGameInfoAsText(data[i])+'"></div>';
					} else if (data[i].outcome === 3) {
						blocks += '<div class="fl_dc" title="'+getGameInfoAsText(data[i])+'"></div>';
					} else if (data[i].outcome === 4) { //Save Attempt
						if (data[i].saved === 1) { //Unsuccessful
							blocks += '<div class="fl_fsa" title="'+getGameInfoAsText(data[i])+'"></div>';
						}
					} else if (data[i].outcome === 5) { //Tie
						blocks += '<div class="fl_tie" title="'+getGameInfoAsText(data[i])+'"></div>';
					} else { //Unknown
						blocks += '<div class="fl_unk" title="'+getGameInfoAsText(data[i])+'"></div>';
					}
				}
				blocks+= '</div>';
				return blocks;
			} else {
				return '';
			}
		}

		function getLatestGamesBlock(data, numberGamesToShow) {
			if (numberGamesToShow === 0) {
				return '';
			} else {
				numberGamesToShow = numberGamesToShow || 3;
			}

			if (data.length > numberGamesToShow) {
				var blocks = '<div style="display:inline-block; margin-left:5px" title="Latest '+numberGamesToShow+' Games">';
				for (var i=data.length-numberGamesToShow; i<data.length; i++) {
					if (data[i].outcome === 1) {
						if (data[i].saved === 2) {
							blocks += '<div class="fl_ssa" title="'+getGameInfoAsText(data[i])+'"></div>';
						} else {
							blocks += '<div class="fl_win" title="'+getGameInfoAsText(data[i])+'"></div>';
						}
					} else if (data[i].outcome === 2) {
						blocks += '<div class="fl_loss" title="'+getGameInfoAsText(data[i])+'"></div>';
					} else if (data[i].outcome === 3) {
						blocks += '<div class="fl_dc" title="'+getGameInfoAsText(data[i])+'"></div>';
					} else if (data[i].outcome === 4) { //Save Attempt
						if (data[i].saved === 1) { //Unsuccessful
							blocks += '<div class="fl_fsa" title="'+getGameInfoAsText(data[i])+'"></div>';
						}
					} else if (data[i].outcome === 5) { //Tie
						blocks += '<div class="fl_tie" title="'+getGameInfoAsText(data[i])+'"></div>';
					} else { //Unknown
						blocks += '<div class="fl_unk" title="'+getGameInfoAsText(data[i])+'"></div>';
					}
				}
				blocks+= '</div>';
				return blocks;
			} else {
				return '';
			}
		}

		function getNextGamePercentage(data) {
			var i, wins=0, losses=0;
			var IfWin='', IfLose='';

			for (i=0; i<data.length; i++) {
				if (data[i].outcome == 1) {
					wins++;
				} else if ((data[i].outcome == 2) || (data[i].outcome == 3) || (data[i].outcome == 5)) {
					losses++;
				}
			}
			if (data[0].outcome === 1) {
				if (data.length < 300) {
					IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
					IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
					return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
				} else if (data.length === 300) {
					IfLose = ((wins-1) / (wins-1+losses+1) * 100).toFixed(2);
					return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next: No effect</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
				}
			} else if ((data[0].outcome === 2) || (data[0].outcome == 3)) {
				if (data.length < 300) {
					IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
					IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
					return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
				} else if (data.length === 300) {
					IfWin = ((wins+1) / (wins+1+losses-1) * 100).toFixed(2);
					return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next: No effect</span>');
				}
			} else if (data[0].outcome === 4) { //Save Attempt
				if (data[0].saved === 1) { //Unsuccessful
					IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
					IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
					return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
				}
			} else if (data[0].outcome === 5) { //Tie
				if (data.length < 300) {
					IfWin = ((wins+1) / (wins+1+losses) * 100).toFixed(2);
					IfLose = ((wins) / (wins+losses+1) * 100).toFixed(2);
					return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next:&#42780;'+IfLose+'%</span>');
				} else if (data.length === 300) {
					IfWin = ((wins+1) / (wins+1+losses-1) * 100).toFixed(2);
					return ('<span style="color:'+R300_Selections.Win_Color.value+'">Win Next:&#42779;'+IfWin + '%</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">Lose Next: No effect</span>');
				}
			} else {
				return '';
			}
		}

		function getWinPercentage(data) {
			var i, wins=0, losses=0;
			if (data.length) {
				for (i=0; i<data.length; i++) {
					if (data[i].outcome == 1) {
						wins++;
					} else if ((data[i].outcome == 2) || (data[i].outcome == 3) || (data[i].outcome == 5)) {
						losses++;
					}
				}
				return (wins / (wins+losses) * 100).toFixed(2);
			}
		}

		function getGamesTilNextFlair(data, winP) { //thanks Snaps!
			var thresholds = [55, 65, 75];
			var threshold;
			var outcomes = data.map(function (d) { return d.outcome; });
			for (var i = 0; i < thresholds.length; i++) {
				if (winP < thresholds[i]) {
					threshold = thresholds[i];
					break;
				}
			}
			if (!threshold) return false;
			function getPct(vals) {
				return vals.goods / (vals.goods + vals.bads);
			}
			var bads = [2, 3, 5];
			var vals = outcomes.reduce(function (vals, outcome) {
				if (outcome === 1) {
					vals.goods++;
				} else if (bads.indexOf(outcome) !== -1) {
					vals.bads++;
				}
				return vals;
			}, { goods: 0, bads: 0 });

			var winsNeeded = 0;
			var game = 0;
			while (getPct(vals) * 100 < threshold && game < outcomes.length) {
				var outcome = outcomes[game];
				if (bads.indexOf(outcome) !== -1) {
					vals.goods++;
					vals.bads--;
				} else if (outcome === 4) {
					vals.goods++;
				}
				winsNeeded++;
				game++;
			}
			return {
				wins: winsNeeded,
				goal: threshold
			};
		}

		function showWinPercentageHeader(data) {
			if (data === undefined) data = allGames.slice(0); //data = $.extend(true, [], allGames);

			var blocks = "";

			// Oldest games...
			blocks += '<div style="display:inline-block">'+getOldestGamesBlock(data, R300_Selections.R300HeaderShowNGames.value)+'</div>';

			// Current Win %...
			var winP = getWinPercentage(data);
			blocks += '<div style="display:inline-block">Current: ' + winP + '%&nbsp;|&nbsp;</div>';

			// Predicted Win %...
			blocks += '<div class="R300_Stats_Dependent" style="display:inline-block; color:#bbb">' + getNextGamePercentage(data) + '</div>';

			// # of games to next % flair...
			var nextFlairInfo = getGamesTilNextFlair(data, winP);
			if (nextFlairInfo) {
				blocks += '&nbsp;|&nbsp;<div class="R300_Stats_Dependent" style="display:inline-block; color:#bbb">' + nextFlairInfo.wins + ' wins needed for ' + nextFlairInfo.goal + '% flair</div>';
			} else {
				blocks += '&nbsp;|&nbsp;<div class="R300_Stats_Dependent" style="display:inline-block; color:#bbb">You\'re above 75%!</div>';
			}

			// Most recent games....
			blocks += '<div style="display:inline-block">'+getLatestGamesBlock(data, R300_Selections.R300HeaderShowNGames.value)+'</div>';
			$('#R300_WinNextHeader').append(blocks);

			$('.fl_win').css ({ 'display':'inline-block', 'border-radius':'2px', 'margin-left':'1px'        , 'background-color':R300_Selections.Win_Color.value,     'height':'8px', 'width':'8px' });
			$('.fl_loss').css({ 'display':'inline-block', 'border-radius':'2px', 'margin-left':'1px'        , 'background-color':R300_Selections.Loss_Color.value,    'height':'8px', 'width':'8px' });
			$('.fl_dc').css  ({ 'display':'inline-block', 'border-radius':'2px', 'margin'     :'0 0 2px 1px', 'background-color':R300_Selections.DC_Color.value,      'height':'4px', 'width':'8px' });
			$('.fl_ssa').css ({ 'display':'inline-block', 'border-radius':'2px', 'margin-left':'1px'        , 'background-color':R300_Selections.SSA_Color.value,     'height':'6px', 'width':'8px', 'border-top'   :'2px solid white' });
			$('.fl_fsa').css ({ 'display':'inline-block', 'border-radius':'2px', 'margin-left':'1px'        , 'background-color':R300_Selections.FSA_Color.value,     'height':'6px', 'width':'8px', 'border-bottom':'2px solid white' });
			$('.fl_tie').css ({ 'display':'inline-block', 'border-radius':'2px', 'margin-left':'1px'        , 'background-color':R300_Selections.Tie_Color.value,     'height':'8px', 'width':'8px' });
			$('.fl_unk').css ({ 'display':'inline-block', 'border-radius':'2px', 'margin-left':'1px'        , 'background-color':R300_Selections.Unknown_Color.value, 'height':'8px', 'width':'8px' });

			//add strikethrough if stats are off...
			var getProfilePage = $.get('/profile/'+data[0].userId);
			getProfilePage.done(function(settings) {
				if ($(settings).find('#stats').children('input').length) { //will only be available if it's our profile
					var statsOn = true;
					statsOn = $(settings).find('#stats').children('input').is(':checked');
					if (statsOn === false) {
						$('.R300_Stats_Dependent').css('text-decoration', 'line-through').css('text-shadow', 'none').attr('title', 'Stats are OFF');
					}
				}
			});
		}

		function getProfileID() {
			var url, R300ProfileID;
			if (PageLoc === 'server') {
				//url = $('a[href^="/profile"]').attr('href');
				url = $('#profile-btn').attr('href');
				console.log('PageLoc:',PageLoc, 'url:',url);
				if (url !== undefined) {
					R300ProfileID = url.substring(url.lastIndexOf('/') + 1);
					console.log('PageLoc:',PageLoc, 'R300ProfileID:',R300ProfileID);
					R300_Selections.R300SavedGames.display = R300ProfileID;
					GM_setValue('R300_Selections', R300_Selections);
					return R300ProfileID;
				} else { //on server home page, but not logged in so clear the saved games data & profile id
					R300_Selections.R300SavedGames.display = ''; //holds profile id
					R300_Selections.R300SavedGames.value = ''; //holds saved game data
					GM_setValue('R300_Selections', R300_Selections);
				}

			} else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
				url = document.URL + "?";
				R300ProfileID = url.substring(url.lastIndexOf('/') + 1, url.indexOf('?')); //R300ProfileID = url.substring(url.lastIndexOf('/') + 1); //ArryKane Change
				console.log('PageLoc:',PageLoc, 'R300ProfileID:',R300ProfileID);
				return R300ProfileID;
			}
		}

		var allGames = [];

		function okToRequestServerData() { //we're only allowed to request the data up to 5 times per minute. Try and make sure we don't exceed this limit.
			var serverRequests = GM_getValue('serverRequests', []);
			var gotCount = 0;
			if (serverRequests.length > 0) {
				for (var i=serverRequests.length; i>=0; i--) {
					if (serverRequests[i] > Date.now()-60000) gotCount++;
				}
			}

			if (gotCount < 5) {
				return true;
			} else {
				return false;
			}
		}


		function loadData() {
			var profileID = getProfileID();

			if (profileID !== undefined) {
				var serverRequests = GM_getValue('serverRequests', []);
				console.log("serverRequests" + serverRequests)
				var gotCount = 0;
				if (serverRequests.length > 0) {
					for (var i=serverRequests.length; i>=0; i--) {
						if (serverRequests[i] > Date.now()-60000) gotCount++;
					}
				}

				if (gotCount >= 4) {
					$('#R300').prepend('<div style="margin:5px 10px; padding:10px 2px; background:#f00; color:#fff; border-radius:3px">WARNING<br>If you request/refresh this data too often you <em>may</em> be blocked from accessing it for 1 hour.<br>(Try again in 1-2 minutes)</div>');
				}

				if (okToRequestServerData()) {
					$.getJSON("/profile_rolling/" + profileID).done(function(data) {
						serverRequests.push(Date.now());
						if (serverRequests.length > 5) serverRequests.shift();
						GM_setValue('serverRequests', serverRequests);
						if (data.length > 0) {
							data.reverse();
							for (var key=0, l=data.length; key<l; key++) {
								data[key].gameNumber = (data.length - key);
							}
							allGames = $.extend(true, [], data);
							R300_Selections.R300SavedGames.value = $.extend(true, [], data); //data;
							if (PageLoc !== 'profileNotOurs') {
								GM_setValue('R300_Selections', R300_Selections);
							}
							$('#R300_loading').remove();
							$('#R300_Trimmed').show(0);
							showData();
							showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
							showWinPercentageHeader(data);
							buildMenu();
							bindEvents();
							setSavedValues();
							$('#R300').fadeIn();
						} else {
							$('#R300_Settings_Button').hide(0);
							$('#R300').empty();
							$('#R300').append('No data for Rolling 300 Timeline - go play some games!');
							$('#R300').fadeIn();
						}
					}).fail(function(jqxhr, textStatus, error){
						if ((PageLoc !== 'profileNotOurs') && (R300_Selections.R300SavedGames.value.length > 0)) {
							$('#R300_loading').remove();
							$('#R300').prepend('<div style="margin:5px 10px; padding:10px 2px; background:#b0b; color:#fff; border-radius:3px">Could not get data from server for Rolling 300 Timeline: <i>' + jqxhr.status + ' ' + error + '</i>' + ((jqxhr.status === 500) ? '<br>(Probably too many requests/refreshes too often - wait 1 hour for this to clear)' : '') + '<br>Using saved data instead (this might not be accurate)...</div>');
							var data = $.extend(true, [], R300_Selections.R300SavedGames.value);
							allGames = $.extend(true, [], data);
							showWinPercentageHeader(data);
							if ($('#R300').length) {
								$('#R300_Trimmed').show(0);
								showData();
								showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
								buildMenu();
								bindEvents();
							}
							setSavedValues();
						} else {
							$('#R300_Settings_Button').hide(0);
							$('#R300').empty();
							$('#R300').append('Could not get data from server for Rolling 300 Timeline: <i>' + jqxhr.status + ' ' + error + '</i>');
							$('#R300').fadeIn();
						}
					});
				} else {
					$('#R300_loading').remove();
					$('#R300').empty();
					$('#R300').append('Too many requests/refreshes. Please wait 1-2 minutes...');
					$('#R300').fadeIn();
				}
			} else {
				if (R300_Selections.R300SavedGames.value.length === 0) {
				    let GM_R300_Selections = GM_getValue('R300_Selections'); //ArryKane Added nested GM_getValue fix
					//if (GM_getValue('R300_Selections').R300SavedGames.value.length) {
					if (GM_R300_Selections.R300SavedGames.value.length) {
						//R300_Selections.R300SavedGames.value = GM_getValue('R300_Selections').R300SavedGames.value;
						R300_Selections.R300SavedGames.value = GM_R300_Selections.R300SavedGames.value;
					}
				}
				if (R300_Selections.R300SavedGames.value.length) { //use saved data if it exists...
					var data = R300_Selections.R300SavedGames.value;
					allGames = $.extend(true, [], data);
					showWinPercentageHeader(data);
					if ($('#R300').length) {
						//$('#R300_InnerContainer').append('<div style="width:60%; margin:0 auto; background:#b0b; color:#fff; border-radius:3px">Note: Using saved data</div>');
						$('#R300_Trimmed').show(0);
						showData();
						showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
						buildMenu();
						bindEvents();
						$('#R300').fadeIn();
					}
					setSavedValues();
				} else {
					$('#R300_Settings_Button').hide(0);
					$('#R300').empty();
					$('#R300').append('Could not get data for Rolling 300 Timeline (not logged in?)');
					$('#R300').fadeIn();
				}
			}
			GM_addStyle('.R300_CTFNFWP:hover { border-bottom:1px dotted #9264DA }');
		}


		//Other Players R300 Win Percentages...
		function showProfiles() {
			var profilesData = GM_getValue('profilesData', []);
			var sortby = GM_getValue('R300_OtherPlayersStats_Sortby', 'winRate');
			var title;

			$('#R300_OtherPlayersStats').find('.R300_OtherPlayerStats').remove();

			profilesData.sort( function(a, b) {
				if (sortby === 'reservedName') {
					return a.reservedName.toLowerCase().localeCompare(b.reservedName.toLowerCase());
				} else if (sortby === 'bestWinRate') {
					return (b.stats.rollingCache.bestWinRate - a.stats.rollingCache.bestWinRate);
				} else if (sortby === 'today') {
					return (b.games.today - a.games.today);
				} else if (sortby === 'week') {
					return (b.games.week - a.games.week);
				} else if (sortby === 'month') {
					return (b.games.month - a.games.month);
				} else {
					return (b.stats.rollingCache.winRate - a.stats.rollingCache.winRate);
				}
			});

			for (var i=0; i<profilesData.length; i++) {
				title = '';
				if (profilesData[i].games.today) title += "Today: " + (profilesData[i].won.today / (profilesData[i].games.today - profilesData[i].stats.today.saveAttempts + profilesData[i].stats.today.saved) * 100).toFixed(2) + "% (" + profilesData[i].games.today + " games)";
				else title += "Today: No games played";
				if (profilesData[i].games.week) title += "\nWeek: " + (profilesData[i].won.week / (profilesData[i].games.week - profilesData[i].stats.week.saveAttempts + profilesData[i].stats.week.saved) * 100).toFixed(2) + "% (" + profilesData[i].games.week + " games)";
				else title += "\nWeek: No games played";
				if (profilesData[i].games.month) title += "\nMonth: " + (profilesData[i].won.month / (profilesData[i].games.month - profilesData[i].stats.month.saveAttempts + profilesData[i].stats.month.saved) * 100).toFixed(2) + "% (" + profilesData[i].games.month + " games)";
				else title += "\nMonth: No games played";

				if (profilesData[i].reservedName === null) profilesData[i].reservedName = (profilesData[i]._id).slice(-12); //the reservedName shows as null if the player has not set a reserved name.

				$('#R300_OtherPlayersStats').append('<div class="R300_OtherPlayerStats"><a href="/profile/'+profilesData[i]._id+'" target="_blank" class="R300_OtherPlayerName" title="View '+profilesData[i].reservedName+'\'s Profile Page...">'+profilesData[i].reservedName+'</a>' +
													'<div><span title="Current Win Rate: ' + (profilesData[i].stats.rollingCache.winRate * 100).toFixed(2) + '%">'+(profilesData[i].stats.rollingCache.winRate * 100).toFixed(2)+'%</span> <span title="Best Win Rate: ' + (profilesData[i].stats.rollingCache.bestWinRate * 100).toFixed(2) + '%">('+(profilesData[i].stats.rollingCache.bestWinRate * 100).toFixed(2)+'%)</span></div>' +
													'<div title="'+title+'"><span' + (profilesData[i].games.today ? ' class="R300_OtherPlayer_HighlightToday"' : '') + '>D:'+profilesData[i].games.today+'</span> W:'+profilesData[i].games.week+' M:'+profilesData[i].games.month+'</div><div class="R300_OtherPlayerStats_Remove" data-profileid="'+profilesData[i]._id+'" title="Remove '+profilesData[i].reservedName+'">X</div></div>');

			}

			$('#R300_OtherPlayersStats_Add_Spin').removeClass('R300_RotateAddText');
		}

		function getProfilesData(newId) {
			var profileIds = GM_getValue('profileIds', []);

			if (profileIds.length) {
				$.getJSON('/profiles/' + profileIds.join(',')).done(function(profilesData) {
					var serverRequests = GM_getValue('serverRequests', []);

					serverRequests.push(Date.now());
					if (serverRequests.length > 5) serverRequests.shift();
					GM_setValue('serverRequests', serverRequests);

					if (profilesData.error) {
						if (newId) { //we tried to add an id that was bad and is causing an error. since it's already in the saved data we need to try and remove it...
							var profilePosition = profileIds.indexOf(newId);
							if (profilePosition >= 0) {
								profileIds.splice(profilePosition, 1);
								GM_setValue('profileIds', profileIds);
							}
							alert("A server error has occurred: " + profilesData.error + "\n\nPlease try again...\n\n\n");
						} else {
							var response = confirm("A server error has occured: " + profilesData.error + "\n\nDo you want to delete/reset all the saved ids?\n\n\n\n");
							if (response) {
								GM_deleteValue('profileIds');
								GM_deleteValue('profilesData');
								showProfiles();
							}
						}
					} else {
						GM_setValue('profilesData', profilesData);
						showProfiles();
					}

				}).fail(function(jqxhr, textStatus, error) {
					if (jqxhr.status === 500) {
						alert("A server error has occurred: " + jqxhr.status + ' ' + error + "\n\nPlease try again in 1 hour...\n\n\n");
					} else {
						if (newId) { //we tried to add an id that was bad and is causing an error. since it's already in the saved data we need to try and remove it...
							var profilePosition = profileIds.indexOf(newId);
							if (profilePosition >= 0) {
								profileIds.splice(profilePosition, 1);
								GM_setValue('profileIds', profileIds);
							}
							alert("A server error has occurred: " + jqxhr.status + ' ' + error + "\n\nPlease try again...\n\n\n");
						} else {
							var response = confirm("A server error has occured: " + jqxhr.status + ' ' + error + "\n\nDo you want to delete/reset all the saved ids?\n\n\n\n");
							if (response) {
								GM_deleteValue('profileIds');
								GM_deleteValue('profilesData');
								showProfiles();
							}
						}
					}
				});
			}
		}

		function setupStats() {
			$('#R300_MessagesPie').after('<div id="R300_OtherPlayersStats"></div>');

			if (PageLoc !== 'joining') {
				$('#R300_OtherPlayersStats').append('<div id="R300_OtherPlayersStats_Add" title="Add Profile Ids..."><span id="R300_OtherPlayersStats_Add_Spin">&#10133;</span></div>');
				$('#R300_OtherPlayersStats').append('<select id="R300_OtherPlayersStats_Sortby">' +
													'<option' + (GM_getValue('R300_OtherPlayersStats_Sortby', 'winRate') === 'reservedName' ? ' selected' : '') + ' value="reservedName">Name</option>' +
													'<option' + (GM_getValue('R300_OtherPlayersStats_Sortby', 'winRate') === 'winRate' ? ' selected' : '') + ' value="winRate">Current Win%</option>' +
													'<option' + (GM_getValue('R300_OtherPlayersStats_Sortby', 'winRate') === 'bestWinRate' ? ' selected' : '') + ' value="bestWinRate">Best Win%</option>' +
													'<option' + (GM_getValue('R300_OtherPlayersStats_Sortby', 'winRate') === 'today' ? ' selected' : '') + ' value="today">#Games Today</option>' +
													'<option' + (GM_getValue('R300_OtherPlayersStats_Sortby', 'winRate') === 'week' ? ' selected' : '') + ' value="week">#Games Week</option>' +
													'<option' + (GM_getValue('R300_OtherPlayersStats_Sortby', 'winRate') === 'month' ? ' selected' : '') + ' value="month">#Games Month</option>' +
													'</select>');

				$('#R300_OtherPlayersStats').after('<div id="R300_OtherPlayersStats_Add_Container"><div id="R300_AddFromPaste_Tab" class="R300_AddFrom">Paste</div><div id="R300_AddFromLB_Tab" class="R300_AddFrom">Boards</div><div id="R300_AddFromPaste"></div><div id="R300_AddFromLB"></div></div>');
				$('#R300_AddFromPaste').append('<div><textarea style="width:261px; height:260px; font-size:11px; background:whitesmoke" placeholder="Paste Profile Id\'s Here\n(e.g.: 519e7e5d6e58644262000052).\n\nSeparate multiple Id\'s with a comma."></textarea></div>');
				$('#R300_AddFromLB').append('<div id="R300_AddFromLB_Outer"><table id="R300_AddFromLB_Table"></table></div>');
				$('#R300_OtherPlayersStats_Add_Container').append('<div><span id="R300_AddFromLB_Update" class="R300_AddFromLB_Button">Update</span> <span id="R300_AddFromLB_Cancel" class="R300_AddFromLB_Button">Cancel</span></div>');

				$('#R300_OtherPlayersStats_Add').on('click', function(e) {
					if (okToRequestServerData()) {
						if (Date.now() - GM_getValue('lastGotLBs', 0) > 60000) {
							$('#R300_OtherPlayersStats_Add_Spin').addClass('R300_RotateAddText');
							setTimeout(function() { $('#R300_OtherPlayersStats_Add_Spin').removeClass('R300_RotateAddText'); }, 5000);
							$.get('/boards/').done(function(data) {
								var profileIds = GM_getValue('profileIds', []);
								var boardsProfileIds = [];
								var profileId;
								var table = [].concat.call($(data).find('#board-Day table tr:gt(0)'), $(data).find('#board-Week table tr:gt(0)'), $(data).find('#board-Month table tr:gt(0)'), $(data).find('#board-Rolling table tr:gt(0)'));

								GM_setValue('lastGotLBs', Date.now());
								$('#R300_AddFromLB_Table').empty();

								$.each(table, function(k, v) {
									$.each(v, function(k1, v1) {
										profileId = v1.cells[1].children[0].href.slice(-24);
										if (boardsProfileIds.indexOf(profileId) === -1) {
											boardsProfileIds.push(profileId);
											$('#R300_AddFromLB_Table').append('<tr><td><input type="checkbox" name="R300_AddFromLB_Check"'+(profileIds.indexOf(profileId) >= 0 ? ' checked' : '')+'></td><td>'+v1.cells[1].children[0].innerText+'</td><td>'+(v1.cells[1].children[0].href).slice(-24)+'</td></tr>');
										}
									});
								});
								GM_setValue('boardsProfileIds', boardsProfileIds);

								var rows = $('#R300_AddFromLB_Table tbody tr').get();
								rows.sort(function(a, b) {
									var A = $(a).children('td').eq(1).text().toLowerCase();
									var B = $(b).children('td').eq(1).text().toLowerCase();
									if (A < B) return -1;
									if (A > B) return 1;
									return 0;
								});
								$.each(rows, function(index, row) {
									$('#R300_AddFromLB_Table').children('tbody').append(row);
								});

								$('#R300_OtherPlayersStats_Add_Spin').removeClass('R300_RotateAddText');
								$('#R300_OtherPlayersStats_Add_Container').show(0);
							});


						} else {
							$('#R300_OtherPlayersStats_Add_Container').show(0);
						}

					} else {
						alert("Cannot add new players right now - please try again in 1 minute...\n\n\n");
					}
				});

				$('#R300_AddFromPaste_Tab').on('click', function() {
					$('#R300_AddFromPaste').show(0);
					$('#R300_AddFromPaste_Tab').css({'color':'black','background':'whitesmoke'});
					$('#R300_AddFromLB').hide(0);
					$('#R300_AddFromLB_Tab').css({'color':'whitesmoke','background':'#424'});
				});
				$('#R300_AddFromLB_Tab').on('click', function() {
					$('#R300_AddFromLB').show(0);
					$('#R300_AddFromLB_Tab').css({'color':'black','background':'whitesmoke'});
					$('#R300_AddFromPaste').hide(0);
					$('#R300_AddFromPaste_Tab').css({'color':'whitesmoke','background':'#424'});
				});

				$('#R300_AddFromLB_Update').on('click', function() {
					var profileIds = GM_getValue('profileIds', []);
					var profileId;
					var gtg = false;

					if ($('#R300_AddFromLB').is(':visible')) {
						var rows = $('#R300_AddFromLB_Table tbody tr').get();
						var isSelected, profilePosition;

						$.each(rows, function(index, row) {
							profileId = $(row).find('td:eq(2)').text();
							isSelected = $(row).find('input').is(':checked');
							profilePosition = profileIds.indexOf(profileId);

							if (isSelected && profilePosition === -1) {
								profileIds.push(profileId);
								gtg = true;
							} else if (!isSelected && profilePosition >= 0) {
								profileIds.splice(profilePosition, 1);
								gtg = true;
							}
						});

						if (gtg) {
							GM_setValue('profileIds', profileIds);
							$('#R300_OtherPlayersStats_Add_Spin').addClass('R300_RotateAddText');
							getProfilesData(profileId);
							setTimeout(function() { $('#R300_OtherPlayersStats_Add_Spin').removeClass('R300_RotateAddText'); }, 5000);
							$('#R300_OtherPlayersStats_Add_Container').fadeOut(400);
						}

					} else if ($('#R300_AddFromPaste').is(':visible')) {
						profileId = $('#R300_AddFromPaste').find('textarea').val();

						if (profileId) {
							//var profileIds = GM_getValue('profileIds', []);
							var arrProfileIds = profileId.split(',');
							var silentErrors = false;
							if (arrProfileIds.length > 1) silentErrors = true;
							if (profileIds.length + arrProfileIds.length > 100) {
								alert("We can only retrieve 100 ids from the server, and you are requesting " + (profileIds.length + arrProfileIds.length) + " ids\n\nSo " + (profileIds.length + arrProfileIds.length - 100) + " will not be added at this time - sorry!");
								arrProfileIds.splice(99 - profileIds.length);
							}

							for (var i=0; i<arrProfileIds.length; i++) {
								profileId = arrProfileIds[i];
								profileId = profileId.trim();
								if (profileId.length < 24) {
									if (silentErrors) console.log('Profile ID Error: The Profile Id should be 24 characters long (' + profileId + ')');
									else alert('The Profile Id should be 24 characters long');
									continue;
								} else if ((profileId.length > 24) && (profileId.indexOf('profile/') >= 0)) {
									var pos = profileId.indexOf('profile/') + 8;
									profileId = profileId.slice(pos, pos+24);
								} else if ((profileId.length > 24) && (profileId.indexOf('/') >= 0)) {
									profileId = profileId.slice(-24);
								}

								if (profileId.length !== 24) {
									if (silentErrors) console.log('Profile ID Error: An unknown error has occurred - please try again (' + profileId + ')');
									else alert("An unknown error has occurred - please try again...\n\n\n");
									continue;
								}

								if (profileIds.indexOf(profileId) >= 0) {
									if (silentErrors) console.log('Profile ID Error: This Profile Id has already been added (' + profileId + ')');
									else alert("This Profile Id has already been added\n\n\n");
									continue;
								} else {
									profileIds.push(profileId);
									gtg = true;
								}
							}

							if (gtg) {
								GM_setValue('profileIds', profileIds);
								$('#R300_OtherPlayersStats_Add_Spin').addClass('R300_RotateAddText');
								getProfilesData(profileId);
								setTimeout(function() { $('#R300_OtherPlayersStats_Add_Spin').removeClass('R300_RotateAddText'); }, 5000); //force stop animation after 5 secs (it will also stop earlier, once data has finished loading)
								$('#R300_OtherPlayersStats_Add_Container').fadeOut(400);
								GM_setValue('lastGotLBs', 0);
							}
						}
					}
				});

				$('#R300_AddFromLB_Cancel').on('click', function() {
					$('#R300_OtherPlayersStats_Add_Container').fadeOut(400);
				});

				$('#R300_AddFromPaste_Tab').trigger('click');

				GM_addStyle('#R300_OtherPlayersStats_Add_Container { display:none; position:absolute; top:20px; left:50%; padding:10px 20px; font-size:11px; color:#000; text-shadow:none; background:#424; border:2px solid whitesmoke; border-radius:5px; }');
				GM_addStyle('.R300_AddFrom { display:inline-block; width:122px; color:#000; font-weight:bold; text-shadow:none; padding:5px; border:1px solid #888; border-radius:5px 5px 0 0; cursor:pointer }');
				GM_addStyle('#R300_AddFromLB_Outer { height:260px; padding-right:4px; overflow-y:auto; overflow-x:hidden; }');
				GM_addStyle('#R300_AddFromLB_Table { margin:0 auto; font-size:10px; background:whitesmoke; text-align:center; border-collapse:collapse; border:1px solid whitesmoke; }');
				GM_addStyle('#R300_AddFromLB_Table td { border:1px solid grey; padding:1px 2px }');
				GM_addStyle('#R300_AddFromLB_Table th { border:1px solid grey; padding:1px 2px; font-size:11px; color:#ddd; background:#666 }');
				GM_addStyle('.R300_AddFromLB_Button { display:inline-block; color:whitesmoke; font-size:12px; margin:10px 20px; padding:5px 20px; cursor:pointer; border:1px solid whitesmoke; border-radius:4px; }');
				GM_addStyle('.R300_AddFromLB_Button:hover { background:rgba(100,255,100,0.5) }');
				GM_addStyle('#R300_AddFromLB_Outer::-webkit-scrollbar { width:5px }');
				GM_addStyle('#R300_AddFromLB_Outer::-webkit-scrollbar-thumb { background:mediumvioletred; border-radius:2px; }');
				GM_addStyle('#R300_AddFromLB_Outer::-webkit-scrollbar-track { background:#ddd; border-radius:2px; }');

				$('#R300_OtherPlayersStats_Sortby').on('change', function() {
					GM_setValue('R300_OtherPlayersStats_Sortby', this.value);
					showProfiles();
				});

				$('#R300_OtherPlayersStats').on('click', '.R300_OtherPlayerStats_Remove', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var profileIds = GM_getValue('profileIds', []);
					var profileId = $(this).data('profileid');
					var profilePosition = profileIds.indexOf(profileId);
					if (profilePosition >= 0) {
						profileIds.splice(profilePosition, 1);
						GM_setValue('profileIds', profileIds);
						$(this).parent().remove();
						var profilesData = GM_getValue('profilesData', []);
						for (var i=0; i<profilesData.length; i++) {
							if (profilesData[i]._id === profileId) {
								profilesData.splice(i, 1); //remove the cached data too
								GM_setValue('profilesData', profilesData);
								break;
							}
						}
					}
					GM_setValue('lastGotLBs', 0);
				});

			}
		}

		function buildMenu() {
			//Build the settings menu...
			$('#R300_Settings_Button').after('<div id="R300_Settings_Menu" style="display:none; position:absolute; right:0; width:360px; margin:-75px -50px 0 0; padding:10px 10px 15px; font-size:11px; text-align:left; background:linear-gradient(#307555, #212147); border:1px outset #5cc; border-radius:8px; box-shadow:8px 8px 20px #000; z-index:6000"></div>');
			$('#R300_Settings_Menu').append('<div style="margin:0 auto; padding-bottom:5px; font-size:17px; font-weight:bold; color:#fff; text-align:center; text-shadow:1px 1px 2px #000000;">Rolling 300 Timeline Options</div>');
			var pages = [];
			$.each(R300_Selections, function(key, value) {
				if (value.type === 'checkbox') {
					if (key === 'ShowR300Intervals') {
						if (allGames.length === 300) { //Only show the bands if there's 300 games available...
							$('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
							$('#R300_Settings_Menu').append('<div id="R300WinBands" style="margin-left:18px; font-size:11px"></div>');
							var intBands = (R300_Selections.R300WinBands.display).split(',');
							$.each(intBands, function(k,v) {
								$('#R300WinBands').append('<label style="margin-left:4px" title="# games"><input type="radio" name="intBand" data-band="'+v+'" ' + (v == R300_Selections.R300WinBands.value ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
							});
						}
					} else if (key === 'R300MainPages') {
						$('#R300_Settings_Menu').append('<div id="R300MainPages" style="text-align:center; font-size:11px">Main Window:</div>');
						pages = (R300_Selections.R300MainPages.display).split(',');
						$.each(pages, function(k,v) {
							$('#R300MainPages').append('<label style="margin-left:4px"><input type="checkbox" name="mainPage" data-page="'+v+'" ' + ((R300_Selections.R300MainPages.title).indexOf(v) >= 0 ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
						});
					} else if (key === 'R300HeaderPages') {
						$('#R300_Settings_Menu').append('<div id="R300HeaderPages" style="margin-bottom:5px; text-align:center; font-size:11px">Win % Header:</div>');
						pages = (R300_Selections.R300HeaderPages.display).split(',');
						$.each(pages, function(k,v) {
							$('#R300HeaderPages').append('<label style="margin-left:4px"><input type="checkbox" name="headerPage" data-page="'+v+'" ' + ((R300_Selections.R300HeaderPages.title).indexOf(v) >= 0 ? 'checked' : '') + ' style="margin:3px 1px 3px 3px">'+v+'</label>');
						});
						$('#R300_Settings_Menu').append('<li style="list-style:none; text-align:center" title="' + R300_Selections.R300HeaderShowNGames.title + '"><label>' + R300_Selections.R300HeaderShowNGames.display + '</label><input type="number" id="R300HeaderShowNGames" min="0" max="10" value="'+R300_Selections.R300HeaderShowNGames.value+'" style="width:30px; font-size:11px; text-align:right"></li>');
					} else if (key === 'ShowLessThan300GamesWarning') { //this is the start of the "mini-window" options
						$('#R300_Settings_Menu').append('<li style="list-style:none; margin-top:10px">Mini-Window Options...</li>');
						$('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
					} else if (key === 'ShowR300HighestLowestEver') {
						$('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label>' +
														'<div id="R300ClearHighestLowestEver" style="display:inline-block; margin:0 5px; font-size:7px; border:1px solid #099; cursor:pointer" title="Clear/Reset the saved high/low values">CLEAR</div></li>');
					} else {
						$('#R300_Settings_Menu').append('<li style="list-style:none" title="' + value.title + '"><label><input type="checkbox" id="' + key + '" class="'+ value.type + '" ' + (value.value === true ? 'checked' : '') + '>' + value.display + '</label></li>');
					}
				}
			});
			$('#R300_Settings_Menu').append('<div style="position:absolute; bottom:2px; right:5px; text-align:right"><a href="https://gist.github.com/nabbynz/23a54cace27ad097d671" target="_blank" style="font-size:11px; color:#888" title="Version: ' + GM_info.script.version + '. Click to manually check for updates (script will auto-update if enabled)...">v' + GM_info.script.version + '</a</div>');

			GM_addStyle('#R300_Settings_Menu input { display:inline-block; margin:2px 0 0; color:black; }');
			GM_addStyle('#R300_Settings_Menu label { margin-bottom:3px; font-weight:normal; }');


		}

		function setSavedValues() {
			//update with the user saved values...
			$.each(R300_Selections, function(key, value) {
				if (key === 'R300MainPages') {
					if (PageLoc === 'server') {
						if (R300_Selections[key].title.indexOf('Home') < 0) {
							$('#R300_InnerContainer').hide(0);
						} else {
							$('#R300_InnerContainer').show(0);
						}
					} else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
						if (R300_Selections[key].title.indexOf('Profile') < 0) {
							$('#R300').hide(0);
						} else {
							$('#R300_InnerContainer').show(0);
						}
					} else if (PageLoc === 'joining') {
						if (R300_Selections[key].title.indexOf('Joiner') < 0) {
							$('#R300').hide(0);
						} else {
							$('#R300_InnerContainer').show(0);
						}
					}

				} else if (key == 'ShowR300PUPsPerGame') {
						if (value.value === true) {
							$('#R300_PUPs').find('.R300_pups_pergame').show(0);
							$('#R300_PUPs').find('.R300_pups_total').hide(0);
						} else {
							$('#R300_PUPs').find('.R300_pups_pergame').hide(0);
							$('#R300_PUPs').find('.R300_pups_total').show(0);
						}

				} else if (key === 'ShowBoxShadowBorder') {
					if (value.value === true) {
						$('#R300').css('box-shadow', '#fff 0px 0px 10px');
					} else {
						$('#R300').css('box-shadow', 'none');
					}

				} else if (value.type === 'checkbox') {
					//Hide certain elements according to the saved values...
					if (value.value === false) {
						if (key == 'ShowR300Timeline') {
							$R300_Timeline.hide(0);
						} else if (key === 'ShowR300Intervals') {
							$('#R300_Intervals').hide(0);
							$('#R300WinBands').find('input').prop('disabled', true);
						} else if (key === 'ShowR300GamesPieChart') {
							$('#R300_Pie').hide(0);
						} else if (key === 'ShowR300WinPercentage') {
							$('#R300_Wins').hide(0);
						} else if (key === 'ShowR300PerDay') {
							$('#R300_GamesPerDay').hide(0);
						} else if (key === 'ShowR300PerDayGraph') {
							$('#R300_GamesPerDayGraph').hide(0);
						} else if (key === 'ShowR300Count') {
							$('#R300_Count').hide(0);
						} else if (key === 'ShowR300HighestLowestEver') {
							$('#R300_HighestLowestEver').hide(0);
						} else if (key === 'ShowR300CTFNF') {
							$('#R300_CTFNF').hide(0);
						} else if (key === 'ShowR300NextGameAffect') {
							$('#R300_NextGameAffectWin, #R300_NextGameAffectLose').hide(0);
						} else if (key === 'ShowR300OldestGame') {
							$('#R300_OldestGame').hide(0);
						} else if (key === 'ShowR300BestStreak') {
							$('#R300_BestStreak').hide(0);
						} else if (key === 'ShowR300CurrentStreak') {
							$('#R300_CurrentStreak').hide(0);
						} else if (key === 'ShowR300WinStreakMessage') {
							$('#R300_BestStreakMessage').hide(0);
						} else if (key === 'ShowR300LossStreakMessage') {
							$('#R300_WorstStreakMessage').hide(0);
						} else if (key === 'ShowR300PUPs') {
							$('#R300_PUPs').hide(0);
						} else if (key === 'ShowLessThan300GamesWarning') {
							$('#R300_Trimmed').hide(0);
							$('#ShowR300TrimmedGamesPieChart').prop('disabled', true);
						}
					}
				}
			});
		}

		function bindEvents() {
			$('#R300_Settings_Button').on('click', function() {
				$('#R300_Settings_Menu').slideToggle(400);
			});
			$("#R300_Settings_Menu").mouseleave(function() {
				$('#R300_Settings_Menu').fadeOut(100);
			});
			$('#R300WinBands').find('input').on('click', function() {
				R300_Selections.R300WinBands.value = $(this).data('band');
				GM_setValue('R300_Selections', R300_Selections);
				showData();
				if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
			});
			$('#R300MainPages').find('input').on('click', function() {
				var newSelection = '';
				$.each($('#R300MainPages').find('input'), function() {
					if ($(this).is(':checked')) newSelection += $(this).data('page') + ",";
				});
				R300_Selections.R300MainPages.title = newSelection;
				GM_setValue('R300_Selections', R300_Selections);
				if (($(this).data('page') === 'Home') && (PageLoc === 'server')) {
					$('#R300_InnerContainer').slideToggle(600);
				} else if (($(this).data('page') === 'Profile') && ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs'))) {
					$('#R300').slideToggle(600);
				}
			});
			$('#R300HeaderPages').find('input').on('click', function() {
				var newSelection = '';

				$.each($('#R300HeaderPages input'), function() {
					if ($(this).is(':checked')) {
						newSelection += $(this).data('page') + ",";
					}
				});

				R300_Selections.R300HeaderPages.title = newSelection;
				GM_setValue('R300_Selections', R300_Selections);

				if (($(this).data('page') === 'Home') && (PageLoc === 'server')) {
					if ($('#R300_WinNextHeader').length) {
						$('#R300_WinNextHeader').slideToggle(400);
					} else {
						$('body').prepend(WinP_Div);
						$('#R300_WinNextHeader').hide(0);
						showWinPercentageHeader();
						$('#R300_WinNextHeader').slideDown(400);
					}
				} else if (($(this).data('page') === 'Profile') && ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs'))) {
					if ($('#R300_WinNextHeader').length) {
						$('#R300_WinNextHeader').slideToggle(400);
					} else {
						$('body').prepend(WinP_Div);
						$('#R300_WinNextHeader').hide(0);
						showWinPercentageHeader();
						$('#R300_WinNextHeader').slideDown(400);
					}
				}
			});
			$('#R300HeaderShowNGames').on('change', function() {
				R300_Selections.R300HeaderShowNGames.value = parseInt(this.value);
				GM_setValue('R300_Selections', R300_Selections);
				$('#R300_WinNextHeader').remove();
				$('body').prepend(WinP_Div);
				showWinPercentageHeader();
			});
			$('#R300_Settings_Menu').find('.checkbox').on('click', function() {
				R300_Selections[$(this).attr('id')].value = $(this).is(':checked');
				GM_setValue('R300_Selections', R300_Selections);
				if ($(this).attr('id') == 'ShowR300Timeline') {
					$R300_Timeline.fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300Intervals') {
					$('#R300_Intervals').fadeToggle(400);
					$('#R300WinBands').find('input').prop('disabled', ($(this).prop('checked') ? false : true));
				} else if ($(this).attr('id') == 'ShowR300GamesPieChart') {
					$('#R300_Pie').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300Pages') {
					$('#R300_WinNextHeader').fadeToggle(400);
					$('#R300HeaderPages').find('input').prop('disabled', ($(this).prop('checked') ? false : true));
				} else if ($(this).attr('id') == 'ShowR300WinPercentage') {
					$('#R300_Wins').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300PerDay') {
					$('#R300_GamesPerDay').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300PerDayGraph') {
					$('#R300_GamesPerDayGraph').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300Count') {
					$('#R300_Count').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300HighestLowestEver') {
					$('#R300_HighestLowestEver').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300CTFNF') {
					$('#R300_CTFNF').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300NextGameAffect') {
					$('#R300_NextGameAffectWin, #R300_NextGameAffectLose').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300OldestGame') {
					$('#R300_OldestGame').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300BestStreak') {
					$('#R300_BestStreak').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300CurrentStreak') {
					$('#R300_CurrentStreak').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300WinStreakMessage') {
					$('#R300_BestStreakMessage').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300LossStreakMessage') {
					$('#R300_WorstStreakMessage').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300PUPs') {
					$('#R300_PUPs').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300TrimmedPUPs') {
					$('#R300T_PUPs').fadeToggle(400);
				} else if ($(this).attr('id') == 'ShowR300PUPsPerGame') {
					$('#R300_PUPs').find('.R300_pups_pergame').toggle(0);
					$('#R300_PUPs').find('.R300_pups_total').toggle(0);
				} else if ($(this).attr('id') == 'ShowOtherPlayers') {
					if ($(this).is(':checked')) {
						if (okToRequestServerData()) { //only 'get' the data if we haven't done so recently
							setupStats();
							getProfilesData();
						} else {
							alert("Server not ready - please try again in 1 minute...\n\n\n");
						}
					} else {
						$('#R300_OtherPlayersStats').remove();
					}
				} else if ($(this).attr('id') == 'ShowR300ShowGap') {
					if ($('#R300_OtherPlayersStats').is(':visible')) $('#R300_OtherPlayersStats').remove();
					showData();
					if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
					setSavedValues();
				} else if ($(this).attr('id') == 'ShowLessThan300GamesWarning') { //Not a warning anymore - just an on/off toggle for the mini window
					$('#R300_Trimmed').fadeToggle(400);
					$('#ShowR300TrimmedGamesPieChart').prop('disabled', ($(this).prop('checked') ? false : true));
					$('#ShowR300TrimmedPUPs').prop('disabled', ($(this).prop('checked') ? false : true));
					$('#AlwaysShowLastDayPlayed').prop('disabled', ($(this).prop('checked') ? false : true));
					if (R300_Selections.ShowLessThan300GamesWarning.value) {
						setTimelineCellHeights(Cell_Width);
						showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
					}
				} else if ($(this).attr('id') == 'ShowR300TrimmedGamesPieChart') {
					if (R300_Selections.ShowLessThan300GamesWarning.value) showTrimmedData(R300_Selections.MaxR300Games.value, R300_Selections.MaxR300Games.value);
				} else if ($(this).attr('id') == 'ShowBoxShadowBorder') {
					if ($(this).is(':checked')) {
						$('#R300').css('box-shadow', '#fff 0px 0px 10px');
					} else {
						$('#R300').css('box-shadow', 'none');
					}
				}
			});
			$('#R300ClearHighestLowestEver').on('click', function() {
				var response = confirm("Your current highest/lowest saved values will be cleared.\n\nOK to continue?");
				if (response) {
					GM_deleteValue('R300_HighestEver');
					GM_deleteValue('R300_LowestEver');
					showData();
					setSavedValues();
				}
			});
		}

		function setTimelineCellHeights(Cell_Width) {
			Cell_Width = Cell_Width || 1;

			$('#R300_Timeline').find('.r300_win').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Win_Color.value,     'height':'10px', 'width':Cell_Width+'px' });
			$('#R300_Timeline').find('.r300_loss').css    ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Loss_Color.value,    'height':'10px', 'width':Cell_Width+'px' });
			$('#R300_Timeline').find('.r300_dc').css      ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.DC_Color.value,      'height':'10px', 'width':Cell_Width+'px' });
			$('#R300_Timeline').find('.r300_ssa').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.SSA_Color.value,     'height':'10px', 'width':Cell_Width+'px', 'border-top':'3px solid white' });
			$('#R300_Timeline').find('.r300_fsa').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.FSA_Color.value,     'height':'10px', 'width':Cell_Width+'px', 'border-bottom':'3px solid white' });
			$('#R300_Timeline').find('.r300_tie').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Tie_Color.value,     'height':'10px', 'width':Cell_Width+'px' });
			$('#R300_Timeline').find('.r300_unknown').css ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'cursor':'pointer', 'margin-left':               (R300_Selections.ShowR300ShowGap.value ? 1 : 0)+'px', 'background-color':R300_Selections.Unknown_Color.value, 'height':'10px', 'width':Cell_Width+'px' });
		}

		function getGameInfoAsText(gameData) {
			var text = "Game #" + gameData.gameNumber + ": ";

			if (gameData.outcome === 1) {
				if (gameData.saved === 2) {
					text += 'Win - Successful Save Attempt! (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
				} else {
					text += 'Win (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
				}
			} else if (gameData.outcome === 2) {
				text += 'Loss (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
			} else if (gameData.outcome === 3) {
				text += 'DC/Loss (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
			} else if (gameData.outcome === 4) { //Save Attempt
				if (gameData.saved === 1) { //Unsuccessful
					text += 'Unsuccessful Save Attempt (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
				}
			} else if (gameData.outcome === 5) { //Tie
				text += 'Tie/Loss (' + getUsefulText(gameData.gameMode, 'gamemode') + ')';
			} else { //Unknown
				text += 'Unknown Result!';
			}

			text += "\n" + new Date(parseInt(Date.parse(gameData.played))).toLocaleTimeString() + ' (' + new Date(parseInt(Date.parse(gameData.played))).toDateString() + ')' +
					"\nYou played for " + secondsToHMS(gameData.timePlayed) +
					"\n\nCaps: " + gameData.captures + " | Grabs: " + gameData.grabs + " | Drops: " + gameData.drops + " | Popped: " + gameData.pops + " | Tags: " + gameData.tags + " | Returns: " + gameData.returns +
					"\nHold: " + secondsToHMS(gameData.hold) + " | Prevent: " + secondsToHMS(gameData.prevent) + " | Support: " + gameData.support + " | PUP%: " + (gameData.powerups / gameData.potentialPowerups * 100).toFixed(2) +
					"\nCaps/Grab: " + ((gameData.grabs?gameData.captures:0)/(gameData.grabs?gameData.grabs:1)).toFixed(3) + " | Tags/Pop: " + ((gameData.pops?gameData.tags:0)/(gameData.pops?gameData.pops:1)).toFixed(3);

			return text;
		}



		/************************************************************************************/
		// Main Rolling 300 Timeline & Streaks...
		/************************************************************************************/
		var Timeline_MaxWidth = 780;
		var Cell_Width = 10; //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=10

		function showData() {
			var i, j;

			var totals = {'all':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
						  'ctf':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
						  'nf':      { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
						  'pups':    { tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 },
						  'streaks': { win:0, loss:0, temp_win:0, temp_loss:0, last_win:0, last_loss:0 }
						 };

			var data = $.extend(true, [], allGames);

			var New_Cell_Width = Math.floor((Timeline_MaxWidth - 26) / data.length);
			if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - (R300_Selections.ShowR300ShowGap.value ? 1 : 0);
			if (Cell_Width <= 0) Cell_Width = 1;

			$('#R300_Intervals').empty();
			$R300_Timeline.empty();
			$R300_Messages.empty();
			$('#R300_Pie').remove();
			$('#R300_PUPs').remove();

			var totalPotentialPowerups = 0;

			var dayCounts = [];
			var dayCountsKey=0;
			var d1 = '';
			var d2 = '';
			var NF_Marker = '<div title="Neutral Flag Game" style="position:absolute; width:'+Cell_Width+'px; height:1px; bottom:-2px; background:#ccc"></div>';

			$(data).each(function(key, value) {
				if (value.outcome === 999) return; //skip this iteration since no data

				d1 = new Date(value.played);
				if (key === 0) { //first game, nothing to compare to yet so just push it
					dayCounts.push( { day:d1.toDateString(), firstGameNumber:key, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0, timePlayed:0 } );
				} else {
					j = Math.ceil((d1 - d2) / (1000 * 3600 * 24));
					if ( (d2 !== '') && (d1.toDateString() !== d2.toDateString()) ) {
						for (i=dayCountsKey+1; i<dayCountsKey+j; i++) {
							dayCounts.push( { day:0, firstGameNumber:0, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0, timePlayed:0 } ); //push 0's for the in-between days we haven't played on (this could get big?!?)
						}
						dayCounts.push( { day:d1.toDateString(), firstGameNumber:key, win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0, timePlayed:0 } );
						dayCountsKey += j;
					}
				}
				d2 = d1; //save for compare on next loop
				dayCounts[dayCountsKey].timePlayed += value.timePlayed;

				totalPotentialPowerups += value.potentialPowerups;
				$.each(totals.pups, function(key1, value1) {
					totals.pups[key1] += value[key1];
				});

				switch (value.outcome) {
					case 1: //win
						if (value.saved === 2) {
							totals.all.ssa++;
							dayCounts[dayCountsKey].ssa++;
							if (value.gameMode === 1) {
								totals.ctf.ssa++;
							} else if (value.gameMode === 2) {
								totals.nf.ssa++;
							}
							$R300_Timeline.append('<div class="r300_ssa" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
						} else {
							totals.all.win++;
							dayCounts[dayCountsKey].win++;
							if (value.gameMode === 1) {
								totals.ctf.win++;
							} else if (value.gameMode === 2) {
								totals.nf.win++;
							}
							$R300_Timeline.append('<div class="r300_win" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
						}

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak
							i--;
						}
						if ( (totals.streaks.temp_win === 0) || ((i > 0) && ((data[i-1].outcome === 1)) ) ) totals.streaks.temp_win++;
						if (totals.streaks.temp_win > totals.streaks.win) totals.streaks.win = totals.streaks.temp_win;
						totals.streaks.temp_loss = 0;
						if (totals.streaks.temp_win > 0) totals.streaks.last_win = totals.streaks.temp_win;

						break;

					case 2: //loss
						totals.all.loss++;
						dayCounts[dayCountsKey].loss++;
						if (value.gameMode === 1) {
							totals.ctf.loss++;
						} else if (value.gameMode === 2) {
							totals.nf.loss++;
						}
						$R300_Timeline.append('<div class="r300_loss" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak
							i--;
						}
						if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
						if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
						totals.streaks.temp_win = 0;
						if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

						break;

					case 3: //dc
						totals.all.dc++;
						dayCounts[dayCountsKey].dc++;
						if (value.gameMode === 1) {
							totals.ctf.dc++;
						} else if (value.gameMode === 2) {
							totals.nf.dc++;
						}
						$R300_Timeline.append('<div class="r300_dc" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak
							i--;
						}
						if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
						if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
						totals.streaks.temp_win = 0;
						if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

						break;

					case 4: //save attempt
						if (value.saved === 1) { //failed save attempt...
							totals.all.fsa++;
							dayCounts[dayCountsKey].fsa++;
							if (value.gameMode === 1) {
								totals.ctf.fsa++;
							} else if (value.gameMode === 2) {
								totals.nf.fsa++;
							}
							$R300_Timeline.append('<div class="r300_fsa" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '"></div>');
						}

						break;

					case 5: //tie
						totals.all.tie++;
						dayCounts[dayCountsKey].tie++;
						if (value.gameMode === 1) {
							totals.ctf.tie++;
						} else if (value.gameMode === 2) {
							totals.nf.tie++;
						}
						$R300_Timeline.append('<div class="r300_tie" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak
							i--;
						}
						if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
						if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
						totals.streaks.temp_win = 0;
						if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

						break;

					default: //just in case!
						$R300_Timeline.append('<div class="r300_unknown" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						break;

				}
			});

			setTimelineCellHeights(Cell_Width);

			//Win %...
			var currentWinPC = ((totals.all.win+totals.all.ssa) / (totals.all.win+totals.all.ssa + totals.all.loss+totals.all.dc+totals.all.tie) * 100).toFixed(2);
			$R300_Messages.append('<div id="R300_Wins">Win % over your last <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> games: <span style="color:'+R300_Selections.Win_Color.value+'">' + currentWinPC + '%</span></div>');

			//Game Count...
			$R300_Messages.append('<div id="R300_Count" style="font-size:11px">(<span style="color:'+R300_Selections.Win_Color.value+'">' + (totals.all.win) + ' Win'+((totals.all.win)==1?'':'s')+'</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">'+ (totals.all.loss) + ' Loss'+(totals.all.loss==1?'':'es')+'</span> | <span style="color:'+R300_Selections.Tie_Color.value+'" title="Ties are counted as a Loss">'+ (totals.all.tie) + ' Tie'+(totals.all.tie==1?'':'s')+'</span> | <span style="color:'+R300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + totals.all.dc + ' DC'+(totals.all.dc==1?'':'s')+'</span> | <span style="color:'+R300_Selections.SSA_Color.value+'" title="Counts as a Win!">' + totals.all.ssa + ' Save'+(totals.all.ssa==1?'':'s')+'</span> | <span style="color:'+R300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + totals.all.fsa + ' USA'+(totals.all.fsa==1?'':'s')+'</span>)</div>');

			//Highest/Lowest % Ever (while running this script)...
			if (PageLoc !== 'profileNotOurs') {
				if (currentWinPC > GM_getValue('R300_HighestEver', 0)) GM_setValue('R300_HighestEver', currentWinPC);
				if ((currentWinPC < GM_getValue('R300_LowestEver', 100)) && (currentWinPC > 0)) GM_setValue('R300_LowestEver', currentWinPC);
				$R300_Messages.append('<div id="R300_HighestLowestEver" title="'+R300_Selections.ShowR300HighestLowestEver.title+'"><span style="color:#2CAD9C'+(currentWinPC === GM_getValue('R300_HighestEver') ? '; text-decoration:underline':'')+'" title="Highest Win % Ever">Highest: ' + GM_getValue('R300_HighestEver') + '%</span> | <span style="color:#2CAD9C'+(currentWinPC === GM_getValue('R300_LowestEver') ? '; text-decoration:underline':'')+'" title="Lowest Win % Ever">Lowest: ' + GM_getValue('R300_LowestEver') + '%</span></div>');
			}

			//CTF / NF...
			var totalCTF = (totals.ctf.win+totals.ctf.ssa + totals.ctf.loss+totals.ctf.dc+totals.ctf.tie);
			var CTFWinPC = (totalCTF === 0) ? 0 : ((totals.ctf.win+totals.ctf.ssa) / totalCTF * 100).toFixed(2);
			var totalNF = (totals.nf.win+totals.nf.ssa + totals.nf.loss+totals.nf.dc+totals.nf.tie);
			var NFWinPC = (totalNF === 0) ? 0 : ((totals.nf.win+totals.nf.ssa) / totalNF * 100).toFixed(2);
			$R300_Messages.append('<div id="R300_CTFNF"><span id="R300_CTFWP" class="R300_CTFNFWP" style="color:#9264DA; cursor:pointer" title="Click to show CTF games">CTF: ' + CTFWinPC + '% ('+(totalCTF+totals.ctf.fsa)+')</span> | <span id="R300_NFWP" class="R300_CTFNFWP" style="color:#9264DA; cursor:pointer" title="Click to show Neutral Flag games">NF: ' + NFWinPC + '% ('+(totalNF+totals.nf.fsa)+')</span></div>');

			//Oldest Game...
			var oldestGame = getUsefulText( (data[0].outcome.toString() + data[0].saved.toString()), 'outcome');
			$R300_Messages.append('<div id="R300_OldestGame">Oldest game: ' + (oldestGame) + '</div>');

			//How next game affect's Win%...
			$R300_Messages.append('<div id="R300_NextGameAffectLose">' + getNextGamePercentage(data) + '</div>');

			//Win % Bands...
			if (data.length === 300) {
				var intervalSize = R300_Selections.R300WinBands.value;
				var int_win, int_loss;
				var intervalWins = [];
				for (i=0; i<data.length; i+=intervalSize) {
					int_win=0;
					int_loss=0;
					for (j=i; j<i+intervalSize; j++) {
						if (data[j].outcome == 1) {
							int_win++;
						} else if ((data[j].outcome == 2) || (data[j].outcome == 3) || (data[j].outcome == 5)) {
							int_loss++;
						}
					}
					intervalWins.push((int_win / (int_win + int_loss))*100);

					if (i % intervalSize === 0) {
						var IntervalCellWidth = ((Cell_Width+(R300_Selections.ShowR300ShowGap.value ? 1 : 0))*intervalSize-1);
						var IntervalMarginLeft = 0;
						if ((i === 0) || (i === data.length-intervalSize)) { //need to adjust for first & last cells...
							IntervalCellWidth = ((Cell_Width+(R300_Selections.ShowR300ShowGap.value ? 1 : 0))*intervalSize-2);
							if (i === 0) IntervalMarginLeft = 2;
						}
						$('#R300_Intervals').append('<div class="R300_Interval" data-firstgame="'+(data.length-i)+'" style="display:inline-block; cursor:pointer; font-size:11px; color:#777; width:'+IntervalCellWidth+'px; height:10px; ' + (i===0 ? 'border-left:1px solid #777; ' : '') + 'border-right:1px solid #777; margin-left:'+IntervalMarginLeft+'px;" title="Games: ' + (data.length-i-intervalSize+1) + '-' + (data.length-i) + ' (' +intervalSize+')">&nbsp;'+ (intervalWins[i/intervalSize]).toFixed(1) + '%</div>');
					}
				}
			}

			//Games Pie Chart...
			$R300_Messages.append('<div id="R300_Pie"><canvas id="R300_GamesPieChart" width="80" height="80"></canvas></div>');
			var ctx = $("#R300_GamesPieChart").get(0).getContext("2d");

			var pieData = {
				labels: ['Wins', 'Losses', 'Ties', 'DC\'s', 'Unsuccessful Save Attempts', 'Successful Saves'],
				datasets: [
					{
						data: [totals.all.win, totals.all.loss, totals.all.tie, totals.all.dc, totals.all.fsa, totals.all.ssa],
						backgroundColor: [R300_Selections.Win_Color.value, R300_Selections.Loss_Color.value, R300_Selections.Tie_Color.value, R300_Selections.DC_Color.value, R300_Selections.FSA_Color.value, R300_Selections.SSA_Color.value],
						hoverBackgroundColor: ['#67ff67', '#ff4343', '#ffcc7b', '#fffe8d', '#51c6e7', '#88e888'],
						borderWidth: 0
					}
				]

			};

			var pieLoadDelay = 500;
			setTimeout(function() {
				if ($("#R300_GamesPieChart").is(":visible")) {
					window.requestAnimationFrame(function() {
						var myPieChart = new Chart(ctx, {
							type: 'doughnut',
							data: pieData,
							options: { legend:{display:false}, responsive:true, maintainAspectRatio:false }
						});
					});
				}
			}, pieLoadDelay);


			//Best Streaks...
			$R300_Messages.append('<div id="R300_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + R300_Selections.Win_Color.value + '">' + totals.streaks.win + ' Win' + (totals.streaks.win == 1 ? '' : 's') + '</span> | <span style="color:' + R300_Selections.Loss_Color.value + '">' + totals.streaks.loss + ' Loss' + (totals.streaks.loss == 1 ? '' : 'es') + '</span></div>');


			//Current Streak...
			if (data[data.length-1].outcome === 1) {
				$R300_Messages.append('<div id="R300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + R300_Selections.Win_Color.value + '">' + totals.streaks.last_win + ' Win' + (totals.streaks.last_win == 1 ? '' : 's') + '</span></div>');
			} else if ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) {
				$R300_Messages.append('<div id="R300_CurrentStreak" style="text-align:center">Current Streak: <span style="color:' + R300_Selections.Loss_Color.value + '">' + totals.streaks.last_loss + ' Loss' + (totals.streaks.last_loss == 1 ? '' : 'es') + '</span></div>');
			}


			//Best Streak Messages...
			if ( (data[data.length-1].outcome === 1) && (totals.streaks.last_win >= totals.streaks.win) && (data.length > 5) ) {
				$R300_Messages.append('<div id="R300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Win_Color.value + '">You are currently on your best win streak!!!</div>');
			} else if ( (data[data.length-1].outcome === 1) && (totals.streaks.last_win == totals.streaks.win-1) && (data.length > 5) ) {
				$R300_Messages.append('<div id="R300_BestStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Win_Color.value + '">You are just <u>1 win away</u> from your best win streak!</div>');
			}


			//Worst Streak Messages...
			if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (totals.streaks.last_loss >= totals.streaks.loss) && (data.length > 5) ) {
				$R300_Messages.append('<div id="R300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Loss_Color.value + '">You are currently on your worst losing streak :(</div>');
			} else if ( ((data[data.length-1].outcome === 2) || (data[data.length-1].outcome === 3)) && (totals.streaks.last_loss == totals.streaks.loss-1) && (data.length > 5) ) {
				$R300_Messages.append('<div id="R300_WorstStreakMessage" style="padding:3px 0; text-align:center; border-radius:5px; color:#fff; background-color:' + R300_Selections.Loss_Color.value + '">You are only <u>1 loss away</u> from your worst losing streak...</div>');
			}


			//# Games Per Day Bar Graph...
			var minPlays=100, maxPlays=0, daysWithGamesCount=0;
			var gamesperday_barwidth = Math.floor(300 / dayCounts.length);
			if (gamesperday_barwidth < 1) gamesperday_barwidth = 1;
			if (gamesperday_barwidth > 10) gamesperday_barwidth = 10;

			$.each(dayCounts, function(key, value) {
				i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
				if (i > maxPlays) maxPlays = i;
				if (i < minPlays) minPlays = i;
				if (i > 0) daysWithGamesCount++;
			});
			if (R300_Selections.AlwaysShowLastDayPlayed.value) {
				R300_Selections.MaxR300Games.value = data.length - dayCounts[dayCounts.length-1].firstGameNumber;
			}
			var totalTimePlayed = 0;
			$R300_Messages.append('<div id="R300_GamesPerDayGraph" style="display:flex; align-items:baseline; width:'+(dayCounts.length*(gamesperday_barwidth+(dayCounts.length < 200 ? 1 : 0)))+'px; max-width:420px; margin:2px auto 0; border-bottom:1px solid #fff"></div>');
			var $R300_GamesPerDayGraph = $('#R300_GamesPerDayGraph');
			var minBarHeight = maxPlays - minPlays;
			if (minBarHeight > 20) minBarHeight = 2;
			$.each(dayCounts, function(key, value) {
				i = (value.win+value.loss+value.dc+value.ssa+value.fsa+value.tie);
				totalTimePlayed += dayCounts[key].timePlayed;
				$R300_GamesPerDayGraph.append('<div id="R300_GamesPerDay_Bar_'+key+'" class="R300_GamesPerDay_Bar" data-firstgame="'+(data.length-value.firstGameNumber)+'" data-gamecount="'+i+'" style="height:'+scaleBetween(i, (i?minBarHeight:0), 30, minPlays, maxPlays)+'px; width:'+gamesperday_barwidth+'px" title="'+i+' Games on ' + dayCounts[key].day + " (" + secondsToHMS(dayCounts[key].timePlayed) + " played)\n"+value.win+' Wins, '+ value.loss+' Losses, '+ value.tie +' Ties,'+ value.dc+' DCs, '+ value.ssa+' Saves, '+ value.fsa+' USAs"></div>');
				$('#R300_GamesPerDay_Bar_'+key).append('<div style="position:absolute; background:'+R300_Selections.Win_Color.value+'; bottom:0px; width:'+gamesperday_barwidth+'px; height:'+((value.win+value.ssa)/i*100)+'%"></div>');
			});
			GM_addStyle('.R300_GamesPerDay_Bar { position:relative; margin-left:'+(dayCounts.length < 200 ? 1 : 0)+'px; background:#666 }');
			GM_addStyle('.R300_GamesPerDay_Bar:hover { opacity:0.6 }');


			//# Games Per Day...
			$R300_Messages.append('<div id="R300_GamesPerDay" style="font-size:11px">' + daysWithGamesCount + ' Game Days (' + (data.length/daysWithGamesCount).toFixed(2) + ' games/day, ' + secondsToHMS(totalTimePlayed/daysWithGamesCount) + ' mins/day)</div>');


			//Stats...
			$('#R300_MessagesPie').after('<div id="R300_PUPs" style="margin:5px auto; padding:1px 0; font-family:monospace; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; font-size:12px; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
			$.each(totals.pups, function(key, value) {
				var keytitle='';
				if (key === 'timePlayed') {
					keytitle = 'Time';
				} else if (key === 'powerups') {
					keytitle = 'PUPs';
				} else if (key === 'captures') {
					keytitle = 'Caps';
				} else {
					keytitle = capitaliseFirstLetter(key);
				}
				if ((key == 'hold') || (key == 'prevent') || (key == 'timePlayed')) {
					$('#R300_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+secondsToHMS(value / data.length)+'</div>');
					$('#R300_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+secondsToHMS(value)+'</div>');
				} else {
					$('#R300_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+(value / data.length).toFixed(2)+'</div>');
					if (key == 'powerups') {
						$('#R300_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value / totalPotentialPowerups * 100).toFixed(2)+'%</div>');
					} else {
						$('#R300_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value)+'</div>');
					}
				}
			});
			$('#R300_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(totals.pups.captures / totals.pups.grabs).toFixed(3)+'</div>');
			$('#R300_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(totals.pups.tags / totals.pups.pops).toFixed(3)+'</div>');


			//Other Players Win%...
			if (R300_Selections.ShowOtherPlayers.value === true) {
				if (((PageLoc === 'server') || (PageLoc === 'profile')) && okToRequestServerData()) { //only 'get' the data if we haven't done so recently
					setupStats();
					setTimeout(function() {
						getProfilesData();
					}, 1000);
				} else if (PageLoc === 'joining') { //show the cached data...
					setupStats();
					showProfiles();
				}
			}
			GM_addStyle('#R300_OtherPlayersStats { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; margin:5px auto; font-size:11px; font-family:monospace; }');
			GM_addStyle('.R300_OtherPlayerStats { position:relative; color:#bbb; background:rgba(50,50,100,0.1); margin:4px; padding:2px 10px; border:1px solid #888; border-radius:5px; cursor:default }');
			GM_addStyle('.R300_OtherPlayerStats:hover { color:white; background:rgba(0,0,100,0.5); border:1px solid white }');
			GM_addStyle('#R300_OtherPlayersStats_Add { color:chartreuse; font-size:14px; padding:5px; border:1px dashed #888; border-radius:5px; }');
			GM_addStyle('#R300_OtherPlayersStats_Add:hover { background:rgba(127,255,0,0.3); border:1px solid chartreuse; cursor:pointer }');
			GM_addStyle('.R300_OtherPlayerStats_Remove { position:absolute; width:9px; height:8px; font-size:9px; color:#600; top:1px; right:1px; text-shadow:none; border:1px solid #600; border-radius:5px; }');
			GM_addStyle('.R300_OtherPlayerStats_Remove:hover { color:#f00; border:1px solid #f00; background:rgba(255,0,0,0.3); cursor:pointer }');
			GM_addStyle('#R300_OtherPlayersStats_Sortby { margin-left:5px; width:20px; height:20px; font-size:11px; color:#600; background:bisque; border-radius:5px; }');
			GM_addStyle('.R300_OtherPlayerName { font-size:12px; text-decoration:underline; color:#fff }');
			GM_addStyle('.R300_OtherPlayerName:hover { color:dodgerblue }');
			GM_addStyle('.R300_OtherPlayer_HighlightToday { color:skyblue }');
			GM_addStyle('@keyframes rotateText { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }');
			GM_addStyle('.R300_RotateAddText { animation:rotateText 2s linear infinite; display:inline-block;}');


			//Bind some events...
			$('#R300_GamesPerDayGraph').find('.R300_GamesPerDay_Bar').on('click', function() {
				R300_Selections.MaxR300Games.value = $(this).data('firstgame');
				GM_setValue('R300_Selections', R300_Selections);
				setTimelineCellHeights(Cell_Width);
				showTrimmedData($(this).data('firstgame'), $(this).data('gamecount'));
			});
			$('#R300_Intervals').find('.R300_Interval').on('click', function() {
				R300_Selections.MaxR300Games.value = $(this).data('firstgame');
				GM_setValue('R300_Selections', R300_Selections);
				setTimelineCellHeights(Cell_Width);
				$('#R300_Intervals .R300_Interval').css('color', '#777');
				$(this).css('color', '#ddd');
				showTrimmedData($(this).data('firstgame'), intervalSize);
			});
			$('#R300_Timeline div').on('click', function() {
				R300_Selections.MaxR300Games.value = $(this).data('gamenumber');
				GM_setValue('R300_Selections', R300_Selections);
				setTimelineCellHeights(Cell_Width);
				$('#R300_Intervals .R300_Interval').css('color', '#777');
				showTrimmedData($(this).data('gamenumber'), $(this).data('gamenumber'));
			});
			$('#R300_PUPs').on('click', function(){
				R300_Selections.ShowR300PUPsPerGame.value = !R300_Selections.ShowR300PUPsPerGame.value;
				GM_setValue('R300_Selections', R300_Selections);
				$('#ShowR300PUPsPerGame').prop('checked', R300_Selections.ShowR300PUPsPerGame.value);
				if (R300_Selections.ShowR300PUPsPerGame.value === true) {
					$('#R300_PUPs').find('.R300_pups_pergame').show(0);
					$('#R300_PUPs').find('.R300_pups_total').hide(0);
				} else {
					$('#R300_PUPs').find('.R300_pups_pergame').hide(0);
					$('#R300_PUPs').find('.R300_pups_total').show(0);
				}
			});
			$('#R300_CTFWP').on('click', function(){
				R300_Selections.MaxR300Games.value = 'CTF';
				GM_setValue('R300_Selections', R300_Selections);
				setTimelineCellHeights(Cell_Width);
				showTrimmedData(0,0);
			});
			$('#R300_NFWP').on('click', function(){
				R300_Selections.MaxR300Games.value = 'NF';
				GM_setValue('R300_Selections', R300_Selections);
				setTimelineCellHeights(Cell_Width);
				showTrimmedData(0,0);
			});
		}


		/************************************************************************************/
		// Mini Timeline...
		/************************************************************************************/
		function showTrimmedData(start, count) {
			var WinPercentageText;
			var Timeline_MaxWidth = 390;
			var Cell_Width = 8; //This value will adjust (smaller) according to MaxGames & Timeline_MaxWidth. Default=8
			var ShowGapMarginLeft = 1;
			var i;
			var totals = {'all':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
						  'ctf':     { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
						  'nf':      { win:0, loss:0, dc:0, ssa:0, fsa:0, tie:0 },
						  'pups':    { tags:0, pops:0, grabs:0, drops:0, hold:0, captures:0, prevent:0, returns:0, support:0, powerups:0, timePlayed:0 },
						  'streaks': { win:0, loss:0, temp_win:0, temp_loss:0, last_win:0, last_loss:0 }
						 };
			var data = $.extend(true, [], allGames);
			var newData = [];
			var key, l;

			if (R300_Selections.MaxR300Games.value === 'CTF') {
				for (key=0, l=data.length; key<l; key++) {
					if (data[key].gameMode === 1) newData.push(data[key]);
				}
				data = $.extend(true, [], newData);
				start = data.length;
				count = data.length;
				WinPercentageText = 'Win % over these <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> CTF games:';
			} else if (R300_Selections.MaxR300Games.value === 'NF') {
				for (key=0, l=data.length; key<l; key++) {
					if (data[key].gameMode === 2) newData.push(data[key]);
				}
				data = $.extend(true, [], newData);
				start = data.length;
				count = data.length;
				WinPercentageText = 'Win % over these <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> NF games:';
			} else {
				if (!start) start = 0;
				if (!count) count = data.length;
				$R300_Timeline.find('[data-gamenumber="' + start + '"]').css('height', '+=6');
				if (count > 1) $R300_Timeline.find('[data-gamenumber="' + (start-count+1) + '"]').css('height', '+=6');
				start = data.length-start;
				data = data.splice(start, count);
				WinPercentageText = 'Win % over these <span style="color:' + R300_Selections.Win_Color.value + '">' + data.length + '</span> games ' + (start>=0 ? '('+(allGames.length-start-count+1)+'-'+(allGames.length-start)+'): ' : '');
			}

			if (count > 200) ShowGapMarginLeft = 0;

			var New_Cell_Width = Math.floor((Timeline_MaxWidth - 34) / data.length);
			if (New_Cell_Width < Cell_Width) Cell_Width = New_Cell_Width - (R300_Selections.ShowR300ShowGap.value ? (count > 200 ? 0 : 1) : 0);
			if (Cell_Width <= 0) Cell_Width = 1;

			var NF_Marker = '<div title="Neutral Flag Game" style="position:absolute; width:'+Cell_Width+'px; height:1px; bottom:-2px; background:#ccc"></div>';

			$R300T_Timeline.empty();
			$R300T_Messages.empty();
			$('#R300T_Pie').remove();
			$('#R300T_PUPs').remove();

			var totalPotentialPowerups = 0;
			$(data).each(function(key, value) {
				totalPotentialPowerups += value.potentialPowerups;
				$.each(totals.pups, function(key1, value1) {
					totals.pups[key1] += value[key1];
				});

				switch (value.outcome) {
					case 1: //win
						if (value.saved === 2) {
							totals.all.ssa++;
							if (value.gameMode === 1) {
								totals.ctf.ssa++;
							} else if (value.gameMode === 2) {
								totals.nf.ssa++;
							}
							$R300T_Timeline.append('<div class="r300t_ssa" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
						} else {
							totals.all.win++;
							if (value.gameMode === 1) {
								totals.ctf.win++;
							} else if (value.gameMode === 2) {
								totals.nf.win++;
							}
							$R300T_Timeline.append('<div class="r300t_win" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
						}

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
							i--;
						}
						if ( (totals.streaks.temp_win === 0) || ((i > 0) && ((data[i-1].outcome === 1)) ) ) totals.streaks.temp_win++;
						if (totals.streaks.temp_win > totals.streaks.win) totals.streaks.win = totals.streaks.temp_win;
						totals.streaks.temp_loss = 0;
						if (totals.streaks.temp_win > 0) totals.streaks.last_win = totals.streaks.temp_win;

						break;

					case 2: //loss
						totals.all.loss++;
						if (value.gameMode === 1) {
							totals.ctf.loss++;
						} else if (value.gameMode === 2) {
							totals.nf.loss++;
						}
						$R300T_Timeline.append('<div class="r300t_loss" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
							i--;
						}
						if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
						if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
						totals.streaks.temp_win = 0;
						if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

						break;

					case 3: //dc
						totals.all.dc++;
						if (value.gameMode === 1) {
							totals.ctf.dc++;
						} else if (value.gameMode === 2) {
							totals.nf.dc++;
						}
						$R300T_Timeline.append('<div class="r300t_dc" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
							i--;
						}
						if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
						if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
						totals.streaks.temp_win = 0;
						if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

						break;

					case 4: //save attempt
						if (value.saved === 1) { //failed save attempt...
							totals.all.fsa++;
							if (value.gameMode === 1) {
								totals.ctf.fsa++;
							} else if (value.gameMode === 2) {
								totals.nf.fsa++;
							}
							$R300T_Timeline.append('<div class="r300t_fsa" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');
						}

						break;

					case 5: //tie
						totals.all.tie++;
						if (value.gameMode === 1) {
							totals.ctf.tie++;
						} else if (value.gameMode === 2) {
							totals.nf.tie++;
						}
						$R300T_Timeline.append('<div class="r300t_tie" data-gamenumber="' + (data.length-key) + '" title="' + getGameInfoAsText(value) + '">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						//streak...
						i=key;
						while ( (i > 0) && ((data[i-1].outcome === 4)&&(data[i-1].saved === 1)) ) { //unsuccessful saves shouldn't break a streak!
							i--;
						}
						if ( (totals.streaks.temp_loss === 0) || ((i > 0) && ((data[i-1].outcome === 2) || (data[i-1].outcome === 3) || (data[i-1].outcome === 5)) ) ) totals.streaks.temp_loss++;
						if (totals.streaks.temp_loss > totals.streaks.loss) totals.streaks.loss = totals.streaks.temp_loss;
						totals.streaks.temp_win = 0;
						if (totals.streaks.temp_loss > 0) totals.streaks.last_loss = totals.streaks.temp_loss;

						break;

					default: //just in case!
						$R300T_Timeline.append('<div class="r300t_unknown" data-gamenumber="' + (data.length-key) + '" title="Unknown Result">'+(value.gameMode === 2 ? NF_Marker : '')+'</div>');

						break;

				}
			});

			$('#R300T_Timeline').find('.r300t_win').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'margin-left':(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Win_Color.value,     'height':'6px', 'width':Cell_Width+'px' });
			$('#R300T_Timeline').find('.r300t_loss').css    ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'margin-left':(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Loss_Color.value,    'height':'6px', 'width':Cell_Width+'px' });
			$('#R300T_Timeline').find('.r300t_dc').css      ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'margin-left':(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.DC_Color.value,      'height':'6px', 'width':Cell_Width+'px' });
			$('#R300T_Timeline').find('.r300t_ssa').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'margin-left':(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.SSA_Color.value,     'height':'6px', 'width':Cell_Width+'px', 'border-top'   :'2px solid white' });
			$('#R300T_Timeline').find('.r300t_fsa').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'margin-left':(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.FSA_Color.value,     'height':'6px', 'width':Cell_Width+'px', 'border-bottom':'2px solid white' });
			$('#R300T_Timeline').find('.r300t_tie').css     ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'margin-left':(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Tie_Color.value,     'height':'6px', 'width':Cell_Width+'px' });
			$('#R300T_Timeline').find('.r300t_unknown').css ({ 'display':'inline-block', 'position':'relative', 'border-radius':'2px', 'margin-left':(R300_Selections.ShowR300ShowGap.value ? ShowGapMarginLeft : 0)+'px', 'background-color':R300_Selections.Unknown_Color.value, 'height':'6px', 'width':Cell_Width+'px' });

			//Win %...
			var currentWinPC = ((totals.all.win+totals.all.ssa) / (totals.all.win+totals.all.ssa + totals.all.loss+totals.all.dc+totals.all.tie) * 100).toFixed(2);
			$R300T_Messages.append('<div id="R300T_Wins">' + WinPercentageText + ' <span style="color:'+R300_Selections.Win_Color.value+'">' + currentWinPC + '%</span></div>');

			//Games Count...
			$R300T_Messages.append('<div id="R300T_Count">(<span style="color:'+R300_Selections.Win_Color.value+'">' + (totals.all.win) + ' Win'+((totals.all.win)==1?'':'s')+'</span> | <span style="color:'+R300_Selections.Loss_Color.value+'">'+ (totals.all.loss) + ' Loss'+(totals.all.loss==1?'':'es')+'</span> | <span style="color:'+R300_Selections.Tie_Color.value+'" title="Ties are counted as a Loss">'+ (totals.all.tie) + ' Tie'+(totals.all.tie==1?'':'s')+'</span> | <span style="color:'+R300_Selections.DC_Color.value+'" title="DC\'s are counted as a Loss">' + totals.all.dc + ' DC'+(totals.all.dc==1?'':'s')+'</span> | <span style="color:'+R300_Selections.SSA_Color.value+'" title="Counts as a Win!">' + totals.all.ssa + ' Save'+(totals.all.ssa==1?'':'s')+'</span> | <span style="color:'+R300_Selections.FSA_Color.value+'" title="Unsuccessful Save Attempts do NOT count as a Loss (or a Win)">' + totals.all.fsa + ' USA'+(totals.all.fsa==1?'':'s')+'</span>)</div>');

			//CTF / NF...
			var totalCTF = (totals.ctf.win+totals.ctf.ssa + totals.ctf.loss+totals.ctf.dc+totals.ctf.tie);
			var CTFWinPC = (totalCTF === 0) ? 0 : ((totals.ctf.win+totals.ctf.ssa) / totalCTF * 100).toFixed(2);
			var totalNF = (totals.nf.win+totals.nf.ssa + totals.nf.loss+totals.nf.dc+totals.nf.tie);
			var NFWinPC = (totalNF === 0) ? 0 : ((totals.nf.win+totals.nf.ssa) / totalNF * 100).toFixed(2);
			$R300T_Messages.append('<div id="R300T_CTFNF"><span style="color:#9264DA">CTF: ' + CTFWinPC + '% ('+(totalCTF+totals.ctf.fsa)+')</span> | <span style="color:#9264DA">NF: ' + NFWinPC + '% ('+(totalNF+totals.nf.fsa)+')</span></div>');

			//Best Streaks...
			$R300T_Messages.append('<div id="R300T_BestStreak" style="text-align:center">Best Streaks: <span style="color:' + R300_Selections.Win_Color.value + '">' + totals.streaks.win + ' Win' + (totals.streaks.win == 1 ? '' : 's') + '</span> | <span style="color:' + R300_Selections.Loss_Color.value + '">' + totals.streaks.loss + ' Loss' + (totals.streaks.loss == 1 ? '' : 'es') + '</span></div>');

			//Games Mini Pie Chart...
			if (R300_Selections.ShowR300TrimmedGamesPieChart.value) {
				$R300T_Messages.append('<div id="R300T_Pie"><canvas id="R300T_GamesPieChart" width="50" height="50"></canvas></div>');
				var ctx = $("#R300T_GamesPieChart").get(0).getContext("2d");

				var pieData = {
					labels: ['Wins', 'Losses', 'Ties', 'DC\'s', 'Unsuccessful Save Attempts', 'Successful Saves'],
					datasets: [
						{
							data: [totals.all.win, totals.all.loss, totals.all.tie, totals.all.dc, totals.all.fsa, totals.all.ssa],
							backgroundColor: [R300_Selections.Win_Color.value, R300_Selections.Loss_Color.value, R300_Selections.Tie_Color.value, R300_Selections.DC_Color.value, R300_Selections.FSA_Color.value, R300_Selections.SSA_Color.value],
							hoverBackgroundColor: ['#67ff67', '#ff4343', '#ffcc7b', '#fffe8d', '#51c6e7', '#88e888'],
							borderWidth: 0
						}
					]

				};

				var pieLoadDelay = 500;
				setTimeout(function() {
					if ($("#R300T_GamesPieChart").is(":visible")) {
						window.requestAnimationFrame(function() {
							var myPieChart = new Chart(ctx, {
								type: 'doughnut',
								data: pieData,
								options: { legend:{display:false}, responsive:true, maintainAspectRatio:false }
							});
						});
					}
				}, pieLoadDelay);
			}

			//Power Up Stats...
			if (R300_Selections.ShowR300TrimmedPUPs.value) {
				$R300T_Messages.append('<div id="R300T_PUPs" style="max-width:300px; margin:5px auto; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; font-family:monospace; font-size:11px; border:1px solid #222; border-radius:3px; cursor:pointer"></div>');
				$.each(totals.pups, function(key, value) {
					var keytitle='';
					if (key === 'timePlayed') {
						keytitle = 'Time';
					} else if (key === 'powerups') {
						keytitle = 'PUPs';
					} else if (key === 'captures') {
						keytitle = 'Caps';
					} else {
						keytitle = capitaliseFirstLetter(key);
					}
					if ((key == 'hold') || (key == 'prevent') || (key == 'timePlayed')) {
						$('#R300T_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+secondsToHMS(value / data.length)+'</div>');
						$('#R300T_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+secondsToHMS(value)+'</div>');
					} else {
						$('#R300T_PUPs').append('<div class="R300_pups_pergame" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? '' : 'display:none') + '" title="'+keytitle+' Per Game (click for totals)"><u>'+keytitle+'</u><br>'+(value / data.length).toFixed(2)+'</div>');
						if (key == 'powerups') {
							$('#R300T_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value / totalPotentialPowerups * 100).toFixed(2)+'%</div>');
						} else {
							$('#R300T_PUPs').append('<div class="R300_pups_total" style="margin:0 7px;' + (R300_Selections.ShowR300PUPsPerGame.value ? 'display:none' : '') + '" title="'+keytitle+' Total (click for per-game)"><u>'+keytitle+'</u><br>'+(value)+'</div>');
						}
					}
				});
				$('#R300T_PUPs').append('<div style="margin:0 7px;" title="Caps/Grab"><u>C/G</u><br>'+(totals.pups.captures / totals.pups.grabs).toFixed(3)+'</div>');
				$('#R300T_PUPs').append('<div style="margin:0 7px;" title="Tags/Pop"><u>T/P</u><br>'+(totals.pups.tags / totals.pups.pops).toFixed(3)+'</div>');

				$('#R300T_PUPs').on('click', function(){
					R300_Selections.ShowR300PUPsPerGame.value = !R300_Selections.ShowR300PUPsPerGame.value;
					GM_setValue('R300_Selections', R300_Selections);
					$('#ShowR300PUPsPerGame').prop('checked', R300_Selections.ShowR300PUPsPerGame.value);
					if (R300_Selections.ShowR300PUPsPerGame.value === true) {
						$('#R300T_PUPs').find('.R300_pups_pergame').show(0);
						$('#R300T_PUPs').find('.R300_pups_total').hide(0);
					} else {
						$('#R300T_PUPs').find('.R300_pups_pergame').hide(0);
						$('#R300T_PUPs').find('.R300_pups_total').show(0);
					}
				});
			}
		}


		tagpro.ready(function() {
			if (PageLoc === 'ingame') {
				tagpro.socket.on('settings', function(data) {
					if (tagpro.settings.stats === false) {
						$('.R300_Stats_Dependent').css('text-decoration', 'line-through').css('text-shadow', 'none');
					}
						$('.R300_Stats_Dependent').attr('title', 'Stats are OFF');
				});

				tagpro.socket.on('end', function(data) {
				    let GM_R300_Selections = GM_getValue('R300_Selections'); //ArryKane Added nested GM_getValue fix
					//if (!tagpro.spectator && tagpro.settings.stats && GM_getValue('R300_Selections').R300SavedGames.display && okToRequestServerData()) { //.display holds our profile id
					if (!tagpro.spectator && tagpro.settings.stats && GM_R300_Selections.R300SavedGames.display && okToRequestServerData()) { //.display holds our profile id
						setTimeout(function() {
							//$.getJSON(document.location.origin + "/profile_rolling/" + GM_getValue('R300_Selections').R300SavedGames.display).done(function(gamesdata) {
							$.getJSON(document.location.origin + "/profile_rolling/" + GM_R300_Selections.R300SavedGames.display).done(function(gamesdata) {
							    var serverRequests = GM_getValue('serverRequests', []);
								R300_Selections.R300SavedGames.value = gamesdata.reverse();
								GM_setValue('R300_Selections', R300_Selections);
								serverRequests.push(Date.now());
								if (serverRequests.length > 5) serverRequests.shift();
								GM_setValue('serverRequests', serverRequests);
							}).fail(function(jqxhr, textStatus, error) {
								console.log('R300: FAILED to get server data for profile: ' + R300_Selections.R300SavedGames.display + ' | ' + jqxhr.status + ' ' + error);
								//$('body').prepend('<div style="width:60%; margin:0 auto; background:#b0b; color:#fff; border-radius:3px">Could not get timeline data from server. Will try again next game...</div>');
								R300_Selections.R300SavedGames.value.push({outcome:999, saved:999}); //push an unknown outcome onto our saved data
								if (R300_Selections.R300SavedGames.value.length > 300) R300_Selections.R300SavedGames.value.shift();
								GM_setValue('R300_Selections', R300_Selections);
							});
						}, 3000);
					}
				});
			}
		});



		function init() {
			R300_Selections = $.extend(true, {}, options, GM_getValue('R300_Selections', options));
			$.each(R300_Selections, function(key, value) {
				R300_Selections[key].type = options[key].type;
				if (key !== 'R300SavedGames') {
					R300_Selections[key].display = options[key].display;
					if ((key !== 'R300MainPages') && (key !== 'R300HeaderPages')) {
						R300_Selections[key].title = options[key].title;
					}
				}
			});

			if (GM_getValue('R300_Selections') === 'undefined') { //first time
				GM_setValue('R300_Selections', R300_Selections);
			}


			//Setup the main div location depending on which page we are on...
			var R300_Div = '<div id="R300" style="position:relative; display:none; margin:20px auto; padding:10px; width:fit-content; color:#fff; text-align:center; text-shadow:2px 1px 2px #000000; border-radius:8px; ' + (R300_Selections.ShowBoxShadowBorder.value ? 'box-shadow:#fff 0px 0px 10px; ' : '') + 'background:rgba(0,0,0,0.1);  white-space:nowrap;">' +
				'<div style="display:inline-block">Rolling 300 Timeline</div>' +
				'<div id="R300_Settings_Button" style="display:inline-block; font:11px Arial; text-align:center; position:absolute; right:10px; height:14px; width:15px; border:1px outset #3A8CBB; border-radius:50%; cursor:pointer" title="Options">&#8286;</div>' +
				'</div>';

			//Chosen server page...
			if (PageLoc === 'server') {
				let $pos = $uHome;
				if (windowPosition_Home === 'top') $pos = $uTop;
				else if (windowPosition_Home === 'bottom') $pos = $uBottom;

				$pos.prepend(R300_Div);
				$pos.removeClass('hidden');
				$('#R300').append('<div id="R300_loading" style="margin:20px; font-size:18px; color:#ff0">Getting Data...<div style="background:#000000 url(\'http://i.imgur.com/WKZPcQA.gif\') no-repeat center; margin-top:10px; opacity:0.7; height:64px; width:100%;"></div></div>');
				if (R300_Selections.R300HeaderPages.title.indexOf('Home') >= 0) {
					$('body').prepend(WinP_Div);
				}

			//Profile page...
			} else if ((PageLoc === 'profile') || (PageLoc === 'profileNotOurs')) {
				if (R300_Selections.R300MainPages.title.indexOf('Profile') >= 0) {
					let $pos = $uTop;
					if (windowPosition_Profile === 'bottom') $pos = $uBottom;

					$pos.find('.row').append(R300_Div);
					$pos.removeClass('hidden');
				}
				if (R300_Selections.R300HeaderPages.title.indexOf('Profile') >= 0) {
					$('body').prepend(WinP_Div);
				}

			//Joining page...
			} else if (PageLoc === 'joining') {
				if (R300_Selections.R300MainPages.title.indexOf('Joiner') >= 0) {
					let $pos = $uTop;
					if (windowPosition_Joiner === 'bottom') $pos = $uBottom;

					$pos.find('.row').append(R300_Div);
					$pos.removeClass('hidden');
					$('#R300_Settings_Button').hide(0);
				}
				if (R300_Selections.R300HeaderPages.title.indexOf('Joiner') >= 0) {
					$('body').prepend(WinP_Div);
				}

			//In A Game...
			} else if (PageLoc === 'ingame') {
				if (R300_Selections.R300HeaderPages.title.indexOf('Game') >= 0) {
					$('body').prepend(WinP_Div);
				}
			}



			if ($('#R300').length) {
				$('#R300').append('<div id="R300_InnerContainer" style="display:none"></div>');
				$('#R300_InnerContainer').append('<div id="R300_Intervals"></div>');
				$('#R300_InnerContainer').append('<div id="R300_Timeline"></div>');
				$R300_Timeline = $('#R300_Timeline');
				$('#R300_InnerContainer').append('<div id="R300_MessagesPie" style="display:flex; align-items:center; justify-content:center; font-size:12px"></div>');
				$('#R300_MessagesPie').append('<div id="R300_Messages" style="flex:0 0 auto; align-self:flex-start;"></div>');
				$R300_Messages = $('#R300_Messages');
				$('#R300_MessagesPie').append('<div id="R300_Trimmed" style="display:none; flex:0 0 auto; margin:0 0 0 20px; padding:4px; border:1px solid #aaa; border-radius:3px; font-size:11px"></div>');
				$('#R300_Trimmed').append('<div id="R300T_Timeline" style="padding:0"></div>');
				$R300T_Timeline = $('#R300T_Timeline');
				$('#R300_Trimmed').append('<div id="R300T_Messages"></div>');
				$R300T_Messages = $('#R300T_Messages');
			}

			if ( $('#R300').length || $('#R300_WinNextHeader').length ) {
				loadData();
			}
		}



		function wait() {
			if (document.body) { // && document.hasFocus()
				setTimeout(init, 500);
			} else {
				setTimeout(wait);
			}
		}
		wait();
	}
	// Load the external script and execute the callback
	loadScript(externalScriptURL, loadR300Script);
	console.log("TPMOBILE: LOADED Nabbys_Rolling_300")
})();