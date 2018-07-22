function getScoringMethod() {
    let pointSystem = document.getElementById("pointSystem").value;
    let scoringMethod;
    if (pointSystem === "elite") {
        scoringMethod = elite;
    }
    else if (pointSystem === "placement") {
        scoringMethod = runAndPlace;
    }
    else if (pointSystem === "quasar") {
        scoringMethod = quasarWay;
    }
    else if (pointSystem === "fiftythirthytreeseventeensplit") {
        scoringMethod = fiftythirthytreeseventeensplit;
    }
    else {
        processUpdate("Failed to score players, aborting!");
        return;
    }
    return scoringMethod;
}

function elite(placement) {
    let points = 105 - (placement["place"] * 5);
    return points > 0 ? points : 0;
}

function runAndPlace(placement) {
    return placement["totalRuns"] / placement["place"];
}

function quasarWay(placement) {
    let place = placement["place"];
    if (place === 1) {
        return 3;
    } else if (place === 2) {
        return 2.5;
    } else if (place === 3) {
        return 2;
    } else if (place < 6) {
        return 0.5;
    } else {
        return 0;
    }
}

function fiftythirthytreeseventeensplit(placement) {
    let place = placement["place"];
    //let total = placement["totalRuns"];
    let total = 10;
    if (place === 1) {
        return total * 0.5;
    }
    else if (place === 2) {
        return total * 0.33;
    }
    else if (place === 3) {
        return total * 0.17;
    }
    else {
        return 0;
    }
}