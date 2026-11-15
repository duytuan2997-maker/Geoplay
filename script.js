function quiz() {
    let answer = prompt("Thủ đô Việt Nam là gì?");

    if (answer && answer.toLowerCase() === "hà nội") {
        alert("✅ Chính xác!");
    } else {
        alert("❌ Sai rồi!");
    }
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) {
        return;
    }

    section.style.display = section.style.display === "none" ? "block" : "none";
}

function hienLop10() {
    toggleSection("lop10");
}

function hienLop11() {
    toggleSection("lop11");
}

function hienLop12() {
    toggleSection("lop12");
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

    return parts
        .reduce(function (details, part) {
            return details.concat(part.split(/\s+(?:và|hoặc)\s+/i));
        }, [])
        .map(function (detail) {
            return detail.replace(/^[,;:\s]+|[.!?]+$/g, "").trim();
        })
        .filter(function (detail) {
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
    const seen = new Set();

    details.forEach(function (detail) {
        const normalized = detail.toLocaleLowerCase();
        if (!seen.has(normalized)) {
            seen.add(normalized);
            uniqueDetails.push(detail);
        }
    });

    return uniqueDetails;
}

function createElement(tagName, className, textContent, ariaHidden) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textContent !== undefined) element.textContent = textContent;
    if (ariaHidden) element.setAttribute("aria-hidden", "true");
    return element;
}

function createMindMapPoint(sentence) {
    const point = createElement("li", "mindmap-concept");
    const pointRow = createElement("div", "mindmap-point-row");
    pointRow.appendChild(createElement("span", "mindmap-point-icon", "✦", true));
    pointRow.appendChild(createElement("span", "", sentence.trim()));
    point.appendChild(pointRow);

    const details = getMindMapDetails(sentence);
    if (details.length) {
        const detailList = createElement("ul", "mindmap-subpoints");
        details.forEach(function (detail) {
            const detailItem = createElement("li");
            detailItem.appendChild(createElement("span", "mindmap-subpoint-icon", "•", true));
            detailItem.appendChild(createElement("span", "", detail));
            detailList.appendChild(detailItem);
        });
        point.appendChild(detailList);
    }

    return point;
}

function createMindMapBranch(title, content, index) {
    const branch = createElement("article", "mindmap-branch");
    const header = createElement("div", "mindmap-branch-header");
    header.appendChild(createElement("span", "mindmap-branch-number", String(index + 1).padStart(2, "0"), true));
    header.appendChild(createElement("span", "mindmap-branch-icon", index === 0 ? "🔎" : "📍", true));
    header.appendChild(createElement("h4", "", title));
    branch.appendChild(header);

    const keyPoints = createElement("ul");
    content.split(/(?<=[.!?])\s+/).filter(Boolean).forEach(function (sentence) {
        keyPoints.appendChild(createMindMapPoint(sentence));
    });
    branch.appendChild(keyPoints);
    return branch;
}

function createLessonMindMap(title, sections) {
    const mindMapSection = createElement("section", "lesson-mindmap-section");
    mindMapSection.setAttribute("aria-label", "Sơ đồ tư duy " + title);

    ["top-left", "top-right", "bottom-left", "bottom-right"].forEach(function (corner) {
        mindMapSection.appendChild(createElement(
            "span",
            "mindmap-flower-corner mindmap-flower-corner--" + corner,
            undefined,
            true
        ));
    });
    mindMapSection.appendChild(createElement("h3", "", "🧠 Sơ đồ tư duy"));
    mindMapSection.appendChild(createElement("p", "mindmap-intro", "Nhìn nhanh các ý chính của bài học"));

    const mindMap = createElement("div", "lesson-mindmap");
    const root = createElement("div", "mindmap-root");
    root.appendChild(createElement("span", "mindmap-root-icon", "🌏", true));
    root.appendChild(createElement("span", "", title));
    mindMap.appendChild(root);

    const branches = createElement("div", "mindmap-branches");
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < sections.length; i += 2) {
        fragment.appendChild(createMindMapBranch(sections[i], sections[i + 1] || "", i / 2));
    }
    branches.appendChild(fragment);
    mindMap.appendChild(branches);
    mindMapSection.appendChild(mindMap);
    return mindMapSection;
}

