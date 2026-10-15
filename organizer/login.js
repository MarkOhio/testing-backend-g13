document.getElementById("forgotLink").addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "forgot-password.html";
});

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var email = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value;
    var err = document.getElementById("errorText");
    if (!email || !password) {
        err.textContent = "Enter your email and password.";
        return;
    }
    err.textContent = "Signing in...";
    var submit = document.querySelector('#loginForm button[type="submit"]');
    if (submit) submit.disabled = true;
    try {
        var result = await apiRequest("/auth/login", {
            method: "POST",
            body: { email: email, password: password }
        });
        if (result.user && result.user.role !== "organizer") {
            throw new Error("This account is registered as " + result.user.role + ". Please use the matching sign-in page.");
        }
        saveAuthSession(result);
        localStorage.setItem("organizerLoggedIn", "yes");
        localStorage.setItem("organizerName", (result.user && result.user.name) || email.split("@")[0]);
        err.textContent = "";
        window.location.href = "dashboard.html";
    } catch (error) {
        err.textContent = error.message;
    } finally {
        if (submit) submit.disabled = false;
    }
});
