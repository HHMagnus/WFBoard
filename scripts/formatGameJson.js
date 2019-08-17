function removeNonSubCategoryVariables(level) {
    level.variables = level.variables.filter(variable => {
        return variable["is-subcategory"];
    });
    return level;
}

function removeDataFromTree(field) {
    return (json) => {
        json[field] = json[field].data;
        return json;
    };
}

function formatVariables (level) {
    level.variables = level.variables.map (formatVariable);
    return level;
}

function formatVariable (variable) {
    variable.default = variable.values.default;
    let values = [];
    for (let value_id in variable.values.values) {
        let value = variable.values.values[value_id];
        value.value = value_id;
        values.push (value);
    }
    variable.values = values;
    return variable;
}

export default (json) => {
    // remove data
    json = json.data;
    json.categories = json.categories.data;
    json.levels = json.levels.data;

    // remove data from subtrees
    json.levels = json.levels.map ( removeDataFromTree("categories") );
    json.levels = json.levels.map ( removeDataFromTree("variables") );
    json.categories = json.categories.map ( removeDataFromTree("variables") );

    // remove non subcategory variables
    json.categories = json.categories.map( removeNonSubCategoryVariables );
    json.levels = json.levels.map ( removeNonSubCategoryVariables );

    // format values of variables
    json.levels = json.levels.map ( formatVariables );
    json.categories = json.categories.map ( formatVariables );

    // removes level categories from category list
    json.categories = json.categories.filter (category => {
        return category.type == "per-game";
    });

    return json;
};