function pointSystemChange() {

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

function leaderboardcalculator(leaderboard, leaderboard_name, addfunction) {
    let playersAlreadyPlaced = [];
    if (leaderboard["runs"][0]) {
        leaderboard["runs"].forEach(run => {
            run["run"]["players"].forEach(player => {
                if (!playersAlreadyPlaced.includes(player["id"])) {
                    addfunction(player["id"], run["place"], leaderboard["runs"].length, leaderboard_name);
                    playersAlreadyPlaced.push(player["id"]);
                }
            });
        });
    }
}

function calculatePlayerPlacements(gameData) {
    playerPlacements = [];
    levelPlayerPlacements = [];
    categoryPlayerPlacements = [];

    gameData.levels.forEach((level) => {
        level.subLevels.forEach((sublevel) => {
            leaderboardcalculator(sublevel.leaderboardInfo, sublevel.name, addPlayerLevelPlacement);
        });
    });

    gameData.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
            leaderboardcalculator(subcategory.leaderboardInfo, subcategory.name, addPlayerCategoryPlacement);
        });
    });
    
    playerPlacements = filterUndefined(playerPlacements);
    levelPlayerPlacements = filterUndefined(levelPlayerPlacements);
    categoryPlayerPlacements = filterUndefined(categoryPlayerPlacements);

    playerPlacements.forEach((player) => {
        player["name"] = findPlayerName(gameData, player["id"]);
    });
    levelPlayerPlacements.forEach((player) => {
        player["name"] = findPlayerName(gameData, player["id"]);
    });
    categoryPlayerPlacements.forEach((player) => {
        player["name"] = findPlayerName(gameData, player["id"]);
    });
}

function filterUndefined(placements){
    return Object.keys(placements).filter(k => !(k === "undefined")).map(k => { return { "id": k, "placements": placements[k] } })
}

function findPlayerName(gameData, id) {
    return gameData.players.find(element => element["id"] === id)["name"];
}

function scoreLevels(gameData) {
    gameData.levels.forEach((level) => {
        level.subLevels.forEach((sublevel) => {
            addLevelToTable(sublevel,"levelsTable","level-modal-");
        });
    });

    gameData.categories.forEach( category => {
        category.subcategories.forEach( subcategory => {
            addLevelToTable(subcategory,"full_gameTable","full_game-modal-");
        })
    })
}

var scoredPlayers = [];

var scoredLevelPlayers = [];

var scoredCategoryPlayers = [];

function scorePlayers() {

    scoredPlayers = [];

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
    placements.forEach((player) => {
        let name = player["name"];
        let score = 0;

        player["placements"].forEach((placement) => {
            score += scoringMethod(placement);
        });

        scores.push({ "name": name, "score": round(score), "placements": player["placements"] });
    });

}

function round(score) {
    return Math.round(score);
}

