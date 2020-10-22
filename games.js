import fetchOptions from '/scripts/fetchOptions.js';

const fuzzyOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        "abbreviation",
        "names.international",
        "names.japanese"
    ]
}

const list = document.querySelector(".list");
const input = document.querySelector("#search_text");
const overlay = document.querySelector("overlay");

async function getAllGames() {
    let games = [];
    let nextLink = "https://www.speedrun.com/api/v1/games?_bulk=yes&max=1000";
    while(nextLink != null) {
        let data = await fetch(nextLink, fetchOptions);
        let json = await data.json();
        games.push(...json.data);

        nextLink = null;
        
        let links = json.pagination.links.filter(link => link.rel == "next");
        if(links.length > 0){
            nextLink = links[0].uri;
        }
    }
    return games;
}

function enableGameSearching (games){
    disableOverlay();
    removeDisabledFromInput();

    let fuzzy = new Fuse(games, fuzzyOptions);

    createTimeoutSearch(fuzzy);
}

function disableOverlay() { overlay.style.display = 'none'; }
function removeDisabledFromInput() { input.removeAttribute("disabled"); }

function createTimeoutSearch(fuzzy) {
    search(fuzzy)

    let timeout = null;
    document.querySelector("#search_text").addEventListener('input', (ev) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => search(fuzzy), 250);
    });
}

function search(fuzzy) {
    let input = getSearchInput();

    let result = fuzzy.search(input);

    clearGamesList();

    let limited_results = result.slice(0,30);
    limited_results.forEach (game => {
        addGameTab(game);
    });
}

function getSearchInput() { return input.value; }
function clearGamesList() { list.innerHTML = ""; }

function addGameTab (game){
    let link = document.createElement("a");
    link.href = getLink(game.abbreviation);
    link.innerText = game.names.international;

    appendGame(link);
}

function getLink(gameid) { return "game.html?game=" + gameid; }
function appendGame(gameElement) { list.appendChild(gameElement) }

async function start() {
    let games = await getAllGames();

    enableGameSearching(games);
}

start();