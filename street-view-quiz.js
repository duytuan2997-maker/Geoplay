const locations = [
    { name: "Hà Nội", aliases: ["thủ đô hà nội"], position: { lat: 21.0285, lng: 105.8542 } },
    { name: "Thành phố Hồ Chí Minh", aliases: ["tp ho chi minh", "sài gòn", "saigon"], position: { lat: 10.7769, lng: 106.7009 } },
    { name: "Thành phố Đà Nẵng", aliases: ["tp da nang"], position: { lat: 16.0544, lng: 108.2022 } },
    { name: "Thành phố Huế", aliases: ["tp hue"], position: { lat: 16.4637, lng: 107.5909 } },
    { name: "Thành phố Hải Phòng", aliases: ["tp hai phong"], position: { lat: 20.8449, lng: 106.6881 } },
    { name: "Thành phố Cần Thơ", aliases: ["tp can tho"], position: { lat: 10.0452, lng: 105.7469 } },
    { name: "Khánh Hòa", aliases: ["tinh khanh hoa"], position: { lat: 12.2388, lng: 109.1967 } },
    { name: "Lâm Đồng", aliases: ["tinh lam dong"], position: { lat: 11.9404, lng: 108.4583 } },
    { name: "Quảng Ninh", aliases: ["tinh quang ninh"], position: { lat: 20.9517, lng: 107.0802 } },
    { name: "Lào Cai", aliases: ["tinh lao cai"], position: { lat: 22.4856, lng: 103.9707 } },
    { name: "Nghệ An", aliases: ["tinh nghe an"], position: { lat: 18.6796, lng: 105.6813 } },
    { name: "Cao Bằng", aliases: ["tinh cao bang"], position: { lat: 22.6657, lng: 106.257 } }
];

const elements = {
    setup: document.getElementById("setup-panel"),
    setupForm: document.getElementById("setup-form"),
    accessToken: document.getElementById("access-token"),
    setupMessage: document.getElementById("setup-message"),
    changeToken: document.getElementById("change-token"),
    game: document.getElementById("game-panel"),
    streetView: document.getElementById("street-view"),
    roundStatus: document.getElementById("round-status"),
    scoreStatus: document.getElementById("score-status"),
    guessForm: document.getElementById("guess-form"),
    guessInput: document.getElementById("guess-input"),
    guessButton: document.getElementById("guess-button"),
    gameMessage: document.getElementById("game-message"),
    nextButton: document.getElementById("next-button"),
    skipButton: document.getElementById("skip-button"),
    results: document.getElementById("result-panel"),
    finalScore: document.getElementById("final-score"),
    finalDetail: document.getElementById("final-detail"),
    playAgain: document.getElementById("play-again-button")
};

const savedAccessToken = localStorage.getItem("mapillaryAccessToken") || "";
let deck = [];
let locationIndex = 0;
let completedRounds = 0;
let correctAnswers = 0;
let score = 0;
let currentLocation = null;
let viewer = null;
let viewerAccessToken = "";
let locationLoadFailed = false;
let gameActive = false;

if (savedAccessToken) {
    elements.accessToken.value = savedAccessToken;
    elements.changeToken.hidden = false;
}

function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

function normalizeAnswer(value) {
    return value.trim().toLocaleLowerCase("vi")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/^(tinh|thanh pho|tp)\s+/, "")
        .replace(/\s+/g, " ");
}

async function getImages(position, accessToken) {
    const url = new URL("https://graph.mapillary.com/images");
    url.searchParams.set("fields", "id");
    url.searchParams.set("lat", String(position.lat));
    url.searchParams.set("lng", String(position.lng));
    url.searchParams.set("radius", "50");
    url.searchParams.set("limit", "10");

    const response = await fetch(url, {
        headers: { Authorization: `OAuth ${accessToken}` }
    });
    const result = await response.json();
    if (!response.ok) {
        const detail = result.error && result.error.message;
        throw new Error(detail || `Mapillary API trả về lỗi ${response.status}.`);
    }
    if (!Array.isArray(result.data)) {
        throw new Error("Mapillary trả về dữ liệu ảnh không hợp lệ.");
    }
    return result.data;
}

function updateProgress() {
    elements.roundStatus.textContent = `Lượt ${Math.min(completedRounds + 1, 10)} / 10`;
    elements.scoreStatus.textContent = `Điểm: ${score.toLocaleString("vi-VN")}`;
}

async function showNextLocation() {
    elements.guessForm.hidden = true;
    elements.nextButton.hidden = true;
    elements.skipButton.hidden = true;
    locationLoadFailed = false;
    elements.gameMessage.textContent = "Đang tìm ảnh Mapillary...";

    while (locationIndex < deck.length && completedRounds < 10) {
        currentLocation = deck[locationIndex];
        updateProgress();

        try {
            const images = await getImages(currentLocation.position, elements.accessToken.value.trim());
            if (!gameActive) return;
            if (images.length === 0) {
                locationIndex += 1;
                continue;
            }

            const image = images[Math.floor(Math.random() * images.length)];
            if (viewer) {
                if (viewerAccessToken !== elements.accessToken.value.trim()) {
                    viewer.setAccessToken(elements.accessToken.value.trim());
                    viewerAccessToken = elements.accessToken.value.trim();
                }
                await viewer.moveTo(image.id);
            } else {
                viewer = new mapillary.Viewer({
                    accessToken: elements.accessToken.value.trim(),
                    container: elements.streetView,
                    imageId: image.id
                });
                viewerAccessToken = elements.accessToken.value.trim();
            }
            locationIndex += 1;
            elements.gameMessage.textContent = "";
            elements.guessForm.hidden = false;
            elements.skipButton.hidden = false;
            elements.guessInput.value = "";
            elements.guessInput.focus();
            updateProgress();
            return;
        } catch (error) {
            if (!gameActive) return;
            locationLoadFailed = true;
            elements.gameMessage.textContent = `Không tải được ảnh Mapillary: ${error.message}`;
            elements.nextButton.textContent = "Thử lại";
            elements.nextButton.hidden = false;
            elements.skipButton.hidden = false;
            return;
        }
    }

    finishGame();
}

