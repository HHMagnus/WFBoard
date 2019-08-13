function pointSystemChange(gameData) {

    wipeUI();

    scorePlayers();

    scoreLevels(gameData);
}

var playerPlacements = [];

var levelPlayerPlacements = [];

var categoryPlayerPlacements = [];

function toPlacement(place, totalRuns) {
    return { "place": place, "totalRuns": totalRuns };
}

function addPlayerPlacement(placementList, playerId, place, totalRuns, levelname) {
    let placement = toPlacement(place, totalRuns)
    placement["level_name"] = levelname;
    if (placementList[playerId]) {
        placementList[playerId].push(placement);
    } else {
        placementList[playerId] = [placement];
    }
}
function addPlayerLevelPlacement(playerId, place, totalRuns, levelname) {
    addPlayerPlacement(playerPlacements, playerId, place, totalRuns, levelname);
    addPlayerPlacement(levelPlayerPlacements, playerId, place, totalRuns, levelname);
}

function addPlayerCategoryPlacement(playerId, place, totalRuns, levelname) {
    addPlayerPlacement(playerPlacements, playerId, place, totalRuns, levelname);
    addPlayerPlacement(categoryPlayerPlacements, playerId, place, totalRuns, levelname);
}

function leaderboardcalculator(leaderboard, addfunction) {
    let playersAlreadyPlaced = [];
    leaderboard.runs.forEach(run => {
        run.players.forEach(player => {
            if(!playersAlreadyPlaced.includes(player)) {
                addfunction(player, run.place, leaderboard.total_runs, leaderboard.name);
                playersAlreadyPlaced.push(player);
            }
        })
    })
}

function calculatePlayerPlacements(gameData) {
    playerPlacements = [];
    levelPlayerPlacements = [];
    categoryPlayerPlacements = [];

    gameData.levels.forEach((level) => {
        leaderboardcalculator(level, addPlayerLevelPlacement);
    });

    gameData.categories.forEach(category => {
        leaderboardcalculator(category, addPlayerCategoryPlacement);
    });
    
    delete playerPlacements.undefined;
    delete levelPlayerPlacements.undefined;
    delete categoryPlayerPlacements.undefined;
}

function scoreLevels(gameData) {
    gameData.levels.forEach(level => {
        addLevelToTable(level, "levelsTable", "level-modal-")
    });

    gameData.categories.forEach(category => {
        addLevelToTable(category, "full_gameTable", "full_game-modal-");
    });
}

var scoredPlayers = [];

var scoredLevelPlayers = [];

var scoredCategoryPlayers = [];

function scorePlayers() {

    scoredPlayers = [];
    scoredLevelPlayers = [];
    scoredCategoryPlayers = [];

    console.log(playerPlacements);

    let scoringMethod = getScoringMethod();
    score(playerPlacements, scoredPlayers, scoringMethod);
    score(levelPlayerPlacements, scoredLevelPlayers, scoringMethod);
    score(categoryPlayerPlacements, scoredCategoryPlayers, scoringMethod);

    sortPlayers();
}

function sortPlayers() {

    scoredPlayers.sort((a, b) => b["score"] - a["score"]);
    scoredLevelPlayers.sort((a, b) => b["score"] - a["score"]);
    scoredCategoryPlayers.sort((a, b) => b["score"] - a["score"]);

    console.log(scoredPlayers);

    addPlayers(scoredPlayers,addPlayerToTable, "playersTable", "player-modal-");
    addPlayers(scoredLevelPlayers,addPlayerToTable ,"levelranking-playersTable", "player-level-modal-");
    addPlayers(scoredCategoryPlayers,addPlayerToTable, "full_gameranking-playersTable", "player-full_game-modal-");
}

function addPlayers(scoredplayers, addfunction, tableid, modaltype) {
    let placement = 0;
    let lastScore = -1;
    let lastPlacement = 0;

    scoredplayers.forEach((player) => {
        placement++;

        let place = placement;
        let score = player["score"];

        if (score === lastScore) {
            place = lastPlacement;
        }

        addfunction(tableid, modaltype, place, player["name"], score, player["placements"]);

        lastPlacement = place;
        lastScore = score;

    });
}

function score(placements, scores, scoringMethod) {
    for(player in placements) {
        let score = 0;

        placements[player].forEach((placement) => {
            score += scoringMethod(placement);
        });

        scores.push({ "name": player, "score": round(score), "placements": placements[player] });
    }

}

function round(score) {
    return Math.round(score);
}

