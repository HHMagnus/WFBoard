var gameId;
var leaderboards = [];
var playerPlacements = {};

function processUpdate(update){
    document.getElementById("infoText").innerHTML = update;
}

function aGet(theUrl, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send();
    xmlHttp.onreadystatechange = (e) => {
        if(xmlHttp.readyState === 4 && xmlHttp.status === 200){
            var response = JSON.parse(xmlHttp.responseText);
            callback(response);
        }
    }
}

function beginScan(gamename){
    processUpdate("Getting game...");

    document.getElementById("scanButton").hidden = true;
    document.getElementById("infoText").hidden = false;
    document.getElementById("pointSystem").disabled = true;

    aGet("https://www.speedrun.com/api/v1/games/" + gamename, (gameInfo) => {
        gameId = gameInfo["data"]["id"];
        gettingLevels(gameInfo);
    })
}

function gettingLevels(gameInfo){
    processUpdate("Getting levels...");

    aGet(gameInfo["data"]["links"][2]["uri"], (levelInfo) =>{
        scanLevels(levelInfo);
    })
}

function scanLevels(levelInfo){
    processUpdate("Scanning levels...");

    var leaderboardList = [];

    var totalLevels = levelInfo["data"].length;
    var levelsScanned = 0;

    var scannedLevel = () => {
        if(levelsScanned === totalLevels){
            checkLeaderboards(leaderboardList);
        }else{
            processUpdate("Scanning levels... (" + levelsScanned + "/" + totalLevels + ")");
        }
    };

    levelInfo["data"].forEach( (level) => {
        var gotCategory = false;
        var gotVariable = false;

        var categoryInfo, variableInfo;

        var callback = () => {
            if(gotCategory && gotVariable){
                categoryInfo["data"].forEach( (category) =>{
                    let variables = variableInfo["data"].filter( run => run["is-subcategory"] === true);
        
                    let leaderboardUrl = "https://www.speedrun.com/api/v1/leaderboards/"+ gameId +"/level/"+ level["id"] +"/"+ category["id"];
        
                    if(variables[1]){
                        console.log("Ignored category with more then 1 variable");
                    }
                    else if(variables[0]){
                        Object.keys(variables[0]["values"]["values"]).forEach( (value) =>{
                            leaderboardVariableUrl = leaderboardUrl + "?var-" + variables[0]["id"] + "=" + value;
                            leaderboardList.push({"name": level["name"],"url":leaderboardVariableUrl, "category": category["name"], "variables": [{"name": variables[0]["name"], "value": variables[0]["values"]["values"][value]["label"]}]});
                        });
                    }
                    else{
                        leaderboardList.push({"name": level["name"],"url": leaderboardUrl, "category": category["name"], "variables": null});
                    }
        
                });

                levelsScanned++;
                scannedLevel();
            }
        };

        aGet("https://www.speedrun.com/api/v1/levels/"+ level["id"] +"/categories", (categories) => {
            categoryInfo = categories; 
            gotCategory = true; 
            callback();
        });
        aGet("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/variables", (variables) => {
            variableInfo = variables;
            gotVariable = true;
            callback();
        });
    });
}

function addLevelNode(name, category, variables){
    let node = document.createElement("tr");
    let nameNode = document.createElement("td");
    node.appendChild(nameNode);
    let categoryNode = document.createElement("td");
    node.appendChild(categoryNode);
    let variableNode = document.createElement("td");
    node.appendChild(variableNode);

    nameNode.innerHTML = name;
    categoryNode.innerHTML = category;
    variableNode.innerHTML = variables;

    document.getElementById("levels").appendChild(node);
}

function addPlayerPlacement(playerId, place, totalRuns, leaderboardName){
    let placement = {"place": place, "totalRuns": totalRuns, "name": leaderboardName};
    if(playerPlacements[playerId]){
        playerPlacements[playerId].push(placement);
    }else{
        playerPlacements[playerId] = [placement];
    }
}

