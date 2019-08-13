const fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'omit',
    headers: {
        'User-Agent': 'wf-rankings',
    },
    redirect: 'follow',
    referrer: 'no-referrer'
};
/**
 * Progress callback
 * @callback progressCallback
 * @param {String} message The message following a callback
 */

/**
 * Downloads all the gameinformation from speedrun.com/api.
 * @param {String} gameid The game's id on speedrun.com
 * @param {progressCallback} progressUpdater callback with progress messages
 * @returns {Promise} with a gameData object on success
 */
function getGameData(gameid, progressUpdater) {
    return new Promise( async (resolve, reject) => {
        progressUpdater("Getting game data...");
        let gameData = await fetchGameData(gameid).catch ( err => {
            reject(err);
        })

        progressUpdater("Scanning levels...");
        createLevelObjects(gameData);

        progressUpdater("Scanning full game categories");
        createCategoryObjects(gameData);

        progressUpdater("Checking all levels...");
        await leaderboardInfo(gameData);

        progressUpdater("Finished getting all data!");
        console.log(gameData);
        resolve(gameData);
    });
}

function fetchGameData (gameid) {
    return new Promise (async (resolve, reject) => {
        let response = await fetch("https://www.speedrun.com/api/v1/games/" + gameid + "?embed=levels.variables,levels.categories,categories.variables", fetchOptions);

        if(!response.ok){
            reject(response.status);
        }

        let gameInfo = await response.json();
        let gameData = new GameData(gameInfo["data"]);
        resolve(gameData);
    });
}

function createLevelObjects (gameData) {
    gameData.levelsList.forEach (levelInfo => {
        let level = new Level(levelInfo, levelInfo.categories, levelInfo.variables);
        gameData.levels.push(level);
    });
}

function createCategoryObjects (gameData) {
    // filter miscellaneous categories
    gameData.categoryList = gameData.categoryList.filter(k => k["type"] === "per-game").filter(k => k["miscellaneous"] === false);

    gameData.categoryList.forEach (category => {
        let data = category.variables.data;

        // Removes variables that is not subcategories. For example Update
        data = data.filter(k => k["is-subcategory"] === true);

        gameData.categories.push(new FullGame(category, data));
    });
}

async function leaderboardInfo (gameData) {
    let level_promises = gameData.levels.map (async level => {
        let leaderboardList = level.getLeaderboards(gameData.id);

        let promises = leaderboardList.map( async leaderboard => {
            let response = await fetch(leaderboard["url"] + (leaderboard["url"].includes("?") ? "&embed=players" : "?embed=players"), fetchOptions);
            let json = await response.json();

            json["data"]["players"]["data"].filter( player => player["rel"] === "user").forEach(player => {
                gameData.playerNames[player["id"]] = player["names"]["international"];
            });

            level.subLevels.push(new SubLevel(json["data"], leaderboard["name"], leaderboard["category"], leaderboard["variables"]));
        });

        await Promise.all(promises);
    });

    let category_promises = gameData.categories.map( async category => {
        let leaderboardList = category.getLeaderboards(gameData.id);

        let promises = leaderboardList.map (async leaderboard => {
            let response = await fetch(leaderboard["url"] + (leaderboard["url"].includes("?") ? "&embed=players" : "?embed=players"), fetchOptions);
            let json = await response.json();

            json["data"]["players"]["data"].filter( player => player["rel"] === "user").forEach(player => {
                gameData.playerNames[player["id"]] = player["names"]["international"];
            });

            category.subcategories.push(new SubFullGame(json["data"],leaderboard["name"]));
        });

        await Promise.all (promises);
    })

    await Promise.all([...level_promises, ...category_promises])
}