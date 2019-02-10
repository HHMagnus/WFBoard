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
    this.playerNames = [];
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
    let leaderboardUrl = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryInfo.id}`;
    if(variableInfo[0]){
        let list = getVars(variableInfo, []);
        list.forEach ( variable => {
            levelList.push({"name": `${categoryInfo.name}: ${variable.name}`, "url": leaderboardUrl + variable.arg});
        });
    }else {
        levelList.push({ "name": categoryInfo.name, "url":leaderboardUrl });
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

        let leaderboardUrl = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/level/${levelInfo.id}/${category.id}`;

        if (variables[0]) {
            let list = getVars(variables, []);
            list.forEach ( variable => {
                levelList.push({"name": `${levelInfo.name} (${category.name}): ${variable.name}`, "url": leaderboardUrl + variable.arg});
            });
        }else {
            levelList.push({ "name": `${levelInfo.name} (${category.name})`, "url": leaderboardUrl});
        }

    });

    return levelList;
}

const concat = (x,y) =>
  x.concat(y)

const flatMap = (f,xs) =>
  xs.map(f).reduce(concat, [])

Array.prototype.flatMap = function(f) {
  return flatMap(f,this)
}

function getVars(variableInfo, variablesList){
    let newList = [];
    Object.keys(variableInfo[0]["values"]["values"]).forEach( (value) => {
        let valueName = variableInfo[0]["values"]["values"][value]["label"];
        newList.push({"name": valueName,"arg": `var-${variableInfo[0].id}=${value}`});
    });
    if(!variablesList[0]){
       variablesList = newList.map(element => {return {"name": element.name, "arg": `?${element.arg}`}});
    }else{
        variablesList = variablesList.flatMap(value1 => {return newList.map(value2 => {return {"name": `${value1.name}, ${value2.name}`, "arg": `${value1.arg}&${value2.arg}`}})});
    }
    variableInfo.shift();

    if(variableInfo[0])
        return getVars(variableInfo,variablesList);
    else{
        console.log(variablesList);
        return variablesList;
    }
}

function SubLevel(leaderboardInfo, name, category, variables) {
    this.leaderboardInfo = leaderboardInfo;
    this.category = category;
    this.variables = variables;
    this.name = name;
}