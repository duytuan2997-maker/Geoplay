(() => {
    const mapContainer = document.getElementById("map");
    const mapMessage = document.getElementById("map-message");
    const timerElement = document.getElementById("timer");
    const timerTrack = document.querySelector(".timer-track");
    const timerFill = document.getElementById("timer-fill");
    const scoreElement = document.getElementById("score");
    const gameMessage = document.getElementById("game-message");
    const guessForm = document.getElementById("guess-form");
    const guessInput = document.getElementById("guess-input");
    const guessButton = document.getElementById("guess-button");
    const startButton = document.getElementById("start-button");
    const restartButton = document.getElementById("restart-button");
    const provinceOptions = document.getElementById("province-options");
    const gameLength = 20;
    const excludedNames = new Set(["Côn Đảo"]);
    const aliases = new Map([
        ["ho chi minh", "hồ chí minh"],
        ["ha noi", "hà nội"],
        ["thua thien hue", "thừa thiên huế"]
    ]);

    let provinces = [];
    let mapSvg = null;
    let target = null;
    let score = 0;
    let endTime = 0;
    let timerId = null;
    let gameRunning = false;

    function normalizeName(value) {
        const normalized = value
            .trim()
            .toLocaleLowerCase("vi")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
        return aliases.get(normalized) || normalized;
    }

    function getRings(geometry) {
        if (geometry.type === "Polygon") {
            return geometry.coordinates;
        }
        if (geometry.type === "MultiPolygon") {
            return geometry.coordinates.flat();
        }
        return [];
    }

    function renderMap(features) {
        const renderable = features.map((feature) => ({
            feature,
            name: feature.properties.shapeName.trim(),
            rings: getRings(feature.geometry).filter((ring) => {
                const averageLongitude = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
                return averageLongitude < 112;
            })
        })).filter((region) => region.rings.length > 0);

        const points = renderable.flatMap((region) => region.rings.flat());
        const longitudes = points.map((point) => point[0]);
        const latitudes = points.map((point) => point[1]);
        const minLongitude = Math.min(...longitudes);
        const maxLongitude = Math.max(...longitudes);
        const minLatitude = Math.min(...latitudes);
        const maxLatitude = Math.max(...latitudes);
        const cosine = Math.cos(16 * Math.PI / 180);
        const scale = Math.min(540 / ((maxLongitude - minLongitude) * cosine), 730 / (maxLatitude - minLatitude));
        const offsetX = (620 - (maxLongitude - minLongitude) * cosine * scale) / 2;
        const offsetY = (780 - (maxLatitude - minLatitude) * scale) / 2;
        const svgNamespace = "http://www.w3.org/2000/svg";
        mapSvg = document.createElementNS(svgNamespace, "svg");
        mapSvg.setAttribute("viewBox", "0 0 620 780");
        mapSvg.setAttribute("role", "img");
        mapSvg.setAttribute("aria-label", "Bản đồ các tỉnh thành Việt Nam");
        mapSvg.setAttribute("focusable", "false");

        provinces = renderable
            .filter((region) => !excludedNames.has(region.name))
            .map((region) => ({
                name: region.name === "Ho Chi Minh" ? "Hồ Chí Minh" : region.name,
                normalizedName: normalizeName(region.name === "Ho Chi Minh" ? "Hồ Chí Minh" : region.name),
                elements: []
            }));

        for (const region of renderable) {
            const paths = region.rings.map((ring) => ring.map((point, index) => {
                const x = offsetX + (point[0] - minLongitude) * cosine * scale;
                const y = offsetY + (maxLatitude - point[1]) * scale;
                return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            }).join(" ") + " Z").join(" ");
            const path = document.createElementNS(svgNamespace, "path");
            path.setAttribute("d", paths);
            path.setAttribute("class", "province-shape");
            path.setAttribute("aria-hidden", "true");
            mapSvg.append(path);

            const provinceName = region.name === "Ho Chi Minh" ? "Hồ Chí Minh" : region.name;
            const province = provinces.find((item) => item.name === provinceName);
            if (province) {
                province.elements.push(path);
            }
        }

        mapContainer.replaceChildren(mapSvg);
        provinceOptions.replaceChildren(...provinces.map((province) => {
            const option = document.createElement("option");
            option.value = province.name;
            return option;
        }));
    }

    function selectTarget() {
        if (provinces.length === 0) {
            throw new Error("Bản đồ không có tỉnh/thành để chơi.");
        }
        if (target) {
            target.elements.forEach((element) => element.classList.remove("is-target"));
        }
        const available = provinces.filter((province) => province !== target);
        target = available[Math.floor(Math.random() * available.length)];
        target.elements.forEach((element) => element.classList.add("is-target"));
        mapSvg.setAttribute("aria-label", `Bản đồ các tỉnh thành Việt Nam. Tỉnh/thành được tô đỏ: ${target.name}.`);
    }

    function updateTimer() {
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        timerElement.textContent = String(remaining);
        timerFill.style.width = `${(remaining / gameLength) * 100}%`;
        timerTrack.setAttribute("aria-valuenow", String(remaining));
        if (remaining === 0) {
            finishGame();
        }
    }

    function startGame() {
        if (provinces.length === 0) {
            return;
        }
        clearInterval(timerId);
        score = 0;
        target = null;
        gameRunning = true;
        scoreElement.textContent = "Điểm: 0";
        gameMessage.textContent = "Bản đồ đã sẵn sàng. Đoán thật nhanh!";
        guessInput.value = "";
        guessInput.disabled = false;
        guessButton.disabled = false;
        startButton.hidden = true;
        restartButton.hidden = true;
        endTime = Date.now() + gameLength * 1000;
        selectTarget();
        updateTimer();
        timerId = window.setInterval(updateTimer, 200);
        guessInput.focus();
    }

    function finishGame() {
        if (!gameRunning) {
            return;
        }
        gameRunning = false;
        clearInterval(timerId);
        guessInput.disabled = true;
        guessButton.disabled = true;
        timerElement.textContent = "0";
        timerFill.style.width = "0%";
        timerTrack.setAttribute("aria-valuenow", "0");
        gameMessage.textContent = `Hết giờ! Bạn đoán đúng ${score} tỉnh/thành. Đáp án cuối cùng: ${target.name}.`;
        restartButton.hidden = false;
    }

    guessForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!gameRunning || !target) {
            return;
        }

        if (normalizeName(guessInput.value) === target.normalizedName) {
            score += 1;
            scoreElement.textContent = `Điểm: ${score}`;
            gameMessage.textContent = `Chính xác! Đó là ${target.name}.`;
            selectTarget();
        } else {
            gameMessage.textContent = "Chưa đúng, thử lại nhé!";
        }
        guessInput.value = "";
        guessInput.focus();
    });

    startButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", startGame);

    fetch("vietnam-provinces.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Không tải được dữ liệu bản đồ (HTTP ${response.status}).`);
            }
            return response.json();
        })
        .then((data) => {
            if (!Array.isArray(data.features) || data.features.length === 0) {
                throw new Error("Dữ liệu bản đồ không có tỉnh/thành.");
            }
            renderMap(data.features);
            mapMessage.remove();
            startButton.disabled = false;
        })
        .catch((error) => {
            mapMessage.textContent = `Không thể tải bản đồ: ${error.message}`;
            gameMessage.textContent = "Hãy tải lại trang hoặc kiểm tra kết nối tới máy chủ.";
        });
})();
