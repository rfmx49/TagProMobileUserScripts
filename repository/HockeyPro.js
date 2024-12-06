// ==UserScript==
// @name         HockeyPro
// @version      0.1
// @description  Hockey 2023 Event QOL and visual updates
// @author       ASAP, Racgiman, MC Ride, Catalyst
// @match       game
// @updateURL    https://gist.github.com/asapcaplord/d54d8c9cbe54a074dbd300fb596b1949/raw/HockeyPro.user.js
// @downloadURL  https://gist.github.com/asapcaplord/d54d8c9cbe54a074dbd300fb596b1949/raw/HockeyPro.user.js
// @TPMUSJMURL	 https://raw.githubusercontent.com/rfmx49/TagProMobileUserScripts/refs/heads/main/repository/HockeyPro.js
/* @customSettings
HP_SettingsObject = {
    removeSnow: { value: true, description: 'Set to false to keep the snow effects' },
    lock_ball: { value: true, description: 'Lock the camera to your ball like in regular tagpro. In eggball, the camera is by default vertically locked to the field giving an out-of-ball sensation.' },
    spec_only: { value: false, description: 'Set the value to false to expand viewport while playing. Set the value to true to expand only when spectating.' },
    auto_zoom: { value: true, description: 'Set true/false to toggle auto-zoom level when spectating.' },
    pp_egg: { value: true, description: 'Set the value to true to use a pixel perfect egg. Set to false to use the vanilla egg.' },
	egg_url: { value: 'https://i.imgur.com/AyhhO6i.png', description: 'Set url of custom egg image, Only applies if pp_egg is true' },
    egg_team_url: { value: 'https://i.imgur.com/hZbZT5z.png', description: 'Set url of custom egg team indicator image (29x29). Only applies if pp_egg is true.' },
    imp_map: { value: true, description: 'Set the value to true to use the custom, improved map. Set to false to use the vanilla map.' },
	field_url: { value: 'https://i.imgur.com/wPLx2dD.png', description: 'Set url of custom field image. Only applies if imp_map is true.' },
	highlight: { value: true, description: 'Set the value to true to highlight your ball' },
    highlight_url: { value: 'https://i.imgur.com/h23oRYI.png', description: 'Set url of the highlight ring around your ball. Only applies if highlight is true.' },
    pass_sound: { value: true, description: 'Set to true to have a passing sound play whenever anyone passes the egg.' },
    score_difference: { value: false, description: 'Set to true to show your teams current score differential.' }
}
*/
// ==/UserScript==

//--------------CHANGELOG--------------
/*
Note: All new features are opt-in and will continue to be so in any future updates. This means your settings will be reset to their defaults upon updating.
~~~Version 1.10 (July 21, 2021)~~~

Added option to flash the ball of the player who threw the egg until they are safe from a turnover pop.
Fixed map name

Added default settings:
flash_passer=false;

~~~Version 1.9 (February 23, 2021)~~~

Added option to have a passing sound play whenever anyone passes the egg.
Added option to have the egg change colors to indicate raptor (green egg) and interception status (orange egg).
Added default enabled option to show your team's current score differential.
Added default enabled option to show a text alert when a raptor boat occurs.

Added default settings:
pass_sound=false;
egg_timer=false;
score_difference=true;
boat_notice=true;

~~~Version 1.8 (January 29, 2021)~~~

Added option to use a custom texture pack. Note this will affect your texture pack in normal games of TagPro as well.

Added default settings:
custom_texture=false;
texture_url="https://i.imgur.com/mpdNY1g.png";

~~~Version 1.7 (July 7, 2020)~~~

Added default enabled option to shoot when aiming and clicking outside of the field area.
Added option to shoot on mouse click down without needing to release the mouse button.
Other mouse buttons besides left click no longer trigger shooting or autoshoot, if applicable.
Fixed bug that was preventing some autoshoots when using both auto_key and auto_mouse at the same time.

Added default settings:
extend_click=true;
half_click=false;

~~~Version 1.6 (June 22, 2020)~~~

Added option to disable raptor images. Thanks nabby!

Added default setting:
hide_raptors=false;

~~~Version 1.5 (April 23, 2020)~~~

Updated game url.
Added option to use mouse click as autoshoot trigger.

Added default setting:
auto_mouse=false;

~~~Version 1.4 (July 12, 2019)~~~

Added support for new SWJ servers.
Added option to highlight your own ball.
Added option to lock the camera to your ball, just like in regular TagPro. The script used to do this automatically until something changed in the game code.
     Now you can play either way, but the default is the old script behavior of locked to ball.
Fixed the aiming line to work with the current version of the game/servers.
Fixed the autoshoot aim to work with the current version of the game/servers.
Adjusted the autoshoot rate limiter so you won't get kicked from games for painting the wall. This might need further adjustments.
Added some checks to disable the effects of this script in regular TagPro games.
Updated the default imgur urls to use https instead of http so TagPro maintains a secure connection.

Added default settings:
highlight=false
highlight_url="https://i.imgur.com/h23oRYI.png"
lock_ball=true

~~~Version 1.3 (June 19, 2017)~~~

Added ability to autoshoot when picking up the egg. Activated by holding Left Shift by default (reassign the key in settings).
Added custom crosshair support.
Added aiming line.

Added default settings:
auto_shoot=false
custom_crosshair=false
aim_line=false
crosshair_url="http://i.imgur.com/Pjxxh20.png"
auto_key=16
aim_line_color=0xFF00FF
aim_line_alpha=1

*/
//-----------END OF CHANGELOG-----------

