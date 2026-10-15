var selected = getSelectedEvent();
var filter = "All";

if (selected) {
    document.getElementById("histEvent").innerHTML = selected.name;
}

function pillClass(state) {
    if (state == "Confirmed") {
        return "pill pill-ok";
    }
    if (state == "Duplicate") {
        return "pill pill-warn";
    }
    return "pill pill-bad";
}

function render() {
    var list = getCheckIns();
    var mobile = "";
    var rows = "";
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (selected && c.eventId != selected.id) {
            continue;
        }
        if (filter != "All" && c.status != filter) {
            continue;
        }
        mobile += '<div class="ci-row"><div class="avatar">' + userSvg + '</div><div class="who"><b>' + c.name + '</b><small>' + c.time + '</small></div><span class="' + pillClass(c.status) + '">' + c.status + '</span></div>';
        rows += "<tr><td>" + c.time + "</td><td>" + c.name + "</td><td>" + c.code + "</td><td><span class='" + pillClass(c.status) + "'>" + c.status + "</span></td><td>" + c.gate + "</td></tr>";
    }
    if (mobile == "") {
        mobile = '<div class="empty-box">No check-ins found.</div>';
    }
    document.getElementById("mHistory").innerHTML = mobile;
    document.getElementById("hBody").innerHTML = rows;
}

function setFilter(value) {
    filter = value;
    document.getElementById("statusFilter").value = value;
    document.getElementById("deskFilter").value = value;
    render();
}

document.getElementById("statusFilter").addEventListener("change", function () {
    setFilter(this.value);
});

document.getElementById("deskFilter").addEventListener("change", function () {
    setFilter(this.value);
});

document.getElementById("allChip").addEventListener("click", function () {
    setFilter("All");
});

render();
