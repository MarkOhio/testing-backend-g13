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

function fillCard(prefix, who, type, code, time) {
    document.getElementById(prefix + "Name").innerHTML = who;
    document.getElementById(prefix + "Type").innerHTML = type;
    document.getElementById(prefix + "Code").innerHTML = code;
    document.getElementById(prefix + "Time").innerHTML = time;
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
                event_id: String(selected.id),
                gate_label: selected.gate || "Main Gate"
            }
        });
        var status = result.status || "invalid";
        var code = result.ticketCode || "—";
        var time = result.checkedInAt ? new Date(result.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : nowTime();
        if (status === "valid") {
            lastScan = { name: "Ticket holder", type: "Valid ticket", code: code, time: time };
            fillCard("s", "Ticket holder", "Valid ticket", code, time);
            showState("stateSuccess");
        } else if (status === "duplicate") {
            fillCard("d", "Ticket holder", "Already checked in", code, result.firstCheckedInAt ? new Date(result.firstCheckedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Previously scanned");
            showState("stateDuplicate");
        } else {
            document.getElementById("cameraText").textContent = result.message || "This ticket could not be validated.";
            showState("stateInvalid");
        }
    } catch (error) {
        document.getElementById("cameraText").textContent = error.message;
        showState("stateInvalid");
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
