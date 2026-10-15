var logoSvg = '<img src="assets/logo2.png" alt="">';
var logoSvg2 = '<img src="assets/logo.png" alt="">';
var backSvg = '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 2 10l8 8"/></svg>';
var eyeSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
var pinSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
var calSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
var userSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="9" r="3.5"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/></svg>';
var uploadSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a5 5 0 0 1-.5-9.9A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9"/><path d="m12 12-3 3m3-3 3 3m-3-3v9"/></svg>';
var searchSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';

var navIcons = {
    dashboard: '<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>',
    events: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 15l2 2 4-4"/>',
    tickets: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
    staff: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c3 .2 5 2.3 5 5.8"/>',
    attendance: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M10 14a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.3M12 19v.1"/>',
    reports: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 17v-4M12 17V8M16 17v-6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'
};

var navItems = [
    { key: "dashboard", href: "dashboard.html", mobile: "Home", desktop: "Dashboard", mobileShow: true },
    { key: "events", href: "events.html", mobile: "Events", desktop: "Events", mobileShow: true },
    { key: "tickets", href: "ticket-codes.html", mobile: "Tickets", desktop: "Tickets & Codes", mobileShow: false },
    { key: "staff", href: "staff-management.html", mobile: "Staffs", desktop: "Staff Management", mobileShow: true },
    { key: "attendance", href: "attendance.html", mobile: "Attendance", desktop: "Attendance", mobileShow: true },
    { key: "reports", href: "reports.html", mobile: "Reports", desktop: "Reports", mobileShow: true },
    { key: "settings", href: "settings.html", mobile: "Settings", desktop: "Settings", mobileShow: false }
];

var pageName = document.body.getAttribute("data-page");

if (document.body.getAttribute("data-protected") == "yes") {
    if (localStorage.getItem("organizerLoggedIn") != "yes") {
        window.location.href = "login.html";
    }
}

function buildNav() {
    var navArea = document.getElementById("navArea");
    if (!navArea) {
        return;
    }
    var side = '<div class="sidebar"><div class="brand"><div class="logo-mark">' + logoSvg + '</div><span class="brand-name">Eventify</span></div>';
    var bottom = '<nav class="bottom-nav">';
    for (var i = 0; i < navItems.length; i++) {
        var n = navItems[i];
        var cls = "";
        if (n.key == pageName) {
            cls = " active";
        }
        side += '<a class="side-link' + cls + '" href="' + n.href + '"><svg viewBox="0 0 24 24">' + navIcons[n.key] + '</svg>' + n.desktop + '</a>';
        if (n.mobileShow) {
            bottom += '<a class="' + cls + '" href="' + n.href + '"><svg viewBox="0 0 24 24">' + navIcons[n.key] + '</svg>' + n.mobile + '</a>';
        }
    }
    side += '<div class="side-user"><div class="avatar">' + backend.organizer.initials + '</div><div><p>' + backend.organizer.fullName + '</p><small>' + backend.organizer.role + '</small></div></div></div>';
    bottom += '</nav>';
    navArea.innerHTML = side + bottom;
}

buildNav();

function getIdFromUrl() {
    var q = window.location.search;
    if (q.indexOf("id=") != -1) {
        return decodeURIComponent(q.split("id=")[1].split("&")[0]);
    }
    return 1;
}

function getEventById(id) {
    for (var i = 0; i < backend.events.length; i++) {
        if (String(backend.events[i].id) == String(id)) {
            return backend.events[i];
        }
    }
    return backend.events[0];
}

function heroCardHtml(ev) {
    var h = '<a class="hero-card" href="event-details.html?id=' + ev.id + '">';
    h += '<img src="' + ev.image + '" alt="">';
    h += '<div class="date-badge"><b>' + ev.day + '</b>' + ev.month + '</div>';
    h += '<div class="hero-info"><h3>' + ev.name + '</h3><p>' + pinSvg + ev.location + '</p></div></a>';
    return h;
}

function eventRowHtml(ev) {
    var h = '<a class="event-row" href="event-details.html?id=' + ev.id + '">';
    h += '<div class="thumb"><img src="' + ev.image + '" alt=""></div>';
    h += '<div class="info"><h3>' + ev.name + '</h3><p>' + ev.date + ' . ' + ev.time + '</p><p>' + ev.location + '</p></div>';
    h += '<span class="pill pill-main">' + ev.status + '</span></a>';
    return h;
}

function qrSvg(text) {
    var size = 25;
    var seed = 0;
    for (var i = 0; i < text.length; i++) {
        seed = (seed * 31 + text.charCodeAt(i)) % 1000003;
    }
    function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }
    function inFinder(x, y) {
        if (x < 8 && y < 8) { return true; }
        if (x > size - 9 && y < 8) { return true; }
        if (x < 8 && y > size - 9) { return true; }
        return false;
    }
    var rects = "";
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            if (inFinder(x, y)) {
                continue;
            }
            if (random() > 0.52) {
                rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
            }
        }
    }
    var corners = [[0, 0], [size - 7, 0], [0, size - 7]];
    for (var c = 0; c < corners.length; c++) {
        var cx = corners[c][0];
        var cy = corners[c][1];
        rects += '<rect x="' + cx + '" y="' + cy + '" width="7" height="7"/>';
        rects += '<rect x="' + (cx + 1) + '" y="' + (cy + 1) + '" width="5" height="5" fill="#fff"/>';
        rects += '<rect x="' + (cx + 2) + '" y="' + (cy + 2) + '" width="3" height="3"/>';
    }
    return '<svg class="qr" viewBox="-1 -1 27 27" fill="#17152B" shape-rendering="crispEdges">' + rects + '</svg>';
}

function ticketCardHtml(t) {
    var ev = getEventById(t.eventId);
    var h = '<div class="ticket-card">' + qrSvg(t.batch);
    h += '<p class="warn-red">Don’t share with anyone</p>';
    h += '<h3>' + ev.name + '</h3>';
    h += '<p class="line">' + calSvg + ev.longDate + '</p>';
    h += '<p class="line">' + pinSvg + ev.city + '</p>';
    h += '<div class="ticket-foot"><div class="code"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/></svg><div>' + t.batch + '<small>' + t.tickets + ' tickets</small></div></div>';
    h += '<span class="btn btn-outline btn-small" style="pointer-events:none">' + t.status + '</span></div></div>';
    return h;
}

function downloadCsv(filename, text) {
    var blob = new Blob([text], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

var eyeButtons = document.querySelectorAll("[data-eye]");
for (var e = 0; e < eyeButtons.length; e++) {
    eyeButtons[e].innerHTML = eyeSvg;
    eyeButtons[e].addEventListener("click", function () {
        var box = document.getElementById(this.getAttribute("data-eye"));
        if (box.type == "password") {
            box.type = "text";
        } else {
            box.type = "password";
        }
    });
}

var backButtons = document.querySelectorAll("[data-back]");
for (var b = 0; b < backButtons.length; b++) {
    backButtons[b].innerHTML = backSvg;
}

var logoMarks = document.querySelectorAll(".logo-mark:empty");
for (var l = 0; l < logoMarks.length; l++) {
    logoMarks[l].innerHTML = logoSvg;
}
