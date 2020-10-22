import { getJsonFromUrl } from '/scripts/parseUrlParams.js';
import fetchOptions from '/scripts/fetchOptions.js';
import formatGameJson from '/scripts/formatGameJson.js';
import { generateLeaderboards, fetchLeaderboards } from '/scripts/leaderboards.js';
import extractPlayers from '/scripts/extractPlayers.js';
import calculateRankings from '/scripts/calculateRankings.js';
import populateView from '/scripts/populateView.js';
import active_tabs from '/scripts/active_tabs.js';

async function start() {
    let url_params = getJsonFromUrl();
    let gameid = url_params.game;

    let response = await fetch("https://www.speedrun.com/api/v1/games/" + gameid + "?embed=levels.variables,levels.categories,categories.variables", fetchOptions);
    let json = await response.json();

    json = formatGameJson(json);

    document.querySelector("title").innerHTML = json.names.international + " rankings";

    generateLeaderboards(json);
    await fetchLeaderboards(json);

    json.players = extractPlayers(json);

    let { playerRanks, runScores } = calculateRankings(json);

    populateView(json, playerRanks, runScores);

    console.log(json);
    console.log(playerRanks);
    console.log(runScores);

    active_tabs();
}

start();