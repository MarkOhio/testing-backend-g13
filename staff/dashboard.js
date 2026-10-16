var showAll = false;
var staffProfile = getStaffProfile();
var staffName = localStorage.getItem("authName") || getStaffName();
var today = new Date();

document.getElementById("mGreeting").textContent = "Good Day, " + staffName + " 👋";
document.getElementById("dGreeting").textContent = "Good Day, " + staffName + " 👋";
document.getElementById("mAvatar").textContent = staffProfile.initials;
document.getElementById("dToday").textContent = "Today, " + today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();
document.getElementById("dDate").innerHTML = calSvg + today.getDate() + " " + months[today.getMonth()] + ", " + today.getFullYear();

function exitEvent() {
    showToast("Event removal is not supported by the backend. Contact the organizer to change an assignment.");
}

function render() {
    var events = getAcceptedEvents();
    var limit = showAll ? events.length : 3;
    var mobile = "";
    var desk = "";

    for (var i = 0; i < events.length && i < limit; i++) {
        var ev = events[i];
        var live = isLive(ev);
        var buttons = "";
        var deskButtons = "";
        var badge = '<span class="badge pill pill-soft">Upcoming</span>';
        var totalTickets = Number(ev.guests || 0);
        var checkedIn = Number(ev.checkedIn || 0);
        var guestText = totalTickets + " Registered Guests · " + checkedIn + " Checked In";

        if (live) {
            buttons = '<a class="btn" href="scan.html" onclick="chooseEvent(\'' + ev.id + '\')">Scan</a>';
            buttons += '<a class="btn btn-soft" href="check-ins.html" onclick="chooseEvent(\'' + ev.id + '\')">Check ins</a>';
            deskButtons = '<a class="btn" href="scan.html" onclick="chooseEvent(\'' + ev.id + '\')">Scan QR</a>';
            deskButtons += '<a class="btn btn-soft" href="check-ins.html" onclick="chooseEvent(\'' + ev.id + '\')">Check-ins</a>';
            badge = '<span class="badge pill pill-bad">Live</span>';
        } else {
            buttons = '<button class="btn btn-red" type="button" onclick="exitEvent(\'' + ev.id + '\')">Exit event</button>';
            deskButtons = '<button class="btn btn-outline" type="button" style="color:#D92D20;border-color:#f3b8b3" onclick="exitEvent(\'' + ev.id + '\')">Exit event</button>';
        }

        mobile += heroCardHtml(ev, buttons);

        desk += '<div class="event-row"><div class="thumb"><img src="' + escapeStaffText(ev.image) + '" alt=""></div>';
        desk += '<div class="info"><h3>' + escapeStaffText(ev.name) + '</h3>';
        desk += '<p>' + calSvg + escapeStaffText(formatDate(ev.startsAt)) + '</p>';
        desk += '<p>' + pinSvg + escapeStaffText(ev.location) + '</p>';
        desk += '<p>' + guestsSvg + escapeStaffText(guestText) + '</p></div>';
        desk += badge + '<div class="row-buttons">' + deskButtons + '</div></div>';
    }

    if (events.length === 0) {
        mobile = '<div class="empty-box">No events are currently assigned to your account.</div>';
        desk = mobile;
    }

    document.getElementById("mEvents").innerHTML = mobile;
    document.getElementById("dEvents").innerHTML = desk;
    document.getElementById("mBell").innerHTML = bellHtml();
    document.getElementById("dBell").innerHTML = bellHtml();
    document.getElementById("mSeeAll").textContent = showAll ? "Show less" : "See all";
    document.getElementById("dSeeAll").textContent = showAll ? "Show less" : "See all";
}

function toggleAll() {
    showAll = !showAll;
    render();
}

document.getElementById("mSeeAll").addEventListener("click", toggleAll);
document.getElementById("dSeeAll").addEventListener("click", toggleAll);

async function startStaffDashboard() {
    try {
        await fetchStaffEvents();
        await Promise.all(backend.events.map(async function (event) {
            var attendance = await fetchStaffAttendance(event.id);
            event.guests = attendance.totalTickets;
            event.checkedIn = attendance.checkedIn;
            event.attendanceSource = attendance.source;
        }));
        render();
    } catch (error) {
        document.getElementById("mEvents").innerHTML = '<div class="empty-box">Your assigned events could not be loaded right now.</div>';
        document.getElementById("dEvents").innerHTML = '<div class="empty-box">Your assigned events could not be loaded right now.</div>';
    }
}

startStaffDashboard();
