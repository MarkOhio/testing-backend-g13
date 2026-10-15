var r = backend.report;

document.getElementById("mDate").innerHTML = r.date;
document.getElementById("mTotal").innerHTML = r.total;
document.getElementById("mChecked").innerHTML = r.checkedIn + " (" + r.percent + "%)";
document.getElementById("dRange").innerHTML = r.range;
document.getElementById("rTotal").innerHTML = backend.totalAttendance.toLocaleString();
document.getElementById("rChecked").innerHTML = backend.checkedInTotal.toLocaleString();
document.getElementById("rNoShow").innerHTML = r.noShow.toLocaleString();
document.getElementById("rRate").innerHTML = Math.round(backend.checkedInTotal / backend.totalAttendance * 100) + "%";

var biggest = 0;
for (var i = 0; i < r.ticketTypes.length; i++) {
    if (r.ticketTypes[i].value > biggest) {
        biggest = r.ticketTypes[i].value;
    }
}

var mobileBars = "";
var deskBars = "";
for (var j = 0; j < r.ticketTypes.length; j++) {
    var t = r.ticketTypes[j];
    var width = Math.round(t.value / biggest * 100);
    mobileBars += '<div class="bar-row"><div class="bar-track"><div class="bar-fill" style="width:' + width + '%">' + t.name + '</div></div><span class="num">' + t.value + '</span></div>';
    deskBars += '<div class="bar-row"><span>' + t.name + '</span><div class="bar-track"><div class="bar-fill" style="width:' + width + '%"></div></div><span class="num">' + t.value + '</span></div>';
}
document.getElementById("mBars").innerHTML = mobileBars;
document.getElementById("dTypeBars").innerHTML = deskBars;

var eventBars = "";
for (var k = 0; k < r.eventRates.length; k++) {
    var er = r.eventRates[k];
    eventBars += '<div class="bar-row"><span>' + er.name + '</span><div class="bar-track"><div class="bar-fill" style="width:' + er.rate + '%"></div></div><span class="num">' + er.rate + '%</span></div>';
}
document.getElementById("dEventBars").innerHTML = eventBars;

document.querySelector(".exportBtn").addEventListener("click", function () {
    var text = "Total Attendees,Checked in,No Show,Attendance Rate\n";
    text += backend.totalAttendance + "," + backend.checkedInTotal + "," + r.noShow + "," + Math.round(backend.checkedInTotal / backend.totalAttendance * 100) + "%\n";
    downloadCsv("attendees-report.csv", text);
});
