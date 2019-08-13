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
async function getGameData(gameid, progressUpdater, finish_callback) {

    progressUpdater("Getting game data...");
    gameData = await fetchGameData(gameid);

    progressUpdater("Getting level list...");
    await levelsListInfo(gameData);

    progressUpdater("Scanning levels...");
    await levelsVarAndCatInfo(gameData);

    progressUpdater("Sorting levels...")
    sortLevelsBack(gameData);

    progressUpdater("Getting Full Game categories");
    await categoryList(gameData);

    progressUpdater("Scanning full game categories");
    await categoryVarInfo(gameData);

    progressUpdater("Sorting categories...");
    sortCategoriesBack(gameData);

    progressUpdater("Checking all levels...");
    await leaderboardInfo(gameData);

    progressUpdater("Getting player names...");
    getPlayerNames(gameData);

    progressUpdater("Finished getting all data!");
    finish_callback(gameData);
}

async function fetchGameData (gameid) {
    let response = await fetch("https://www.speedrun.com/api/v1/games/" + gameid);
    let gameInfo = await response.json();
    return new GameData(gameInfo["data"]);
}

async function levelsListInfo (gameData) {
    let response = await fetch(gameData.levelsUrl);
    let json = await response.json();
    gameData.levelsList = json["data"];
}

async function levelsVarAndCatInfo (gameData) {

    let promises = gameData.levelsList.map( async level => {
        let categories = fetch("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/categories");
        let variables = fetch("https://www.speedrun.com/api/v1/levels/" + level["id"] + "/variables");

        [categories, variables] = await Promise.all([categories, variables]);

        categories = await categories.json();
        variables = await variables.json();

        gameData.levels.push(new Level(level, categories, variables));
    });

    await Promise.all(promises);
}

function sortLevelsBack(gameData) {
    let originalSort = gameData.levelsList.map(k => k["id"]);

    gameData.levels.sort((a, b) => { return originalSort.indexOf(a.rawLevelInfo["id"]) - originalSort.indexOf(b.rawLevelInfo["id"]) });
}

async function categoryList (gameData) {
    let response = await fetch(gameData.categoryUrl);
    let json = await response.json();
    gameData.categoryList = json["data"];
}

async function categoryVarInfo (gameData) {
    // filter miscellaneous categories
    gameData.categoryList = gameData.categoryList.filter(k => k["type"] === "per-game").filter(k => k["miscellaneous"] === false);

    let promises = gameData.categoryList.map( async category => {
        let response = await fetch(category["links"][2]["uri"]);
        let json = await response.json();
        let data = json["data"].filter(k => k["is-subcategory"] === true);
        gameData.categories.push(new FullGame(category, data));
    })

    await Promise.all(promises);
}

function sortCategoriesBack (gameData) {
    let originalSort = gameData.categoryList.map(k => k["id"]);
    gameData.categories.sort( (a,b) => {return originalSort.indexOf(a.rawCategoryInfo["id"]) - originalSort.indexOf(b.rawCategoryInfo["id"])});
}

async function leaderboardInfo (gameData) {
    let level_promises = gameData.levels.map (async level => {
        let leaderboardList = level.getLeaderboards(gameData.id);

        let promises = leaderboardList.map( async leaderboard => {
            let response = await fetch(leaderboard["url"] + (leaderboard["url"].includes("?") ? "&embed=players" : "?embed=players"));
            let json = await response.json();

            json["data"]["players"]["data"].filter( player => player["rel"] === "user").forEach(player => {
                gameData.playerNames[player["id"]] = player["names"]["international"];
            });

            json["data"]["runs"].forEach((run) => {
                run["run"]["players"].forEach((player) => {
                    gameData.addPlayer(player["id"]);
                })
            });

            level.subLevels.push(new SubLevel(json["data"], leaderboard["name"], leaderboard["category"], leaderboard["variables"]));
        });

        await Promise.all(promises);
    });

    let category_promises = gameData.categories.map( async category => {
        let leaderboardList = category.getLeaderboards(gameData.id);

        let promises = leaderboardList.map (async leaderboard => {
            let response = await fetch(leaderboard["url"] + (leaderboard["url"].includes("?") ? "&embed=players" : "?embed=players"));
            let json = await response.json();

            json["data"]["players"]["data"].filter( player => player["rel"] === "user").forEach(player => {
                gameData.playerNames[player["id"]] = player["names"]["international"];
            });

            json["data"]["runs"].forEach((run) => {
                run["run"]["players"].forEach((player) => {
                    gameData.addPlayer(player["id"]);
                })
            });

            category.subcategories.push(new SubFullGame(json["data"],leaderboard["name"]));
        });

        await Promise.all (promises);
    })

    await Promise.all([...level_promises, ...category_promises])
}

function getPlayerNames (gameData) {
    gameData.players = gameData.players.filter(k => !(k === "undefined")).map (k => {return {"id": k}});

    gameData.players.forEach( (player) => {
        player["name"] = gameData.playerNames[player["id"]];
    });
}