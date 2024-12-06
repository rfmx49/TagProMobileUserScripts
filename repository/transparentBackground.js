// ==UserScript==
// @name         Transparent Background
// @namespace    /user/newcompte/
// @description  Removes black background from game view, also allows you to set custom background image.
// @author       NewCompte, Catalyst
// @match       game
// @customSettings  transparentBGCustomSettings = {BackgroundURL: {value: "", description: "Enter the url to a custom image to set as the background image, leave blank leave transparent."}}
// ==/UserScript==
(function() {

    if (transparentBGCustomSettings.BackgroundURL.value != "") {
        $('html').css({"background-image":"url(" + transparentBGCustomSettings.BackgroundURL.value + ")"});
    }

    tagpro.ready(function () {
       var oldCanvas = $(tagpro.renderer.canvas);
       var newCanvas = $('<canvas id="viewport" width="1280" height="800"></canvas>');
       oldCanvas.after(newCanvas);
       oldCanvas.remove();
       tagpro.renderer.canvas = newCanvas.get(0);
       tagpro.renderer.options.transparent = true;
       tagpro.renderer.renderer = tagpro.renderer.createRenderer();
       tagpro.renderer.resizeAndCenterView();
       newCanvas.show();
    });
console.log("TPMOBILE: TIMER SCRIPT LOADED");
})();