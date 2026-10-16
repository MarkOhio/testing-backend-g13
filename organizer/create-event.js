var editId = 0;
if (window.location.search.indexOf("edit=") !== -1) {
    editId = window.location.search.split("edit=")[1].split("&")[0];
}

var tabButtons = document.querySelectorAll("#mTabs button");
function showTab(id) {
    for (var i = 0; i < tabButtons.length; i++) {
        var tabId = tabButtons[i].getAttribute("data-tab");
        if (tabId === id) {
            tabButtons[i].classList.add("active");
            document.getElementById(tabId).classList.add("show");
        } else {
            tabButtons[i].classList.remove("active");
            document.getElementById(tabId).classList.remove("show");
        }
    }
    window.scrollTo(0, 0);
}
for (var t = 0; t < tabButtons.length; t++) tabButtons[t].addEventListener("click", function () { showTab(this.getAttribute("data-tab")); });
document.getElementById("next1").addEventListener("click", function () { showTab("tabStaff"); });
document.getElementById("next2").addEventListener("click", function () { showTab("tabTicket"); });

var registeredStaff = [];
var selectedStaffIds = [];
var staffSelect = document.getElementById("dStaff");
staffSelect.multiple = true;
staffSelect.size = 4;

function getStaffId(person) { return String(person._id || person.id || ""); }
function getStaffName(person) { return [person.firstName, person.lastName].filter(Boolean).join(" ") || person.name || person.email || "Unnamed staff"; }
function safeText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
}
function renderMobileStaff() {
    var query = (document.getElementById("mStaffSearch").value || "").trim().toLowerCase();
    var visible = registeredStaff.filter(function (person) {
        return (getStaffName(person) + " " + (person.email || "")).toLowerCase().indexOf(query) !== -1;
    });
    var html = "";
    visible.forEach(function (person) {
        var id = getStaffId(person);
        var chosen = selectedStaffIds.indexOf(id) !== -1;
        html += '<div class="staff-card"><div class="staff-left"><div class="avatar">' + userSvg + '</div><div><p class="staff-name">' + safeText(getStaffName(person)) + '</p><p class="staff-sub">' + safeText(person.email || "") + '</p></div></div><button class="btn btn-small ' + (chosen ? 'btn-outline' : '') + '" type="button" data-staff-id="' + safeText(id) + '">' + (chosen ? 'Selected' : '+ Add Staff') + '</button></div>';
    });
    document.getElementById("mStaffList").innerHTML = html || '<p class="sub">' + (registeredStaff.length ? 'No staff match your search.' : 'No registered staff accounts available.') + '</p>';
    document.querySelectorAll("#mStaffList [data-staff-id]").forEach(function (button) {
        button.addEventListener("click", function () { toggleStaff(this.getAttribute("data-staff-id")); });
    });
}
function syncDesktopStaff() {
    staffSelect.innerHTML = "";
    registeredStaff.forEach(function (person) {
        var id = getStaffId(person);
        var option = document.createElement("option");
        option.value = id;
        option.textContent = getStaffName(person) + (person.email ? " — " + person.email : "");
        option.selected = selectedStaffIds.indexOf(id) !== -1;
        staffSelect.appendChild(option);
    });
}
function toggleStaff(id) {
    if (!id) return;
    var index = selectedStaffIds.indexOf(id);
    if (index === -1) selectedStaffIds.push(id); else selectedStaffIds.splice(index, 1);
    syncDesktopStaff();
    renderMobileStaff();
}
staffSelect.addEventListener("change", function () {
    selectedStaffIds = Array.prototype.slice.call(staffSelect.selectedOptions).map(function (option) { return option.value; }).filter(Boolean);
    renderMobileStaff();
});
document.getElementById("mStaffSearch").addEventListener("input", renderMobileStaff);
async function loadRegisteredStaff() {
    document.getElementById("mStaffList").textContent = "Loading registered staff…";
    staffSelect.innerHTML = '<option disabled>Loading registered staff…</option>';
    try {
        var response = await apiRequest("/auth/staffs");
        registeredStaff = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : []);
        syncDesktopStaff();
        renderMobileStaff();
    } catch (error) {
        document.getElementById("mStaffList").textContent = error.message;
        staffSelect.innerHTML = '<option disabled>Could not load staff</option>';
    }
}
loadRegisteredStaff();

