const personal_tbody = document.querySelector("#personal_tbody");
const playerViewTemplate = document.querySelector("#playerView");

function populatePersonalRankings (json, playerRanks) {
    playerRanks.forEach (rank => {
        let player = json.players.find (player => player.id == rank.id);
        let player_name = player.names.international;
        let player_profile = player.weblink;

        let playerView = document.importNode(playerViewTemplate.content, true);

        let player_element = document.createElement("a");
        player_element.href = player_profile;
        player_element.innerText = player_name;
        playerView.querySelector(".player_name").appendChild(player_element);

        let level_score =  playerView.querySelector(".level_score");
        level_score.innerText = rank.level_score + " (#" + rank.level_place + ")";
        level_score.setAttribute("sorttable_customkey", rank.level_score);

        let full_game_score = playerView.querySelector(".full_game_score");
        full_game_score.innerText = rank.full_game_score + " (#" + rank.full_game_place + ")";
        full_game_score.setAttribute("sorttable_customkey", rank.full_game_score);

        let overall_score = playerView.querySelector(".overall_score")
        overall_score.innerText = rank.overall_score + " (#" + rank.overall_place + ")";
        overall_score.setAttribute("sorttable_customkey", rank.overall_place);

        personal_tbody.appendChild(playerView);

    });

    sorttable.makeSortable(document.querySelector("#personal_table"));
}



export default (json, playerRanks, runScores) => {

    populatePersonalRankings(json,playerRanks);

    removeLoader();
}

function removeLoader() { document.querySelector("overlay").style.display = "none"; }