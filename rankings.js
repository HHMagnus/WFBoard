function pointSystemChange() {

    wipeUI();

    scorePlayers();

    scoreLevels(gameData);
}

var playerPlacements = [];

function toPlacement(place, totalRuns) {
    return { "place": place, "totalRuns": totalRuns };
}

function addPlayerPlacement(playerId, place, totalRuns, levelname) {
    let placement = toPlacement(place, totalRuns)
    placement["level_name"] = levelname;
    if (playerPlacements[playerId]) {
        playerPlacements[playerId].push(placement);
    } else {
        playerPlacements[playerId] = [placement];
    }
}

function calculatePlayerPlacements(gameData) {
    playerPlacements = [];

    gameData.levels.forEach((level) => {
        level.subLevels.forEach((sublevel) => {
            let playersAlreadyPlaced = [];
            if (sublevel.leaderboardInfo["runs"][0]) {
                sublevel.leaderboardInfo["runs"].forEach((run) => {
                    run["run"]["players"].forEach((player) => {
                        if (!playersAlreadyPlaced.includes(player["id"])) {
                            addPlayerPlacement(player["id"], run["place"], sublevel.leaderboardInfo["runs"].length, sublevel.level_name);
                            playersAlreadyPlaced.push(player["id"]);
                        }
                    });
                });
            }
        });
    });
    playerPlacements = Object.keys(playerPlacements).filter(k => !(k === "undefined")).map(k => { return { "id": k, "placements": playerPlacements[k] } });

    playerPlacements.forEach((player) => {
        player["name"] = findPlayerName(gameData, player["id"]);
    });
}

function findPlayerName(gameData, id) {
    return gameData.players.find(element => element["id"] === id)["name"];
}

function scoreLevels(gameData){
    gameData.levels.forEach( (level) => {
        level.subLevels.forEach( (sublevel) => {
            addLevelToTable(sublevel);
        });
    });
}

var scoredPlayers = [];

function scorePlayers() {

    scoredPlayers = [];

    let scoringMethod = getScoringMethod();
    score(scoringMethod);

    sortPlayers();
}

function sortPlayers() {

    scoredPlayers.sort((a, b) => b["score"] - a["score"]);

    addPlayers();
}

function addPlayers() {
    let placement = 0;
    let lastScore = -1;
    let lastPlacement = 0;

    console.log(scoredPlayers);

    scoredPlayers.forEach((player) => {
        placement++;

        let place = placement;
        let score = player["score"];

        if (score === lastScore) {
            place = lastPlacement;
        }

        addPlayerToTable(place, player["name"], score, player["placements"]);

        lastPlacement = place;
        lastScore = score;

    });
}

function score(scoringMethod) {
    playerPlacements.forEach((player) => {
        let name = player["name"];
        let score = 0;

        player["placements"].forEach((placement) => {
            score += scoringMethod(placement);
        });

        scoredPlayers.push({ "name": name, "score": round(score), "placements": player["placements"] });
    });

}

function round(score) {
    return Math.round(score);
}

