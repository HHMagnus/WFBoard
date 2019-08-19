const personal_tbody = document.querySelector("#personal_tbody");
const playerViewTemplate = document.querySelector("#playerView");
export default (json, playerRanks, runScores) => {
    removeLoader();

    for(let player_id in playerRanks) {
        if(player_id === "undefined") {continue;}
        let rank = playerRanks[player_id];
        let player = json.players.find (player => player.id == player_id);
        let player_name = player.names.international;
        let player_profile = player.weblink;

        let playerView = document.importNode(playerViewTemplate.content, true);

        playerView.querySelector(".player_name").innerText = player_name;
        playerView.querySelector(".level_score").innerText = rank.level_score;
        playerView.querySelector(".full_game_score").innerText = rank.full_game_score;
        playerView.querySelector(".overall_score").innerText = rank.level_score + rank.full_game_score;

        personal_tbody.appendChild(playerView);
    }
}

function removeLoader() { document.querySelector("overlay").style.display = "none"; }