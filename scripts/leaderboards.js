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

function generateLeaderboards ( json ) {
    json.categories = json.categories.map (category => {

        let link = category.links.filter(link => link.rel == "leaderboard")[0].uri;

        let all_variable_combinations = get_all_variable_combinations([...category.variables], []);

        category.leaderboards = all_variable_combinations.map ( combination => {
            let variable_string = combination.map (variable => {
                return "var-" + variable.id + "=" + variable.value;
            }).join ("&");

            let link_with_variables = link + "?" + variable_string;

            return {
                variables: combination,
                link: link_with_variables
            }
        });

        return category;
    });

    json.levels = json.levels.map (level => {
        // TODO REMOVE CATEGORY FROM LINK
        let link = level.links.filter(link => link.rel == "leaderboard")[0].uri;

        // TODO FINISH THIS AND FINISH FETCH

    });
    return json;
}

import fetchOptions from '/scripts/fetchOptions.js';

async function fetchLeaderboards ( json ) {
    json.categories = await Promise.all(json.categories.map (async category => {
        category.leaderboards = await Promise.all(category.leaderboards.map (async leaderboard => {
            let response = await fetch(leaderboard.link, fetchOptions);
            leaderboard.data = (await response.json()).data;
            return leaderboard;
        }));
        return category;
    }));
}

export { generateLeaderboards, fetchLeaderboards };