function getLeaderboardName(leaderboard){
    return leaderboard["name"] + " | " + leaderboard["category"] + " " + JSON.stringify(leaderboard["variables"]);
}

function checkLeaderboards(leaderboardList){
    processUpdate("Checking leaderboards...");

    var totalBoards = leaderboardList.length;
    var boardsChecked = 0;
    var callback = () =>{
        if(boardsChecked === totalBoards){
            getPlayerNames();
        }else {
            processUpdate("Checking leaderboards... (" + boardsChecked + "/" + totalBoards +")");
        }
    };
    leaderboardList.forEach( (leaderboard) =>{
        aGet(leaderboard["url"], (leaderboardInfo) => {
            if(leaderboardInfo["data"]["runs"][0]){
                leaderboards.push(leaderboard);
                addLevelNode(leaderboard["name"], leaderboard["category"], JSON.stringify(leaderboard["variables"]));
                let totalRuns = leaderboardInfo["data"]["runs"].length;
                let leaderboardName = getLeaderboardName(leaderboard);
                leaderboardInfo["data"]["runs"].forEach( (run) => {
                    run["run"]["players"].forEach( (player) => {
                        addPlayerPlacement(player["id"], run["place"], totalRuns, leaderboardName);
                    });
                });
            }
            boardsChecked++;
            callback();
        });
    });

}

function getPlayerNames(){
    processUpdate("Getting player names...");

    playerPlacements = Object.keys(playerPlacements).filter(k => !(k === "undefined")).map(k => {return {"id": k, "placements": playerPlacements[k]}});

    var totalPlayers = Object.keys(playerPlacements).length;
    var namesGotten = 0;

    var callback = () =>{
        if(namesGotten === totalPlayers){
            scorePlayers();
        }else{
            processUpdate("Getting player names... (" + namesGotten + "/" + totalPlayers + ")");
        }
    }
    
    playerPlacements.forEach( (player) => {
        let url = "https://www.speedrun.com/api/v1/users/" + player["id"];
        aGet(url, (playerInfo) => {
            player["name"] = playerInfo["data"]["names"]["international"];
            namesGotten++;
            callback();
        });
    });

}

function addPlayerToTable(placement,name, score){
    
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
    
    document.getElementById("players").appendChild(node);
}

var scoredPlayers = [];

function addPlayers(){
    processUpdate("Adding players...");
    let placement = 0;

    scoredPlayers.forEach( (player) => {
        placement++;
        addPlayerToTable(placement,player["name"], player["score"]);
    });

    processUpdate("Scan done!");
}

function sortPlayers(){
    processUpdate("Sorting players...");

    scoredPlayers.sort( (a,b) => b["score"] - a["score"]);

    addPlayers();

}

function scorePlayers(){
    processUpdate("Scoring players...");

    let pointSystem = document.getElementById("pointSystem").value;
    let scoringMethod;
    if(pointSystem === "elite"){
        scoringMethod = elite;
    }
    else if(pointSystem === "placement"){
        scoringMethod = runAndPlace;
    }
    else if(pointSystem === "quasar"){
        scoringMethod = quasarWay;
    }
    else{
        processUpdate("Failed to score players, aborting!");
        return;
    }

    score(scoringMethod);

    sortPlayers();
}

function score(scoringMethod){
    playerPlacements.forEach( (player) => {
        let name = player["name"];
        let score = 0;

        player["placements"].forEach( (placement) =>{
            score += scoringMethod(placement);
        });

        scoredPlayers.push({"name": name, "score": score});
    });
    
}

function elite(placement){
    return 101 - placement["place"];
}

function runAndPlace(placement){
    return placement["totalRuns"] / placement["place"];
}

function quasarWay(placement){
    let place = placement["place"];
    if(place === 1){
        return 3;
    }else if(place === 2){
        return 2.5;
    }else if(place === 3){
        return 2;
    }else if(place < 6){
        return 0.5;
    }else{
        return 0;
    }
}