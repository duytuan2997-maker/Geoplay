(function () {
    const sessionKey = "geoplay.supabase.session";

    function getConfig() {
        const config = window.SUPABASE_CONFIG;
        if (!config || typeof config.url !== "string" || typeof config.anonKey !== "string" ||
            config.url.includes("YOUR_PROJECT_ID") || config.anonKey.includes("YOUR_SUPABASE")) {
            throw new Error("Chưa cấu hình Supabase trong supabase-config.js.");
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
        return { url: projectUrl.origin, anonKey: config.anonKey.trim() };
    }

    async function readResponse(response) {
        const responseText = await response.text();
        let result;
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            throw new Error("Supabase không trả về JSON.");
        }
        if (!response.ok) {
            const error = new Error(
                result.message || result.msg || result.details || result.error_description ||
                result.error || "Không thể thực hiện yêu cầu Supabase."
            );
            error.status = response.status;
            throw error;
        }
        return result;
    }

    async function authRequest(path, options) {
        const config = getConfig();
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
        return readResponse(response);
    }

    async function dataRequest(path, options) {
        const config = getConfig();
        const requestOptions = options || {};
        const headers = { apikey: config.anonKey };
        if (requestOptions.session) {
            headers.Authorization = `Bearer ${requestOptions.session.access_token}`;
        }
        if (requestOptions.body !== undefined) {
            headers["Content-Type"] = "application/json";
            headers.Prefer = "resolution=merge-duplicates,return=minimal";
        }

        const response = await fetch(`${config.url}/rest/v1/${path}`, {
            method: requestOptions.method || "GET",
            headers: headers,
            body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body)
        });
        return readResponse(response);
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
        localStorage.removeItem(sessionKey);
        return null;
    }

    async function getValidSession() {
        const session = readSession();
        if (!session) return null;
        if (session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;

        const refreshed = await authRequest("token?grant_type=refresh_token", {
            method: "POST",
            body: { refresh_token: session.refresh_token }
        });
        if (!refreshed.access_token || !refreshed.refresh_token) {
            throw new Error("Supabase không trả về phiên đăng nhập hợp lệ.");
        }
        refreshed.expires_at = refreshed.expires_at ||
            Math.floor(Date.now() / 1000) + (refreshed.expires_in || 3600);
        localStorage.setItem(sessionKey, JSON.stringify(refreshed));
        return refreshed;
    }

    window.geoplaySupabase = { authRequest, dataRequest, getValidSession };
})();
