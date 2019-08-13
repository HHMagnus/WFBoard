# WFBoard - A ranking system for Warframe Speedruns

The board can be visited at: https://hhmagnus.github.io/WFBoard/wfScan.html

Description
--
WFBoard pulls data from the official Warframe Speedrun leaderboard at https://www.speedrun.com/wf and ranks players. There is a few different ranking system available until the community chooses a ranking system that fits well.

Technical Details
--
Speedrun.com API uses a JSON-based REST API, calls are done via HTTPS. Every call to the API is done in scangamedata.js, where a GameData object is created (GameData.js describes this object). rankings.js is organising the data onto the site. Files ending in UI is used to control the UI, scoring.js returns different higher order functions the scores can be distributed by.

Future optimizations and upgrades
--
Possible optimizations and upgrades to the code:
  - rankingsUI.js changed to instead use <template> from HTML5.
  - possibility to make custom scoring system without editing code.