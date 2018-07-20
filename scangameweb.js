var gameId;
var leaderboards = [];
var playerPlacements = {};

window.onload = () => beginScan('v1pgmm18');

function processUpdate(update) {
    document.getElementById("infoText").innerHTML = update;
}

function aGet(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = (e) => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            var response = JSON.parse(xmlHttp.responseText);
            callback(response);
        }
    }
    //xmlHttp.setRequestHeader("User-Agent", "WFBoard - Warframe Rankings");
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send();
}

function wipeUI() {
    clearTable("playersTable");
    clearTable("levelsTable")
}

function disableOptions() {
    document.getElementById("pointSystem").disabled = true;
    document.getElementById("scanButton").disabled = true;
}

function enableOptions() {
    document.getElementById("pointSystem").disabled = false;
    document.getElementById("scanButton").disabled = false;
}

function beginScan(gamename) {
    console.log("started scanning");
    processUpdate("Getting game...");

    wipeUI();
    disableOptions();

    requestGameInfo(gamename, (gameInfo) => getLevels(gameInfo));

    var getLevels = (gameInfo) => requestLevels(gameInfo, checkLevelLeaderboards);

    var checkLevelLeaderboards = (levelInfo) => scanLevels(levelInfo, checkAllLeaderboards);

    var checkAllLeaderboards = checkLeaderboards;
}


function requestGameInfo(gamename, callback) {
    aGet("https://www.speedrun.com/api/v1/games/" + gamename, (gameInfo) => {
        gameId = gameInfo["data"]["id"];
        callback(gameInfo);
    });
}

function requestLevels(gameInfo, callback) {
    console.log("Getting levels");
    processUpdate("Getting levels...");

    aGet(gameInfo["data"]["links"][2]["uri"], (levelInfo) => {
        callback(levelInfo);
    })
}

function checkLevelInfo(levelInfo, categoryInfo, variableInfo) {
    let levelList = [];
    categoryInfo["data"].forEach((category) => {
        let variables = variableInfo["data"].filter(run => run["is-subcategory"] === true);

        let leaderboardUrl = "https://www.speedrun.com/api/v1/leaderboards/" + gameId + "/level/" + levelInfo["id"] + "/" + category["id"];

        if (variables[1]) {
            console.log("Ignored category with more then 1 variable");
        }
        else if (variables[0]) {
            Object.keys(variables[0]["values"]["values"]).forEach((value) => {
                leaderboardVariableUrl = leaderboardUrl + "?var-" + variables[0]["id"] + "=" + value;
                levelList.push({ "name": levelInfo["name"], "url": leaderboardVariableUrl, "category": category["name"], "variables": [{ "name": variables[0]["name"], "value": variables[0]["values"]["values"][value]["label"] }] });
            });
        }
        else {
            levelList.push({ "name": levelInfo["name"], "url": leaderboardUrl, "category": category["name"], "variables": null });
        }

    });

    return levelList;
}

function scanLevels(levelInfo, callback) {
    processUpdate("Scanning levels...");

    var leaderboardList = [];

    var totalLevels = levelInfo["data"].length;
    var levelsScanned = 0;

    var scannedLevel = () => {
        if (levelsScanned === totalLevels) {
            console.log("All leaderboards:");
            console.log(JSON.stringify(leaderboardList));
            callback(leaderboardList);
        } else {
            processUpdate("Scanning levels... (" + levelsScanned + "/" + totalLevels + ")");
        }
    };

    levelInfo["data"].forEach((level) => {
        var gotCategory = false;
        var gotVariable = false;

        var categoryInfo, variableInfo;

        var checkLevel = () => {
            if (gotCategory && gotVariable) {

                leaderboardList = leaderboardList.concat(checkLevelInfo(level, categoryInfo, variableInfo));

                levelsScanned++;
                scannedLevel();
            }
        };

        aGet("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/categories", (categories) => {
            categoryInfo = categories;
            gotCategory = true;
            checkLevel();
        });
        aGet("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/variables", (variables) => {
            variableInfo = variables;
            gotVariable = true;
            checkLevel();
        });
    });
}

function addLevelNode(leaderboard) {
    let node = document.createElement("tr");
    let nameNode = document.createElement("td");
    node.appendChild(nameNode);
    let categoryNode = document.createElement("td");
    node.appendChild(categoryNode);
    let variableNode = document.createElement("td");
    node.appendChild(variableNode);

    nameNode.innerHTML = leaderboard["name"];
    categoryNode.innerHTML = leaderboard["category"];

    let variables = "";
    if (leaderboard["variables"]) {
        leaderboard["variables"].forEach((variable) => {
            variables += variable["name"] + ": " + variable["value"] + " ";
        });
    }

    variableNode.innerHTML = variables;
    
    document.getElementById("levelsTable").appendChild(node);
}

function toPlacement(place, totalRuns) {
    return { "place": place, "totalRuns": totalRuns };
}

function addPlayerPlacement(playerId, place, totalRuns, leaderboardName) {
    let placement = toPlacement(place, totalRuns)
    placement["name"] = leaderboardName;
    if (playerPlacements[playerId]) {
        playerPlacements[playerId].push(placement);
    } else {
        playerPlacements[playerId] = [placement];
    }
}

function getLeaderboardName(leaderboard) {
    return leaderboard["name"] + " | " + leaderboard["category"] + " " + JSON.stringify(leaderboard["variables"]);
}

