import {getJsonFromUrl } from '/scripts/parseUrlParams.js';
import fetchOptions from '/scripts/fetchOptions.js';
import formatGameJson from '/scripts/formatGameJson.js';
import { generateLeaderboards, fetchLeaderboards } from '/scripts/leaderboards.js';
import extractPlayers from '/scripts/extractPlayers.js';

async function start() {
    let url_params = getJsonFromUrl();
    let gameid =  url_params.game;

    let response = await fetch("https://www.speedrun.com/api/v1/games/" + gameid + "?embed=levels.variables,levels.categories,categories.variables", fetchOptions);
    let json = await response.json();

    json = formatGameJson(json);

    generateLeaderboards(json);

    await fetchLeaderboards(json);

    json.players = extractPlayers(json);

    populateView(json);
}

start();

function populateView (json){
    
    console.log(json);

    removeLoader();
}

function removeLoader() { document.querySelector("overlay").style.display = "none"; }