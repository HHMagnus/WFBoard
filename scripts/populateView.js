const personal_tbody = document.querySelector("#personal_tbody");
const playerViewTemplate = document.querySelector("#playerView");

const level_tbody = document.querySelector("#level_tbody");
const levelViewTemplate = document.querySelector("#levelView");

const full_game_tbody = document.querySelector("#full_game_tbody");
const fullGameViewTemplate = document.querySelector("#fullGameView");

const leaderboardOverlayViewTemplate = document.querySelector("#leaderboardOverlayView");
const leaderboardScoreViewTemplate = document.querySelector("#leaderboardScoreView");

function playerLinkView(player_id, players) {
    let player = players.find (player => player.id == player_id);
    let player_name = "Unknown";
    let player_profile = "#";
    if(player.rel == "guest") {
        player_name = player.name;
        player_profile = player.uri;
    } else {
        player_name = player.names.international;
        player_profile = player.weblink;
    }

    let player_element = document.createElement("a");
    player_element.href = player_profile;
    player_element.innerText = player_name;
    return player_element;
}

function populatePersonalRankings (json, playerRanks) {
    playerRanks.forEach (rank => {
        let playerView = document.importNode(playerViewTemplate.content, true);

        let player_element = playerLinkView(rank.id, json.players);
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

    sorttable.makeSortable(document.querySelector("#personal_table"));
}

function showLeaderboardOverlay(json, leaderboard, runScores) {
    // Insert overview
    let levelOverlayView = document.importNode(leaderboardOverlayViewTemplate.content, true);

    let level_name = levelOverlayView.querySelector(".level_name");
    level_name.innerText = leaderboard.name;

    let level_runs = levelOverlayView.querySelector(".level_runs");
    leaderboard.data.runs.forEach(run => {
        let levelScoresView = document.importNode(leaderboardScoreViewTemplate.content, true);

        let place = levelScoresView.querySelector(".place");
        place.innerText = run.place;

        let player_name = levelScoresView.querySelector(".player_name");
        run.run.players.forEach(player => {
            let player_element = playerLinkView(player.id, json.players);
            player_element.style.marginLeft = "8px";
            player_name.appendChild(player_element)
        });

        let score = levelScoresView.querySelector(".score");
        score.innerText = runScores[run.run.id].score;

        level_runs.appendChild(levelScoresView);
    });

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
            level_button.href = "#" + leaderboard.name;

            let level_name = levelView.querySelector(".level_name");
            level_name.appendChild(level_button);

            level_tbody.append(levelView);
        });
    });
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
            full_game_button.href = "#" + leaderboard.name;


            let full_game_name = fullGameView.querySelector(".name");
            full_game_name.appendChild(full_game_button);

            full_game_tbody.append(fullGameView);
        });
    });
}

export default (json, playerRanks, runScores) => {
    populatePersonalRankings(json,playerRanks);
    populateLevels(json, runScores);
    populateFullGame(json, runScores);

    removeLoader();
}

function removeLoader() { document.querySelector("#loader").style.display = "none"; }