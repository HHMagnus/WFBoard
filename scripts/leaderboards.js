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

function generateVariableNames (leaderboard, level) {
    return leaderboard.variables.map( variable => {
        let label = level.variables.find(vari => vari.id == variable.id).values.find(value => value.value == variable.value).label;
        return label;
    }).join (" - ");
}

function generateNames(json) {
    json.categories = json.categories.map ( category => {
        category.leaderboards = category.leaderboards.map (leaderboard => {
            let name = category.name;
            name += ": " + generateVariableNames(leaderboard, category);
            leaderboard.name = name;
            return leaderboard;
        });
        return category;
    });

    json.levels = json.levels.map (level => {
        level.leaderboards = level.leaderboards.map (leaderboard => {
            let category_name = level.categories.find(category => category.id == leaderboard.category).name;
            let name = "(" + category_name + ") " + level.name;
            name += ": " + generateVariableNames(leaderboard, level);
            leaderboard.name = name;
            return leaderboard;
        });
        return level;
    })
}

function generateIds (json) {
    let id = 0;
    json.categories = json.categories.map (category => {
        category.leaderboards = category.leaderboards.map (leaderboard => {
            leaderboard.id = "c" + id++;
            return leaderboard;
        });
        return category;
    });

    id = 0;
    json.levels = json.levels.map (level => {
        level.leaderboards = level.leaderboards.map ( leaderboard => {
            leaderboard.id = "l" + id++;
            return leaderboard;
        });
        return level;
    });
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

        level.leaderboards = level.categories.flatMap (category => {

            if(all_variable_combinations.length < 1) {
                return {
                    category: category.id,
                    variables: [],
                    link: link + "/" + category.id + "?"
                }
            }

            return all_variable_combinations.map(combination => {
                let variable_string = get_variable_string(combination);
                let link_combined = link + "/" + category.id + "?" + variable_string;
                return {
                    category: category.id,
                    variables: combination,
                    link: link_combined
                }
            })
        });

        return level;
    });

    generateNames(json);
    generateIds(json);

    return json;
}

import fetchOptions from './fetchOptions.js';

async function fetchLeaderboardsWithPlayers ( json , get) {
    let promises = json.map(async level => {
        let leaderboard_promises = level.leaderboards.map ( async leaderboard => {
            let response = await get(leaderboard.link + "&embed=players", fetchOptions);
            leaderboard.data = (await response.json()).data;
            leaderboard.data.players = leaderboard.data.players.data;
            return leaderboard;
        });
        level.leaderboards = await Promise.all(leaderboard_promises);
        return level;
    });
    return await Promise.all(promises);
}

async function fetchLeaderboards ( json, get ) {
    json.categories = await fetchLeaderboardsWithPlayers (json.categories, get);
    json.levels = await fetchLeaderboardsWithPlayers (json.levels, get);
}


export { generateLeaderboards, fetchLeaderboards };