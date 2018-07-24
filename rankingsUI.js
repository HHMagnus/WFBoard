String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function trim(text) {
    return text
        .replaceAll("dot", "dotdot").replaceAll(".", "dot")
        .replaceAll("space", "spacespace").replaceAll(" ", "space")
        .replaceAll("and", "andand").replaceAll("&", "and")
        .replaceAll("colon", "coloncolon").replaceAll(":", "colon")
        .replaceAll("procent", "procentprocent").replaceAll("%", "procent");
}

function addPlayerToTable(placement, name, score, placements) {
    let trimmed_name = trim(name);

    let scoringMethod = getScoringMethod();
    placements.sort((a, b) => { return scoringMethod(b) - scoringMethod(a) });

    let table_body = document.createElement("tbody");
    placements.forEach((placement) => {
        table_body.addRow([placement["place"], placement["level_name"], scoringMethod(placement)]);
    });
    let modal_body = createModalTableBody(createTableHeadSection(["#", "Level", "Score"]), table_body);

    let modal_header = createModalHeader(name + " (" + placements.length + " runs)");
    let modal_footer = createModalFooter("Visit Profile", "https://www.speedrun.com/user/" + name);
    let modal_content = createModalContent(modal_header, modal_body, modal_footer);

    let modal_dialog = createModalDialog(modal_content);

    let modal_main = createModalMain("player-modal-" + trimmed_name, modal_dialog);

    document.getElementById("body").appendChild(modal_main);

    let nameButton = createModalButton("#player-modal-" + trimmed_name, name);

    document.getElementById("playersTable").addRow([placement, nameButton, score]);
}

function addLevelToTable(sublevel) {
    console.log("level");

    let scoringMethod = getScoringMethod();

    let nameButton;

    if (sublevel.leaderboardInfo["runs"][0]) {

        let trimmed_name = trim(sublevel.name + sublevel.category + sublevel.variables_name);


        let table_body = document.createElement("tbody");

        let total_runs = sublevel.leaderboardInfo["runs"].length;

        sublevel.leaderboardInfo["runs"].forEach((run) => {
            let players = "";
            run["run"]["players"].forEach((player) => {
                let name = findPlayerName(gameData, player["id"]);
                players += name + ", ";
            })
            players = players.slice(0, -2);
            table_body.addRow([run["place"], players, scoringMethod(toPlacement(run["place"], total_runs))]);
        });
        let modal_body = createModalTableBody(createTableHeadSection(["#", "Name", "Score"]), table_body);

        let modal_header = createModalHeader(sublevel.name + " (" + total_runs + ")");
        let modal_footer = createModalFooter("Visit Level", "www.speedrun.com/wf");
        let modal_content = createModalContent(modal_header, modal_body, modal_footer);

        let modal_dialog = createModalDialog(modal_content);

        let modal_main = createModalMain("level-modal-" + trimmed_name, modal_dialog);

        document.getElementById("body").appendChild(modal_main);

        nameButton = createModalButton("#level-modal-" + trimmed_name, sublevel.name);
    } else {
        nameButton = sublevel.name;
    }
    document.getElementById("levelsTable").addRow([nameButton, sublevel.category, sublevel.variables_name]);

}

/**
 * Creates a Table Modal body with the following head and body
 * @param {HTMLTableSectionElement} thead 
 * @param {HTMLTableSectionElement} tbody 
 */
function createModalTableBody(thead, tbody) {
    let modal_body = document.createElement("div");
    modal_body.className = "modal-body";

    let level_table = document.createElement("table");
    level_table.className = "table table-striped table-dark";

    level_table.appendChild(thead);
    level_table.appendChild(tbody);

    modal_body.appendChild(level_table);
    return modal_body;
}

/**
 * Creates a Modal Dialog with content modal_content
 * @param {HTMLDivElement} modal_content 
 * @returns {HTMLDivElement}
 */
function createModalDialog(modal_content) {
    let dialog = document.createElement("div");
    dialog.className = "modal-dialog modal-lg";

    dialog.appendChild(modal_content);

    return dialog;
}

/**
 * Creates a modal content with the following header, body and footer.
 * @param {HTMLDivElement} modal_header The header
 * @param {HTMLDivElement} modal_body The body
 * @param {HTMLDivElement} modal_footer The footer
 * @returns {HTMLDivElement}
 */
