import { getJsonFromUrl } from '/scripts/parseUrlParams.js';
import populateView from '/scripts/populateView.js';
import active_tabs from '/scripts/active_tabs.js';
import fetchAll from './scripts/fetchAll.js';
import calculateRankings from './scripts/calculateRankings.js';

async function start() {
    let url_params = getJsonFromUrl();
    let gameid = url_params.game;
    let data = {};

    try {
        data = await fetchAll(gameid, (x, y) => fetch(x, y));
        await store_in_localStorage(gameid, data);
    } catch (err) {
        try {
            console.log("Load from localStorage")
            let fromLocalStorage = await load_from_localStorage(gameid);
            data = JSON.parse(fromLocalStorage);
        } catch (err2) {
            alert("The API has denied your request because of a rate limit. Please try again later!")
            return;
        }
    }

    let { json, record_date } = data;

    let { playerRanks, runScores } = calculateRankings(json);

    record_date = new Date(record_date);
    const title = json.names.international + " rankings";
    document.querySelector("title").innerHTML = title;
    document.querySelector("#title").innerText = title;
    document.querySelector("#record_date").innerText = "("+record_date.toLocaleString()+")";

    populateView(json, playerRanks, runScores);

    console.log(json);
    console.log(playerRanks);
    console.log(runScores);

    active_tabs();
}

async function store_in_localStorage(gameid, data) {
    let dataStr = JSON.stringify(data);
    const mb = 1000000;
    let bits = parseInt(dataStr.length / mb)+1;

    await localforage.setItem(gameid +"_bits", bits);

    for(let i = 0; i < bits; i++) {
        let bit = dataStr.substr(i * mb, mb);
        await localforage.setItem(gameid + "_bit" + i, bit);
    }
}

async function load_from_localStorage(gameid) {
    let result = "";

    let bits = await localforage.getItem(gameid + "_bits");

    for(let i = 0; i < bits; i++) {
        let bit = await localforage.getItem(gameid + "_bit" + i);
        result += bit;
    }

    return result;
}

start();