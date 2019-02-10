/*
 * For future refactor, use embed for getting categories and levels with variables at once
 * https://www.speedrun.com/api/v1/games/v1pgmm18?embed=categories.variables,levels.categories,levels.variables
 */

//GameData object
var gameData;
/**
 * GameData callback information
 * @callback gameDataCallback
 * @param {GameData} gameData A game object with all the data from the given game
 */

/**
 * Progress callback
 * @callback progressCallback
 * @param {String} message The message following a callback
 */

/**
 * Downloads all the gameinformation from speedrun.com/api
 * @param {String} gameid The game's id on speedrun.com
 * @param {progressCallback} progressUpdater callback with progress messages
 * @param {gameDataCallback} finish_callback callback when finised getting gameinfo
 */
function getGameData(gameid, progressUpdater, finish_callback) {

    progressUpdater("Getting game data...");
    request("https://www.speedrun.com/api/v1/games/" + gameid, (gameInfo) => {
        gameData = new GameData(gameInfo["data"]);
        levelsListInfo();
    });

    var levelsListInfo = () => {
        progressUpdater("Getting level list...");
        request(gameData.levelsUrl, (levelsList) => {
            gameData.levelsList = levelsList["data"];
            levelsVarAndCatInfo();
        });
    };

    var levelsVarAndCatInfo = () => {

        var totalLevels = gameData.levelsList.length;
        var levelsScanned = 0;

        var scannedLevel = () => {
            if (levelsScanned === totalLevels) {
                sortLevelsBack();
            } else {
                progressUpdater("Scanning levels... (" + levelsScanned + "/" + totalLevels + ")");
            }
        };

        gameData.levelsList.forEach((level) => {
            var gotCategory = false;
            var gotVariable = false;

            var categoryInfo, variableInfo;

            var checkLevel = () => {
                if (gotCategory && gotVariable) {

                    gameData.levels.push(new Level(level, categoryInfo, variableInfo));

                    levelsScanned++;
                    scannedLevel();
                }
            };

            request("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/categories", (categories) => {
                categoryInfo = categories;
                gotCategory = true;
                checkLevel();
            });

            request("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/variables", (variables) => {
                variableInfo = variables;
                gotVariable = true;
                checkLevel();
            });
        });
    }

    var sortLevelsBack = () => {
        progressUpdater("Sorting levels...")
        let originalSort = gameData.levelsList.map(k => k["id"]);

        gameData.levels.sort((a, b) => { return originalSort.indexOf(a.rawLevelInfo["id"]) - originalSort.indexOf(b.rawLevelInfo["id"]) });

        categoryList();
    };

    
    var categoryList = () =>{
        progressUpdater("Getting Full Game categories");

            request(gameData.categoryUrl, (categoryList) => {
                gameData.categoryList = categoryList["data"];
                categoryVarInfo();
            });
    }

    var categoryVarInfo = () => {
        progressUpdater("Scanning full game categories");
        gameData.categoryList = gameData.categoryList.filter(k => k["type"] === "per-game").filter(k => k["miscellaneous"] === false);

        var totalCategories = gameData.categoryList.length;
        var checkedCategories = 0;

        var categoryCallback = () =>{
            if(totalCategories === checkedCategories){
                sortCategoriesBack();
            }else{
                progressUpdater("Scanning full_game categories (" + checkedCategories + "/" + totalCategories + ")");
            }
        }

        gameData.categoryList.forEach( category => {
            request(category["links"][2]["uri"], (categoryVarInfo) => {
                gameData.categories.push(new FullGame(category, categoryVarInfo["data"].filter(k => k["is-subcategory"] === true)));
                checkedCategories++;
                categoryCallback();
            });
        });
    }

    var sortCategoriesBack = () =>{
        progressUpdater("Sorting categories");
        let originalSort = gameData.categoryList.map(k => k["id"]);

        gameData.categories.sort( (a,b) => {return originalSort.indexOf(a.rawCategoryInfo["id"]) - originalSort.indexOf(b.rawCategoryInfo["id"])});

        leaderboardInfo();
    };

    var leaderboardInfo = () => {
        progressUpdater("Checking all levels...");

        var totalLevels = gameData.levels.length + gameData.categoryList.length;
        var levelsChecked = 0;

        var callback = () => {
            if (totalLevels === levelsChecked) {
                getPlayerNames();
            } else {
                progressUpdater("Checking leaderboards... (" + levelsChecked + "/" + totalLevels + ")");
            }
        };

        gameData.levels.forEach((level) => {
            let leaderboardList = level.getLeaderboards(gameData.id);
            let totalBoards = leaderboardList.length;
            let boardsChecked = 0;

            var boardback = () => {
                if (totalBoards === boardsChecked) {
                    levelsChecked++;
                    callback();
                }
            }
            if (leaderboardList[0]) {
                leaderboardList.forEach((leaderboard) => {
                    request(leaderboard["url"] + (leaderboard["url"].includes("?") ? "&embed=players" : "?embed=players"), (leaderboardInfo) => {
                        leaderboardInfo["data"]["players"]["data"].filter( player => player["rel"] === "user").forEach(player => {
                            gameData.playerNames[player["id"]] = player["names"]["international"];
                        });
                        leaderboardInfo["data"]["runs"].forEach((run) => {
                            run["run"]["players"].forEach((player) => {
                                gameData.addPlayer(player["id"]);
                            })
                        });
                        level.subLevels.push(new SubLevel(leaderboardInfo["data"], leaderboard["name"], leaderboard["category"], leaderboard["variables"]));
                        boardsChecked++;
                        boardback();
                    });
                });
            } else {
                boardback();
            }

        });

        gameData.categories.forEach( category => {
            let leaderboardList = category.getLeaderboards(gameData.id);

            let totalVars = leaderboardList.length;
            let varsChecked = 0;

            var categoryback = () =>{
                if(totalVars == varsChecked){
                    levelsChecked++;
                    callback();
                }
            }
            
            if(leaderboardList[0]){
                leaderboardList.forEach( leaderboard => {
                    request(leaderboard["url"] + "&embed=players", leaderboardInfo => {
                        leaderboardInfo["data"]["players"]["data"].filter( player => player["rel"] === "user").forEach(player => {
                            gameData.playerNames[player["id"]] = player["names"]["international"];
                        });
                        leaderboardInfo["data"]["runs"].forEach((run) => {
                            run["run"]["players"].forEach((player) => {
                                gameData.addPlayer(player["id"]);
                            })
                        });
                        category.subcategories.push(new SubFullGame(leaderboardInfo["data"],leaderboard["name"]));
                        varsChecked++;
                        categoryback();
                    });
                });
            }
            else categoryback();
        });
    };

    var getPlayerNames = () => {
        progressUpdater("Getting player names...");
        gameData.players = gameData.players.filter(k => !(k === "undefined")).map (k => {return {"id": k}});

        gameData.players.forEach( (player) => {
            player["name"] = gameData.playerNames[player["id"]];
        });

        done();
    };
    
    var done = () =>{
        progressUpdater("Finished getting all data!");
        finish_callback(gameData);
    }

}

/**
 * Calls with information in json format
 * @callback httpReqCallback
 * @param {JSON} data data response from url
 */

/**
 * Request information from a url
 * @param {URL} theUrl 
 * @param {httpReqCallback} callback 
 */
function request(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = (e) => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            var response = JSON.parse(xmlHttp.responseText);
            callback(response);
        }
        if(xmlHttp.readyState === 4 && xmlHttp.status !== 200){
            request(theUrl, callback);
        }
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send();
}