function createModalContent(modal_header, modal_body, modal_footer) {
    let modal_content = document.createElement("div");
    modal_content.className = "modal-content bg-dark";

    modal_content.appendChild(modal_header);
    modal_content.appendChild(modal_body);
    modal_content.appendChild(modal_footer);

    return modal_content;
}

/**
 * Creates the modal main div with the dialog
 * @param {String} id id text for the modal
 * @param {HTMLDivElement} dialog The dialog child
 * @returns {HTMLDivElement}
 */
function createModalMain(id, dialog) {
    let main = document.createElement("div");
    main.className = "modal fade";
    main.id = id;
    main.setAttribute("tabindex", "-1");
    main.setAttribute("role", "modal");
    main.setAttribute("aria-labelledby", "Large-Modal-" + id);
    main.setAttribute("aria-hidden", "true");

    main.appendChild(dialog);

    return main;
}

/**
 * Creates a Table Head Section with column names
 * @param {String[]} columns A list of the names of all the columns
 * @returns {HTMLTableSectionElement} thead
 */
function createTableHeadSection(columns) {
    let table_head = document.createElement("thead");

    let head_row = document.createElement("tr");
    columns.forEach((column) => {
        head_row.appendChild(createTableHeader(column));
    });
    table_head.appendChild(head_row);
    return table_head;
}

/**
 * Creates a Table Header with text
 * @param {String} text 
 * @returns {HTMLTableHeaderCellElement}
 */
function createTableHeader(text) {
    let head = document.createElement("th");
    head.setAttribute("scope", "col");
    head.innerHTML = text;
    return head;
}

/**
 * Creates a Button for a modal.
 * @param {String} modalid The modal id
 * @param {String} button_text The text that the button has
 * @returns {HTMLButtonElement} A Button which triggers the modal with id "modalid" and has text "button_text".
 */
function createModalButton(modalid, button_text) {
    let button = document.createElement("button");
    button.className = "btn btn-link";
    button.type = "button";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", modalid);
    button.innerHTML = button_text;
    return button;
}

/**
 * Create a Modal header
 * @param {String} title The title of the modal
 * @returns {HTMLDivElement} A Div of the modal header.
 */
function createModalHeader(title) {
    let modal_header = document.createElement("div");
    modal_header.className = "modal-header";

    let modal_title = document.createElement("h5");
    modal_title.className = "modal-title text-light";
    modal_title.innerHTML = title;

    let close_title = document.createElement("button");
    close_title.type = "button";
    close_title.className = "close";
    close_title.setAttribute("data-dismiss", "modal");
    close_title.setAttribute("aria-label", "Close");

    let close_span = document.createElement("span");
    close_span.setAttribute("aria-hidden", "true");
    close_span.innerHTML = "&times;";
    close_title.appendChild(close_span);

    modal_header.appendChild(modal_title);
    modal_header.appendChild(close_title);
    return modal_header;
}

/**
 * Create a Modal footer
 * @param {String} button_text 
 * @param {URL} button_url 
 * @returns {HTMLDivElement} A Div of the modal footer
 */
function createModalFooter(button_text, button_url) {
    let modal_footer = document.createElement("div");
    modal_footer.className = "modal-footer";

    let close_footer = document.createElement("button");
    close_footer.type = "button";
    close_footer.className = "btn btn-secondary";
    close_footer.setAttribute("data-dismiss", "modal");
    close_footer.innerHTML = "Close";
    modal_footer.appendChild(close_footer);

    let visit_profile = document.createElement("button");
    visit_profile.type = "button";
    visit_profile.className = "btn btn-primary";
    visit_profile.setAttribute("onclick", "location.href = '" + button_url + "';");
    visit_profile.innerHTML = button_text;
    modal_footer.appendChild(visit_profile);
    return modal_footer;
}

/**
 * Adds a row to the table section with the columns specified
 * @param {String[]} columns Text for each column
 */
HTMLTableSectionElement.prototype.addRow = function (columns) {
    let row = document.createElement("tr");
    columns.forEach((column) => {
        let dataColumn = document.createElement("td");
        if (column instanceof HTMLElement) {
            dataColumn.appendChild(column);
        } else {
            dataColumn.innerHTML = column;
        }
        row.appendChild(dataColumn);
    });
    this.appendChild(row);
}