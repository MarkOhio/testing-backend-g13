var showAll = false;
var staffName = localStorage.getItem("authName") || getStaffName();
var today = new Date();

document.getElementById("mGreeting").innerHTML = "Good Day, " + staffName + " &#128075;";
document.getElementById("dGreeting").innerHTML = "Good Day, " + staffName + " &#128075;";
document.getElementById("mAvatar").innerHTML = backend.staff.initials;
document.getElementById("dToday").innerHTML = "Today, " + today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();
document.getElementById("dDate").innerHTML = calSvg + today.getDate() + " " + months[today.getMonth()] + ", " + today.getFullYear();

function exitEvent(id) {
    showToast("Event removal is not supported by the backend. Contact the organizer to change an assignment.");
}

function render() {
    var events = getAcceptedEvents();
    var limit = 3;
    if (showAll) {
        limit = events.length;
    }
    var mobile = "";
    var desk = "";

    for (var i = 0; i < events.length && i < limit; i++) {
        var ev = events[i];
        var live = isLive(ev);
        var buttons = "";
        var deskButtons = "";
        var badge = '<span class="badge pill pill-soft">Upcoming</span>';

        if (live) {
            buttons = '<a class="btn" href="scan.html" onclick="chooseEvent(\'' + ev.id + '\')">Scan</a>';
            buttons += '<a class="btn btn-soft" href="check-ins.html" onclick="chooseEvent(\'' + ev.id + '\')">Check ins</a>';
            deskButtons = '<a class="btn" href="scan.html" onclick="chooseEvent(\'' + ev.id + '\')">Scan QR</a>';
            deskButtons += '<a class="btn btn-soft" href="check-ins.html" onclick="chooseEvent(\'' + ev.id + '\')">Check-ins</a>';
            badge = '<span class="badge pill pill-bad">Live</span>';
        } else {
            buttons = '<button class="btn btn-red" type="button" onclick="exitEvent(' + ev.id + ')">Exit event</button>';
            deskButtons = '<button class="btn btn-outline" type="button" style="color:#D92D20;border-color:#f3b8b3" onclick="exitEvent(' + ev.id + ')">Exit event</button>';
        }

        mobile += heroCardHtml(ev, buttons);

        desk += '<div class="event-row"><div class="thumb"><img src="' + ev.image + '" alt=""></div>';
        desk += '<div class="info"><h3>' + ev.name + '</h3>';
        desk += '<p>' + calSvg + formatDate(ev.startsAt) + '</p>';
        desk += '<p>' + pinSvg + ev.location + '</p>';
        desk += '<p>' + guestsSvg + ev.guests + ' Registered Guests.</p></div>';
        desk += badge + '<div class="row-buttons">' + deskButtons + '</div></div>';
    }

    if (events.length == 0) {
        mobile = '<div class="empty-box">No events are currently assigned to your account.</div>';
        desk = mobile;
    }

    document.getElementById("mEvents").innerHTML = mobile;
    document.getElementById("dEvents").innerHTML = desk;
    document.getElementById("mBell").innerHTML = bellHtml();
    document.getElementById("dBell").innerHTML = bellHtml();

    var label = "See all";
    if (showAll) {
        label = "Show less";
    }
    document.getElementById("mSeeAll").innerHTML = label;
    document.getElementById("dSeeAll").innerHTML = label;
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
        render();
    } catch (error) {
        document.getElementById("mEvents").textContent = error.message;
        document.getElementById("dEvents").textContent = error.message;
    }
}
startStaffDashboard();
