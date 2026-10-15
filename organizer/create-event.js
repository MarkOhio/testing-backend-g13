var editId = 0;
if (window.location.search.indexOf("edit=") != -1) {
    editId = Number(window.location.search.split("edit=")[1].split("&")[0]);
}

var tabButtons = document.querySelectorAll("#mTabs button");
var tabIds = ["tabDetails", "tabStaff", "tabTicket"];

function showTab(id) {
    for (var i = 0; i < tabButtons.length; i++) {
        var tabId = tabButtons[i].getAttribute("data-tab");
        if (tabId == id) {
            tabButtons[i].classList.add("active");
            document.getElementById(tabId).classList.add("show");
        } else {
            tabButtons[i].classList.remove("active");
            document.getElementById(tabId).classList.remove("show");
        }
    }
    window.scrollTo(0, 0);
}

for (var t = 0; t < tabButtons.length; t++) {
    tabButtons[t].addEventListener("click", function () {
        showTab(this.getAttribute("data-tab"));
    });
}

document.getElementById("next1").addEventListener("click", function () {
    if (editId != 0) {
        alert("This is supposed to save the changes. It will call the backend later.");
        return;
    }
    showTab("tabStaff");
});

document.getElementById("next2").addEventListener("click", function () {
    showTab("tabTicket");
});

var addedStaff = [];

function showStaffList() {
    var text = document.getElementById("mStaffSearch").value.toLowerCase();
    var html = "";
    for (var i = 0; i < backend.staffCandidates.length; i++) {
        var p = backend.staffCandidates[i];
        if (p.name.toLowerCase().indexOf(text) == -1) {
            continue;
        }
        var button = '<button class="btn btn-small" type="button" onclick="addStaffToEvent(' + i + ')">+ Add Staff</button>';
        if (addedStaff.indexOf(i) != -1) {
            button = '<button class="btn btn-small btn-outline" type="button" onclick="addStaffToEvent(' + i + ')">Added</button>';
        }
        html += '<div class="staff-card"><div class="staff-left"><div class="avatar">' + userSvg + '</div><div><p class="staff-name">' + p.name + '</p><p class="staff-sub">Active</p></div></div>' + button + '</div>';
    }
    document.getElementById("mStaffList").innerHTML = html;
}

function addStaffToEvent(index) {
    var place = addedStaff.indexOf(index);
    if (place == -1) {
        addedStaff.push(index);
    } else {
        addedStaff.splice(place, 1);
    }
    showStaffList();
}

document.getElementById("mStaffSearch").addEventListener("input", showStaffList);
showStaffList();

var staffSelect = document.getElementById("dStaff");
for (var s = 0; s < backend.staff.length; s++) {
    var option = document.createElement("option");
    option.innerHTML = backend.staff[s].name;
    staffSelect.appendChild(option);
}

var imageFile = document.getElementById("imageFile");
var imageButtons = document.querySelectorAll(".imageBtn");
for (var b = 0; b < imageButtons.length; b++) {
    imageButtons[b].addEventListener("click", function () {
        imageFile.click();
    });
}
imageFile.addEventListener("change", function () {
    if (imageFile.files.length > 0) {
        var messages = document.querySelectorAll(".imageMsg");
        for (var m = 0; m < messages.length; m++) {
            messages[m].innerHTML = imageFile.files[0].name;
        }
    }
});

var codesFile = document.getElementById("codesFile");
var codesButtons = document.querySelectorAll(".codesBtn");
for (var c = 0; c < codesButtons.length; c++) {
    codesButtons[c].addEventListener("click", function () {
        codesFile.click();
    });
}
codesFile.addEventListener("change", function () {
    if (codesFile.files.length > 0) {
        document.querySelector(".codesMsg").innerHTML = codesFile.files[0].name + " selected";
    }
});

