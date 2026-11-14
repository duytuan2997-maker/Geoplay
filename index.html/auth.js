document.addEventListener("DOMContentLoaded", function () {
    const dialog = document.getElementById("account-dialog");
    const form = document.getElementById("account-form");
    const emailInput = document.getElementById("account-email");
    const usernameField = document.getElementById("account-username-field");
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
    const sessionKey = "geoplay.supabase.session";
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

    function getDisplayUser(user) {
        const metadata = user.user_metadata || {};
        const emailName = user.email ? user.email.split("@")[0] : "Học viên";
        return {
            username: metadata.username || emailName,
            avatar: metadata.avatar || ""
        };
    }

    function showUser(user) {
        const displayUser = user ? getDisplayUser(user) : null;
        status.textContent = displayUser ? displayUser.username : "";
        avatarInitial.textContent = displayUser ? displayUser.username.charAt(0).toUpperCase() : "?";
        avatarImage.hidden = !displayUser || !displayUser.avatar;
        avatarInitial.hidden = Boolean(displayUser && displayUser.avatar);
        if (displayUser && displayUser.avatar) avatarImage.src = displayUser.avatar;
        else avatarImage.removeAttribute("src");
        avatarMessage.hidden = true;
        profile.hidden = !displayUser;
        openButton.hidden = Boolean(displayUser);
        if (displayUser) updateAccountStats();
    }

    function setMessage(text, success) {
        message.textContent = text;
        message.classList.toggle("account-message-success", Boolean(success));
    }

    function getSupabaseConfig() {
        const config = window.SUPABASE_CONFIG;
        if (!config || typeof config.url !== "string" || typeof config.anonKey !== "string" ||
            config.url.includes("YOUR_PROJECT_ID") || config.anonKey.includes("YOUR_SUPABASE")) {
            throw new Error("Chưa cấu hình Supabase. Hãy điền Project URL và khóa anon/publishable trong supabase-config.js.");
        }

        let projectUrl;
        try {
            projectUrl = new URL(config.url);
        } catch {
            throw new Error("Project URL trong supabase-config.js không hợp lệ.");
        }
        if (projectUrl.protocol !== "https:" || !config.anonKey.trim()) {
            throw new Error("Supabase cần Project URL HTTPS và khóa anon/publishable.");
        }
        return {
            url: projectUrl.origin,
            anonKey: config.anonKey.trim()
        };
    }

    function formatAuthError(result, statusCode) {
        const rawMessage = result.msg || result.message || result.error_description || result.error;
        const text = typeof rawMessage === "string" ? rawMessage : "";
        if (/user already registered/i.test(text)) return "Email này đã được đăng ký.";
        if (result.error_code === "email_not_confirmed" || /email not confirmed/i.test(text)) {
            return "Email chưa được xác nhận. Hãy mở thư Supabase gửi đến hộp thư của bạn.";
        }
        if (/invalid login credentials/i.test(text)) return "Email hoặc mật khẩu không đúng.";
        if (statusCode === 429) return "Bạn thử quá nhiều lần. Hãy đợi một chút rồi thử lại.";
        return text || "Không thể thực hiện yêu cầu tài khoản.";
    }

    async function supabaseRequest(path, options) {
        const config = getSupabaseConfig();
        const requestOptions = options || {};
        const headers = { apikey: config.anonKey };
        if (requestOptions.accessToken) {
            headers.Authorization = `Bearer ${requestOptions.accessToken}`;
        }
        if (requestOptions.body !== undefined) headers["Content-Type"] = "application/json";

        const response = await fetch(`${config.url}/auth/v1/${path}`, {
            method: requestOptions.method || "GET",
            headers: headers,
            body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body)
        });

        const responseText = await response.text();
        let result;
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            throw new Error("Supabase không trả về JSON. Hãy kiểm tra Project URL trong supabase-config.js.");
        }
        if (!response.ok) {
            const error = new Error(formatAuthError(result, response.status));
            error.status = response.status;
            throw error;
        }
        return result;
    }

    function getSessionFromResponse(result) {
        if (result.session) return result.session;
        return result.access_token && result.refresh_token ? result : null;
    }

    function getUserFromResponse(result) {
        return result.user || result;
    }

    function saveSession(session) {
        if (!session || !session.access_token || !session.refresh_token) {
            throw new Error("Supabase không trả về phiên đăng nhập hợp lệ.");
        }
        const savedSession = {
            ...session,
            expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600)
        };
        localStorage.setItem(sessionKey, JSON.stringify(savedSession));
        return savedSession;
    }

    function clearSession() {
        localStorage.removeItem(sessionKey);
    }

    function readSession() {
        const stored = localStorage.getItem(sessionKey);
        if (!stored) return null;
        try {
            const session = JSON.parse(stored);
            if (session && session.access_token && session.refresh_token && session.expires_at) {
                return session;
            }
        } catch (error) {
            console.warn("Phiên tài khoản lưu trong trình duyệt không hợp lệ:", error);
        }
        clearSession();
        return null;
    }

    async function getValidSession() {
        const session = readSession();
        if (!session) return null;
        if (session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;

        const refreshed = await supabaseRequest("token?grant_type=refresh_token", {
            method: "POST",
            body: { refresh_token: session.refresh_token }
        });
        return saveSession(refreshed);
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
        usernameField.hidden = !registering;
        usernameInput.required = registering;
        passwordInput.autocomplete = registering ? "new-password" : "current-password";
        setMessage("", false);
    }

    openButton.addEventListener("click", function () {
        setMode("login");
        dialog.showModal();
        emailInput.focus();
    });

    document.getElementById("account-close").addEventListener("click", function () {
        dialog.close();
    });

    modeButton.addEventListener("click", function () {
        setMode(mode === "login" ? "register" : "login");
        if (mode === "register") usernameInput.focus();
        else emailInput.focus();
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        setMessage("", false);
        submitButton.disabled = true;

        try {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            let result;
            if (mode === "register") {
                const redirectTo = `${window.location.origin}${window.location.pathname}`;
                const redirectQuery = new URLSearchParams({ redirect_to: redirectTo });
                result = await supabaseRequest(`signup?${redirectQuery}`, {
                    method: "POST",
                    body: {
                        email: email,
                        password: password,
                        data: { username: usernameInput.value.trim() }
                    }
                });
                if (!getSessionFromResponse(result)) {
                    setMode("login");
                    emailInput.value = email;
                    passwordInput.value = "";
                    setMessage("Đã tạo tài khoản. Hãy xác nhận email trong hộp thư rồi đăng nhập.", true);
                    return;
                }
            } else {
                result = await supabaseRequest("token?grant_type=password", {
                    method: "POST",
                    body: { email: email, password: password }
                });
            }

            const session = getSessionFromResponse(result);
            if (!session) throw new Error("Supabase không trả về phiên đăng nhập. Hãy xác nhận email rồi thử đăng nhập.");
            saveSession(session);
            showUser(getUserFromResponse(result));
            dialog.close();
            form.reset();
            setMode("login");
        } catch (error) {
            setMessage(error instanceof TypeError
                ? "Không thể kết nối Supabase. Hãy kiểm tra mạng và cấu hình dự án."
                : error.message, false);
        } finally {
            submitButton.disabled = false;
        }
    });

    logoutButton.addEventListener("click", async function () {
        logoutButton.disabled = true;
        try {
            const session = await getValidSession();
            if (session) {
                await supabaseRequest("logout", {
                    method: "POST",
                    accessToken: session.access_token
                });
            }
            clearSession();
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
            const session = await getValidSession();
            if (!session) throw new Error("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.");
            const user = await supabaseRequest("user", {
                method: "PUT",
                accessToken: session.access_token,
                body: { data: { avatar: avatarData } }
            });
            showUser(user);
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

    async function restoreSession() {
        openButton.hidden = false;
        profile.hidden = true;
        const config = window.SUPABASE_CONFIG;
        if (!config || !config.url || config.url.includes("YOUR_PROJECT_ID") ||
            !config.anonKey || config.anonKey.includes("YOUR_SUPABASE")) return;

        try {
            const session = await getValidSession();
            if (!session) return;
            const user = await supabaseRequest("user", { accessToken: session.access_token });
            showUser(user);
        } catch (error) {
            if (error.status === 401) clearSession();
            console.error("Không thể khôi phục phiên Supabase:", error);
        }
    }

    restoreSession();
    window.addEventListener("storage", updateAccountStats);
    window.addEventListener("accountstatschange", updateAccountStats);
});
