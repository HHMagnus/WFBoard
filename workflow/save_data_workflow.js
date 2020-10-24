import fs from 'fs';
import fetchAll from '../scripts/fetchAll.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
var fetch = require('node-fetch');

async function saveIt(gameid) {
    let data = await fetchAll(gameid, fetch);

    let dataStr = JSON.stringify(data);
    
    fs.writeFileSync('wf.json', "export default " + dataStr);
}

saveIt("wf");