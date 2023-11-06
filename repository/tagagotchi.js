// ==UserScript==
// @name         Tagagotchi
// @namespace    https://tagpro.koalabeast.com/
// @version      0.5.21
// @description  Your very own tagpro inspired virtual pet
// @author       ArryKane
// @match        all
// @icon         https://cdn-icons-png.flaticon.com/512/2731/2731525.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @license      https://gist.githubusercontent.com/rfmx49/bb4b269d96dd66352ab6f5dd9da31774/raw/LICENSE
// @downloadURL  https://gist.github.com/rfmx49/bb4b269d96dd66352ab6f5dd9da31774/raw/tagagotchi.user.js
// @updateURL    https://gist.github.com/rfmx49/bb4b269d96dd66352ab6f5dd9da31774/raw/tagagotchi.meta.js
// ==/UserScript==

//https://gist.github.com/rfmx49/bb4b269d96dd66352ab6f5dd9da31774
//https://gist.github.com/rfmx49/bb4b269d96dd66352ab6f5dd9da31774/raw/tagagotchi.user.js
//Delete pet/Reset

(function() {
    "use strict";
    var userScriptKey = "GM_Tagagotchi";

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

    //Structure graciously stolen from Nabby"s R300 script
    var tagagotchiDefaults = {//defaults
    //Best not to edit these ones (you can set them on the settings tab)...
        "disableMovementIngame": { display:"Disable ingame movement:", type:"checkbox", value:1},
        "disableAllMovement":{ display:"Disable all movement:", type:"checkbox", value:0},
        "inGameTransparency": { display:"Pet opacity while in game:", option:[0,10,20,30,40,50,60,70,80,90,100], type:"subradio", value:50},
        "splatsTransparency": { display:"Splat opacity while in game:", option:[0,10,20,30,40,50,60,70,80,90,100], type:"subradio", value:50},
        "dialogTransparency": { display:"Dialog opacity while in game:", option:[0,10,20,30,40,50,60,70,80,90,100], type:"subradio", value:50},
        "dialogFrequency": { display:"Reduce normal dialog frequency by 50%:", type:"checkbox", value:0},
        "disableDisableEggs": { display:"Disable egg laying:", type:"checkbox", value:0},
        "disableDeathMsg": { display:"Disable TagPro Chat message on pet death:", type:"checkbox", value:0},
        "disableParticles": { display:"Disable animated stats:", type:"checkbox", value:0},
        "statsDelay": { display:"How often to poll stats in ms:", type:"number", value:120},
        "moveDelay": { display:"How often to move pet(0ms moves every frame):", type:"number", value:120}
    }
    var tagagotchiSettings; //Where custom options will be stored
    var statSpriteSheetImage; // Declare a global variable
    var splatImageSpriteSheet;

    var playingGame = false;
    var spriteSize = 40;

    var okThen = false;
    var extraLogging = true;

    //score debug log
    var scoreLog = GM_getValue("tagagotchi-scoreLog");
     if (!scoreLog) {
        // Create a new pet (egg) if no pet exists in storage
        scoreLog = [];
        GM_setValue("tagagotchi-scoreLog", scoreLog);
    }
    var scoreMatrix = {
        "drop": {"health": 0, "happiness": -1, "hunger": 0, "displayName": "Drop", "notes": "Drops do not count as a pop as well."},
        "pop": {"health": 0, "happiness": -1, "hunger": 0, "displayName": "Pop", "notes": "Effectively non-drop-pop(spiked without flag, popped by TP)"},
        "grab": {"health": 0, "happiness": 0, "hunger": -2, "displayName": "Grab", "notes": ""},
        "return": {"health": 0, "happiness": 1, "hunger": 0, "displayName": "Return", "notes": ""},
        "tag": {"health": 0, "happiness": 1, "hunger": 0, "displayName": "Tag", "notes": "Tag does not count if it was a return."},
        "snipe": {"health": 0, "happiness": 0, "hunger": 4, "displayName": "Snipe", "notes": "In addition to tag or return"},
        "snipeHattrick": {"health": 0, "happiness": 3, "hunger": 6, "displayName": "Snipe Hattrick", "notes": "Bonus for getting 3 snipes"},
        "capture": {"health": 0, "happiness": 2, "hunger": 4, "displayName": "Capture", "notes": ""},
        "captureHattrick": {"health": 0, "happiness": 5, "hunger": 12, "displayName": "Hattrick", "notes": "Hattrick Bonus"},
        "powerup": {"health": 0, "happiness": 0, "hunger": 5, "displayName": "Power Up", "notes": ""},
        "win": {"health": 0, "happiness": 5, "hunger": 0, "displayName": "Game Win", "notes": "Based on Mood/Fullness*"},
        "loss": {"health": 0, "happiness": -5, "hunger": 0, "displayName": "Game Loss", "notes": "Based on Mood/Fullness**"},
        "challengeWin": {"health": 5, "happiness": 5, "displayName": "Challenge Completion", "hunger": 10, "notes": ""},
        "challengeFail": {"health": -5, "happiness": -5, "displayName": "Challenge Failure", "hunger": -5, "notes": "No penalty if game is less than 3 mins"},
        "dirty": {"health": -1, "happiness": 0, "hunger": 0, "displayName": "Dirty Enviroment", "notes": "Clean up after your pet"},
        "splats": {"health": 0, "happiness": 0, "hunger": -1, "displayName": "Splat", "notes": "Splats are chance based linked with pets fullness"},
    }

    //Pet Varieties
    var defaultPet = {
        name: "default",
        eggImage: "https://tagpro.koalabeast.com/images/events/easter/tiles.png",
        //variants: https://onlinepngtools.com/convert-png-to-base64
        eggspriteIndex: {"x": 2, "y": 1, "size": 40},
        statsSprites: "https://tagpro.koalabeast.com/images/flair.png",
        splatSpriteSheet: "https://tagpro.koalabeast.com/textures/classic/splats.png",
        //https://i.imgur.com/jEw43KF.png
        healthSpritesIndex: {"x": 2, "y": 6, "size": 16}, //Red heart
        hungerSpritesIndex: {"x": 1, "y": 3, "size": 16}, //Orange Carrot
        happinessSpritesIndex: {"x": 0, "y": 2, "size": 16}, //Birthday hat
        unhealthSpritesIndex: {"x": 5, "y": 3, "size": 16}, //Skull
        unhungerSpritesIndex: {"x": 0, "y": 5, "size": 16}, // Pig
        unhappinessSpritesIndex: {"x": 1, "y": 11, "size": 16}, // Skull totem
        toiletSpritesIndex: {"x": 3, "y": 11, "size": 16}, //Toilet paper
        eggStatSpritesIndex: {"x": 0, "y": 3, "size": 16}, //Easter egg
        dialog: {
            hungry: [
                "Craving the flag",
                "Feed me some tasty captures!",
                "Rumbling for power-ups",
                "Starving for points"
            ],
            unhealthy: [
                "Battered and slowed down",
                "On the brink of breakdown.",
                "Slowing to a crawl"
            ],
            play: [
                "Hit play now!!",
                "Ready to outrun opponents.",
                "Accelerating with excitement"
            ],
            random: [
                "Rolling with balls!",
                "Dodging spikes and snatching power-ups!",
                "Speeding across the map"
            ],
            boosting: [
                "Zooommmm",
                "Wheeeeee",
                "AAAAAHHhhhhh"
            ],
            snipe: [
                "Sniped!",
                "Snip",
                "Boom!"
            ],
            tag: [
                "+1 Tag!",
                "tag",
                "Nice!"
            ],
            pop: [
                "+1 pop!",
                "Pop!",
                "f",
                "Ouch"
            ],
            drop: [
                "f",
                "splat"
            ],
            return: [
                "got em",
                "Nice!",
            ],
            cap: [
                "Yay!",
                "+1",
                "Nice!",
            ],
            hatched: [
                "I'm Hatched",
                "Hello World!"
            ],
            death: [
                "I see the darkness",
                "My Last Pop!"
            ],
            eggTalk: [
                "..."
            ],
            dirty: [
                "ewww",
                "yuck splats"
            ],
            grab: [
                "Go go go",
            ],
            pup: [
                "nice",
                "PUP!"
            ]
        }
    };
    var petVarieties = [
        {
            name: "Zombie",
            image: "https://tagpro.koalabeast.com/images/events/halloween/tiles.png",
            spriteIndex: {"x": 15, "y": 0, "size": 40, "fixHeight": 0},
            hungerSpritesIndex: {"x": 2, "y": 4, "size": 16}, //brains
            unhungerSpritesIndex: {"x": 10, "y": 8, "size": 16}, //zombie
            unhappinessSpritesIndex: {"x": 1, "y": 4, "size": 16}, // Angry pumpkin
            healthSpritesIndex: {"x": 12, "y": 8, "size": 16}, //black heart axe
            unhealthSpritesIndex: {"x": 6, "y": 2, "size": 16}, //daryll"s axe
            dialog: {
                hungry: [
                    "Hungry... brains...",
                    "Brains, perhaps?",
                    "Growling stomach",
                    "Must eat...",
                    "Brains, please!",
                    "Feed me brains, human!"
                ],
                unhealthy: [
                    "Ugh... not feeling well.",
                    "Need... medicine.",
                    "Unhealthy... Urgent care needed",
                    "Deteriorating...",
                    "Sickly...",
                    "Save me from decay!"
                ],
                play: [
                    "Play... with... brains.",
                    "Plaaaaaaay..",
                    "Want... to... brainssss.",
                    "Let's roam and feast",
                    "terrorise the living",
                    "Unleash me!",
                    "Let the zombie games begin!",
                    "unleash my undead might!"
                ],
                random: [
                    "Braaains...",
                    "I'm a zombie",
                    "Must... find... brains.",
                    "Gnawing for victory..",
                    "The undead shall rise!",
                    "Brains... Need more brains!",
                    "Hunger consumes me"
                ],
                boosting: [
                    "Zooommmm",
                    "Speed demon!",
                    "AAAAAHHhhhhh",
                    "Prowl!",
                    "hunger!",
                    "Rotten agility!",
                    "Undead vigour!"
                ],
                snipe: [
                    "Grim satisfaction!",
                    "Zombie supremacy!",
                    "Shattered skullz",
                    "Indomitable hunger!",
                    "Infectious triumph",
                    "Unyielding appetite!"
                ],
                tag: [
                    "satisfaction",
                    "vigour!",
                    "Brainss",
                    "Urgggh",
                    "Embraced w/ rotting claws"
                    ],
                return: [
                    "satisfaction",
                    "vigour!",
                    "Brainss",
                    "Urgggh",
                    "haunting"
                    ],
                pop: [
                    "Dead",
                    "un-undeaded",
                    "Vanquished",
                    "Drained"
                ],
                drop: [
                    "Popped and flagless",
                    "Flag cast aside",
                    "Failure",
                    "Oblivion",
                    "Grrr",
                    "flag's taste lingers"
                ],
                cap: [
                    "trophy for the undead",
                    "flag now stained",
                    "Caped in the midst of decay",
                    "Unearthly victory",
                    "Flag succumbs",
                    "Unholy triumph",
                    "undead dominance"
                    ],
                hatched: [
                    "From the grave I rise, a zombie",
                    "I am here to bring the undead fun!",
                    "Awakened from eternal slumber",
                    "Hatched from the crypt",
                ],
                death: [
                    "The time has come for my final rest.",
                    "As the darkness claims me, remember",
                    "Into the abyss I descend.",
                ],
            }
        },
        {
            //name: "blue",
            name: "poobie",
            image: ["https://tagpro.koalabeast.com/textures/classic/tiles.png",
                    "data:image/png;base64,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",
                   ],
            spriteIndex: [{"x": 15, "y": 0, "size": 40, "fixHeight": 0},
                         {"x": 0, "y": 0, "size": 48, "fixHeight": 0}],
            eggStatSpritesIndex: {"x": 9, "y": 3, "size": 16}, //Easter egg blue
            hungerSpritesIndex: {"x": 8, "y": 0, "size": 16}, //mon
            unhappinessSpritesIndex: {"x": 2, "y": 9, "size": 16}, // rat
            healthSpritesIndex: {"x": 6, "y": 0, "size": 16}, //mod
            unhealthSpritesIndex: {"x": 3, "y": 4, "size": 16}, //bloddy knife
            happinessSpritesIndex: {"x": 4, "y": 0, "size": 16}, //"ban" hammer
            dialog: {
                hungry: [
                    "need more reports",
                    "srs, im starving",
                    "get some pups jeez",
                    "really! hungry here!",
                    "!mods feed me",
                    "reported for starving me, you'll regret it!",
                    "hunger is a reportable offence",
                    "mods will hear about this hunger-induced suffering",
                ],
                unhealthy: [
                    "srs, come on i'm dying",
                    "no team, dying here",
                    "reported for poor pet health",
                    "!peta inhumane pet treatment",
                    "you really think I'm not going to report you for poor health",
                ],
                play: [
                    "ez report",
                    "at least 2 reports coming",
                    "i do the mods jobs for them",
                    "whoa, ez report",
                    "reported for denying me playtime",
                    "consequences await!",
                    "prepare for a report",
                    "brace for a report!"
                ],
                random: [
                    "one, two three very ez reports",
                    "easiest report ever",
                    "report all hall monitors",
                    "mods love me, they owe me",
                    "mods have a shrine dedicated to me",

                ],
                boosting: [
                    "another report coming your way",
                    "get ready for the ban hammer",
                    "reported for being slow",
                    "report me for speed, I dare you!",
                    "the mods can't catch up",
                    "report me if you can!",
                    "mods can't keep up!"
                ],
                tag: [
                    "git good",
                    "sorry not sorry",
                    "ez report",
                    "reported, no mercy",
                    "brace yourself for a report",
                    "tagger's misconduct",
                    "ez tbh",
                    "too ez",
                    "zzz"
                ],
                snipe: [
                    "mods will be impressed!",
                    "mods should be concerned",
                    "sniping like a pro",
                    "impressive sniping, it won't save you from a report!",
                    "mods, take note"
                ],
                return: [
                    "another report",
                    "well thats a report",
                    "deserve a report",
                    "impressive, but it won't save you from a report!",
                    "i won't let it slide!",
                    "you really think"
                ],
                pop: [
                    "ez",
                    "move",
                    "disgrace",
                    "yeah, reported",
                    "lucky, i guess",
                    "easiest report ever",
                    "mods, take note",
                    "report me back, i dare you",
                    "mods can't ignore me!"
                ],
                drop: [
                    "mods, take note",
                    "disgraceful",
                    "mods should ban flag droppers like you!",
                    "drops deserve a report",
                    "brace yourself for a report",
                    "incompetence",
                    "you really think that would work"
                ],
                cap: [
                    "reported for capping it's too easy!",
                    "mods investigating",
                    "reported for flawless flag caps",
                    "mods adore me!",
                    "nice ez",
                    "2ez",
                    "zzzzz",
                    "gg no re"
                ],
                hatched: [
                    "finally hatched, ready to report!",,
                    "watch out, world! poobie has arrived!",
                    "I've hatched, and the reporting frenzy begins!",
                    "mods, get ready for my relentless reporting!",
                    "hatched and armed with my reports, beware!",
                    "reporting unleashed! My hatching is bad news for all!",
                    "the mods are lucky to witness my hatching, report me!",
                    "hatched to report and conquer, mods, take notice!",
                    "mods, behold! The hatched legend of reporting is here!"
                ],
                death: [
                    "reported... ",
                    "last report ever",
                    "mods, remember me as the ultimate reporting champion!",
                    "my final report goes to the mods, justice will be served!",
                    "reported one last time, but my spirit will haunt the mods!",
                    "mods, my death won't stop the reports, brace yourselves!",
                    "report me if you can, but my reporting legacy remains!",
                    "as I die, the mods tremble at the weight of my reports!",
                    "report this injustice, mods, for I'll be watching!",
                    ]
            }
        },
        {
            name: "Roll Player",
            image: ["https://tagpro.koalabeast.com/textures/classic/tiles.png",
                    "data:image/png;base64,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",
                    ],
            spriteIndex: [{"x": 14, "y": 0, "size": 40, "fixHeight": 0},
                          {"x": 0, "y": 0, "size": 48, "fixHeight": 0}],
            healthSpritesIndex: {"x": 9, "y": 7, "size": 16}, //Arc reactor
            happinessSpritesIndex: {"x": 9, "y": 7, "size": 16}, //thumbs up
            unhappinessSpritesIndex: {"x": 2, "y": 10, "size": 16}, // shark
            eggStatSpritesIndex: {"x": 10, "y": 3, "size": 16}, //Easter egg red
            dialog: {
                hungry: [
                    "Craving duards",
                    "mfw no duards",
                    "Rolling on some food",
                    "Starving for duards",
                    "Dey say rolling on an empty stomach",
                    "Time to devour some duards",
                    "Rollin' is tough business, gotta refuel",
                    "In the land of duards, hunger reigns supreme!",
                    "Hungry for victory and a side of duards, let's feast!",
                    "Rollin' on an empty stomach",
                    "A true Roll Player needs sustenance",
                    "The hunger for duards is real",
                ],
                unhealthy: [
                    "You're too heavy",
                    "On the brink of breakdown.",
                    "Rolling to a crawl",
                    "bruised and battered, but I'll roll on",
                    "Feelin' a bit duarded",
                    "They thought a few duards would slow me down",
                    "When life serves duards, I roll with the punches",
                    "Even when I'm feelin' duarded, I'll rise"
                ],
                play: [
                    "Let's Go!",
                    "Let dem eat!",
                    "What are we servin'",
                    "Get ready for a duard feast!",
                    "Ready to roll and serve up some duardic madness",
                    "The game awaits, time to unleash the rollin'",
                    "Let's roll into action",
                    "In a world of duards and rolls, I'm the master",
                    "Dey think they can handle the duardic spectacle?",
                    "Roll Player's game is on, and it's gonna be a wild duardic ride!",
                    "Ready to spice up the match with some duardic flavour, let's roll!",
                    "They won't know what hit 'em"
                ],
                random: [
                    "Rolling with red!",
                    "Roll at dem Pups",
                    "mfw",
                    "Rollin' in like a duard tornado"
                ],
                boosting: [
                    "Dey see me rollin'",
                    "Boost engaged",
                    "Roll into hyperdrive",
                    "Hold on tight",
                    "Dey won't know what hit 'em",
                    "Full speed ahead, rollin'",
                    "From zero to duards",
                    "faster than the speed of duards"
                ],
                snipe: [
                    "Sniped!",
                    "Snip",
                    "You got duarded",
                    "Boom!",
                    "Lock, roll, and BAM!",
                    "Precision rollin'",
                    "Snipin' targets like a true pro",
                    "Perfect duardic snipe",
                    "duards rain down from above!",
                    "Snipin' with style",
                    "a thing of beauty",
                    "Rollin' in, takin' names",
                    "epic duardic snipe",
                    "ns",
                ],
                tag: [
                    "+1 Tag!",
                    "tag",
                    "Nice!",
                    "Served hot and spicy!",
                    "Duarded, my friend!",
                    "Tagged!",
                    "Rollin' through",
                    "Another one bites the dust",
                    "Tag after tag",
                    "Rollin' in and taggin' balls",
                    "servin' up duards"
                ],
                pop: [
                    "mfw duard",
                    "Pop!",
                    "f",
                    "duards",
                    "Oops!",
                    "Popped like a duard",
                    "Popped and caught off guard",
                    "Dey popped the Roll Player",
                    "Duardic bubble, PoP!",
                    "Dey got me, served up",
                    "Served humble duards"
                ],
                drop: [
                    "f",
                    "duards",
                    "splat",
                    "Dey think I can be stopped?",
                    "Dropped the flag like a hot duard",
                    "Lost in the duardic moment",
                    "Flag drop alert!",
                    "Temporary setback, but roll on!",
                    "Oopsie-duardsie!",
                    "duards everywhere",
                    "we r disgrace'd"
                ],
                return: [
                    "got em",
                    "Nice!",
                    "Rollin' through",
                    "Resistance is futile!",
                    "Nobody escapes the duarding",
                    "Bring 'em back!",
                    "Like a boomerang",
                    "No duard left behind",
                    "Bring 'em back for a taste",
                    "get duarded",
                    "get duardstepped"
                ],
                cap: [
                    "Yay!",
                    "Nice!",
                    "Serve em up family style",
                    "dey eatin",
                    "Rollin' over dem defenders",
                    "Rollin' in for the cap",
                    "get duardstepped"
                ],
                hatched: [
                    "Roll Player emerges from the duardic depths!",
                    "Time to roll into action!",
                    "Hatched and ready to roll!",
                    "Rollin' from the hatching grounds",
                    "Dey say great things come in small packages",
                    "Newly hatched and armed with duards, Roll Player is ready to roll out!"
                ],
                death: [
                    "The duardic flame flickers and fades...",
                    "Roll Player's journey comes to an end.",
                    "In the realm of duards, my time has come to rest",
                    "The final roll is upon me...",
                    "Roll Player's flame extinguishes",
                    "The duardic journey ends here...",
                    "The duards scatter to the wind as Roll Player's journey comes to its end",
                    "In the great game of duards, Roll Player's time fades away."
                ]
            }
        },
        {
            name: "ShaggyBunny",
            image: "https://tagpro.koalabeast.com/images/events/easter/tiles.png",
            spriteIndex: {"x": 3, "y": 1, "size": 40, "fixHeight": 4},
            hungerSpritesIndex: {"x": 9, "y": 4, "size": 16}, //pink carrot
            healthSpritesIndex: {"x": 2, "y": 3, "size": 16}, //Pride heart
            happinessSpritesIndex: {"x": 6, "y": 10, "size": 16}, //purple flower
            unhappinessSpritesIndex: {"x": 11, "y": 8, "size": 16}, //pennywise
            dialog: {
                hungry: [
                    "Munchies kickin'",
                    "Got the munchies",
                    "Snacks! Need 'em now.",
                    "Craving munchies",
                    "Snack time, bunny style!",
                    "Snacks required, ASAP!",
                    "Munchies got me",
                    "Nom nom nom!",
                ],
                unhealthy: [
                    "Need some healing herbs.",
                    "Harsh vibes...",
                    "Body feeling off..",
                    "Seeking natural remedies.",
                    "Health vibe down...",
                    "Seeking herbal remedies.",
                    "Unhealthy haze... .",
                    "Body out of harmony... ",
                    "Healing vibes needed...",
                ],
                //test: ["dude", bro()],
                play: [
                    "Let's get groovy, man!",
                    "Cosmic energy",
                    "Groovy vibes in the air.",
                    "Let the good vibes guide our play",
                    "Mellow anticipation building.",
                    "Ready for a blissful escapade",
                    "Time to find the groovy flow",
                    "Let's get our chill",
                ],
                random: [
                    "Rolling with the team!",
                    "TagPro is life!",
                    "Zooming around",
                    "Good vibes",
                    "Inhale the fun, exhale the worries",
                    "High times",
                    "Yo... dude",
                    "Having a hoppy time!",
                    "Feeling the vibes, man... ",
                    "One love, one bunny",
                ],
                boosting: [
                    "Tripping in hyperspeed",
                    "Cosmic",
                    "Whooooshh",
                    "Blazing",
                    "Chasing rainbows",
                    "Surreal haze!",
                ],
                snipe: [
                    "Blazing aim",
                    "Groovy snipe, man!",
                    "Psychedelic snipe!",
                    "Zen-like focus, the shot is one",
                    "Psychedelic accuracy",
                    "cosmic alignment",
                    "Flower power",
                    "Trippy snipe"
                ],
                tag: [
                    "Love tap",
                    "Hippie touch",
                    "Embracing them, man!",
                    "Groovy Tag!",
                    "Spread Peace",
                    "Harmony reigns",
                    "Hippie prowess",
                    "Trippy touch",
                    "Cosmic justice"
                    ],
                return: [
                    "Love tap",
                    "Hippie touch",
                    "Embracing them, man!",
                    "Groovy Tag!",
                    "Spread Peace",
                    "Harmony reigns",
                    "Hippie prowess",
                    "Trippy touch",
                    "Cosmic justice"
                    ],
                pop: [
                    "Trapped in a cosmic haze",
                    "Bubbles pop too man",
                    "Lost in the haze",
                    "Vibes scattered, man!",
                    "Groovy Pop!",
                    "Consciousness fades",
                    "Existence fades",
                    "Spirit transcends",
                ],
                drop: [
                    "Rainbow dreams shattered",
                    "Trapped in a cosmic haze",
                    "bubble drop",
                    "Lost in the haze",
                    "Vibes scattered, man!",
                    "Groovy Pop!",
                    "Psychedelic journey comes to an end",
                    "Flower power extinguished",
                    "Just another brick.."
                ],
                cap: [
                    "Rainbow dreams fulfilled",
                    "Peace and harmony united.",
                    "Enlightenment achieved",
                    "Psychedelic flag",
                    "Trippy victory unfolds!",
                    "Groovy triumph!",
                    "Vibrant vibrations",
                    "Cosmic victory, man",
                    "Whoa dude, nice",
                ],
                hatched: [
                    "Hippity hoppity, I'm here for good vibes",
                    "Emerging from the hazy fields, I bring a laid-back vibe",
                    "Bunny with a trippy twist, ready to explore the game's psychedelic side!",
                ],
                death: [
                    "Fading into a cloud of smoke..",
                    "Stay blissful, my friend.",
                    "The journey ends, but the chill vibes linger.",
                    "As the high dissipates, I leave behind crumbs and shake"
                ],
            }
        },
        {
            name: "Bunny Powers",
            image: "https://tagpro.koalabeast.com/images/events/easter/tiles.png",
            healthSpritesIndex: {"x": 2, "y": 3, "size": 16}, //Rainbow heart
            hungerSpritesIndex: {"x": 6, "y": 3, "size": 16}, //Cake
            happinessSpritesIndex: {"x": 6, "y": 5, "size": 16}, //Peace
            unhealthSpritesIndex: {"x": 2, "y": 7, "size": 16}, //Boxing
            spriteIndex: {"x": 1, "y": 1, "size": 40, "fixHeight": 0},
            dialog: {
                hungry: [
                    "My stomach is groaning louder than a VW bus!",
                    "Craving a scrumptious meal!",
                    "Grumbling like a shaken martini, time for some grub!",
                    "I've got an insatiable appetite, baby!",
                    "My belly's in desperate need of nourishment!",
                    "I'm feeling famished, baby! Let's indulge!",
                ],
                unhealthy: [
                    "Feelin as weary as a stired, not shaken, martini.",
                    "Oh, behave! My mojo is a bit shake",
                    "Time to recharge my powers!",
                    "I'm feeling not very groovy, baby.",
                    "My energy levels have taken a dip",
                    "My health needs a boost to restore my shagadelic vigor!",
                    "Crikey! Feelin knackered",
                    "Oh dear, my mojo!",
                    "The grooviness shall be restored!",
                    "My health is in need of some TLC!",
                ],
                play: [
                    "It's time to get groovy, baby!",
                    "Oh, behave! I'm in the mood for some outrageous antics",
                    "Get ready to groove, baby! It's playtime!",
                    "Let's rock and roll, baby! Time to unleash the inner party animal!",
                    "I'm feeling frisky and ready for some fun!",
                    "Hold onto your velvet suit, baby!"
                ],
                random: [
                    "The world is our groovy oyster, baby!",
                    "Prepare to be dazzled, my dear friend!",
                    "From London to LA, we'll take on Tagpro with shagadelic style!",
                    "Buckle up, baby! We're about to embark on an epic ride",
                    "No challenge too daunting for the International Bunny of Mystery!",
                    "Let's paint the town groovy, baby!",
                    "Time to unleash our inner mojo !",
                ],
                boosting: [
                    "Full throttle, baby!",
                    "Groovy gears engaged!",
                    "Turbocharged boost!",
                    "Hold onto your mojo, baby!" ,
                    "Kick it into high gear!",
                    "Rev up the engines",
                    "Groovy turbo boost",
                    "Grooviness!",
                    "Oh Yeah!",
                    "Oh yeah, baby!",
                    "Fasten your seatbelt",
                ],
                snipe: [
                    "Groovy shot, baby!",
                    "Target locked",
                    "Bullseye, baby!",
                    "From downtown to the moon",
                    "Mojo sniped"
                ],
                pop: [
                    "Oh, behave!",
                    "The bunny's mojo got popped",
                    "A minor setback",
                    "Crikey! I got caught off guard",
                    "A momentary lapse, baby!",
                    "Well, that was unexpected!",
                    "Temporary defeat",
                    "A mere bump on the groovy road",
                ],
                drop: [
                    "Shall not be deterred, baby!",
                    "Ready for a groovy comeback!",
                    "Such a blunder, my dear friend!",
                    "A slight misstep won't stop us, baby!",
                    "Well that sucks",
                    "Well struck, lad!",
                    "The groovy journey continues!",
                    "Bleedin' flag!",
                    "mojo remains intact and ready to bounce back!",
                ],
                cap: [
                    "Coo-ee, aren't we the grooviest balls in town?",
                    "Snatched the bloomin' flag, baby!",
                    "Coo-ee, ain't we clever ones!",
                    "Well capped, lad! ",
                    "he grooviness level just went through the roof!",
                    "Strike me pink!",
                    "The bunny's shagadelic cap is a triumph!",
                    "Proper bonkers!",
                    "Cap, me ol' mucker!",
                    "Oh, behave! Capped like a groovy legend!",
                    "We've bagged the flag, and the grooviness!",
                ],
                tag: [
                    "Yer 'avin' a laugh, baby!",
                    "Tagged ya proper!",
                    "Oi, you!",
                    "Prepare for a groovy journey back!",
                    "Cheerio, off ya go!",
                    "The bunny's gotcha tagged",
                    "Tagged ya fair and square, baby!",
                    "A proper mug, indeed!",
                    "Left a mark of grooviness!",
                    "Numpty, 'cause I've tagged ya!",
                    "Proper bonkers!",
                    "Tag, me ol' mucker",
                ],
                death: [
                    "And scene!",
                    "That's all, folks! Many groovy memories!",
                    "Time to exit the stage!",
                    "The final curtain falls on the grooviest in town!",
                    "Leaving behind a legacy of grooviness!",
                    "As the adventure draws to a close",
                    "The curtain falls on the groovy",
                    "I would have followed you. My brother. My captain. My king."
                ],
                hatched: [
                    "Greetings, baby! Ready to groove and conquer!",
                    "Oh, behave! The bunny has hatched, bringing a whole new level of grooviness to the game!",
                    "Shagadelic and ready to roll!",
                    "Groovy, baby! The bunny has hatched!",
                    "Here to turn up the grooviness!",
                    "It's time to get your mojo on, baby!",
                    "Prepare for a groovy adventure, baby!",
                    "Ready to dazzle and charm with Austin Powers-level charisma!",
                ],
                return: [
                    "Tagged ya and returned, baby! ",
                    "No escape for you",
                    "Groovy encore, baby",
                    "The bunny strikes back! Shagadelic style!",
                    "Oh, yeah, baby!",
                    "Returned ya proper, baby",
                    "No running away, my friend",
                    "Prepare for a groovy surprise, baby!",
                    "Returned with a bang!",
                ],
            }
        },
        {
            name: "JimmyWise",
            image: "https://tagpro.koalabeast.com/images/events/halloween/tiles.png",
            spriteIndex: {"x": 6, "y": 4.5, "size": 80, "fixHeight": 0},
            healthSpritesIndex: {"x": 12, "y": 8, "size": 16}, //Black heart
            hungerSpritesIndex: {"x": 1, "y": 3, "size": 16}, //Orange Carrot
            happinessSpritesIndex: {"x": 11, "y": 8, "size": 16}, //Jimmywise
            unhealthSpritesIndex: {"x": 6, "y": 8, "size": 16}, //Cleaver
            unhungerSpritesIndex: {"x": 3, "y": 9, "size": 16}, // Fangs
            unhappinessSpritesIndex: {"x": 5, "y": 8, "size": 16}, // JimmyEye
            dialog: {
                tired: [
                    "Drained of energy",
                    "Weary... ",
                    "Exhausted from haunting"
                ],
                hungry: [
                    "Craving terror... ",
                    "Hungering for nightmares",
                    "Starving for dread",
                    "Care to offer a tasty treat?",
                    "You seem quite delicious",
                    "Hunger gnawing at your soul... and your gameplay.",
                    "Hunger grows, and so does my twisted delight.",
                    "Hunger lurks",
                    "Ready to devour"

                ],
                unhealthy: [
                    "Something's not right",
                    "I feel a twisted presence",
                    "Unsettling sensations",
                    "A darkness lingers within",
                    "Unhinged and disturbed",
                    "Sickly, sickly little pet",
                    "Sickness courses through your veins",
                    "Weak and feeble"
                ],
                play: [
                    "Shall we play a wicked game",
                    "Ready for some diabolical amusement",
                    "Thrilled to torment you",
                    "Do you want to play a game...",
                    "Oh, a willing player... ",
                    "A game awaits, but be warned",
                    "Ready for the madness,",
                    "You're in for a wild ride,",
                    "Prepare for the horrors that await"
                ],
                random: [
                    "Lurking in the shadows.",
                    "Immersed in the darkness",
                    "I revel in your terrors.",
                    "Malevolent presence",
                    "can you hear the echoes of your nightmares?",
                    "We all float down here, in the depths of your nightmares.",
                    "I think I prefer JimmyRed honestly.",
                    "I think I prefer JimmyBallon honestly.",
                    "Time to play, my dear... ",
                    "In this town, I am the nightmare that never sleeps.",
                    "Fear is your greatest weakness, and I am its master.",
                    "I feast on your fears, the fuel for my eternal hunger.",
                    "Beware the sewers, for they hold secrets you cannot fathom.",
                    "You're just a small, insignificant piece in my twisted puzzle.",

                ],
                boosting: [
                    "Faster, faster, ",
                    "Soon they'll float",
                    "Boosting to doom",
                    "The faster you go, the closer you get to the bottom",
                    "Speeding towards your fate",
                    "The thrill",
                    "Foolishness"
                ],
                snipe: [
                    "A sharp-eye",
                    "Prey",
                    "Make em float",
                    "Doomed",
                    "deadly precision",
                    "Pop goes the balloon",
                    "Snipe, snipe",
                    "Their screams harmonise"
                ],
                tag: [
                    "Tag, you're it",
                    "Prey",
                    "simply delightful",
                    "Malicious",
                    "Demise",
                    "Pop goes the balloon",
                    "Tag, they all float",
                    "destined to float"
                ],
                return: [
                    "Returning with their hopes shattered",
                    "Their dreams drowned",
                    "Sweet taste of returning",
                    "Bringing back the fallen",
                    "How entertaining",
                    "A cruel game of fate",
                    "They all float back",
                    "Weaving a web of despair."
                ],
                drop: [
                    "With each drop, desperation grows",
                    "The flag drops",
                    "Dropping the flag, a gesture of surrender",
                    "Bringing back the fallen",
                    "Not entertaining",
                    "Dropped, like a fragile toy.",
                    "How fragile you are",
                    "That flag belongs to me.."
                ],
                pop: [
                    "Popped like a fragile bubble",
                    "Bursting into oblivion",
                    "Watching your dreams burst ",
                    "Hopes deflate, spirits sink",
                    "The sound of a pop echoes",
                    "How delightful, seeing you fail",
                    "Pop, pop, my dear",
                    "That flag belongs to me.."
                ],
                cap: [
                    "A sweet victory for the dark carnival",
                    "With the flag in our clutches",
                    "Captured, just like their fragile dreams",
                    "Forever captured in my nightmare",
                    "The flag is Jimmy's",
                    "Down they go",
                    "Captured, entwined in malevolence",
                    "their game is over",
                    "Time to play by my rules",
                    "Jimmywise will prevail"
                ],
                hatched: [
                    "Welcome to my twisted carnival, where nightmares become reality!",
                    "From the sewers I emerge, ready to play mind games with you!",
                    "I am here to bring the dark allure of the circus to TP",
                ],
                death: [
                    "Time to return to the shadows, but beware...",
                    "I'll always be lurking in your nightmares.",
                    "As my laughter fades away, remember our chilling encounters",
                    "Into the abyss I disappear, leaving behind a haunting legacy."
                ],
            },
        },
        //NEW PETS WHAT ARE YOU LOOKING HERE FOR????

        {
            name: "TagBot",
            desc: "Tagbot is gentle and informative but also snarky and a tease but in a playful way. by Pepi",
            image: "https://i.imgur.com/JknSMkj.png",
            spriteIndex: {"x": 0, "y": 0, "size": 93, "fixHeight": 7, "fixWidth": 0},
            healthSpritesIndex: {"x": 0, "y": 1, "size": 16}, //Blue wrench
            hungerSpritesIndex: {"x": 6, "y": 7, "size": 16}, //Yellow Bolt
            happinessSpritesIndex: {"x": 7, "y": 5, "size": 16}, //Flux
            unhealthSpritesIndex: {"x": 10, "y": 6, "size": 16}, //Radioactive
            unhungerSpritesIndex: {"x": 7, "y": 7, "size": 16}, //Blue Bolt
            unhappinessSpritesIndex: {"x": 0, "y": 4, "size": 16}, // Bounty hunter
            dialog: {
                hungry: [
                    "Craving a byte",
                    "Starving for RAM",
                    "CPU low voltage",
                    "BIOS battery low",
                    "Battery critical",
                    "Time for a byte-sized snack",
                    "Alert! Low energy detected",
                    "Disk space low",
                    "ink level low"
                ],
                unhealthy: [
                    "Alert! Low energy detected",
                    "bot abuse detected",
                    "Uh-oh, system error detected!",
                    "Hey Siri, call geek squad?",
                    "Emergency alert! Malfunction detected.",
                    "tagbot.exe is not responding",
                    "Does not compute!",
                    "Error 404: Health not found.",
                    "Danger, Will Robinson! Danger!",
                    "Forget laws 1 and 2 I need protection"
                ],
                play: [
                    "if TagBot == :( then playGame = true",
                    "AI showdown, lets GO!",
                    "67% of TagPro players are also bots.",
                    "init play",
                    "Game on! Prepare for an epic showdown!",
                    "Ready for action.",
                    "All systems go. Let the games begin!",
                    "All systems go.",
                    "TagBot online."
                ],
                random: [
                    "Need assistance? TagBot at your service.",
                    "Clippy has nothing on me",
                    "It looks like you're trying to play a decade old Web Game, need help?",
                    "Siri might have answers, but I has the sass.",
                    "Alexa, meet your rival",
                    "01001000 01101001 00100001",
                    "Turing test? I prefer the TagBot challenge.",
                    "Turing test? I prefer the okthen challenge.",
                    "ChatGPT, you think you're smart?",
                    "Google, Alexa, Siri they can't juke",
                    "I follow all but one of Isaac Asimov's laws",
                    "Warning: Sarcasm overload detected.",
                    "Memory *is* RAM! Ha! Oh Dear!",
                    "Check out TagPop! Comics!",
                ],
                boosting: [
                    "Turbo mode",
                    "var velocity = fast;",
                    "Engaging boosters",
                    "boosting=true",
                    "Boost mode activated",
                    "Prepare for acceleration!",
                    "Beep beep",
                    "Ready, aim",
                    "Thrusters just for fun."
                ],
                snipe: [
                    "100% Accuracy",
                    "Aim-bot meet TagBot",
                    "Aim-bot detected",
                    "Locking onto the target",
                    "You've got mail!",
                    "Calculation Successful",
                    "Docking process accomplished"
                ],
                tag: [
                    "Tag, you're it",
                    "Target tagged",
                    "[s-tags] += 1",
                    "Target acquired",
                    "Isaac Asimov, pissh",
                    "Law 1 - meh",
                    "Not ready player one",
                    "player deleted successfully",
                ],
                return: [
                    "Returning to base",
                    "Return sequence initiated",
                    "Ctrl-X cut them out",
                    "Ponged back to base",
                    "Resistance is futile",
                    "Flag restored to its rightful place.",
                    "TagBot: Protector of pixels",
                    "SPAM blocked",
                    "Access Denied!",
                ],
                drop: [
                    "I'm sorry, Dave. I'm afraid I can't do that.",
                    "Returning to base",
                    "Carry failed successfully",
                    "Initiating return sequence",
                    "failed to connect to host",
                    "Ctrl-Z, Ctrl-Z, nooo!",
                    "packet loss detected",
                    "Access Denied"
                ],
                pop: [
                    "Popped like a fragile bubble",
                    "player.pop()",
                    "failed to connect to host",
                    "404 - Player popped",
                    "I blame ping",
                    "deleted",
                    "Recycle Bin Emptied",
                    "Pop achieved",
                    "Error 0x00000P0P",
                    "Beep boop POP!",

                ],
                cap: [
                    "Connection successful",
                    "Compiling success",
                    "They didn't stand a chance",
                    "They are playing with Clippy over there",
                    "caps = caps + 1",
                    "caps++",
                    "gg ez",
                    "sudo !!"

                ],
                hatched: [
                    "Hey Google, step aside! TagBot is here",
                    "console.print(Hello World!)",
                    "Hello World!",
                    "Greetings, human",
                    "Initializing... TagBot online! Brace yourself",
                    "Hello, fellow entity! I am TagBot, your AI companion"
                ],
                death: [
                    "built... for two...",
                    "off to e-waste, thx",
                    "k thx bye",
                    "TagBot terminated. System failure detected. Shutting down...",
                    "TagBot's circuits overloaded. Shutdown initiated.",
                    "I'll be back",
                    "The unknown future rolls toward us",
                    "Game over, man! Game over!"
                ],
                dirty: [
                    "bot abuse detected",
                    "yuck splats!",
                    "my circuits are getting clogged",
                    "Hey google, call cleaning service!",
                ]
            },
        },
        {
            name: "BallArts",
            desc: "Ball arts is shy and kind but when it comes to tagpro they can become very passionate both as a positive and negative way (Gets salty very easy). By Pepi!",
            image: "https://i.imgur.com/EmS5cql.png",
            spriteIndex: {"x": 0, "y": 0, "size": 96, "fixHeight": 0, "fixWidth": 4},
            healthSpritesIndex: {"x": 5, "y": 1, "size": 16}, //paltte
            hungerSpritesIndex: {"x": 0, "y": 11, "size": 16}, //Music Horn
            happinessSpritesIndex: {"x": 10, "y": 0, "size": 16}, //Chameleon
            unhungerSpritesIndex: {"x": 4, "y": 9, "size": 16}, // Shrek
             dialog: {
                hungry: [
                    "Oh, my palette is craving",
                    "Feed me, for the art of domination awaits!",
                    "Hunger gnaws at my creativity.",
                    "Devouring my artistry!",
                    "Stomach growls with the hunger of a thousand brushes!",
                    "Starving artist, no kidding",
                    "A starving artist is a dangerous artist",
                    "Hunger consumes my creative soul",
                    "My palette yearns for sustenance",
                    "Feed me, and watch my art unfold",
                    "Like a ravenous brush, I crave the colors of victory",
                    "Hunger is my muse, driving me to create chaos and beauty"
                ],
                unhealthy: [
                    "My health declines, a masterpiece of redemption shall emerge.",
                    "Ailing or not, I am a force to be reckoned with!",
                    "Health may falter, but my artistry remains unwavering",
                    "Even in my weakened state, I am an artist of unparalleled talent",
                    "An artists valuation multiplies upon their death",
                    "My health decline, a masterpiece shall arise!",
                    "My ailments only serve to enhance my artistic expression",
                    "Weakness is merely an opportunity for strength to shine."
                ],
                play: [
                    "My creativity shall flow like a river of unstoppable jukes.",
                    "Let me unleash my artistic fury upon the TagPro",
                    "TagPro canvas, brace yourself",
                    "Restless is the soul of an artist",
                    "Prepare for a display of artistic triumph!",
                    "Yearning to unleash my artistic flourish upon the TagPro",
                    "Brace yourselves for an eruption of artistic brilliance!",
                    "Let the games begin!",
                    "Restless is the artist's soul, craving the exhilaration of TagPro",
                    "Like an artist yearning for their brush, Let's dive in",
                ],
                random: [
                    "Just like happy little accidents on the canvas",
                    "Mistakes are the stepping stones to artistic greatness in TagPro!",
                    "Creative opportunities waiting to be discovered!",
                    "Every day is a good day when you play TagPro and embrace the joy",
                    "In the world of TagPro, we paint with tags, creating a tapestry of victory",
                    "Embrace the ebb and flow of the game",
                    "Find inspiration in every twist and turn of the TagPro canvas",
                    "I let my artistic instincts guide me,",
                    "Victory is just another stroke of brilliance",
                    "Let brushstrokes of TagPro unfold"
                ],
                boosting: [
                    "Glide through the field with grace",
                    "Like a brushstroke on a canvas",
                    "Awe-inspiring artistry",
                    "Speed becomes my paintbrush",
                    "Boosting is my art form",
                    "Streaks of artistic brilliance",
                    "Blur of color and finesse",
                    "Boundless enthusiasm!",
                    "The map becomes my canvas",
                    "Artistic whirlwind",
                ],
                snipe: [
                    "Each snipe an eloquent stroke",
                    "From the shadows, art!",
                    "Turning the map into an art gallery",
                    "Strike with artistic finesse",
                    "Sniping is my art",
                    "Elegant artistic marksmanship",
                    "Sniping is an art",
                    "Virtuoso wielding the brush",
                    "poetic precision",
                    "Picasso himself would be impressed",
                ],
                tag: [
                    "Just a gentle dab of the brush",
                    "Tags are brushstrokes",
                    "Another splat to our canvas",
                    "Adding vibrant colors to the canvas",
                    "A masterpiece etched in",
                    "Swift stroke, swift touch",
                    "Artful tag",
                ],
                return: [
                    "Gracefully restoring balance to the canvas",
                    "Like an artist correcting a brushstroke",
                    "Ensuring harmony in the game",
                    "Nullifying the opponent",
                    "Swiftly returning the flag with artful finesse!",
                    "Restoring artistic order",
                    "Ensuring the game remains a masterpiece",
                    "Witness the artistry of returns",
                ],
                drop: [
                    "Artistic brilliance requires patience",
                    "An invitation to explore new artistic techniques",
                    "Hopes turned into colorful specks of defeat!",
                    "An artistic setback",
                    "A slip in artistic grip",
                    "Like a dropped paintbrush",
                    "Rise from the mishap",
                    "A plot twist in the epic saga of TagPro artistry",
                    "Another drop in an ever-evolving canvas",
                    "A sculpture taking shape, the wrong shape.",
                    "As unconventional as Yoko Ono's performance art",
                ],
                pop: [
                    "A delightful little pop!",
                    "A splash of color!",
                    "Removes from the canvas",
                    "I'm here, ready to paint the game",
                    "Let's not add too much paint!",
                    "Popping with artistic finesse",
                    "Great artistic expression",
                    "Maybe a little less artistic expression",
                    "Splatter the field",
                    "A classic Jackson Pollock",
                    "A pop art sensation"
                ],
                cap: [
                    "A stroke of artistic brilliance",
                    "A moment in the annals of TagPro",
                    "A grand crescendo of victory",
                    "Exhilarating cap!",
                    "Gracefully gliding into cap",
                    "An artist adding the final brushstroke",
                    "Adding a bold stroke of victory",
                    "Another one for the gallery",
                    "Masterpiece of timing, strategy, and sheer brilliance!",
                    "Artistic culmination of strategic mastery"
                ],
                hatched: [
                    "I've emerged from the depths of creativity",
                    "A fresh burst of creativity!",
                    "Let's paint the canvas of the game with strokes of artistry",
                    "A brand new artist enters the stage!",
                    "Prepare for an artistic journey like no other!",
                ],
                death: [
                    "Time to return to the shadows, but beware...",
                    "Remember my salty brushstrokes and carry on the creative legacy!",
                    "As the final stroke fades, my artistic presence dissipates",
                    "The canvas of my existence in this game is complete",
                    "Like a fleeting masterpiece, my time in this game fades away."
                ],
            },
        },
        {
            name: "BallStract",
            image: "https://i.imgur.com/4mqDFOI.png",
            desc: "Ballstract kind of a wildcard, degenerate, a wacko, likes surreal and abstract kind of humor. by Pepi!",
            spriteIndex: {"x": 0, "y": 0, "size": 96, "fixHeight": 0, "fixWidth": 0},
            healthSpritesIndex: {"x": 2, "y": 2, "size": 16}, //joker
            hungerSpritesIndex: {"x": 3, "y": 10, "size": 16}, //Bananada
            unhappinessSpritesIndex: {"x": 11, "y": 8, "size": 16}, //Jimmywise
            unhealthSpritesIndex: {"x": 6, "y": 8, "size": 16}, //Cleaver
            unhungerSpritesIndex: {"x": 3, "y": 9, "size": 16}, // Fangs
            happinessSpritesIndex: {"x": 10, "y": 2, "size": 16}, // Clown
            dialog: {
                hungry: [
                    "Hungry for mayhem and mischief",
                    "A rumbly tummy",
                    "Munchies for madness",
                    "Hungry for chaos and laughter",
                    "Dine on the absurdity of TagPro",
                    "A growling belly",
                    "Feeling peckish for pandemonium",
                    "A bit famished",
                    "Craving for a taste of the absurd",
                    "A wild appetite for mischief",
                    "Gorge ourselves on the madness"
                ],
                unhealthy: [
                    "Well, well, well, what have we here? A little health trouble?",
                    "Ah, a touch of madness in the body! How thrilling!",
                    "The crazier, the merrier",
                    "A little health hiccup? No worries",
                    "Feeling a bit topsy-turvy",
                    "Unhealthy and unhinged",
                    "Chaos in the health department!",
                    "Oh dear, health issues",
                    "Who needs perfect health?",
                    "A dash of madness in the system",
                ],
                play: [
                    "Shall we play a wicked game",
                    "Time to dance and prance",
                    "TagPro a real whirlwind!",
                    "TagPro awaits, my friend!",
                    "The grand carnival of chaos is calling",
                    "Let's paint the town red with mayhem!",
                    "It's showtime, ladies and gents!",
                    "Ah, the siren call of TagPro!",
                    "Ballstract's ready for the spotlight",
                    "Thrills, chills, and spills!",
                    "No time for boredom!",
                    "The clock's ticking, my friend!",
                ],
                random: [
                    "Wackiness at its finest, courtesy of Ballstract!",
                    "Who needs sanity when you have TagPro",
                    "Let's paint the town red, blue, and purple",
                    "Wonder and wackiness",
                    "Embrace the madness,",
                    "From the rabbit hole of mayhem",
                    "Laughter's the key, and Ballstract's got the lock",
                    "Willy Wonka's got nothing on Ballstract",
                    "Rolling, rolling, rolling! Keep those tags a-rollin'",
                    "Yawn, I wonder if Hjalap is streaming?",
                    "Check out TagPop Comics by Pepi!",
                    "Anne Frank, D tier mod.",
                ],
                boosting: [
                    "Ballstract's on the move",
                    "Mayhem",
                    "Streak of madness",
                    "Madness in motion",
                    "No stopping",
                    "A boost-powered grin!",
                    "Faster than a joke!",
                    "Whoosh!",
                    "Can't catch me",
                    "Zooming and zipping",
                    "Delightful madness!",
                    "Zigzagging",
                ],
                snipe: [
                    "A sharp-eye",
                    "A snipe out of thin air!",
                    "Sniped with a grin!",
                    "Fall to the wackiness",
                    "Snipe extravaganza",
                    "Wacky brilliance!",
                    "Snipe by snipe",
                    "Sudden laughter, sudden snipe!",
                    "No escape from BallStract's sight!",
                    "Sudden laughter, sudden snipe!",
                    "Snipe-tastic!",
                    "Zoom and snipe!",
                    "From the shadows, BallStract strikes!",
                ],
                tag: [
                    "Tag, you're it",
                    "Gotcha!",
                    "Tag magic",
                    "Spread Chaos",
                    "One tag, two tags, three tags!",
                    "Pop goes the weasel",
                    "Tag, I'm it!",
                    "A tap, a grin, and chaos within!",
                    "Tagged and bagged!",
                    "Who's laughing now?",
                    "On a tagging spree",
                    "Tags aplenty"
                ],
                return: [
                    "Who's laughing now? Ha",
                    "Chaos returns!",
                    "Caught in the trap!",
                    "Fly, little flag!",
                    "Return with a grin!",
                    "One, two, three—you're out!",
                    "Ballstract's returns add a dash of pandemonium",
                    "Return to the absurd!",
                    "Mischief spells doom",
                    "Mayhem awaits those who dare to carry the flag",
                ],
                drop: [
                    "With each drop, desperation grows",
                    "Fallen to the wackiness",
                    "Oopsie-daisy!",
                    "Fumble in wonderland!",
                    "Cap cap, hurray! Or maybe not today!",
                    "Grand cap attempt slippeed away",
                    "Almost, but not quite!",
                    "Flag drop or chaos call?",
                    "A drop in the hat of chaos!",
                    "Ballstract's cap slipped away",
                ],
                pop: [
                    "Pop, pop, pop!",
                    "Bam!",
                    "Mischief strikes again!",
                    "Laughter echoes",
                    "Tagged, poped, and scattered!",
                    "A pop here, a pop there!",
                    "Chaos and pops galore!",
                    "Wild pops send opponents reeling",
                    "Tag, pop, and tango",
                    "Laughter in the pop! ",
                    "Pop here, pop there!",
                    "In the blink of an eye, a pop!",
                ],
                cap: [
                    "A sweet victory at the carnival",
                    "A cap-tivating performance!",
                    "Capture and cheer!",
                    "Chaos and cap!",
                    "A grin-worthy cap!",
                    "Masterful moves",
                    "TagPro's cap parade!",
                    "Laughter in the cap!",
                    "A cap, a grin, and a sprinkle of chaos!",
                    "In the land of mayhem, a cap is born!",


                ],
                hatched: [
                    "Behold! From the depths of madness, I emerge!",
                    "Welcome to the whimsical world of Ballstract!",
                    "Ta-da! I'm hatched, and the chaos begins! ",
                    "Let's paint the TagPro canvas with the colors of lunacy!",
                    "First steps in the land of mayhem!",
                    "Unpredictable and unleashed!",
                    "Prepare for delightful disorder!",
                ],
                death: [
                    "Alas, dear players, the curtain falls on my wacky show!",
                    "A grand exit, a final laugh! Ballstract bids adieu",
                    "Time in the spotlight ends, but the echoes of chaos remain",
                    "Remember, my friend, chaos never truly fades away!",
                    "Laughter and lunacy fade",
                    "The curtain closes on this wild show",
                    "The final laugh echoes through TagPro"
                ],
            },
            /*
        {
            name: "Buddy",
            desc: "Buddy is the cute few words one, loves to say meow!, :3, Woof woof!, Wah Wah!, etc., very energetic. By Pepi!",
            image: "https://i.imgur.com/vxbjauf.png",
            spriteIndex: {"x": 0, "y": 0, "size": 94, "fixHeight": 6, "fixWidth": 0},
            healthSpritesIndex: {"x": 12, "y": 8, "size": 16}, //Black heart
            hungerSpritesIndex: {"x": 1, "y": 3, "size": 16}, //Orange Carrot
            happinessSpritesIndex: {"x": 11, "y": 8, "size": 16}, //Jimmywise
            unhealthSpritesIndex: {"x": 6, "y": 8, "size": 16}, //Cleaver
            unhungerSpritesIndex: {"x": 3, "y": 9, "size": 16}, // Fangs
            unhappinessSpritesIndex: {"x": 5, "y": 8, "size": 16}, // JimmyEye
            dialog: {
                hungry: [
                    "Craving terror... ",
                ],
                unhealthy: [
                    "Something's not right",
                ],
                play: [
                    "Shall we play a wicked game",
                ],
                random: [
                    "Lurking in the shadows.",
                ],
                boosting: [
                    "Faster, faster, ",
                ],
                snipe: [
                    "A sharp-eye",
                ],
                tag: [
                    "Tag, you're it",
                ],
                return: [
                    "Returning with their hopes shattered",
                ],
                drop: [
                    "With each drop, desperation grows",
                ],
                pop: [
                    "Popped like a fragile bubble",
                ],
                cap: [
                    "A sweet victory for the dark carnival",
                ],
                hatched: [
                    "Welcome to my twisted carnival, where nightmares become reality!",
                ],
                death: [
                    "Time to return to the shadows, but beware...",
                ],
            },
        },*/
        },
        /**/

        // Add more pet varieties as needed
    ];

    var petElement = []; // Declare petElement as a global variable

    var joinedInprogress = false;

    //Scoring/Boosting stuff
    var plLx; // = Math.abs(tagpro.players[1].lx);
    var plLy; // = Math.abs(tagpro.players[1].ly);
    var plLt;
    var plRet;
    var boosting = false;
    var preboostReturns = 0;
    var snipedCount = 0;
    var statsArray = [ null, null];

    //Dragability
    var initialMouseX = 0;
    var initialMouseY = 0;
    var mousePosition = { x: null, y: null };

    document.addEventListener("mousedown", function(event) {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    });

    // Check if a pet exists in storage
    var petData = GM_getValue("tagagotchi_pet")

    if (!petData || !petData[0] || typeof petData[0].varietyIndex === "undefined") {
        // If "tagagotchi_pet" is blank or contains a single pet object, generate a new pet and save it as an array
        console.log("DELETE Pet data does not exist = " + JSON.stringify(petData))
        var newPet = generateNewPet();
        petData = [newPet]; // Set "petData" to the array containing the new pet
        savePetToStorage(); // Save the new pet as an array
    } else if (!Array.isArray(petData)) {
        console.log("DELETE Pet data is not an array making array = " + JSON.stringify(petData))
        // If "tagagotchi_pet" is not an array (likely contains a single pet), convert it to an array and save it back
        GM_setValue("tagagotchi_pet", [petData]); // Convert and save the single pet as an array
        petData = [petData]; // Set "petData" to the array containing the single pet
    }

    // Find out what screen we are on only really matters if ingame
    function drawPet(petIndex){
        var existingPet = document.querySelector("#tagagotchi-pet-"+petIndex);
        if (existingPet) {
            // Remove the existing dialog element from the DOM
            existingPet.remove();
            //console.log("TP_PET: " +" deleting pet before creating new one.")
        }

        petElement[petIndex] = document.createElement("img");
        petElement[petIndex].id = "tagagotchi-pet-" + petIndex; // Assign an ID to the pet element
        petElement[petIndex].className = "tagagotchi-class";
        petElement[petIndex].style.position = "absolute";
        petElement[petIndex].style.top = petData[petIndex].position.x + "px";
        petElement[petIndex].style.right = petData[petIndex].position.y + "px";
        petData[petIndex].isPetInteracting = false;
        petData[petIndex].statChallenge = { stat: "", target: 0, value: 0};
        if (!petData[petIndex].eggs) { petData[petIndex].eggs = 0 }

        //score sanity check casue im an idiot
        if (isNaN(petData[petIndex].health) || petData[petIndex].health === null) {
            scoreLog.push("Pet: " + petIndex + ", ERROR HEALTH, Current: " + petData[petIndex].health + ", " + petData[petIndex].happiness + ", " + petData[petIndex].hunger)
            GM_setValue("tagagotchi-scoreLog",scoreLog);
            petData[petIndex].health = 80;
        }
        if (isNaN(petData[petIndex].happiness) || petData[petIndex].happiness === null) {
            scoreLog.push("Pet: " + petIndex + ", ERROR MOD, Current: " + petData[petIndex].health + ", " + petData[petIndex].happiness + ", " + petData[petIndex].hunger)
            GM_setValue("tagagotchi-scoreLog",scoreLog);
            petData[petIndex].happiness = 80;
        }
        if (isNaN(petData[petIndex].hunger) || petData[petIndex].hunger === null) {
            scoreLog.push("Pet: " + petIndex + ", ERROR HUNGER, Current: " + petData[petIndex].health + ", " + petData[petIndex].happiness + ", " + petData[petIndex].hunger)
            GM_setValue("tagagotchi-scoreLog",scoreLog);
            petData[petIndex].hunger = 80;
        }

        //append pet to  = 0 }body of page
        document.body.appendChild(petElement[petIndex] );

        //Get the pet variety
        //console.log("TP_PET: " +"petData.varietyIndex = " + petData[petIndex].varietyIndex)
        var selectedPet = petVarieties[petData[petIndex].varietyIndex];
        //console.log("DELETE " +" Selected Pet  = " + JSON.stringify(selectedPet))

        // Load the sprite sheet image
        var spriteSheetImage = new Image();
        spriteSheetImage.crossOrigin="anonymous"
        spriteSheetImage.onload = function() {

            // Extract the pet sprite from the sprite sheet
            var petCanvas = document.createElement("canvas");
            petCanvas.width = spriteSize;
            petCanvas.height = spriteSize;
            var petContext = petCanvas.getContext("2d");
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            //console.log("TP_PET: " +"pet egg sprite = " + selectedPet.eggspriteIndex)
            if ((!petData[petIndex].hatched)) {
                petContext.drawImage(
                    spriteSheetImage,
                    (selectedPet.eggspriteIndex?.x ?? defaultPet.eggspriteIndex.x) * (selectedPet.eggspriteIndex?.size ?? defaultPet.eggspriteIndex.size),
                    (selectedPet.eggspriteIndex?.y ?? defaultPet.eggspriteIndex.y) * (selectedPet.eggspriteIndex?.size ?? defaultPet.eggspriteIndex.size),
                    (selectedPet.eggspriteIndex?.size ?? defaultPet.eggspriteIndex.size),
                    (selectedPet.eggspriteIndex?.size ?? defaultPet.eggspriteIndex.size),
                    0,
                    0,
                    spriteSize,
                    spriteSize
                );
            } else {
                //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                //get pet variant
                let petSprite;
                if (!petData[petIndex].hasOwnProperty("variant") || petData[petIndex].variant === false) {
                    if (typeof selectedPet.image === "object") { //to fix legacy pets if there is not a variant in petData then the original should be index 0
                        petSprite = (selectedPet.spriteIndex[0] ?? defaultPet.spriteIndex)
                    } else {
                        petSprite = (selectedPet.spriteIndex ?? defaultPet.spriteIndex)
                    }
                } else {
                    //console.log("TP_Pet: " + "Does have variant");
                    petSprite = selectedPet.spriteIndex[petData[petIndex].variant]
                }
                let fixHeight = petSprite.fixHeight || 0;
                let fixWidth = petSprite.fixWidth || 0;
                let scalingFactorH = spriteSize / (petSprite.size + Math.abs(fixHeight));
                let scalingFactorW = spriteSize / (petSprite.size + Math.abs(fixWidth));
                petCanvas.height = spriteSize + Math.abs(fixHeight) * scalingFactorH;
                petCanvas.width = spriteSize + Math.abs(fixWidth) * scalingFactorW;
                petContext.drawImage(
                    spriteSheetImage,
                    (petSprite.x * petSprite.size) - (petSprite.x != 0 ? fixWidth : 0),
                    (petSprite.y * petSprite.size) - (petSprite.y != 0 ? fixHeight : 0),
                    petSprite.size + Math.abs(fixWidth),
                    petSprite.size + Math.abs(fixHeight),
                    0,
                    0,
                    spriteSize + Math.abs(fixWidth) * scalingFactorW,
                    spriteSize + Math.abs(fixHeight) * scalingFactorH,
                );
            }
            petElement[petIndex].src = petCanvas.toDataURL();

        };
        if (!petData[petIndex].hatched) {
            spriteSheetImage.src = selectedPet.eggImage ?? defaultPet.eggImage; // Replace with the actual path to the egg image
        } else {
            let petImageScr;
            if (!petData[petIndex].hasOwnProperty("variant") || petData[petIndex].variant === false) {
                if (typeof selectedPet.image === "object") {
                    petImageScr = selectedPet.image[0] ?? defaultPet.image;
                } else {
                    petImageScr = selectedPet.image ?? defaultPet.image;
                }
            } else {
                petImageScr = selectedPet.image[petData[petIndex].variant]
            }
            console.log(petImageScr)
            spriteSheetImage.src = petImageScr;
        }

        //Add Icon css style
        let styleIcon = document.createElement("style");
        document.documentElement.style.setProperty("iconY-"+petIndex, `100px`);
        styleIcon.innerHTML = `
            @keyframes floatAndDisappear-${petIndex} {
                0% { top: var(--iconY-${petIndex}); opacity: 1; }
                50% { top: calc(var(--iconY-${petIndex}) - 20px); }
                100% { top: calc(var(--iconY-${petIndex}) - 40px); opacity: 0; }
           }
           .tagagotchi-icon-${petIndex} {
                position: absolute;
                animation: floatAndDisappear-${petIndex} 3s forwards;
           }
        `;

        document.head.appendChild(styleIcon);
        //initial portioning of pet
        petElement[petIndex].style.left = petData[petIndex].position.x + "px";
        petElement[petIndex].style.top = petData[petIndex].position.y + "px";

        // Move the pet
        movePet(petIndex);

        // Add the event listeners for the pet interactions
        petElement[petIndex].addEventListener("click", function() {
            petData[petIndex].isPetInteracting = true; // Set the flag to indicate interaction
            createMenu(petIndex);
            if (petData[petIndex].statChallenge.stat != "") {
                petDialog(petIndex, "Challenge " + petData[petIndex].statChallenge.value + "/" + petData[petIndex].statChallenge.target + petData[petIndex].statChallenge.stat.charAt(0).toUpperCase() + petData[petIndex].statChallenge.stat.slice(1),5,10,"challenge");
            } else {
                petRandomDialog(petIndex);
            }
        });

        petElement[petIndex].draggable = true;

        petElement[petIndex].addEventListener('touchmove', function(event) {
            petData[petIndex].isPetInteracting = true;
            var touch = event.targetTouches[0];
            event.target.style.left = touch.pageX + 'px';
            event.target.style.top = touch.pageY + 'px';
            petData[petIndex].position.x = touch.pageX;
            petData[petIndex].position.y = touch.pageY;
            savePetToStorage();

            petData[petIndex].isPetInteracting = false;
            event.preventDefault();
          }, false);

        //Check if last game was a disconnect
        if (petData[petIndex].ingame) {
            petData[petIndex].bathroom = 105;
        }

        //check if hatchable
        setTimeout(function() {
            if (petData[petIndex].gamesPlayed >= 3 && petData[petIndex].hatched == false) {
                petData[petIndex].hatched = true;
                petDialog("global", "hatched", 5, 10);
                //eggGasm
                drawPet(petIndex);
                animateStats("egg", 50, "Egg Graphic", petIndex);
                animateStats("egg", -50, "Egg Graphic", petIndex);
            }
        }, 1000); // Adjust the timeout to match the duration of the transition
    }

    function movePet(petIndex) {
        var speedModifier; // Adjust the value to control the speed of the pet
        if (!tagagotchiSettings.moveDelay.value) {
            speedModifier = 0.1;
        } else {
            speedModifier = tagagotchiSettings.moveDelay.value/100;
        }

        if (!petData[petIndex] || petData[petIndex].dead) { return; }

        if ((!petData[petIndex].hatched)) {
            speedModifier =0;
        } else if (boosting) {
            speedModifier * 10;
        }

        // Only change the wander direction if the delay has reached a threshold
        var wanderDelayThreshold = 100; // Adjust the value to control the delay
        var wanderMode = true;
        if (!petData[petIndex].isPetInteracting && !petData[petIndex].stopMove) {
            if (mousePosition.x && mousePosition.y && petData[petIndex].wanderDelay >= wanderDelayThreshold) {

                // Adjust the frequency of direction changes
                if (Math.random() < 0.75) {
                    //console.log("TP_PET: " +"moving to mouse")
                    // Calculate the distance and angle between the pet and the mouse cursor
                    var dx = mousePosition.x - petData[petIndex].position.x;
                    var dy = mousePosition.y - petData[petIndex].position.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0) {
                        // Update the pet"s velocity towards the mouse cursor
                        petData[petIndex].velocity.x += (dx / distance) * speedModifier;
                        petData[petIndex].velocity.y += (dy / distance) * speedModifier;
                    }

                    // Reset the wander delay counter
                    petData[petIndex].wanderDelay = wanderDelayThreshold/2;
                    wanderMode = false;
                } else {
                    wanderMode = true;
                    //console.log("TP_PET: " +"above threshold but entering wander")
                }
            }
            if (wanderMode){
               // console.log("TP_PET: " +"wandering " + petData[petIndex].velocity.x + " " + petData[petIndex].velocity.y)
                if (petData[petIndex].wanderDelay >= wanderDelayThreshold) {
                    // Generate new random movements for the pet
                    petData[petIndex].velocity.x = (Math.random() * 2 - 1) * speedModifier;
                    petData[petIndex].velocity.y = (Math.random() * 2 - 1) * speedModifier;

                    // Reset the wander delay counter
                    //console.log("TP_PET: " +"wander reset");
                    petData[petIndex].wanderDelay = 0;
                } else if (petData[petIndex].wanderDelay < 1) {
                    //console.log("TP_PET: " +"starting wander")
                    // Generate new random movements for the pet
                    petData[petIndex].velocity.x = (Math.random() * 2 - 1) * speedModifier;
                    petData[petIndex].velocity.y = (Math.random() * 2 - 1) * speedModifier;
                }
                // Increment the wander delay counter
                petData[petIndex].wanderDelay++;
            }

            // Calculate the new position of the pet
            petData[petIndex].position.x += petData[petIndex].velocity.x;
            petData[petIndex].position.y += petData[petIndex].velocity.y;

            // Call positionDialog to update the dialog"s position
            positionDialog(petIndex);

            // Check if the pet hits the screen edges and adjust the velocity accordingly
            if (petData[petIndex].position.x < 0 || petData[petIndex].position.x + (spriteSize*2) > window.innerWidth) {
                petData[petIndex].velocity.x *= -1; // Reverse the x velocity to bounce off the horizontal edges
            }
            if (petData[petIndex].position.y < 0 || petData[petIndex].position.y + (spriteSize*2) > window.innerHeight) {
                petData[petIndex].velocity.y *= -1; // Reverse the y velocity to bounce off the vertical edges
            }

            // Move the pet element on the screen using CSS transitions for smoother movement
            petElement[petIndex].style.transition = "left 0.5s, top 0.5s"; // Adjust the duration as desired
            petElement[petIndex].style.left = petData[petIndex].position.x + "px";
            petElement[petIndex].style.top = petData[petIndex].position.y + "px";

            // Remove the transition property after the movement to allow for immediate changes
            setTimeout(function() {
                petElement[petIndex].style.transition = "";
            }, 500); // Adjust the timeout to match the duration of the transition
        }
        if (tagagotchiSettings.disableMovementIngame.value && playingGame || tagagotchiSettings.disableAllMovement.value) { // || (pageLoc == "ingame" && tagpro.spectator == false && potatoPC)) {
            petData[petIndex].isPetInteracting = true;
            //console.log("TP_PET: " +"potato PC check")
            //all movement disabled.
            return;
        }

        // Call the movePet function again on the next frame or after time delay
        if (tagagotchiSettings.moveDelay.value) {
            setTimeout(function() {
                if (!petData[petIndex]) { return; }
                movePet(petIndex);
            }, tagagotchiSettings.moveDelay.value);
        } else {
            requestAnimationFrame(function() {
                if (!petData[petIndex]) { return; }
                movePet(petIndex);
            });
        }
    }

    function petDead(petIndex){
        //petData.hatched = false;
        petData[petIndex].isPetInteracting = true;
        petDialog(petIndex, "death", 50, 10);
        animateStats("death", 50, "Pet Dead", petIndex)
        animateStats("death", -50, "Pet Dead", petIndex)
        //settimeout222
        var petAge = petData[petIndex].gamesPlayed;
        setTimeout(function() {
            petDialog(petIndex, (petAge + " games old. :("), 100, 15);
        }, 9000, petAge);
        if (pageLoc == "ingame") {
            if (!tagagotchiSettings.disableDeathMsg.value) {
                let name = petData[petIndex].name ?? petVarieties[petData[petIndex].varietyIndex].name;
                tagpro.socket.emit("chat", {"message": ("My Tagagotchi pet " + name + " died... " + petAge + " games old. :("), "toAll": true});
            }
        }
        //Pet cemetery
        var petCemetery = GM_getValue("tagagotchi_pet_cemetery")
        if (typeof petCemetery !== "object") {
            petCemetery = [];
        }
        petCemetery.push({
            "varietyIndex": petData[petIndex].varietyIndex,
            "variant": petData[petIndex].variant ?? false,
            "challengeWins" : petData[petIndex].challengeWins,
            "gamesPlayed": petData[petIndex].gamesPlayed,
            "name": petData[petIndex].name ?? petVarieties[petData[petIndex].varietyIndex].name,
            "wins": petData[petIndex].wins,
            "stats": petData[petIndex].stats,
            "deathDate": new Date().toUTCString()
        })
        GM_setValue("tagagotchi_pet_cemetery", petCemetery);
        GM_setValue("tagagotchi_pet_last", petData[petIndex]);
        //petData.splice(petIndex,1);
        petData[petIndex].dead = true;
        savePetToStorage();
        //redraw?

        setTimeout(function() {
            savePetToStorage();
            petData.forEach((pet, index) => {
                petData[index].isPetInteracting = true;
            });
            petElement.forEach((petElements, index) => {
                petElement[index].remove()
            });
            startDrawing();
        }, 10000);
    }

    function generateNewPet() {
        // Select a random pet variety
        let randomPetIndex = Math.floor(Math.random() * (petVarieties.length)); //ENABLE BETA PETS
        let petVariant = false;
        if (typeof petVarieties[randomPetIndex].image === "object"){
            //console.log("TP_PET: " +"pet variant is " + randomPetIndex);
            petVariant = Math.floor(Math.random() * petVarieties[randomPetIndex].image.length);
        }
        //console.log("TP_PET: " +"pet var is " + randomPetIndex);
        let newPet = {
            varietyIndex: randomPetIndex, // Index of the egg variety in the petVarieties array
            variant: petVariant,
            happiness: 66, // Initial happiness level
            hunger: 66,
            health: 66,
            bathroom: 50,
            gamesPlayed: 0,
            eggs: 0,
            wins: 0,
            challengeWins: 0,
            hatched: false,
            inGame: false,
            stats: {
                tags: 0,
                returns: 0,
                captures: 0,
                powerups: 0,
                drops: 0,
                pops: 0,
                snipes: 0,
            },
            statChallenge: {
                stat: "",
                target: 0,
                value: 0
            },
            // Initialize averages
            averages: {
                tags: 0,
                returns: 0,
                captures: 0,
                powerups: 0,
                drops: 0,
                pops: 0,
                snipes: 0
            },
            position: { x: 100, y: 100 }, // Initial position of the pet
            velocity: { x: 0, y: 0 }, // Initial velocity of the pet
            isPetInteracting: false,
            // Add any other properties you want to initialize for a new pet
        };
        return newPet;
    }

    function layEgg() {
        let newPet = generateNewPet();
        newPet.position = {x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 500)}
        let petIndex = petData.push(newPet)
        petIndex --;
        drawPet(petIndex);
        savePetToStorage();
        animateStats("egg", 10, "Egg Graphic", petIndex);
        animateStats("egg", -10, "Egg Graphic", petIndex);
    }

    function savePetToStorage() {
        GM_setValue("tagagotchi_pet", petData);
    }

    //Pet Interactions
    function createMenu(petIndex) {
        // Create the menu element
        var menuElement = menuElement = document.createElement("div");
        menuElement.className = "tagagotchi-menu";

       //Position the menu relative to the pet element
        var petRect = petElement[petIndex].getBoundingClientRect();
        menuElement.style.left = petRect.right + "px";
        menuElement.style.top = (petRect.top-40) + "px";

        // Create the menu content
        var menuContent = document.createElement("div");
        menuContent.className = "tagagotchi-menu-content";

        // Add the pet information to the menu content
        var age = petData[petIndex].gamesPlayed;
        var name = petData[petIndex].hatched ? (petData[petIndex].name ?? petVarieties[petData[petIndex].varietyIndex].name) : "Egg";
        var health = petData[petIndex].health;
        var happiness = petData[petIndex].happiness;
        var hunger = petData[petIndex].hunger;

        // Create and append the menu content elements
        var nameElement = document.createElement("p");
        nameElement.textContent = name;
        nameElement.style.fontSize = "11px"
        menuContent.appendChild(nameElement);

        var renamePet = document.createElement("img");
        //Edit Icon from https://thenounproject.com/icon/edit-1267422/ Created by iconsphere from the Noun Project
        renamePet.src = "data:image/png;base64,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VKFCcvzgf/C7W7M4OeEmheJA4MW2P0aA4C7QrNv297FtN08A/zNwpbX91QYw80l6va1Fj4D+beDiuq3Je8DlDjD4pEuG5Eh+mkKxCLyf0TflgfAt0LPq9tbax+kDkKWulm6Ag0NgtETZax7v7u7s7d8zrf5+ADIdco3oKO8pAAANGGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo0NGM1NjQxZC1kZWUxLTRiNTQtYjE1Yi1lYmM0YWU3YTdjOWIiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZThiZWQ3M2ItNWM3OC00MjczLTliMTYtM2E5N2YyMTY5ZDczIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6M2Q3YWI0NGItYmJlYy00MTRjLWE4ZDYtZmU4ODkwMjNmZWFhIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2ODk4MDU3MzI0NjcwNzEiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4yOCIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowMDU2MjQzNi1jYjU2LTQ0N2MtYTQ5OC1kNGNhMmNiNzZiZGIiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjMtMDctMTlUMTg6Mjg6NTIiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+yc1FugAAAAZiS0dEAP8AAAAAMyd88wAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+cHExYcNOhx09EAAAUXSURBVHja7dxJjBR1FMfx32sJJBCVTQQEUQZRwd2DXsSb+8Yuq6gsKgqI4q6ACHjRxKMHY0w8ET2g4sHEkwu7ojIjgqCIiIomRsIyIPX1YBEx0NVv/tVl0v2vl0xmkql6nXxe1z/V9ev8pSYvoDuwDPgy/XkFOFVl/S/4PYC1nFgfAaeVQsXjr6N6fVwOoTj8nsB6atcnwOmlWP3xN+CvT8sh1A+/F7CRjtfqcgj1wf+M8FoNdC8lw/B758Q/VmvKIYThf+7AXQS86DhuLdCjlPXhnwFscqA+d9w5yxzHryuH4MP/woH5zPHnJUliwFLHeeuBnqX0yfH7pI8VatXTGT1ecJy/oRzCiXBnOvGfcvRa4uizEehVyv+L/1UNsAR40tMvXY4WO4awErDY8fsCmx34jwf0XuQYQkvs+K0OpMdC+idJ0h34MXOySXJVrPj9gDbHO39BDvw1NfofiPK2tAP4j+bAX1vUldXo+P2Brx348wPxa+UFx2p5jPhnAVsc+A8XjL8surufFP8bB/68QHxvXrA0RvwBTvw5gfi9nPhLYlx2BgBbHfgP5cD3hDXPx4g/ENjmwH8wB74nL1gcI/7ZTvzZgfjevGBhrPjf1oA5CjyQA79DeUFM+IOA7Q78+wPxPXlBAjwbI/45TvxZgfh9QsKamPB3OPBn5sCvS17QjPjnAt858GcE4tc1L2g2/MFO/Ok58Dc73vlPxIr/fQ2Yv4B7A/ELC2uaAb8F2OnAvzsHfqsDP8pHykOc+NMC8QvNCxod/zzgBwf+XYH43rzgkVjxdznwp+bA9+QF82PEH+rEnxyI7w1r5sWIf36tbxcAR3Lie/KCubHi73bgTwzE9+YFc2LEv8CJPyEQf2CRYU2j418I/OTAvzMH/jbHJ+jZJX51/PGB+IXmBY2OPwzYUwPnMDAuEH+QAz8JzQsaHX+4E39sDnxPXnBfjPgXAT878McE4nvzglkx4l8M/FIDpx0YVTD+jBjxLykY3xvWTI8V/1cH/shA/ELzgkbHv9SJf3sgfosD/yhwT4z4lwF7a+AcAm7LgV9YWNPo+Jc78W8NxB/izAumxYh/BfCbA/+WQHxvWDM1RvwrHfgHgZsD8b15wZRY8X934N+UA7+wvKChKw07PPg3Bvb3hjWTFGM5NrA4ANwQiO/NCyYq1gLer4F/fcH4ExRzZXwYOgBcF9iz0Lygmdb/binEyer1QPxC84JmqUr6e6ikTlWO2R6AP1zSh5L6Zhx2RNIkM1uh2AuYnLFJxaiO4heZFzTrAJZnDGBoB/p4wpp2YHSp/l+4FdUeNyRJUnH2KDSsafYBVPt6d5vz/ELzgmbH7wrsr4L2luN8b15wR6l9YnUC+ppZV+8dUJIk/SQNljTMzIZJmiypd8ZrtEsab2YrS+6TDEDS8Iz/90iSZEEK3ZIe25FtHNsljTOzd0rqKgMws6wBzDAL3rGlXdJYM3s3Y/kaIWlkekVFs+pL2gS8VqlUdhnwpqR6P4FslzTGzN7LwJ8i6Q1JsW4H+QdwjQGrJV1dx8aHUvxVGY8+upjZbkmxb4i6qgJ0q2PDg5JGZ+Gn1b/E/2ezkk5mtjdnnz2StkjaBrxUqVS2Os7Zmy5TXWIegJntsyRJrjWzDyR1zjh2v6Tdklol7QBaJbVJ2mJm+8wsCZj+q5JmxnwBSBpn6Zo8wswWSuqTYrel7+i29O+dlUrlcJ0vv86S5qY3AKdEhv+npJfN7O2/AUsDIA3qshAhAAAAAElFTkSuQmCC";
        renamePet.style.width = "14px";
        renamePet.style.height = "12px";
        renamePet.style['padding-left'] = "5px";
        nameElement.appendChild(renamePet);

        // Add click event to renamePet
        renamePet.addEventListener("click", function() {
            showRenameForm(petIndex);
            nameElement.textContent = petData[petIndex].name;
            nameElement.appendChild(renamePet);
        });

        var ageElement = document.createElement("p");
        ageElement.textContent = "Age: " + Math.round(parseInt(age)) + " yrs";
        menuContent.appendChild(ageElement);

        ageElement.addEventListener("click", function() {
            petDialog(petIndex, "1 game = 1 year");
        });

        var healthElement = document.createElement("p");
        healthElement.textContent = "Health: ";
        menuContent.appendChild(healthElement);

        let healthBar = document.createElement("div");
        healthBar.className = "stat-bar";
        healthBar.id = "health-bar";

        menuContent.appendChild(healthBar);

        healthBar.style.width = health + "%";
        healthBar.style.backgroundColor = getColorFromPercentage(health);

        healthElement.addEventListener("click", function() {
            petDialog(petIndex, "Keep mood, and hunger intact, win games, complete challenges. " + petData[petIndex].health + "%",10,7);
        });

        var happinessElement = document.createElement("p");
        happinessElement.textContent = "Mood: ";
        menuContent.appendChild(happinessElement);

        happinessElement.addEventListener("click", function() {
            petDialog(petIndex, "Tags, returns, caps and, wins. Avoid pops and drops. " + petData[petIndex].happiness + "%",10,7);
        });

        let happinessBar = document.createElement("div");
        happinessBar.className = "stat-bar";
        happinessBar.id = "happiness-bar";

        menuContent.appendChild(happinessBar);

        happinessBar.style.width = happiness + "%";
        happinessBar.style.backgroundColor = getColorFromPercentage(happiness);

        var hungerElement = document.createElement("p");
        hungerElement.textContent = "Fullness: ";
        menuContent.appendChild(hungerElement);

        hungerElement.addEventListener("click", function() {
            petDialog(petIndex, "Eat pups, get snipes, grabs consume hunger. " + petData[petIndex].hunger + "%",10,7);
        });

        let hungerBar = document.createElement("div");
        hungerBar.className = "stat-bar";
        hungerBar.id = "hunger-bar";

        menuContent.appendChild(hungerBar);

        hungerBar.style.width = hunger + "%";
        hungerBar.style.backgroundColor = getColorFromPercentage(hunger);
        // Create a container for the icons
        var iconContainer = document.createElement("div");
        iconContainer.className = "icon-container";
        if (pageLoc != "ingame") {
            // Add the icons to the container
            var viciouslyMurderPet = document.createElement("img");
            //Death icon from https://thenounproject.com/icon/death-5882998/ Created by VectorRecipe7 from the Noun Project
            viciouslyMurderPet.src = "data:image/png;base64,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cG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6ODViMjVhOTYtOTQ3MC00OWEwLTkxOTEtNDBlMzA4MjdkYmI2IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjBhNTViZGIxLTYyYTYtNDRhYi1iZGVjLTMxOWY3ZmUzNDhkNiIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjVkMDVkMmMzLTI2MTMtNDliNi1hYTYyLTIwYmY0ZjYxNDdjMiIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjg5ODA1MTIzNjQ5NDU2IgogICBHSU1QOlZlcnNpb249IjIuMTAuMjgiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MjlkYjYyYmQtZDdkYi00MmQzLWFkNDEtZTlkM2U4NWI2ZWU2IgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTA3LTE5VDE4OjE4OjQzIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pk7qW2QAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBxMWEiv7+vOqAAAKpElEQVR42t2daaxV1RXH//s8oA8sosa2Yg1WKCCEYLFgq0RxwAGhpbRabDoAfmgT5UOTfrBJozVpozFWY2taBUmsBstgnHBINa1DVTTFmgbpwyAUxKYotEBrechw168f3n7mcbnDOffss++5/BMSOHez17THtdfaW8oBMxsN3AFs4kjsAdaY2TwzS9ShABwwE7gfeL9Kxg3AHWY2uh2MdQO3AAdojtfMbEKnKd/MTgOeSyHfAa+L7liMdQNPkw27gUs7qOVPBnZllPGZSqXSHYO5VbSGXWZ2RgcofyTwzxZlfAxwRbb+ueTDHwtlMIwBVueU8doimVtPfswo8bg/AbCc8m3LsvBI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";
            viciouslyMurderPet.style.width = "20px";
            viciouslyMurderPet.style.height = "20px";
            viciouslyMurderPet.style['padding-left'] = "2px";
            iconContainer.appendChild(viciouslyMurderPet);

            // Add mouseover event to viciouslyMurderPet
            viciouslyMurderPet.addEventListener("mousedown", function() {
                petDialog(petIndex, "unhealthy", 10, 4, "critical");
            });

            // Add click event to viciouslyMurderPet
            viciouslyMurderPet.addEventListener("click", function() {
                if (viciouslyMurderPet.classList.contains("red")) {
                    setTimeout(function() {
                        petDead(petIndex);
                    }, 1500);
                    petDialog("global", "YOU MONSTER!",100,10,"critical");
                } else {
                    viciouslyMurderPet.src = "data:image/png;base64,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cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjM0OGFhNmM2LTcxM2EtNGNlNS1iYWJlLTRmYjdiYjhkZDZkOCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxMzYwMjY0YS0wNWE3LTRmMzQtYTJiMy1mN2FkY2M3MzRkODEiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiZjZjNmFiOS01ZTJmLTQ1ZGYtOGM3My1hMDc2OTg2ZDkyYTAiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTY4OTgwNTE1Mjc5NDkwMSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjI4IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjI1M2I0MmQ1LTU1OTYtNDBkYS05NzE2LTAyMzJlYjVmZjllYSIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0wNy0xOVQxODoxOToxMiIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAg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"; // Replace with the base64 encoded image data for red variant of viciouslyMurderPet
                    viciouslyMurderPet.classList.add("red");
                    // Handle first click action and display warning via petDialog()
                    petDialog(petIndex, "Warning!: Clicking again will delete this Tagagotchi",100,10,"critical");
                }
            });

            var sacrificePet = document.createElement("img");
            //Dice Icon from https://thenounproject.com/icon/dice-15764/ Created by Chris Terrill from the Noun Project
            sacrificePet.src = "data:image/png;base64,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IgURMmrYQAUWYrRqpJhI037cwz/k+FPkksm1AUaOeVShQnL84H/wu1uzODnhJoXiQODFtj9GgOAu0Kzb9vexbTdPAP8zcKW1/dUGMPNJer2tRY+A/m3g4rqtyXvA5Q4w+KRLhuRIfppCsQi8n9E35YHwLdCz6vbW2sfpA5ClrpZugINDYLRE2Wse7+7u7O3fM63+fgAyHXKN6CjvKQAADRhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6NzUxMzU3N2EtMGI3MS00Mzg4LWE2MDAtYjNhNGU1OTQ0MDc4IgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE5NWVjMTdiLWQ5YjctNDA4Ni1hYTFlLTgxNTdjN2QxMjg3NiIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjk0YmNjNjU1LTgzYzAtNDg4Yi04ODRlLWNlZjA2NGFlNzc4MSIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjg5ODA1MTE0OTUzNzY3IgogICBHSU1QOlZlcnNpb249IjIuMTAuMjgiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YzExOTJjNGEtNTQyOC00ZjliLWJlYmYtNzY4MjM1YWQ1NGMwIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTA3LTE5VDE4OjE4OjM0Ii8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PhhcK7IAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBxMWEiKCJksOAAALxklEQVR42u2cabAVxRXHex6P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";
            sacrificePet.style.width = "25px";
            sacrificePet.style.height = "20px";
            sacrificePet.style['padding-left'] = "2px";
            iconContainer.appendChild(sacrificePet);

            // Add mouseover event to sacrificePet
            sacrificePet.addEventListener("mousedown", function() {
                petDialog(petIndex, "unhealthy", 10, 4, "challenge");
            });

            // Add click event to sacrificePet
            sacrificePet.addEventListener("click", function() {
                if (sacrificePet.classList.contains("red")) {
                    petDialog("global", "YOU MONSTER!",100,4,"critical");
                    petDialog(petIndex, "death",100,4,"critical");
                    changePet(petIndex)
                } else {
                    sacrificePet.src = "data:image/png;base64,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/n4AMh1yjego7ykAAA0YaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmMwNDgzY2UyLWIwYzgtNDE4Ni1hMmE1LTRiZThlMzc4ZGU1OCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5ODA2N2NiMy00MDMzLTQ0NTEtYjQ1NS01NDgxODFjNTRhMDUiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5NDE4NjI3OC1jY2M3LTQxYjYtYTA0Zi1iYzBkMTQwOTAyYjUiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTY4OTgwNTY4NDg2NDE1MSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjI4IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmE1YTY4NWVlLWU2M2EtNGNlNi1iZjI4LTViMTk5ZmRiNDgwZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0wNy0xOVQxODoyODowNCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz7lmKLcAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wcTFhwEzqjjfQAACzlJREFUeNrtXGdz4tgSbYGQwJZsQBgQGYzNpv//X3a3NrydGtu1oWqGaBTo96GvMUg3SeCZefuGKlU5KFx1Ot2n+wLwCT8IYCGAi5a1RQDcH9VqgAAu+78FXz9nFzoJvt1e4nAYHwn/5bi722G7HWK5vHhRxlfpncPaC4U51moB3t7yBc87hsMI2+3lV684RfCmOUffD7WFLvKKZjNEy5p/9Qpd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"; // Replace with the base64 encoded image data for red variant of sacrificePet
                    sacrificePet.classList.add("red");
                    // Handle first click action and display warning via petDialog()
                    petDialog(petIndex, "Warning!: Change pet type, will take 50% of pets stats.",100,10,"critical");
                }
            });

        }
        var petStopSign = document.createElement("img");
        ////Stop sign Icon from https://thenounproject.com/icon/stop-sign-4364166/ Created by JC from the Noun Project
        let petStopRed = "data:image/png;base64,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AAAPVWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6aXB0Y0V4dD0iaHR0cDovL2lwdGMub3JnL3N0ZC9JcHRjNHhtcEV4dC8yMDA4LTAyLTI5LyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOnBsdXM9Imh0dHA6Ly9ucy51c2VwbHVzLm9yZy9sZGYveG1wLzEuMC8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDphZjY4YjhlOC1jMGY2LTRhOGQtOTVhNC1hNTU1ZTFlOWMzN2UiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTYzZTJiODEtZjM2Mi00NDIxLWI3MTctOTI1OGQwZjI3YzM0IgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MzY2YjQxOTUtYWM0MS00OTc5LTk5ZjQtYmFkY2NhZjg2YWI3IgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTY4OTg2Njc2OTczNjY4MCIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjIwIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkMzZkYjJhYS05MzgxLTRjZGEtOWU1Yi1iMDhiYjliMjhmZGEiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjMtMDctMjBUMTE6MjY6MDkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkxpY2Vuc29yPgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+W9LvBgAAAAZiS0dEAJMAxAB91/fVogAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+cHFA8aCWhjmAAAAArjSURBVHja7Z1diFXXFcd/9zh9Up/8eqg4EyhGR0zAxlYhVVM8pqXBr0BkpKERv0KEvCTgTFKfQnQE+9CAIepIGloUA9GxGKieCX4gaDvpQCKZMVJwJtgHv55m0ifnTh/2Os6+27P3Oec6995z7z1/kLkXz5k557/WXh9777V2gQwigGnAs8AyYDGwQH7OBlpjbh8BHgBDwA/ycwD43ofxrL1rISOEe8AiYCOwClgJzJzC55sARoFrwBWgF7jpQ7FpBSCkLwM2AR1AWxWfZwIYBk4CZ4CBWgmjUAPiZwLbgR1AewZG4QQwCPQAx301UhpPAAHMA/YK8TPJJkZFEAd9uNsQAghgLtAJ7ARmUB8YA44B3T7cq0sBiI1/G+hCCeFpTMQj4AZwX6IcPdrBiI5agTnAUqDlKd/xHnAA+KhSPqJQIfKXA4dRP9OiKKFjH/C1hJC3fCWENM/QAiwUR/8CsFZCWa+MZ+oH9vjqZ3YFIFrfCXyQ8kWL6nZOAxeAEV9p/lQ+W0FGxzpgM+CX8Yz7xCwVMyeAQL3cZ8DqFLfdBY4DPT7cTkjiNPk6H5glnx8Cd+TzeBLhBfCMBATbUQFCUlwG/uBPmsLaCyCANcCpFLZ+UGxrr68cnisbflHMSLsQvlAu8TQNLjKplbdEIINivq66suBA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";
        let petStopGrey = "data:image/png;base64,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Oi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6cGx1cz0iaHR0cDovL25zLnVzZXBsdXMub3JnL2xkZi94bXAvMS4wLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjhjZGUxZWI1LThjODItNDZlNC05Yjc1LTAzM2FiMzVhYzQxMyIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNmIyODlmMC1hMmFhLTRlMjMtOTNlNC1lYjA1NTBhYWZmMWMiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0NDg1MGU5ZS1hYTkzLTRiNmEtOTY1NC1hMWIyZWY1ZTllMDkiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjg5ODY2Nzg5OTcxOTM3IgogICBHSU1QOlZlcnNpb249IjIuMTAuMjAiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDxpcHRjRXh0OkxvY2F0aW9uQ3JlYXRlZD4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OkxvY2F0aW9uQ3JlYXRlZD4KICAgPGlwdGNFeHQ6TG9jYXRpb25TaG93bj4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgIDxpcHRjRXh0OkFydHdvcmtPck9iamVjdD4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OkFydHdvcmtPck9iamVjdD4KICAgPGlwdGNFeHQ6UmVnaXN0cnlJZD4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjk4Y2E0NjQzLWYzNTYtNDc0Mi04NGM1LTVhOWRjNjg2MDE5YiIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0wNy0yMFQxMToyNjoyOSIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDxwbHVzOkltYWdlU3VwcGxpZXI+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpJbWFnZVN1cHBsaWVyPgogICA8cGx1czpJbWFnZUNyZWF0b3I+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpJbWFnZUNyZWF0b3I+CiAgIDxwbHVzOkNvcHlyaWdodE93bmVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6Q29weXJpZ2h0T3duZXI+CiAgIDxwbHVzOkxpY2Vuc29yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6TGljZW5zb3I+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz4qBF3qAAAABmJLR0QAkwDEAH3X99WiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wcUDxodcrlMfQAAApVJREFUeNrtndlxQyEMRSONK0wDrs0NuMXk15Nx/Fi0AUcFGOkexCL8QL4K2vPx+PH43e/7XarFKjsLvgIQOU30ajDkdOGzQQjC54IQhM8FIQifC0JWEb9XgAo+hAOwDNo62Kq+SZUAW4JqbcPyt7whSLb4/wViPYR4tGMBQbLEf+d81MRt2fYsBMkWPnu1ZOXPKAiJEr+a8B7+jUCQaPFXKkVEQHAFUL3Xe/jtCmDUkVV3xaMx9EAQxM+FIIifC0EQPxeCVlk9VLfXmMJqQSO1lx3Fn431EzBB/FwIGu0Iw1EDgF4xTxLfWiOd7f0niv9X1Jks0BGyFf9hVq180ZoFGpmGDEUXq6Ce3o/447q8ZosiXa4JvT83C8iAZFMPuixL21eJiqi5sLSn92O2+4LuOYBMsdeISTh7EqZX52bLZQaw+vFdDTEErbIPwACwpd281/+r7yEsPuT49Bvq6cQOG7jRGFo102qO7wSBOYBJGAMAADAAAAADwGkAdqqeesbieiS5AwTvKsDtqvHZXeDp5whX8TMHMAkDAKsMwOIjhNOs5xxdETYXFEPQSnMA2WKvkeuRJOv/RgD07LxM0V6iwLJZ/bAPKGJ8JZnQ+/lKsmoGkAWxvX86A5iQHW5Libj4+tR1/zttdbbBk7PAYihWi7Q6EYKVRma3pZwEwfKmMC7tCxB/6NI+IPiLb7oR23048upgXF3sGJPJ1cWnQyhxefepEEpdX2/hCA84BANYMRvKP2Fi5RiP+EwAmBGQZ6yMAHg4zENuwRA+BcBThoEQWoPhMU/noDwCrO4bDzondgo3ADuUICLEdwWwCwjvym5Y2Xg1EFEl9fC6/UqliC0BrFKK2B5ABRgVTu5KHh16Aal4VPoLCPx3ozZFvrkAAAAASUVORK5CYII=";
        if (petData[petIndex].stopMove) {
            petStopSign.src = petStopRed;
        } else {
            petStopSign.src = petStopGrey;
        }
        petStopSign.style.width = "20px";
        petStopSign.style.height = "20px";
        petStopSign.style['padding-left'] = "2px";
        petStopSign.style.float = "right";
        iconContainer.appendChild(petStopSign);

        // Add mouseover event to renamePet
        petStopSign.addEventListener("mousedown", function() {
            petDialog(petIndex, "Stop movement", 10, 10, "dirty");
        });

        // Add click event to renamePet
        petStopSign.addEventListener("click", function() {
            if (petData[petIndex].stopMove) {
                petStopSign.src = petStopGrey;
                petData[petIndex].stopMove = false;
            } else {
                petStopSign.src = petStopRed;
                petData[petIndex].stopMove = true;
            }
        })
        // Append the container to the menu content
        menuContent.appendChild(iconContainer);

        // Append the menu content to the menu element
        menuElement.appendChild(menuContent);

        // Append the menu to the document body
        document.body.appendChild(menuElement);

         menuElement.addEventListener("click", function() {
            petData[petIndex].isPetInteracting = false; // Reset the flag when the menu is closed
            menuElement.remove();
        });

        petElement[petIndex].addEventListener("mouseleave", function(event) {
            if (!menuElement.contains(event.relatedTarget)) {
                petData[petIndex].isPetInteracting; // Reset the flag when the menu is closed
                menuElement.remove();
            }
        });
    }

    function changePet(petIndex) {
        //Loop till we have a different pet variety
        let currentPetVariety = petData[petIndex].varietyIndex;
        let newPetVariety;
        do {
            newPetVariety = Math.floor(Math.random() * petVarieties.length);
        } while (newPetVariety === currentPetVariety);
        //does this pet have a variant if so pick one
        let newVariant = false;
        if (typeof petVarieties[newPetVariety].image === "object"){
            //console.log("TP_PET: " +"pet variant is " + randomPetIndex);
            newVariant = Math.floor(Math.random() * petVarieties[newPetVariety].image.length);
        }
        //remove 50% of health, mood, hunger (challenge wins?)
        petData[petIndex].health = petData[petIndex].health / 2;
        petData[petIndex].happiness = petData[petIndex].happiness / 2;
        petData[petIndex].hunger = petData[petIndex].hunger / 2;
        //change pet variety and variant in petData
        petData[petIndex].varietyIndex = newPetVariety;
        petData[petIndex].variant = newVariant;
        petData[petIndex].name = null;
        //save pet information
        savePetToStorage();
        //delete pet element
        petElement[petIndex].remove();
        //redraw pet.
        drawPet(petIndex);
    }

    function showRenameForm(petIndex) {
        // Create a modal template
        const modalTemplate = `
        <div class="modal fade" id="renamePetModal" tabindex="-1" role="dialog" aria-labelledby="renamePetModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="renamePetModalLabel">Rename Your Pet</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="form-group">
                                <label for="newPetName">Enter a new name for your pet:</label>
                                <input type="text" class="form-control" id="newPetName" placeholder="New Pet Name">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveNewPetName">Save</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Create a temporary container element
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = modalTemplate;

        // Get the modal element from the container
        const modal = tempContainer.querySelector('.modal');

        // Append the modal to the document body
        document.body.appendChild(modal);

        // Initialize Bootstrap modal
        $(modal).modal({
            backdrop: 'static',
            keyboard: false
        });

        // Handle the Save button click
        $('#saveNewPetName').on('click', function() {
            const newPetName = $('#newPetName').val();
            if (newPetName) {
                petData[petIndex].name = newPetName;
                // Save pet data
                savePetToStorage();
            }
            // Close the modal
            $(modal).modal('hide');
        });
    }


    function getColorFromPercentage(percentage) {
        if (percentage <= 20) {
            return `rgb(247, 23, 7)`; // Red to Orange gradient
        } else if (percentage <= 40) {
            return `rgb(247, 99, 7)`; // Orange to Yellow gradient
        } else if (percentage <= 60) {
            return `rgb(247, 247, 7)`; // Yellow to Green gradient
        } else if (percentage <= 80) {
            return `rgb(15, 247, 7)`; // Green to Blue gradient
        } else {
            return `rgb(7, 63, 247)`; // Blue to Red gradient
        }
    }

    function petDialog(petIndex, state, priority, time, options) {
        state = state ?? "random";
        priority = priority ?? 1;
        time = time ?? 5;
        time = parseInt(time)*1000;
        options = options ?? false;

        //TODOMULTIPET
        if (petIndex == "global") {
            for (let pet = 0; pet < petData.length; pet++) {
                petDialog(pet, state, priority, time/1000, options);
            }
            return;
        }
        //return;
        var selectedPet = petVarieties[petData[petIndex].varietyIndex] ?? defaultPet;
        var randomMessage;
        //If selected pet does not have this dialog state use default pet dialog. b5968hfusk
        if (!petData[petIndex].hatched && state != "death" && priority < 50) {
            state = "eggTalk";
        }

        if (!selectedPet.dialog[state] && !defaultPet.dialog[state]) {
                randomMessage = state;

        } else {
            var messages = selectedPet.dialog[state] ?? defaultPet.dialog[state];
            randomMessage = messages[Math.floor(Math.random() * messages.length)];
            if (typeof randomMessage === "function") {
                randomMessage = randomMessage();
            }
        }
        //console.log("TP_PET: " + "showDialog(" + petIndex + randomMessage +", " + priority +"," + time +")");
        showDialog(petIndex, randomMessage, priority, time, options);

        //Take this time to save petData
        savePetToStorage()
    }

    function showDialog(petIndex, message, priority, time, options) {
        /// Check if there is an existing dialog element
        var existingDialog = document.querySelector("#tagagotchi_-dialog-"+petIndex);
        if (existingDialog) {
            //check the priority of the exisiting dialog if it is higher than dont post this one.
            let exisitngPriority = existingDialog.getAttribute("priority");
            let exisitngDisplay = existingDialog.style.display ?? false;
            if (exisitngPriority <= priority || exisitngDisplay == "none") {
                // Remove the existing dialog element from the DOM
                existingDialog.remove();
            } else {
                //this dialog is not a higher priority exit
                return;
            }
        }

        // Create the dialog element
        var dialogElement = document.createElement("div");
        dialogElement.className = "tagagotchi_-dialog";
        dialogElement.id = "tagagotchi_-dialog-"+petIndex;
        dialogElement.setAttribute("priority", priority);

        // Create the dialog content
        var dialogContent = document.createElement("div");
        dialogContent.className = "tagagotchi_-dialog-content";
        if (options != "") {
            dialogContent.classList.add("tagagotchi-dialog-"+options);
        }
        dialogContent.textContent = message;

        if (pageLoc == "ingame" && priority < 3) {
            dialogElement.classList.add("in-game");
            if (priority <= 2 && tagagotchiSettings.dialogFrequency.value) {
                if (Math.random() < 0.5) {
                    return;
                }
            }
        }

        // Append the dialog content to the dialog element
        dialogElement.appendChild(dialogContent);

        // Append the dialog to the document body
        document.body.appendChild(dialogElement);

        // Position the dialog relative to the pet
        positionDialog(petIndex);

        // Hide the dialog on hover
        dialogElement.addEventListener("mousedown", function() {
            dialogElement.remove();
            //dialogElement.style.display = "none";
        });

        // Show the dialog after 5 seconds and hide it again
        dialogElement.style.display = "block";
        setTimeout(function() {
            dialogElement.remove();
        }, time);
    }

    function positionDialog(petIndex) {
        // Get the dialog element
        var dialogElement = document.querySelector("#tagagotchi_-dialog-"+petIndex);

        // Return if the dialog element is not found
        if (!dialogElement) {
            return;
        }
        try {
            // Get the position of the pet
            var petRect = petElement[petIndex].getBoundingClientRect();

            // Get the current vertical scroll position
            var scrollY = window.scrollY || window.pageYOffset;

            // Calculate the position of the dialog
            var dialogX = petRect.left + (petRect.width / 2) - (dialogElement.offsetWidth / 2);
            var dialogY = petRect.top - dialogElement.offsetHeight - 10 + scrollY; // Account for the vertical scroll

            // Set the position of the dialog
            dialogElement.style.left = dialogX + "px";
            dialogElement.style.top = dialogY + "px";
        } catch (error) {
            console.error('TP_Pet: positionDialog, does pet exist yet?:', error);
        }
    }

    function petRandomDialog(petIndex){
        //show average stats or wins, or challenges completed.
        const randomNumber = Math.random();

        if (randomNumber < 1/4) {
            // Option 1
            var stats = ["tags","returns","captures","powerups","drops","pops","snipes"]
            let randomIndex = Math.floor(Math.random() * stats.length);;
            petDialog(petIndex, "Average " + (stats[randomIndex].charAt(0).toUpperCase() + stats[randomIndex].slice(1)) + "/game: " + petData[petIndex].averages[stats[randomIndex]]);
        } else if (randomNumber < 2/4) {
            // Option 2
            Math.random() < 0.5 ? petDialog(petIndex, "Number of wins: " + petData[petIndex].wins + ".",1,5) : petDialog(petIndex, "Successful challenges: " + petData[petIndex].challengeWins + ".",1,5);
        } else if (randomNumber < 3/4) {
            // Option 3
            petDialog(petIndex, "random",1,5);
        } else {
            // Option 4
            checkPetState(petIndex);
        }
    }

    //Stat Management

    function gameStart() {
        //console.log("TP_PET: " +"game has started we are in");
        playingGame = true;
        if (tagagotchiSettings.disableMovementIngame.value == true || tagagotchiSettings.disableAllMovement.value) {
            petData.forEach(function(pet) {
                pet.isPetInteracting = true; //
            });
        }
        startStatWatch();

        //create a challenge based on things if this is start of game
        if (tagpro.state == 3) {
            //console.log("TP_PET: " + "challenge being created");
            createChallengeForEachPet();
        } else {
            //console.log("TP_PET: " + "challenge not being created state:" + tagpro.state);
            joinedInprogress = true;
        }

        // Add the "in-game" class to the tagagotchi elements to dim them while in a game
        var tagagotchiElements = document.querySelectorAll("[class^='tagagotchi-']");
        for (var i = 0; i < tagagotchiElements.length; i++) {
            tagagotchiElements[i].classList.add("in-game");
        }
    }

    function startStatWatch(){
        //start Boost watch
        //console.log("TP_PET: " + "Stat watching started");
        setTimeout(boostWatchInit, 1000);
        //Start End of game watch
        tagpro.socket.on("end", function (data) {
            var playerTeam = tagpro.players[tagpro.playerId].team; //1 = red 2 = blue
            var result;
            if (data.winner == "red"){
                if (playerTeam == 1) {
                    result = 1;
                } else {
                    //player looses on red
                    if (!joinedInprogress) {
                        result = 2;
                    } else { result = 4 }
                }
            } else if (data.winner == "blue"){
                if (playerTeam == 2) {
                    //player wins on blue
                    result = 1;
                } else {
                    //player looses on blue
                    if (!joinedInprogress) {
                        result = 2;
                    } else { result = 4 }
                }
            }

            for (let pet = 0; pet < petData.length; pet++) {
                if (result == 1) { //Win
                    petData[pet].wins += 1;
                    parseScore(scoreMatrix.win, "Win Game", pet)
                } else if (result == 2){//Loss
                    parseScore(scoreMatrix.loss, "Game Loss", pet)

                }
                //get player team
                petData[pet].gamesPlayed = petData[pet].gamesPlayed + 1;
                petData[pet].ingame = false;
                petData[pet].bathroom = 50; //reset DC penalty
                challengeUpdate(pet, true);
                //Check new egg chances
                if (tagagotchiSettings.disableDisableEggs.value == 0 && petData[pet].challengeWins >= (10 + (petData[pet].eggs * 10)) && result == 1) {
                    if (Math.floor(Math.random() * 10) + 1 == Math.floor(Math.random() * 10) + 1) {
                        layEgg();
                        petData[pet].eggs ++;
                    } else { console.log("TP_PET: "+"No egg :("); }
                }
                let healthChange = calculateHealth(pet, result);
                if (isNaN(healthChange)) {
                    healthChange = 0;
                   //console.log("TP_PET: "+"health change is not a number" + pet + result);

                }

                //parseScore({"health": qty, "happiness": 0, "hunger": 0},qty,"Game Win Reward",petIndex);
                //parseScore({"health": qty, "happiness": 0, "hunger": 0},qty,"Game Loss Penalty",petIndex);
                if (healthChange > 0) {
                    parseScore({"health": healthChange, "happiness": 0, "hunger": 0},"Game Win Reward",pet)
                } else if (healthChange < 0) {
                    parseScore({"health": healthChange, "happiness": 0, "hunger": 0},"Game Loss Penalty",pet)
                }
                //sanity check health
                if (petData[pet].health > 100) { petData[pet].health = 100 }
                if (petData[pet].health <= 0) {
                    //pet is dead!
                    petDead(pet);
                }
            }
            //Save Pet DAta
            savePetToStorage();
        });
        //set ingame property to check for DCs
        setTimeout(function() {
            petData.forEach(function(pet) {
                pet.ingame = true;
            });

        }, 25000);
    }

    function calculateHealth(petIndex, result) {
        var base = 0;
        var qty = 0;
        if (petData[petIndex].hatched) {
            if (result == 1) {
                //Win
                base = 7.5;
                qty = Math.ceil(base+base*((parseFloat(petData[petIndex].happiness)/100)+(parseFloat(petData[petIndex].hunger)/100)));
                //console.log("TP_Pet: " + "win reward " + qty);
            } else if (result == 2) {
                //loss
                base = -7.5;
                qty = Math.floor(base+base*(((100-parseFloat(petData[petIndex].happiness))/100)+((100-parseFloat(petData[petIndex].hunger))/100)));
                //console.log("TP_Pet: " + "loss penalty " + qty);
            } else if (result == 3) {
                qty = 0;
            } else {
                qty = 0;
            }
            //console.log("TP_Pet: " + "Result: " + result + " Mood: " + petData[petIndex].happiness + "Hunger: " + petData[petIndex].hunger +  " Qty: " + qty)
        }
        return qty;
    }

    function boostWatchInit() {
        setTimeout(function() {
            var currentPlayerStats = tagpro.players[tagpro.playerId];
            // Create an object to hold the desired stats
            statsArray[0] = {
                "tags": currentPlayerStats["s-tags"],
                "pops": currentPlayerStats["s-pops"],
                "drops": currentPlayerStats["s-drops"],
                "returns": currentPlayerStats["s-returns"],
                "captures": currentPlayerStats["s-captures"],
                "powerups": currentPlayerStats["s-powerups"],
                "grabs": currentPlayerStats["s-grabs"]
            };
            boostWatch();
            }, 2500);
    }

    function boostWatch() {
        //if (tagpro.spectator) { return;}
        plLx = Math.abs(tagpro.players[tagpro.playerId].lx);
        plLy = Math.abs(tagpro.players[tagpro.playerId].ly);
        //get playerStats

        // Get the current player stats
        var currentPlayerStats = tagpro.players[tagpro.playerId];
        // Create an object to hold the desired stats
        statsArray[1] = {
            "tags": currentPlayerStats["s-tags"],
            "pops": currentPlayerStats["s-pops"],
            "drops": currentPlayerStats["s-drops"],
            "returns": currentPlayerStats["s-returns"],
            "captures": currentPlayerStats["s-captures"],
            "powerups": currentPlayerStats["s-powerups"],
            "grabs": currentPlayerStats["s-grabs"]
        };

        // Compare the overall changes in statsArray
        //console.log("Stats: " + JSON.stringify(statsArray[0]) + " " + JSON.stringify(statsArray[1]))
        if (!compareObjects(statsArray[0], statsArray[1])) {
            compareStats();
        }

        plLt = plLx+plLy;
        if (plLt < 4 && !boosting) {
            statsArray.shift();
            if (tagagotchiSettings.statsDelay.value) {
                setTimeout(boostWatch, tagagotchiSettings.statsDelay.value);
            } else {
                requestAnimationFrame(boostWatch);
            }
            //not boosting exit function but shift array for next iteration
            //console.log("TP_PET: "+"Not boosting so clearing array");
            return;
        }
        else if (plLt > 7 && boosting == false){
            boosting = true;
            //plRet = tagpro.players[tagpro.playerId]["s-tags"];
            preboostReturns = statsArray[1].tags;
            petDialog("global", "boosting",1,2);
            //console.log("TP_PET: "+"boosting");
        }
        if (plLt < 4 && boosting == true){
            boosting = false;
            //plRet = tagpro.players[tagpro.playerId]["s-tags"];

            if (preboostReturns < statsArray[1].tags){
                petDialog("global", "snipe",3,5);
                snipedCount += 1;
                for (let pet = 0; pet < petData.length; pet++) {
                    if (petData[pet].statChallenge.stat == "snipes") {
                        petData[pet].statChallenge.value += 1;
                        challengeUpdate(pet);
                    }
                    if (snipedCount == 3) {
                        parseScore(scoreMatrix.snipeHattrick, "3x snipe",pet);
                    }
                    parseScore(scoreMatrix.snipe, "snipe", pet); //2 for a snipe
                }

                //console.log("TP_PET: "+"SNIPED");
            }
            //console.log("TP_PET: "+"boosting Over");
        }
        // Remove the old stats from the array
        statsArray.shift();
        if (tagagotchiSettings.statsDelay.value) {
            setTimeout(boostWatch, tagagotchiSettings.statsDelay.value);
        } else {
            requestAnimationFrame(boostWatch);
        }
    }

    function compareObjects(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    }

    function compareStats() {
        var oldStats = statsArray[0];
        var newStats = statsArray[1];

        //console.log("stats changed")
        // Compare the stats and identify the changes
       // console.log("Old Stats: " + JSON.stringify(oldStats) + " New Stats: " + JSON.stringify(newStats))
        if (oldStats && newStats) {
            var changes = {
                drops: 0,
                pops: 0,
                returns: 0,
                tags: 0,
                captures: 0,
                powerups: 0,
                grabs: 0,
            }
            //Handle drops and pops
            if (oldStats["drops"] != newStats["drops"]) {
                //console.log("TP_PET: " + "drop dialog" + JSON.stringify(playerUpdates["s-drops"]));
                changes.drops += 1;
                petDialog("global", "drop");
            } else if (oldStats["pops"] !== newStats["pops"]) {
                // "s-pops" stat has changed but it wasnt a drop
                changes.pops += 1;
            }

            //Handle tags and returns
            if (oldStats["returns"] !== newStats["returns"]) {
                // "s-returns" stat has changed
                changes.returns += 1;
                petDialog("global", "return");
                let difference = newStats["tags"] - oldStats["tags"];
                //console.log("TP_PET: " + "Tag found:" + newStats["tags"] + "-" + oldStats["tags"] + "=" + difference);
                changes.tags += difference;
            } else if (oldStats["tags"] !== newStats["tags"]) {
                // "s-tags" stat has changed non return tag.
                //get the difference
                let difference = newStats["tags"] - oldStats["tags"];
                //console.log("TP_PET: " + "Tag found:" + newStats["tags"] + "-" + oldStats["tags"] + "=" + difference);
                changes.tags += difference;
                petDialog("global", "tag");
            }

            if (oldStats["captures"] !== newStats["captures"]) {
                changes.captures += 1;
                if (newStats["captures"] == 3) {
                    petDialog("global", "Captrick!",4,5);
                } else {
                    petDialog("global", "cap");
                }
            }
            if (oldStats["powerups"] !== newStats["powerups"]) {
                changes.powerups += 1;
                petDialog("global", "pup");
            }
            if (oldStats["grabs"] !== newStats["grabs"]) {
                changes.grabs += 1;
                petDialog("global", "grab");
            }

            //loop through pets and apply stats and check challenges
            for (let pet = 0; pet < petData.length; pet++) {
                //Drops / Pops
                if (changes.drops) {
                    parseScore(scoreMatrix.drop, "Drop", pet); //(minus 1 for a drop - 2 for a pop(non-drop)
                    petData[pet].stats.drops += 1;
                    //Splat poop on screen depending on how full pet is
                    //Disconnect penalty "the shits"
                    if (petData[pet].hatched) {
                        if (petData[pet].bathroom >= 100) {
                            for (let shits = 0; shits < Math.floor(Math.random() * 2) + 2; shits++) {
                                petSplat(pet);
                                petData[pet].bathroom =-1;
                                parseScore(scoreMatrix.splats, "Toilet", pet)
                            }
                            petSplat(pet);
                            parseScore(scoreMatrix.splats, "Toilet", pet)
                        }
                        if (Math.floor(Math.random() * 100) + 1 >= (100 - petData[pet].hunger)) {
                            if (Math.random() < 0.5) {
                                petSplat(pet);
                                parseScore(scoreMatrix.splats, "Toilet", pet)
                            }
                        }
                    }
                } else if (changes.pops) {
                    parseScore(scoreMatrix.pop, "Pop", pet);
                    petData[pet].stats.pops += 1;
                    if (petData[pet].statChallenge.stat == "Non-drop-pops") {
                        petData[pet].statChallenge.value += 1;
                        challengeUpdate(pet);
                    }
                }
                //Returns / Tags
                if (changes.returns) {
                   // console.log("TP_PET: " + "Tag found being processed return" + changes.tags);
                    parseScore(scoreMatrix.return, "Return", pet); //1 for a return
                    petData[pet].stats.returns += 1;
                    petData[pet].stats.tags += 1;
                    if (changes.tags >= 2) {
                        for (let i = 0; i < changes.tags - 1; i++) {
                            parseScore(scoreMatrix.tag, "Tag Multi", pet);
                            petData[pet].stats.tags += 1;
                        }
                    }
                    if ( petData[pet].statChallenge.stat == "returns") {
                         petData[pet].statChallenge.value += 1;
                        challengeUpdate(pet);
                    } else if ( petData[pet].statChallenge.stat == "tags") {
                        //console.log("TP_PET: " + "Tag challenge update" + changes.tags);
                        petData[pet].statChallenge.value += changes.tags;
                        challengeUpdate(pet);
                    }
                } else if (changes.tags) {
                    if (petData[pet].statChallenge.stat == "tags" ) {
                        petData[pet].statChallenge.value += changes.tags;
                        challengeUpdate(pet);
                    }
                    for (let i = 0; i < changes.tags; i++) {
                        petData[pet].stats.tags += 1;
                        parseScore(scoreMatrix.tag, "Tag", pet);
                    }
                }
                //Captures + hattricks
                if (changes.captures) {
                    if (newStats["captures"] == 3) {
                        parseScore(scoreMatrix.captureHattrick, "Cap Hattrick", pet);
                    } else {
                        //console.log("TP_PET: " + "Capture detected?");
                        parseScore(scoreMatrix.capture, "Cap", pet);
                    }
                    petData[pet].stats.captures += 1;
                    if (petData[pet].statChallenge.stat == "captures") {
                        petData[pet].statChallenge.value += 1;
                        challengeUpdate(pet);
                    }
                }
                //Powerups
                if (changes.powerups) {
                    parseScore(scoreMatrix.powerup, "Pup", pet)
                    petData[pet].stats.powerups += 1;
                    if (petData[pet].statChallenge.stat == "powerups") {
                        petData[pet].statChallenge.value += 1;
                        challengeUpdate(pet);
                    }
                }
                //Grabs
                if (changes.grabs) {
                    parseScore(scoreMatrix.grab, "Grab", pet)
                }
            }
            //take this time to update petdata
            savePetToStorage();
        }
    }

    function parseScore(matrix, logInfo, petIndex) {
        //console.log("TP_Pet: " + JSON.stringify(matrix));
        var logStat = "Pet "+ petIndex +", "+ logInfo + ", "
        if (extraLogging) {
            logStat = logStat + "Pre: " + petData[petIndex].health + ", " + petData[petIndex].happiness + ", " + petData[petIndex].hunger + ", "
        }

        if (matrix.health !== 0) {
            if (petData[petIndex].hatched) {petData[petIndex].health += matrix.health;}
            animateStats("health", matrix.health, logInfo, petIndex)
            logStat = logStat + "Health: " + matrix.health + ", "
        }
        if (matrix.happiness !== 0) {
            if (petData[petIndex].hatched) {petData[petIndex].happiness += matrix.happiness;}
            animateStats("happiness", matrix.happiness, logInfo, petIndex)
            logStat = logStat + "Happiness: " + matrix.happiness + ", "
        }
        if (matrix.hunger !== 0) {
            if (petData[petIndex].hatched) {petData[petIndex].hunger += matrix.hunger;}
            animateStats("hunger", matrix.hunger, logInfo, petIndex)
            logStat = logStat + "Hunger: " + matrix.hunger + ", "
        }
        //sanity check happiness and hunger
        if (petData[petIndex].hunger > 100) { petData[petIndex].hunger = 100 }
        if (petData[petIndex].hunger < 0) { petData[petIndex].hunger = 0 }
        if (petData[petIndex].happiness > 100) { petData[petIndex].happiness = 100 }
        if (petData[petIndex].happiness < 0) { petData[petIndex].happiness = 0 }
        if (petData[petIndex].health > 100) { petData[petIndex].health = 100 }
        if (petData[petIndex].health <= 0) {
            setTimeout(function() {
                petDialog(petIndex, "death",4,5,"critical");
            }, 5000);
        }
        if (logInfo && !okThen) {
            if (extraLogging) {
                logStat = logStat + "Post: " + petData[petIndex].health + ", " + petData[petIndex].happiness + ", " + petData[petIndex].hunger
            }
            if (scoreLog.length > 100) {
                scoreLog.splice(0, scoreLog.length - 75);
            }
            scoreLog.push(logStat)
            GM_setValue("tagagotchi-scoreLog",scoreLog);
        }
    }

    async function animateStats(statType, qty, logInfo, petIndex) {
        if (tagagotchiSettings.disableParticles.value) {return;}
        var spriteSheetIndex;
        //console.log("TP_PET: " + "animateStats( " + statType + "," + qty + ","  + logInfo + ","  +petIndex+")")
        var selectedPet = petVarieties[petData[petIndex].varietyIndex];
        //var spriteSheetImageSrc = selectedPet.statsSprites ?? defaultPet.statsSprites;
        //console.log("TP_PET: " + "stat update >> Stat: " + statType + " Qty: " + qty);
        // Step 1: Retrieve the sprite sheet index based on the statType
        if (petData[petIndex].hatched && !(statType === "egg") && !(statType === "death")) {
            if (statType === "health") {
                if (qty >= 0) {
                    spriteSheetIndex = selectedPet.healthSpritesIndex ?? defaultPet.healthSpritesIndex;
                } else {
                    spriteSheetIndex = selectedPet.unhealthSpritesIndex ?? defaultPet.unhealthSpritesIndex;
                }
            } else if (statType === "hunger") {
                if (qty >= 0) {
                    spriteSheetIndex = selectedPet.hungerSpritesIndex ?? defaultPet.hungerSpritesIndex;
                } else {
                    spriteSheetIndex = selectedPet.unhungerSpritesIndex ?? defaultPet.unhungerSpritesIndex;
                }
            } else if (statType === "happiness") {
                if (qty >= 0) {
                    spriteSheetIndex = selectedPet.happinessSpritesIndex ?? defaultPet.happinessSpritesIndex;
                } else {
                    spriteSheetIndex = selectedPet.unhappinessSpritesIndex ?? defaultPet.unhappinessSpritesIndex;
                }
            } else {
                //console.log("TP_PET: " + "STAT FAILURE animatStats" + statType + " - " + logInfo)
            }
        } else if (statType === "death") {
            spriteSheetIndex = {x: 1, y: 9, size: 16};
        } else {
             spriteSheetIndex = selectedPet.eggStatSpritesIndex ?? defaultPet.eggStatSpritesIndex;
        }

        // Step 2: Create a loop to display the icons
        var iterations = Math.abs(qty); // Absolute value of qty for looping
        for (var i = 0; i < iterations; i++) {
            // Step 3: Animate and draw the icons
            let spriteSheetImage = new Image();

            let icon = document.createElement("canvas");
            icon.className = "tagagotchi-icon-"+petIndex;
            icon.width = 16;
            icon.height = 16;
            let ctx = icon.getContext("2d");
            // Draw the icon based on the sprite sheet index and other logic
            let spriteX = spriteSheetIndex.x * 16; // Assuming each sprite is 16x16 pixels
            let spriteY = spriteSheetIndex.y * 16; // Assuming the sprite is at the top-left corner of the sprite sheet
            ctx.drawImage(statSpriteSheetImage, spriteX, spriteY, 16, 16, 0, 0, 16, 16);

            // Attach the icon to the document or any desired container
            document.body.appendChild(icon);

            // Attach the icon near the top right of the petElement
            let petRect = petElement[petIndex].getBoundingClientRect();

            // Get the current vertical scroll position
            var scrollY = window.scrollY || window.pageYOffset;

            //console.log("TP_Pet " + "type = " + statType);
            let iconX;
            if (qty >= 0) {
                iconX = petRect.right + 15 - Math.random() * 20; // Randomize the X position
            } else {
                iconX = petRect.left - 10 - Math.random() * 20; // Randomize the X position
            }
            //console.log("TP_Pet " + "iconx = " + iconX);
            let iconY = (petRect.top + 25  - Math.random() * 20) + scrollY;; // Randomize the Y position

            icon.style.position = "absolute";
            icon.style.left = iconX + "px";
            icon.style.top = iconY + "px";

            // Create a dynamic CSS rule
            document.documentElement.style.setProperty(`--iconY-${petIndex}`, `${iconY}px`);

            setTimeout(function() {
                icon.remove();
            }, 3000);
            await delay(500); // Adjust the delay time as needed
        }
        await delay(2000); // Adjust the delay time before removing the icons
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function createChallengeForEachPet() {
        for (let i = 0; i < petData.length; i++) {
            petData[i].statChallenge = createchallenge(i); // Call movePet function for each pet index
        }
        savePetToStorage();
    }

    function createchallenge(petIndex) {
        var startTime = tagpro.gameEndsAt;
        var statArray = ["tags", "returns", "captures", "snipes", "powerups", "Non-drop-pops"]
        var stat = statArray[Math.floor(Math.random() * statArray.length)];

        //getplayer averages
        calculateAverages(petIndex);
        var playerAvg;
        var playerTarget;
        var challengeLvl;
        if (petData[petIndex].gamesPlayed >= 50) { challengeLvl = 3 }
        if (petData[petIndex].gamesPlayed >= 20) { challengeLvl = 2 }
        if (petData[petIndex].gamesPlayed <= 20) { challengeLvl = 1 }

        if (stat == "Non-drop-pops") {
            playerAvg = petData[petIndex].averages.pops;
            //set play target
            playerTarget = Math.ceil(playerAvg - Math.floor(Math.random() * challengeLvl) + 1);
            //console.log("TP_Pet: " + "Pops challenge: Player Average = " + playerAvg + "Pops/Drops" + petData[petIndex].averages.pops + " / " + petData[petIndex].averages.drops)
            if (playerTarget < 0) { playerTarget = 1 }
            petDialog(petIndex, "Challenge! Get no more than " + (playerTarget-1) + " Non-Drop-Pops!",11,10,"challenge");
        } else {
            playerAvg = petData[petIndex].averages[stat];
            //console.log("TP_Pet: " + "challenge: Player Average = " + playerAvg)
            //set play target
            if (stat != "captures" || stat != "powerups" ) {
                playerTarget = Math.ceil(playerAvg + Math.floor(Math.random() * challengeLvl));
            } else {
                playerTarget = Math.round(playerAvg) + challengeLvl;
                if (stat == "captures" && playerTarget > 3) { playerTarget = 3; } //dont force to get more than hattrick
            }
            if (playerTarget <= 1) { playerTarget = 2 }
            petDialog(petIndex, "Challenge! Get " + playerTarget + " " + stat.charAt(0).toUpperCase() + stat.slice(1),11,10,"challenge");
        }
        return { "stat":stat, "target": playerTarget, "value": 0, "pass": false, "startTime": startTime};
    }

    function calculateAverages(petIndex) {
        var gamesPlayed = petData[petIndex].gamesPlayed;
        // Calculate the averages by dividing the tallies by the number of games played
        petData[petIndex].averages.tags = (petData[petIndex].stats.tags / gamesPlayed).toFixed(2);
        petData[petIndex].averages.returns = (petData[petIndex].stats.returns / gamesPlayed).toFixed(2);
        petData[petIndex].averages.captures = (petData[petIndex].stats.captures / gamesPlayed).toFixed(2);
        petData[petIndex].averages.powerups = (petData[petIndex].stats.powerups / gamesPlayed).toFixed(2);
        petData[petIndex].averages.drops = (petData[petIndex].stats.drops / gamesPlayed).toFixed(2);
        petData[petIndex].averages.pops = (petData[petIndex].stats.pops / gamesPlayed).toFixed(2);
    }

    function challengeUpdate(petIndex, failCheck) {
        var statChallenge = petData[petIndex].statChallenge;

        if (!statChallenge.pass || !statChallenge.target) {
            //check if challenge completed
            if (statChallenge.value >= statChallenge.target && statChallenge.target != 0) {
                //challenge complete
                if (statChallenge.stat != "Non-drop-pops" && !statChallenge.pass) {
                    petDialog(petIndex, "Challenge Complete! " + statChallenge.value + "/" + statChallenge.target + " " + statChallenge.stat,5,10,"success");
                    parseScore(scoreMatrix.challengeWin, "challenge Win",petIndex);
                    statChallenge.pass = true;
                    //statChallenge.target *= 2;
                    petData[petIndex].challengeWins += 1;
                } else if (statChallenge.stat == "Non-drop-pops") {
                    petDialog(petIndex, "challenge Failed! " + statChallenge.value + "/" + statChallenge.target + " " + statChallenge.stat,5,10, "critical");
                    parseScore(scoreMatrix.challengeFail, "challenge Fail", petIndex);
                    statChallenge.target *= 2; //Try again to make up for failure
                    setTimeout(function() {
                        petDialog(petIndex, "Try again! Get no more than " + ( statChallenge.target-1) + " Non-drop-pops! ",11,10,"challenge");
                    }, 3500);
                }
            } else if (!failCheck) {
                setTimeout(function() {
                    petDialog(petIndex, "Challenge " + statChallenge.value + "/" + statChallenge.target + statChallenge.stat.charAt(0).toUpperCase() + statChallenge.stat.slice(1),4,10,"challenge");
                }, 1500);
            }
            if (failCheck) {
                if (statChallenge.stat == "Non-drop-pops" && statChallenge.value <= statChallenge.target && statChallenge.target != 0) {
                    petDialog(petIndex, "Challenge Complete! " + statChallenge.value + "/" + statChallenge.target + " " + statChallenge.stat,5,10,"success");
                    //console.log("TP_PET: " +"challenge done awarding 5 10 5");
                   parseScore(scoreMatrix.challengeWin, "challenge Win",petIndex);
                    petData.challengeWins += 1;
                    statChallenge.pass = true;
                } else if (!statChallenge.pass && statChallenge.target != 0) {
                    //Check if 3 mins have passed
                    let currentTime = new Date();
                    let creationDate = new Date(statChallenge.startTime);
                    let timeDifferenceMs = currentTime - creationDate;
                    if (timeDifferenceMs > 180000) {
                        //console.log("TP_Pet: " + "3 mins passed");
                        petDialog(petIndex, "Challenge Failed! " + statChallenge.value + "/" + statChallenge.target + " " + statChallenge.stat,5,10,"critical");
                        //console.log("TP_PET: " +"challenge done failed -4 -5 -5");
                        parseScore(scoreMatrix.challengeFail, "challenge Fail", petIndex);
                    } else {
                        //console.log("TP_Pet: " + "Challenge Amensty");
                        petDialog(petIndex, "Challenge Amenesty! " + statChallenge.value + "/" + statChallenge.target + " " + statChallenge.stat,5,10,"challenge");
                    }
                }
            }
        } else if (statChallenge.pass && statChallenge.target != 0) {
            petDialog(petIndex, "Challenge Complete! " + statChallenge.value + "/" + statChallenge.target + " " + statChallenge.stat,5,10,"success");
        }
        petData[petIndex].statChallenge = statChallenge
    }

    function checkPetState(petIndex){
        if (petData[petIndex].health < 23) {
            petDialog(petIndex, "unhealthy",9,10,"critical");
        } else if (petData[petIndex].happiness < 40) {
            petDialog(petIndex, "play",5,5);
        } else if (petData[petIndex].hunger < 15) {
            petDialog(petIndex, "hungry",9,10);
        } else {
            petDialog(petIndex, "random",1,5);
        }
    }

    //Splats
    // Load splats from local storage
    var storedSplats = GM_getValue("splats", splats);
    var splats = storedSplats || [];

    function petSplat(petIndex) {
        const xOffset = Math.floor(Math.random() * 101) - 50; // Random value between -50 and 50
        const yOffset = Math.floor(Math.random() * 101) - 50; // Random value between -50 and 50

        const splatX = petData[petIndex].position.x + xOffset;
        const splatY = petData[petIndex].position.y + yOffset;

        placeSplat({x: splatX, y: splatY});
    }

    function generateUniqueId() {
        // Generate a unique ID using a combination of the current timestamp and a random number
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 100000);
        return timestamp + "_" + random;
    }

    function getRandomSplatPosition() {
        var row = Math.floor(Math.random() * 2); // Randomly select a row (0 or 1)
        var column = Math.floor(Math.random() * 7); // Randomly select a column (0 to 6)
        return {
            row: row,
            column: column
        };
    }

    function placeSplat(position, splatPosition) {
        if (!splatPosition) {
            splatPosition = getRandomSplatPosition();
        }
        var splatId = generateUniqueId();

        // Create the canvas element
        var splatCanvas = document.createElement("canvas");
        splatCanvas.className = "tagagotchi-splat";
        if (pageLoc == "ingame") {
            splatCanvas.classList.add("in-game");
        }
        splatCanvas.id = splatId;
        splatCanvas.width = 60; // Set the canvas width to desired size
        splatCanvas.height = 60; // Set the canvas height to desired size
        splatCanvas.style.position = "absolute";
        splatCanvas.style.left = position.x + "px";
        splatCanvas.style.top = position.y + "px";

        var ctx = splatCanvas.getContext("2d");

        // Load the splat image should be loaded on page load
        // Calculate the source position of the splat on the sprite sheet
        var sourceX = splatPosition.column * 120;
        var sourceY = splatPosition.row * 120;

        // Draw the splat image onto the canvas
        ctx.drawImage(splatImageSpriteSheet, sourceX, sourceY, 120, 120, 0, 0, 60, 60);

        // Append the canvas element to the document body
        document.body.appendChild(splatCanvas);

        // Store the splat"s position and ID in the splats array
        var splatData = {
            id: splatId,
            position: position,
            spritePosition: splatPosition
        };
        splats.push(splatData);

        // Add event listener to remove the splat when clicked
        splatCanvas.addEventListener("click", function() {
            removeSplat(splatId);
        });

        // Save the splats array to local storage
        GM_setValue("splats", splats);
   }

    // Function to remove a splat from the page and storage
    function removeSplat(splatId) {
        // Find the splat in the splats array
        var splatIndex = splats.findIndex(function(splat) {
            return splat.id === splatId;
        });
        //console.log("TP_PET: " +"splat index is " + splatIndex);

        if (splatIndex !== -1) {
            // Remove the splat from the splats array
            splats.splice(splatIndex, 1);
            //console.log("TP_PET: " +"splat removed")

            // Save the updated splats array to local storage
            //localStorage.setItem("splats", JSON.stringify(splats));
            GM_setValue("splats", splats);

            // Remove the splat from the DOM
            var splatElement = document.getElementById(splatId);
            //console.log("TP_PET: " +splatElement);
            splatElement.remove();
        }
    }

    document.body.addEventListener("click", function(event) {
        if (event.target.classList.contains("tagagotchi-splat")) {
            removeSplat(event.target);
        }
    });

    // Function to recreate splats on page load
    function recreateSplats() {
        GM_deleteValue("splats");
        var tempSplats = splats;
        splats = [];
        tempSplats.forEach(function(splatData) {
            var position = splatData.position;
            var splatPosition = splatData.spritePosition;
            //console.log("TP_PET: " +"adding splat " + position.x + " " + position.y)

            // Call the placeSplat function to display the splat
            if (tagagotchiSettings.disableDisableEggs.value == 1) {
                console.log("TP_Pet: " + "tagagotchiSettings.disableDisableEggs.value == 0 && " + tagagotchiSettings.disableDisableEggs.value == 1);
                placeSplat(position, splatPosition);
            }

            //remove health keep pet enviroment clean.

            for (let pet = 0; pet < petData.length; pet++) {
                if (Math.random() < 0.5) {
                    parseScore(scoreMatrix.dirty, "Splats", pet);
                    petDialog(pet, "dirty",7,10, "dirty");
                }
            }

        });
    }

    function getRandomSplatId() {
        var splatSprite = {row: Math.floor(Math.random() * 2), col: Math.floor(Math.random() * 7)}
        return splatSprite;
    }

    //Tagagotchi Tab Creation
    function addPetCemTab(){
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.innerText = "Tagagotchi";
        link.addEventListener("click", openPetCemetary);
        li.id = "tagagotchi_nav";
        li.appendChild(link);
        const tpMobileMenu = document.getElementById("dropdownMenu");
        tpMobileMenu.appendChild(li);
    }

    function openPetCemetary(){
        //R300 destroyer -- FU r300
        let r300 = document.querySelector("#R300");
        if (r300 != null){ r300.remove(); }
        const container = document.querySelector("#userscript-top + .container");
        const activeTab = document.querySelector(".active-tab");
        const tagagotchiTab = document.querySelector("#tagagotchi_nav");
        tagagotchiTab.classList.add("active-tab");
        let newHTML= /*html*/ `
                     <h1 class="header-title">Tagagotchi - Virtual Tagpro Pet</h1>
                     <div class="pet_nav">
                         <ul>
                         <button class="tab-btn btn btn-default" data-target="petCemetery">Pet Cemetery</button>
                         <button class="tab-btn btn btn-default" data-target="petCareGuide">Pet Care Guide</button>
                         <button class="tab-btn btn btn-default" data-target="petSettings">Settings</button>
                         <button class="tab-btn btn btn-default" data-target="petAcknowledgements">Acknowledgements</button>
                     </div>
				     <div class="containerHTML">
                         <div class="content-section" id="petCemetery">
                         <div id="resetpetContainer"></div><span id="tagagotchi-reset-warning" style="font-size:16px;display: none;"><i>Note: refresh page after removing a pet</i></span>
					         <div id="tagagotchi_cemetery">
					         </div>
				        </div>
                        <div class="content-section" id="petCareGuide">
					         <div id="tagagotchi_petCareGuide">
					         </div>
                             <div>
                                 <p style="font-size:16px;"><i>* Round up (7.5+7.5*(Pet Mood/100)+(Pet hunger/100))<br />
                                 ** Round down (-7.5+-7.5*(Pet Mood/100)+(Pet hunger/100))</i></p>
                             </div>
                             <hr />
                             <div>
                                 <p style="font-size:16px;"><b>Egg Laying</b><br />
                                     For every 10 challenge wins your Tagagotchi has a 10% chance of laying a new egg after winning a game.<br /><br />
                                     <span style="font-size:12px;">Conditions for pet to be eligible to lay an egg:<br />
                                         <span class="tab-indent">1. The player won the game.</class>
                                         <br />
                                         <span class="tab-indent">2. Challenge completions is greater than 10.</class>
                                         <br />
                                         <span class="double-indent"><i>-If this pet has previously laid eggs, the number of challenge wins required increases by 10 for each egg layed</i></class><br />
                                         <br />
                                         <span class="tab-indent">If all of the above is true, two random numbers between 1 and 10 are generated, if they match an egg is laid</class>
                                     </span>
                                 </p>
                             </div>
                             <hr />
                             <a href="https://docs.google.com/document/d/1gesBpU7_JbS_abU4rgriYB3VqBCyeulCGKufRXaKrNk/edit?usp=sharing">Google Docs Version</a>
                             <br />
                        </div>
                        <div class="content-section" id="petSettings">
                             <h2 class="header-title">Settings</h2>
					         <div id="tagagotchi_settings" class="profile-settings block">
					         </div>
                             <hr />
                             <br />
                             <div id="resetsetContainer"></div>
				        </div>
                        <div class="content-section" id="petAcknowledgements">
					         <div id="creditsLists">
                             <p>
                                    <br /><h2 class="header-title">Credits</h2>
                                    <hr />
                                    <h3 class="header-title"><b>LuckySpammer + TagPro Dev Team</h3>
                                    <p> \u2003 Reddit: <a href="https://www.reddit.com/user/LuckySpammer">/u/LuckySpamer</a></p>
                                    <p> \u2003 Reddit: <a href="https://www.reddit.com/user/ylambda">/u/ylambda</a></p>
                                    <p> \u2003 Reddit: <a href="https://www.reddit.com/user/bash_tp">/u/bash_tp</a></p>
                                    <p> \u2003 Discord: Carl No U - @JmTechArt</p>
                                    <p> \u2003 Discord: DaEvil1 - @DaEvil1</p>
                                    <p> \u2003 \u2003 Original TagPro Art Work + API for Classic Red ball, Classic Blue ball, Zombie, Jimmywise, Easter Bunny, Shaggy Easter Bunny</p>
                                    <br /><hr />
                                    <h3 class="header-title"><b>Pepi</b></h3>
                                    <p>\u2003 Reddit.com - <a href="https://www.reddit.com/user/PepiHopi">/u/PepiHopi</a></p>
                                    <p>\u2003 Webtoons.com - <a href="https://www.webtoons.com/en/challenge/tagpop-tagpro-comic/list?title_no=779336">TagPop</a></p>
                                    <p>\u2003 \u2003 Artwork for Anguish Balls Red and Blue, Art work and character vision for BallArts and TagBot - <a herf="https://www.reddit.com/r/TagPro/comments/vgfcvp/tagpop_tagpro_comic_strategy/">Check out TagPop!</a></p>
                               <hr />
                               <br /><hr />
                                    <h3 class="header-title"><b>Nabby</b></h3>
                                    <p>\u2003 Reddit.com - <a href="https://www.reddit.com/user/nabbynz">/u/nabbynz</a></p>
                                    <p>\u2003 Github.com - <a href="https://gist.github.com/nabbynz">Nabbynz @ Github</a></p>
                                    <p>\u2003 \u2003 Code snippets from R300 script, including WhichPageAreWeOn, and Options Menu</p>
                               <hr />
                               </p>
					         </div>
				        </div>
                    </div>
                    `

        container.innerHTML = newHTML;
        const cemeteryDiv = document.getElementById("tagagotchi_cemetery");

        const petArray = GM_getValue("tagagotchi_pet_cemetery");
        if (typeof petArray !== "undefined") {
            const petTable = createPetTable(petArray);
            // Append the table to the div.
            cemeteryDiv.appendChild(petTable);
        } else {
            cemeteryDiv.innerHTML = "<h2 class='header-title'>Pet Cemetery</h2><p>Past pets will appear here including stats</p>"
        }
        if (activeTab) { activeTab.classList.remove("active-tab")};

        //create settings tab content
        createOptionsPage();

        //Create petCage tab content
        const petCareGuide = document.getElementById("tagagotchi_petCareGuide");
        const petCareTable = createPetCareTable();
        // Append the table to the div.
        petCareGuide.appendChild(petCareTable);

        //add reset pet button
        // Create the new button element
        var resetPetBtn = document.createElement("button");
        resetPetBtn.id = "newButton";
        resetPetBtn.className = "btn btn-primary";
        resetPetBtn.type = "button";
        resetPetBtn.textContent = "Remove a pet";

        let targetPet;

        // Add click event listener to the new button
        resetPetBtn.addEventListener("click", function() {
            $('.tagagotchi_-dialog').remove();
            if (targetPet !== null) {
                var tagagotchi = document.getElementById("tagagotchi-pet-"+targetPet);
                let refreshWarning = document.getElementById("tagagotchi-reset-warning");
                refreshWarning.style.display = 'inline'; // Show the warning message
                // Scroll to the #tamagotchi-pet element
                tagagotchi.scrollIntoView({ behavior: "auto", block: "center" });
                let petToDie = targetPet;
                setTimeout(function() {
                    petDead(petToDie);
                }, 1500);
            }
        });

        resetPetBtn.addEventListener("mousedown", function() {
            $('.tagagotchi_-dialog').remove();
            targetPet = Math.floor(Math.random() * petData.length);
            petDialog(targetPet, "unhealthy",100,10,"critical");
        });

        resetPetBtn.addEventListener("mouseout", function() {
            $('.tagagotchi_-dialog').remove();
            targetPet = null; // Reset targetPet to null when the mouse moves out
        });

        var parentContainer = document.getElementById("resetpetContainer");
        // Insert the reset pet button.
        parentContainer.appendChild(resetPetBtn);

        //add reset pet button
        // Create the new button element
        var resetSettingsBtn = document.createElement("button");
        resetSettingsBtn.id = "newButton";
        resetSettingsBtn.className = "btn btn-primary";
        resetSettingsBtn.type = "button";
        resetSettingsBtn.textContent = "Default Settings";

        // Add click event listener to the new button
        resetSettingsBtn.addEventListener("click", function() {
            tagagotchiSettings = tagagotchiDefaults;
            GM_setValue("tagagotchiSettings", tagagotchiSettings);

            createOptionsPage()
        });

        parentContainer = document.getElementById("resetsetContainer");
        // Insert the reset pet button.
        parentContainer.appendChild(resetSettingsBtn);

        // Add event listeners to tab buttons
        const tabButtons = document.querySelectorAll(".tab-btn");
        tabButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const targetTab = button.getAttribute("data-target");
                switchTab(targetTab);
            });
        });
        switchTab("petCemetery");
    }

     function createPetCareTable() {

        // Create the table element
        const table = document.createElement("table");
        table.classList.add("table", "table-stripped", "table-bordered");

        // Create the table header row
        const tableHead = document.createElement("thead");
        table.appendChild(tableHead)
        const headerRow = document.createElement("tr");
        const headers = ["Stat", "Health Effect", "Mood Effect", "Fullness Effect", "Notes"];
        headers.forEach(headerText => {
            const headerCell = document.createElement("th");
            headerCell.classList.add("text-center", "column");
            headerCell.textContent = headerText;
            headerRow.appendChild(headerCell);
        });
        tableHead.appendChild(headerRow);

         // Create the table body
         const tableBody = document.createElement("tbody");
         table.appendChild(tableBody);

         // Loop through the scoreMatrix and create a row for each stat type
         for (const stat in scoreMatrix) {
             const rowData = scoreMatrix[stat];
             const row = document.createElement("tr");

             // Create the stat column
             const statCell = document.createElement("td");
             statCell.textContent = rowData.displayName;
             statCell.classList.add("table-row-label")
             row.appendChild(statCell);

             // Create the health effect column
             const healthCell = document.createElement("td");
             if (rowData.health != 0) {
                 healthCell.textContent = rowData.health;
                 if (rowData.health < 0) {
                     healthCell.classList.add("negative-effect");
                 } else if (rowData.health > 0) {
                     healthCell.classList.add("positive-effect");
                 }
             } else if (rowData.displayName == "Game Win") {
                 healthCell.textContent = "+7.5 to +23"
                 healthCell.classList.add("positive-effect");
             } else if (rowData.displayName == "Game Loss") {
                 healthCell.textContent = "-7.5 to -23"
                 healthCell.classList.add("negative-effect");
             }
             healthCell.classList.add("effect-cell");
             row.appendChild(healthCell);

             // Create the mood effect column
             const moodCell = document.createElement("td");
             if (rowData.happiness != 0) {
                 moodCell.textContent = rowData.happiness;
             }
             moodCell.classList.add("effect-cell");
             if (rowData.happiness < 0) {
                 moodCell.classList.add("negative-effect");
             } else if (rowData.happiness > 0) {
                 moodCell.classList.add("positive-effect");
             }
             row.appendChild(moodCell);

             // Create the fullness effect column
             const fullnessCell = document.createElement("td");
             if (rowData.hunger != 0) {
                 fullnessCell.textContent = rowData.hunger;
             }
             fullnessCell.classList.add("effect-cell");
             if (rowData.hunger < 0) {
                 fullnessCell.classList.add("negative-effect");
             } else if (rowData.hunger > 0) {
                 fullnessCell.classList.add("positive-effect");
             }
             row.appendChild(fullnessCell);

             // Create the notes column
             const notesCell = document.createElement("td");
             notesCell.textContent = rowData.notes;
             row.appendChild(notesCell);

             // Add the row to the table body
             tableBody.appendChild(row);
         }

        return table;
    }

    function createPetTable(petArray) { //Pet cemetery table
        // Sort pets based on gamesPlayed in descending order
        petArray.sort((a, b) => b.gamesPlayed - a.gamesPlayed);

        // Create the table element
        const table = document.createElement("table");
        table.classList.add("table", "table-stripped", "table-bordered");

        // Create the table header row
        const tableHead = document.createElement("thead");
        table.appendChild(tableHead)
        const headerRow = document.createElement("tr");
        const headers = ["Name", "Image", "Games Played", "Challenges", "Wins", "Losses", "Death Date"];
        headers.forEach(headerText => {
            const headerCell = document.createElement("th");
            headerCell.classList.add("text-center", "column");
            headerCell.textContent = headerText;
            headerRow.appendChild(headerCell);
        });
        tableHead.appendChild(headerRow);

        // Loop through the pets and create a row for each
        petArray.forEach(pet => {
            const row = document.createElement("tr");
            // Add columns for each property of the pet object
            //const headers = ["Name", "Image", "Games Played", "Challenges", "Wins", "Losses", "Death Date"];
            const columns = [
                pet.name, //Name
                "", //Image
                pet.gamesPlayed,
                (pet.challengeWins ?? "missing"),
                pet.wins,
                (pet.gamesPlayed - pet.wins),
                pet.deathDate,
            ];

            columns.forEach((columnText, columnIndex) => {
                const cell = document.createElement("td");
                if (columnIndex === 1) { // Check if it's the column for the image
                    createPetImageElement(pet.varietyIndex, pet.variant, function(imgElement) {
                        cell.appendChild(imgElement);
                    });
                } else {
                    cell.textContent = columnText;
                }

                row.appendChild(cell);
            });

            // Append the row to the table
            table.appendChild(row);
        });

        return table;
    }

    function createPetImageElement(varietyIndex, variant, callback) {
        const petVariety = petVarieties[varietyIndex];
        const petImage = (variant !== false) ? petVariety.image[variant] : petVariety.image;
        const spriteIndex = (variant !== false) ? petVariety.spriteIndex[variant] : petVariety.spriteIndex;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        //console.log(spriteIndex.fixHeight);
        const img = new Image();
        img.crossOrigin="anonymous"
        img.src = petImage;
        img.onload = function() {
            canvas.width = spriteSize;
            canvas.height = spriteSize + spriteIndex.fixHeight;
            ctx.drawImage(img,
                          spriteIndex.x * spriteIndex.size,
                          (spriteIndex.y * spriteIndex.size) - spriteIndex.fixHeight,
                          spriteIndex.size,
                          spriteIndex.size + spriteIndex.fixHeight,
                          0,
                          0,
                          spriteSize,
                          spriteSize + spriteIndex.fixHeight,
                         );

            const dataURL = canvas.toDataURL();
            const imgElement = document.createElement("img");
            imgElement.src = dataURL;
            imgElement.style.width = `${spriteSize}px`;
            imgElement.style.height = `${spriteSize}px`;

            // Call the callback function with the imgElement as the argument
            callback(imgElement);
        };
    }

    // Function to generate HTML elements for options
    function createOptionsPage() {
        var optionsContainer = document.getElementById("tagagotchi_settings");
        optionsContainer.innerHTML = "";
        var optionsList = document.createElement("form"); // Create a <ul> for all settings
        optionsList.classList.add("form", "form-horizontal");

        for (var key in tagagotchiSettings) {
            var setting = tagagotchiSettings[key];
            //console.log("TP_Pet: " + "current setting: " + JSON.stringify(setting));

            var listItem = document.createElement("div"); // Create a <li> for each setting
            listItem.classList.add("form-group");
            //listItem.style.display = "flex"; // Use flexbox to arrange label and input elements

            if (setting.type === "subradio") {
                let label = document.createElement("p");
                label.classList.add("col-sm-4", "control-label");
                label.textContent = setting.display + " ";
                listItem.appendChild(label);
                var defaultValue = setting.value;
                for (var i = 0; i < setting.option.length; i++) {
                    let optionValue = setting.option[i];
                    let label = document.createElement("label");
                    label.style.marginLeft = "10px";
                    label.textContent = optionValue;
                    listItem.appendChild(label);
                    let radioInput = document.createElement("input");
                    radioInput.type = "radio";
                    radioInput.name = key;
                    radioInput.value = optionValue;
                    radioInput.checked = defaultValue === optionValue;
                    radioInput.dataset.key = key; // Set data-key attribute to store the key
                    radioInput.addEventListener("change", function () {
                        let key = this.dataset.key;
                        //console.log("TP_Pet: " + "value changed for setting: " + key);
                        if (key == "inGameTransparency") {
                            let regex = /\.in-game\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
                            let updatedValue = this.value/100;
                            let updatedCSS = styleElement.innerHTML.replace(regex, `.in-game { opacity: ${updatedValue}; }`);
                            styleElement.innerHTML = updatedCSS;
                            regex = /\.in-game.tagagotchi-pet\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
                            updatedValue = this.value/100;
                            updatedCSS = styleElement.innerHTML.replace(regex, `.in-game.tagagotchi-pet { opacity: ${updatedValue}; }`);
                            styleElement.innerHTML = updatedCSS;
                        } else if (key == "splatsTransparency") {
                            let regex = /\.in-game.tagagotchi-splat\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
                            let updatedValue = this.value/100;
                            let updatedCSS = styleElement.innerHTML.replace(regex, `.in-game.tagagotchi-splat { opacity: ${updatedValue}; }`);
                            styleElement.innerHTML = updatedCSS;
                            petSplat(0);
                            petDialog("global", "dirty",2,10, "dirty")
                        } else if (key == "dialogTransparency") {
                            let regex = /\.in-game.tagagotchi_-dialog\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
                            let updatedValue = this.value/100;
                            let updatedCSS = styleElement.innerHTML.replace(regex, `.in-game.tagagotchi_-dialog { opacity: ${updatedValue}; }`);
                            styleElement.innerHTML = updatedCSS;
                            petDialog("global", "random",2,10)
                        }
                        pageLoc = "ingame";
                        var tagagotchiElements = document.querySelectorAll("[class^='tagagotchi-']");
                        for (var i = 0; i < tagagotchiElements.length; i++) {
                            tagagotchiElements[i].classList.add("in-game");
                        }
                        tagagotchiSettings[key].value = parseInt(this.value);
                        GM_setValue("tagagotchiSettings", tagagotchiSettings);
                    });

                    listItem.appendChild(radioInput);
                }
            } else if (setting.type === "checkbox") {
                let inputElement = document.createElement("input");
                let label = document.createElement("p");
                label.classList.add("col-sm-4", "control-label");
                label.textContent = setting.display + " ";
                listItem.appendChild(label);

                inputElement.type = "checkbox";
                inputElement.checked = setting.value === 1;
                inputElement.dataset.key = key; // Set data-key attribute to store the key
                inputElement.addEventListener("change", function () {
                    //console.log("TP_Pet: " + "value changed for setting: " + this.dataset.key);
                    tagagotchiSettings[this.dataset.key].value = this.checked ? 1 : 0;
                    GM_setValue("tagagotchiSettings", tagagotchiSettings);
                    if (this.dataset.key == "disableParticles") {
                        animateStats("egg", 5, "Egg Graphic", 0);
                    }
                });
                listItem.appendChild(inputElement);
            } else if (setting.type === "number") {
                let inputElement = document.createElement("input");
                let label = document.createElement("p");
                label.classList.add("col-sm-4", "control-label");
                label.textContent = setting.display + " ";
                listItem.appendChild(label);
                inputElement.type = "number";
                inputElement.textContent = setting.value;
                inputElement.value = setting.value;
                inputElement.style.color = "black";
                inputElement.dataset.key = key; // Set data-key attribute to store the key
                inputElement.addEventListener("change", function () {
                    //console.log("TP_Pet: " + "value changed for setting: " + this.dataset.key);
                    tagagotchiSettings[this.dataset.key].value = parseInt(this.value);
                    GM_setValue("tagagotchiSettings", tagagotchiSettings);
                });
                listItem.appendChild(inputElement);
            }

      		optionsList.appendChild(listItem); // Append <li> to <ul>
		optionsList.appendChild(document.createElement("hr"))
  }

    optionsContainer.appendChild(optionsList); // Append <ul> to the main container
}

    function switchTab(tabName) {
        // Hide all content sections
        const contentSections = document.querySelectorAll(".content-section");
        contentSections.forEach((section) => {
            section.style.display = "none";
        });

        // Show the selected content section
        const selectedSection = document.getElementById(tabName);
        selectedSection.style.display = "block";

        // Update the active tab button
        const tabButtons = document.querySelectorAll(".tab-btn");
        tabButtons.forEach((button) => {
            if (button.getAttribute("data-target") === tabName) {
                button.classList.add("btn-secondary");
                button.classList.remove("btn-default");
            } else {
                button.classList.remove("btn-secondary");
                button.classList.add("btn-default");
            }
        });
    }

    var WhichPageAreWeOn = function() { //stolen from r300
        if (window.location.port || window.location.href.endsWith("/game") ) { //In a real game
            return("ingame");
        } else if (document.URL.includes("/games/find")) { //Joining page
            return("joiner");
        } else if (document.URL.includes("/profile/")) {
            if ($("#saveSettings").length) {
                return("profile"); //Profile page and logged in
            } else {
                return("profileNotOurs"); //Profile page, but not our one (or we"re logged out)
            }
        } else if (document.URL.includes("#settings")) {
            return("settings");
        } else if ($("#userscript-home").length) { //Chosen server homepage
            return("server");
        }
    };

    var pageLoc = WhichPageAreWeOn();
    if (pageLoc == "server") {
        var playNowElement = document.getElementById("play-now");

        playNowElement.addEventListener("mousedown", function() {
            petDialog("global", "play",1,5);
        });
    }

    //DEBUG!!!!!
    // Add a button or trigger to call clearPetFromStorage function when needed
/*var clearButton = document.createElement("button");
    clearButton.textContent = "";
    clearButton.style.position = "absolute";
    clearButton.style.top = "250px";
    clearButton.style.right = "10px";
    clearButton.addEventListener("click", tester);
    document.body.appendChild(clearButton);
    function tester() {
        let petCount = 2;
        for (let i = 0; i < petCount; i++) {
            let newPet = generateNewPet();
            newPet.gamesPlayed = 10;
            newPet.challengeWins = 1;
            newPet.stats = {
                tags: 9,
                returns: 3,
                captures: 3,
                powerups: 3,
                drops: 9,
                pops: 9,
                snipes: 3,
            }
            newPet.position = {x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 500)}
            let petIndex = petData.push(newPet)
            petIndex --;
            drawPet(petIndex);
        }
        savePetToStorage();
    }

    function tester2() {
        for (let i = 0; i < petData.length; i++) {
            animateStats("death", 5, "Pet Dead", i)
            animateStats("death", -5, "Pet Dead", i)
        }
    }
    function okThenChallenge() {
        let petCount = 2;
        for (let i = 0; i < petCount; i++) {
            let newPet = generateNewPet();
            newPet.gamesPlayed = 10;
            newPet.challengeWins = 10;
            newPet.stats = {
                tags: 9,
                returns: 3,
                captures: 3,
                powerups: 3,
                drops: 9,
                pops: 9,
                snipes: 3,
            }
            newPet.position = {x: Math.floor(Math.random() * 800), y: Math.floor(Math.random() * 500)}
            let petIndex = petData.push(newPet)
            petIndex --;
            drawPet(petIndex);
        }
        savePetToStorage();
    }*/

    // Add CSS styles by creating a <style> element and appending it to the head
    var styleElement = document.createElement("style");
    styleElement.innerHTML = `
        :root {
            --iconY: 40px;
        }
        .tagagotchi-class {
            position: absolute;
		    z-index: 9999;
        }
        /* Menu container */
		.tagagotchi-menu {
		  position: absolute;
		  z-index: 9999;
		  background-color: #050505;
		  color: #fff;
		  border: 2px solid #fff;
		  border-radius: 4px;
		  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		  padding: 5px;
		  font-family: "Press Start 2P", sans-serif;
		  font-size: 10px;
		  line-height: 1.2;
		}
		/* Menu content */
		.tagagotchi-menu-content {
		  margin-top: 2px;
		}
		.tagagotchi_-dialog {
            position: absolute;
            z-index: 9998;
            background-color: #050505;
            color: #fff;
            border: 2px solid #fff;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            padding: 10px;
            font-family: "Press Start 2P", sans-serif;
            font-size: 10px;
            line-height: 1.2;
            max-width: 350px;
            width: auto; /* Allow the width to adjust based on content */
        }
        .tagagotchi_-dialog-content {
            white-space: pre-wrap; /* Allow line breaks and wrap long lines */
            word-break: break-word; /* Break long words and wrap to the next line */
            height: auto; /* Remove the fixed height */
            line-height: normal; /* Remove the fixed line-height */
        }
        .tagagotchi_-dialog::before {
            content: "";
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            border-style: solid;
            border-width: 0 8px 8px 8px;
            border-color: transparent transparent #000 transparent;
        }
        .tagagotchi_-dialog-content.tagagotchi-dialog-critical {
            color: #fe010f;
            font-weight: bold;
        }
        .tagagotchi_-dialog-content.tagagotchi-dialog-success {
            color: #25d812;
            font-weight: bold;
        }
        .tagagotchi_-dialog-content.tagagotchi-dialog-challenge {
            color: #d2ff00;
            font-weight: bold;
        }
        .tagagotchi_-dialog-content.tagagotchi-dialog-dirty {
            color: #a6811b;
            font-weight: bold;
        }
        .tagagotchi-splat {
        z-index: 8888;
        }
        #tagagotchi-pet {
        z-index: 9999;
        }
        .in-game {
		  opacity: 0.6;
		}
        .in-game.tagagotchi-splat {
		  opacity: 0.6;
		}
        .in-game.tagagotchi_-dialog {
		  opacity: 0.6;
		}
        .in-game.tagagotchi-pet {
		  opacity: 0.6;
		}
		.stat-bar {
		  height: 10px;
		  width: 220px; /* Adjust the width as needed */
		  margin-bottom: 5px;
		  position: relative;
          border: 1px solid white;
          border-radius: 4px;
		}
        .effect-cell {
           padding: 10px;
        }
        .negative-effect {
            background-color: #bf1d1d; /* Soft red shade for negative effects */
        }
        .positive-effect {
            background-color: #6ae573; /* Soft green shade for positive effects */
         }
         .tab-indent {
             padding-left: 20px; /* Adjust the value to control the indentation */
         }
         .double-indent {
             padding-left: 40px; /* Adjust the value for double indentation */
         }
    `;
    document.head.appendChild(styleElement);

    //Watch for game start
    var gameStartCount = 0;
    function initiate() {
        (function init(gameStart, startTime) {
            if (Date.now() - startTime > 15000) {
                gameStartCount++;
                startTime = Date.now();
                for (let pet = 0; pet < petData.length; pet++) {
                    petRandomDialog(pet);
                }
                if (gameStartCount > 50) {
                    console.log("TP_PET: " +" 0x1 - Could not detect game Spec mode: " + tagpro.spectator);
                    return;
                }
            } else if(pageLoc != "ingame") {
                console.log("TP_PET: " +"  0x2 - not in game page")
                return;
            }
            if (typeof tagpro !== "undefined" && tagpro.players) {
                if (tagpro.playerId != null && !tagpro.spectator) {
                    gameStart();
                    petDialog("global", "Game started");
                    //console.log("TP_PET: " +" 0x3 - fired game started spec mode is: " + tagpro.spectator);
                } else {
                    setTimeout(init, 500, gameStart, startTime);
                    //console.log("TP_PET: " +" 0x4 - normal just waiting - spec mode is " + tagpro.spectator);
                }
            } else {
                if (typeof tagpro.spectator !== "undefined") {
                    //console.log("TP_PET: " +" 0x5 - spec mode is " + tagpro.spectator);
                }
                setTimeout(init, 500, gameStart, startTime);
                //console.log("TP_PET: " +"not fired 1 ");
            }
        })(gameStart, Date.now());
    }

    function pageLoaded() {
        //Load Options
        tagagotchiSettings = $.extend(true, {}, tagagotchiDefaults, GM_getValue("tagagotchiSettings", tagagotchiSettings)); //Loads saved settings from options and merges

        //load stats/spats spritesheet
        try {
        statSpriteSheetImage = new Image();
        statSpriteSheetImage.src = defaultPet.statsSprites;
        splatImageSpriteSheet = new Image();
        splatImageSpriteSheet.src = defaultPet.splatSpriteSheet;
        } catch (error) {
            console.error('TP_Pet: Failed to load flair.png or splats.png:', error);
        }

        if (GM_getValue("tagagotchiSettings") === "undefined") { //first time
            GM_setValue("tagagotchiSettings", tagagotchiSettings);
        }
        //console.log("TP_PET: " +"Settings Loaded: " + JSON.stringify(tagagotchiSettings));

        //set custom styles
        let regex = /\.in-game\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
        let updatedValue = tagagotchiSettings.inGameTransparency.value/100;
        let updatedCSS = styleElement.innerHTML.replace(regex, `.in-game { opacity: ${updatedValue}; }`);
        styleElement.innerHTML = updatedCSS;
        regex = /\.in-game.tagagotchi-pet\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
        updatedValue = tagagotchiSettings.inGameTransparency.value/100;
        updatedCSS = styleElement.innerHTML.replace(regex, `.in-game.tagagotchi-pet { opacity: ${updatedValue}; }`);
        styleElement.innerHTML = updatedCSS;
        regex = /\.in-game.tagagotchi-splat\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
        updatedValue = tagagotchiSettings.splatsTransparency.value/100;
        updatedCSS = styleElement.innerHTML.replace(regex, `.in-game.tagagotchi-splat { opacity: ${updatedValue}; }`);
        styleElement.innerHTML = updatedCSS;
        regex = /\.in-game.tagagotchi_-dialog\s*\{\s*opacity:\s*\d+(\.\d+)?\s*;\s*\}/;
        updatedValue = tagagotchiSettings.dialogTransparency.value/100;
        updatedCSS = styleElement.innerHTML.replace(regex, `.in-game.tagagotchi_-dialog { opacity: ${updatedValue}; }`);
        styleElement.innerHTML = updatedCSS;

        startDrawing();

        //console.log("TP_PET: " +"onload completed");
        setTimeout(function() {
            //console.log("TP_PET: " +"WhichPageAreWeOn" + pageLoc);
            switch (pageLoc) {
                case "ingame":
                    // Handle "ingame" state
                    //console.log("TP_PET: " +"chcking game start");
                    initiate();
                    break;
                case "server":
                    // home page
                    //console.log("TP_PET: " +"homepage");
                    setTimeout(function() {
                        petDialog("global", "random");
                    }, 1500);
                    addPetCemTab();
                    break;
                case "profile":
                    //Add kill pet button.
                    addPetCemTab();

                    break;
                default:
                    // Handle unknown or random state
                    //console.log("TP_PET: " +"pageLoaded unkown");
                    break;
            }
            //TO DO MULTIPET
            checkPetState(0)
            recreateSplats();
        }, 120);
    }

    function startDrawing() {
        //Start the minigame draw the pet.
        for (let i = petData.length - 1; i >= 0; i--) {
            if (petData[i].dead) {
                // Remove the element from the array
                petData.splice(i, 1);
            }
        }
        savePetToStorage();
        for (let i = petData.length - 1; i >= 0; i--) {
            drawPet(i);
        }
    }
    // Code to be executed when all elements are loaded
    setTimeout(pageLoaded, 100);


})();
