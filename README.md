# WFBoard - A ranking system for Speedruns

Warframe Ranking board: https://hhmagnus.github.io/WFBoard/

Select for another game at: https://hhmagnus.github.io/WFBoard/games.html

## Description

WFBoard pulls data from the official Speedrun leaderboard using the Speedrun API and ranks players. It allows to view the score individual level and full game speedruns. A player can view where they got their points from. Additionally the ranking system can be changed by pressing the button in the top right corner.

This project is originally made for [Warframe speedruns](http://speedrun.com/wf), so this is the main focus of the project. Later extensions made it possible view for other games.

## Technical Details

The project uses the Speedrun.com API, which is a JSON-based REST API. The project is built in Javascript using ES6 Modules and should work in all modern browsers.

The games overview is located in games.html and games.js. It allows the user to search for games using a fuzzy library. Fuzzy search will correct for misspelling of the game names.

The game ranking is located in game.html and game.js. It uses the scripts in /scripts to download all data and construct a leaderboard from them. fetchAll.js is responsible for fetching the data and removing the parts not needed. The main challenge here is that each level will have a category and some variables, which can be set in varios ways. For example a leaderboard may be Solo, Pre-X and Without-Y. The leaderboard.js script takes care of constructing and downloading all these leaderboards with each possible combination of variables and category.

The ranking system can be changed, which is done in game.js. This was possible by decoupling the data fetching from the ranking method. It allows for a different scoring methods to be used, they can be defined by (place: int, total: int) -> score: int.

### Rate limit problems

The API has a rate limit, which is around 100 request per minute. However, some games contain more then 100 leaderboards and it is not possible query multiple at a time. Therefore this project is setup with two fallback plans in case the API is unavailable.

First contingency is that when the data has been collected by project, it will be saved in localStorage. Next time the project is opened it will use the localStorage, if the API is unavailable. Since localStorage is limited (to 5mb), the library _localforage_ is used to save it in the IndexedDB instead (50mb limit). The problem with this approach is that it only works if the user has succesfully visited the project before. A second contigency was setup incase this was not the case

The second contigency is that the fetchAll.js code is used in /workflow using Node.js to download a games data. This can be used as the backup data for a game. The idea is that this can be in a cronjob to save data periodically. Since the main focus of this project is the Warframe speedrun rankings, the data for that game is saved alongside the project code. However, this is only temporary until a cronjob to save data has been setup.

## Future optimizations and upgrades

Possible optimizations and upgrades to the code:
  - Possibility to make custom scoring system without editing code.
  - Cronjob to use /workflow to backup data automatically periodically (Github Actions or alternative)