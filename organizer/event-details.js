(async function () {
    try { await fetchApiEvents(); } catch (error) {
        var detail = document.getElementById("dName");
        if (detail) detail.textContent = error.message;
        return;
    }
var ev = getEventById(getIdFromUrl());

document.getElementById("bannerImg").src = ev.image;
document.getElementById("dName").innerHTML = ev.name;
document.getElementById("dStatus").innerHTML = ev.status;
document.getElementById("mName").innerHTML = ev.name;
document.getElementById("dDate").innerHTML = ev.longDate;
document.getElementById("dLocation").innerHTML = ev.city;
document.getElementById("dAbout").innerHTML = ev.about.replace(ev.name, "<b>" + ev.name + "</b>");
document.getElementById("sTotal").innerHTML = ev.totalTickets;
document.getElementById("sChecked").innerHTML = ev.checkedIn;
document.getElementById("sRemaining").innerHTML = ev.remaining;
document.getElementById("sCategory").innerHTML = ev.category;
document.getElementById("sCapacity").innerHTML = ev.capacity;
document.getElementById("editLinkD").href = "create-event.html?edit=" + ev.id;
document.getElementById("editLinkM").href = "create-event.html?edit=" + ev.id;

var staffHtml = "";
for (var s = 0; s < backend.staff.length; s++) {
    var p = backend.staff[s];
    staffHtml += '<div class="staff-card"><div class="staff-left"><div class="avatar">' + userSvg + '</div><div><p class="staff-name">' + p.name + '</p><p class="staff-sub">' + p.role + '</p></div></div><span class="active-pill">' + p.status + '</span></div>';
}
document.getElementById("dStaff").innerHTML = staffHtml;

var tabs = document.querySelectorAll("#detailTabs button");
for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener("click", function () {
        for (var x = 0; x < tabs.length; x++) {
            tabs[x].classList.remove("active");
            document.getElementById(tabs[x].getAttribute("data-panel")).classList.remove("show");
        }
        this.classList.add("active");
        document.getElementById(this.getAttribute("data-panel")).classList.add("show");
    });
}

var bannerFile = document.getElementById("bannerFile");
document.getElementById("bannerBtn").addEventListener("click", function () {
    bannerFile.click();
});
bannerFile.addEventListener("change", function () {
    if (bannerFile.files.length > 0) {
        document.getElementById("bannerImg").src = URL.createObjectURL(bannerFile.files[0]);
    }
});

})();
