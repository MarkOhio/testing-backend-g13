var cards = document.querySelectorAll(".setting-card");
for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", function () {
        alert(this.getAttribute("data-msg"));
    });
}

document.getElementById("logoutBtn").addEventListener("click", async function () {
    var token = localStorage.getItem("authToken");
    try {
        if (token) await apiRequest("/auth/logout", { method: "POST", token: token, body: {} });
    } catch (error) {}
    clearAuthSession();
    window.location.href = "login.html";
});
