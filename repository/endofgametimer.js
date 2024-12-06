// ==UserScript==
// @name         TagPro End of Game Timer
// @version      0.2
// @TPMUSJMURL	 https://raw.githubusercontent.com/rfmx49/TagProMobileUserScripts/refs/heads/main/repository/endofgametimer.js
// @description  Show how much time is left once a game ends until you're put back into the joiner
// @match        game
// @author       Some Ball -1
// @grant        none
// ==/UserScript==
(function() {
tagpro.ready(function() {
    tagpro.socket.on('end',function() {
        var timeleft = 24,
            timer = new PIXI.Text('24 seconds until next game',
                  {
                      font: "bold 48pt arial",
                      fill: "#ffffff",
                      stroke: "#000000",
                      strokeThickness: 2
                  });
        timer.anchor.x = 0.5, timer.anchor.y = 0.5, timer.x = document.getElementById('viewport').width/2, timer.y = document.getElementById('viewport').height/10*9;
        tagpro.renderer.layers.ui.addChild(timer);
        setInterval(function() {
            timer.text = --timeleft+' seconds until next game';
        },1000);
    });
});

})();