export default (json) => {
    delete json.links;
    delete json.ruleset;
    delete json.assets;
    delete json.created;
    delete json.developers;
    delete json.engines;
    delete json.gametypes;
    delete json.genres;
    delete json.moderators;
    delete json.platforms;
    delete json.publishers;
    delete json.regions;
    delete json.released;
    delete json.romhack;
    json.categories.forEach(category => {
        delete category.rules;
        delete category.links;
        delete category.players;
        category.leaderboards.forEach(leaderboard => {
            delete leaderboard.data.timing;
            delete leaderboard.data.links;
            delete leaderboard.data.players;
            delete leaderboard.data.game;
            delete leaderboard.data.emulators;
            delete leaderboard.data.values;
            delete leaderboard.data.level;
            delete leaderboard.data.platform;
            delete leaderboard.data.region;
            delete leaderboard.link;
            leaderboard.data.runs.forEach(run => {
                delete run.run.comment;
                delete run.run.category;
                delete run.run.date;
                delete run.run.game;
                delete run.run.level;
                delete run.run.splits;
                delete run.run.status;
                delete run.run.submitted;
                delete run.run.system;
                delete run.run.times;
                delete run.run.values;
                delete run.run.videos;
            })
        });
    });

    json.levels.forEach(level => {
        delete level.categories;
        delete level.default_category;
        delete level.links;
        delete level.rules;
        delete level.variables;
        level.leaderboards.forEach(leaderboard => {
            delete leaderboard.data.category;
            delete leaderboard.data.emulators;
            delete leaderboard.data.game;
            delete leaderboard.data.level;
            delete leaderboard.data.links;
            delete leaderboard.data.platform;
            delete leaderboard.data.players;
            delete leaderboard.data.region;
            delete leaderboard.data.timing;
            delete leaderboard.data.values;
            delete leaderboard.link;
            leaderboard.data.runs.forEach(run => {
                delete run.run.category;
                delete run.run.comment;
                delete run.run.date;
                delete run.run.game;
                delete run.run.level;
                delete run.run.splits;
                delete run.run.status;
                delete run.run.system;
                delete run.run.submitted;
                delete run.run.times;
                delete run.run.values;
                delete run.run.videos;
            });
        });
    });

    json.players.forEach(player => {
        delete player.hitbox;
        delete player.links;
        delete player.location;
        delete player.signup;
        delete player.speedrunslive;
        delete player.twitch;
        delete player.twitter;
        delete player.youtube;
    });
}