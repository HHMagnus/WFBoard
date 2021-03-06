function calculateLeaderboardScoresAndAdd(playerRanks, runScores, score_field_name, runs_field_name, scoring_method) {
    return (leaderboard) => {
        let playersAlreadyScoredForLeaderboard = [];
        leaderboard.data.runs.forEach(run => {
            let players = run.run.players.filter(player => !playersAlreadyScoredForLeaderboard.includes(player.id));
            playersAlreadyScoredForLeaderboard.push(...players.map(player => player.id));
            let run_score = scoring_method(run.place, leaderboard.data.runs.length);
            runScores[run.run.id] = {
                place: run.place,
                score: run_score,
                leaderboard_name: leaderboard.name,
                link: run.run.weblink,
            };
            players.forEach(player => {
                let rank = playerRanks[player.id];
                rank[score_field_name] = rank[score_field_name] + run_score;
                rank[runs_field_name].push(run.run.id);
                playerRanks[player.id] = rank;
            });
        });
    }
}

function formatPlayerRanksToArray (playerRanks) {
    return Object.keys(playerRanks).map (key => {
        playerRanks[key].id = key;
        return playerRanks[key];
    }).filter (rank => rank.id != "undefined");
}

function addOverallScore (playerRanks) {
    return playerRanks.map (rank => {
        rank.overall_score = rank.level_score + rank.full_game_score;
        return rank;
    });
}

function givePlacement(playerRanks, score_name, place_name) {
    playerRanks.sort( (a,b) => b[score_name] - a[score_name]);
    let score = playerRanks[0][score_name];
    let total = 0;
    let place = 1;
    playerRanks.forEach(rank =>{
        total++;

        rank[place_name] = rank[score_name] == score ? place : total;

        place = rank[place_name];
        score = rank[score_name];
    });
}

function givePlacements(playerRanks) {
    givePlacement(playerRanks, "level_score", "level_place");
    givePlacement(playerRanks, "full_game_score", "full_game_place");
    givePlacement(playerRanks, "overall_score", "overall_place");
} 

export function calculateRankings(json, scoring_method) {
    let playerRanks = {};
    json.players.forEach (player => {
        playerRanks[player.id] = {
            level_score: 0,
            level_runs: [],
            full_game_score: 0,
            full_game_runs: []
        }
    });

    let runScores = {};

    json.categories.flatMap(category => category.leaderboards).forEach ( calculateLeaderboardScoresAndAdd(playerRanks, runScores, "full_game_score", "full_game_runs", scoring_method) );
    json.levels.flatMap(level => level.leaderboards).forEach( calculateLeaderboardScoresAndAdd(playerRanks, runScores, "level_score", "level_runs", scoring_method) );

    playerRanks = formatPlayerRanksToArray(playerRanks);

    playerRanks = addOverallScore(playerRanks);

    givePlacements(playerRanks);

    return {playerRanks, runScores};
}

export function score123 (place, total_runs) {
    if (place == 1)
        return 3;
    if (place == 2)
        return 2;
    if (place == 3)
        return 1;
    return 0;
}

export function scoreElite(place, total_runs) {
    let score = 100 - (place-1);
    return Math.max(0, score);
}

export function scoreElitex5(place, total_runs) {
    let score = 100 - ((place-1) * 5);
    return Math.max(0, score);
}

export function scoreWinnerTakeAll(place, total_runs) {
    if(place == 1) return 1;
    return 0;
}

export function scoreProcentage(place, total_runs) {
    const total = total_runs * 10;
    if (place == 1) 
        return Math.round(total * 0.5);
    if (place == 2)
        return Math.round(total * 0.33);
    if (place == 3)
        return Math.round(total * 0.17);
    return 0;
}