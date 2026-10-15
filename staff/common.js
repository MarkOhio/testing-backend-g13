var logoSvg = '<img src="assets/logo.png" alt="">';
var logoSvg2 = '<img src="assets/logo2.png" alt="">';
var backSvg = '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 2 10l8 8"/></svg>';
var eyeSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
var pinSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
var calSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
var guestsSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c3 .2 5 2.3 5 5.8"/></svg>';
var userSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="9" r="3.5"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/></svg>';
var bellSvg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22zm7-6V11c0-3.1-1.6-5.6-4.5-6.3V4a2.5 2.5 0 0 0-5 0v.7C6.6 5.4 5 7.9 5 11v5l-2 2v1h18v-1z"/></svg>';
var searchSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';

var navIcons = {
    dashboard: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16"/>',
    history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'
};

var navItems = [
    { key: "dashboard", href: "dashboard.html", text: "My Events" },
    { key: "scan", href: "scan.html", text: "Scan QR" },
    { key: "history", href: "check-ins.html", text: "Check in History" },
    { key: "settings", href: "settings.html", text: "Settings" }
];

var pageName = document.body.getAttribute("data-page");

if (document.body.getAttribute("data-protected") == "yes") {
    if (localStorage.getItem("staffLoggedIn") != "yes") {
        window.location.href = "login.html";
    }
}

function getStaffName() {
    var saved = localStorage.getItem("staffName");
    if (saved == null) {
        return backend.staff.firstName;
    }
    return saved;
}

function buildNav() {
    var navArea = document.getElementById("navArea");
    if (!navArea) {
        return;
    }
    var html = '<div class="sidebar"><div class="brand"><div class="logo-mark">' + logoSvg2 + '</div><span class="brand-name">Eventify</span></div>';
    for (var i = 0; i < navItems.length; i++) {
        var n = navItems[i];
        var cls = "side-link";
        if (n.key == pageName) {
            cls += " active";
        }
        html += '<a class="' + cls + '" href="' + n.href + '"><svg viewBox="0 0 24 24">' + navIcons[n.key] + '</svg>' + n.text + '</a>';
    }
    html += '<div class="side-user"><div class="avatar-btn">' + backend.staff.initials + '</div><div><p>' + backend.staff.fullName + '</p><small>' + backend.staff.role + '</small></div></div></div>';
    navArea.innerHTML = html;
}

buildNav();

function readList(key) {
    var saved = localStorage.getItem(key);
    if (saved == null) {
        return [];
    }
    return JSON.parse(saved);
}

function addToList(key, id) {
    var list = readList(key);
    if (list.indexOf(id) == -1) {
        list.push(id);
    }
    localStorage.setItem(key, JSON.stringify(list));
}

function getAcceptedEvents() {
    var accepted = readList("staffAccepted");
    var removed = readList("staffRemoved");
    var result = [];
    for (var i = 0; i < backend.events.length; i++) {
        var ev = backend.events[i];
        if (removed.indexOf(ev.id) != -1) {
            continue;
        }
        if (ev.status == "accepted" || accepted.indexOf(ev.id) != -1) {
            result.push(ev);
        }
    }
    return result;
}

function getInvitations() {
    var accepted = readList("staffAccepted");
    var removed = readList("staffRemoved");
    var result = [];
    for (var i = 0; i < backend.events.length; i++) {
        var ev = backend.events[i];
        if (ev.status == "invited" && accepted.indexOf(ev.id) == -1 && removed.indexOf(ev.id) == -1) {
            result.push(ev);
        }
    }
    return result;
}

function isLive(ev) {
    var time = new Date().getTime();
    return time >= ev.startsAt && time <= ev.endsAt;
}

function chooseEvent(id) {
    localStorage.setItem("staffEvent", id);
}

function getSelectedEvent() {
    var list = getAcceptedEvents();
    var id = localStorage.getItem("staffEvent");
    for (var i = 0; i < list.length; i++) {
        if (String(list[i].id) == String(id)) {
            return list[i];
        }
    }
    for (var j = 0; j < list.length; j++) {
        if (isLive(list[j])) {
            return list[j];
        }
    }
    return list[0];
}

var weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatHour(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = "AM";
    if (h >= 12) {
        ampm = "PM";
    }
    h = h % 12;
    if (h == 0) {
        h = 12;
    }
    if (m == 0) {
        return h + ampm;
    }
    if (m < 10) {
        m = "0" + m;
    }
    return h + ":" + m + ampm;
}

function formatDate(ts) {
    var d = new Date(ts);
    return weekDays[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + " " + formatHour(d);
}

function nowTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = "AM";
    if (h >= 12) {
        ampm = "PM";
    }
    h = h % 12;
    if (h == 0) {
        h = 12;
    }
    if (m < 10) {
        m = "0" + m;
    }
    return h + ":" + m + ampm;
}

function getCheckIns() {
    var saved = localStorage.getItem("staffCheckIns");
    var mine = [];
    if (saved != null) {
        mine = JSON.parse(saved);
    }
    var all = [];
    for (var i = mine.length - 1; i >= 0; i--) {
        all.push(mine[i]);
    }
    for (var j = 0; j < backend.checkIns.length; j++) {
        all.push(backend.checkIns[j]);
    }
    return all;
}

function saveCheckIn(item) {
    var saved = localStorage.getItem("staffCheckIns");
    var mine = [];
    if (saved != null) {
        mine = JSON.parse(saved);
    }
    mine.push(item);
    localStorage.setItem("staffCheckIns", JSON.stringify(mine));
}

function showToast(text) {
    var old = document.getElementById("toast");
    if (old) {
        old.parentNode.removeChild(old);
    }
    var box = document.createElement("div");
    box.id = "toast";
    box.className = "toast";
    box.innerHTML = text;
    document.body.appendChild(box);
    setTimeout(function () {
        if (box.parentNode) {
            box.parentNode.removeChild(box);
        }
    }, 2500);
}

function bellHtml() {
    var count = getInvitations().length;
    var html = bellSvg;
    if (count > 0) {
        html += '<span class="bell-dot">' + count + '</span>';
    }
    return html;
}

function heroCardHtml(ev, buttons) {
    var d = new Date(ev.startsAt);
    var h = '<div class="hero-card"><img src="' + ev.image + '" alt="">';
    h += '<div class="date-badge"><b>' + d.getDate() + '</b>' + months[d.getMonth()] + '</div>';
    h += '<div class="card-actions">' + buttons + '</div>';
    h += '<div class="hero-info"><h3>' + ev.name + '</h3><p>' + pinSvg + ev.shortLocation + '</p></div></div>';
    return h;
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
