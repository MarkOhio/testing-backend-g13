var row = document.getElementById("otpRow");
var boxes = row.getElementsByTagName("input");
var msg = document.getElementById("otpMsg");
var seconds = 59;
var timer;
var verifying = false;

function formatTime(s) {
    var m = Math.floor(s / 60), sec = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
}
function startTimer() {
    seconds = 59;
    clearInterval(timer);
    msg.className = "otp-msg";
    msg.textContent = "Resend in " + formatTime(seconds) + "s";
    timer = setInterval(function () {
        seconds--;
        if (seconds <= 0) {
            clearInterval(timer);
            msg.textContent = "You can now resend the code.";
        } else if (msg.className === "otp-msg") {
            msg.textContent = "Resend in " + formatTime(seconds) + "s";
        }
    }, 1000);
}
function getCode() {
    var code = "";
    for (var i = 0; i < boxes.length; i++) code += boxes[i].value;
    return code;
}
function clearBoxes() {
    for (var i = 0; i < boxes.length; i++) {
        boxes[i].value = "";
        boxes[i].classList.remove("filled");
    }
    boxes[0].focus();
}
async function checkCode() {
    if (verifying) return;
    var code = getCode();
    if (!/^\d{6}$/.test(code)) {
        row.classList.add("error");
        msg.className = "otp-msg error";
        msg.textContent = "Enter the 6 digit code.";
        return;
    }
    var token = sessionStorage.getItem("pendingVerificationToken");
    if (!token) {
        msg.className = "otp-msg error";
        msg.textContent = "Your verification session is missing or expired. Please sign up again.";
        return;
    }
    verifying = true;
    var btn = document.getElementById("verifyBtn");
    if (btn) btn.disabled = true;
    msg.className = "otp-msg";
    msg.textContent = "Verifying code...";
    try {
        await apiRequest("/auth/verify-code", {
            method: "POST",
            token: token,
            body: { code: code }
        });
        sessionStorage.removeItem("pendingVerificationToken");
        sessionStorage.removeItem("pendingVerificationEmail");
        sessionStorage.removeItem("pendingVerificationRole");
        sessionStorage.removeItem("pendingVerificationFirstName");
        msg.textContent = "Email verified. Redirecting to login...";
        window.location.href = "login.html";
    } catch (error) {
        row.classList.add("error");
        msg.className = "otp-msg error";
        msg.textContent = error.message;
        clearBoxes();
    } finally {
        verifying = false;
        if (btn) btn.disabled = false;
    }
}
for (var b = 0; b < boxes.length; b++) {
    boxes[b].inputMode = "numeric";
    boxes[b].maxLength = 1;
    boxes[b].addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 1);
        row.classList.remove("error");
        if (this.value) {
            this.classList.add("filled");
            var next = this.nextElementSibling;
            if (next && next.className === "dash") next = next.nextElementSibling;
            if (next) next.focus();
        } else this.classList.remove("filled");
        if (getCode().length === 6) checkCode();
    });
    boxes[b].addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !this.value) {
            var prev = this.previousElementSibling;
            if (prev && prev.className === "dash") prev = prev.previousElementSibling;
            if (prev) prev.focus();
        }
    });
}
document.getElementById("verifyBtn").addEventListener("click", checkCode);
document.getElementById("resendBtn").addEventListener("click", async function () {
    if (seconds > 0) {
        msg.textContent = "Please wait until the timer ends before requesting another code.";
        return;
    }
    var token = sessionStorage.getItem("pendingVerificationToken");
    if (!token) {
        msg.className = "otp-msg error";
        msg.textContent = "Your verification session is missing or expired. Please sign up again.";
        return;
    }
    try {
        await apiRequest("/auth/resend-code", { method: "POST", token: token, body: {} });
        clearBoxes();
        row.classList.remove("error");
        msg.textContent = "A new code has been sent to your email.";
        startTimer();
    } catch (error) {
        msg.className = "otp-msg error";
        msg.textContent = error.message;
    }
});
document.getElementById("verifyBack").addEventListener("click", function () {
    sessionStorage.removeItem("pendingVerificationToken");
    window.location.href = "signup.html";
});
if (!sessionStorage.getItem("pendingVerificationToken")) {
    msg.className = "otp-msg error";
    msg.textContent = "No active verification session. Please sign up again.";
} else {
    boxes[0].focus();
    startTimer();
}
