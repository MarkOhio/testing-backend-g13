var registeredStaff = [];
var staffEvents = [];

function staffDisplayName(person) {
    return [person.firstName, person.lastName].filter(Boolean).join(" ") || person.name || person.email || "Unnamed staff";
}

function staffId(person) {
    return String(person._id || person.id || "");
}

function staffMatches(person, query) {
    var text = (staffDisplayName(person) + " " + (person.email || "")).toLowerCase();
    return text.indexOf(query) !== -1;
}

function countAssignedEvents(id) {
    return staffEvents.filter(function (event) {
        return Array.isArray(event.staff) && event.staff.some(function (assigned) {
            return String(assigned && (assigned._id || assigned.id) || assigned) === id;
        });
    }).length;
}

function showStaff() {
    var query = "";
    document.querySelectorAll("#staffMainSearch").forEach(function (input) { if (input.offsetParent !== null) query = (input.value || "").trim().toLowerCase(); });
    var cards = "";
    var rows = "";
    registeredStaff.filter(function (person) { return staffMatches(person, query); }).forEach(function (person) {
        var name = staffDisplayName(person);
        var id = staffId(person);
        var eventCount = countAssignedEvents(id);
        var email = person.email || "—";
        cards += '<div class="staff-card"><div class="staff-left"><div class="avatar">' + userSvg + '</div><div><p class="staff-name">' + escapeStaffText(name) + '</p><p class="staff-sub">' + escapeStaffText(email) + '</p></div></div><span class="active-pill">Registered</span></div>';
        rows += "<tr><td>" + escapeStaffText(name) + "</td><td>" + escapeStaffText(email) + "</td><td>Staff</td><td>" + eventCount + "</td><td><span class='pill pill-ok'>Registered</span></td><td>—</td></tr>";
    });
    var empty = registeredStaff.length ? "No staff match your search." : "No registered staff accounts were returned by the backend.";
    document.getElementById("mStaff").innerHTML = cards || '<p class="sub">' + empty + '</p>';
    document.getElementById("staffBody").innerHTML = rows || '<tr><td colspan="6">' + empty + '</td></tr>';
}

function escapeStaffText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
}

async function loadStaff() {
    document.getElementById("mStaff").textContent = "Loading registered staff…";
    document.getElementById("staffBody").innerHTML = '<tr><td colspan="6">Loading registered staff…</td></tr>';
    try {
        var results = await Promise.all([apiRequest("/auth/staffs"), fetchApiEvents()]);
        var response = results[0];
        registeredStaff = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : []);
        staffEvents = Array.isArray(backend.events) ? backend.events : [];
        showStaff();
    } catch (error) {
        document.getElementById("mStaff").textContent = error.message;
        document.getElementById("staffBody").innerHTML = '<tr><td colspan="6">' + escapeStaffText(error.message) + '</td></tr>';
    }
}

function showAddStaffInfo() {
    document.getElementById("staffView").classList.add("hidden");
    document.getElementById("addView").classList.remove("hidden");
    document.getElementById("candidateList").innerHTML = '<p class="sub">Staff accounts are created through staff registration. This page can list registered accounts, but the backend does not provide an endpoint to create or invite staff from here.</p>';
}

var openButtons = document.querySelectorAll(".openAdd");
for (var i = 0; i < openButtons.length; i++) openButtons[i].addEventListener("click", showAddStaffInfo);
document.getElementById("closeAdd").addEventListener("click", function () {
    document.getElementById("addView").classList.add("hidden");
    document.getElementById("staffView").classList.remove("hidden");
});
document.querySelectorAll("#staffMainSearch").forEach(function (input) { input.addEventListener("input", function () { document.querySelectorAll("#staffMainSearch").forEach(function (other) { if (other !== input) other.value = input.value; }); showStaff(); }); });
document.getElementById("staffSearch").addEventListener("input", function () {});
loadStaff();
