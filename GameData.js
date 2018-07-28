function GameData(rawGameInfo) {
    this.rawGameInfo = rawGameInfo;
    this.id = rawGameInfo["id"];
    this.name = rawGameInfo["names"]["international"];
    this.abbreviation = rawGameInfo["abbreviation"];
    this.releaseDate = rawGameInfo["release-date"];
    this.levelsUrl = rawGameInfo["links"][2]["uri"];
    this.categoryUrl = rawGameInfo["links"][3]["uri"];
    this.levelsList;
    this.categoryList;
    this.players = [];
    this.addPlayer = (player) => {
        if (!this.players.includes(player))
            this.players.push(player);
    };
    this.levels = [];
    this.categories = [];
}

function FullGame(rawCategoryInfo, rawVariableInfo) {
    this.rawCategoryInfo = rawCategoryInfo;
    this.rawVariableInfo = rawVariableInfo;

    this.getLeaderboards = (gameId) => getListOfAllLeaderboardsForCategory(gameId, rawCategoryInfo, rawVariableInfo);

    this.subcategories = [];
}

function getListOfAllLeaderboardsForCategory(gameId, categoryInfo, variableInfo) {
    let levelList = [];
    if(variableInfo[1]){
        let list = getVars(variableInfo, []);
        list.forEach ( vari => {
            let leaderboardVariableUrl = "https://www.speedrun.com/api/v1/leaderboards/" + gameId + "/category/" + categoryInfo["id"] + vari["var"];
            levelList.push({"name": categoryInfo["name"] + ": " + vari["name"], "url": leaderboardVariableUrl});
        });
    }
    else if (variableInfo[0]) {
        Object.keys(variableInfo[0]["values"]["values"]).forEach((variable) => {
            levelList.push({ "name": categoryInfo["name"] + ": " + variableInfo[0]["values"]["values"][variable]["label"], "url": "https://www.speedrun.com/api/v1/leaderboards/" + gameId + "/category/" + categoryInfo["id"] + "?var-" + variableInfo[0]["id"] + "=" + variable })
        })
    } else {
        levelList.push({ "name": categoryInfo["name"], "url": "https://www.speedrun.com/api/v1/leaderboards/" + gameId + "/category/" + categoryInfo["id"] });
    }
    return levelList;
}

function SubFullGame(leaderboardInfo, name){
    this.leaderboardInfo = leaderboardInfo;
    this.name = name;
}

function Level(rawLevelInfo, rawCategoryInfo, rawVariableInfo) {
    this.rawLevelInfo = rawLevelInfo;
    this.rawCategoryInfo = rawCategoryInfo;
    this.rawVariableInfo = rawVariableInfo;

    this.getLeaderboards = (gameId) => getListOfAllLeaderboardsForLevel(gameId, rawLevelInfo, rawCategoryInfo, rawVariableInfo);

    this.subLevels = [];
}

function getListOfAllLeaderboardsForLevel(gameId, levelInfo, categoryInfo, variableInfo) {
    let levelList = [];
    categoryInfo["data"].forEach((category) => {
        let variables = variableInfo["data"].filter(run => run["is-subcategory"] === true);

        let leaderboardUrl = "https://www.speedrun.com/api/v1/leaderboards/" + gameId + "/level/" + levelInfo["id"] + "/" + category["id"];

        if (variables[1]) {
            let list = getVars(variables, []);
            list.forEach ( vari => {
                let leaderboardVariableUrl = leaderboardUrl + vari["var"];
                levelList.push({"name": levelInfo["name"] + " (" + category["name"] + "): " + vari["name"], "url": leaderboardVariableUrl});
            });
        }
        else if (variables[0]) {
            Object.keys(variables[0]["values"]["values"]).forEach((value) => {
                let leaderboardVariableUrl = leaderboardUrl + "?var-" + variables[0]["id"] + "=" + value;
                levelList.push({ "name": levelInfo["name"] + " (" + category["name"] + "): " + variables[0]["values"]["values"][value]["label"], "url": leaderboardVariableUrl, "category": category["name"], "variables": [{ "name": variables[0]["name"], "value": variables[0]["values"]["values"][value]["label"] }] });
            });
        }
        else {
            levelList.push({ "name": levelInfo["name"] + " (" + category["name"] + ")", "url": leaderboardUrl, "category": category["name"], "variables": null });
        }

    });

    return levelList;
}

function getVars(variableInfo, variablesList){
    let newList = [];
    Object.keys(variableInfo[0]["values"]["values"]).forEach( (value) => {
        newList.push({"name": variableInfo[0]["values"]["values"][value]["label"],"var": "var-" + variableInfo[0]["id"] + "=" + value});
    });
    if(!variablesList[0]){
        newList.forEach (value => {
            value["var"] = "?" + value["var"];
            variablesList.push (value);
        })
        
    }else{
        let newVarList = [];
        newList.forEach ( value =>{
            variablesList.forEach (oldvar => {
                newVarList.push({"name": oldvar["name"] + ", " + value["name"], "var": oldvar["var"] + "&" + value["var"]});
            });
        });
        variablesList = newVarList;
    }
    variableInfo.shift();

    if(variableInfo[0])
        return getVars(variableInfo,variablesList);
    else
        return variablesList;
}

function SubLevel(leaderboardInfo, name, category, variables) {
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