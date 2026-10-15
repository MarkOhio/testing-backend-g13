function showStaff() {
    var cards = "";
    var rows = "";
    for (var i = 0; i < backend.staff.length; i++) {
        var p = backend.staff[i];
        cards += '<div class="staff-card"><div class="staff-left"><div class="avatar">' + userSvg + '</div><div><p class="staff-name">' + p.name + '</p><p class="staff-sub">Event Staff . ' + (i + 1) + '</p></div></div><span class="active-pill">' + p.status + '</span></div>';
        rows += "<tr><td>" + p.name + "</td><td>" + p.email + "</td><td>" + p.role + "</td><td>" + p.events + "</td><td><span class='pill pill-ok'>" + p.status + "</span></td><td>" + p.gate + "</td></tr>";
    }
    document.getElementById("mStaff").innerHTML = cards;
    document.getElementById("staffBody").innerHTML = rows;
}

function showCandidates() {
    var text = document.getElementById("staffSearch").value.toLowerCase();
    var html = "";
    for (var i = 0; i < backend.staffCandidates.length; i++) {
        var c = backend.staffCandidates[i];
        if (c.name.toLowerCase().indexOf(text) == -1) {
            continue;
        }
        html += '<div class="staff-card"><div class="staff-left"><div class="avatar">' + userSvg + '</div><div><p class="staff-name">' + c.name + '</p><p class="staff-sub">Active</p></div></div><button class="btn btn-small" type="button" onclick="addStaff(' + i + ')">+ Add Staff</button></div>';
    }
    if (html == "") {
        html = '<p class="sub">No one found.</p>';
    }
    document.getElementById("candidateList").innerHTML = html;
}

function addStaff(index) {
    var c = backend.staffCandidates[index];
    backend.staff.push({ name: c.name, email: c.email, role: c.role, events: 1, status: "Active", gate: "Gate 1" });
    backend.staffCandidates.splice(index, 1);
    showStaff();
    showCandidates();
    alert(c.name + " has been added as staff.");
}

showStaff();

var openButtons = document.querySelectorAll(".openAdd");
for (var o = 0; o < openButtons.length; o++) {
    openButtons[o].addEventListener("click", function () {
        document.getElementById("staffView").classList.add("hidden");
        document.getElementById("addView").classList.remove("hidden");
        showCandidates();
    });
}

document.getElementById("closeAdd").addEventListener("click", function () {
    document.getElementById("addView").classList.add("hidden");
    document.getElementById("staffView").classList.remove("hidden");
});

document.getElementById("staffSearch").addEventListener("input", showCandidates);
