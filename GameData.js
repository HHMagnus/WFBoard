function GameData(rawGameInfo){
    this.rawGameInfo = rawGameInfo;
    this.id = rawGameInfo["id"];
    this.name = rawGameInfo["names"]["international"];
    this.abbreviation = rawGameInfo["abbreviation"];
    this.releaseDate = rawGameInfo["release-date"];
    this.levelsUrl = rawGameInfo["links"][2]["uri"];
    this.levelsList;
    this.players = [];
    this.addPlayer = (player) =>{
        if(!this.players.includes(player))
            this.players.push(player);
    };
    this.levels = [];
}

function Level(rawLevelInfo, rawCategoryInfo, rawVariableInfo){
    this.rawLevelInfo = rawLevelInfo;
    this.rawCategoryInfo = rawCategoryInfo;
    this.rawVariableInfo = rawVariableInfo;

    this.getLeaderboards = (gameId) => getListOfAllLeaderboardsForLevel(gameId,rawLevelInfo,rawCategoryInfo,rawVariableInfo);

    this.subLevels = [];
}

function getListOfAllLeaderboardsForLevel(gameId,levelInfo, categoryInfo, variableInfo) {
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

function SubLevel(leaderboardInfo, name, category, variables){
    this.leaderboardInfo = leaderboardInfo;
    this.category = category;
    this.variables = variables;
    this.name = name;

    let vars = "";
    if (variables) {
       variables.forEach((variable) => {
            vars += variable["name"] + ": " + variable["value"] + " ";
        });
    }

    this.variables_name = vars;

    this.level_name = name + ", " + category + ", " + vars + ".";
}