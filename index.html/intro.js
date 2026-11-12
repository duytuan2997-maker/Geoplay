document.addEventListener("DOMContentLoaded", function () {
    const intro = document.getElementById("intro-screen");
    const website = document.getElementById("website-content");
    const startButton = document.getElementById("intro-start");

    startButton.addEventListener("click", function () {
        intro.hidden = true;
        website.hidden = false;
        document.getElementById("account-open").focus();
    });
});
