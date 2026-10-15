var choiceStep = document.getElementById("choiceStep");
var formStep = document.getElementById("formStep");
var roleForSignup = "organizer";

document.getElementById("googleBtn").addEventListener("click", function () {
    alert("Google sign up is not available in the supplied backend yet.");
});
document.getElementById("appleBtn").addEventListener("click", function () {
    alert("Apple sign up is not available in the supplied backend yet.");
});
document.getElementById("emailBtn").addEventListener("click", function () {
    choiceStep.classList.remove("active");
    formStep.classList.add("active");
});
document.getElementById("formBack").addEventListener("click", function () {
    formStep.classList.remove("active");
    choiceStep.classList.add("active");
});

document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var err = document.getElementById("errorText");
    var first = document.getElementById("firstName").value.trim();
    var last = document.getElementById("lastName").value.trim();
    var email = document.getElementById("email").value.trim();
    var pass = document.getElementById("password").value;
    var pass2 = document.getElementById("confirmPassword").value;
    if (!first || !last || !email || !pass || !pass2) {
        err.textContent = "Please fill in all the fields.";
        return;
    }
    if (email.indexOf("@") === -1) {
        err.textContent = "Enter a valid email address.";
        return;
    }
    if (pass.length < 6) {
        err.textContent = "Password must be at least 6 characters.";
        return;
    }
    if (pass !== pass2) {
        err.textContent = "Passwords do not match.";
        return;
    }
    err.textContent = "Creating your account...";
    var submit = document.querySelector('#signupForm button[type="submit"]');
    if (submit) submit.disabled = true;
    try {
        var result = await apiRequest("/auth/register", {
            method: "POST",
            body: { firstName: first, lastName: last, email: email, password: pass, confirmPassword: pass2, role: roleForSignup }
        });
        if (!result || !result.tempToken) {
            throw new Error("The backend did not return a verification token. Please try signing up again or contact support.");
        }
        sessionStorage.setItem("pendingVerificationToken", result.tempToken);
        sessionStorage.setItem("pendingVerificationEmail", email);
        sessionStorage.setItem("pendingVerificationRole", roleForSignup);
        sessionStorage.setItem("pendingVerificationFirstName", first);
        err.textContent = "";
        window.location.href = "verify-passcode.html";
    } catch (error) {
        err.textContent = error.message;
    } finally {
        if (submit) submit.disabled = false;
    }
});
