const personal_tbody = document.querySelector("#personal_tbody");
const playerViewTemplate = document.querySelector("#playerView");

const level_tbody = document.querySelector("#level_tbody");
const levelViewTemplate = document.querySelector("#levelView");

const full_game_tbody = document.querySelector("#full_game_tbody");
const fullGameViewTemplate = document.querySelector("#fullGameView");

const leaderboardOverlayViewTemplate = document.querySelector("#leaderboardOverlayView");
const leaderboardScoreViewTemplate = document.querySelector("#leaderboardScoreView");

const personalOverlayViewTemplate = document.querySelector("#personalOverlayView");
const personalScoreViewTemplate = document.querySelector('#personalScoreView');

const personal_table = document.querySelector("#personal_table");
const level_table = document.querySelector(".level_table");
const full_game_table = document.querySelector(".full_game_table");

function playerLinkView(player_name, player_profile) {
    let player_element = player_profile != undefined ? document.createElement("a") : document.createElement('span');
    if(player_profile) player_element.href = player_profile;
    player_element.innerText = player_name;
    return player_element;
}

function showPlayerOverlay(player, rank, runScores) {
    const personalOverlayView = document.importNode(personalOverlayViewTemplate.content, true);

    const player_name = personalOverlayView.querySelector(".player_name");
    player_name.innerText = player.rel == 'guest' ? player.name : player.names.international;

    const runs = personalOverlayView.querySelector(".runs");

    const addRun = (type) => (run) => {
        const runDetails = runScores[run];
        const runView = document.importNode(personalScoreViewTemplate.content, true);

        runView.querySelector('.place').innerText = runDetails.place;
        runView.querySelector('.type').innerText = type;
        let leaderboard_link = document.createElement('a');
        leaderboard_link.href = runDetails.link;
        leaderboard_link.innerText = runDetails.leaderboard_name;
        runView.querySelector('.leaderboard_name').appendChild(leaderboard_link);
        runView.querySelector('.score').innerText = runDetails.score;

        runs.appendChild(runView);
    }
    rank.full_game_runs.forEach(addRun('Full Game'));
    rank.level_runs.forEach(addRun('Level'));

    const visit_profile = personalOverlayView.querySelector('.visit_profile');
    visit_profile.href = player.rel == 'guest' ? player.uri : player.weblink;
    
    const runs_table = personalOverlayView.querySelector('.runs_table');
    sorttable.makeSortable(runs_table);

    document.body.appendChild(personalOverlayView);
}

function populatePersonalRankings (json, playerRanks, runScores) {
    playerRanks.forEach (rank => {
        let playerView = document.importNode(playerViewTemplate.content, true);

        let player = json.players.find (player => player.id == rank.id);
        let player_element = player.rel == 'guest' ? 
            playerLinkView(player.name) 
            : playerLinkView(player.names.international, player.weblink);
        
        player_element.href = "#";
        player_element.addEventListener('click', ev => {
            ev.preventDefault();
            const player = json.players.find (player => player.id == rank.id);
            showPlayerOverlay(player, rank, runScores);
        })
        playerView.querySelector(".player_name").appendChild(player_element);
        
        let level_score =  playerView.querySelector(".level_score");
        level_score.innerText = rank.level_place + " (" + rank.level_score + " point)";
        level_score.setAttribute("sorttable_customkey", rank.level_score);
        
        let full_game_score = playerView.querySelector(".full_game_score");
        full_game_score.innerText = rank.full_game_place + " (" + rank.full_game_score + " point)";
        full_game_score.setAttribute("sorttable_customkey", rank.full_game_score);
        
        let overall_score = playerView.querySelector(".overall_score")
        overall_score.innerText = rank.overall_place + " (" + rank.overall_score + " point)";
        overall_score.setAttribute("sorttable_customkey", rank.overall_place);

        personal_tbody.appendChild(playerView);

    });

    sorttable.makeSortable(personal_table);
}

