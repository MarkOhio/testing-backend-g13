var selected = null;
var filter = "All";
var historyList = [];

function pillClass(state) {
    if (state === "Confirmed") return "pill pill-ok";
    if (state === "Duplicate") return "pill pill-warn";
    return "pill pill-bad";
}

function escapeHistoryText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
}

function normalizeHistoryScan(scan) {
    var attendee = scan.attendee || scan.guest || {};
    var name = attendee.fullName || attendee.name || [attendee.firstName, attendee.lastName].filter(Boolean).join(" ").trim() || scan.attendeeName || scan.guestName;
    var result = String(scan.result || scan.status || scan.scan_result || "").toLowerCase();
    var status = result === "valid" || result === "confirmed" ? "Confirmed" : result === "duplicate" ? "Duplicate" : "Declined";
    var rawTime = scan.time || scan.checkedInAt || scan.createdAt || scan.firstCheckedInAt;
    var parsedTime = rawTime ? new Date(rawTime) : null;
    var time = parsedTime && !Number.isNaN(parsedTime.getTime()) ? parsedTime.toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : (rawTime || "—");
    return {
        eventId: scan.eventId || scan.event_id || (selected && selected.id),
        time: time,
        name: name || "Ticket holder",
        code: scan.ticketCode || scan.code || scan.code_string || "—",
        status: status
    };
}

function demoHistory() {
    return backend.checkIns.map(function (scan) {
        return {
            eventId: selected ? selected.id : scan.eventId,
            time: scan.time,
            name: scan.name,
            code: scan.code,
            status: scan.status,
            gate: scan.gate
        };
    });
}

function render() {
    var list = historyList.filter(function (item) {
        return (!selected || String(item.eventId) === String(selected.id)) && (filter === "All" || item.status === filter);
    });
    var mobile = "";
    var rows = "";
    list.forEach(function (item) {
        mobile += '<div class="ci-row"><div class="avatar">' + userSvg + '</div><div class="who"><b>' + escapeHistoryText(item.name) + '</b><small>' + escapeHistoryText(item.time) + ' · ' + escapeHistoryText(item.code) + '</small></div><span class="' + pillClass(item.status) + '">' + escapeHistoryText(item.status) + '</span></div>';
        rows += '<tr><td>' + escapeHistoryText(item.time) + '</td><td>' + escapeHistoryText(item.name) + '</td><td>' + escapeHistoryText(item.code) + '</td><td><span class="' + pillClass(item.status) + '">' + escapeHistoryText(item.status) + '</span></td></tr>';
    });
    if (!list.length) {
        mobile = '<div class="empty-box">No check-ins found.</div>';
        rows = '<tr><td colspan="4">No check-ins found.</td></tr>';
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

document.getElementById("statusFilter").addEventListener("change", function () { setFilter(this.value); });
document.getElementById("deskFilter").addEventListener("change", function () { setFilter(this.value); });
document.getElementById("allChip").addEventListener("click", function () { setFilter("All"); });

async function loadCheckInHistory() {
    try {
        await fetchStaffEvents();
        selected = getSelectedEvent();
        if (selected) document.getElementById("histEvent").textContent = selected.name;
        if (!selected) {
            historyList = [];
            render();
            return;
        }

        try {
            var result = await apiRequest("/scans/events/" + encodeURIComponent(selected.id) + "/staff-attendance");
            var data = result.data || result;
            var scans = Array.isArray(data.recentScans) ? data.recentScans : [];
            historyList = scans.map(normalizeHistoryScan);
        } catch (error) {
            var local = getCheckIns().filter(function (item) { return String(item.eventId) === String(selected.id); });
            if (local.length) {
                historyList = local.map(normalizeHistoryScan);
            } else {
                historyList = demoHistory().map(normalizeHistoryScan);
            }
        }
        render();
    } catch (error) {
        selected = getSelectedEvent();
        if (selected) document.getElementById("histEvent").textContent = selected.name;
        var localFallback = getCheckIns();
        historyList = localFallback.length ? localFallback.map(normalizeHistoryScan) : demoHistory().map(normalizeHistoryScan);
        render();
    }
}

loadCheckInHistory();
