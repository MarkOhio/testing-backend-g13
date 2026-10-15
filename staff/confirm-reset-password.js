document.getElementById("newPasswordForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var password = document.getElementById("newPassword").value;
    var confirmPassword = document.getElementById("confirmNewPassword").value;
    var msg = document.getElementById("newPasswordMsg");
    var btn = document.getElementById("saveNewPasswordBtn");
    var token = sessionStorage.getItem("recoveryToken");
    if (!token) {
        msg.className = "otp-msg error";
        msg.textContent = "Your recovery session is missing or expired. Please start again.";
        return;
    }
    if (password.length < 6) {
        msg.className = "otp-msg error";
        msg.textContent = "Password must be at least 6 characters.";
        return;
    }
    if (password !== confirmPassword) {
        msg.className = "otp-msg error";
        msg.textContent = "Passwords do not match.";
        return;
    }
    btn.disabled = true;
    msg.className = "otp-msg";
    msg.textContent = "Updating password...";
    try {
        var result = await apiRequest("/auth/confirm-reset-password", {
            method: "POST",
            token: token,
            body: { newPassword: password, confirmNewPassword: confirmPassword }
        });
        sessionStorage.removeItem("recoveryToken");
        sessionStorage.removeItem("recoveryEmail");
        msg.textContent = result.message || "Password updated. Redirecting to login...";
        window.location.href = "login.html";
    } catch (error) {
        msg.className = "otp-msg error";
        msg.textContent = error.message;
    } finally {
        btn.disabled = false;
    }
});
if (!sessionStorage.getItem("recoveryToken")) {
    var msg = document.getElementById("newPasswordMsg");
    msg.className = "otp-msg error";
    msg.textContent = "No active recovery session. Please start the password recovery process again.";
    document.getElementById("saveNewPasswordBtn").disabled = true;
}
