var slides = ["slide1", "slide2", "slide3", "slide4", "roleScreen"];
var current = 0;
var chosenRole = "";

function showSlide(n) {
    current = n;
    for (var i = 0; i < slides.length; i++) {
        var box = document.getElementById(slides[i]);
        if (i == n) {
            box.classList.add("active");
        } else {
            box.classList.remove("active");
        }
    }
    window.scrollTo(0, 0);
}

var actionButtons = document.querySelectorAll("[data-action]");
for (var a = 0; a < actionButtons.length; a++) {
    actionButtons[a].addEventListener("click", function () {
        var action = this.getAttribute("data-action");
        if (action == "next") {
            showSlide(current + 1);
        }
        if (action == "back") {
            showSlide(current - 1);
        }
        if (action == "skip") {
            showSlide(4);
        }
    });
}

document.getElementById("roleBack").addEventListener("click", function () {
    showSlide(3);
});

var roleCards = document.querySelectorAll(".role-card");
var roleContinue = document.getElementById("roleContinue");

for (var r = 0; r < roleCards.length; r++) {
    roleCards[r].addEventListener("click", function () {
        for (var x = 0; x < roleCards.length; x++) {
            roleCards[x].classList.remove("selected");
        }
        this.classList.add("selected");
        chosenRole = this.getAttribute("data-role");
        roleContinue.disabled = false;
    });
}

roleContinue.addEventListener("click", function () {
    if (chosenRole == "") {
        return;
    }
    localStorage.setItem("role", chosenRole);
    if (chosenRole == "organizer") {
        window.location.href = "./organizer/signup.html";
    } else {
        window.location.href = "./staff/signup.html";
    }
});
