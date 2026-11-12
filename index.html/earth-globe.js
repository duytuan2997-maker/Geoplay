(function () {
    const canvas = document.getElementById("earth-canvas");
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
        throw new Error("Trình duyệt không hỗ trợ canvas 2D để hiển thị Trái Đất.");
    }

    const textureCanvas = document.createElement("canvas");
    const textureWidth = 1024;
    const textureHeight = 512;
    textureCanvas.width = textureWidth;
    textureCanvas.height = textureHeight;
    const textureContext = textureCanvas.getContext("2d", { willReadFrequently: true });

    const continents = [
        [[-168, 70], [-150, 60], [-135, 57], [-130, 49], [-123, 40], [-117, 32], [-108, 25], [-98, 18], [-88, 16], [-82, 24], [-78, 31], [-73, 42], [-61, 48], [-67, 55], [-82, 60], [-95, 68], [-115, 72], [-135, 70], [-151, 72]],
        [[-81, 12], [-70, 10], [-61, 3], [-52, -5], [-48, -15], [-43, -23], [-50, -32], [-55, -40], [-66, -55], [-73, -47], [-77, -32], [-80, -13]],
        [[-53, 60], [-45, 59], [-38, 67], [-42, 78], [-53, 83], [-61, 78], [-59, 68]],
        [[-11, 36], [-8, 44], [-10, 52], [-5, 58], [3, 60], [10, 55], [18, 58], [27, 70], [42, 68], [54, 72], [70, 68], [82, 72], [99, 70], [112, 62], [130, 54], [143, 49], [151, 59], [166, 60], [178, 52], [170, 43], [151, 40], [140, 36], [130, 32], [121, 24], [112, 22], [106, 10], [98, 7], [91, 20], [81, 7], [73, 9], [67, 24], [57, 25], [50, 30], [43, 36], [34, 34], [28, 40], [21, 37], [14, 45], [5, 44], [-1, 49], [-8, 43]],
        [[-17, 35], [-5, 37], [10, 34], [23, 31], [33, 22], [42, 11], [50, 12], [51, 2], [43, -12], [39, -22], [31, -34], [18, -35], [10, -27], [4, -18], [-1, -6], [-8, 5], [-14, 17]],
        [[112, -11], [130, -12], [143, -17], [153, -27], [147, -39], [134, -36], [120, -32], [114, -22]],
        [[45, -13], [50, -16], [49, -25], [45, -24]],
        [[129, 31], [137, 34], [142, 41], [145, 44], [140, 37]],
        [[95, 5], [105, 0], [115, -4], [124, -9], [130, -5], [122, 2], [114, 1], [108, 7], [100, 8]],
        [[47, -13], [51, -16], [50, -25], [45, -24]]
    ];

    const pi = Math.PI;
    let texturePixels;
    let pixelX = new Float32Array(0);
    let pixelY = new Float32Array(0);
    let pixelZ = new Float32Array(0);
    let pixelIndex = new Uint32Array(0);
    let imageData;
    let rotation = -0.75;
    let tilt = -0.12;
    let dragging = false;
    let previousPointer = null;
    let lastFrame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function mapPoint(longitude, latitude) {
        return [
            (longitude + 180) * textureWidth / 360,
            (90 - latitude) * textureHeight / 180
        ];
    }

    function drawTexture() {
        const ocean = textureContext.createLinearGradient(0, 0, 0, textureHeight);
        ocean.addColorStop(0, "#6dc8be");
        ocean.addColorStop(0.5, "#188f7d");
        ocean.addColorStop(1, "#164d43");
        textureContext.fillStyle = ocean;
        textureContext.fillRect(0, 0, textureWidth, textureHeight);

        continents.forEach(function (points) {
            textureContext.beginPath();
            points.forEach(function (point, index) {
                const mapped = mapPoint(point[0], point[1]);
                if (index === 0) textureContext.moveTo(mapped[0], mapped[1]);
                else textureContext.lineTo(mapped[0], mapped[1]);
            });
            textureContext.closePath();
            textureContext.fillStyle = "#4d925b";
            textureContext.fill();
            textureContext.lineWidth = 1.6;
            textureContext.strokeStyle = "rgba(224, 225, 167, 0.82)";
            textureContext.stroke();
        });

        [[-27, 64], [-18, 66], [138, 36], [121, 14], [-4, 54], [48, -19], [146, -6]]
            .forEach(function (point) {
                const mapped = mapPoint(point[0], point[1]);
                textureContext.beginPath();
                textureContext.arc(mapped[0], mapped[1], 4, 0, pi * 2);
                textureContext.fillStyle = "#78b66b";
                textureContext.fill();
            });

        texturePixels = textureContext.getImageData(0, 0, textureWidth, textureHeight).data;
    }

    function prepareCanvas() {
        const bounds = canvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
        const size = Math.max(1, Math.min(520, Math.round(Math.min(bounds.width, bounds.height) * pixelRatio)));
        canvas.width = size;
        canvas.height = size;

        const center = (size - 1) / 2;
        const radius = size * 0.485;
        const points = [];
        for (let y = 0; y < size; y++) {
            const ny = (center - y) / radius;
            for (let x = 0; x < size; x++) {
                const nx = (x - center) / radius;
                const distance = nx * nx + ny * ny;
                if (distance <= 1) {
                    points.push(nx, ny, Math.sqrt(1 - distance), y * size + x);
                }
            }
        }

        const count = points.length / 4;
        pixelX = new Float32Array(count);
        pixelY = new Float32Array(count);
        pixelZ = new Float32Array(count);
        pixelIndex = new Uint32Array(count);
        for (let i = 0; i < count; i++) {
            pixelX[i] = points[i * 4];
            pixelY[i] = points[i * 4 + 1];
            pixelZ[i] = points[i * 4 + 2];
            pixelIndex[i] = points[i * 4 + 3];
        }
        imageData = context.createImageData(size, size);
    }

    function renderGlobe() {
        if (!imageData || canvas.width === 0) return;

        const cosRotation = Math.cos(rotation);
        const sinRotation = Math.sin(rotation);
        const cosTilt = Math.cos(tilt);
        const sinTilt = Math.sin(tilt);
        const output = imageData.data;
        output.fill(0);

        for (let i = 0; i < pixelX.length; i++) {
            const x = pixelX[i];
            const y = pixelY[i];
            const z = pixelZ[i];
            const rotatedX = x * cosRotation + z * sinRotation;
            const rotatedZ = -x * sinRotation + z * cosRotation;
            const tiltedY = y * cosTilt - rotatedZ * sinTilt;
            const tiltedZ = y * sinTilt + rotatedZ * cosTilt;
            const longitude = Math.atan2(rotatedX, tiltedZ);
            const latitude = Math.asin(Math.max(-1, Math.min(1, tiltedY)));
            const textureX = (Math.floor((longitude / (pi * 2) + 0.5) * textureWidth) + textureWidth) % textureWidth;
            const textureY = Math.max(0, Math.min(textureHeight - 1, Math.floor((0.5 - latitude / pi) * textureHeight)));
            const sourceIndex = (textureY * textureWidth + textureX) * 4;
            const targetIndex = pixelIndex[i];
            const light = Math.max(0, x * -0.5 + y * -0.55 + z * 0.68);
            const shade = 0.22 + light * 0.9;
            const edgeGlow = Math.max(0, 1 - z) * 0.16;

            output[targetIndex * 4] = Math.min(255, texturePixels[sourceIndex] * shade + 40 * edgeGlow);
            output[targetIndex * 4 + 1] = Math.min(255, texturePixels[sourceIndex + 1] * shade + 125 * edgeGlow);
            output[targetIndex * 4 + 2] = Math.min(255, texturePixels[sourceIndex + 2] * shade + 205 * edgeGlow);
            output[targetIndex * 4 + 3] = 255;
        }
        context.putImageData(imageData, 0, 0);
    }

    function animate(timestamp) {
        window.requestAnimationFrame(animate);
        if (timestamp - lastFrame < 33) return;
        const elapsed = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.08) : 0;
        lastFrame = timestamp;
        if (!dragging && !reducedMotion) rotation += elapsed * 0.12;
        renderGlobe();
    }

    canvas.addEventListener("pointerdown", function (event) {
        dragging = true;
        previousPointer = { x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", function (event) {
        if (!dragging || !previousPointer) return;
        const bounds = canvas.getBoundingClientRect();
        rotation += (event.clientX - previousPointer.x) / Math.max(bounds.width, 1) * pi * 2;
        tilt = Math.max(-1.1, Math.min(1.1, tilt + (event.clientY - previousPointer.y) / Math.max(bounds.height, 1) * pi));
        previousPointer = { x: event.clientX, y: event.clientY };
        renderGlobe();
    });

    function stopDragging() {
        dragging = false;
        previousPointer = null;
    }

    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    window.addEventListener("resize", function () {
        prepareCanvas();
        renderGlobe();
    });

    drawTexture();
    prepareCanvas();
    window.requestAnimationFrame(animate);
}());