function createLessonDetails(title, videoUrl, sections) {
    const panel = createElement("section", "lesson-details");
    panel.appendChild(createElement("h3", "", "🎬 Video bài học"));

    if (videoUrl) {
        const videoFrame = createElement("iframe");
        videoFrame.src = videoUrl;
        videoFrame.title = "Video " + title;
        videoFrame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        videoFrame.allowFullscreen = true;
        panel.appendChild(videoFrame);
    } else {
        panel.appendChild(createElement(
            "p",
            "",
            "Chưa có video nhúng cho bài này. Bạn có thể tìm video phù hợp trên YouTube:"
        ));
        const videoLink = createElement("a", "", "Tìm video bài học trên YouTube");
        videoLink.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(title + " Địa lí");
        videoLink.target = "_blank";
        videoLink.rel = "noopener noreferrer";
        panel.appendChild(videoLink);
    }

    panel.appendChild(createElement("h3", "", "📖 Bài giảng chi tiết"));
    if (sections) {
        for (let i = 0; i < sections.length; i += 2) {
            panel.appendChild(createElement("h4", "", sections[i]));
            panel.appendChild(createElement("p", "", sections[i + 1] || ""));
        }
    } else {
        panel.appendChild(createElement("p", "", "Nội dung bài học này chưa được cập nhật."));
    }

    const mindMapSections = sections || [
        "Chủ đề bài học",
        "Bài học đang được bổ sung nội dung chi tiết.",
        "Gợi ý ôn tập",
        "Hãy ghi lại khái niệm, đặc điểm và ví dụ quan trọng của chủ đề này."
    ];
    panel.appendChild(createLessonMindMap(title, mindMapSections));
    return panel;
}

function removeLessonDetails(lesson) {
    const panel = lesson.nextElementSibling;
    if (panel && panel.classList.contains("lesson-details")) {
        panel.remove();
    }
    lesson.setAttribute("aria-expanded", "false");
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
    const lessonContentByElement = new WeakMap();
    const lessonGroups = new Map();
    let activeLesson = null;

    lessons.forEach(function (lesson) {
        lesson.setAttribute("role", "button");
        lesson.setAttribute("tabindex", "0");
        lesson.setAttribute("aria-expanded", "false");

        const group = lesson.closest("#lop10, #lop11, #lop12");
        if (group && !lessonGroups.has(group)) {
            lessonGroups.set(group, Array.from(group.querySelectorAll(".lesson")));
        }
    });

    lessonGroups.forEach(function (groupLessons, group) {
        groupLessons.forEach(function (lesson, index) {
            lessonContentByElement.set(lesson, window.lessonContent?.[group.id]?.[index]);
        });
    });

    function toggleLesson(lesson) {
        if (activeLesson === lesson) {
            removeLessonDetails(lesson);
            activeLesson = null;
            return;
        }

        if (activeLesson) {
            removeLessonDetails(activeLesson);
        }

        const title = lesson.textContent.trim().replace(/^.*?(Bài\s+\d+\s*:)/, "$1");
        const panel = createLessonDetails(
            title,
            lesson.dataset.videoUrl,
            lessonContentByElement.get(lesson)
        );
        lesson.insertAdjacentElement("afterend", panel);
        lesson.setAttribute("aria-expanded", "true");
        activeLesson = lesson;
    }

    function getLessonFromEvent(event) {
        return event.target instanceof Element ? event.target.closest(".lesson") : null;
    }

    document.addEventListener("click", function (event) {
        const lesson = getLessonFromEvent(event);
        if (lesson) {
            toggleLesson(lesson);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }
        const lesson = getLessonFromEvent(event);
        if (lesson) {
            event.preventDefault();
            toggleLesson(lesson);
        }
    });
});
