function addPlayerToTable(placement, name, score, placements) {
    let node = document.createElement("tr");
    let placeNode = document.createElement("td");
    node.appendChild(placeNode);
    let nameNode = document.createElement("td");
    node.appendChild(nameNode);
    let scoreNode = document.createElement("td");
    node.appendChild(scoreNode);

    placeNode.innerHTML = placement;

    let button = document.createElement("button");
    button.className = "btn btn-link";
    button.type = "button";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#player-modal-" + name);
    button.innerHTML = name;

    let modal_header = document.createElement("div");
    modal_header.className = "modal-header";

    let modal_title = document.createElement("h5");
    modal_title.className = "modal-title text-light";
    modal_title.innerHTML = name;
    modal_header.appendChild(modal_title);

    let close_title = document.createElement("button");
    close_title.type = "button";
    close_title.className = "close";
    close_title.setAttribute("data-dismiss", "modal");
    close_title.setAttribute("aria-label", "Close");

    let close_span = document.createElement("span");
    close_span.setAttribute("aria-hidden", "true");
    close_span.innerHTML = "&times;";
    close_title.appendChild(close_span);

    modal_title.appendChild(close_title);

    let modal_body = document.createElement("div");
    modal_body.className = "modal-body";

    let level_table = document.createElement("table");
    level_table.className = "table table-striped table-dark";
    
    let table_head = document.createElement("thead");
    
    let head_row = document.createElement("tr");

    let head1 = document.createElement("th");
    head1.setAttribute("scope", "col");
    head1.innerHTML = "#";
    head_row.appendChild(head1);

    let head2 = document.createElement("th");
    head2.setAttribute("scope", "col");
    head2.innerHTML = "Level";
    head_row.appendChild(head2);

    let head3 = document.createElement("th");
    head3.setAttribute("scope", "col");
    head3.innerHTML = "Score";
    head_row.appendChild(head3);

    table_head.appendChild(head_row);

    level_table.appendChild(table_head);

    let table_body = document.createElement("tbody");

    placements.sort((a, b) => {
        let scoringMethod = getScoringMethod();
        return scoringMethod(b) - scoringMethod(a);
    });

    placements.forEach( (placement) => {
        let row = document.createElement("tr");

        let place = document.createElement("td");
        place.innerHTML = placement["place"];

        let level = document.createElement("td");
        level.innerHTML = placement["level_name"];

        let score = document.createElement("td");
        let scoringMethod = getScoringMethod();
        score.innerHTML = scoringMethod(placement);

        row.appendChild(place);
        row.appendChild(level);
        row.appendChild(score);
        table_body.appendChild(row);
    });

    level_table.appendChild(table_body);

    modal_body.appendChild(level_table);
    
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
    visit_profile.setAttribute("onclick", "location.href = '" + "https://www.speedrun.com/user/" + name + "';");
    visit_profile.innerHTML = "Visit Profile";
    modal_footer.appendChild(visit_profile);

    let main = document.createElement("div");
    main.className = "modal fade";
    main.id = "player-modal-" + name;
    main.setAttribute("tabindex", "-1");
    main.setAttribute("role", "modal");
    main.setAttribute("aria-labelledby", "Large-Modal-" + name);
    main.setAttribute("aria-hidden", "true");

    let dialog = document.createElement("div");
    dialog.className = "modal-dialog modal-lg";
    
    let modal_content = document.createElement("div");
    modal_content.className = "modal-content bg-dark";

    modal_content.appendChild(modal_title);
    modal_content.appendChild(modal_body);
    modal_content.appendChild(modal_footer);

    dialog.appendChild(modal_content);

    main.appendChild(dialog);


    document.getElementById("body").appendChild(main);
    nameNode.appendChild(button);
    scoreNode.innerHTML = score;

    document.getElementById("playersTable").appendChild(node);
    console.log("added player")
}