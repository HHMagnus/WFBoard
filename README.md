# WFBoard - A ranking system for Warframe Speedruns

The board can be visited at: https://hhmagnus.github.io/WFBoard/

The board to view any game on speedrun.com's leaderboard: https://hhmagnus.github.io/WFBoard/games.html

Description
--
WFBoard pulls data from the official Warframe Speedrun leaderboard at https://www.speedrun.com/wf and ranks players. 

Technical Details
--
Speedrun.com API uses a JSON-based REST API, and calls are done via HTTPS.  
Games overview is generated in games.js, it is dependent on a fuzzy search library.

Game overview is generated in game.js. In order to get all possible possible combinations of leaderboards some custom logic is done in leaderboards.js, which combines all possible combinations of variables. This can lead to some games taking a while to load, since the api does not support this by default.

Future optimizations and upgrades
--
Possible optimizations and upgrades to the code:
  - possibility to make custom scoring system without editing code.
  - Backup files online incase API rate limits (/workflow contains Node.js code to do so)
  - Personal overview of single player