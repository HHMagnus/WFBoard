function wipeUI() {
    clearTable("playersTable");
    clearTable("levelsTable");
    clearTable("levelranking-playersTable");
    clearTable("full_gameTable");
    clearTable("full_gameranking-playersTable");
    clearModals();
}

function disableOptions() {
    document.getElementById("pointSystem").disabled = true;
    document.getElementById("scanButton").disabled = true;
}

function enableOptions() {
    document.getElementById("pointSystem").disabled = false;
    document.getElementById("scanButton").disabled = false;
}

function clearTable(id) {
    let table = document.getElementById(id);
    let rows = table.getElementsByTagName("tr");
    let rowCount = rows.length;
    if (rowCount > 0)
        for (let x = rowCount - 1; x >= 0; x--) {
            table.removeChild(rows[x]);
        }

}

function clearModals() {
    let modals = document.getElementsByClassName("modal");
    while (modals[0])
        modals[0].parentElement.removeChild(modals[0]);
}

function processUpdate(update) {
    document.getElementById("infoText").innerHTML = update;
}

