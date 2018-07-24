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
        console.log(gameData.levelsUrl)
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

        leaderboardInfo();
    };

    var leaderboardInfo = () => {
        progressUpdater("Checking all levels...");

        var totalLevels = gameData.levels.length;
        var levelsChecked = 0;

        var callback = () => {
            if (totalLevels === levelsChecked) {
                getPlayerNames();
            } else {
                processUpdate("Checking leaderboards... (" + levelsChecked + "/" + totalLevels + ")");
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
                    request(leaderboard["url"], (leaderboardInfo) => {
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
    };

    var getPlayerNames = () => {
        processUpdate("Getting player names...");
        gameData.players = gameData.players.filter(k => !(k === "undefined")).map (k => {return {"id": k}});

        var totalPlayers = gameData.players.length;
        var namesGotten = 0;

        var callback = () => {
            if (namesGotten === totalPlayers) {
                done();
            } else {
                processUpdate("Getting player names... (" + namesGotten + "/" + totalPlayers + ")");
            }
        }

        gameData.players.forEach((player) => {
            let url = "https://www.speedrun.com/api/v1/users/" + player["id"];
            request(url, (playerInfo) => {
                player["name"] = playerInfo["data"]["names"]["international"];
                namesGotten++;
                callback();
            });
        });

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
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send();
}
