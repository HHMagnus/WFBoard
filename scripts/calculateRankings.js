
function rankLeaderboard(json){
    return (leaderboard) => {
        
    };
}

export default (json) => {
    let leaderboards = [...json.categories.flatMap(category => category.leaderboards), ...json.levels.flatMap(level => level.leaderboards)];

    leaderboards.forEach(rankLeaderboard(json))

    console.log(leaderboards);
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