var imageFile = document.getElementById("imageFile");
var imageButtons = document.querySelectorAll(".imageBtn");
for (var b = 0; b < imageButtons.length; b++) imageButtons[b].addEventListener("click", function () { imageFile.click(); });
imageFile.addEventListener("change", function () {
    if (imageFile.files.length > 0) document.querySelectorAll(".imageMsg").forEach(function (node) { node.textContent = imageFile.files[0].name; });
});
var codesFile = document.getElementById("codesFile");
var codesButtons = document.querySelectorAll(".codesBtn");
for (var c = 0; c < codesButtons.length; c++) codesButtons[c].addEventListener("click", function () { codesFile.click(); });
codesFile.addEventListener("change", function () { if (codesFile.files.length > 0) document.querySelector(".codesMsg").textContent = codesFile.files[0].name + " selected"; });

var createButtons = document.querySelectorAll(".createBtn");
function getVisibleFieldValue(ids) {
    for (var i = 0; i < ids.length; i++) {
        var field = document.getElementById(ids[i]);
        if (field && field.getClientRects().length && field.offsetParent !== null) return String(field.value || "").trim();
    }
    for (var j = 0; j < ids.length; j++) {
        var fallback = document.getElementById(ids[j]);
        if (fallback && String(fallback.value || "").trim()) return String(fallback.value).trim();
    }
    return "";
}
async function createEventWithBackend() {
    if (editId) { alert("The current backend does not provide an event update endpoint. Existing events cannot be edited from this form."); return; }
    var token = localStorage.getItem("authToken");
    var organizerId = localStorage.getItem("authUserId");
    var name = getVisibleFieldValue(["mName", "dEventTitle"]);
    var date = getVisibleFieldValue(["mDate", "dStart"]);
    var startAt = getVisibleFieldValue(["mTime", "dStartTime"]);
    var venue = getVisibleFieldValue(["mLocation", "dVenue"]);
    var description = getVisibleFieldValue(["mAbout", "dDescription"]);
    if (!token || !organizerId) { alert("Please sign in again before creating an event."); window.location.href = "login.html"; return; }
    if (!name || !date || !startAt || !venue || !description) { alert("Please complete the event name, date, time, location, and description."); return; }
    if (!imageFile.files || !imageFile.files[0]) { alert("The backend requires an event image. Please choose an image before creating the event."); return; }
    var form = new FormData();
    form.append("name", name);
    form.append("description", description);
    form.append("date", date);
    form.append("startAt", startAt);
    form.append("venue", venue);
    form.append("status", "upcoming");
    form.append("organizer_id", organizerId);
    form.append("image", imageFile.files[0]);
    Array.from(new Set(selectedStaffIds)).forEach(function (id) { form.append("staff", id); });
    try {
        createButtons.forEach(function (button) { button.disabled = true; });
        var result = await apiRequest("/events", { method: "POST", body: form });
        var created = result.data || result.event || result;
        var eventId = created._id || created.id;
        if (eventId) localStorage.setItem("lastCreatedEventId", eventId);
        if (codesFile.files && codesFile.files[0] && eventId) {
            var ticketForm = new FormData();
            ticketForm.append("ticket", codesFile.files[0]);
            await apiRequest("/events/" + eventId + "/codes", { method: "POST", body: ticketForm });
        }
        alert("Event created successfully.");
        window.location.href = "events.html";
    } catch (error) { alert(error.message); }
    finally { createButtons.forEach(function (button) { button.disabled = false; }); }
}
createButtons.forEach(function (button) { button.addEventListener("click", createEventWithBackend); });

var link = document.getElementById("eventLink");
var linkSwitch = document.getElementById("linkSwitch");
linkSwitch.addEventListener("click", function () {
    if (linkSwitch.className.indexOf("off") === -1) { linkSwitch.classList.add("off"); link.readOnly = false; link.value = ""; link.placeholder = "Type your own link"; }
    else { linkSwitch.classList.remove("off"); link.readOnly = true; link.value = "https://eventify.com/e/tech-creators-"; }
});
link.readOnly = true;
document.getElementById("copyLink").addEventListener("click", function () { link.select(); if (navigator.clipboard) navigator.clipboard.writeText(link.value); alert("Link copied"); });
document.querySelectorAll(".shareBtn").forEach(function (button) { button.addEventListener("click", function () { alert("Sharing by " + this.innerHTML + " is not connected yet."); }); });

function downloadTicketCsvExample() {
    var content = "ticket_code,ticket_type\nREG-1234567,REG\nVIP-2345678,VIP\nVVIP-3456789,VVIP\n";
    var blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a"); link.href = url; link.download = "eventify-ticket-codes-example.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
}
