(async function () {
await fetchStaffEvents();
var selected = getSelectedEvent();

if (!selected) {
    alert("You have no accepted events yet.");
    window.location.href = "dashboard.html";
} else if (!isLive(selected)) {
    alert("This event is not live yet. Scanning opens when the event starts.");
    window.location.href = "dashboard.html";
}

var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var cameraMsg = document.getElementById("cameraMsg");
var stream = null;
var scanning = false;
var lastScan = null;
var states = ["stateScan", "stateSuccess", "stateDuplicate", "stateInvalid", "stateOffline", "stateCamera"];

if (selected) {
    document.getElementById("mEventName").innerHTML = selected.name;
    document.getElementById("dEventName").innerHTML = selected.name;
    document.getElementById("dEventDate").innerHTML = formatDate(selected.startsAt);
    document.getElementById("dEventPlace").innerHTML = selected.location;
}

function stopCamera() {
    scanning = false;
    if (stream) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
        stream = null;
    }
    video.srcObject = null;
}

function showCameraError(text) {
    document.getElementById("cameraText").innerHTML = text;
    showState("stateCamera");
}

function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showCameraError("This browser cannot open the camera here. Open the site on https or localhost, or enter the ticket code manually.");
        return;
    }
    cameraMsg.innerHTML = "Starting camera...";
    cameraMsg.classList.remove("hidden");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (s) {
        stream = s;
        video.srcObject = s;
        video.play();
        cameraMsg.classList.add("hidden");
        scanning = true;
        requestAnimationFrame(tick);
    }).catch(function (err) {
        if (err.name == "NotAllowedError") {
            showCameraError("Camera permission was denied. Allow camera access in your browser settings, then try again.");
        } else {
            showCameraError("No camera was found on this device.");
        }
    });
}

function tick() {
    if (!scanning) {
        return;
    }
    if (video.readyState == video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (typeof jsQR == "function") {
            var image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var found = jsQR(image.data, image.width, image.height);
            if (found && found.data) {
                scanning = false;
                handleCode(found.data);
                return;
            }
        } else {
            cameraMsg.innerHTML = "The QR scanner could not load. Check your internet or enter the code manually.";
            cameraMsg.classList.remove("hidden");
        }
    }
    requestAnimationFrame(tick);
}

function showState(name) {
    for (var i = 0; i < states.length; i++) {
        if (states[i] == name) {
            document.getElementById(states[i]).classList.remove("hidden");
        } else {
            document.getElementById(states[i]).classList.add("hidden");
        }
    }
    if (name == "stateScan") {
        startCamera();
    } else {
        stopCamera();
    }
    window.scrollTo(0, 0);
}

function safeText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
}

function getAttendeeName(result) {
    var attendee = result.attendee || result.guest || {};
    return attendee.fullName || attendee.name || [attendee.firstName, attendee.lastName].filter(Boolean).join(" ").trim() || result.attendeeName || result.guestName || "Ticket holder";
}

function getTicketType(result) {
    var ticket = result.ticket || {};
    return result.ticketType || result.ticket_type || ticket.ticketType || ticket.ticket_type || ticket.type || "Regular";
}

function displayTime(value) {
    if (!value) return nowTime();
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fillCard(prefix, who, type, code, time) {
    document.getElementById(prefix + "Name").textContent = who;
    document.getElementById(prefix + "Type").textContent = type;
    document.getElementById(prefix + "Code").textContent = code;
    document.getElementById(prefix + "Time").textContent = time;
}

function saveScanToHistory(result, status) {
    saveCheckIn({
        eventId: selected ? selected.id : "",
        time: result.checkedInAt || result.firstCheckedInAt || new Date().toISOString(),
        name: getAttendeeName(result),
        code: result.ticketCode || "—",
        status: status
    });
}

function showScanResult(result) {
    var status = String(result.status || "invalid").toLowerCase();
    var name = getAttendeeName(result);
    var type = getTicketType(result);
    var code = result.ticketCode || "—";

    if (status === "valid") {
        var time = displayTime(result.checkedInAt);
        lastScan = { name: name, type: type, code: code, time: time };
        saveScanToHistory(result, "Confirmed");
        fillCard("s", name, type, code, time);
        showState("stateSuccess");
    } else if (status === "duplicate") {
        var firstTime = displayTime(result.firstCheckedInAt || "Previously scanned");
        saveScanToHistory(result, "Duplicate");
        fillCard("d", name, type, code, firstTime);
        showState("stateDuplicate");
    } else {
        saveScanToHistory(result, "Declined");
        document.getElementById("cameraText").textContent = result.message || (status === "wrong-event" ? "This ticket belongs to another event." : "This ticket could not be validated.");
        showState("stateInvalid");
    }
}

async function handleCode(raw) {
    stopCamera();
    var qrToken = String(raw || "").trim();
    if (!qrToken) return;
    if (!navigator.onLine) {
        showOffline();
        return;
    }
    if (!localStorage.getItem("authToken")) {
        alert("Please sign in again before scanning tickets.");
        window.location.href = "login.html";
        return;
    }
    if (!selected || !/^[a-f\d]{24}$/i.test(String(selected.id))) {
        showCameraError("This event is not linked to a backend event ID yet. Open a backend event before scanning.");
        return;
    }
    try {
        var result = await apiRequest("/scans/scan", {
            method: "POST",
            body: {
                qr_token: qrToken,
                event_id: String(selected.id)
            }
        });
        showScanResult(result);
    } catch (error) {
        if (error.data && error.data.status) {
            showScanResult(error.data);
        } else {
            document.getElementById("cameraText").textContent = error.message;
            showState("stateInvalid");
        }
    }
}
function showOffline() {
    var card = "";
    if (lastScan) {
        card = '<div class="person-card off"><div class="pic">' + userSvg.replace(/#fff/g, "#17152B") + '</div><div>Name : ' + lastScan.name + '<br>Ticket type : ' + lastScan.type + '<br>Ticket code : ' + lastScan.code + '<br>Check-in : ' + lastScan.time + '</div></div>';
    }
    document.getElementById("offlineCard").innerHTML = card;
    showState("stateOffline");
}

var nextButtons = document.querySelectorAll(".scanNext");
for (var n = 0; n < nextButtons.length; n++) {
    nextButtons[n].addEventListener("click", function () {
        showState("stateScan");
    });
}

document.getElementById("manualLink").addEventListener("click", function () {
    document.getElementById("manualBox").classList.toggle("hidden");
    document.getElementById("manualInput").focus();
});

document.getElementById("manualBtn").addEventListener("click", function () {
    var typed = document.getElementById("manualInput").value;
    if (typed.trim() == "") {
        return;
    }
    document.getElementById("manualInput").value = "";
    handleCode(typed);
});

document.getElementById("refreshBtn").addEventListener("click", function () {
    if (navigator.onLine) {
        showState("stateScan");
    } else {
        alert("Still offline. Connect to a network and try again.");
    }
});

document.getElementById("retryCamera").addEventListener("click", function () {
    showState("stateScan");
});

document.getElementById("useManual").addEventListener("click", function () {
    showState("stateScan");
    document.getElementById("manualBox").classList.remove("hidden");
});

window.addEventListener("offline", function () {
    showOffline();
});

window.addEventListener("online", function () {
    showState("stateScan");
});

if (selected && isLive(selected)) {
    if (navigator.onLine) {
        showState("stateScan");
    } else {
        showOffline();
    }
}
})();
