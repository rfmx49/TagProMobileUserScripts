// ==UserScript==
// @name            TagPro Ball Enhancer
// @description     Enhances Balls.
// @version         0.1.0
// @match           all
// @updateURL       https://gist.github.com/nabbynz/86b7fb4c8a95a3202b35009f23c2f2c5/TagPro_Ball_Enhancer.user.js
// @downloadURL     https://gist.github.com/nabbynz/86b7fb4c8a95a3202b35009f23c2f2c5/TagPro_Ball_Enhancer.user.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_addStyle
// @grant           GM_setClipboard
// @author          nabby
// ==/UserScript==



(function() {
    //TagPro Android Create Methods for GM_setValue, GM_getValue, and GM_deleteValue,
    //Will store these values into localStorage as strings.
    var userScriptKey = "GM_NBE";

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
			name: "TagPro Ball Enhancer",
			version: "0.1.0",
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
'use strict';

/* eslint-env jquery */
/* globals tagpro, PIXI */
/* eslint-disable no-multi-spaces */
/* eslint-disable dot-notation */


let defaultOptions = { // all these values get updated/overwritten by the script - don't change
    ball_red_bg_color: '#ee3322',
    ball_red_bg_size: '38',
    ball_red_bg_opacity: '1',
    ball_red_bg_drawbefore: false,
    ball_red_x: '0',
    ball_red_y: '0',
    ball_red_size: '40',
    ball_red_opacity: '0.8',
    ball_red_brightness: '100',
    ball_red_contrast: '100',
    ball_red_saturate: '100',
    ball_red_invert: false,
    ball_red_gco: 'color',
    ball_red_tint: false,
    ball_red_tint_color: '#ee3322',
    ball_red_clip: '38',

    ball_red_circle_color: '#ff6666',
    ball_red_circle_linewidth: '0',
    ball_red_circle_size: '10',
    ball_red_circle_opacity: '0.8',
    ball_red_circle_dashpattern: '',
    ball_red_circle_glow: false,
    ball_red_circle_gco: 'source-over',

    skin_red_bg_color: '#ee3322',
    skin_red_bg_size: 32,
    skin_red_bg_opacity: '1',
    skin_red_bg_drawbefore: false,
    skin_red_x: '0',
    skin_red_y: '0',
    skin_red_size: '44',
    skin_red_opacity: '0.75',
    skin_red_brightness: '100',
    skin_red_contrast: '100',
    skin_red_saturate: '100',
    skin_red_invert: false,
    skin_red_gco: 'color',
    skin_red_tint: false,
    skin_red_tint_color: '#ee3322',
    skin_red_clip: '38',

    skin_red_spin: false,
    skin_red_spinspeed: '1',
    skin_red_shadow: true,
    skin_red_shine: true,

    skin_red_circle_color: '#ffffff',
    skin_red_circle_linewidth: '0',
    skin_red_circle_size: '0',
    skin_red_circle_opacity: '0.8',
    skin_red_circle_dashpattern: '',
    skin_red_circle_glow: false,
    skin_red_circle_gco: 'source-over',



    ball_blue_bg_color: '#5555ff',
    ball_blue_bg_size: '38',
    ball_blue_bg_opacity: '1',
    ball_blue_bg_drawbefore: false,
    ball_blue_x: '0',
    ball_blue_y: '0',
    ball_blue_size: '40',
    ball_blue_opacity: '0.8',
    ball_blue_brightness: '100',
    ball_blue_contrast: '100',
    ball_blue_saturate: '100',
    ball_blue_invert: false,
    ball_blue_gco: 'color',
    ball_blue_tint: false,
    ball_blue_tint_color: '#5555ff',
    ball_blue_clip: '38',

    ball_blue_circle_color: '#5555ff',
    ball_blue_circle_linewidth: '0',
    ball_blue_circle_size: '10',
    ball_blue_circle_opacity: '0.8',
    ball_blue_circle_dashpattern: '',
    ball_blue_circle_glow: false,
    ball_blue_circle_gco: 'source-over',

    skin_blue_bg_color: '#5555ff',
    skin_blue_bg_size: 32,
    skin_blue_bg_opacity: '1',
    skin_blue_bg_drawbefore: false,
    skin_blue_x: '0',
    skin_blue_y: '0',
    skin_blue_size: '44',
    skin_blue_opacity: '0.75',
    skin_blue_brightness: '100',
    skin_blue_contrast: '100',
    skin_blue_saturate: '100',
    skin_blue_invert: false,
    skin_blue_gco: 'color',
    skin_blue_clip: '38',
    skin_blue_tint: false,
    skin_blue_tint_color: '#5555ff',

    skin_blue_spin: false,
    skin_blue_spinspeed: '1',
    skin_blue_shadow: true,
    skin_blue_shine: true,

    skin_blue_circle_color: '#ffffff',
    skin_blue_circle_linewidth: '0',
    skin_blue_circle_size: '0',
    skin_blue_circle_opacity: '0.8',
    skin_blue_circle_dashpattern: '',
    skin_blue_circle_glow: false,
    skin_blue_circle_gco: 'source-over',
};

let defaultValues = {
    texture_ballskins: 'https://i.imgur.com/Jy80iM0.png',

    //mysaves: {},

    globalOptions: {
        show_all_options: false,
    },

    presets: {
        'select-PS01': {"ball_x":"0","ball_y":"192","skin_x":"48","skin_y":"528","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"53","ball_opacity":"1","ball_saturate":"100","ball_invert":false,"ball_tint":false,"ball_gco":"overlay","ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"22","skin_bg_opacity":"0.35","skin_size":"32","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"destination-out","skin_clip":"38","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_gco":"source-over","ball_red_bg_color":"#d62424","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c11515","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#5555ff","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS02': {"ball_x":"48","ball_y":"480","skin_x":"144","skin_y":"576","ball_bg_size":"38","ball_bg_opacity":"0.5","ball_bg_drawbefore":false,"ball_size":"44","ball_opacity":"0.9","ball_saturate":"100","ball_invert":false,"ball_tint":false,"ball_gco":"lighter","ball_circle_linewidth":"10","ball_circle_size":"10","ball_circle_opacity":"1","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"destination-out","skin_bg_size":"38","skin_bg_opacity":"0.85","skin_size":"50","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"color","skin_clip":"36","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"18","skin_circle_size":"10","skin_circle_opacity":"1","skin_circle_dashpattern":"","skin_circle_gco":"destination-out","ball_red_bg_color":"#c50707","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c11515","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#175fd3","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#1960d2","skin_blue_circle_color":"#ffffff"},
        'select-PS03': {"ball_x":"0","ball_y":"48","skin_x":"192","skin_y":"144","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"24","ball_opacity":"0.75","ball_saturate":"100","ball_invert":true,"ball_tint":false,"ball_gco":"overlay","ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"0","skin_bg_opacity":"0","skin_size":"32","skin_opacity":"0.8","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"destination-in","skin_clip":"30","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"2","skin_circle_size":"37","skin_circle_opacity":"0.59","skin_circle_dashpattern":"","skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2e54ea","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS04': {"ball_x":"336","ball_y":"144","skin_x":"288","skin_y":"432","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"40","ball_opacity":"0.9","ball_saturate":"100","ball_invert":false,"ball_tint":false,"ball_gco":"color","ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"64","skin_bg_opacity":"0.3","skin_size":"38","skin_opacity":"0.3","skin_brightness":"80","skin_contrast":"300","skin_saturate":"40","skin_invert":false,"skin_gco":"color","skin_clip":"38","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#5555ff","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS05': {"ball_x":"192","ball_y":"96","skin_x":"240","skin_y":"672","ball_size":"59","ball_opacity":"1","ball_saturate":"100","ball_invert":false,"ball_gco":"overlay","ball_circle_linewidth":"18","ball_circle_size":"15","ball_circle_opacity":"1","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"destination-out","skin_size":"51","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"xor","skin_clip":"30","skin_shadow":true,"skin_shine":false,"skin_circle_linewidth":"0","skin_circle_size":"32","skin_circle_opacity":"1","skin_circle_dashpattern":"22,10","skin_circle_gco":"destination-over","ball_red_bg_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2e54ea","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS06': {"ball_x":"336","ball_y":"336","skin_x":"240","skin_y":"48","ball_size":"42","ball_opacity":"0.95","ball_saturate":"100","ball_invert":false,"ball_gco":"color","ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_size":"32","skin_opacity":"0.95","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"destination-in","skin_clip":"38","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2e54ea","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS07': {"ball_red_x":"480","ball_red_y":"0","skin_red_x":"192","skin_red_y":"48","ball_blue_x":"480","ball_blue_y":"0","skin_blue_x":"192","skin_blue_y":"48","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"53","ball_opacity":"0.85","ball_brightness":"100","ball_contrast":"100","ball_saturate":"50","ball_invert":false,"ball_gco":"multiply","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"0","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"4","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"20","skin_bg_opacity":"0","skin_bg_drawbefore":false,"skin_size":"34","skin_opacity":"0.8","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"color","skin_clip":"62","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":false,"skin_circle_linewidth":"1","skin_circle_size":"38","skin_circle_opacity":"0.6","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#ee3322","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#5555ff","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#5555ff","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS08': {"ball_x":"48","ball_y":"0","skin_x":"144","skin_y":"192","ball_size":"128","ball_opacity":"1","ball_gco":"destination-over","ball_circle_linewidth":"8","ball_circle_size":"12","ball_circle_opacity":"1","ball_circle_dashpattern":"6","ball_circle_glow":false,"ball_circle_gco":"destination-over","skin_size":"52","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_gco":"source-atop","skin_clip":"48","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"1","skin_circle_size":"37","skin_circle_opacity":"0.4","skin_circle_dashpattern":"","skin_circle_gco":"source-over","ball_red_bg_color":"#000000","ball_red_circle_color":"#ff0000","skin_red_bg_color":"#c11515","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#000000","ball_blue_circle_color":"#075688","skin_blue_bg_color":"#0b70a2","skin_blue_circle_color":"#ffffff","color":"blue"},
        'select-PS09': {"ball_x":"0","ball_y":"432","skin_x":"144","skin_y":"192","ball_size":"150","ball_opacity":"1","ball_gco":"color","ball_circle_linewidth":"4","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"16,15","ball_circle_glow":false,"ball_circle_gco":"source-atop","skin_size":"0","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_gco":"source-atop","skin_clip":"48","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"37","skin_circle_opacity":"0.4","skin_circle_dashpattern":"24,8","skin_circle_gco":"source-over","ball_red_bg_color":"#ff0000","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c11515","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#175fd3","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#ffffff","skin_blue_circle_color":"#ffffff","color":"blue"},
        'select-PS10': {"ball_x":"144","ball_y":"624","skin_x":"0","skin_y":"480","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"51","ball_opacity":"1","ball_brightness":"100","ball_contrast":"100","ball_saturate":"0","ball_invert":false,"ball_gco":"color","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"5","ball_circle_size":"38","ball_circle_opacity":"0.6","ball_circle_dashpattern":"30,6","ball_circle_glow":false,"ball_circle_gco":"source-atop","skin_bg_size":"32","skin_bg_opacity":"0","skin_bg_drawbefore":false,"skin_size":"0","skin_opacity":"0","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"destination-over","skin_clip":"33","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"36","skin_circle_opacity":"0.4","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#c50707","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c11515","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2d8de6","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#ffffff","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS11': {"ball_x":"288","ball_y":"336","skin_x":"240","skin_y":"576","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"42","ball_opacity":"0.95","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"color","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-atop","skin_bg_size":"38","skin_bg_opacity":"1","skin_bg_drawbefore":false,"skin_size":"45","skin_opacity":"1","skin_brightness":"120","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"darken","skin_clip":"34","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ea1e0b","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2e54ea","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#116fe8","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS12': {"ball_x":"288","ball_y":"336","skin_x":"240","skin_y":"576","ball_size":"42","ball_opacity":"0.95","ball_saturate":"100","ball_invert":false,"ball_gco":"color","ball_circle_linewidth":"12","ball_circle_size":"12","ball_circle_opacity":"1","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"destination-out","skin_size":"45","skin_opacity":"1","skin_brightness":"120","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"darken","skin_clip":"36","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":false,"skin_circle_linewidth":"12","skin_circle_size":"15","skin_circle_opacity":"1","skin_circle_dashpattern":"","skin_circle_gco":"destination-out","ball_red_bg_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ea1e0b","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#178bd3","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#116fe8","skin_blue_circle_color":"#ffffff"},
        'select-PS13': {"ball_x":"144","ball_y":"384","skin_x":"144","skin_y":"528","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"29","ball_opacity":"1","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":true,"ball_gco":"hue","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"3","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"18,13","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"32","skin_bg_opacity":"0.5","skin_bg_drawbefore":false,"skin_size":"38","skin_opacity":"0.5","skin_brightness":"120","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"hard-light","skin_clip":"35","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"1","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"destination-out","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffdd00","skin_red_bg_color":"#ea1e0b","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#5076b4","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#116fe8","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS14': {"ball_x":"48","ball_y":"96","skin_x":"192","skin_y":"528","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"40","ball_opacity":"0","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"multiply","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"4","ball_circle_size":"36","ball_circle_opacity":"1","ball_circle_dashpattern":"15,20","ball_circle_glow":false,"ball_circle_gco":"overlay","skin_bg_size":"32","skin_bg_opacity":"1","skin_bg_drawbefore":false,"skin_size":"34","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"color","skin_clip":"38","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"1","skin_circle_size":"38","skin_circle_opacity":"0.5","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#d62424","ball_red_tint_color":"#b80f00","ball_red_circle_color":"#e6ff29","skin_red_bg_color":"#ce3b3b","skin_red_tint_color":"#ffffff","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#1f6cd1","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ff2424","skin_blue_bg_color":"#2776dd","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS15': {"ball_x":"96","ball_y":"480","skin_x":"288","skin_y":"432","ball_size":"50","ball_opacity":"1","ball_saturate":"0","ball_invert":false,"ball_gco":"color","ball_circle_linewidth":"5","ball_circle_size":"38","ball_circle_opacity":"0.6","ball_circle_dashpattern":"30,6","ball_circle_glow":false,"ball_circle_gco":"source-atop","skin_size":"38","skin_opacity":"1","skin_brightness":"90","skin_contrast":"200","skin_saturate":"50","skin_invert":false,"skin_gco":"screen","skin_clip":"35","skin_spin":false,"skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"36","skin_circle_opacity":"0.4","skin_circle_dashpattern":"","skin_circle_gco":"source-over","ball_red_bg_color":"#c50707","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c11515","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#5076b4","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#116fe8","skin_blue_circle_color":"#ffffff"},
        'select-PS16': {"ball_x":"288","ball_y":"384","skin_x":"240","skin_y":"528","ball_size":"50","ball_opacity":"0.85","ball_saturate":"50","ball_invert":false,"ball_gco":"color-dodge","ball_circle_linewidth":"2","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"16,13","ball_circle_glow":true,"ball_circle_gco":"source-over","skin_size":"37","skin_opacity":"0.72","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":true,"skin_gco":"color","skin_clip":"37","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.4","skin_circle_dashpattern":"24,8","skin_circle_gco":"source-over","ball_red_bg_color":"#940000","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c32828","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#5076b4","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#116fe8","skin_blue_circle_color":"#ffffff"},
        'select-PS17': {"ball_x":"240","ball_y":"0","skin_x":"336","skin_y":"384","ball_size":"69","ball_opacity":"1","ball_saturate":"100","ball_invert":false,"ball_gco":"color","ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_size":"38","skin_opacity":"1","skin_brightness":"160","skin_contrast":"120","skin_saturate":"100","skin_invert":true,"skin_gco":"hue","skin_clip":"34","skin_spin":false,"skin_spinspeed":"1","skin_shadow":false,"skin_shine":false,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ee2020","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2478ff","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#517ee6","skin_blue_circle_color":"#ffffff"},
        'select-PS18': {"ball_x":"144","ball_y":"720","skin_x":"336","skin_y":"624","ball_bg_size":"40","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"57","ball_opacity":"0.5","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"color-dodge","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"0","ball_circle_size":"35","ball_circle_opacity":"1","ball_circle_dashpattern":"20,20","ball_circle_glow":true,"ball_circle_gco":"source-over","skin_bg_size":"32","skin_bg_opacity":"1","skin_bg_drawbefore":false,"skin_size":"47","skin_opacity":"0.72","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":true,"skin_gco":"color","skin_clip":"33","skin_tint":false,"skin_spin":true,"skin_spinspeed":"-2","skin_shadow":true,"skin_shine":false,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.4","skin_circle_dashpattern":"24,8","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#940000","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#e06c00","skin_red_bg_color":"#c32828","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2478ff","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#517ee6","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS19': {"ball_x":"144","ball_y":"720","skin_x":"240","skin_y":"672","ball_bg_size":"25","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"30","ball_opacity":"1","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"source-out","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"0","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"4","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"25","skin_bg_opacity":"0","skin_bg_drawbefore":true,"skin_size":"47","skin_opacity":"0.7","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"color","skin_clip":"39","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.6","skin_circle_dashpattern":"4","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#ee3322","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2478ff","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#517ee6","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-PS20': {"ball_x":"240","ball_y":"0","skin_x":"144","skin_y":"720","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"40","ball_opacity":"1","ball_saturate":"100","ball_invert":false,"ball_tint":true,"ball_gco":"color","ball_circle_linewidth":"0","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"4","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"0","skin_bg_opacity":"1","skin_size":"77","skin_opacity":"0.75","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"destination-out","skin_clip":"39","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.6","skin_circle_dashpattern":"4","skin_circle_gco":"source-over","ball_red_bg_color":"#751d15","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#153f84","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#517ee6","skin_blue_circle_color":"#ffffff"},
        'select-PS21': {"ball_x":"0","ball_y":"192","skin_x":"432","skin_y":"48","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"53","ball_opacity":"1","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"overlay","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"31","skin_bg_opacity":"0.6","skin_bg_drawbefore":false,"skin_size":"32","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"color","skin_clip":"38","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#d62424","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#ce3b3b","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2d8de6","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#44adee","skin_blue_tint_color":"#5789ff","skin_blue_circle_color":"#ffffff"},
        'select-PS22': {"ball_x":"48","ball_y":"0","skin_x":"240","skin_y":"720","ball_red_bg_color":"#d62424","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#b22424","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#000000","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#075688","skin_blue_bg_color":"#0b70a2","skin_blue_tint_color":"#3dabff","skin_blue_circle_color":"#ffffff"},
        'select-Hex': {"ball_x":"240","ball_y":"624","skin_x":"336","skin_y":"576","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"40","ball_opacity":"1","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"color","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"32","skin_bg_opacity":"0","skin_bg_drawbefore":false,"skin_size":"42","skin_opacity":"0","skin_brightness":"100","skin_contrast":"120","skin_saturate":"100","skin_invert":true,"skin_gco":"color","skin_clip":"36","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ff6666","skin_red_bg_color":"#ea1e0b","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2e54ea","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#116fe8","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-Shiny': {"ball_x":"288","ball_y":"624","skin_x":"96","skin_y":"576","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"40","ball_opacity":"1","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":true,"ball_gco":"color","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"2","ball_circle_size":"36","ball_circle_opacity":"1","ball_circle_dashpattern":"14,16","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"38","skin_bg_opacity":"1","skin_bg_drawbefore":false,"skin_size":"49","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"hue","skin_clip":"35","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"4","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#000000","skin_red_bg_color":"#ea1e0b","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2e54ea","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#5555ff","skin_blue_bg_color":"#116fe8","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-Shades': {"ball_x":"48","ball_y":"96","skin_x":"48","skin_y":"384","ball_bg_size":"38","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"56","ball_opacity":"0","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"hue","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"6","ball_circle_size":"39","ball_circle_opacity":"0.85","ball_circle_dashpattern":"16,13","ball_circle_glow":false,"ball_circle_gco":"source-atop","skin_bg_size":"32","skin_bg_opacity":"0","skin_bg_drawbefore":false,"skin_size":"50","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"destination-in","skin_clip":"45","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.4","skin_circle_dashpattern":"24,8","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#e33131","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#ffffff","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2d8de6","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#ffffff","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-Spiral': {"ball_x":"336","ball_y":"480","skin_x":"0","skin_y":"432","ball_bg_size":"34","ball_bg_opacity":"1","ball_bg_drawbefore":false,"ball_size":"72","ball_opacity":"1","ball_brightness":"80","ball_contrast":"120","ball_saturate":"100","ball_invert":false,"ball_gco":"hue","ball_clip":"38","ball_tint":true,"ball_circle_linewidth":"2","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"16,13","ball_circle_glow":true,"ball_circle_gco":"source-over","skin_bg_size":"32","skin_bg_opacity":"0","skin_bg_drawbefore":false,"skin_size":"37","skin_opacity":"0.58","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"hard-light","skin_clip":"32","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":false,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.4","skin_circle_dashpattern":"24,8","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#940000","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c32828","skin_red_tint_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#125ed9","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#1c8fb5","skin_blue_tint_color":"#5555ff","skin_blue_circle_color":"#ffffff"},
        'select-Target': {"ball_x":"48","ball_y":"480","skin_x":"336","skin_y":"528","ball_size":"44","ball_opacity":"0.9","ball_invert":false,"ball_gco":"lighter","ball_circle_linewidth":"0","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-atop","skin_size":"46","skin_opacity":"0.95","skin_brightness":"100","skin_contrast":"100","skin_saturate":"50","skin_blur":"0","skin_invert":false,"skin_gco":"overlay","skin_clip":"34","skin_shadow":true,"skin_shine":false,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.4","skin_circle_dashpattern":"24,8","skin_circle_gco":"source-over","ball_red_bg_color":"#c50707","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#c11515","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#5076b4","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#116fe8","skin_blue_circle_color":"#ffffff"},
        'select-Glass Marble': {"ball_x":"144","ball_y":"480","skin_x":"192","skin_y":"288","ball_bg_size":"38","ball_bg_opacity":"0","ball_bg_drawbefore":false,"ball_size":"30","ball_opacity":"1","ball_saturate":"100","ball_invert":false,"ball_tint":true,"ball_gco":"hard-light","ball_circle_linewidth":"0","ball_circle_size":"38","ball_circle_opacity":"1","ball_circle_dashpattern":"4","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"10","skin_bg_opacity":"0.8","skin_size":"43","skin_opacity":"0.6","skin_brightness":"100","skin_contrast":"100","skin_saturate":"0","skin_invert":false,"skin_gco":"difference","skin_clip":"39","skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":false,"skin_circle_linewidth":"0","skin_circle_size":"38","skin_circle_opacity":"0.6","skin_circle_dashpattern":"4","skin_circle_gco":"source-over","ball_red_bg_color":"#ee3322","ball_red_tint_color":"#ee3322","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#ee3322","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#2478ff","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#43dae5","skin_blue_bg_color":"#517ee6","skin_blue_circle_color":"#ffffff"},
        'select-Bat': {"ball_x":"96","ball_y":"336","skin_x":"288","skin_y":"48","ball_bg_size":"38","ball_bg_opacity":"0.25","ball_bg_drawbefore":false,"ball_size":"38","ball_opacity":"1","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"color","ball_clip":"38","ball_tint":false,"ball_circle_linewidth":"0","ball_circle_size":"10","ball_circle_opacity":"0.8","ball_circle_dashpattern":"","ball_circle_glow":false,"ball_circle_gco":"source-over","skin_bg_size":"32","skin_bg_opacity":"1","skin_bg_drawbefore":false,"skin_size":"75","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":true,"skin_gco":"darken","skin_clip":"64","skin_tint":true,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#d62424","ball_red_tint_color":"#b80f00","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#ce3b3b","skin_red_tint_color":"#ffffff","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#125ed9","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#007ecc","skin_blue_tint_color":"#ffffff","skin_blue_circle_color":"#ffffff"},
        'select-Zombies': {"ball_red_x":"192","ball_red_y":"48","skin_red_x":"384","skin_red_y":"336","ball_blue_x":"192","ball_blue_y":"48","skin_blue_x":"432","skin_blue_y":"384","ball_bg_size":"38","ball_bg_opacity":"0.25","ball_bg_drawbefore":false,"ball_size":"40","ball_opacity":"0","ball_brightness":"100","ball_contrast":"100","ball_saturate":"100","ball_invert":false,"ball_gco":"source-atop","ball_clip":"38","ball_tint":true,"ball_circle_linewidth":"1","ball_circle_size":"38","ball_circle_opacity":"0.5","ball_circle_dashpattern":"24,4","ball_circle_glow":true,"ball_circle_gco":"source-over","skin_bg_size":"36","skin_bg_opacity":"0","skin_bg_drawbefore":true,"skin_size":"48","skin_opacity":"1","skin_brightness":"100","skin_contrast":"100","skin_saturate":"100","skin_invert":false,"skin_gco":"source-over","skin_clip":"60","skin_tint":false,"skin_spin":false,"skin_spinspeed":"1","skin_shadow":true,"skin_shine":true,"skin_circle_linewidth":"0","skin_circle_size":"0","skin_circle_opacity":"0.8","skin_circle_dashpattern":"","skin_circle_glow":false,"skin_circle_gco":"source-over","ball_red_bg_color":"#d62424","ball_red_tint_color":"#b80f00","ball_red_circle_color":"#ffffff","skin_red_bg_color":"#f2a1a1","skin_red_tint_color":"#ffffff","skin_red_circle_color":"#ffffff","ball_blue_bg_color":"#125ed9","ball_blue_tint_color":"#5555ff","ball_blue_circle_color":"#ffffff","skin_blue_bg_color":"#85bde0","skin_blue_tint_color":"#ffffff","skin_blue_circle_color":"#ffffff"},
    },
};

if (GM_getValue('globalOptions')) {
    Object.assign(defaultValues.globalOptions, GM_getValue('globalOptions'));
}

let savedOptions = Object.assign({}, defaultOptions, GM_getValue('savedOptions', {}));

let canvas_size = 64;
let canvas_center = canvas_size / 2;
let skins_image = new Image;
let drawnSkins = false;
let animatingBalls = false;

let redActualBallCanvas = createCanvas(40, 40, true);
let redActualBallCtx = redActualBallCanvas.getContext('2d');
let blueActualBallCanvas = createCanvas(40, 40, true);
let blueActualBallCtx = blueActualBallCanvas.getContext('2d');

let redSkinCanvas = createCanvas(canvas_size, canvas_size);
let redSkinCtx = redSkinCanvas.getContext('2d');
let blueSkinCanvas = createCanvas(canvas_size, canvas_size);
let blueSkinCtx = blueSkinCanvas.getContext('2d');

let redSkinTexture, blueSkinTexture;

let redShadowShineCanvas = createCanvas(canvas_size, canvas_size);
let redShadowShineCtx = redShadowShineCanvas.getContext('2d');
let blueShadowShineCanvas = createCanvas(canvas_size, canvas_size);
let blueShadowShineCtx = blueShadowShineCanvas.getContext('2d');

let redShadowShineTexture, blueShadowShineTexture;


let createNewBallTextures = function() {
    const types = ['ball', 'skin'];
    const colors = ['red', 'blue'];

    for (let type of types) {
        for (let color of colors) {
            let key_prefix = '';
            let this_size, this_center;
            let ctx;

            if (color === 'red') {
                if (type === 'ball') {
                    ctx = redActualBallCtx;
                    this_size = 40;
                } else if (type === 'skin') {
                    ctx = redSkinCtx;
                    this_size = 64;
                }
            } else if (color === 'blue') {
                if (type === 'ball') {
                    ctx = blueActualBallCtx;
                    this_size = 40;
                } else if (type === 'skin') {
                    ctx = blueSkinCtx;
                    this_size = 64;
                }
            }

            this_center = this_size / 2;

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, this_size, this_size);

            key_prefix = type + '_' + color + '_bg_';

            if (savedOptions[key_prefix + 'drawbefore']){
                if (savedOptions[key_prefix + 'size'] > 0 && savedOptions[key_prefix + 'opacity'] > 0) {
                    ctx.globalAlpha = savedOptions[key_prefix + 'opacity'];
                    ctx.fillStyle = savedOptions[key_prefix + 'color'];
                    ctx.beginPath();
                    ctx.arc(this_center, this_center, savedOptions[key_prefix + 'size'] / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalCompositeOperation = savedOptions[type + '_' + color + '_gco'];
                }
            }

            key_prefix = type + '_' + color + '_';

            ctx.globalAlpha = savedOptions[key_prefix + 'opacity'];
            ctx.filter = makeFilterString(color, type);
            ctx.drawImage(skins_image, savedOptions[key_prefix + 'x'], savedOptions[key_prefix + 'y'], 48, 48,  (this_size - savedOptions[key_prefix + 'size']) / 2, (this_size - savedOptions[key_prefix + 'size']) / 2, savedOptions[key_prefix + 'size'], savedOptions[key_prefix + 'size']);
            ctx.filter = 'none';

            if (savedOptions[key_prefix + 'tint']) {
                //ctx.globalAlpha = 1;
                tintCanvas(ctx, 0, 0, this_size, this_size, savedOptions[key_prefix + 'tint_color'], false);
            }

            key_prefix = type + '_' + color + '_bg_';

            if (!savedOptions[key_prefix + 'drawbefore']) {
                key_prefix = type + '_' + color + '_bg_';

                if (savedOptions[key_prefix + 'size'] > 0 && savedOptions[key_prefix + 'opacity'] > 0) {
                    ctx.globalCompositeOperation = savedOptions[type + '_' + color + '_gco'];
                    ctx.globalAlpha = savedOptions[key_prefix + 'opacity'];
                    ctx.fillStyle = savedOptions[key_prefix + 'color'];
                    ctx.beginPath();
                    ctx.arc(this_center, this_center, savedOptions[key_prefix + 'size'] / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            key_prefix = type + '_' + color + '_circle_';

            if (savedOptions[key_prefix + 'opacity'] > 0 && savedOptions[key_prefix + 'linewidth'] > 0 && savedOptions[key_prefix + 'size'] > 0) {
                if (savedOptions[key_prefix + 'dashpattern']) {
                    let dashpattern = adjustDashForPerfectFit(savedOptions[key_prefix + 'size'] / 2, savedOptions[key_prefix + 'dashpattern']);

                    Array.isArray(dashpattern) ? ctx.setLineDash(dashpattern) : ctx.setLineDash([dashpattern]);
                }

                ctx.globalCompositeOperation = savedOptions[key_prefix + 'gco'];
                ctx.globalAlpha = savedOptions[key_prefix + 'opacity'];
                ctx.strokeStyle = savedOptions[key_prefix + 'color'];
                ctx.lineWidth = savedOptions[key_prefix + 'linewidth'];
                if (savedOptions[key_prefix + 'glow']) {
                    ctx.filter = 'drop-shadow(0 0 2px ' + savedOptions[key_prefix + 'color'] + ') drop-shadow(0 0 1px ' + savedOptions[key_prefix + 'color'] + ')';
                }
                ctx.beginPath();
                ctx.arc(this_center, this_center, savedOptions[key_prefix + 'size'] / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.filter = 'none';
            }

            key_prefix = type + '_' + color + '_';

            if (savedOptions[key_prefix + 'clip']) {
                ctx.globalCompositeOperation = 'destination-in';
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                //ctx.filter = 'blur(1px)';
                ctx.arc(this_center, this_center, savedOptions[key_prefix + 'clip'] / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.filter = 'none';
        }
    }

    drawnSkins = false;
};

let makeFilterString = function(color, type) {
    let filter = '';

    if (savedOptions[type + '_' + color + '_brightness']) filter += ' brightness(' + savedOptions[type + '_' + color + '_brightness'] + '%)';
    if (savedOptions[type + '_' + color + '_contrast']) filter += ' contrast(' + savedOptions[type + '_' + color + '_contrast'] + '%)';
    if (savedOptions[type + '_' + color + '_saturate']) filter += ' saturate(' + savedOptions[type + '_' + color + '_saturate'] + '%)';
    if (savedOptions[type + '_' + color + '_invert']) filter += ' invert(100%)';

    if (filter) {
        return filter.trim();
    } else {
        return 'none';
    }
};

let createShadowAndShine = function() {
    redShadowShineCtx.clearRect(0, 0, canvas_size, canvas_size);
    blueShadowShineCtx.clearRect(0, 0, canvas_size, canvas_size);

    // shadow...
    let shadowCanvas = createCanvas(canvas_size, canvas_size);
    let shadowCtx = shadowCanvas.getContext('2d');

    shadowCtx.fillStyle = '#000000';
    shadowCtx.globalCompositeOperation = 'source-over';

    shadowCtx.globalAlpha = 0.8;
    shadowCtx.filter = 'blur(4px)';
    shadowCtx.beginPath();
    shadowCtx.ellipse(canvas_center, canvas_center + 16, 16, 7, 0, 0, Math.PI * 2);
    shadowCtx.fill();

    shadowCtx.globalAlpha = 0.65;
    shadowCtx.filter = 'blur(2px)';
    shadowCtx.beginPath();
    shadowCtx.ellipse(canvas_center, canvas_center + 17, 10, 5, 0, 0, Math.PI * 2);
    shadowCtx.fill();

    shadowCtx.globalCompositeOperation = 'destination-out';
    shadowCtx.globalAlpha = 1;
    shadowCtx.filter = 'blur(1px)';
    shadowCtx.beginPath();
    shadowCtx.arc(canvas_center, canvas_center, 18.5, 0, Math.PI * 2);
    shadowCtx.fill();

    if (savedOptions.skin_red_shadow) {
        redShadowShineCtx.drawImage(shadowCanvas, 0, 0);
    }
    if (savedOptions.skin_blue_shadow) {
        blueShadowShineCtx.drawImage(shadowCanvas, 0, 0);
    }


    // shine...
    let shineCanvas = createCanvas(canvas_size, canvas_size);
    let shineCtx = shineCanvas.getContext('2d');

    shineCtx.fillStyle = '#ffffff';
    shineCtx.globalCompositeOperation = 'source-over';

    shineCtx.globalAlpha = 0.8;
    shineCtx.filter = 'blur(3px)';
    shineCtx.beginPath();
    shineCtx.ellipse(canvas_center + 8, canvas_center - 10, 9, 4, Math.PI / 4, 0, Math.PI * 2);
    shineCtx.fill();

    shineCtx.globalAlpha = 0.6;
    shineCtx.filter = 'blur(2px)';
    shineCtx.beginPath();
    shineCtx.arc(canvas_center + 8, canvas_center - 10, 5, 0, Math.PI * 2);
    shineCtx.fill();

    shineCtx.globalAlpha = 0.85;
    shineCtx.filter = 'blur(1px)';
    shineCtx.beginPath();
    shineCtx.arc(canvas_center + 9, canvas_center - 11, 3, 0, Math.PI * 2);
    shineCtx.fill();

    shineCtx.globalCompositeOperation = 'destination-in';
    shineCtx.globalAlpha = 1;
    shineCtx.filter = 'blur(1px)';
    shineCtx.beginPath();
    shineCtx.arc(canvas_center, canvas_center, 19, 0, Math.PI * 2);
    shineCtx.fill();

    if (savedOptions.skin_red_shine) {
        redShadowShineCtx.drawImage(shineCanvas, 0, 0);
    }
    if (savedOptions.skin_blue_shine) {
        blueShadowShineCtx.drawImage(shineCanvas, 0, 0);
    }
};



let redPreviewBallCanvas, redPreviewBallCtx;
let bluePreviewBallCanvas, bluePreviewBallCtx;
let redPreviewSkinCanvas, redPreviewSkinCtx;
let bluePreviewSkinCanvas, bluePreviewSkinCtx;
let rotateAngleRed = GM_getValue('rotateAngleRed', -6);
let rotateAngleBlue = GM_getValue('rotateAngleBlue', -6);

let animateBalls = function() {
    // red...
    if (rotateAngleRed !== 0 || !drawnSkins) {
        if (animatingBalls) {
            redPreviewBallCtx.translate(canvas_center, canvas_center);
            redPreviewBallCtx.rotate(Math.PI / (40 + rotateAngleRed));
            redPreviewBallCtx.translate(-canvas_center, -canvas_center);
        }

        redPreviewBallCtx.clearRect(0, 0, canvas_size, canvas_size);
        redPreviewBallCtx.drawImage(redActualBallCanvas, 0, 0, 40, 40, 12, 12, 40, 40);

        if (savedOptions.skin_red_spin) {
            redPreviewBallCtx.drawImage(redSkinCanvas, 0, 0);
        }
    }


    // blue...
    if (rotateAngleBlue !== 0 || !drawnSkins) {
        if (animatingBalls) {
            bluePreviewBallCtx.translate(canvas_center, canvas_center);
            bluePreviewBallCtx.rotate(Math.PI / (40 + rotateAngleBlue));
            bluePreviewBallCtx.translate(-canvas_center, -canvas_center);
        }

        bluePreviewBallCtx.clearRect(0, 0, canvas_size, canvas_size);
        bluePreviewBallCtx.drawImage(blueActualBallCanvas, 0, 0, 40, 40, 12, 12, 40, 40);

        if (savedOptions.skin_blue_spin) {
            bluePreviewBallCtx.drawImage(blueSkinCanvas, 0, 0);
        }
    }


    if (!drawnSkins) {
        redPreviewSkinCtx.clearRect(0, 0, canvas_size, canvas_size);
        if (!savedOptions.skin_red_spin) {
            redPreviewSkinCtx.drawImage(redSkinCanvas, 0, 0);
        }

        bluePreviewSkinCtx.clearRect(0, 0, canvas_size, canvas_size);
        if (!savedOptions.skin_blue_spin) {
            bluePreviewSkinCtx.drawImage(blueSkinCanvas, 0, 0);
        }

        if (savedOptions.skin_red_shadow || savedOptions.skin_red_shine) {
            redPreviewSkinCtx.drawImage(redShadowShineCanvas, 0, 0);
        }

        if (savedOptions.skin_blue_shadow || savedOptions.skin_blue_shine) {
            bluePreviewSkinCtx.drawImage(blueShadowShineCanvas, 0, 0);
        }

        drawnSkins = true;
    }

    if (rotateAngleRed !== 0 || rotateAngleBlue !== 0) {
        window.requestAnimationFrame(animateBalls);
        animatingBalls = true;

    } else {
        animatingBalls = false;
    }
};

let loadSelectIntoMenu = function(label, title, name, saveto, update) {
    let string = '';

    if (defaultValues.hasOwnProperty(saveto)) {
        string += '<select id="BS_Select_' + update + '" data-saveto="' + saveto + '" data-update="' + update + '" class="BS_Input" style="min-width:100px; max-width:140px;">';

        Object.keys(defaultValues[saveto]).forEach(key => {
            string += '<option value="' + key + '" data-saveto="' + saveto + '" data-savevalue="' + key + '" data-update="' + update + '" title="' + key.slice(7) + '">' + key.slice(7) + '</option>';
        });

        string += '</select>';
    }

    return string;
};

let loadGcoOptionsIntoMenu = function(saveto) {
    return '<select class="BS_Input" data-saveto="' + saveto + '" style="max-width:120px;"><option value="source-over">Source-Over</option><option value="source-atop">Source-Atop</option><option value="source-in">Source-In</option><option value="source-out">Source-Out</option><option value="destination-over">Destination-Over</option><option value="destination-in">Destination-In</option><option value="destination-out">Destination-Out</option><option value="destination-atop">Destination-Atop</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="hard-light">Hard Light</option><option value="soft-light">Soft Light</option><option value="lighter">Lighter</option><option value="lighten">Lighten</option><option value="darken">Darken</option><option value="color-dodge">Color Burn</option><option value="color-burn">Color Dodge</option><option value="overlay">Overlay</option><option value="difference">Difference</option><option value="exclusion">Exclusion</option><option value="hue">Hue</option><option value="saturation">Saturation</option><option value="color">Color</option><option value="luminosity">Luminosity</option><option value="xor">Xor</option></select>';
};

let createMenu = function() {
    GM_addStyle('#BS_Container { width:540px; margin:10px; padding:10px; font-size:11px; background:linear-gradient(to right, #3f2121, #0a0a0a, #1e2741); border:1px solid #121212; border-radius:6px; }');
    GM_addStyle('#BS_Container label { margin: 2px 0; }');
    GM_addStyle('#BS_Container button { color:black; font-size:11px; }');
    GM_addStyle('.BS_Input { color:black; font-size:11px; margin:1px 3px 1px 1px !important; }');
    GM_addStyle('.BS_Input[type=number] { height:18px; width:50px; font-size:11px; }');
    GM_addStyle('.BS_Input[type=text] { height:18px; font-size:11px; }')
    GM_addStyle('.BS_Input[type=color] { height:20px; border:0px; padding:0px; }');
    GM_addStyle('.BS_Preview_Container { padding:0 0 1px 0; border:1px outset #999; border-radius:8px; text-shadow:1px 1px 1px black; user-select:none; }');
    GM_addStyle('.BS_Section { margin:10px 0; background:#1a1a1a; border:1px outset #999; border-radius:8px; }');
    GM_addStyle('.BS_Inner_Container { position:relative; margin:0 3px; }');
    GM_addStyle('.BS_Heading_Red { margin:2px 5px 0; padding:3px 0 1px 0; font-size:12px; font-weight:bold; color:#db6d6d; border-top:1px dashed #777; }');
    GM_addStyle('.BS_Heading_Blue { margin:2px 5px 0; padding:3px 0 1px 0; font-size:12px; font-weight:bold; color:#639ce3; border-top:1px dashed #777; }');
    GM_addStyle('.BS_Preset { margin:5px 0 15px 0; font-size:12px; }');
    GM_addStyle('.BS_Preview_Overlay_Container { position:relative; display:flex; flex-flow:row wrap; justify-content:center; align-items:center; }');
    GM_addStyle('#BS_BallSkinChooser_Container { position:absolute; display:none; padding:10px 30px; width:630px; height:300px; top:-100px; left:260px; font-size:13px; text-align:center; color:black; background:#333; border:2px outset #aaa; border-radius:6px; box-shadow:0px 0px 25px 10px black;  z-index:999; }');
    GM_addStyle('#BS_BallSkinChooser_Inner { height:280px; overflow-x:hidden; overflow-y:scroll; }');
    GM_addStyle('#BS_BallSkinChooser_Close { position:absolute; width:17px; height:17px; top:3px; right:2px; padding:0 0 0 1px; color:red; border:1px solid darkred; font-size:12px; font-weight:bold; border-radius:10px; cursor:pointer; }');
    GM_addStyle('#BS_ShowAllOptions { position:absolute; width:17px; height:17px; top:3px; right:2px; color:#9e9; background:rgba(0,0,0,0.5); font-size:12px; border-radius:50%; cursor:pointer; }');
    GM_addStyle('#BS_ChangeBackgroundColor { position:absolute; width:17px; height:14px; top:23px; right:2px; border:0px; padding:0px; border-radius:8px; opacity:0.6; cursor:pointer; }');
    GM_addStyle('.BS_Skin { display:inline-block; margin:1px; width:48px; height:48px; }');
    GM_addStyle('.BS_Selected { outline:1px solid chartreuse; border-radius:50%; }');
    GM_addStyle('#BS_BallSkinChooser_Inner::-webkit-scrollbar { width:4px; }');
    GM_addStyle('#BS_BallSkinChooser_Inner::-webkit-scrollbar-thumb { background:#292; border-radius:4px; }');
    GM_addStyle('#BS_BallSkinChooser_Inner::-webkit-scrollbar-track { background:#ddd; border-radius:4px; }');
    GM_addStyle('.BS_BallSkinPreview { display:inline-block; width:50px; height:50px; transform:scale(0.8); border:1px outset #666; border-radius:7px; background-color:#333; background-image:url(' + defaultValues.texture_ballskins + '); background-position:48px 48px; cursor:pointer; }');
    GM_addStyle('.BS_FlexBreak { flex-basis:100%; height:0; }');

    const colors = ['Red', 'Blue'];

    let menu = '';

    for (let Color of colors) {
        const color = Color.toLowerCase();

        menu +=
            '  <div id="BS_Options_' + Color + '_Container" class="BS_Inner_Container">' +
            '    <div class="BS_Preview_Container">' +
            '      <div id="BS_Preview_' + Color + '_Ball" style="width:251px; height:64px;"></div>' +
            '      <div class="BS_Preset" style="width:251px;">' +
            '        <span>' + Color + ' Preset: </span>' + loadSelectIntoMenu('Presets', 'Choose a preset', 'preset', 'presets', 'presets_' + color) +
            '      </div>' +
            '    </div>' +
            '    <div class="BS_Section">' +
            '    <div class="BS_Heading_' + Color + '" style="border:none;">Ball Background</div>' +
            '    <div>' +
            '      <input type="color" class="BS_Input" data-saveto="ball_' + color + '_bg_color">' +
            '      <label>Size:<input type="number" min="0" class="BS_Input" data-saveto="ball_' + color + '_bg_size"></label>' +
            '      <label>Opacity:<input type="number" min="0" max="1" step="0.01" class="BS_Input" data-saveto="ball_' + color + '_bg_opacity"></label>' +
            '      <label><input type="checkbox" class="BS_Input" data-saveto="ball_' + color + '_bg_drawbefore" title="Draw Background Before Overlay"></label>' +
            '    </div>' +
            '    <div class="BS_Heading_' + Color + '">Ball Overlay</div>' +
            '    <div class="BS_Preview_Overlay_Container">' +
            '      <span class="BS_BallSkinPreview" data-color="' + color + '" data-type="ball"></span>' +
            '      <label>Size:<input type="number" min="0" class="BS_Input" data-saveto="ball_' + color + '_size"></label>' +
            '      <label>Opacity:<input type="number" min="0" max="1" step="0.01" class="BS_Input" data-saveto="ball_' + color + '_opacity"></label>' +
            '      <label>Brightness:<input type="number" min="0" class="BS_Input" data-saveto="ball_' + color + '_brightness"></label>' +
            '      <label>Contrast:<input type="number" min="0" class="BS_Input" data-saveto="ball_' + color + '_contrast"></label>' +
            '      <label>Saturation:<input type="number" min="0" class="BS_Input" data-saveto="ball_' + color + '_saturate"></label>' +
            '      <label>Invert:<input type="checkbox" class="BS_Input" data-saveto="ball_' + color + '_invert"></label>' +
            '      <label>Mode:' + loadGcoOptionsIntoMenu('ball_' + color + '_gco') + '</label>' +
            '      <label>Clip:<input type="number" min="0" max="40" class="BS_Input" data-saveto="ball_' + color + '_clip"></label>' +
            '      <label>Tint:<input type="checkbox" class="BS_Input" data-saveto="ball_' + color + '_tint"></label>' +
            '      <input type="color" class="BS_Input" data-saveto="ball_' + color + '_tint_color">' +
            '    </div>' +
            '    <div class="BS_Heading_' + Color + '">Ball Circle</div>' +
            '    <div>' +
            '      <input type="color" class="BS_Input" data-saveto="ball_' + color + '_circle_color">' +
            '      <label>LineWidth:<input type="number" min="0" class="BS_Input" data-saveto="ball_' + color + '_circle_linewidth"></label>' +
            '      <label>Pos:<input type="number" min="0" class="BS_Input" data-saveto="ball_' + color + '_circle_size"></label>' +
            '      <label>Opacity:<input type="number" min="0" max="1" step="0.01" class="BS_Input" data-saveto="ball_' + color + '_circle_opacity"></label>' +
            '      <label>Dash:<input type="text" class="BS_Input" data-saveto="ball_' + color + '_circle_dashpattern" title="Dash Pattern [Length, Space, ...] (empty for solid)" style="max-width:50px;"></label>' +
            '      <label>Glow:<input type="checkbox" class="BS_Input" data-saveto="ball_' + color + '_circle_glow"></label>' +
            '      <label>Mode:' + loadGcoOptionsIntoMenu('ball_' + color + '_circle_gco') + '</label>' +
            '    </div>' +
            '    </div>' +
            '    <div class="BS_Section">' +
            '    <div class="BS_Heading_' + Color + '" style="border:none;">Skin Background</div>' +
            '    <div>' +
            '      <input type="color" class="BS_Input" data-saveto="skin_' + color + '_bg_color">' +
            '      <label>Size:<input type="number" min="0" class="BS_Input" data-saveto="skin_' + color + '_bg_size"></label>' +
            '      <label>Opacity:<input type="number" min="0" max="1" step="0.01" class="BS_Input" data-saveto="skin_' + color + '_bg_opacity"></label>' +
            '      <label><input type="checkbox" class="BS_Input" data-saveto="skin_' + color + '_bg_drawbefore" title="Draw Background Before Overlay"></label>' +
            '    </div>' +
            '    <div class="BS_Heading_' + Color + '">Skin Overlay</div>' +
            '    <div class="BS_Preview_Overlay_Container">' +
            '      <span class="BS_BallSkinPreview" data-color="' + color + '" data-type="skin"></span>' +
            '      <label>Size:<input type="number" min="0" class="BS_Input" data-saveto="skin_' + color + '_size"></label>' +
            '      <label>Opacity:<input type="number" min="0" max="1" step="0.01" class="BS_Input" data-saveto="skin_' + color + '_opacity"></label>' +
            '      <label>Brightness:<input type="number" min="0" class="BS_Input" data-saveto="skin_' + color + '_brightness"></label>' +
            '      <label>Contrast:<input type="number" min="0" class="BS_Input" data-saveto="skin_' + color + '_contrast"></label>' +
            '      <label>Saturation:<input type="number" min="0" class="BS_Input" data-saveto="skin_' + color + '_saturate"></label>' +
            '      <label>Invert:<input type="checkbox" class="BS_Input" data-saveto="skin_' + color + '_invert"></label>' +
            '      <label>Mode:' + loadGcoOptionsIntoMenu('skin_' + color + '_gco') + '</label>' +
            '      <label>Clip:<input type="number" min="0" max="64" class="BS_Input" data-saveto="skin_' + color + '_clip"></label>' +
            '      <label>Tint:<input type="checkbox" class="BS_Input" data-saveto="skin_' + color + '_tint"></label>' +
            '      <input type="color" class="BS_Input" data-saveto="skin_' + color + '_tint_color">' +
            '      <div class="BS_FlexBreak"></div>' +
            '      <label>Spin:<input type="checkbox" class="BS_Input" data-saveto="skin_' + color + '_spin"></label>' +
            '      <label>Spin Speed:<input type="number" min="-10" max="10" step="0.25" class="BS_Input" data-saveto="skin_' + color + '_spinspeed"></label>' +
            '      <div class="BS_FlexBreak"></div>' +
            '      <label>Shadow:<input type="checkbox" class="BS_Input" data-saveto="skin_' + color + '_shadow"></label>' +
            '      <label>Shine:<input type="checkbox" class="BS_Input" data-saveto="skin_' + color + '_shine"></label>' +
            '    </div>' +
            '    <div class="BS_Heading_' + Color + '">Skin Circle</div>' +
            '    <div>' +
            '      <input type="color" class="BS_Input" data-saveto="skin_' + color + '_circle_color">' +
            '      <label>LineWidth:<input type="number" min="0" class="BS_Input" data-saveto="skin_' + color + '_circle_linewidth"></label>' +
            '      <label>Pos:<input type="number" min="0" class="BS_Input" data-saveto="skin_' + color + '_circle_size"></label>' +
            '      <label>Opacity:<input type="number" min="0" max="1" step="0.01" class="BS_Input" data-saveto="skin_' + color + '_circle_opacity"></label>' +
            '      <label>Dash:<input type="text" class="BS_Input" data-saveto="skin_' + color + '_circle_dashpattern" title="Dash Pattern [Length, Space, ...] (empty for solid)" style="max-width:50px;"></label>' +
            '      <label>Glow:<input type="checkbox" class="BS_Input" data-saveto="skin_' + color + '_circle_glow"></label>' +
            '      <label>Mode:' + loadGcoOptionsIntoMenu('skin_' + color + '_circle_gco') + '</label>' +
            '    </div>' +
            '    </div>' +
            '  </div>';
    }

    $('#play-now').after('<div id="BS_Container">' +
                         '  <div style="display:flex; justify-content:center;">' +
                         menu +
                         '  </div>' +
                         '  <div id="BS_BallSkinChooser_Container"><div id="BS_BallSkinChooser_Inner"></div><span id="BS_BallSkinChooser_Close" title="Close">X</span></div>' +
                         '</div>');

    $('#BS_Options_Red_Container').append('<div>' +
                                          '  <button class="BS_Export_JSON" data-color="Red">Export</button>' +
                                          '  <button class="BS_Copy" data-color="Red" title="Copies All Values to Blue (Except Colors)">Copy &gt;&gt;</button>' +
                                          '</div>');
    $('#BS_Options_Blue_Container').append('<div>' +
                                           '  <button class="BS_Copy" data-color="Blue" title="Copies All Values to Red (Except Colors)">&lt;&lt; Copy</button>' +
                                           '  <button class="BS_Export_JSON" data-color="Blue">Export</button>' +
                                           '</div>');

    $('#BS_Options_Blue_Container .BS_Preview_Container').append('<div id="BS_ShowAllOptions" title="Show/Hide All Options">⁞</div>');
    $('#BS_Options_Blue_Container .BS_Preview_Container').append('<div><input id="BS_ChangeBackgroundColor" type="color" value="' + GM_getValue('PreviewBackgroundColor', '#1a1a1a') + '" title="Change Background Color [Default: #1a1a1a]" /></div>');


    $('#BS_Select_presets_red').val(savedOptions.presets_red);
    $('#BS_Select_presets_blue').val(savedOptions.presets_blue);
    $('.BS_Preview_Container').css('background', GM_getValue('PreviewBackgroundColor', '#1a1a1a'));

    redPreviewBallCanvas = createCanvas(canvas_size, canvas_size, true);
    $(redPreviewBallCanvas).attr('id', 'BS_RedPreviewBallCanvas').addClass('BS_RedPreviewBallCanvas').css({'position':'absolute', 'margin':'0 0 0 -24px' }); // 'margin':'12px 0 0 -12px'
    redPreviewBallCtx = redPreviewBallCanvas.getContext('2d');

    redPreviewSkinCanvas = createCanvas(canvas_size, canvas_size, true);
    $(redPreviewSkinCanvas).attr('id', 'BS_RedPreviewSkinCanvas').addClass('BS_RedPreviewSkinCanvas').css({'position':'absolute', 'margin':'0 0 0 -24px' });
    redPreviewSkinCtx = redPreviewSkinCanvas.getContext('2d');

    bluePreviewBallCanvas = createCanvas(canvas_size, canvas_size, true);
    $(bluePreviewBallCanvas).attr('id', 'BS_BluePreviewBallCanvas').addClass('BS_BluePreviewBallCanvas').css({'position':'absolute', 'margin':'0 0 0 -24px' });
    bluePreviewBallCtx = bluePreviewBallCanvas.getContext('2d');

    bluePreviewSkinCanvas = createCanvas(canvas_size, canvas_size, true);
    $(bluePreviewSkinCanvas).attr('id', 'BS_BluePreviewSkinCanvas').addClass('BS_BluePreviewSkinCanvas').css({'position':'absolute', 'margin':'0 0 0 -24px' });
    bluePreviewSkinCtx = bluePreviewSkinCanvas.getContext('2d');

    $('#BS_Preview_Red_Ball').prepend(redPreviewBallCanvas, redPreviewSkinCanvas);
    $('#BS_Preview_Blue_Ball').prepend(bluePreviewBallCanvas, bluePreviewSkinCanvas);
};


let addMenuListeners = function() {
    $('#BS_RedPreviewSkinCanvas').on('click', function() {
        rotateAngleRed -= 5;

        if (rotateAngleRed <= -10) {
            rotateAngleRed = 0;
        }

        GM_setValue('rotateAngleRed', rotateAngleRed);

        if (!animatingBalls) {
            window.requestAnimationFrame(animateBalls);
        }
    });

    $('#BS_BluePreviewSkinCanvas').on('click', function() {
        rotateAngleBlue -= 5;

        if (rotateAngleBlue <= -10) {
            rotateAngleBlue = 0;
        }

        GM_setValue('rotateAngleBlue', rotateAngleBlue);

        if (!animatingBalls) {
            window.requestAnimationFrame(animateBalls);
        }
    });

    document.querySelector('#BS_Container').addEventListener('change', function(input) {
        let target = input.target;

        if (target.type === 'color') {
            if (target.id === 'BS_ChangeBackgroundColor') {
                $('.BS_Preview_Container').css('background', target.value);
                GM_setValue('PreviewBackgroundColor', target.value);
            } else {
                GM_setValue('savedOptions', savedOptions);
            }
        }
    });

    if (!defaultValues.globalOptions.show_all_options) {
        $('#BS_Options_Red_Container').find('div').not('.BS_Preview_Container, #BS_Preview_Red_Ball, .BS_Preset').hide();
        $('#BS_Options_Blue_Container').find('div').not('.BS_Preview_Container, #BS_Preview_Blue_Ball, .BS_Preset, #BS_ShowAllOptions').hide();
    }

    $('#BS_ShowAllOptions').on('click', function() {
        defaultValues.globalOptions.show_all_options = !defaultValues.globalOptions.show_all_options;
        GM_setValue('globalOptions', defaultValues.globalOptions);

        $('#BS_Options_Red_Container').find('div').not('.BS_Preview_Container, #BS_Preview_Red_Ball, .BS_Preset').fadeToggle();
        $('#BS_Options_Blue_Container').find('div').not('.BS_Preview_Container, #BS_Preview_Blue_Ball, .BS_Preset, #BS_ShowAllOptions').fadeToggle();
    });



    document.querySelector('#BS_Container').addEventListener('input', function(input) {
        let target = input.target;

        if (!target.className.includes('BS_Input')) {
            return;
        }

        if (target.type === 'checkbox') {
            savedOptions[target.dataset.saveto] = target.checked;

        } else if (target.type === 'radio') {
            if (target.dataset.savevalue) {
                savedOptions[target.dataset.saveto] = target.dataset.savevalue;
            } else {
                const radioButtons = document.getElementsByName(target.name);
                radioButtons.forEach(function(button) {
                    if (button.checked) savedOptions[button.dataset.saveto] = true;
                    else savedOptions[button.dataset.saveto] = false;
                });
            }

        } else {
            if (target.type === 'select-one' && target.dataset.saveto === 'presets') {
                //target = target.options[target.selectedIndex];
                savedOptions[target.dataset.update] = target.value;
            } else {
                savedOptions[target.dataset.saveto] = target.value;
            }
        }

        if (target.dataset.update && target.dataset.update.startsWith('presets_')) {
            changePreset(target.value, target.dataset.update);
        }

        createNewBallTextures();
        createShadowAndShine();

        if (!animatingBalls) {
            animateBalls();
        }

        if (target.type !== 'color') {
            GM_setValue('savedOptions', savedOptions);
        }
    });

    $('.BS_Export_JSON').on('click', function() {
        let xOptions = convertInputsToJSON(this.dataset.color);

        let name = xOptions.preset;
        delete xOptions.preset;
        let sOptions = JSON.stringify(xOptions);

        console.log('\'' + this.dataset.color + '\': ' + sOptions);
        GM_setClipboard('\'select-xxx\': ' + sOptions + ',', 'text');
    });

    $('.BS_Copy').on('click', function() {
        let color = this.dataset.color;
        let color_lower = color === 'Red' ? '_red_' : '_blue_';
        let opposite_lower = color === 'Red' ? '_blue_' : '_red_';

        for (let key in savedOptions) {
            if (!key.includes('color') && key.includes(color_lower)) {
                let opposite_key = key.replace(color_lower, opposite_lower);
                savedOptions[opposite_key] = savedOptions[key];
            }
        }

        loadOptions();
        createNewBallTextures();
        createShadowAndShine();

        GM_setValue('savedOptions', savedOptions);
    });

    $('.BS_BallSkinPreview').on('click', function() {
        if ($('#BS_BallSkinChooser_Container').is(':visible') && $('#BS_BallSkinChooser_Inner').attr('data-color') === this.dataset.color && $('#BS_BallSkinChooser_Inner').attr('data-type') === this.dataset.type) {
            $('#BS_BallSkinChooser_Container').fadeOut(100);
        } else {
            showBallSkinChooser(this.dataset.color, this.dataset.type);
        }
    });

    $('.BS_Preview_Container').on('click', function() {

    });
};

let loadOptions = function(color) {
    for (let key in savedOptions) {

        if (color) {
            if (!key.includes('_' + color + '_')) {
                continue;
            }
        }

        if (savedOptions[key] === true || savedOptions[key] === false) { //checkbox
            $('input.BS_Input[data-saveto="' + key + '"]').prop('checked', savedOptions[key]);
        } else {
            const value = savedOptions[key].toString();

            if (value.startsWith('value-')) { //radio
                $('input.BS_Input[data-saveto="' + key + '"][data-savevalue="' + savedOptions[key] + '"]').prop('checked', true);
            } else if (value.startsWith('select-')) { //select
                $('#BS_Select_' + key).val(savedOptions[key]);
            } else if (!value.startsWith('#') || !color || color === 'red' && key.includes('_red_') || color === 'blue' && key.includes('_blue_')) { //other or color*   || key.includes('_blue_')
                $('.BS_Input[data-saveto="' + key + '"]').val(savedOptions[key]);
            }
        }
    }

    if (!color || (color === 'red')) {
        $('#BS_Container').find('.BS_BallSkinPreview[data-color="red"][data-type="ball"]').css('background-position', -savedOptions['ball_red_x'] + 'px ' + -savedOptions['ball_red_y'] + 'px');
        $('#BS_Container').find('.BS_BallSkinPreview[data-color="red"][data-type="skin"]').css('background-position', -savedOptions['skin_red_x'] + 'px ' + -savedOptions['skin_red_y'] + 'px');
    }
    if (!color || (color === 'blue')) {
        $('#BS_Container').find('.BS_BallSkinPreview[data-color="blue"][data-type="ball"]').css('background-position', -savedOptions['ball_blue_x'] + 'px ' + -savedOptions['ball_blue_y'] + 'px');
        $('#BS_Container').find('.BS_BallSkinPreview[data-color="blue"][data-type="skin"]').css('background-position', -savedOptions['skin_blue_x'] + 'px ' + -savedOptions['skin_blue_y'] + 'px');
    }

    drawnSkins = false;

    if (!animatingBalls) {
        window.requestAnimationFrame(animateBalls);
    }
};

let changePreset = function(presetKey, update) {
    if (!defaultValues.presets.hasOwnProperty(presetKey)) {
        console.log('BS:: changePreset() preset does not exist:', presetKey, update);
        return;
    }

    let preset = defaultValues.presets[presetKey];
    let color = update.replace('presets_', '');

    if (preset !== 'select-none') {
        let xOptions = {};

        for (let key in defaultOptions) {
            if (key.includes('_' + color + '_')) {
                console.log('BS:: changePreset() COPYING FROM DEFAULTOPTIONS: ', key, defaultOptions[key], color);
                xOptions[key] = defaultOptions[key];
            }
        }

        for (let key in preset) {
            let value = preset[key].toString();

            if (key === 'color') {
                continue;
            }

            if (value.startsWith('#')) {
                if (key.includes('_' + color + '_')) {
                    xOptions[key] = preset[key];
                }

            } else if (key.includes('_' + color + '_')) {
                xOptions[key] = preset[key];

            } else {
                let newKey = key.replace('ball_', 'ball_' + color + '_').replace('skin_', 'skin_' + color + '_');

                xOptions[newKey] = preset[key];
            }
        }

        savedOptions = Object.assign(savedOptions, xOptions);
        GM_setValue('savedOptions', savedOptions);
        loadOptions(color);

        createNewBallTextures();
        createShadowAndShine();
    }
};

let convertInputsToJSON = function(color) {
    let xOptions = {};
    let color_lower = color.toLowerCase();

    // overlay positions...
    xOptions['ball_red_x'] = savedOptions['ball_red_x'];
    xOptions['ball_red_y'] = savedOptions['ball_red_y'];
    xOptions['skin_red_x'] = savedOptions['skin_red_x'];
    xOptions['skin_red_y'] = savedOptions['skin_red_y'];
    xOptions['ball_blue_x'] = savedOptions['ball_blue_x'];
    xOptions['ball_blue_y'] = savedOptions['ball_blue_y'];
    xOptions['skin_blue_x'] = savedOptions['skin_blue_x'];
    xOptions['skin_blue_y'] = savedOptions['skin_blue_y'];

    $('#BS_Options_' + color + '_Container').find('.BS_Input').each(function(index, element) {
        if (element.dataset.saveto === undefined) {
            console.warn('Ball Enhancer - WARNING! undefined saveto for Export:', element);
            return;
        }
        if (!defaultOptions.hasOwnProperty(element.dataset.saveto)) {
            console.warn('Ball Enhancer - WARNING! No default value for Export:', element.dataset.saveto);
            return;
        }

        if (element.type === 'checkbox') {
            xOptions[element.dataset.saveto.replace('_red', '').replace('_blue', '')] = element.checked;

        } else if (element.type === 'radio') {
            if (element.checked === true) xOptions[element.dataset.saveto.replace('_red', '').replace('_blue', '')] = element.dataset.savevalue;

        } else if (element.type === 'color') {
            // done seperately below

        } else {
            xOptions[element.dataset.saveto.replace('_red', '').replace('_blue', '')] = element.value;
        }
    });

    // colors...
    $('#BS_Container').find('.BS_Input[type="color"]').each(function(index, element) {
        xOptions[element.dataset.saveto] = element.value;
    });

    return xOptions;
};

let createBallSkinChooser = function() {
    const width = Math.floor(skins_image.width);
    const height = Math.floor(skins_image.height);

    let skinsCanvas = createCanvas(width, height, true);
    let skinsCtx = skinsCanvas.getContext('2d', { willReadFrequently: true });

    skinsCtx.drawImage(skins_image, 0, 0);

    for (let y = 0; y < height; y += 48) {
        for (let x = 0; x < width; x += 48) {
            let pixelData = skinsCtx.getImageData(x + 10, y + 10, 35, 35).data;
            let isPixelDataTransparent = isTransparent(pixelData);

            if (!isPixelDataTransparent) {
                $('#BS_BallSkinChooser_Inner').append('<span class="BS_Skin" data-x="' + x + '" data-y="' + y + '" style="background-image:url(' + defaultValues.texture_ballskins + '); background-position:-' + x + 'px -' + y + 'px;" title="Ball"></span>');
            }
        }
    }

    skinsCanvas = null;

    $('.BS_Skin').on('click', function() {
        const color = $('#BS_BallSkinChooser_Inner').attr('data-color');
        const type = $('#BS_BallSkinChooser_Inner').attr('data-type');

        if (savedOptions[type + '_' + color + '_x'] === this.dataset.x && savedOptions[type + '_' + color + '_y'] === this.dataset.y) {
            savedOptions[type + '_' + color + '_x'] = '-1';
            savedOptions[type + '_' + color + '_y'] = '-1';
        } else {
            savedOptions[type + '_' + color + '_x'] = this.dataset.x;
            savedOptions[type + '_' + color + '_y'] = this.dataset.y;
        }

        GM_setValue('savedOptions', savedOptions);

        $('#BS_BallSkinChooser_Inner .BS_Selected').removeClass('BS_Selected');
        $('#BS_BallSkinChooser_Inner').find('span[data-x="' + savedOptions[type + '_' + color + '_x'] + '"][data-y="' + savedOptions[type + '_' + color + '_y'] + '"]').addClass('BS_Selected');

        $('#BS_Container').find('.BS_BallSkinPreview[data-color="' + color + '"][data-type="' + type + '"]').css('background-position', -savedOptions[type + '_' + color + '_x'] + 'px ' + -savedOptions[type + '_' + color + '_y'] + 'px');

        createNewBallTextures();

        if (!animatingBalls) {
            animateBalls();
        }
    });

    $('#BS_BallSkinChooser_Close').on('click', function() {
        $('#BS_BallSkinChooser_Container').fadeOut(50);
    });
};

let showBallSkinChooser = function(color, type) {
    $('#BS_BallSkinChooser_Inner').attr('data-color', color).attr('data-type', type);

    $('#BS_BallSkinChooser_Inner .BS_Selected').removeClass('BS_Selected');
    $('#BS_BallSkinChooser_Inner').find('span[data-x="' + savedOptions[type + '_' + color + '_x'] + '"][data-y="' + savedOptions[type + '_' + color + '_y'] + '"]').addClass('BS_Selected');

    $('#BS_BallSkinChooser_Container').fadeOut(100, function() {
        $('#BS_Container').find('.BS_BallSkinPreview[data-color="' + color + '"][data-type="' + type + '"]').parent().append( $('#BS_BallSkinChooser_Container') );
        $('#BS_BallSkinChooser_Container').fadeIn(200);
    });
};

let isTransparent = function(data) {
    let length = data.length;
    let i = -4;

    while ((i += 4) < length) {
        if (data[i + 3]) return false; //found an opaque pixel in the alpha channel
    }

    return true; //all pixels were transparent
};

let adjustDashForPerfectFit = function(radius, dashpattern) {
    if (dashpattern.includes(',')) { //change first segment size (e.g. 4,5 -> 4.424,5) to fit (radius unchanged)
        let segments = dashpattern.split(',');

        if (segments.length % 2 !== 0) segments = segments.concat(segments);

        let sum = segments.reduce((a, b) => a + Number(b), 0);
        let a = radius * Math.PI * 2;
        let b = Math.round(a / sum);

        segments[0] = a / b - segments[1];

        return segments;

    } else if (dashpattern > 0) { //takes # segments and returns value for equal dash pattern (radius unchanged)
        return radius * Math.PI / dashpattern; //dashpattern is # segments

    } else {
        return 0;
    }
};

let addBallSkin = function(player) {
    let shadowIndexPosition;

    player.sprites.ballskin = new PIXI.Sprite(player.team === 1 ? redSkinTexture : blueSkinTexture);
    player.sprites.ballskin.anchor.set(0.5, 0.5);

    if (player.team === 1 && savedOptions.skin_red_spin && +savedOptions.skin_red_spinspeed !== 0 || player.team === 2 && savedOptions.skin_blue_spin && +savedOptions.skin_blue_spinspeed !== 0) {
        player.sprites.ballskin.position.set(0, 0);
        player.sprites.ballskin.spinspeed = player.team === 1 ? +savedOptions.skin_red_spinspeed - 1 : +savedOptions.skin_blue_spinspeed - 1;

        player.sprites.actualBall.pivot.set(0, 0);
        player.sprites.actualBall.anchor.set(0.5, 0.5);

        player.sprites.actualBall.addChild(player.sprites.ballskin);
        shadowIndexPosition = 1;

    } else {
        player.sprites.ballskin.position.set(20, 20);

        player.sprites.ball.addChildAt(player.sprites.ballskin, 1);
        shadowIndexPosition = 2;
    }

    if (player.team === 1 && (savedOptions.skin_red_shadow || savedOptions.skin_red_shine) || player.team === 2 && (savedOptions.skin_blue_shadow || savedOptions.skin_blue_shine))  {
        player.sprites.shadowshine = new PIXI.Sprite(player.team === 1 ? redShadowShineTexture : blueShadowShineTexture);
        player.sprites.shadowshine.position.set(20, 20);
        player.sprites.shadowshine.pivot.set(canvas_center, canvas_center);

        player.sprites.ball.addChildAt(player.sprites.shadowshine, shadowIndexPosition);
    }
};

let createPixiTextures = function() {
    let redActualBallTexture = PIXI.Texture.from(redActualBallCanvas);
    let blueActualBallTexture = PIXI.Texture.from(blueActualBallCanvas);

    tagpro.tiles['bs_redball'] = redActualBallTexture;
    tagpro.tiles['bs_blueball'] = blueActualBallTexture;

    PIXI.utils.TextureCache['bs_redball'] = redActualBallTexture;
    PIXI.utils.TextureCache['bs_blueball'] = blueActualBallTexture;

    for (let playerId in tagpro.players) {
        let player = tagpro.players[playerId];

        if (!player.sprites || !player.sprites.actualBall) {
            continue;
        }

        player.sprites.actualBall.texture = player.team === 1 ? redActualBallTexture : blueActualBallTexture;

        if (!player.sprites.ballskin) {
            addBallSkin(player);
        }
    }
};

let createSpawnTextures = function() {
    let tr = tagpro.renderer;

    let redCanvas = createCanvas(40, 40);
    let redCtx = redCanvas.getContext('2d');
    let blueCanvas = createCanvas(40, 40);
    let blueCtx = blueCanvas.getContext('2d');

    redCtx.drawImage(redActualBallCanvas, 0, 0, 40, 40);
    redCtx.drawImage(redSkinCanvas, -12, -12, 64, 64);
    tagpro.tiles['redball'] = PIXI.Texture.from(redCanvas);
    PIXI.utils.TextureCache['redball'] = tagpro.tiles['redball'];

    blueCtx.drawImage(blueActualBallCanvas, 0, 0, 40, 40);
    blueCtx.drawImage(blueSkinCanvas, -12, -12, 64, 64);
    tagpro.tiles['blueball'] = PIXI.Texture.from(blueCanvas);
    PIXI.utils.TextureCache['blueball'] = tagpro.tiles['blueball'];
};

let modifyTagProFunctions = function() {
    let tr = tagpro.renderer;

    redSkinTexture = PIXI.Texture.from(redSkinCanvas);
    blueSkinTexture = PIXI.Texture.from(blueSkinCanvas);

    if (savedOptions.skin_red_shadow || savedOptions.skin_red_shine) {
        redShadowShineTexture = PIXI.Texture.from(redShadowShineCanvas);
    }
    if (savedOptions.skin_blue_shadow || savedOptions.skin_blue_shine) {
        blueShadowShineTexture = PIXI.Texture.from(blueShadowShineCanvas);
    }

    tr.createBallSprite = function(player) {
        let tileId = player.team === 1 ? 'bs_redball' : 'bs_blueball';

        player.sprites.actualBall = tagpro.tiles.draw(player.sprites.ball, tileId, {x: 0, y: 0});
        player.sprites.actualBall.position = new PIXI.Point(20, 20);
        player.sprites.actualBall.pivot = new PIXI.Point(20, 20);
        player.sprites.actualBall.tileId = tileId;

        addBallSkin(player);
    };

    tr.updatePlayerColor = function(player) {
        let tileId = player.team === 1 ? 'bs_redball' : 'bs_blueball';

        if (player.sprites.actualBall.tileId !== tileId) {
            let baseTexture = tagpro.tiles.getTexture(tileId);
            let texture = new PIXI.Texture(baseTexture);

            player.sprites.actualBall.texture = texture;
            player.sprites.actualBall.tileId = tileId;

            if (player.sprites.ballskin) {
                player.sprites.ballskin.parent.removeChild(player.sprites.ballskin);
                addBallSkin(player);
            }
        }
    };

    if (savedOptions.skin_red_spin || savedOptions.skin_blue_spin) {
        tr.updatePlayerSpritePosition = function(player) {
            player.sprite.x = player.x;
            player.sprite.y = player.y;

            if (!tr.options.disableBallSpin) {
                player.sprites.actualBall.rotation = player.angle;

                if (player.sprites.ballskin.spinspeed) {
                    player.sprites.ballskin.rotation = player.angle * player.sprites.ballskin.spinspeed;
                }
            }
        };
    }
};

tagpro.ready(function() {
    let readyToDraw = function() {
        return document.visibilityState === 'visible' && tagpro.playerId; // tagpro.tiles.image;
    };

    let init = function() {
        createNewBallTextures();
        createShadowAndShine();

        if (document.location.pathname === '/') {
            createMenu();
            addMenuListeners();
            loadOptions();
            createBallSkinChooser();

        } else {
            if (document.visibilityState === 'hidden') {
                document.addEventListener('visibilitychange', start);
            } else {
                start();
            }
        }
    };

    let counter = 0;
    let start = function() {
        if (!readyToDraw()) {
            setTimeout(() => {
                counter++;
                start();
            }, 20);

            return false;

        } else {
            document.removeEventListener('visibilitychange', start);
            createSpawnTextures();
            modifyTagProFunctions();
            createPixiTextures();
        }
    };

    skins_image.onload = init;
    skins_image.crossOrigin = 'Anonymous';
    skins_image.src = defaultValues.texture_ballskins;
});


function createCanvas(width, height, forceDOM = false) {
    if (!forceDOM && typeof OffscreenCanvas !== 'undefined' && !window.navigator.userAgent.includes('Gecko')) { // Gecko support (Firefox) is bad as at 2023-03-01.
        return new OffscreenCanvas(width, height); // An 'OffscreenCanvas' is smaller and faster than a normal canvas.

    } else {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}

function tintCanvas(sourceCtx, sx=0, sy=0, sw=40, sh=40, color='#000000', useHardLight=false) {
    let tempCanvas = createCanvas(sw, sh);
    let tempCtx = tempCanvas.getContext('2d');

    sourceCtx.globalCompositeOperation = 'source-over';

    // create greyscale copy...
    tempCtx.filter = 'saturate(0)';
    tempCtx.drawImage(sourceCtx.canvas,  sx, sy, sw, sh,  0, 0, sw, sh);
    tempCtx.filter = 'none';
    sourceCtx.clearRect(sx, sy, sw, sh);
    sourceCtx.drawImage(tempCanvas,  0, 0, sw, sh,  sx, sy, sw, sh);

    // create solid color...
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, sw, sh);

    // draw colored on top of greyscale using either the 'hard-light' or 'color' gCO...
    sourceCtx.globalCompositeOperation = useHardLight ? 'hard-light' : 'color';
    sourceCtx.drawImage(tempCanvas,  0, 0, sw, sh,  sx, sy, sw, sh);
    sourceCtx.globalCompositeOperation = 'source-over';

    tempCanvas = null;
    tempCtx = null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgbA(hex, alpha=1) {
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        var c = hex.substring(1).split('');
        if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        c = '0x' + c.join('');
        if (!$.isNumeric(alpha) || (alpha < 0) || (alpha > 1)) alpha = 1;
        return 'rgba(' + [(c>>16)&255, (c>>8)&255, c&255].join(', ') + ', ' + alpha + ')';
    }
}

})();