var createButtons = document.querySelectorAll(".createBtn");
async function createEventWithBackend() {
    var token = localStorage.getItem("authToken");
    var organizerId = localStorage.getItem("authUserId");
    var name = (document.getElementById("dEventTitle").value || document.getElementById("mName").value).trim();
    var date = document.getElementById("mDate").value.trim();
    var startAt = document.getElementById("mTime").value.trim();
    var venue = (document.getElementById("dVenue").value || document.getElementById("mLocation").value).trim();
    var description = (document.getElementById("dDescription").value || document.getElementById("mAbout").value).trim();
    var imageFile = document.getElementById("imageFile");
    var codesFile = document.getElementById("codesFile");
    if (!token || !organizerId) {
        alert("Please sign in again before creating an event.");
        window.location.href = "login.html";
        return;
    }
    if (!name || !date || !startAt || !venue || !description) {
        alert("Please complete the event name, date, time, location, and description.");
        return;
    }
    if (!imageFile.files || !imageFile.files[0]) {
        alert("The backend requires an event image. Please choose an image before creating the event.");
        return;
    }
    var form = new FormData();
    form.append("name", name);
    form.append("description", description);
    form.append("date", date);
    form.append("startAt", startAt);
    form.append("venue", venue);
    form.append("status", "upcoming");
    form.append("organizer_id", organizerId);
    form.append("image", imageFile.files[0]);
    try {
        for (var i = 0; i < createButtons.length; i++) createButtons[i].disabled = true;
        var result = await apiRequest("/events", { method: "POST", body: form });
        var created = result.event || result.data || result;
        var eventId = created._id || created.id;
        if (eventId) localStorage.setItem("lastCreatedEventId", eventId);
        if (codesFile.files && codesFile.files[0] && eventId) {
            var ticketForm = new FormData();
            ticketForm.append("ticket", codesFile.files[0]);
            await apiRequest("/events/" + eventId + "/codes", { method: "POST", body: ticketForm });
        }
        alert("Event created successfully.");
        window.location.href = "events.html";
    } catch (error) {
        alert(error.message);
    } finally {
        for (var j = 0; j < createButtons.length; j++) createButtons[j].disabled = false;
    }
}
for (var k = 0; k < createButtons.length; k++) {
    createButtons[k].addEventListener("click", createEventWithBackend);
}

var link = document.getElementById("eventLink");
var linkSwitch = document.getElementById("linkSwitch");
linkSwitch.addEventListener("click", function () {
    if (linkSwitch.className.indexOf("off") == -1) {
        linkSwitch.classList.add("off");
        link.readOnly = false;
        link.value = "";
        link.placeholder = "Type your own link";
    } else {
        linkSwitch.classList.remove("off");
        link.readOnly = true;
        link.value = "https://eventify.com/e/tech-creators-";
    }
});
link.readOnly = true;

document.getElementById("copyLink").addEventListener("click", function () {
    link.select();
    if (navigator.clipboard) {
        navigator.clipboard.writeText(link.value);
    }
    alert("Link copied");
});

var shareButtons = document.querySelectorAll(".shareBtn");
for (var h = 0; h < shareButtons.length; h++) {
    shareButtons[h].addEventListener("click", function () {
        alert("Sharing by " + this.innerHTML + " is not connected yet.");
    });
}

if (editId != 0) {
    var ev = getEventById(editId);
    document.getElementById("mTitle").innerHTML = "Edit Details";
    document.getElementById("dTitle").innerHTML = "Edit Details";
    document.getElementById("mName").value = ev.name;
    document.getElementById("mDate").value = ev.dateInput;
    document.getElementById("mTime").value = ev.timeInput;
    document.getElementById("mLocation").value = ev.location;
    document.getElementById("mAbout").value = "Tell us about your event";
    document.getElementById("next1").innerHTML = "Done";
    document.getElementById("mCreate").innerHTML = "Done";
    document.getElementById("dCreate").innerHTML = "Done";
    document.getElementById("dEventTitle").value = ev.name;
    document.getElementById("dVenue").value = ev.location;
    document.getElementById("dDescription").value = ev.about;
}
