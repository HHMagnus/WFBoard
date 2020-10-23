import fetchOptions from './fetchOptions.js';
import formatGameJson from './formatGameJson.js';
import { generateLeaderboards, fetchLeaderboards } from './leaderboards.js';
import extractPlayers from './extractPlayers.js';
import calculateRankings from './calculateRankings.js';

export default async function (gameid, get) {
    let response = await get("https://www.speedrun.com/api/v1/games/" + gameid + "?embed=levels.variables,levels.categories,categories.variables", fetchOptions);
    let json = await response.json();
    json = formatGameJson(json);

    generateLeaderboards(json);
    await fetchLeaderboards(json, get);

    json.players = extractPlayers(json);

    let { playerRanks, runScores } = calculateRankings(json);

    return { json, playerRanks, runScores, record_date: new Date(Date.now()) };
}