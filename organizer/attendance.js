async function loadAttendanceFromBackend() {
    var eventId = new URLSearchParams(window.location.search).get("id") || localStorage.getItem("lastCreatedEventId");
    if (!eventId) {
        var message = "Choose an event first. Open attendance from an event or create an event.";
        document.getElementById("mLiveList").textContent = message;
        document.getElementById("liveBody").innerHTML = "<tr><td colspan='5'>" + message + "</td></tr>";
        document.getElementById("mHistList").textContent = message;
        document.getElementById("histBody").innerHTML = "<tr><td colspan='5'>" + message + "</td></tr>";
        return;
    }
    try {
        var result = await apiRequest("/scans/events/" + eventId + "/attendance");
        var data = result.data || result;
        var total = Number(data.totalTickets || 0);
        var checked = Number(data.checkedIn || 0);
        var percent = Number(data.attendanceRate || 0);
        document.getElementById("mCount").textContent = checked;
        document.getElementById("mPercent").textContent = percent + "% of total attendees";
        document.getElementById("mDonut").style.background = "conic-gradient(#5B4BDB 0 " + percent + "%, #E0E0E3 " + percent + "% 100%)";
        document.getElementById("dTotal").textContent = total;
        document.getElementById("dChecked").textContent = checked;
        document.getElementById("dRemaining").textContent = Number(data.notYetCheckedIn || Math.max(total - checked, 0));
        var recent = data.recentScans || [];
        var filter = document.getElementById("liveSearch").value.toLowerCase();
        var cards = "", rows = "";
        recent.forEach(function (scan) {
            var code = scan.ticketCode || "—";
            var resultText = scan.result || "unknown";
            if ((code + " " + resultText + " " + (scan.gate || "")).toLowerCase().indexOf(filter) === -1) return;
            var time = scan.time ? new Date(scan.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
            var status = resultText === "valid" ? "Checked in" : resultText;
            cards += '<div class="live-row"><div class="staff-left"><div class="avatar">' + userSvg + '</div><div><p class="staff-name">' + code + '</p><p class="staff-sub">' + status + '</p></div></div><span class="time-pill">' + time + '</span></div>';
            rows += "<tr><td>—</td><td>" + code + "</td><td>" + time + "</td><td>" + status + "</td><td>" + (scan.gate || "—") + "</td></tr>";
        });
        document.getElementById("mLiveList").innerHTML = cards || '<p class="muted">No scans recorded yet.</p>';
        document.getElementById("liveBody").innerHTML = rows || "<tr><td colspan='5'>No scans recorded yet.</td></tr>";
        document.getElementById("mHistDate").textContent = (data.event && data.event.date) || "";
        document.getElementById("dHistDate").textContent = (data.event && data.event.date) || "";
        document.getElementById("mHistList").innerHTML = cards || '<p class="muted">No scan history yet.</p>';
        document.getElementById("histBody").innerHTML = rows || "<tr><td colspan='5'>No scan history yet.</td></tr>";
    } catch (error) {
        document.getElementById("mLiveList").textContent = error.message;
        document.getElementById("liveBody").innerHTML = "<tr><td colspan='5'>" + error.message + "</td></tr>";
    }
}
function showLive() { loadAttendanceFromBackend(); }
function showHistory() { loadAttendanceFromBackend(); }

function showView(view) {
    var viewButtons = document.querySelectorAll("[data-view]");
    for (var i = 0; i < viewButtons.length; i++) {
        if (viewButtons[i].getAttribute("data-view") == view) {
            viewButtons[i].classList.add("active");
        } else {
            viewButtons[i].classList.remove("active");
        }
    }
    if (view == "live") {
        document.getElementById("mLive").classList.remove("hidden");
        document.getElementById("mHistory").classList.add("hidden");
        document.getElementById("dLive").classList.remove("hidden");
        document.getElementById("dHistory").classList.add("hidden");
        document.getElementById("liveActions").classList.remove("hidden");
        document.getElementById("historyActions").classList.add("hidden");
        document.getElementById("dTitle").innerHTML = "Live Attendance";
        document.getElementById("dSub").innerHTML = "Track and monitor who’s currently at your event in real time.";
    } else {
        document.getElementById("mLive").classList.add("hidden");
        document.getElementById("mHistory").classList.remove("hidden");
        document.getElementById("dLive").classList.add("hidden");
        document.getElementById("dHistory").classList.remove("hidden");
        document.getElementById("liveActions").classList.add("hidden");
        document.getElementById("historyActions").classList.remove("hidden");
        document.getElementById("dTitle").innerHTML = "Attendance History";
        document.getElementById("dSub").innerHTML = "Everyone who has scanned in so far.";
    }
    window.scrollTo(0, 0);
}

var viewButtons2 = document.querySelectorAll("[data-view]");
for (var v = 0; v < viewButtons2.length; v++) {
    viewButtons2[v].addEventListener("click", function () {
        showView(this.getAttribute("data-view"));
    });
}

document.getElementById("histBack").addEventListener("click", function () {
    showView("live");
});

document.getElementById("liveSearch").addEventListener("input", showLive);

document.getElementById("filterBtn").addEventListener("click", function () {
    alert("Filter options are not connected yet.");
});

document.getElementById("refreshBtn").addEventListener("click", function () {
    loadAttendanceFromBackend();
});

var exportButtons = document.querySelectorAll(".exportBtn");
for (var x = 0; x < exportButtons.length; x++) {
    exportButtons[x].addEventListener("click", function () {
        var text = "Name,Ticket,Time,Status,Gate\n";
        var rows = document.querySelectorAll("#histBody tr");
        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].querySelectorAll("td");
            if (cells.length === 5) {
                text += Array.from(cells).map(function (cell) { return '"' + cell.textContent.replace(/"/g, '""') + '"'; }).join(",") + "\n";
            }
        }
        downloadCsv("attendance-history.csv", text);
    });
}

showLive();
showHistory();
if (window.location.hash == "#history") {
    showView("history");
}
