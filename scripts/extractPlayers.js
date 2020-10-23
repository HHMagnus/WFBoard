function getPlayers (json, field) {
    let players = [];
    json[field].forEach (level => {
        level.leaderboards.forEach (leaderboard => {
            leaderboard.data.players.forEach(player=>{
                players.push(player);
            });
        })
    })
    return players;
}

export default (json) => {
    let all = [...getPlayers(json, "categories"), ...getPlayers(json, "levels")];

    let players = [];

    all.forEach (player => {
        if(players.find(p => p.id==player.id) === undefined){
            players.push(player);
        }
    })

    return players;
};