function showLeaderboardOverlay(json, leaderboard, runScores) {
    // Insert overview
    let levelOverlayView = document.importNode(leaderboardOverlayViewTemplate.content, true);

    let level_name = levelOverlayView.querySelector(".level_name");
    level_name.innerText = leaderboard.name;

    let level_runs = levelOverlayView.querySelector(".level_runs");
    let previously_seen_players = [];
    leaderboard.data.runs.forEach(run => {
        let levelScoresView = document.importNode(leaderboardScoreViewTemplate.content, true);

        let place = levelScoresView.querySelector(".place");
        place.innerText = run.place;

        let player_name = levelScoresView.querySelector(".player_name");
        run.run.players.forEach(player => {
            let name = player.name;
            let uri = undefined;
            if(player.rel == 'user') {
                const playerDetails = json.players.find(x => x.id == player.id);
                name = playerDetails.names.international;
                uri = playerDetails.weblink;
            }
            let player_element = playerLinkView(name, uri);
            player_element.style.marginLeft = "8px";
            if(previously_seen_players.includes(name)) player_element.style.textDecoration = 'line-through';
            player_name.appendChild(player_element)

            previously_seen_players.push(name);
        });

        let score = levelScoresView.querySelector(".score");
        score.innerText = runScores[run.run.id].score;

        level_runs.appendChild(levelScoresView);
    });
    
    if(leaderboard.data.runs.length == 0) {
        let no_runs = levelOverlayView.querySelector(".no_runs");
        no_runs.style.display = "block";
    }

    let visit_level = levelOverlayView.querySelector(".visit_level");
    visit_level.href = leaderboard.data.weblink;

    document.body.appendChild(levelOverlayView);
}

function populateLevels(json, runScores) {
    json.levels.forEach(level => {
        level.leaderboards.forEach(leaderboard => {
            // Insert run
            let levelView = document.importNode(levelViewTemplate.content, true);
            let level_button = document.createElement("a");
            level_button.addEventListener('click', (ev) => {
                ev.preventDefault();
                showLeaderboardOverlay(json, leaderboard, runScores);
            });
            level_button.innerText = leaderboard.name;
            level_button.href = "#";

            let level_name = levelView.querySelector(".level_name");
            level_name.appendChild(level_button);

            let runs = levelView.querySelector('.runs');
            runs.innerText = leaderboard.data.runs.length;

            level_tbody.append(levelView);
        });
    });

    sorttable.makeSortable(level_table);
}

function populateFullGame(json, runScores) {
    json.categories.forEach(category => {
        category.leaderboards.forEach(leaderboard => {
            let fullGameView = document.importNode(fullGameViewTemplate.content, true);
            let full_game_button = document.createElement("a");
            full_game_button.addEventListener('click', (ev) => {
                ev.preventDefault();
                showLeaderboardOverlay(json, leaderboard, runScores);
            });
            full_game_button.innerText = leaderboard.name;
            full_game_button.href = "#";


            let full_game_name = fullGameView.querySelector(".name");
            full_game_name.appendChild(full_game_button);

            let runs = fullGameView.querySelector('.runs');
            runs.innerText = leaderboard.data.runs.length;

            full_game_tbody.append(fullGameView);
        });
    });

    sorttable.makeSortable(full_game_table);
}

export function populateView (json, playerRanks, runScores) {
    populatePersonalRankings(json, playerRanks, runScores);
    populateLevels(json, runScores);
    populateFullGame(json, runScores);

    removeLoader();
}

function removeLoader() { document.querySelector("#loader").style.display = "none"; }

export function cleanView() {
    const remove_sortable = table => {
        const cells = table.getElementsByTagName('thead')[0].rows[0].cells;
        for(let i = 0; i < cells.length; i++){
            const cell = cells[i];
            const new_cell = cell.cloneNode(true);
            cell.parentNode.replaceChild(new_cell, cell);
        }
    }
    personal_tbody.innerHTML = "";
    remove_sortable(personal_table);
    level_tbody.innerHTML = "";
    remove_sortable(level_table);
    full_game_tbody.innerHTML = "";
    remove_sortable(full_game_table);
}

export function rankingSystemView(applyRankingSystem) {
    // Show overlay on click
    const ranking_system_button = document.querySelector('#ranking_system');
    ranking_system_button.addEventListener('click', (ev) => {
        document.querySelector('#ranking_method').style.display = 'block';
    });

    // Show description depending on selected option
    const score_select = document.querySelector('#score_select');
    score_select.addEventListener('change', (ev) => {
        document.querySelectorAll('.score_description').forEach(x => {
            x.style.display = 'none';
        })
        document.querySelector('#' + score_select.value + '-view').style.display = 'block';
    });

    // apply button
    const apply = document.querySelector('#apply_ranking');
    apply.addEventListener('click', (ev) => {
        document.querySelector('#ranking_method').style.display = 'none';
        applyRankingSystem(score_select.value);
    });
}