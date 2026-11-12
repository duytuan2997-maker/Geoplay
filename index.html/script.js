function quiz() {
    let answer = prompt("Thủ đô Việt Nam là gì?");

    if (answer && answer.toLowerCase() === "hà nội") {
        alert("✅ Chính xác!");
    } else {
        alert("❌ Sai rồi!");
    }
}

function hienLop10() {
    const ds = document.getElementById("lop10");
    ds.style.display = ds.style.display === "none" ? "block" : "none";
}

function hienLop11() {
    const ds = document.getElementById("lop11");
    ds.style.display = ds.style.display === "none" ? "block" : "none";
}

function hienLop12() {
    const ds = document.getElementById("lop12");
    ds.style.display = ds.style.display === "none" ? "block" : "none";
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

let xp = Number(localStorage.getItem("xp")) || 0;

function updateUI() {
    const level = Math.floor(xp / 100) + 1;
    const currentXP = xp % 100;
    const levelElement = document.getElementById("level");
    const xpElement = document.getElementById("xp");
    const rankElement = document.getElementById("rank-title");
    const xpFill = document.getElementById("xp-fill");

    if (!levelElement || !xpElement || !rankElement || !xpFill) {
        return;
    }

    const ranks = [
        "👤 Người mới khám phá",
        "🧭 Nhà địa lí tập sự",
        "🗺️ Nhà địa lí nghiệp dư",
        "🌍 Nhà địa lí triển vọng",
        "🎓 Nhà địa lí chuyên nghiệp",
        "🏆 Bậc thầy địa lí"
    ];
    const rankIndex = Math.min(Math.floor((level - 1) / 2), ranks.length - 1);

    rankElement.innerText = ranks[rankIndex];
    levelElement.innerText = "⭐ Level " + level;
    xpElement.innerText = currentXP + " / 100 XP";
    xpFill.style.width = currentXP + "%";
    xpFill.parentElement.setAttribute("aria-valuenow", currentXP);
}

updateUI();

const gameAvatarImage = document.getElementById("game-avatar-image");
const gameAvatarInitial = document.getElementById("game-avatar-initial");
if (gameAvatarImage && gameAvatarInitial) {
    fetch("/api/me")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Không thể tải thông tin tài khoản.");
            }
            return response.json();
        })
        .then(function (result) {
            const user = result.user;
            if (!user) return;

            gameAvatarInitial.textContent = user.username.charAt(0).toUpperCase();
            if (user.avatar) {
                gameAvatarImage.src = user.avatar;
                gameAvatarImage.hidden = false;
                gameAvatarInitial.hidden = true;
            }
        })
        .catch(function (error) {
            console.error("Không thể tải ảnh đại diện tài khoản:", error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const lessons = document.querySelectorAll(".lesson");
    let activeLesson = null;

    lessons.forEach(function (lesson) {
        lesson.setAttribute("role", "button");
        lesson.setAttribute("tabindex", "0");
        lesson.setAttribute("aria-expanded", "false");

        function toggleLesson() {
            if (activeLesson === lesson) {
                const openPanel = lesson.nextElementSibling;
                if (openPanel && openPanel.classList.contains("lesson-details")) {
                    openPanel.remove();
                }
                lesson.setAttribute("aria-expanded", "false");
                activeLesson = null;
                return;
            }

            if (activeLesson) {
                const previousPanel = activeLesson.nextElementSibling;
                if (previousPanel && previousPanel.classList.contains("lesson-details")) {
                    previousPanel.remove();
                }
                activeLesson.setAttribute("aria-expanded", "false");
            }

            const title = lesson.textContent.trim().replace(/^.*?(Bài\s+\d+\s*:)/, "$1");
            const lessonGroup = lesson.closest("#lop10, #lop11, #lop12");
            const lessonIndex = lessonGroup
                ? Array.from(lessonGroup.querySelectorAll(".lesson")).indexOf(lesson)
                : -1;
            const sections = lessonGroup && window.lessonContent
                ? window.lessonContent[lessonGroup.id]?.[lessonIndex]
                : null;
            const panel = document.createElement("section");
            panel.className = "lesson-details";

            const videoHeading = document.createElement("h3");
            videoHeading.textContent = "🎬 Video bài học";
            panel.appendChild(videoHeading);

            const videoUrl = lesson.dataset.videoUrl;
            if (videoUrl) {
                const videoFrame = document.createElement("iframe");
                videoFrame.src = videoUrl;
                videoFrame.title = "Video " + title;
                videoFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                videoFrame.allowFullscreen = true;
                panel.appendChild(videoFrame);
            } else {
                const videoNote = document.createElement("p");
                videoNote.textContent = "Chưa có video nhúng cho bài này. Bạn có thể tìm video phù hợp trên YouTube:";
                panel.appendChild(videoNote);

                const videoLink = document.createElement("a");
                videoLink.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(title + " Địa lí");
                videoLink.target = "_blank";
                videoLink.rel = "noopener noreferrer";
                videoLink.textContent = "Tìm video bài học trên YouTube";
                panel.appendChild(videoLink);
            }

            const lessonHeading = document.createElement("h3");
            lessonHeading.textContent = "📖 Bài giảng chi tiết";
            panel.appendChild(lessonHeading);

            if (sections) {
                for (let i = 0; i < sections.length; i += 2) {
                    const sectionHeading = document.createElement("h4");
                    sectionHeading.textContent = sections[i];
                    panel.appendChild(sectionHeading);

                    const paragraph = document.createElement("p");
                    paragraph.textContent = sections[i + 1];
                    panel.appendChild(paragraph);
                }
            } else {
                const unavailable = document.createElement("p");
                unavailable.textContent = "Nội dung bài học này chưa được cập nhật.";
                panel.appendChild(unavailable);
            }

            lesson.insertAdjacentElement("afterend", panel);
            lesson.setAttribute("aria-expanded", "true");
            activeLesson = lesson;
        }

        lesson.addEventListener("click", toggleLesson);
        lesson.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleLesson();
            }
        });
    });
});