(function() {
try {
//--------------SETTINGS--------------
///Set to false to keep the snow effects

 var removeSnow = HP_SettingsObject.removeSnow?.value ?? true;

 //Gets rid of the ice
 var image_ice = document.getElementById('ice');
 image_ice.parentNode.removeChild(image_ice);

 //Sets new textures for just Winter 2023 Modes
 $('#tiles').attr("src", "https://i.imgur.com/6ozpNkQ.pngi"); //

 //Lock the camera to your ball like in regular tagpro. In eggball, the camera is by default vertically locked to the field giving an out-of-ball sensation.
 var lock_ball = HP_SettingsObject.lock_ball?.value ?? true;;

 //Set the value to false to expand viewport while playing. Set the value to true to expand only when spectating.
 var spec_only = HP_SettingsObject.spec_only?.value ??  false;

 //Set true/false to toggle auto-zoom level when spectating.
 var auto_zoom= HP_SettingsObject.auto_zoom?.value ?? true;

 //Set the value to true to use a pixel perfect egg. Set to false to use the vanilla egg.
 var pp_egg= HP_SettingsObject.pp_egg?.value ?? true;

 //Set the value to true to use the custom, improved map. Set to false to use the vanilla map.
 var imp_map= HP_SettingsObject.pp_egg?.value ?? true;

 //Set the value to true to enable autoshooting when picking up the egg. Set to false to disable.
 var auto_shoot=false;

 //Set the value to true to use a custom crosshair. Set to false to use the default crosshair.
 var custom_crosshair=false;

 //Set the value to true to enable an aiming line to your cursor position. Set to false to disable.
 var aim_line=false;

 //Set url of custom egg image (23x23 for pixel perfect). Only applies if pp_egg=true.
 var egg_url= HP_SettingsObject.egg_url?.value ?? "https://i.imgur.com/AyhhO6i.png";

 //Set url of custom egg team indicator image (29x29). Only applies if pp_egg=true.
 var egg_team_url= HP_SettingsObject.egg_team_url?.value ?? "https://i.imgur.com/hZbZT5z.png";

 //Set url of custom field image. Only applies if imp_map=true.
 var field_url= HP_SettingsObject.field_url?.value ?? "https://i.imgur.com/wPLx2dD.png";

 //Set url of custom crosshair image (designed for 32x32). Only applies if custom_crosshair=true.
 var crosshair_url="https://i.imgur.com/Pjxxh20.png";

 var highlight
 = HP_SettingsObject.highlight?.value ?? true;

 //Set url of the highlight ring around your ball. Only applies if highlight=true.
 var highlight_url= HP_SettingsObject.highlight_url?.value ?? "https://i.imgur.com/h23oRYI.png"

 //Set autoshoot key. Default is Left Shift (16). Only applies if auto_shoot=true.
 //Use this app to get the correct keycode: https://codepen.io/chriscoyier/full/mPgoYJ/ or see https://msdn.microsoft.com/en-us/library/aa243025(v=vs.60).aspx
 var auto_key=16;

 //Change to true to enable holding mouse click down as the autoshoot trigger. No effects to usual shooting with mouse. Only applies if auto_shoot=true.
 var auto_mouse=false;

 //Set the color of the aiming line in hex with 0x prefix. Default is 0xFF00FF (matches the custom crosshair). Only applies if aim_line=true.
 var aim_line_color=0xFF00FF;

 //Set the transparency of the aiming line. Ranges from 0 (transparent) to 1 (opaque). Only applies if aim_line=true.
 var aim_line_alpha=1;

 //Set to true to pass the egg on mouse click down, without needing to release the click up. Note, setting this to true will also enable the same behavior of extend_click=true.
 var half_click=true;

 //Set to true to allow aiming and shooting by clicking anywhere outside of the field area.
 var extend_click=true;

 //Set to true to use a custom texture pack. Note this will affect your texture pack in normal games of TagPro as well. Set to false to use the vanilla egg ball texture pack.
 var custom_texture=false;

 //Set url of custom texture pack tiles image. Only applies if custom_texture=true.
 var texture_url="https://i.imgur.com/mpdNY1g.png";

 //Set to true to have a passing sound play whenever anyone passes the egg.
 var pass_sound= HP_SettingsObject.pass_sound?.value ?? true;

 //Set to true to have the egg change colors to indicate raptor (green egg) and interception status (orange egg).
 var egg_timer=false;

 //Set to true to show your team's current score differential.
 var score_difference= HP_SettingsObject.score_difference?.value ?? true;

 //Set to true to show a text alert when a raptor boat occurs.
 var boat_notice=true;

 var hide_raptors=false

 //Set to true to flash the ball of the player who threw the egg until they are safe from a turnover pop.
 var flash_passer=false;
//-----------END OF SETTINGS-----------


var oldh=0;
var oldw=0;
var eggball=false;
var lastHolder=null;
var flashInterval=null;
var flashTimeout=null;
if(custom_texture){
    var assetId = generateId();
    var image = new Image();
    image.crossOrigin = true;
    image.src = texture_url;
    image.id = assetId;
    image.className = "asset";
    overrideableAssets["tiles"] = "img#" + assetId;
    console.log(assetId);
    console.log("ASSET");
    $(document).ready(function () {
        $("#assets").append(image);
    });
}

function flashPlayer(){
    lastHolder.sprite.alpha=lastHolder.sprite.alpha==1 ? .5: 1;
}

tagpro.ready(function() {
    tagpro.socket.on('map', function(data) {
        if (data.info.name=="Winter 2023 Hockey"){
            eggball=true;
            //Removes the snow effect
            //Gets rid of the ice
            var image_ice = document.getElementById('ice');
            image_ice.parentNode.removeChild(image_ice);

            if(removeSnow) {
            tagpro.renderer.emitters = tagpro.renderer.emitters.filter((filter) => filter.startAlpha == 0.73 ? false : true);
            tagpro.renderer.layers.ui.children = tagpro.renderer.layers.ui.children.filter((child) => (child.alpha == 1 || child.alpha == 0.5 || child.alpha == 0.75) ? child : false)
            }
            if(custom_crosshair) {
                $("<style type='text/css'>canvas{cursor: url("+crosshair_url+") 16 16, crosshair !important;}</style>").appendTo("head");
            }
        }
    });

    tagpro.socket.on("hockeyEvent", function(data) {
        gameState = data.state;
        eggHolder = tagpro.players[data.holder];
        if(auto_shoot && (autom ||autokey) && eggHolder===tagpro.players[tagpro.playerId]){
            autoShoot();
        }
        if (data.holder===null && gameState==="play"){
            if (pass_sound && lastHolder!==tagpro.players[tagpro.playerId]){
                tagpro.playSound("throw", 1);
            }
            if (flash_passer && lastHolder){
                flashInterval=setInterval(flashPlayer,100);
                flashTimeout=setTimeout(function(){
                    lastHolder.sprite.alpha=1;
                    clearInterval(flashInterval);
                },3000);
            }
        }
        else{
            if (flashInterval){
                clearInterval(flashInterval);
            }
            if (lastHolder){
                lastHolder.sprite.alpha=1;
            }
            if (flashTimeout){
                 clearTimeout(flashTimeout);
            }
            lastHolder=eggHolder;
        }
        updateTeamWithEgg();
        eggball=true;
    });

    tagpro.socket.on('score', function(data) {
        if (score_difference && eggball){
            updateScoreDifference(data);
        }
        if (flashInterval){
            clearInterval(flashInterval);
        }
    });

    $('#switchButton').on('click', function() {
        if (score_difference && eggball){
            setTimeout(function() {
                updateScoreDifference({r:tagpro.score.r, b:tagpro.score.b});
            }, 1000);
        }
    });

    if (score_difference && eggball){
        updateScoreDifference({r:tagpro.score.r, b:tagpro.score.b});
    }

    tagpro.socket.on('boat', function(data) {
        if (boat_notice){
            boatScore();
        }
    });

    var stage = tagpro.renderer.stage;
    var container = tagpro.renderer.gameContainer;
    var MousePos = { x: 0, y: 0 };
    var autom=false;
    var autokey=false;
    stage.interactive = true;
    stage.mousemove = function(e) {
        MousePos.x = e.data.global.x;
        MousePos.y = e.data.global.y;
    };

    onmousemove=function(e){
        if(!tagpro.spectator && aim_line && eggball){
            var player = tagpro.players[tagpro.playerId];
            try {
                player.sprites.aim.clear();
                player.sprites.aim.lineStyle(2, aim_line_color, aim_line_alpha);
                player.sprites.aim.moveTo(20,20);
                if (spec_only){
                    player.sprites.aim.lineTo((e.clientX-window.innerWidth/2)*1280/$('#viewport').width()+20, (e.clientY-window.innerHeight/2)*800/$('#viewport').height()+20);
                }
                else {
                    player.sprites.aim.lineTo((e.clientX-window.innerWidth/2)+20, (e.clientY-window.innerHeight/2)+20);
                }
            }
            catch (err){
                player.sprites.aim = new PIXI.Graphics();
                player.sprites.ball.addChild(player.sprites.aim);
            }
        }
    };

    if (lock_ball){
        tagpro.renderer.updateCameraPosition = function (player) {
            if (player.sprite.x !== -1000 && player.sprite.y !== -1000) {
                tagpro.renderer.centerContainerToPoint(player.sprite.x + 19, player.sprite.y + 19);
            }
        };
    }

    document.onkeydown = function(e){
        if(e.keyCode===auto_key){
            autokey=true;
        }
    };
    document.onkeyup = function(e){
        if(e.keyCode===auto_key){
            autokey=false;
        }
    };

    document.onmousedown = function(e){
        if(half_click && e.button==0){
            var clickPos = {
                x: (MousePos.x * (1 / container.scale.x)) - (container.position.x * (1 / container.scale.x)),
                y: (MousePos.y * (1 / container.scale.y)) - (container.position.y * (1 / container.scale.y))
            };
            tagpro.socket.emit("click", clickPos);
        }
        if(auto_mouse && e.button==0){
            autom=true;
        }
    };
    document.onmouseup = function(e){
        if(auto_mouse && e.button==0){
            autom=false;
        }
    };

    document.onclick=function(e){
        if(extend_click && e.button==0){
            var clickPos = {
                x: (MousePos.x * (1 / container.scale.x)) - (container.position.x * (1 / container.scale.x)),
                y: (MousePos.y * (1 / container.scale.y)) - (container.position.y * (1 / container.scale.y))
            };
            tagpro.socket.emit("click", clickPos);
        }
    };

    var gameState = null;
    var eggHolder = null;
    var realUpdatePlayerPowerUps = tagpro.renderer.updatePlayerPowerUps;

    if (imp_map){
        tagpro.renderer.afterDrawBackground = function() {
            if(eggball){
                const fieldSprite = new PIXI.Sprite.fromImage(field_url);
                fieldSprite.x = 40;
                fieldSprite.y = 40;
                tagpro.renderer.layers.foreground.addChildAt(fieldSprite, 0);}
        };
    }

    try{
        tagpro.renderer.updatePlayerPowerUps = function (player, context, drawPos) {
            realUpdatePlayerPowerUps(player, context, drawPos);
            if (pp_egg && eggball){
                if (!player.sprites.egg2) {
                    player.sprites.egg2 = new PIXI.Sprite.fromImage(egg_url);
                    player.sprites.egg2.width = 23;
                    player.sprites.egg2.height = 23;
                    player.sprites.egg2.x = 8;
                    player.sprites.egg2.y = 8;
                    player.sprite.addChildAt(player.sprites.egg2,1);
                }
                player.sprites.egg2.alpha = eggHolder === player ? 1 : 0;
                if (player.sprites.egg){
                    player.sprites.egg.alpha = 0;}
            }
        };}
    catch(err){
        //Not egg mode
    }
    var eggTeam = new PIXI.Sprite.fromImage("events/winter-2023-hockey/images/puck.png");
    if (pp_egg){
        eggTeam = new PIXI.Sprite.fromImage(egg_team_url);}
    eggTeam.width = 29;
    eggTeam.height = 29;
    eggTeam.anchor.x = 0.5;
    eggTeam.anchor.y = 0.5;
    eggTeam.alpha = 0.75;
    eggTeam.visible = false;
    try{
        tagpro.renderer.layers.ui.addChildAt(eggTeam,1);
        tagpro.renderer.layers.ui.removeChildAt(0);}
    catch(err){
        //Not egg mode
    }

    var rate=true;
    function autoShoot(){
        if (!rate) return;
        rate=false;
        var clickPos = {
            x: (MousePos.x * (1 / container.scale.x)) - (container.position.x * (1 / container.scale.x)),
            y: (MousePos.y * (1 / container.scale.y)) - (container.position.y * (1 / container.scale.y))
        };
        tagpro.socket.emit("click", clickPos);
        setTimeout(function(){rate = true;}, 15);//needed to avoid kick for too many server requests
    }

    function updateTeamWithEgg() {
        if (!tagpro.ui.sprites["yellowFlagTakenByRed"]) {
            return setTimeout(updateTeamWithEgg.bind(this), 50);
        }
        if (!eggHolder) {
            eggTeam.visible = false;
        }
        else {
            eggTeam.visible = true;
            if (eggHolder.team === 1) {
                const pos = tagpro.ui.sprites["yellowFlagTakenByRed"];
                eggTeam.x = pos.x;
                eggTeam.y = pos.y;
            }
            else {
                const pos = tagpro.ui.sprites["yellowFlagTakenByBlue"];
                eggTeam.x = pos.x;
                eggTeam.y = pos.y;
            }
        }
    }

    var oldUpdateMarsball = tagpro.renderer.updateMarsBall.bind(tagpro.updateMarsBall);
    var oldDrawMarsball = tagpro.renderer.drawMarsball.bind(tagpro.renderer);

    tagpro.renderer.updateMarsBall = function(object, position) {
        if (object.type == "egg") {
            position.x = position.x + 20;
            position.y = position.y + 20;
        }

        oldUpdateMarsball(object, position);
    };

    tagpro.renderer.drawMarsball = function (object, position) {
        if (object.type == "marsball") {
            return oldDrawMarsball(object, position);
        }
        if (object.type !== "egg") {
            return;
        }
        if (tagpro.spectator) {
            object.draw = true;
        }
        if (pp_egg){
            object.sprite = new PIXI.Sprite.fromImage(egg_url);}
        else {
            object.sprite = new PIXI.Sprite.fromImage("events/winter-2023-hockey/images/puck.png");}
        object.sprite.position.x = position.x;
        object.sprite.position.y = position.y;
        object.sprite.width = 23;
        object.sprite.height = 23;
        if (egg_timer) {
            object.sprite.tint = 0x00FF63;
            setTimeout(function () {
                object.sprite.tint = 0xA654CC;
            }, 1500);
            setTimeout(function () {
                object.sprite.tint = 0xFFFFFF;
            }, 3000);
        }
        object.sprite.pivot.set(23*0.5, 23*0.5);
        tagpro.renderer.layers.foreground.addChild(object.sprite);
        object.sprite.keep = true;
        if (!object.draw) {
            object.sprite.visible = false;
        }
    };

    //Thanks to /u/nabbynz for this code block to hide the raptors!
    if (hide_raptors) {
        for (let i=0; i<tagpro.renderer.layers.ui.children.length; i++) {
            if (tagpro.renderer.layers.ui.children[i].texture.baseTexture.imageUrl.includes('raptor')) { //e.g.: events/easter-2017/images/raptor13.png
                console.log('Hiding Raptor:', tagpro.renderer.layers.ui.children[i].texture.baseTexture.imageUrl);
                tagpro.renderer.layers.ui.children[i].renderable = false;
            }
        }
    }
    function waitForId() {
        if (!tagpro.playerId) {
            return setTimeout(waitForId, 100);
        }
        if((tagpro.spectator || !spec_only) && eggball)
        {
            //Resize viewport
            resize();
            if(tagpro.spectator){
                tagpro.viewport.followPlayer=false;
            }
            //Check for resizing and update FOV and zoom accordingly
            setInterval(updateFOV, 500);
        }
    }
    waitForId();
});

//Thanks to /u/nabbynz for this code block adapted from his script TagPro Map Name Below Timer (& More!)
var updateScoreDifference = function(data) {
     let diffText = '=';
     let color = '#ffff40';

     if (data.r - data.b > 0) {
         if (tagpro.playerId && tagpro.players[tagpro.playerId].team === 1) {
             diffText = '+' + Math.abs(data.r - data.b);
             color = '#00CC00';
         } else {
             diffText = '-' + Math.abs(data.r - data.b);
             color = '#CC0000';
         }
     } else if (data.r - data.b < 0) {
         if (tagpro.playerId && tagpro.players[tagpro.playerId].team === 1) {
             diffText = '-' + Math.abs(data.r - data.b);
             color = '#CC0000';
         } else {
             diffText = '+' + Math.abs(data.r - data.b);
             color = '#00CC00';
         }
     }

     let scoreDiff = new PIXI.Text(diffText, {fontFamily:'Verdana', fontSize:'32px', fontWeight:'bold', fill:color, dropShadow:true, dropShadowAlpha:0.7, dropShadowDistance:1});

     scoreDiff.anchor.x = 0.5;
     scoreDiff.x = ($("#viewport").width() / 2);
     scoreDiff.y = $("#viewport").height() - 86;
     scoreDiff.alpha = 0.7;

     if (!tagpro.ui.sprites.scoreDiff) {
         tagpro.ui.sprites.scoreDiff = new PIXI.Container();
     }

     tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.scoreDiff);
     tagpro.ui.sprites.scoreDiff.removeChildren();
     tagpro.ui.sprites.scoreDiff.addChild(scoreDiff);
 };


function resize(){
    tagpro.renderer.canvas_width = window.innerWidth;
    tagpro.renderer.canvas_height = window.innerHeight;
    tagpro.renderer.resizeView();
    tagpro.renderer.centerView();
    if (score_difference){
        updateScoreDifference({r:tagpro.score.r, b:tagpro.score.b});
    }
}

function updateFOV() {
    var h = $('#viewport').height();
    var w = $('#viewport').width();
    //Resize viewport
    if (h!=window.innerHeight||w!=window.innerWidth){
        resize();
        h = $('#viewport').height();
        w = $('#viewport').width();
    }
    //Auto-zoom to fill viewport
    if(tagpro.spectator && auto_zoom && (oldh!=h ||oldw!=w))
    {
        var yzoom=tagpro.map[0].length*40/h;
        var xzoom=tagpro.map.length*40/w;
        tagpro.zoom=Math.max(xzoom,yzoom,1);
    }
    oldh=h;
    oldw=w;
}
console.log("TPMOBILE: LOADED Hockey Pro")
} catch(err) {
    console.log("Error in HockeyPro Script at " + err);
}
})();