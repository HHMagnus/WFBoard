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
        await fetchAllLeaderboards(gameData).catch(err => {
            reject(err);
        });

        progressUpdater("Finished getting all data!");
        console.log(gameData);
        resolve(gameData.getAllRelevantData());
    });
}

async function fetchGameData (gameid) {
    let response = await fetch("https://www.speedrun.com/api/v1/games/" + gameid + "?embed=levels.variables,levels.categories,categories.variables", fetchOptions);
    let gameInfo = await response.json();

    let gameData = new GameData(gameInfo["data"]);
    return gameData;
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

async function fetchAllLeaderboards (gameData) {
    let levels = addAllLevels(gameData);

    let categories = addAllCategories(gameData);

    await Promise.all([levels, categories])
}
async function addAllLevels (gameData) {
    let promises = gameData.levels.map ( async level => {
        await addSubLevels(gameData, level);
    });
    await Promise.all(promises);
}

async function addSubLevels (gameData, level) {
    let leaderboardList = level.getLeaderboards(gameData.id);

    let promises = leaderboardList.map ( async leaderboard => {
        await addSubLevel(gameData, level, leaderboard);
    });
    await Promise.all(promises);
}

async function addSubLevel (gameData, level, leaderboard) {
    let json = await fetchLeaderboard(leaderboard);

    addPlayerNamesToGameData(json, gameData);

    let subLevel = new SubLevel(json, leaderboard["name"], leaderboard["category"], leaderboard["variables"]);
    level.subLevels.push(subLevel);
}

async function addAllCategories (gameData) {
    let promises = gameData.categories.map( async category => {
        await addSubCategories(gameData, category);
    })
    await Promise.all(promises);
}

async function addSubCategories (gameData, category) {
    let leaderboardList = category.getLeaderboards(gameData.id);

    let promises = leaderboardList.map( async leaderboard => {
        await addSubCategory(gameData, category, leaderboard);
    });
    await Promise.all(promises);
}

async function addSubCategory (gameData, category, leaderboard) {
    let json = await fetchLeaderboard(leaderboard);

    addPlayerNamesToGameData(json, gameData);

    let subFullGame = new SubFullGame(json, leaderboard["name"]);
    category.subcategories.push(subFullGame);
}

async function fetchLeaderboard (leaderboard) {
    let response = await fetch(leaderboard["url"] + (leaderboard["url"].includes("?") ? "&embed=players" : "?embed=players"), fetchOptions);
    let json = await response.json();
    return json["data"];
}

function addPlayerNamesToGameData(data, gameData) {
    data["players"]["data"].filter(player => player["rel"] === "user").forEach(player => {
        gameData.playerNames[player.id] = player.names.international;
    });
}