function checkLeaderboards(leaderboardList) {
    processUpdate("Checking leaderboards...");

    leaderboards = [];
    playerPlacements = [];

    var totalBoards = leaderboardList.length;
    var boardsChecked = 0;
    var callback = () => {
        if (boardsChecked === totalBoards) {
            getPlayerNames();
        } else {
            processUpdate("Checking leaderboards... (" + boardsChecked + "/" + totalBoards + ")");
        }
    };
    leaderboardList.forEach((leaderboard) => {
        aGet(leaderboard["url"], (leaderboardInfo) => {
            if (leaderboardInfo["data"]["runs"][0]) {
                leaderboard["info"] = leaderboardInfo["data"];
                leaderboards.push(leaderboard);
                addLevelNode(leaderboard);
                let totalRuns = leaderboardInfo["data"]["runs"].length;
                let leaderboardName = getLeaderboardName(leaderboard);
                leaderboardInfo["data"]["runs"].forEach((run) => {
                    run["run"]["players"].forEach((player) => {
                        addPlayerPlacement(player["id"], run["place"], totalRuns, leaderboardName);
                    });
                });
            }
            boardsChecked++;
            callback();
        });
    });

}

function getPlayerNames() {
    processUpdate("Getting player names...");

    playerPlacements = Object.keys(playerPlacements).filter(k => !(k === "undefined")).map(k => { return { "id": k, "placements": playerPlacements[k] } });

    var totalPlayers = Object.keys(playerPlacements).length;
    var namesGotten = 0;

    var callback = () => {
        if (namesGotten === totalPlayers) {
            scorePlayers();
        } else {
            processUpdate("Getting player names... (" + namesGotten + "/" + totalPlayers + ")");
        }
    }

    playerPlacements.forEach((player) => {
        let url = "https://www.speedrun.com/api/v1/users/" + player["id"];
        aGet(url, (playerInfo) => {
            player["name"] = playerInfo["data"]["names"]["international"];
            namesGotten++;
            callback();
        });
    });

}

function addPlayerToTable(placement, name, score) {

    let node = document.createElement("tr");
    let placeNode = document.createElement("td");
    node.appendChild(placeNode);
    let nameNode = document.createElement("td");
    node.appendChild(nameNode);
    let scoreNode = document.createElement("td");
    node.appendChild(scoreNode);

    placeNode.innerHTML = placement;
    nameNode.innerHTML = name;
    scoreNode.innerHTML = score;

    document.getElementById("playersTable").appendChild(node);
}

var scoredPlayers = [];

function addPlayers() {
    processUpdate("Adding players...");
    let placement = 0;
    let lastScore = -1;
    let lastPlacement = 0;

    scoredPlayers.forEach((player) => {
        placement++;

        let place = placement;
        let score = player["score"];

        if (score === lastScore) {
            place = lastPlacement;
            console.log("double");
        }

        addPlayerToTable(place, player["name"], score);

        lastPlacement = place;
        lastScore = score;

    });

    doneScanning();
}

function sortPlayers() {
    processUpdate("Sorting players...");

    scoredPlayers.sort((a, b) => b["score"] - a["score"]);

    addPlayers();

}

function scorePlayers() {
    processUpdate("Scoring players...");

    scoredPlayers = [];

    let scoringMethod = getScoringMethod();
    score(scoringMethod);

    sortPlayers();
}

function getScoringMethod() {
    let pointSystem = document.getElementById("pointSystem").value;
    let scoringMethod;
    if (pointSystem === "elite") {
        scoringMethod = elite;
    }
    else if (pointSystem === "placement") {
        scoringMethod = runAndPlace;
    }
    else if (pointSystem === "quasar") {
        scoringMethod = quasarWay;
    }
    else if (pointSystem === "fiftythirthytreeseventeensplit") {
        scoringMethod = fiftythirthytreeseventeensplit;
    }
    else {
        processUpdate("Failed to score players, aborting!");
        return;
    }
    return scoringMethod;
}

function score(scoringMethod) {
    playerPlacements.forEach((player) => {
        let name = player["name"];
        let score = 0;

        player["placements"].forEach((placement) => {
            score += scoringMethod(placement);
        });

        scoredPlayers.push({ "name": name, "score": round(score) });
    });

}

function round(score) {
    return Math.round(score);
}

function elite(placement) {
    let points = 105 - (placement["place"] * 5);
    return points > 0 ? points : 0;
}

function runAndPlace(placement) {
    return placement["totalRuns"] / placement["place"];
}

function quasarWay(placement) {
    let place = placement["place"];
    if (place === 1) {
        return 3;
    } else if (place === 2) {
        return 2.5;
    } else if (place === 3) {
        return 2;
    } else if (place < 6) {
        return 0.5;
    } else {
        return 0;
    }
}

function fiftythirthytreeseventeensplit(placement) {
    let place = placement["place"];
    //let total = placement["totalRuns"];
    let total = 10;
    if (place === 1) {
        return total * 0.5;
    }
    else if (place === 2) {
        return total * 0.33;
    }
    else if (place === 3) {
        return total * 0.17;
    }
    else {
        return 0;
    }
}

function doneScanning() {
    processUpdate("Scan done! Last updated (" + new Date().toLocaleString() + ")");

    enableOptions();
}

function pointSystemChange() {

    wipeUI();

    scorePlayers();
}

function clearTable(id) {
    let table = document.getElementById(id);
    let rows = table.getElementsByTagName("tr");
    let rowCount = rows.length;
    if (rowCount > 0)
        for (let x = rowCount - 1; x >= 0; x--) {
            table.removeChild(rows[x]);
        }

}