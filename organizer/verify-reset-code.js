var row = document.getElementById("resetOtpRow");
var boxes = row.getElementsByTagName("input");
var msg = document.getElementById("resetOtpMsg");
var verifying = false;
function resetCode() {
    var code = "";
    for (var i = 0; i < boxes.length; i++) code += boxes[i].value;
    return code;
}
function clearResetBoxes() {
    for (var i = 0; i < boxes.length; i++) {
        boxes[i].value = "";
        boxes[i].classList.remove("filled");
    }
    boxes[0].focus();
}
async function verifyResetCode() {
    if (verifying) return;
    var code = resetCode();
    var token = sessionStorage.getItem("recoveryToken");
    if (!token) {
        msg.className = "otp-msg error";
        msg.textContent = "Your recovery session is missing or expired. Please request a new code.";
        return;
    }
    if (!/^\d{6}$/.test(code)) {
        row.classList.add("error");
        msg.className = "otp-msg error";
        msg.textContent = "Enter the six-digit recovery code.";
        return;
    }
    verifying = true;
    var btn = document.getElementById("verifyResetBtn");
    btn.disabled = true;
    msg.className = "otp-msg";
    msg.textContent = "Verifying code...";
    try {
        await apiRequest("/auth/verify-reset-code", {
            method: "POST",
            token: token,
            body: { code: code }
        });
        window.location.href = "confirm-reset-password.html";
    } catch (error) {
        row.classList.add("error");
        msg.className = "otp-msg error";
        msg.textContent = error.message;
        clearResetBoxes();
    } finally {
        verifying = false;
        btn.disabled = false;
    }
}
for (var i = 0; i < boxes.length; i++) {
    boxes[i].inputMode = "numeric";
    boxes[i].addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 1);
        row.classList.remove("error");
        if (this.value) {
            this.classList.add("filled");
            var next = this.nextElementSibling;
            if (next && next.className === "dash") next = next.nextElementSibling;
            if (next) next.focus();
        } else this.classList.remove("filled");
        if (resetCode().length === 6) verifyResetCode();
    });
    boxes[i].addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !this.value) {
            var prev = this.previousElementSibling;
            if (prev && prev.className === "dash") prev = prev.previousElementSibling;
            if (prev) prev.focus();
        }
    });
}
document.getElementById("verifyResetBtn").addEventListener("click", verifyResetCode);
document.getElementById("resendResetBtn").addEventListener("click", async function () {
    var token = sessionStorage.getItem("recoveryToken");
    if (!token) {
        msg.className = "otp-msg error";
        msg.textContent = "Your recovery session is missing or expired. Request a new code.";
        return;
    }
    var btn = document.getElementById("resendResetBtn");
    btn.disabled = true;
    msg.className = "otp-msg";
    msg.textContent = "Requesting another code...";
    try {
        await apiRequest("/auth/resend-reset-code", { method: "POST", token: token, body: {} });
        clearResetBoxes();
        msg.textContent = "A new recovery code has been sent.";
    } catch (error) {
        msg.className = "otp-msg error";
        msg.textContent = error.message;
    } finally {
        btn.disabled = false;
    }
});
if (!sessionStorage.getItem("recoveryToken")) {
    msg.className = "otp-msg error";
    msg.textContent = "No active recovery session. Please request a new code.";
    document.getElementById("verifyResetBtn").disabled = true;
} else {
    boxes[0].focus();
}
