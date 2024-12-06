// ==UserScript==
// @name         Ranked Pubs
// @namespace    https://gitlab.com/anom/tagpro-userscripts/
// @version      1.7.0
// @description  Pubs that suck less. It uses pub data extracted from the Game History. For every game, each player receives a rating, and this rating is used to determine the rankings. <a href="https://www.reddit.com/r/TagPro/comments/1abvaue/userscript_ranked_pubs/"> More Info</a>
// @updateURL    https://gitlab.com/anom/tagpro-userscripts/-/raw/main/ranked-pubs.user.js
// @downloadURL  https://gitlab.com/anom/tagpro-userscripts/-/raw/main/ranked-pubs.user.js
// @TPMUSJMURL	 https://raw.githubusercontent.com/rfmx49/TagProMobileUserScripts/refs/heads/main/repository/ranked_pubs.user.js

// @match        home, profile, boards, history
// @author       anom
// ==/UserScript==


(async function() {
   'use strict'

   const cssBlock = `
:root {
  color-scheme: dark;
}


.recent-games {
     margin-bottom: 1rem;
}

     .match.winner-red {
         --bg: #df4444;
         box-shadow: -3px 0 0 0 var(--bg);
         border-radius: 0 .2rem .2rem 0;
         background: #df44441f;
         border: 1px solid #df44442b;
     }

     .match.winner-blue {
         --bg: #0099ff;
         box-shadow: 3px 0 0 0 var(--bg);
         border-radius: .2rem 0 0 .2rem;
         background: #0099ff1a;
         border: 1px solid #0099ff2e;
     }


.match {
         margin-bottom: 1rem;
         padding: .5rem;
         margin-bottom: 20px;
         padding: 10px;
         border-radius: 3px;
         font-size: 16px;
         display: flex;
     }

     .match .table tbody tr {
         background: none;
     }

     .match .table tbody tr:nth-of-type(odd)1 {
         background: #00000021;
     }

     .match .table tbody tr:nth-of-type(even)1 {
         background: #ffffff0a;
     }

     .match .up {
         --score-change: #8ee31e
     }

     .match .down {
         --score-change: #df4444
     }

     .match .skillchange {
         color: color-mix(in srgb, white, var(--score-change) 90%);
         font-size: .55rem;
     }

     .match .red .skillchange {
         text-align: left;

         .openskill {
             text-align: right;
             margin-right: .3rem;
         }
     }

     .match .blue .skillchange {
         text-align: right;

         .openskill {
             text-align: left;
             margin-left: .3rem;
         }
     }

     .match .team tbody tr td .flair {
         vertical-align: -2px;
     }

     .match thead {
         background: none;
     }

     .match .text-left .flair {
         margin-right: 0.2rem;
     }

     .match .text-right .flair {
         margin-left: 0.2rem;
     }

     .match .openskill {
         display: inline-block;
         width: 2.2rem;
         color: #d0d0d0;
         font-size: .6rem;
     }

     .match .name {
         color: white;
     }

     .match .name a {
         color: white;
     }

     .name a:hover {
         color: #8BC34A
     }

     .match .quit-game {
         opacity: .5
     }

     .match .result {
         color: var(--bg);
         font-size: 1.2rem;
         text-align: center;
     }

     .match .middle {
         display: flex;
         align-items: stretch;
         justify-content: center;
         flex-direction: column;
         padding: 0;
         margin: 0;
         text-align: center;
     }

     .match .score {
         padding: .25rem .5rem;
         font-size: 1.7rem;
         font-weight: bold;
         line-height: 1.7rem;
         color: white;
     }

     .match.winner-red .red_score {
         color: var(--bg)
     }

     .match.winner-blue .blue_score {
         color: var(--bg)
     }

     .match .map {
         font-size: 1rem;
     }

     .match .datetime {
         font-size: .7rem;
     }

     .match .map a,
     .match .datetime a {
         color: white;
     }

     .match .map a:hover,
     .match .datetime a:hover {
         color: #8BC34A;
     }

     .match .team {
         padding-left: 0;
         padding-right: 0;
     }

     .match .tab-list {
         margin-left: -10px;
         margin-right: -10px
     }

     .match .prediction {
         margin-top: 1rem;
         font-size: .6rem
     }

     .match .winner-blue .prediction {
         color: #b1e0ff75
     }

     .match .winner-red .prediction {
         color: #ffb3b37d
     }






.anom_table thead {
    position: sticky;
	top: 0;
	z-index: 9999;
}

.anom_table .form {
    flex: 1;
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 0.5rem;
}

.anom_table .form a {
    background: var(--color);
    position: relative;
    text-decoration: none;
    display: block;
    width: 4px;
    height: 0.8rem;
    margin-right: 3px;
    border-radius: 2px;
}

.anom_table .winner {
    --color: #97df44;
}

.anom_table .loser {
    --color: #df4444;
}

.anom_table tbody tr:hover {
    background: #255636 !important
}

.anom_table thead .active {
    background: color-mix(in srgb, #353535, #6bdf44)
}

.anom_table thead th {
    cursor: pointer
}

[data-column="skill"],
[data-column="cd"],
[data-column="w"],
[data-column="cf"],
[data-column="winpercent"] {
    --bg-td: #7c52cf;
}

[data-column="l"],
[data-column="ca"] {
    --bg-td: #df4444;
}

[data-column="map"] a {color:white}
[data-column="map"] a:hover {color: #8BC34A}

.anom_table .flair {
    margin-right: 5px
}

.anom_table_small {
    width:100%;
}
.anom_table_small thead tr { background: #1b1b1bb3 }
.anom_table_small thead td { font-weight: bold; padding-top: 5px; padding-bottom: 5px; }
.anom_table_small td {
    padding: 0.2em 0.5em;
    font-size: 16px;
}
.anom_table_small tbody tr:nth-of-type(even) {
    background: #404040;
}
.anom_table_small tbody tr:nth-of-type(odd) {
    background: #353535;
}
.anom_table_small .table-row-label {
    color: #d0d0d0;
    border-right: 4px solid #1b1b1bb3;
    box-sizing: border-box;
}
.header-title.map-name { margin-bottom:10px; border-bottom: none; }
     `;
   const styleElement = Object.assign(document.createElement('style'), { type: 'text/css' })
   styleElement.appendChild(document.createTextNode(cssBlock))
   document.head.appendChild(styleElement)

    const anom_util = {
        findParentBySelector: (node, selector) => {
            while (node && node.parentNode) {
                let list = node.parentNode.querySelectorAll(selector)

                if (Array.prototype.includes.call(list, node))
                    return node

                node = node.parentNode
            }

            return node | ''
        },

        timeAgo: timestampString => {
            const timestamp = new Date(timestampString)
            const now = new Date(new Date().toISOString())
            const seconds = Math.floor((now - timestamp) / 1000)

            if (seconds < 60) {
                return seconds + 's ago';
            } else if (seconds < 3600) {
                const minutes = Math.floor(seconds / 60)
                return minutes + 'm ago'
            } else if (seconds < 86400) {
                const hours = Math.floor(seconds / 3600)
                return hours + 'h ago'
            } else if (seconds < 604800) {
                const days = Math.floor(seconds / 86400)
                return days + 'd ago'
            } else if (seconds < 2629746) {
                const weeks = Math.floor(seconds / 604800)
                return weeks + 'w ago'
            } else if (seconds < 31556952) {
                const months = Math.floor(seconds / 2629746)
                return months + 'mth ago'
            } else {
                const years = Math.floor(seconds / 31556952)
                return years + 'y ago'
            }
        },

        buildForm: (data) => {
            let resultString = ''
            data.forEach(item => {
                const {
                    tpid,
                    winner
                } = item
                const linkClass = winner ? 'winner' : 'loser'
                resultString += `<div class="result"><a class="${linkClass}" href="https://tagpro.koalabeast.com/game?replay=${anom_util.getReplay(tpid)}"></a></div>`
            })
            return resultString
        },

        getValue: value => {
            // MM:SS
            if ((/^([0-9][0-9]):[0-5][0-9]$/).test(value)) {
                let a = value.replace(':', '.')
                return parseFloat(a)
            }
            // HH:MM:SS
            else if (value.match(/\d+:[0-5]\d/)) {
                let a = value.split(':')
                return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
            }
            // %
            else if (value.match(/\d+:[0-5]\d/)) {
                let a = value.split('%')
                return a[0]
            } else if (value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)) {
                const matchResult = value.match(/^(\d{1,2})\s(\w{3})\s(\d{4})$/)
                const day = matchResult[1];
                const month = matchResult[2];
                const year = matchResult[3];
                let dt = new Date(`${day}/${month}/${year}`)
                return dt.getTime()
            } else if (value.match(/^(\d+)([smwhyd])\s+ago$/)) {
                const regexResult = /^(\d+)([smhdwym])\s+ago$/.exec(value);

                value = parseInt(regexResult[1], 10);
                const unit = regexResult[2];

                switch (unit) {
                    case 's':
                        return value;
                    case 'm':
                        return value * 60;
                    case 'h':
                        return value * 3600;
                    case 'd':
                        return value * 24 * 3600;
                    case 'w':
                        return value * 7 * 24 * 3600;
                    case 'mth':
                        // assume an average month is 30 days
                        return value * 30 * 24 * 3600;
                    case 'y':
                        return value * 365 * 24 * 3600;
                    default:
                        return NaN;
                }
            } else if (typeof value === 'string') {
                return value
            } else {
                return parseFloat(value)
            }
        },

        displayDate: (rawDate, output) => {
            const date = new Date(rawDate)
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const nth = (d) => {
                if (d > 3 && d < 21) return 'th';
                switch (d % 10) {
                    case 1:
                        return "st";
                    case 2:
                        return "nd";
                    case 3:
                        return "rd";
                    default:
                        return "th";
                }
            }
            if (output === 'day month year') {
                let thisYear = new Date()
                let raw = date.getDate() + ' ' + months[date.getMonth()]
                return raw + ' ' + date.getFullYear()
            }
        },

        sortColumn: (e, contain) => {

            function sortable(row) {
                let data = {
                    itmRef: row
                }
                row.querySelectorAll('[data-column]').forEach((elm) => {
                    let name = elm.dataset.column
                    if (name === 'winrate') {
                        data[name] = anom_util.getValue(elm.innerText.replace('%', ''))
                    } else if (name === 'form') {
                        let resultElements = elm.querySelectorAll('.result')
                        let score = 0;
                        resultElements.forEach(function(result, index) {
                            let winnerElement = result.querySelector('.winner')
                            let loserElement = result.querySelector('.loser')
                            if (winnerElement)
                                score += 1.001 / (index + 1)
                            else if (loserElement)
                                score -= 1.001 / (index + 1)
                        })
                        data[name] = anom_util.getValue(score.toString())
                    } else
                        data[name] = anom_util.getValue(elm.innerText)
                })
                return data
            }

            let items = [...contain.querySelectorAll('tbody tr')].map(item => sortable(item))

            const col = anom_util.findParentBySelector(e.target, 'thead [data-column]')
            if (col) {
                const thead = anom_util.findParentBySelector(e.target, 'thead');
                const isAlreadyActive = col.classList.contains('active');

                // Remove active class from all th elements
                if (col.innerText != thead.parentNode.querySelector('.active').innerText){
                    thead.parentNode.querySelectorAll('th').forEach(th => th.classList.remove('active'));
                }

                // Toggle the sort order if clicking on the active column, otherwise set it to 'asc'
                col.dataset.sortby = isAlreadyActive ? (col.dataset.sortby === 'asc' ? 'desc' : 'asc') : 'asc';

                if (!isAlreadyActive)
                    col.classList.add('active')

                const column = col.dataset.column
                const sortOrder = col.dataset.sortby === 'desc' ? -1 : 1

                items.sort((a, b) => sortOrder * (
                    (col.dataset.column === "name" || col.dataset.column === "map" || col.dataset.column === 'losername' || col.dataset.column === 'partner') ?
                    a[column].localeCompare(b[column]) :
                    a[column] - b[column]
                ))

                contain.querySelector('tbody').innerHTML = ''
                items.forEach(el => contain.querySelector('tbody').appendChild(el.itmRef))
            }
        },

        getReplay: (tpid, t = false) => {
            return btoa((tpid + (t || "")).match(/\w{2}/g).map((e => String.fromCharCode(parseInt(e, 16)))).join("")).replaceAll("+", "_")
        },

        timeUntilNext15Mins: () => {
            const now = new Date()
            const minutes = now.getMinutes()
            const seconds = now.getSeconds()
            const milliseconds = now.getMilliseconds()
            const timeUntilNext15Minutes = (15 - (minutes % 15)) * 60 - seconds - milliseconds / 1000
            return Math.floor(timeUntilNext15Minutes)
        },

        getProfileID: () => {
            let profileUrl = document.querySelector('#profile-btn').href
            let urlParts = profileUrl.split('/')
            let profileID = urlParts[urlParts.length - 1]

            return (profileID) ? profileID : false
        },

       listPlayers: (players, team) => {
            let p = []
            for (let player of players) {
                let flair = player.flair != null ? `<span class="flair ${player.flair.className}" style="background-position: calc(-16px * ${player.flair.x}) calc(-16px * ${player.flair.y});"></span>` : ''
                let openskill = `<span class="openskill">${player.openskill}</span>`
                let profileLink = ''
                if(team === 'red')
                    profileLink = player.tpid != null ? `<a href="https://tagpro.koalabeast.com/profile/${player.tpid}">${player.name}${flair}</a>` : `${player.name}${flair}`
                else if(team === 'blue')
                    profileLink = player.tpid != null ? `<a href="https://tagpro.koalabeast.com/profile/${player.tpid}">${flair}${player.name}</a>` : `${flair}${player.name}`

                let quitGame = player.finished === true ? '' : 'quit-game'

                let skillChangeClass = player.openskill_change > 0 ? 'up' : (player.openskill_change < 0 ? 'down' : '')
                let skillChange = (player.openskill_change === 0) ? '' : (player.openskill_change > 0 ? `+${player.openskill_change}` : player.openskill_change)

                let order = (team === 'blue') ? `<td class="name">${profileLink}</td><td class="skillchange ${skillChangeClass}">${player.multiuser ? '' : skillChange} ${openskill}</td>` : `<td class="skillchange ${skillChangeClass}">${openskill} ${player.multiuser ? '' : skillChange}</td><td class="name">${profileLink}</td>`
                p.push(`
                    <tr class="${quitGame}">
                        ${order}
                    </tr>
                `)
            }
            return p
        },

        makeGame: (stat, tab) => {
            let redPlayers = anom_util.listPlayers(stat.red_team, 'red')
            let bluePlayers = anom_util.listPlayers(stat.blue_team, 'blue')

            const winner = stat.winner == 1 ? "Red" : "Blue";
            const percentage = stat.prediction ? (stat.prediction[winner.toLowerCase()] * 100).toFixed(2) : 'ERROR'
            const prediction = `${winner} win probability: ${percentage}%`;

            document.querySelector(`.recent-games .gamelist.${tab}`).insertAdjacentHTML('beforeend', `
                <div class="row match winner-${stat.winner === 1 ? 'red' : 'blue'}">
                    <div class="col-md-4 team red">
                        <table class="table">
                            <tbody class="text-right">
                                 ${anom_util.listPlayers(stat.red_team, 'red').join('')}
                            </tbody>
                         </table>
                    </div>
                    <div class="col-md-4 middle">
                        <div class="score">
                            <span class="red_score">${stat.redcaps}</span> - <span class="blue_score">${stat.bluecaps}</span>
                        </div>
                        <div class="map"><a href="/maps/${stat.map}">${stat.map}</a></div>
                        <div class="datetime"><a href="https://tagpro.koalabeast.com/game?replay=${anom_util.getReplay(stat.tpid)}" title="${stat.datetime}">${anom_util.timeAgo(stat.datetime)}</a></div>
                        <div class="prediction">${prediction}</div>
                  </div>
                    <div class="col-md-4 team blue">
                        <table class="table">
                            <tbody class="text-left">
                                 ${anom_util.listPlayers(stat.blue_team, 'blue').join('')}
                            </tbody>
                         </table>
                    </div>
              </div>
            `)
        },

    }

    if (window.location.pathname === '/' && document.querySelector('#profile-btn')) {
        const cssBlock = `
 .import-note {
    box-shadow: none;
    background: #353535;
    border-color: #404040;
    color: #d0d0d0;
    font-size: .65rem;
    padding: 8px 10px;
    vertical-align: middle;
    font-weight: normal;
    display: block;
    width:95%;
    margin-bottom:1rem;
}
        `;
        const styleElement = Object.assign(document.createElement('style'), { type: 'text/css' })
        styleElement.appendChild(document.createTextNode(cssBlock))
        document.head.appendChild(styleElement)

        let profileID = anom_util.getProfileID()
        let homeRaw = await fetch(`https://skill.tagprohub.com/api/pub/home/${profileID}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': `max-age=${anom_util.timeUntilNext15Mins()}`,
            }
        })
        let homeData = await homeRaw.json()
        //CHANGES FOR TAGPRO MOBILE
        if (homeData.all.length > 0) {
            document.querySelector('.container.home').insertAdjacentHTML('beforeend', `
            <div class="row">
               <div class="col-sm-12 recent-games">
                    <ul class="tab-list">
                        <li data-tab="all" class="active"><a>All Games</a></li>
                        <li data-tab="mine"><a>My Games</a></li>
                        <li data-tab="upsets"><a>Ball of Shame</a></li>
                    </ul>
                    <div class="gamelist all hide"></div>
                    <div class="gamelist mine hide"></div>
                    <div class="gamelist upsets hide"></div>
                </div>
            </div>
            `)
            $("#play-now")[0].innerHTML = 'Play Rank<br><span class="sub-text">Rank Pub Mode</span>';
        }

        for(let type of ['all', 'mine', 'upsets'])
            for(let stat of homeData[type])
                anom_util.makeGame(stat, type)

        if(homeData.mine.length == 0)
            document.querySelector('.gamelist.mine').innerHTML = `<div style="margin-top:.5rem;margin-bottom:1.5rem;" class="msg msg-warning">You haven't played any games yet.</div>`

        let tabList = document.querySelector('.tab-list')
        tabList.addEventListener('click', (e) => {
            let li = anom_util.findParentBySelector(e.target, "li")
            if (li) {
                tabList.querySelector('.active').classList.remove('active')
                li.classList.add('active')

                let tab = li.dataset.tab
                localStorage.setItem('home-tab', tab)

                Array.from(document.querySelectorAll('.gamelist')).forEach(gameList => gameList.classList.add('hide'))
                document.querySelector(`.gamelist.${tab}`).classList.remove('hide')
            }
        })

        let autoTab = localStorage.getItem('home-tab') || 'all'
        if (autoTab)
            tabList.querySelector(`[data-tab="${autoTab}"`).click()

    } else if (window.location.pathname === '/history') {
        const cssBlock = `

 .profile > div > div > .header-title {
     margin: 0 0 .5rem 0;
     border: none;
     .profile-name span {
         color: color-mix(in srgb, #8bc34a, #ff4a00 50%);
    }
}
 .insights-pane {
     --chartcolor: #8BC34A;
     --chartcolorfade: rgba(#8BC34A, .12);
     display: block;
     width: 100%;
     vertical-align: top;
     background:#1b1b1b;
     padding-top:.8rem;
     border-radius:.2rem;
     margin-bottom:1rem;
}
 .insights-pane .chart .bar {
     fill: var(--chartcolor);
}
 .insights-pane .chart-contain {
     background-color: var(--bg);
     height: 100%;
     display: flex;
     flex-direction: column;
}
 .insights-pane .chart-contain .items {
     padding: 0 1rem;
     display: flex;
}
 .insights-pane .chart-contain .items .item {
     vertical-align: top;
     color: var(--text);
     width: 40%;
}
 .insights-pane .chart-contain .bar-contain {
     flex-direction: row;
     display: flex;
     flex-basis: 90%;
}
 .insights-pane .bar-contain .bar {
     width:200px;
}
 .insights-pane .bar.average .value {
     color:white
}
 .insights-pane .bar.change .value {
     color:white
}
 .insights-pane .chart-contain .items .item:first-child {
     width: 85%;
}
 .insights-pane .chart-contain .items .item.right {
     text-align: right;
}
 .insights-pane .chart-contain .items .item .title {
     font-size: 0.7rem;
     text-transform: uppercase;
     display: block;
}
 .insights-pane .chart-contain .items .item .current .value {
     color:#8bc34a;
}
 .insights-pane .chart-contain .items .item .value {
     font-size: 1.4rem;
     margin-top: 0.1rem;
}
 .insights-pane .chart-contain .items .item .value sup {
     font-size: 1rem;
     font-weight: 400;
     vertical-align: baseline;
     margin-left: 0.2rem;
}
 .insights-pane .chart-contain .items .item .daterange {
     font-size: 0.7rem;
     margin-top: 0.2rem;
     color: #868686;
}
 .insights-pane .chart-contain .chart {
     display:block;
     width:100%;
     height:300px;
}
.insights-pane .chart-contain svg {
     cursor:grab;
}
.insights-pane .chart-contain svg:active {
     cursor:grabbing;
}
 .insights-pane .chart-contain .chart .tick line {
     stroke: #2b2b2b;
     stroke-width: 0.05rem;
     shape-rendering: geometricPrecision;
     stroke-dasharray: 6, 4;
}
 .insights-pane .chart-contain .chart .axis-x text {
     font-size: 0.7rem;
     fill: #868686;
}
 .insights-pane .chart-contain .chart .axis-x .tick {
     margin-left: -100px;
     left: 10rem;
     position: relative;
}
 .insights-pane .chart-contain .chart .axis-x .domain {
     stroke-width: 0.08rem;
     stroke: #2b2b2b;
}
 .insights-pane .chart-contain .chart .axis-y text {
     font-size: 0.7rem;
     fill: #868686;
}
 .insights-pane .chart-contain .chart .axis-y .domain {
     display: none;
}
 .insights-pane .chart-contain .date-preferences {
     display: grid;
     grid-template-columns: repeat(6, 1fr);
     grid-template-rows: repeat(1, 1fr);
     row-gap: 0.5rem;
     column-gap: 0.5rem;
}
 .insights-pane .chart-contain .date-preferences div {
     display: block;
     color: #fdfdfd;
     border-radius: 0.5rem;
     text-align: center;
     font-size: 0.5rem;
     line-height: 1.4rem;
     font-weight: 500;
     cursor: pointer;
}
 .insights-pane .chart-contain .date-preferences div.active, .insights-pane .chart-contain .date-preferences div:hover {
     background: #161515;
     color:white;
}

.container.history .header-title { margin-bottom:10px; border-bottom: none; }
        `;
        const styleElement = Object.assign(document.createElement('style'), { type: 'text/css' })
        styleElement.appendChild(document.createTextNode(cssBlock))
        document.head.appendChild(styleElement)

        let historyRaw = await fetch(`https://skill.tagprohub.com/api/pub/history/${Intl.DateTimeFormat().resolvedOptions().timeZone}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': `max-age=${anom_util.timeUntilNext15Mins()}`,
            }
        })
        let historyData = await historyRaw.json()

        if (historyData.gamesPerDay.length > 0) {
            document.querySelector('.container.history .header-title').insertAdjacentHTML('afterend', `
<div class="insights-pane">
    <div class="chart-contain">
        <div class="items">
            <div class="item">
                <div class="bar-contain">
                    <div class="bar average">
                        <div class="title">Average Daily Games</div>
                        <div class="value">--</div>
                    </div>
                </div>
                <div class="daterange">-</div>
            </div>
            <div class="item right">
                <div class="date-preferences">
                    <div class="btn-1w" data-days="7">1 W</div>
                    <div class="btn-1m" data-days="30">1 M</div>
                    <div class="btn-3m" data-days="90">3 M</div>
                    <div class="btn-6m" data-days="180">6 M</div>
                    <div class="btn-1y" data-days="365">1 Y</div>
                    <div class="btn-all active" data-days="all">All</div>
                </div>
            </div>
        </div>
        <div class="chart"></div>
    </div>
</div>
            `)
        }

        // inject d3js for chart
        let script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.0.0/d3.min.js'
        let scriptLoaded = new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
        })
        document.head.appendChild(script)
        scriptLoaded.then(() => {

            const el = document.querySelector(`.insights-pane`)
            const parent = d3.select(`.insights-pane .chart`)
            const parseTime = d3.timeParse("%Y-%m-%d")
            const margin = {
                top: 7,
                bottom: 36,
                left: 0,
                right: 45
            }
            const width = el.querySelector('.chart').clientWidth - margin.right
            const height = el.querySelector('.chart').getBoundingClientRect().height
            const axisTimeFormat = date => {
                return (d3.timeSecond(date) < date ?
                        d3.timeFormat('.%L') :
                        d3.timeMinute(date) < date ?
                        d3.timeFormat(':%S') :
                        d3.timeHour(date) < date ?
                        d3.timeFormat('%H:%M') :
                        d3.timeDay(date) < date ?
                        d3.timeFormat('%H %p') :
                        d3.timeMonth(date) < date ?
                        d3.timeWeek(date) < date ?
                        d3.timeFormat('%e %b') :
                        d3.timeFormat('%e %b') :
                        d3.timeYear(date) < date ?
                        d3.timeFormat('%b') :
                        d3.timeFormat('%Y'))(date);
            }

            const gameData = Object.values(historyData.gamesPerDay).map(dayData => ({
                date: parseTime(dayData.date),
                games: Number(dayData.games),
            }))

            const extent = [
                [margin.left, margin.top],
                [width, height - margin.top]
            ]

            // x: date
            const padding = 86400000 / 2
            const x = d3.scaleTime()
                .domain([
                    d3.min(gameData, d => new Date(d.date.getTime() - padding)),
                    d3.max(gameData, d => new Date(d.date.getTime() + padding))
                ])
                .range([0, width])

            const xScaleSkill = d3.scaleBand()
                .domain(gameData.map(d => d.games))
                .range([0, width])

            // y: games
            const y = d3.scaleLinear()
                .domain([
                    0,
                    d3.max(gameData, d => Math.ceil(Math.max(d.games)))
                ])
                .range([height - margin.bottom, margin.top])
                .nice()

            const xAxis = (g, x) => g
                .call(d3.axisBottom(x)
                    .tickSize(7)
                    .ticks(8)
                    .tickFormat(axisTimeFormat)
                )

            const daysDifference = d3.utcDay.count(
                d3.min(gameData, d => new Date(d.date.getTime())),
                d3.max(gameData, d => new Date(d.date.getTime()))
            ) + 1

            const zoom = d3.zoom()
                .scaleExtent([1, daysDifference / 7])
                .extent(extent)
                .translateExtent([
                    [0, -Infinity],
                    [width, height]
                ])
                .on('zoom', zoomed)

            const svg = parent.append('svg')
                .style('will-change', 'transform')
                .attr('width', width + margin.right)
                .attr('height', height)
                .call(zoom)

            // x axis: bottom dates
            const gx = svg.append('g')
                .attr("class", "axis-x")
                .attr('transform', `translate(0,${height - margin.bottom})`)
                .call(xAxis, x)
                .call(g => g.select(".domain").remove())

            // games axis
            svg.append('g')
                .call(g => g.attr('class', 'axis-y'))
                .call(
                    d3.axisRight(y)
                    .tickSize(width)
                    .ticks(8)
                    .tickFormat(d3.format('d'))
                )
                .call(g => g.select(".domain").remove())

            svg
                .append("clipPath")
                .attr("id", 'clip-hide')
                .append("rect")
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("width", width)
                .attr("height", height - margin.top - margin.bottom)

            svg.append('g')
                .attr('clip-path', 'url(#clip-hide)')
                .attr('class', 'bar-values')
                .selectAll('.bar')
                .data(gameData)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.date) - xScaleSkill.bandwidth() / 2)
                .attr('y', d => y(d.games))
                .attr('width', xScaleSkill.bandwidth())
                .attr('height', d => y(0) - y(d.games))

            function zoomed(event) {
                const xz = event.transform.rescaleX(x)
                const xDomain = xz.domain()
                const zoomLevelInDays = d3.utcDay.count(xDomain[0], xDomain[1])
                const desiredBarWidth = width / (zoomLevelInDays + 2)

                svg.select(".axis-x").call(
                    d3.axisBottom(xz)
                    .tickSizeOuter(0)
                    .tickSize(7)
                    .ticks(zoomLevelInDays < 7 ? d3.timeDay.every(1) : 6)
                    .tickFormat(zoomLevelInDays < 7 ? d3.timeFormat('%e %b') : axisTimeFormat)
                )

                const visibleDataset = getCurrentVisibleDataset()
                y.domain([
                    0,
                    d3.max(visibleDataset, d => Math.ceil(Math.max(d.games)))
                ])

                svg.select('.axis-y')
                    .call(d3.axisRight(y)
                        .tickSize(width)
                        .ticks(8)
                        .tickFormat(d3.format('d'))
                    )

                svg.selectAll('.bar')
                    .attr('x', d => xz(d.date) - desiredBarWidth / 2)
                    .attr('width', desiredBarWidth)
                    .attr('y', d => y(d.games))
                    .attr('height', d => y(0) - y(d.games))

                const activeElement = el.querySelector('.active')
                if (activeElement && event.sourceEvent && event.sourceEvent.type === 'wheel'){
                    activeElement.classList.remove('active')
                }
                setHeadline(getCurrentXAxisExtent(), getCurrentVisibleDataset())
            }

            function zoomTo(daysToGoBack, el, duration = 250) {
                if (el.parentNode.querySelector('.active')){
                    el.parentNode.querySelector('.active').classList.remove('active')
                }

                el.classList.add('active')

                if (daysToGoBack === 'all')
                    svg.transition().duration(duration).call(zoom.transform, d3.zoomIdentity)
                else {
                    const maxScale = gameData.length / daysToGoBack

                    const startDate = new Date()
                    startDate.setDate(startDate.getDate() - daysToGoBack)
                    startDate.setHours(12, 0, 0, 0)
                    const translateX = x(startDate)

                    svg.transition().duration(duration).call(zoom.transform, d3.zoomIdentity
                        .scale(maxScale)
                        .translate(-translateX, 0)
                    )
                }
            }

            function getCurrentXAxisExtent() {
                const currentTransform = d3.zoomTransform(svg.node())
                const currentXScale = currentTransform.rescaleX(x)

                const minX = currentXScale.invert(0)
                const maxX = currentXScale.invert(width)

                return {
                    minX,
                    maxX
                }
            }

            function getCurrentVisibleDataset() {
                const xAxisExtent = getCurrentXAxisExtent()

                const visibleDataset = gameData.filter(d => {
                    return d.date > xAxisExtent.minX && d.date <= xAxisExtent.maxX
                })

                return visibleDataset
            }

            el.querySelector('.date-preferences').addEventListener('click', e => {
                let item = anom_util.findParentBySelector(e.target, "[data-days]")
                if (item) {
                    zoomTo(item.dataset.days, item)
                    localStorage.setItem('chart-zoomTo', item.dataset.days)
                }
            })

            let autoZoom = localStorage.getItem('chart-zoomTo') || 7
            if (autoZoom)
                zoomTo(autoZoom, el.querySelector(`[data-days="${autoZoom}"]`), 0)

            function setHeadline(xAxisExtent, filteredData) {
                let screen = document.querySelector('.insights-pane')

                let startDate = new Date(xAxisExtent.minX)
                startDate.setDate(startDate.getDate() + 1)

                screen.querySelector('.daterange').innerText = anom_util.displayDate(startDate, 'day month year') + ' - ' + anom_util.displayDate(xAxisExtent.maxX, 'day month year')

                let averageValue = Math.round(calculateAverageSmooth(filteredData))
                screen.querySelector('.average .value').innerHTML = averageValue ? averageValue : '--'

                function calculateAverageSmooth(jsonArray) {
                    const validGame = jsonArray
                        .filter(obj => obj.hasOwnProperty('games'))
                        .map(obj => obj.games)

                    if (validGame.length === 0) return 0

                    const sum = validGame.reduce((acc, games) => acc + games, 0)
                    const average = sum / validGame.length

                    return average
                }
            }

        }).catch(e => {
            console.error('Error loading script', e)
        })

    } else if (window.location.pathname.includes('/profile/')) {
        const cssBlock = `
.table thead {
    position:sticky;
    top:0;
    z-index:9999
}
 .top-stats {
     padding-bottom:1rem;
}
 .top-stats table {
     font-size: .8rem;
}
 .top-stats thead tr {
     border-bottom: none !important;
}
 .top-stats tbody tr {
     border-bottom:none !important;
}
 .top-stats tbody .flair {
     vertical-align: -3px;
     margin-right: 0.2rem;
}
 .top-stats tbody tr:hover {
    background:#255636 !important
}
 .profile > div > div > .header-title {
     margin: 0 0 .5rem 0;
     border: none;
     .profile-name span {
         color: color-mix(in srgb, #8bc34a, #ff4a00 50%);
    }
}
 .insights-pane {
     --chartcolor: #8BC34A;
     --chartcolorfade: rgba(#8BC34A, .12);
     display: block;
     width: 100%;
     vertical-align: top;
     background:#1b1b1b;
     padding-top:.8rem;
     border-radius:.2rem;
     margin-bottom:1rem;
}
 .insights-pane .chart-contain {
     background-color: var(--bg);
     height: 100%;
     display: flex;
     flex-direction: column;
}
 .insights-pane .chart-contain .items {
     padding: 0 1rem;
     display: flex;
}
 .insights-pane .chart-contain .items .item {
     vertical-align: top;
     color: var(--text);
     width: 40%;
}
 .insights-pane .chart-contain .bar-contain {
     flex-direction: row;
     display: flex;
     flex-basis: 90%;
}
 .insights-pane .bar {
     width:120px;
}
 .insights-pane .bar.average .value {
    color:white
}
 .insights-pane .bar.change .value {
    color:white
}
 .insights-pane .chart-contain .items .item:first-child {
     width: 85%;
}
 .insights-pane .chart-contain .items .item.right {
     text-align: right;
}
 .insights-pane .chart-contain .items .item .title {
     font-size: 0.7rem;
     text-transform: uppercase;
     display: block;
}
 .insights-pane .chart-contain .items .item .current .value {
     color:#8bc34a;
}
 .insights-pane .chart-contain .items .item .value {
     font-size: 1.4rem;
     margin-top: 0.1rem;
}
 .insights-pane .chart-contain .items .item .value sup {
     font-size: 1rem;
     font-weight: 400;
     vertical-align: baseline;
     margin-left: 0.2rem;
}
 .insights-pane .chart-contain .items .item .daterange {
     font-size: 0.7rem;
     margin-top: 0.2rem;
     color: #868686;
}
 .insights-pane .chart-contain .chart {
     display:block;
     width:100%;
     height:300px;
}
.insights-pane .chart-contain svg {
     cursor:grab;
}
.insights-pane .chart-contain svg:active {
     cursor:grabbing;
}
 .insights-pane .chart-contain .chart .tick line {
     stroke: #2b2b2b;
     stroke-width: 0.05rem;
     shape-rendering: geometricPrecision;
     stroke-dasharray: 6, 4;
}
 .insights-pane .chart-contain .chart .axis-x text {
     font-size: 0.7rem;
     fill: #868686;
}
 .insights-pane .chart-contain .chart .axis-x .tick {
     margin-left: -100px;
     left: 10rem;
     position: relative;
}
 .insights-pane .chart-contain .chart .axis-x .domain {
     stroke-width: 0.08rem;
     stroke: #2b2b2b;
}
 .insights-pane .chart-contain .chart .axis-y text {
     font-size: 0.7rem;
     fill: #868686;
}
 .insights-pane .chart-contain .chart .axis-y .domain {
     display: none;
}
 .chart .line-trend {
     stroke: var(--chartcolor);
     stroke-width: 0.13rem;
     stroke-linecap: round;
     fill: transparent;
     shape-rendering: geometricPrecision;
}
 .chart circle {
     stroke: var(--chartcolor);
     stroke-width: 0.1rem;
     shape-rendering: geometricPrecision;
     fill: #1b1b1b;
}
 .insights-pane .chart-contain .date-preferences {
     display: grid;
     grid-template-columns: repeat(6, 1fr);
     grid-template-rows: repeat(1, 1fr);
     row-gap: 0.5rem;
     column-gap: 0.5rem;
}
 .insights-pane .chart-contain .date-preferences div {
     display: block;
     color: #fdfdfd;
     border-radius: 0.5rem;
     text-align: center;
     font-size: 0.5rem;
     line-height: 1.4rem;
     font-weight: 500;
     cursor: pointer;
}
 .insights-pane .chart-contain .date-preferences div.active, .insights-pane .chart-contain .date-preferences div:hover {
     background: #161515;
     color:white;
}
 .recent-games {
     margin-bottom:1rem;
}
 .recent-games tr.w {
     --bg: #8ee31e;
}
 .recent-games tr.l, .recent-games tr.q {
     --bg: #df4444;
}
 .recent-games tr.l td.save {
     --bg: #ffffff;
}
 .top-stats table th, .recent-games table th {
     font-size:.8rem;
     cursor:pointer;
}
 .top-stats table th.active, .recent-games table th.active {
     background:color-mix(in srgb, #353535, #6bdf44)
}
 .recent-games .result {
     background: color-mix(in srgb, #404040, var(--bg) 50%);
     color: color-mix(in srgb, white, var(--bg) 90%);
     text-transform: uppercase;
     font-size: .7rem;
     font-weight: bold;
     padding-left:10px !important;
     padding-right: 10px !important;
     width: 0px !important;
}
 .recent-games .result-no-bg {
    background:none
}
 .recent-games tbody tr:hover {
    background:#255636 !important
}
        `;
        const styleElement = Object.assign(document.createElement('style'), { type: 'text/css' })
        styleElement.appendChild(document.createTextNode(cssBlock))
        document.head.appendChild(styleElement)

        const url = new URL(window.location.href)
        const profileID = url.pathname.split('/profile/')[1]
        let playerRaw = await fetch(`https://skill.tagprohub.com/api/pub/profile/${profileID}/${Intl.DateTimeFormat().resolvedOptions().timeZone}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': `max-age=${anom_util.timeUntilNext15Mins()}`,
            }
        })
        let playerData = await playerRaw.json()

        if (playerData.games.length > 0) {
            document.querySelector('.container.profile .row:first-child').insertAdjacentHTML('afterend', `
<div class="insights-pane">
    <div class="chart-contain">
        <div class="items">
            <div class="item">
                <div class="bar-contain">
                    <div class="bar current">
                        <div class="title">Skill</div>
                        <div class="value">--</div>
                    </div>
                    <div class="bar average">
                        <div class="title">Average</div>
                        <div class="value">--</div>
                    </div>
                    <div class="bar change">
                        <div class="title">Change</div>
                        <div class="value"></div>
                    </div>
                </div>
                <div class="daterange">-</div>
            </div>
            <div class="item right">
                <div class="date-preferences">
                    <div class="btn-1w" data-days="7">1 W</div>
                    <div class="btn-1m" data-days="30">1 M</div>
                    <div class="btn-3m" data-days="90">3 M</div>
                    <div class="btn-6m" data-days="180">6 M</div>
                    <div class="btn-1y" data-days="365">1 Y</div>
                    <div class="btn-all active" data-days="all">All</div>
                </div>
            </div>
        </div>
        <div class="chart"></div>
    </div>
</div>


<div class="row top-stats">
    <div class="col-sm-4">
        <table class="table table-stripped topmaps">
            <colgroup>
                <col span="1" style="width: 80%;">
                <col span="1" style="width: 10%;">
                <col span="1" style="width: 10%;">
            </colgroup>
            <thead>
                <tr>
                    <th class="text-left" data-column="map" data-sortby="asc">Best Maps</th>
                    <th class="text-right" data-column="g" data-sortby="desc">G</th>
                    <th class="text-right active" data-column="winrate" data-sortby="desc">Win%</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <div class="col-sm-4">
        <table class="table table-stripped topwith">
            <colgroup>
                <col span="1" style="width: 80%;">
                <col span="1" style="width: 10%;">
                <col span="1" style="width: 10%;">
            </colgroup>
            <thead>
                <tr>
                    <th class="text-left" data-column="name" data-sortby="asc">Best With</th>
                    <th class="text-right" data-column="g" data-sortby="desc">G</th>
                    <th class="text-right active" data-column="winrate" data-sortby="desc">Win%</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <div class="col-sm-4">
        <table class="table table-stripped topagainst">
            <colgroup>
                <col span="1" style="width: 80%;">
                <col span="1" style="width: 10%;">
                <col span="1" style="width: 10%;">
            </colgroup>
            <thead>
                <tr>
                    <th class="text-left" data-column="name" data-sortby="asc">Best Against</th>
                    <th class="text-right" data-column="g" data-sortby="desc">G</th>
                    <th class="text-right active" data-column="winrate" data-sortby="desc">Win%</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>

<div class="row recent-games">
    <div class="col-sm-12">
        <table class="table table-stripped">
            <thead>
                <tr>
                    <th class="text-left" colspan="2" data-column="result" data-sortby="desc">Result</th>
                    <th class="text-left" data-column="map" data-sortby="asc">Map</th>
                    <th class="text-center" data-column="cf" data-sortby="desc">CF</th>
                    <th class="text-center" data-column="ca" data-sortby="desc">CA</th>
                    <th class="text-left" data-column="duration" data-sortby="desc">Duration</th>
                    <th class="text-left" data-column="winprobability" data-sortby="desc">Win Probability %</th>
                    <th class="text-right active" data-column="date" data-sortby="desc">Date</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>
            `)

            // remove cruff
            let profileStatsContain = document.querySelector('.profile-stats')

            // stats table
            profileStatsContain.innerHTML = `
               <table class="table table-stripped">
                   <thead>
                       <tr>
                           <th class="">Statistic</th>
                           <th class="text-right column">Today</th>
                           <th class="text-right column">Week</th>
                           <th class="text-right column">Month</th>
                           <th class="text-right column">All</th>
                       </tr>
                   </thead>
                   <tbody></tbody>
               </table>`

            for (let stat in playerData.stats.all) {
                profileStatsContain.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="table-row-label">${stat}</td>
                <td class="text-right">${playerData.stats.day[stat]}</td>
                <td class="text-right">${playerData.stats.week[stat]}</td>
                <td class="text-right">${playerData.stats.month[stat]}</td>
                <td class="text-right">${playerData.stats.all[stat]}</td>
            </tr>
        `)
            }

            // top 15 maps
            let topMapContain = document.querySelector('.top-stats .topmaps')
            for (let stat of playerData.top.maps) {
                topMapContain.querySelector('tbody').insertAdjacentHTML('beforeend', `
                 <tr>
                    <td class="text-left" data-column="map"><a href="/maps/${stat.map}">${stat.map}</a></td>
                    <td class="text-right" data-column="g">${stat.games}</td>
                    <td class="text-right" data-column="winrate">${stat.winrate}</td>
                </tr>
            `)
            }
            topMapContain.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, topMapContain))

            // top 15 with
            let topWithContain = document.querySelector('.top-stats .topwith')
            for (let stat of playerData.top.with) {
                let flair = stat.flair != null ? `<span class="flair ${stat.flair.className}" style="background-position: calc(-16px * ${stat.flair.x}) calc(-16px * ${stat.flair.y});"></span>` : ''
                topWithContain.querySelector('tbody').insertAdjacentHTML('beforeend', `
                 <tr>
                    <td class="text-left" data-column="name"><a href="/profile/${stat.tpid}">${flair}${stat.name}</a></td>
                    <td class="text-right" data-column="g">${stat.games}</td>
                    <td class="text-right" data-column="winrate">${stat.winrate}</td>
                </tr>
            `)
            }
            topWithContain.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, topWithContain))

            // top 15 against
            let topAgainstContain = document.querySelector('.top-stats .topagainst')
            for (let stat of playerData.top.against) {
                let flair = stat.flair != null ? `<span class="flair ${stat.flair.className}" style="background-position: calc(-16px * ${stat.flair.x}) calc(-16px * ${stat.flair.y});"></span>` : ''
                topAgainstContain.querySelector('tbody').insertAdjacentHTML('beforeend', `
                 <tr>
                    <td class="text-left" data-column="name"><a href="/profile/${stat.tpid}">${flair}${stat.name}</a></td>
                    <td class="text-right" data-column="g">${stat.games}</td>
                    <td class="text-right" data-column="winrate">${stat.winrate}</td>
                </tr>
            `)
            }
            topAgainstContain.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, topAgainstContain))

            function ensureMinimumRows(tbody) {
                if (tbody) {
                    var rowCount = tbody.getElementsByTagName('tr').length;
                    var rowsToAdd = 15 - rowCount;
                    if (rowsToAdd > 0) {
                        for (var i = 0; i < rowsToAdd; i++) {
                            var newRow = document.createElement('tr');
                            var cell = document.createElement('td');
                            cell.textContent = '-';
                            cell.colSpan = 3;
                            cell.dataset.column = 'name';
                            cell.style.color = '#878787'
                            newRow.appendChild(cell);
                            tbody.appendChild(newRow);
                        }
                    }
                }
            }
            ensureMinimumRows(topMapContain.querySelector('tbody'))
            ensureMinimumRows(topWithContain.querySelector('tbody'))
            ensureMinimumRows(topAgainstContain.querySelector('tbody'))

            // recent games
            let recentGamesContains = document.querySelector('.recent-games')
            for (let stat of playerData.games) {
                let result = !stat.finished ? 'Q' : (stat.winner ? 'W' : 'L')
                let skillChange = (stat.openskill_change >= 0) ? `+${stat.openskill_change}` : stat.openskill_change;
                skillChange = (stat.openskill_change !== null) ? skillChange : '';
                recentGamesContains.querySelector('tbody').insertAdjacentHTML('beforeend', `
                 <tr class="${result.toLowerCase()}">
                    <td class="text-center result ${stat.saveattempt ? 'save' : false}">${stat.saveattempt ? 'S' : result}</td>
                    <td class="text-center result result-no-bg" data-column="result">${skillChange}</td>
                    <td class="text-left" data-column="map"><a href="/maps/${stat.map}">${stat.map}</a></td>
                    <td class="text-center" data-column="cf">${stat.cap_team_for}</td>
                    <td class="text-center" data-column="ca">${stat.cap_team_against}</td>
                    <td class="text-left" data-column="duration">${stat.duration}</td>
                    <td class="text-left" data-column="winprobability">${stat.win_probability}</td>
                    <td class="text-right" data-column="date" title="${stat.datetime}"><a href="https://tagpro.koalabeast.com/game?replay=${anom_util.getReplay(stat.tpid)}">${anom_util.timeAgo(stat.datetime)}</a></td>
                </tr>
            `)
            }
            recentGamesContains.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, recentGamesContains))

            // skill into profile box
            let table = document.querySelector('.profile-detail tbody')
            table.insertAdjacentHTML('beforeend', `
        <tr>
            <td>Skill</td>
            <td>${playerData.games[0].openskill.toFixed(2)}</td>
        </tr>
        <tr>
            <td>Best Skill</td>
            <td>${playerData.openskill.best.toFixed(2)}</td>
        </tr>
        `)
            // change last game to true pub last game
            table.querySelector('tr:nth-of-type(2) td:nth-of-type(2)').innerText = anom_util.timeAgo(playerData.games[0].datetime)

            // inject d3js for chart
            let script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.0.0/d3.min.js'
            let scriptLoaded = new Promise((resolve, reject) => {
                script.onload = resolve
                script.onerror = reject
            })
            document.head.appendChild(script)
            scriptLoaded.then(() => {

                function getTodaysDate() {
                    const currentDate = new Date()
                    const year = currentDate.getFullYear()
                    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
                    const day = currentDate.getDate().toString().padStart(2, '0')
                    return `${year}-${month}-${day}`;
                }

                function addTodayWithOldestOpenskillToFront(data) {
                    const openskill = data[0].openskill
                    const todayDate = getTodaysDate()
                    const todayObject = {
                        date: todayDate,
                        openskill: openskill,
                        hide: true
                    }
                    data.unshift(todayObject)
                    return data
                }

                const el = document.querySelector(`.insights-pane`)
                const parent = d3.select(`.insights-pane .chart`)
                const parseTime = d3.timeParse("%Y-%m-%d")
                const margin = {
                    top: 7,
                    bottom: 36,
                    left: 0,
                    right: 35
                }
                const width = el.querySelector('.chart').clientWidth - margin.right
                const height = el.querySelector('.chart').getBoundingClientRect().height
                const axisTimeFormat = date => {
                    return (d3.timeSecond(date) < date ?
                            d3.timeFormat('.%L') :
                            d3.timeMinute(date) < date ?
                            d3.timeFormat(':%S') :
                            d3.timeHour(date) < date ?
                            d3.timeFormat('%H:%M') :
                            d3.timeDay(date) < date ?
                            d3.timeFormat('%H %p') :
                            d3.timeMonth(date) < date ?
                            d3.timeWeek(date) < date ?
                            d3.timeFormat('%e %b') :
                            d3.timeFormat('%e %b') :
                            d3.timeYear(date) < date ?
                            d3.timeFormat('%b') :
                            d3.timeFormat('%Y'))(date);
                }

                let rawSkillPerDay = (playerData.skillPerDay[0].date !== getTodaysDate()) ? addTodayWithOldestOpenskillToFront(playerData.skillPerDay) : playerData.skillPerDay
                const skillData = Object.values(rawSkillPerDay).map(dayData => ({
                    date: parseTime(dayData.date),
                    skill: Number(dayData.openskill),
                    hide: dayData.hide
                }))

                const extent = [
                    [margin.left, margin.top],
                    [width, height - margin.top]
                ]

                // x: date
                const padding = 86400000 / 2
                const x = d3.scaleTime()
                    .domain([
                        d3.min(skillData, d => new Date(d.date.getTime() - padding)),
                        d3.max(skillData, d => new Date(d.date.getTime() + padding))
                    ])
                    .range([0, width])

                // y: skill
                const y = d3.scaleLinear()
                    .domain([
                        d3.min(skillData, d => Math.floor(d.skill)) - 2,
                        d3.max(skillData, d => Math.ceil(d.skill)) + 2
                    ])
                    .range([height - margin.bottom, margin.top])
                    .nice()

                const xAxis = (g, x) => g
                    .call(d3.axisBottom(x)
                        .tickSize(7)
                        .ticks(4)
                        .tickFormat(axisTimeFormat)
                    )

                const daysDifference = d3.timeDay.count(
                    d3.min(skillData, d => new Date(d.date.getTime())),
                    d3.max(skillData, d => new Date(d.date.getTime()))
                ) + 1

                const zoom = d3.zoom()
                    .scaleExtent([1, daysDifference / 7])
                    .extent(extent)
                    .translateExtent([
                        [0, -Infinity],
                        [width, height]
                    ])
                    .on('zoom', zoomed)

                const svg = parent.append('svg')
                    .style('will-change', 'transform')
                    .attr('width', width + margin.right)
                    .attr('height', height)
                    .call(zoom)

                // x axis: bottom dates
                const gx = svg.append('g')
                    .attr("class", "axis-x")
                    .attr('transform', `translate(0,${height - margin.bottom})`)
                    .call(xAxis, x)
                    .call(g => g.select(".domain").remove())

                // skill axis
                svg.append('g')
                    .call(g => g.attr('class', 'axis-y'))
                    .call(
                        d3.axisRight(y)
                        .tickSize(width)
                        .ticks(8)
                    )
                    .call(g => g.select(".domain").remove())

                svg
                    .append("clipPath")
                    .attr("id", 'clip-hide')
                    .append("rect")
                    .attr("x", margin.left)
                    .attr("y", margin.top)
                    .attr("width", width)
                    .attr("height", height - margin.top - margin.bottom)

                svg.append('g')
                    .datum(skillData)
                    .append('path')
                    .attr("class", "line-trend")
                    .attr('clip-path', 'url(#clip-hide)')
                    .attr('d',
                        d3.line()
                        .curve(d3.curveMonotoneX)
                        .x(d => x(d.date))
                        .y(d => y(d.skill))
                    )

                let circles = createCircles(skillData)

                function createCircles(data) {
                    return svg
                        .selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", d => x(d.date))
                        .attr("cy", d => y(d.skill))
                        .attr("r", 5)
                        .attr('clip-path', 'url(#clip-hide)')
                        .attr("class", d => d.hide ? 'hide' : '')
                }

                function zoomed(event) {
                    const xz = event.transform.rescaleX(x)
                    const xDomain = xz.domain()
                    const zoomLevelInDays = d3.timeDay.count(xDomain[0], xDomain[1])
                    const desiredBarWidth = width / (zoomLevelInDays + 2)

                    svg.select(".axis-x").call(
                        d3.axisBottom(xz)
                        .tickSizeOuter(0)
                        .tickSize(7)
                        .ticks(zoomLevelInDays < 7 ? d3.timeDay.every(1) : 6)
                        .tickFormat(zoomLevelInDays < 7 ? d3.timeFormat('%e %b') : axisTimeFormat)
                    )

                    const rawDataset = getCurrentVisibleDatasetWithAdjacent()
                    if(rawDataset.before != undefined) rawDataset.visibleDataset.push(rawDataset.before)
                    if(rawDataset.after != undefined) rawDataset.visibleDataset.push(rawDataset.after)
                    y.domain([
                        d3.min(rawDataset.visibleDataset, d => Math.floor(d.skill)) - 5,
                        d3.max(rawDataset.visibleDataset, d => Math.ceil(d.skill)) + 5
                    ])

                    svg.select('.axis-y')
                        .call(d3.axisRight(y)
                            .tickSize(width)
                            .ticks(4)
                        )

                    svg.select(".line-trend")
                        .attr('d',
                            d3.line()
                            .curve(d3.curveMonotoneX)
                            .x(d => xz(d.date))
                            .y(d => y(d.skill))
                        )

                    if (zoomLevelInDays <= 15) {
                        if (!circles) circles = createCircles(skillData)
                        circles.attr("cx", d => xz(d.date))
                        circles.attr("cy", d => y(d.skill))
                    } else if (circles) {
                        circles.remove()
                        circles = null
                    }

                    const activeElement = el.querySelector('.active')
                    if (activeElement && event.sourceEvent && event.sourceEvent.type === 'wheel'){
                        activeElement.classList.remove('active')
                        document.querySelector('#board-rolling').classList.add("active");
                    }

                    setHeadline(getCurrentXAxisExtent(), getCurrentVisibleDataset())
                }

                function zoomTo(daysToGoBack, el, duration = 250) {
                    if (el.parentNode.querySelector('.active')){
                        el.parentNode.querySelector('.active').classList.remove('active');
                    }
                    el.classList.add('active')

                    if (daysToGoBack === 'all')
                        svg.transition().duration(duration).call(zoom.transform, d3.zoomIdentity)
                    else {

                        function getDaysDifference(startDate, endDate) {
                            // Convert the dates to UTC to avoid issues with daylight saving time
                            const utcStartDate = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                            const utcEndDate = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

                            // Calculate the difference in milliseconds
                            const millisecondsPerDay = 24 * 60 * 60 * 1000;
                            const timeDifference = utcEndDate - utcStartDate;

                            // Calculate the difference in days
                            const daysDifference = Math.floor(timeDifference / millisecondsPerDay);

                            return daysDifference;
                        }

                        const maxScale = (getDaysDifference(skillData[skillData.length - 1].date, skillData[0].date) + 1) / daysToGoBack
                        const startDate = new Date()
                        startDate.setDate(startDate.getDate() - daysToGoBack)
                        startDate.setHours(12, 0, 0, 0)

                        const translateX = x(startDate)

                        svg.transition().duration(duration).call(zoom.transform, d3.zoomIdentity
                            .scale(maxScale)
                            .translate(-translateX, 0)
                        )
                    }
                }

                function getCurrentXAxisExtent() {
                    const currentTransform = d3.zoomTransform(svg.node())
                    const currentXScale = currentTransform.rescaleX(x)

                    const minX = currentXScale.invert(0)
                    const maxX = currentXScale.invert(width)

                    return {
                        minX,
                        maxX
                    }
                }

                function getCurrentVisibleDataset() {
                    const xAxisExtent = getCurrentXAxisExtent()

                    const visibleDataset = skillData.filter(d => {
                        return d.date > xAxisExtent.minX && d.date <= xAxisExtent.maxX
                    })

                    return visibleDataset
                }

                function getCurrentVisibleDatasetWithAdjacent() {
                    const visibleDataset = getCurrentVisibleDataset()
                    const getDates = getCurrentXAxisExtent()

                    const firstVisibleDate = visibleDataset.length > 0 ? visibleDataset[0].date : getDates.maxX
                    const lastVisibleDate = visibleDataset.length > 0 ? visibleDataset[visibleDataset.length - 1].date : getDates.minX

                    const indexBefore = lastVisibleDate !== null ? skillData.findIndex(d => d.date === lastVisibleDate) + 1 : -1
                    const indexAfter = firstVisibleDate !== null ? skillData.findIndex(d => d.date === firstVisibleDate) - 1 : -1

                    return {
                        before: skillData[indexBefore],
                        visibleDataset,
                        after: skillData[indexAfter],
                    }
                }

                el.querySelector('.date-preferences').addEventListener('click', e => {
                    let item = anom_util.findParentBySelector(e.target, "[data-days]")
                    if (item) {
                        zoomTo(item.dataset.days, item)
                        localStorage.setItem('chart-zoomTo', item.dataset.days)
                    }
                })

                let autoZoom = localStorage.getItem('chart-zoomTo') || 7
                if (autoZoom)
                    zoomTo(autoZoom, el.querySelector(`[data-days="${autoZoom}"]`), 0)

                function setHeadline(xAxisExtent, filteredData) {
                    let screen = document.querySelector('.insights-pane')

                    let startDate = new Date(xAxisExtent.minX)
                    startDate.setDate(startDate.getDate() + 1)

                    screen.querySelector('.daterange').innerText = anom_util.displayDate(startDate, 'day month year') + ' - ' + anom_util.displayDate(xAxisExtent.maxX, 'day month year')

                    if(filteredData[0])
                        screen.querySelector('.current .value').innerHTML = filteredData[0].skill

                    let averageValue = calculateAverageSmooth(filteredData)
                    screen.querySelector('.average .value').innerHTML = averageValue ? averageValue : '--'

                    if (filteredData.length >= 2) {
                        let first = filteredData[filteredData.length - 1].skill
                        let last = filteredData[0].skill || false
                        screen.querySelector('.change .value').innerHTML = (last - first).toFixed(2)
                    } else
                        screen.querySelector('.change .value').innerHTML = '--'

                    function calculateAverageSmooth(jsonArray) {
                        const validSkill = jsonArray
                            .filter(obj => obj.hasOwnProperty('skill'))
                            .map(obj => obj.skill)

                        if (validSkill.length === 0) return 0

                        const sum = validSkill.reduce((acc, skill) => acc + skill, 0)
                        const average = sum / validSkill.length

                        return average.toFixed(2)
                    }
                }

            }).catch(e => {
                console.error('Error loading script', e)
            })

        } else {
            document.querySelector('.profile .row:nth-of-type(2)').insertAdjacentHTML('afterbegin', '<div style="margin-top:.5rem;margin-bottom:1.5rem;" class="msg msg-warning">Unfortunately, there is no public data available for this user.</div>')
        }

    } else if (window.location.pathname === '/leaders') {
        document.querySelector('.leaderboard .row').style.display = 'none'

        let leaderRaw = await fetch('https://skill.tagprohub.com/api/pub/leaderboard', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': `max-age=${anom_util.timeUntilNext15Mins()}`,
            }
        })
        let leaderData = await leaderRaw.json()

        function makeTable(leaderData, tab) {
            let contain = document.querySelector(`#board-${tab}`)
            contain.innerHTML = '<div class="col-sm-12 col-sm-pull-0"><table class="table table-stripped anom_table"></table></div>'

            let table = contain.querySelector('table')
            table.insertAdjacentHTML('afterbegin', `
        <thead>
            <tr>
                <th class="text-right" data-column="rank" data-sortby="asc">Rank</th>
                <th class="text-left" data-column="name" data-sortby="asc">Name</th>
                <th class="text-center active" data-column="skill" data-sortby="desc">Skill</th>
                <th class="text-center" data-column="games" data-sortby="desc">G</th>
                <th class="text-center" data-column="w" data-sortby="desc">W</th>
                <th class="text-center" data-column="l" data-sortby="desc">L</th>
                <th class="text-center" data-column="winpercent" data-sortby="desc">Win%</th>
                <th class="text-center" data-column="cf" data-sortby="desc">CF</th>
                <th class="text-center" data-column="ca" data-sortby="desc">CA</th>
                <th class="text-center" data-column="cd" data-sortby="desc">CD</th>
                <th class="text-right" data-column="lastgame" data-sortby="desc">Last.G</th>
                <th class="text-left" data-column="form" data-sortby="desc">Form</th>
            </tr>
        </thead>
        <tbody></tbody>
    `)

            for (let player of leaderData) {
                let flair = player.flair != null ? `<span class="flair ${player.flair.className}" style="background-position: calc(-16px * ${player.flair.x}) calc(-16px * ${player.flair.y});"></span>` : ''
                table.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="text-right" data-column="rank">${player.rank}</td>
                <td class="text-left" data-column="name"><a href="/profile/${player.profile}">${flair}${player.name}</a></td>
                <td class="text-center up" data-column="skill">${player.openskill}</td>
                <td class="text-center" data-column="games">${player.games}</td>
                <td class="text-center" data-column="w">${player.wins}</td>
                <td class="text-center" data-column="l">${player.losses}</td>
                <td class="text-center" data-column="winpercent">${player.winrate}</td>
                <td class="text-center" data-column="cf">${player.cf}</td>
                <td class="text-center" data-column="ca">${player.ca}</td>
                <td class="text-center" data-column="cd">${player.cd}</td>
                <td class="text-right" data-column="lastgame">${anom_util.timeAgo(player.lastgame)}</td>
                <td class="text-left form" data-column="form">${anom_util.buildForm(player.form)}</td>
            </tr>
        `)
            }
            contain.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, contain))

        }

        for (const tab of ['Day', 'Week', 'Month'])
            makeTable(leaderData[tab.toLowerCase()], tab.toLowerCase())

        makeTable(leaderData.all, 'rolling')
        let allTab = document.querySelector('[data-target="#boardCategory-winRate"]')
        allTab.innerText = 'All-Time'
        allTab.parentNode.prepend(allTab)
        document.querySelector('#board-rolling').classList.add("active");

       // Maps
        document.querySelector('.leaderboard-menu ul').insertAdjacentHTML('beforeend', '<li data-target="#board-Maps">Maps</li>')
        document.querySelector('.leaderboard-content').insertAdjacentHTML('beforeend', `
        <div id="board-Maps" class="row leaderboard">
            <div class="col-sm-12 col-sm-pull-0">
                <table class="table table-stripped anom_table">
                    <thead>
                        <tr>
                            <th class="text-right active" data-column="rank" data-sortby="asc">Rank</th>
                            <th class="text-left" data-column="name" data-sortby="asc">Player</th>
                            <th class="text-left" data-column="map" data-sortby="desc">Map</th>
                            <th class="text-center" data-column="games" data-sortby="desc">G</th>
                            <th class="text-center" data-column="w" data-sortby="desc">W</th>
                            <th class="text-center" data-column="l" data-sortby="desc">L</th>
                            <th class="text-center" data-column="winrate" data-sortby="desc">Win%</th>
                            <th class="text-right" data-column="lastgame" data-sortby="desc">Last.G</th>
                            <th class="text-left" data-column="form" data-sortby="desc">Form</th>
                        </tr>
                    </thead>
                <tbody></tbody>
            </div>
        </div>
        `)
        let mapsTable = document.querySelector('#board-Maps table')
        for (let player of leaderData.maps) {
            let flair = player.flair != null ? `<span class="flair ${player.flair.className}" style="background-position: calc(-16px * ${player.flair.x}) calc(-16px * ${player.flair.y});"></span>` : ''
            mapsTable.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="text-right" data-column="rank">${player.rank}</td>
                <td class="text-left" data-column="name"><a href="/profile/${player.profile}">${flair}${player.name}</a></td>
                <td class="text-left" data-column="map"><a href="/maps/${player.map}">${player.map}</a></td>
                <td class="text-center" data-column="games">${player.games}</td>
                <td class="text-center" data-column="w">${player.wins}</td>
                <td class="text-center" data-column="l">${player.games - player.wins}</td>
                <td class="text-center" data-column="winrate">${player.winrate}</td>
                <td class="text-right" data-column="lastgame">${anom_util.timeAgo(player.lastgame)}</td>
                <td class="text-left form" data-column="form">${anom_util.buildForm(player.form)}</td>
            </tr>
        `)
            }
            mapsTable.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, mapsTable))

        // Versus
        document.querySelector('.leaderboard-menu ul').insertAdjacentHTML('beforeend', '<li data-target="#board-Versus">Versus</li>')
        document.querySelector('.leaderboard-content').insertAdjacentHTML('beforeend', `
        <div id="board-Versus" class="row leaderboard">
            <div class="col-sm-12 col-sm-pull-0">
                <table class="table table-stripped anom_table">
                    <thead>
                        <tr>
                            <th class="text-right active" data-column="rank" data-sortby="asc">Rank</th>
                            <th class="text-left" data-column="name" data-sortby="asc">Winner</th>
                            <th class="text-left" data-column="losername" data-sortby="desc">Loser</th>
                            <th class="text-center" data-column="games" data-sortby="desc">G</th>
                            <th class="text-center" data-column="w" data-sortby="desc">W</th>
                            <th class="text-center" data-column="l" data-sortby="desc">L</th>
                            <th class="text-center" data-column="winrate" data-sortby="desc">Win%</th>
                            <th class="text-right" data-column="lastgame" data-sortby="desc">Last.G</th>
                            <th class="text-left" data-column="form" data-sortby="desc">Form</th>
                        </tr>
                    </thead>
                <tbody></tbody>
            </div>
        </div>
        `)
        let versusTable = document.querySelector('#board-Versus table')
        for (let player of leaderData.versus) {
            let winner_flair = player.winner_flair != null ? `<span class="flair ${player.winner_flair.className}" style="background-position: calc(-16px * ${player.winner_flair.x}) calc(-16px * ${player.winner_flair.y});"></span>` : ''
            let loser_flair = player.loser_flair != null ? `<span class="flair ${player.loser_flair.className}" style="background-position: calc(-16px * ${player.loser_flair.x}) calc(-16px * ${player.loser_flair.y});"></span>` : ''
            versusTable.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="text-right" data-column="rank">${player.rank}</td>
                <td class="text-left" data-column="name"><a href="/profile/${player.winner_profile}">${winner_flair}${player.winner}</a></td>
                <td class="text-left" data-column="losername"><a href="/profile/${player.loser_profile}">${loser_flair}${player.loser}</a></td>
                <td class="text-center" data-column="games">${player.games}</td>
                <td class="text-center" data-column="w">${player.wins}</td>
                <td class="text-center" data-column="l">${player.games - player.wins}</td>
                <td class="text-center" data-column="winrate">${player.winrate}</td>
                <td class="text-right" data-column="lastgame">${anom_util.timeAgo(player.lastgame)}</td>
                <td class="text-left form" data-column="form">${anom_util.buildForm(player.form)}</td>
            </tr>
        `)
            }
            versusTable.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, versusTable))

        // Partner Leaderboard
        document.querySelector('.leaderboard-menu ul').insertAdjacentHTML('beforeend', '<li data-target="#board-Duo">Duos</li>')
        document.querySelector('.leaderboard-content').insertAdjacentHTML('beforeend', `
        <div id="board-Duo" class="row leaderboard">
            <div class="col-sm-12 col-sm-pull-0">
                <table class="table table-stripped anom_table">
                    <thead>
                        <tr>
                            <th class="text-right active" data-column="rank" data-sortby="asc">Rank</th>
                            <th class="text-left" data-column="name" data-sortby="asc">Name</th>
                            <th class="text-left" data-column="partner" data-sortby="desc">Partner</th>
                            <th class="text-center" data-column="games" data-sortby="desc">G</th>
                            <th class="text-center" data-column="w" data-sortby="desc">W</th>
                            <th class="text-center" data-column="l" data-sortby="desc">L</th>
                            <th class="text-center" data-column="winrate" data-sortby="desc">Win%</th>
                            <th class="text-right" data-column="lastgame" data-sortby="desc">Last.G</th>
                            <th class="text-left" data-column="form" data-sortby="desc">Form</th>
                        </tr>
                    </thead>
                <tbody></tbody>
            </div>
        </div>
        `)
        let duoTable = document.querySelector('#board-Duo table')
        for (let player of leaderData.duos) {
            let player1_flair = player.player1_flair != null ? `<span class="flair ${player.player1_flair.className}" style="background-position: calc(-16px * ${player.player1_flair.x}) calc(-16px * ${player.player1_flair.y});"></span>` : ''
            let player2_flair = player.player2_flair != null ? `<span class="flair ${player.player2_flair.className}" style="background-position: calc(-16px * ${player.player2_flair.x}) calc(-16px * ${player.player2_flair.y});"></span>` : ''
            duoTable.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="text-right" data-column="rank">${player.rank}</td>
                <td class="text-left" data-column="name"><a href="/profile/${player.player1_profile}">${player1_flair}${player.player1}</a></td>
                <td class="text-left" data-column="partner"><a href="/profile/${player.player2_profile}">${player2_flair}${player.player2}</a></td>
                <td class="text-center" data-column="games">${player.games}</td>
                <td class="text-center" data-column="w">${player.wins}</td>
                <td class="text-center" data-column="l">${player.games - player.wins}</td>
                <td class="text-center" data-column="winrate">${player.winrate}</td>
                <td class="text-right" data-column="lastgame">${anom_util.timeAgo(player.lastgame)}</td>
                <td class="text-left form" data-column="form">${anom_util.buildForm(player.form)}</td>
            </tr>
        `)
            }
            duoTable.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, duoTable))

        // reinit tab click
        $(".leaderboard-menu li").off("click")
    	$(".leaderboard-menu li").click((function(e) {
            e.preventDefault()
            let t = $(this)
            $(".leaderboard-menu li").removeClass("active"), $(".leaderboard-content .leaderboard").removeClass("active"), $(t.data("target")).addClass("active"), t.addClass("active")
        }))

        document.querySelector('.leaderboard-menu').addEventListener('click', e => {
            let tab = anom_util.findParentBySelector(e.target, '[data-target]')
            if (tab)
                localStorage.setItem('leader-tab-active', tab.dataset.target)
        })
        let activeTab = localStorage.getItem('leader-tab-active')
        if(activeTab){
            setTimeout(function(){
                document.querySelector(`.leaderboard-menu [data-target="${activeTab}"`).click()
            }, 1);

        }
        document.querySelector('.leaderboard .row').style.display = 'block'
        document.querySelector('[data-target="#boardCategory-community"]').remove();
        document.querySelector('[data-target="#boardCategory-volunteers"]').remove();
        document.querySelector('[data-target="#boardCategory-leaderboards"]').remove();
        let deletable = document.querySelector('.tab-list').classList.remove('active');
        const boardRolling = document.querySelector('[data-target="#boardCategory-winRate"]');
        const monthly = document.createElement('li');
        monthly.setAttribute('id','board-Week-button');
        monthly.innerText = "Month";
        boardRolling.parentNode.insertBefore(monthly, boardRolling.nextSibling);
        const weekly = document.createElement('li');
        weekly.setAttribute('id','board-Week-button');
        weekly.innerText = "Week";
        boardRolling.parentNode.insertBefore(weekly, boardRolling.nextSibling);
        const daily = document.createElement('li');
        daily.setAttribute('id','board-Day-button');
        daily.innerText = "Day";
        boardRolling.parentNode.insertBefore(daily, boardRolling.nextSibling);
        boardRolling.addEventListener('click', () => {
            document.querySelector('#board-rolling').classList.add('active');
        });
        daily.addEventListener('click', () => {
            const activeElements = document.querySelectorAll('.active');
            activeElements.forEach((el) => {
                el.classList.remove('active');
            });
            daily.classList.add('active');
            document.getElementById('board-day').classList.add('active');

        });
        weekly.addEventListener('click', () => {
            const activeElements = document.querySelectorAll('.active');
            activeElements.forEach((el) => {
                el.classList.remove('active');
            });
            weekly.classList.add('active');
            document.getElementById('board-week').classList.add('active');
        });
        monthly.addEventListener('click', () => {
            const activeElements = document.querySelectorAll('.active');
            activeElements.forEach((el) => {
                el.classList.remove('active');
            });
            monthly.classList.add('active');
            document.getElementById('board-month').classList.add('active');
        });


    } else if (window.location.pathname === '/maps') {

        let tabList  = document.querySelector('.tab-list')
        tabList.insertAdjacentHTML('afterbegin', '<li data-category="ranked"><a>Rankings</a></li>')

        let tabContent = document.querySelector('.tab-content')
        tabContent.insertAdjacentHTML('afterbegin', `
        <div id="ranked" class="tab-pane">
            <div class="row">

                    <table class="table table-stripped leaders anom_table">
                        <thead>
                            <tr>
                                <th class="text-right active" data-column="rank" data-sortby="asc">Rank</th>
                                <th class="text-left" data-column="name" data-sortby="asc">Name</th>
                                <th class="text-center" data-column="games" data-sortby="desc">Games</th>
                                <th class="text-center" data-column="avgduration" data-sortby="desc">Avg Dur</th>
                                <th class="text-center" data-column="avgcaps" data-sortby="desc">Avg Caps</th>
                                <th class="text-center" data-column="redwinpercentage" data-sortby="desc">Red W%</th>
                                <th class="text-center" data-column="bluewinpercentage" data-sortby="desc">Blue W%</th>
                                <th class="text-center" data-column="mercyrate" data-sortby="desc">Mercy%</th>
                                <th class="text-center" data-column="overtimerate" data-sortby="desc">Overtime%</th>
                                <th class="text-right" data-column="lastgame" data-sortby="desc">Last.G</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>

            </div>
        </div>
        `)

        // reinit tab click
        $(".tab-list li").off("click")
    	$(".tab-list li").click((function(e) {
            e.preventDefault()
            let t = $(this)
            $(".tab-list li").removeClass("active")
            t.addClass("active")
            $(".tab-pane").removeClass("active")
            $('#'+t.data("category")).addClass("active")
        }))

        document.querySelector('.tab-list').addEventListener('click', e => {
            let tab = anom_util.findParentBySelector(e.target, '[data-category]')
            if (tab)
                localStorage.setItem('map-tab-active', tab.dataset.category)
        })
        let activeTab = localStorage.getItem('map-tab-active')
        if(activeTab){
            document.querySelector(`.tab-list [data-category="${activeTab}"`).click()
        }

        let mapRaw = await fetch(`https://skill.tagprohub.com/api/pub/maps`, {
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json',
               'Cache-Control': `max-age=${anom_util.timeUntilNext15Mins()}`,
           }
       })
       let mapData = await mapRaw.json()

      let mapsTable = document.querySelector('#ranked .table')
        for (let map of mapData) {
            mapsTable.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="text-right" data-column="rank">${map.rank}</td>
                <td class="text-left" data-column="name"><a href="/maps/${map.name}">${map.name}</a></td>
                <td class="text-center" data-column="games">${map.games}</td>
                <td class="text-center" data-column="avgduration">${map.avg_duration}</td>
                <td class="text-center" data-column="avgcaps">${map.avg_caps_per_game}</td>
                <td class="text-center" data-column="redwinpercentage">${map.red_win_percentage}</td>
                <td class="text-center" data-column="bluewinpercentage">${map.blue_win_percentage}</td>
                <td class="text-center" data-column="mercyrate">${map.mercy_percentage}</td>
                <td class="text-center" data-column="overtimerate">${map.overtime_percentage}</td>
                <td class="text-right" data-column="lastgame">${anom_util.timeAgo(map.lastgame)}</td>
            </tr>
        `)
            }
            mapsTable.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, mapsTable))

    } else if (window.location.pathname.includes('/maps/')) {

        document.querySelector('body > .container .row').classList.add('hide')

        const url = new URL(window.location.href)
        const mapName = url.pathname.split('/maps/')[1].replace(/-/g, ' ')

        let profileID = anom_util.getProfileID()
        let mapRaw = await fetch(`https://skill.tagprohub.com/api/pub/maps/${mapName.replace(/\s+/g, '-')}/${profileID}`, {
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json',
               'Cache-Control': `max-age=${anom_util.timeUntilNext15Mins()}`,
           }
       })
       let mapData = await mapRaw.json()

       if(mapData.leaders.length) {
        document.title = 'TagPro Map: ' + mapData.name
        document.querySelector('body > .container .row').innerHTML = `
        <h2 class="header-title map-name">${mapData.name}</h2>
        <div class="row" style="margin-bottom:2rem">
            <div class="col-md-7">
                <div class="row">
                    <div class="col-md-12" >

                <table class="anom_table_small">
                <thead>
                        <tr>
                            <td></td>
                            <td class="text-left column">Total</td>
                            <td class="text-left column">You</td>
                        </tr>
                </thead>
                   <tbody>

                        <tr>
                            <td class="table-row-label">Games</td>
                            <td class="text-left column">${mapData.stats.all.games}</td>
                            <td class="text-left column">${mapData.stats.mine.games}</td>
                        </tr>
                        <tr>
                            <td class="table-row-label">Avg Duration</td>
                            <td class="text-left column">${mapData.stats.all.avg_duration}</td>
                            <td class="text-left column">${mapData.stats.mine.avg_duration}</td>
                        </tr>
                        <tr>
                            <td class="table-row-label">Avg Caps</td>
                            <td class="text-left column">${mapData.stats.all.avg_caps_per_game}</td>
                            <td class="text-left column">${mapData.stats.mine.avg_caps_per_game}</td>
                        </tr>
                        <tr>
                            <td class="table-row-label">Mercy %</td>
                            <td class="text-left column">${mapData.stats.all.mercy_percentage}</td>
                            <td class="text-left column">${mapData.stats.mine.mercy_percentage}</td>
                        </tr>
                        <tr>
                            <td class="table-row-label">Overtime %</td>
                            <td class="text-left column">${mapData.stats.all.overtime_percentage}</td>
                            <td class="text-left column">${mapData.stats.mine.overtime_percentage}</td>
                        </tr>
                        <tr>
                            <td class="table-row-label">Longest Game</td>
                            <td class="text-left column"><a href="https://tagpro.koalabeast.com/game?replay=${anom_util.getReplay(mapData.stats.all.max_duration_tpid)}">${mapData.stats.all.max_duration}</a></td>
                            <td class="text-left column"><a href="https://tagpro.koalabeast.com/game?replay=${anom_util.getReplay(mapData.stats.mine.max_duration_tpid)}">${mapData.stats.mine.max_duration}</a></td>
                        </tr>
                        <tr>
                            <td class="table-row-label">Most Capped Game</td>
                            <td class="text-left column"><a href="https://tagpro.koalabeast.com/game?replay=${anom_util.getReplay(mapData.stats.all.most_caps_tpid)}">${mapData.stats.all.most_caps}</a></td>
                            <td class="text-left column"><a href="https://tagpro.koalabeast.com/game?replay=${anom_util.getReplay(mapData.stats.mine.most_caps_tpid)}">${mapData.stats.mine.most_caps}</a></td>
                        </tr>
                        <tr>
                            <td class="table-row-label">Last Game</td>
                            <td class="text-left column">${anom_util.timeAgo(mapData.stats.all.lastgame)}</td>
                            <td class="text-left column">${anom_util.timeAgo(mapData.stats.mine.lastgame)}</td>
                        </tr>
                    </tbody>
                </table>
                    </div>

                </div>
            </div>
            <div class="col-md-5">
                    <img src="https://static.koalabeast.com/images/maps/${mapName}-small.png" class="preview img-responsive" style="margin:0 auto">
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12 map-tabs">
                <ul class="tab-list">
                    <li data-tab="leaders"><a>Leaderboard</a></li>
                    <li data-tab="all" class="active"><a>All Recent Games</a></li>
                    <li data-tab="mine"><a>My Recent Games</a></li>
                </ul>
              <div class="list leaders hide map-leaders">
                    <table class="table table-stripped leaders anom_table">
                        <thead>
                            <tr>
                                <th class="text-right active" data-column="rank" data-sortby="asc">Rank</th>
                                <th class="text-left" data-column="name" data-sortby="asc">Name</th>
                                <th class="text-center" data-column="games" data-sortby="desc">G</th>
                                <th class="text-center" data-column="w" data-sortby="desc">W</th>
                                <th class="text-center" data-column="l" data-sortby="desc">L</th>
                                <th class="text-center" data-column="winrate" data-sortby="desc">Win%</th>
                                <th class="text-center" data-column="mercyrate" data-sortby="desc">Mercy%</th>
                                <th class="text-center" data-column="avgduration" data-sortby="desc">Avg Dur</th>
                                <th class="text-center" data-column="cf" data-sortby="desc">CF</th>
                                <th class="text-center" data-column="ca" data-sortby="desc">CA</th>
                                <th class="text-center" data-column="cd" data-sortby="desc">CD</th>
                                <th class="text-right" data-column="lastgame" data-sortby="desc">Last.G</th>
                                <th class="text-left" data-column="form" data-sortby="desc">Form</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="list all recent-games">
                    <div class="col-md-12">
                        <div class="gamelist all"></div>
                    </div>
                </div>
                <div class="list mine recent-games">
                    <div class="col-md-12">
                        <div class="gamelist mine"></div>
                    </div>
                </div>
            </div>
        </div>
        `

       let mapsTable = document.querySelector('.map-leaders .table')
        for (let player of mapData.leaders) {
            let flair = player.flair != null ? `<span class="flair ${player.flair.className}" style="background-position: calc(-16px * ${player.flair.x}) calc(-16px * ${player.flair.y});"></span>` : ''
            mapsTable.querySelector('tbody').insertAdjacentHTML('beforeend', `
            <tr>
                <td class="text-right" data-column="rank">${player.rank}</td>
                <td class="text-left" data-column="name"><a href="/profile/${player.profile}">${flair}${player.name}</a></td>
                <td class="text-center" data-column="games">${player.games}</td>
                <td class="text-center" data-column="w">${player.wins}</td>
                <td class="text-center" data-column="l">${player.games - player.wins}</td>
                <td class="text-center" data-column="winrate">${player.winrate}</td>
                <td class="text-center" data-column="mercyrate">${player.mercyrate}</td>
                <td class="text-center" data-column="avgduration">${player.avgduration}</td>
                <td class="text-center" data-column="cf">${player.cf}</td>
                <td class="text-center" data-column="ca">${player.ca}</td>
                <td class="text-center" data-column="cd">${player.cd}</td>
                <td class="text-right" data-column="lastgame">${anom_util.timeAgo(player.lastgame)}</td>
                <td class="text-left form" data-column="form">${anom_util.buildForm(player.form)}</td>
            </tr>
        `)
            }
            mapsTable.querySelector('thead').addEventListener('click', (e) => anom_util.sortColumn(e, mapsTable))

       for(let type of ['all', 'mine'])
            for(let stat of mapData.games[type])
                anom_util.makeGame(stat, type)

        let tabList = document.querySelector('.tab-list')
        tabList.addEventListener('click', (e) => {
            let li = anom_util.findParentBySelector(e.target, "li")
            if (li) {
                tabList.querySelector('.active').classList.remove('active')
                li.classList.add('active')

                let tab = li.dataset.tab
                localStorage.setItem('map-tab', tab)

                Array.from(document.querySelectorAll('.list')).forEach(gameList => gameList.classList.add('hide'))
                document.querySelector(`.list.${tab}`).classList.remove('hide')
            }
        })

        let autoTab = localStorage.getItem('map-tab') || 'all'
        if (autoTab)
            tabList.querySelector(`[data-tab="${autoTab}"`).click()

        }
        document.querySelector('body > .container .row').classList.remove('hide')

    }

})();
