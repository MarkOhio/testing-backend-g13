function showCodes() {
    var html = "";
    for (var i = 0; i < backend.ticketCodes.length; i++) {
        html += ticketCardHtml(backend.ticketCodes[i]);
    }
    document.getElementById("codesList").innerHTML = html;
}

function showTickets() {
    var rows = "";
    for (var i = 0; i < backend.ticketTypes.length; i++) {
        var t = backend.ticketTypes[i];
        rows += "<tr><td>" + t.name + "</td><td>" + t.price + "</td><td>" + t.sold + "</td><td>" + t.available + "</td><td><span class='pill pill-ok'>" + t.status + "</span></td><td>" + t.gate + "</td></tr>";
    }
    document.getElementById("ticketsBody").innerHTML = rows;

    var promo = "";
    for (var j = 0; j < backend.promoCodes.length; j++) {
        var p = backend.promoCodes[j];
        var cls = "pill pill-ok";
        if (p.status != "Active") {
            cls = "pill pill-bad";
        }
        promo += "<tr><td>" + p.code + "</td><td>" + p.discount + "</td><td>" + p.used + "</td><td><span class='" + cls + "'>" + p.status + "</span></td></tr>";
    }
    document.getElementById("promoBody").innerHTML = promo;
}

showCodes();
showTickets();

var codesFile = document.getElementById("codesFile");
document.getElementById("chooseFile").addEventListener("click", function () {
    codesFile.click();
});

codesFile.addEventListener("change", async function () {
    if (!codesFile.files.length) return;
    var eventId = new URLSearchParams(window.location.search).get("id") || localStorage.getItem("lastCreatedEventId");
    if (!eventId) {
        document.getElementById("fileMsg").textContent = "Create or select an event before uploading ticket codes.";
        return;
    }
    var form = new FormData();
    form.append("ticket", codesFile.files[0]);
    document.getElementById("fileMsg").textContent = "Uploading ticket file...";
    try {
        var result = await apiRequest("/events/" + eventId + "/codes", { method: "POST", body: form });
        document.getElementById("fileMsg").textContent = result.message || "Ticket file uploaded.";
        await loadTicketCodes(eventId);
    } catch (error) {
        document.getElementById("fileMsg").textContent = error.message;
    }
});

async function loadTicketCodes(eventId) {
    try {
        var result = await apiRequest("/events/" + eventId + "/codes");
        var codes = result.tickets || result.data || result.codes || [];
        if (!Array.isArray(codes)) codes = [];
        if (codes.length) {
            backend.ticketCodes = codes.map(function (item, index) {
                return {
                    batch: item.code_string || item.code || item.ticketCode || ("Ticket " + (index + 1)),
                    tickets: 1,
                    status: item.status || "Active",
                    eventId: eventId
                };
            });
            showCodes();
        }
    } catch (error) {
        document.getElementById("fileMsg").textContent = error.message;
    }
}
var currentEventId = new URLSearchParams(window.location.search).get("id") || localStorage.getItem("lastCreatedEventId");
if (currentEventId) loadTicketCodes(currentEventId);

document.getElementById("viewCodes").addEventListener("click", function () {
    document.getElementById("uploadedTitle").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("addCategory").addEventListener("click", function () {
    alert("Adding a ticket category is not connected yet.");
});

document.getElementById("shareLink").addEventListener("click", function () {
    alert("Share link is not connected yet.");
});

var ticketTabs = document.querySelectorAll("#ticketTabs button");
for (var t = 0; t < ticketTabs.length; t++) {
    ticketTabs[t].addEventListener("click", function () {
        for (var x = 0; x < ticketTabs.length; x++) {
            ticketTabs[x].classList.remove("active");
            document.getElementById(ticketTabs[x].getAttribute("data-t")).classList.add("hidden");
        }
        this.classList.add("active");
        document.getElementById(this.getAttribute("data-t")).classList.remove("hidden");
    });
}
