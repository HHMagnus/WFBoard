function get_all_variable_combinations (variables, list) {
    if(variables.length < 1){
        return list;
    }

    let variable = variables.shift();

    let additions = variable.values.map ( value => {
        return {
            id: variable.id,
            value: value.value
        };
    });

    if (list.length < 1) {
        list = additions.map( addition => {
            return [addition];
        });

        return get_all_variable_combinations(variables, list);
    };

    list = additions.map (addition => {
        return list.map (collection => {
            return [...collection, addition];
        })
    }). flat();

    return get_all_variable_combinations(variables, list);
}

function get_variable_string (combination) {
    let variable_string = combination.map (variable => {
        return "var-" + variable.id + "=" + variable.value;
    }).join ("&");
    return variable_string;
}

function generateLeaderboards ( json ) {
    json.categories = json.categories.map (category => {

        let link = category.links.filter(link => link.rel == "leaderboard")[0].uri;

        let all_variable_combinations = get_all_variable_combinations([...category.variables], []);

        category.leaderboards = all_variable_combinations.map ( combination => {
            let variable_string = get_variable_string(combination)

            let link_with_variables = link + "?" + variable_string;

            return {
                variables: combination,
                link: link_with_variables
            }
        });

        return category;
    });

    json.levels = json.levels.map (level => {
        let link = level.links.filter(link => link.rel == "leaderboard")[0].uri;
        let split = link.split("/");

        let default_category = split[split.length-1];
        level.default_category = default_category;
        
        split.pop();
        link = split.join("/");
        level.link = link;

        let all_variable_combinations = get_all_variable_combinations([...level.variables], []);

        level.leaderboards = all_variable_combinations.flatMap (combination =>{
            let variable_string = get_variable_string(combination);

            return level.categories.map (category => {
                let link_combined = link + "/" + category.id + "?" + variable_string;
                return {
                    category: category.id,
                    variables: combination,
                    link: link_combined
                };
            });
        });

        return level;
    });
    return json;
}

import fetchOptions from '/scripts/fetchOptions.js';

async function fetchLeaderboardsWithPlayers ( json ) {
    let promises = json.map(async level => {
        let leaderboard_promises = level.leaderboards.map ( async leaderboard => {
            let response = await fetch(leaderboard.link + "&embed=players", fetchOptions);
            leaderboard.data = (await response.json()).data;
            leaderboard.data.players = leaderboard.data.players.data;
            return leaderboard;
        });
        level.leaderboards = await Promise.all(leaderboard_promises);
        return level;
    });
    return await Promise.all(promises);
}

async function fetchLeaderboards ( json ) {
    json.categories = await fetchLeaderboardsWithPlayers (json.categories);
    json.levels = await fetchLeaderboardsWithPlayers (json.levels);
}

export { generateLeaderboards, fetchLeaderboards };