function submitGuess(event) {
    event.preventDefault();
    if (!currentLocation || elements.guessForm.hidden) return;

    const answer = normalizeAnswer(elements.guessInput.value);
    const validAnswers = [currentLocation.name, ...currentLocation.aliases].map(normalizeAnswer);
    const correct = validAnswers.includes(answer);
    completedRounds += 1;
    if (correct) {
        correctAnswers += 1;
        score += 100;
        elements.gameMessage.textContent = `Chính xác! Đây là ${currentLocation.name}. +100 điểm`;
    } else {
        elements.gameMessage.textContent = `Chưa đúng. Đáp án là ${currentLocation.name}.`;
    }
    elements.guessForm.hidden = true;
    elements.skipButton.hidden = true;
    elements.nextButton.hidden = false;
    elements.nextButton.textContent = completedRounds >= 10 ? "Xem kết quả" : "Lượt tiếp theo";
    updateProgress();
}

function skipLocation() {
    if (!currentLocation || elements.skipButton.hidden) return;
    if (locationLoadFailed) {
        locationIndex += 1;
        locationLoadFailed = false;
    }
    completedRounds += 1;
    elements.gameMessage.textContent = `Đáp án là ${currentLocation.name}.`;
    elements.guessForm.hidden = true;
    elements.skipButton.hidden = true;
    elements.nextButton.hidden = false;
    elements.nextButton.textContent = completedRounds >= 10 ? "Xem kết quả" : "Lượt tiếp theo";
    updateProgress();
}

function finishGame() {
    gameActive = false;
    elements.game.hidden = true;
    elements.results.hidden = false;
    elements.finalScore.textContent = `${score.toLocaleString("vi-VN")} điểm`;
    elements.finalDetail.textContent = `${correctAnswers} câu đúng · ${completedRounds} lượt đã chơi`;

    const xpEarned = correctAnswers * 5;
    if (xpEarned > 0) {
        const xpBefore = Number(localStorage.getItem("xp")) || 0;
        localStorage.setItem("xp", xpBefore + xpEarned);
        window.dispatchEvent(new Event("accountstatschange"));
    }
}

async function startGame(accessToken, saveToken = true) {
    elements.setupMessage.textContent = "Đang kiểm tra token Mapillary...";
    elements.setupForm.querySelector("button").disabled = true;
    try {
        if (!window.mapillary || !window.mapillary.Viewer) {
            throw new Error("Không tải được MapillaryJS. Hãy kiểm tra kết nối Internet rồi thử lại.");
        }
        await getImages(locations[0].position, accessToken);
        elements.setupMessage.textContent = "";
        if (saveToken) {
            localStorage.setItem("mapillaryAccessToken", accessToken);
        } else {
            localStorage.removeItem("mapillaryAccessToken");
        }
        elements.accessToken.value = accessToken;
        elements.changeToken.hidden = false;
        deck = shuffle(locations);
        locationIndex = 0;
        completedRounds = 0;
        correctAnswers = 0;
        score = 0;
        gameActive = true;
        elements.setup.hidden = true;
        elements.game.hidden = false;
        elements.results.hidden = true;
        await showNextLocation();
    } catch (error) {
        elements.setupMessage.textContent = error.message;
    } finally {
        elements.setupForm.querySelector("button").disabled = false;
    }
}

async function loadConfiguredToken() {
    try {
        const config = window.MAPILLARY_CONFIG;
        if (!config || typeof config.accessToken !== "string" ||
            !config.accessToken.trim() || config.accessToken.includes("PASTE_MAPILLARY")) {
            throw new Error("Chưa điền Client Access Token trong mapillary-config.js.");
        }

        const accessToken = config.accessToken.trim();
        elements.accessToken.value = accessToken;
        await startGame(accessToken, false);
    } catch (error) {
        elements.setupMessage.textContent =
            `Chưa kết nối được token Mapillary dùng chung: ${error.message} Bạn vẫn có thể nhập token riêng bên dưới.`;
    }
}

elements.setupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const accessToken = elements.accessToken.value.trim();
    if (!accessToken) {
        elements.setupMessage.textContent = "Hãy nhập Mapillary Client Access Token.";
        return;
    }
    await startGame(accessToken);
});

elements.changeToken.addEventListener("click", () => {
    elements.game.hidden = true;
    elements.results.hidden = true;
    elements.setup.hidden = false;
    elements.accessToken.focus();
});

elements.guessForm.addEventListener("submit", submitGuess);
elements.skipButton.addEventListener("click", skipLocation);
elements.nextButton.addEventListener("click", showNextLocation);
elements.playAgain.addEventListener("click", async () => {
    elements.results.hidden = true;
    elements.setup.hidden = false;
    await startGame(elements.accessToken.value.trim() || localStorage.getItem("mapillaryAccessToken") || "");
});

loadConfiguredToken();
