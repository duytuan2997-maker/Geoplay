document.addEventListener("DOMContentLoaded", function () {
    const dialog = document.getElementById("account-dialog");
    const form = document.getElementById("account-form");
    const usernameInput = document.getElementById("account-username");
    const passwordInput = document.getElementById("account-password");
    const title = document.getElementById("account-title");
    const submitButton = document.getElementById("account-submit");
    const modeButton = document.getElementById("account-mode");
    const message = document.getElementById("account-message");
    const status = document.getElementById("account-status");
    const profile = document.getElementById("account-profile");
    const avatar = document.getElementById("account-avatar");
    const avatarInitial = document.getElementById("account-avatar-initial");
    const avatarImage = document.getElementById("account-avatar-image");
    const avatarInput = document.getElementById("account-avatar-input");
    const avatarMessage = document.getElementById("account-avatar-message");
    const expValue = document.getElementById("account-exp");
    const expFill = document.getElementById("account-exp-fill");
    const coinsValue = document.getElementById("account-coins");
    const openButton = document.getElementById("account-open");
    const logoutButton = document.getElementById("account-logout");
    let mode = "login";

    function updateAccountStats() {
        const exp = Number(localStorage.getItem("xp")) || 0;
        const coins = Number(localStorage.getItem("geoCoins")) || 0;
        const currentExp = exp % 100;
        expValue.textContent = `${currentExp} / 100`;
        expFill.style.width = `${currentExp}%`;
        expFill.parentElement.setAttribute("aria-valuenow", String(currentExp));
        coinsValue.textContent = coins.toLocaleString("vi-VN");
    }

    function showUser(user) {
        status.textContent = user ? user.username : "";
        avatarInitial.textContent = user ? user.username.charAt(0).toUpperCase() : "?";
        avatarImage.hidden = !user || !user.avatar;
        avatarInitial.hidden = Boolean(user && user.avatar);
        if (user && user.avatar) avatarImage.src = user.avatar;
        else avatarImage.removeAttribute("src");
        avatarMessage.hidden = true;
        profile.hidden = !user;
        openButton.hidden = Boolean(user);
        if (user) updateAccountStats();
    }

    async function prepareAvatar(file) {
        if (!file.type.startsWith("image/")) {
            throw new Error("Hãy chọn một tệp ảnh.");
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("Ảnh gốc phải nhỏ hơn 5 MB.");
        }

        const bitmap = await createImageBitmap(file);
        try {
            const size = 256;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Trình duyệt không thể xử lý ảnh này.");

            const cropSize = Math.min(bitmap.width, bitmap.height);
            const cropX = (bitmap.width - cropSize) / 2;
            const cropY = (bitmap.height - cropSize) / 2;
            context.drawImage(bitmap, cropX, cropY, cropSize, cropSize, 0, 0, size, size);
            return canvas.toDataURL("image/jpeg", 0.82);
        } finally {
            bitmap.close();
        }
    }

    function setMode(nextMode) {
        mode = nextMode;
        const registering = mode === "register";
        title.textContent = registering ? "Tạo tài khoản" : "Đăng nhập";
        submitButton.textContent = registering ? "Tạo tài khoản" : "Đăng nhập";
        modeButton.textContent = registering
            ? "Đã có tài khoản? Đăng nhập"
            : "Chưa có tài khoản? Tạo tài khoản";
        passwordInput.autocomplete = registering ? "new-password" : "current-password";
        message.textContent = "";
    }

    async function readApiResponse(response) {
        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error("Máy chủ không trả dữ liệu hợp lệ. Hãy chạy `npm start` và mở trang tại http://localhost:3000.");
        }
        if (!response.ok) {
            throw new Error(result.error || "Không thể thực hiện yêu cầu.");
        }
        return result;
    }

    async function sendRequest(url, payload) {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        return readApiResponse(response);
    }

    openButton.addEventListener("click", function () {
        setMode("login");
        dialog.showModal();
        usernameInput.focus();
    });

    document.getElementById("account-close").addEventListener("click", function () {
        dialog.close();
    });

    modeButton.addEventListener("click", function () {
        setMode(mode === "login" ? "register" : "login");
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        message.textContent = "";
        submitButton.disabled = true;

        try {
            const endpoint = mode === "register" ? "/api/register" : "/api/login";
            const result = await sendRequest(endpoint, {
                username: usernameInput.value.trim(),
                password: passwordInput.value
            });
            showUser(result.user);
            dialog.close();
            form.reset();
            setMode("login");
        } catch (error) {
            message.textContent = error instanceof TypeError
                ? "Không thể kết nối. Hãy khởi động máy chủ website rồi thử lại."
                : error.message;
        } finally {
            submitButton.disabled = false;
        }
    });

    logoutButton.addEventListener("click", async function () {
        logoutButton.disabled = true;
        try {
            await sendRequest("/api/logout", {});
            showUser(null);
        } catch (error) {
            status.textContent = error instanceof TypeError
                ? "Không thể kết nối để đăng xuất."
                : error.message;
        } finally {
            logoutButton.disabled = false;
        }
    });

    avatar.addEventListener("click", function () {
        avatarInput.click();
    });

    avatarInput.addEventListener("change", async function () {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;

        avatar.disabled = true;
        avatarMessage.hidden = false;
        avatarMessage.textContent = "Đang lưu ảnh đại diện...";
        avatarMessage.classList.remove("account-avatar-error");
        try {
            const avatarData = await prepareAvatar(file);
            const result = await sendRequest("/api/avatar", { avatar: avatarData });
            showUser(result.user);
        } catch (error) {
            avatarMessage.hidden = false;
            avatarMessage.textContent = error instanceof TypeError
                ? "Không thể kết nối để lưu ảnh."
                : error.message;
            avatarMessage.classList.add("account-avatar-error");
        } finally {
            avatar.disabled = false;
            avatarInput.value = "";
        }
    });

    fetch("/api/me")
        .then(readApiResponse)
        .then((result) => showUser(result.user))
        .catch(() => {
            openButton.hidden = false;
            profile.hidden = true;
        });

    window.addEventListener("storage", updateAccountStats);
    window.addEventListener("accountstatschange", updateAccountStats);
});
