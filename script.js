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

function splitMindMapDetails(text) {
    const parts = [];
    let start = 0;
    let parenthesisDepth = 0;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === "(") {
            parenthesisDepth++;
        } else if (text[i] === ")") {
            parenthesisDepth = Math.max(0, parenthesisDepth - 1);
        } else if (parenthesisDepth === 0 && (text[i] === "," || text[i] === ";")) {
            parts.push(text.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(text.slice(start));

    return parts.reduce(function (details, part) {
        return details.concat(part.split(/\s+(?:và|hoặc)\s+/i));
    }, []).map(function (detail) {
        return detail.replace(/^[,;:\s]+|[.!?]+$/g, "").trim();
    }).filter(function (detail) {
        return detail.length > 2;
    });
}

function getMindMapDetails(sentence) {
    const colonIndex = sentence.indexOf(":");
    let detailText = "";
    if (colonIndex >= 0) {
        detailText = sentence.slice(colonIndex + 1);
    } else if (sentence.indexOf(";") >= 0) {
        detailText = sentence.split(";").slice(1).join(";");
    } else {
        const list = sentence.match(/\b(?:gồm|bao gồm|như|chẳng hạn)\s+([^.!?]+)[.!?]?$/i);
        if (list) {
            detailText = list[1];
        } else {
            const parenthetical = sentence.match(/\(([^()]*)\)/);
            if (parenthetical) {
                detailText = parenthetical[1];
            }
        }
    }

    let details = splitMindMapDetails(detailText);
    if (details.length < 2) {
        const sentenceParts = splitMindMapDetails(sentence);
        if (sentenceParts.length > 1) {
            details = sentenceParts;
        }
    }

    const uniqueDetails = [];
    details.forEach(function (detail) {
        if (!uniqueDetails.some(function (existing) {
            return existing.toLocaleLowerCase() === detail.toLocaleLowerCase();
        })) {
            uniqueDetails.push(detail);
        }
    });
    return uniqueDetails;
}

function createLessonMindMap(title, sections) {
    const mindMapSection = document.createElement("section");
    mindMapSection.className = "lesson-mindmap-section";
    mindMapSection.setAttribute("aria-label", "Sơ đồ tư duy " + title);

    ["top-left", "top-right", "bottom-left", "bottom-right"].forEach(function (corner) {
        const flowerCorner = document.createElement("span");
        flowerCorner.className = "mindmap-flower-corner mindmap-flower-corner--" + corner;
        flowerCorner.setAttribute("aria-hidden", "true");
        mindMapSection.appendChild(flowerCorner);
    });

    const heading = document.createElement("h3");
    heading.textContent = "🧠 Sơ đồ tư duy";
    mindMapSection.appendChild(heading);

    const intro = document.createElement("p");
    intro.className = "mindmap-intro";
    intro.textContent = "Nhìn nhanh các ý chính của bài học";
    mindMapSection.appendChild(intro);

    const mindMap = document.createElement("div");
    mindMap.className = "lesson-mindmap";

    const root = document.createElement("div");
    root.className = "mindmap-root";
    const rootIcon = document.createElement("span");
    rootIcon.className = "mindmap-root-icon";
    rootIcon.setAttribute("aria-hidden", "true");
    rootIcon.textContent = "🌏";
    root.appendChild(rootIcon);

    const rootLabel = document.createElement("span");
    rootLabel.textContent = title;
    root.appendChild(rootLabel);
    mindMap.appendChild(root);

    const branches = document.createElement("div");
    branches.className = "mindmap-branches";

    for (let i = 0; i < sections.length; i += 2) {
        const branch = document.createElement("article");
        branch.className = "mindmap-branch";

        const branchHeader = document.createElement("div");
        branchHeader.className = "mindmap-branch-header";

        const branchNumber = document.createElement("span");
        branchNumber.className = "mindmap-branch-number";
        branchNumber.setAttribute("aria-hidden", "true");
        branchNumber.textContent = String(i / 2 + 1).padStart(2, "0");
        branchHeader.appendChild(branchNumber);

        const branchIcon = document.createElement("span");
        branchIcon.className = "mindmap-branch-icon";
        branchIcon.setAttribute("aria-hidden", "true");
        branchIcon.textContent = i === 0 ? "🔎" : "📍";
        branchHeader.appendChild(branchIcon);

        const branchHeading = document.createElement("h4");
        branchHeading.textContent = sections[i];
        branchHeader.appendChild(branchHeading);
        branch.appendChild(branchHeader);

        const keyPoints = document.createElement("ul");
        const sentences = sections[i + 1].split(/(?<=[.!?])\s+/).filter(Boolean);
        sentences.forEach(function (sentence) {
            const point = document.createElement("li");
            point.className = "mindmap-concept";

            const pointRow = document.createElement("div");
            pointRow.className = "mindmap-point-row";

            const pointIcon = document.createElement("span");
            pointIcon.className = "mindmap-point-icon";
            pointIcon.setAttribute("aria-hidden", "true");
            pointIcon.textContent = "✦";
            pointRow.appendChild(pointIcon);

            const pointText = document.createElement("span");
            pointText.textContent = sentence.trim();
            pointRow.appendChild(pointText);
            point.appendChild(pointRow);

            const details = getMindMapDetails(sentence);
            if (details.length) {
                const detailList = document.createElement("ul");
                detailList.className = "mindmap-subpoints";
                details.forEach(function (detail) {
                    const detailItem = document.createElement("li");
                    const detailIcon = document.createElement("span");
                    detailIcon.className = "mindmap-subpoint-icon";
                    detailIcon.setAttribute("aria-hidden", "true");
                    detailIcon.textContent = "•";
                    detailItem.appendChild(detailIcon);

                    const detailText = document.createElement("span");
                    detailText.textContent = detail;
                    detailItem.appendChild(detailText);
                    detailList.appendChild(detailItem);
                });
                point.appendChild(detailList);
            }

            keyPoints.appendChild(point);
        });
        branch.appendChild(keyPoints);
        branches.appendChild(branch);
    }

    mindMap.appendChild(branches);
    mindMapSection.appendChild(mindMap);
    return mindMapSection;
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

            const mindMapSections = sections || [
                "Chủ đề bài học",
                "Bài học đang được bổ sung nội dung chi tiết.",
                "Gợi ý ôn tập",
                "Hãy ghi lại khái niệm, đặc điểm và ví dụ quan trọng của chủ đề này."
            ];
            panel.appendChild(createLessonMindMap(title, mindMapSections));

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
