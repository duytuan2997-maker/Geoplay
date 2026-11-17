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
    const landMaskCanvas = document.createElement("canvas");
    landMaskCanvas.width = textureWidth;
    landMaskCanvas.height = textureHeight;
    const landMaskContext = landMaskCanvas.getContext("2d", { willReadFrequently: true });

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

    function createNoiseGrid(cellSize, seed) {
        const columns = Math.ceil(textureWidth / cellSize) + 1;
        const rows = Math.ceil(textureHeight / cellSize) + 1;
        const values = new Float32Array(columns * rows);
        let state = seed;
        for (let i = 0; i < values.length; i++) {
            state = (state * 1664525 + 1013904223) >>> 0;
            values[i] = state / 4294967296;
        }
        return { columns, rows, cellSize, values };
    }

    function sampleNoise(grid, x, y) {
        const gridX = x / grid.cellSize;
        const gridY = y / grid.cellSize;
        const left = Math.floor(gridX);
        const top = Math.floor(gridY);
        const fractionX = gridX - left;
        const fractionY = gridY - top;
        const smoothX = fractionX * fractionX * (3 - 2 * fractionX);
        const smoothY = fractionY * fractionY * (3 - 2 * fractionY);
        const topLeft = grid.values[top * grid.columns + left];
        const topRight = grid.values[top * grid.columns + left + 1];
        const bottomLeft = grid.values[(top + 1) * grid.columns + left];
        const bottomRight = grid.values[(top + 1) * grid.columns + left + 1];
        const topValue = topLeft + (topRight - topLeft) * smoothX;
        const bottomValue = bottomLeft + (bottomRight - bottomLeft) * smoothX;
        return topValue + (bottomValue - topValue) * smoothY;
    }

    function drawTexture(landFeatures) {
        const ocean = textureContext.createLinearGradient(0, 0, 0, textureHeight);
        ocean.addColorStop(0, "#123a61");
        ocean.addColorStop(0.5, "#07517b");
        ocean.addColorStop(1, "#062744");
        textureContext.fillStyle = ocean;
        textureContext.fillRect(0, 0, textureWidth, textureHeight);
        landMaskContext.fillStyle = "#000";
        landMaskContext.fillRect(0, 0, textureWidth, textureHeight);

        landFeatures.forEach(function (feature) {
            const polygons = feature.geometry.type === "Polygon"
                ? [feature.geometry.coordinates]
                : feature.geometry.type === "MultiPolygon"
                    ? feature.geometry.coordinates
                    : [];
            polygons.forEach(function (rings) {
                textureContext.beginPath();
                landMaskContext.beginPath();
                rings.forEach(function (ring) {
                    ring.forEach(function (point, index) {
                        const mapped = mapPoint(point[0], point[1]);
                        if (index === 0) {
                            textureContext.moveTo(mapped[0], mapped[1]);
                            landMaskContext.moveTo(mapped[0], mapped[1]);
                        } else {
                            textureContext.lineTo(mapped[0], mapped[1]);
                            landMaskContext.lineTo(mapped[0], mapped[1]);
                        }
                    });
                    textureContext.closePath();
                    landMaskContext.closePath();
                });
                textureContext.fillStyle = "#4d925b";
                textureContext.fill("evenodd");
                landMaskContext.fillStyle = "#fff";
                landMaskContext.fill("evenodd");
            });
            });

        addSurfaceDetail();
    }

    function addSurfaceDetail() {
        const image = textureContext.getImageData(0, 0, textureWidth, textureHeight);
        const pixels = image.data;
        const landMask = landMaskContext.getImageData(0, 0, textureWidth, textureHeight).data;
        const broadNoise = createNoiseGrid(96, 1847);
        const mediumNoise = createNoiseGrid(28, 4171);
        const fineNoise = createNoiseGrid(8, 9277);
        const coastOffsets = [
            -textureWidth - 1, -textureWidth, -textureWidth + 1,
            -1, 1,
            textureWidth - 1, textureWidth, textureWidth + 1
        ];

        for (let y = 0; y < textureHeight; y++) {
            const latitude = 90 - y * 180 / textureHeight;
            const latitudeRatio = Math.abs(latitude) / 90;
            for (let x = 0; x < textureWidth; x++) {
                const index = y * textureWidth + x;
                const pixel = index * 4;
                const broad = sampleNoise(broadNoise, x, y);
                const medium = sampleNoise(mediumNoise, x, y);
                const fine = sampleNoise(fineNoise, x, y);
                const terrain = broad * 0.48 + medium * 0.34 + fine * 0.18;
                const land = landMask[pixel] > 128;
                let red;
                let green;
                let blue;

                if (land) {
                    const desertBelt = (latitude > 12 && latitude < 38) || (latitude < -8 && latitude > -34);
                    if (latitudeRatio > 0.78 || terrain > 0.83) {
                        const snow = Math.max(0, (latitudeRatio - 0.72) * 2.4) + Math.max(0, terrain - 0.78) * 1.8;
                        red = 91 + snow * 137;
                        green = 119 + snow * 126;
                        blue = 78 + snow * 145;
                    } else if (desertBelt && terrain > 0.39) {
                        const relief = (terrain - 0.39) * 74;
                        red = 132 + relief;
                        green = 111 + relief * 0.78;
                        blue = 72 + relief * 0.48;
                    } else {
                        const relief = (terrain - 0.5) * 96;
                        const tropical = latitudeRatio < 0.34;
                        red = (tropical ? 43 : 67) + relief;
                        green = (tropical ? 91 : 108) + relief;
                        blue = (tropical ? 53 : 78) + relief * 0.58;
                    }
                } else {
                    const waterDepth = broad * 0.58 + medium * 0.42;
                    let nearCoast = false;
                    for (let offset = 0; offset < coastOffsets.length; offset++) {
                        if (landMask[(index + coastOffsets[offset]) * 4] > 128) {
                            nearCoast = true;
                            break;
                        }
                    }
                    if (nearCoast) {
                        red = 8 + waterDepth * 16;
                        green = 83 + waterDepth * 42;
                        blue = 119 + waterDepth * 53;
                    } else {
                        red = 4 + waterDepth * 9;
                        green = 28 + waterDepth * 38;
                        blue = 59 + waterDepth * 53;
                    }
                }

                pixels[pixel] = red;
                pixels[pixel + 1] = green;
                pixels[pixel + 2] = blue;
            }
        }
        textureContext.putImageData(image, 0, 0);
        texturePixels = pixels;
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
        if (!imageData || !texturePixels || canvas.width === 0) return;

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
            const light = Math.max(0, x * -0.48 + y * -0.42 + z * 0.77);
            const shade = 0.2 + light * 0.94;
            const edgeGlow = Math.pow(Math.max(0, 1 - z), 2.2) * 0.36;

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

    // Natural Earth 1:110m land outlines are public-domain data.
    fetch("earth-land.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error(`Không tải được đường viền lục địa (HTTP ${response.status}).`);
            }
            return response.json();
        })
        .then(function (data) {
            if (!Array.isArray(data.features) || data.features.length === 0) {
                throw new Error("Dữ liệu đường viền lục địa không hợp lệ.");
            }
            drawTexture(data.features);
            prepareCanvas();
            window.requestAnimationFrame(animate);
        })
        .catch(function (error) {
            console.error("Không thể hiển thị Trái Đất:", error);
            const message = document.createElement("p");
            message.className = "earth-error";
            message.setAttribute("role", "status");
            message.textContent = "Không tải được bản đồ Trái Đất.";
            canvas.parentElement.append(message);
        });
}());
