document.getElementById("forgotForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var email = document.getElementById("recoveryEmail").value.trim();
    var msg = document.getElementById("recoveryMsg");
    var btn = document.getElementById("getRecoveryCode");
    msg.className = "otp-msg";
    msg.textContent = "Requesting recovery code...";
    btn.disabled = true;
    try {
        var result = await apiRequest("/auth/forgot-password", {
            method: "POST",
            body: { email: email }
        });
        if (!result || !result.recoveryToken) {
            msg.className = "otp-msg error";
            msg.textContent = result.message || "We couldn't start password recovery for this email. Check the address and try again.";
            return;
        }
        sessionStorage.setItem("recoveryToken", result.recoveryToken);
        sessionStorage.setItem("recoveryEmail", email);
        window.location.href = "verify-reset-code.html";
    } catch (error) {
        msg.className = "otp-msg error";
        msg.textContent = error.message;
    } finally {
        btn.disabled = false;
    }
});
