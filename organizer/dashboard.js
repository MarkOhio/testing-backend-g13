async function renderOrganizerDashboard() {
    var userName = localStorage.getItem("organizerName") || localStorage.getItem("authName") || "Organizer";
    document.getElementById("mGreeting").innerHTML = "Good Day, " + userName + " &#128075;";
    document.getElementById("dGreeting").innerHTML = "Good Day, " + userName + " &#128075;";
    try {
        var events = await fetchApiEvents();
        var totalTickets = 0, checkedIn = 0;
        for (var i = 0; i < events.length; i++) {
            try {
                var attendance = await apiRequest("/scans/events/" + events[i].id + "/attendance");
                var data = attendance.data || attendance;
                events[i].totalTickets = Number(data.totalTickets || 0);
                events[i].checkedIn = Number(data.checkedIn || 0);
                events[i].remaining = Number(data.notYetCheckedIn || 0);
                totalTickets += events[i].totalTickets;
                checkedIn += events[i].checkedIn;
            } catch (error) {}
        }
        document.getElementById("mTotalEvents").textContent = events.length;
        document.getElementById("dTotalEvents").textContent = events.length;
        document.getElementById("mTotalAttendance").textContent = totalTickets.toLocaleString();
        document.getElementById("dTotalAttendance").textContent = totalTickets.toLocaleString();
        document.getElementById("dTotalTickets").textContent = totalTickets.toLocaleString();
        document.getElementById("dPending").textContent = Math.max(totalTickets - checkedIn, 0).toLocaleString();
        var mobileList = "", deskList = "";
        events.forEach(function (event, index) {
            mobileList += heroCardHtml(event);
            if (index < 3) deskList += eventRowHtml(event);
        });
        document.getElementById("mEvents").innerHTML = mobileList || '<p class="muted">No events have been created yet.</p>';
        document.getElementById("dEvents").innerHTML = deskList || '<p class="muted">No events have been created yet.</p>';
        var rate = totalTickets ? Math.round(checkedIn / totalTickets * 100) : 0;
        document.getElementById("dRate").textContent = rate + "%";
        document.getElementById("dRateCount").textContent = checkedIn.toLocaleString() + "/" + totalTickets.toLocaleString();
        document.getElementById("dDonut").style.background = "conic-gradient(#5B4BDB 0 " + rate + "%, #DDD9F7 " + rate + "% 100%)";
    } catch (error) {
        document.getElementById("mEvents").textContent = error.message;
        document.getElementById("dEvents").textContent = error.message;
    }
}
renderOrganizerDashboard();
