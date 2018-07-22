function pointSystemChange() {

    wipeUI();

    scorePlayers();
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

function calculatePlayerPlacements(gameData){
    playerPlacements = [];

    gameData.levels.forEach( (level) => {
        level.subLevels.forEach( (sublevel) => {
            if(sublevel.leaderboardInfo["runs"][0]){
                sublevel.leaderboardInfo["runs"].forEach( (run) =>{
                    run["run"]["players"].forEach( (player) => {
                        addPlayerPlacement(player["id"], run["place"], sublevel.leaderboardInfo["runs"].length, sublevel.level_name);
                    });
                });
            }
        });
    });
    playerPlacements = Object.keys(playerPlacements).filter(k => !(k === "undefined")).map(k => { return { "id": k, "placements": playerPlacements[k] } });

    playerPlacements.forEach((player) => {
        player["name"] = gameData.players.find( (element) => element["id"] === player["id"])["name"];
    });
}

var scoredPlayers = [];

function scorePlayers() {
    processUpdate("Scoring players...");

    scoredPlayers = [];

    let scoringMethod = getScoringMethod();
    score(scoringMethod);

    sortPlayers();
}

function sortPlayers() {
    processUpdate("Sorting players...");

    scoredPlayers.sort((a, b) => b["score"] - a["score"]);

    addPlayers();
}

function addPlayers() {
    processUpdate("Adding players...");
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

