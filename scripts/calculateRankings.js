function calculateLeaderboardScoresAndAdd(playerRanks, runScores, score_field_name, runs_field_name) {
    return (leaderboard) => {
        let playersAlreadyScoredForLeaderboard = [];
        leaderboard.data.runs.forEach(run => {
            let players = run.run.players.filter(player => !playersAlreadyScoredForLeaderboard.includes(player.id));
            playersAlreadyScoredForLeaderboard.push(...players.map(player => player.id));
            let run_score = score(run.place, leaderboard.data.runs.length);
            runScores[run.run.id] = {
                score: run_score,
                leaderboard_name: leaderboard.name,
                web_link: run.run.weblink
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

export default (json) => {
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

    json.categories.flatMap(category => category.leaderboards).forEach ( calculateLeaderboardScoresAndAdd(playerRanks, runScores, "full_game_score", "full_game_runs") );
    json.levels.flatMap(level => level.leaderboards).forEach( calculateLeaderboardScoresAndAdd(playerRanks, runScores, "level_score", "level_runs") );

    return {playerRanks, runScores};
}

function score (place, total_runs){
    if (place == 1)
        return 3;
    if (place == 2)
        return 2;
    if (place == 3)
        return 1;
    return 0;
}