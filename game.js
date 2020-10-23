import { getJsonFromUrl } from '/scripts/parseUrlParams.js';
import populateView from '/scripts/populateView.js';
import active_tabs from '/scripts/active_tabs.js';
import fetchAll from './scripts/fetchAll.js';

async function start() {
    let url_params = getJsonFromUrl();
    let gameid = url_params.game;

    let { json, playerRanks, runScores } = await fetchAll(gameid, (x, y) => fetch(x, y));

    document.querySelector("title").innerHTML = json.names.international + " rankings";

    populateView(json, playerRanks, runScores);

    console.log(json);
    console.log(playerRanks);
    console.log(runScores);

    active_tabs();
}

start();