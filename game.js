import { getJsonFromUrl } from './scripts/parseUrlParams.js';
import { populateView, cleanView, rankingSystemView } from './scripts/populateView.js';
import active_tabs from './scripts/active_tabs.js';
import fetchAll from './scripts/fetchAll.js';
import { calculateRankings, score123, scoreElite, scoreElitex5, scoreProcentage, scoreWinnerTakeAll } from './scripts/calculateRankings.js';

async function start() {
    let url_params = getJsonFromUrl();
    let gameid = url_params.game;
    let data = {};

    // Fetch all data
    try {
        data = await fetchAll(gameid, (x, y) => fetch(x, y));
        await store_in_localStorage(gameid, data);
    } catch (err) {
        console.log(err);
        // Try to load localStorage if online is unavailable
        try {
            console.log("Load from localStorage")
            let fromLocalStorage = await load_from_localStorage(gameid);
            data = JSON.parse(fromLocalStorage);
        } catch (err2) {
            console.log(err2);
            try {
                if(gameid != 'wf') throw 'Only Warframe backup supported!';
                let res = await fetch('./workflow/wf.json');
                data = await res.json();
            }catch (err3 ){
                console.log(err3);
                alert("The API has denied your request because of a rate limit. Please try again later!")
                return;
            }
        }
    }

    let { json, record_date } = data;

    // Set fields for game
    record_date = new Date(record_date);
    const title = json.names.international + " rankings";
    document.querySelector("title").innerHTML = title;
    document.querySelector("#title").innerText = title;
    document.querySelector("#record_date").innerText = "("+record_date.toLocaleString()+")";

    active_tabs();

    const show = (json, scoring_method) => {
        let { playerRanks, runScores } = calculateRankings(json, scoring_method);
        populateView(json, playerRanks, runScores);
    }

    show(json, score123);
    rankingSystemView(score_method => {
        cleanView();
        let method = scoreElite;
        switch (score_method) {
            case 'top3':
                method = score123;
                break;
            case 'elite':
                method = scoreElite;
                break;
            case 'elitex5':
                method = scoreElitex5;
                break;
            case 'winner_take_all':
                method = scoreWinnerTakeAll;
                break;
            case 'procentage_based':
                method = scoreProcentage;
                break;
            default:
                method = score123
        }
        show(json, method);
    });
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