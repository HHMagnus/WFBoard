function scanGame(gamename){
    document.getElementById("infoText").innerHTML = "Running scan! Getting game...";
    let gameinfoRaw = httpGet("https://www.speedrun.com/api/v1/games/" + gamename);
    let gameinfo = JSON.parse(gameinfoRaw);

    document.getElementById("infoText").innerHTML = "Getting levels";

    var playerValues = {};

    let levelInfoRaw = httpGet(gameinfo["data"]["links"][2]["uri"]);
    let levelInfo = JSON.parse(levelInfoRaw);
    levelInfo["data"].forEach( (level) =>{
        

        let categoryInfoRaw = httpGet("https://www.speedrun.com/api/v1/levels/"+ level["id"] +"/categories");
        let categoryInfo = JSON.parse(categoryInfoRaw);

        let variableInfoRaw = httpGet("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/variables");
        let variableInfo = JSON.parse(variableInfoRaw);

        let leaderboardsList = [];

        categoryInfo["data"].forEach( (category) =>{
            let variables = variableInfo["data"].filter( run => run["is-subcategory"] === true);

            let leaderboardUrl = "https://www.speedrun.com/api/v1/leaderboards/"+ gameinfo["data"]["id"] +"/level/"+ level["id"] +"/"+ category["id"];

            if(variables[1]){
                console.log("Ignored category with more then 1 variable");
            }
            else if(variables[0]){
                Object.keys(variables[0]["values"]["values"]).forEach( (value) =>{
                    leaderboardVariableUrl = leaderboardUrl + "?var-" + variables[0]["id"] + "=" + value;
                    leaderboardsList.push({"url":leaderboardVariableUrl, "category": category["name"], "variables": [{"name": variables[0]["name"], "value": variables[0]["values"]["values"][value]["label"]}]});
                });
            }
            else{
                leaderboardsList.push({"url": leaderboardUrl, "category": category["name"], "variables": null});
            }

        });

        leaderboardsList.forEach( (leaderboard) =>{
            
            let leaderboardInfoRaw = httpGet(leaderboard["url"]);
            let leaderboardInfo = JSON.parse(leaderboardInfoRaw);

            if(leaderboardInfo["data"]["runs"][0]){
                let node = document.createElement("tr");
                let nameNode = document.createElement("td");
                node.appendChild(nameNode);
                let categoryNode = document.createElement("td");
                node.appendChild(categoryNode);
                let variableNode = document.createElement("td");
                node.appendChild(variableNode);
        
                nameNode.innerHTML = level["name"];
                categoryNode.innerHTML = leaderboard["category"];
                variableNode.innerHTML = JSON.stringify(leaderboard["variables"]);

                document.getElementById("levels").appendChild(node);


                var total = leaderboardInfo["data"]["runs"].length;
                leaderboardInfo["data"]["runs"].forEach( (run) =>{
                    //let addedScore = total / run["place"];
                    let addedScore = 100 - run["place"]+1;
                    run["run"]["players"].forEach( (player) =>{
                        if(player["id"] === "undefined"){} else
                            playerValues[player["id"]] = playerValues[player["id"]]+addedScore || addedScore;
                    });
                });
                
            }
        });

    });

    console.log(JSON.stringify(playerValues));

    values = Object.keys(playerValues).sort( (a,b) => {return playerValues[b] - playerValues[a]}).filter( (k) => !(k === "undefined")).map( (k) => {return {"userid": k, "score": playerValues[k]}})

    values.forEach( (element) => {
        let userurl = "https://www.speedrun.com/api/v1/users/" + element["userid"];
        let userInfoRaw = httpGet(userurl);
        let userInfo = JSON.parse(userInfoRaw);
        element["username"] = userInfo["data"]["names"]["international"];
    });

    values.forEach( (user) => {
        let node = document.createElement("tr");
        let nameNode = document.createElement("td");
        node.appendChild(nameNode);
        let scoreNode = document.createElement("td");
        node.appendChild(scoreNode);

        nameNode.innerHTML = user["username"];
        scoreNode.innerHTML = user["score"];

        document.getElementById("players").appendChild(node);
    });

}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}