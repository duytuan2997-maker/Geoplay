const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { promisify } = require("node:util");
const { DatabaseSync } = require("node:sqlite");

const scrypt = promisify(crypto.scrypt);
const root = __dirname;
const dataDirectory = path.join(root, "data");
const databasePath = process.env.DB_PATH || path.join(dataDirectory, "accounts.sqlite");
const port = Number(process.env.PORT) || 3000;
const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
const maxRequestBytes = 140 * 1024;
const maxAvatarBytes = 96 * 1024;
const rateLimitWindow = 15 * 60 * 1000;
const maxAuthRequests = 60;
const rateLimits = new Map();
const dummySalt = crypto.randomBytes(16);
const production = process.env.NODE_ENV === "production";

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        avatar_data TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
`);
const userColumns = database.prepare("PRAGMA table_info(users)").all();
if (!userColumns.some((column) => column.name === "avatar_data")) {
    database.exec("ALTER TABLE users ADD COLUMN avatar_data TEXT");
}
database.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

function sendJson(response, statusCode, payload, headers = {}) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers
    });
    response.end(JSON.stringify(payload));
}

function getCookie(request, name) {
    const cookieHeader = request.headers.cookie || "";
    const cookie = cookieHeader.split(";").map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));
    return cookie ? cookie.slice(name.length + 1) : null;
}

function sessionCookie(token, maxAge) {
    const secure = production ? "; Secure" : "";
    return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function createSession(userId, response) {
    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    database.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .run(tokenHash, userId, Date.now() + sessionLifetime);
    response.setHeader("Set-Cookie", sessionCookie(token, sessionLifetime / 1000));
}

function getSessionUser(request) {
    const token = getCookie(request, "session");
    if (!token) return null;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = database.prepare(`
        SELECT users.id, users.username, users.avatar_data, sessions.expires_at
        FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?
    `).get(tokenHash);
    if (!session || session.expires_at <= Date.now()) {
        if (session) database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
        return null;
    }
    return session;
}

function validateAvatarData(dataUrl) {
    if (typeof dataUrl !== "string") {
        throw new HttpError(400, "Ảnh đại diện không hợp lệ.");
    }
    const match = dataUrl.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]*={0,2})$/);
    if (!match || match[2].length > Math.ceil(maxAvatarBytes / 3) * 4) {
        throw new HttpError(400, "Ảnh phải là PNG, JPEG hoặc WebP và không quá 96 KB.");
    }
    const image = Buffer.from(match[2], "base64");
    if (image.length > maxAvatarBytes || image.length === 0) {
        throw new HttpError(400, "Ảnh đại diện không được lớn hơn 96 KB.");
    }

    const validSignature = match[1] === "png"
        ? image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : match[1] === "jpeg"
            ? image[0] === 255 && image[1] === 216 && image[2] === 255
            : image.toString("ascii", 0, 4) === "RIFF" &&
                image.toString("ascii", 8, 12) === "WEBP";
    if (!validSignature) {
        throw new HttpError(400, "Định dạng ảnh không khớp với nội dung tệp.");
    }
    return dataUrl;
}

function validateCredentials(username, password) {
    if (typeof username !== "string" || !/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
        throw new HttpError(400, "Tên đăng nhập phải có 3-24 ký tự gồm chữ, số hoặc dấu gạch dưới.");
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
        throw new HttpError(400, "Mật khẩu phải có từ 8 đến 128 ký tự.");
    }
    return username.toLowerCase();
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        if (!String(request.headers["content-type"] || "").includes("application/json")) {
            reject(new HttpError(415, "Yêu cầu phải gửi dữ liệu JSON."));
            return;
        }

        let body = "";
        let settled = false;
        request.on("data", (chunk) => {
            if (settled) return;
            body += chunk;
            if (Buffer.byteLength(body) > maxRequestBytes) {
                settled = true;
                reject(new HttpError(413, "Dữ liệu gửi lên quá lớn."));
            }
        });
        request.on("end", () => {
            if (settled) return;
            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new HttpError(400, "Dữ liệu JSON không hợp lệ."));
            }
        });
        request.on("error", (error) => {
            if (!settled) reject(error);
        });
    });
}

function checkRateLimit(request, response) {
    const now = Date.now();
    const address = request.socket.remoteAddress || "unknown";
    let record = rateLimits.get(address);
    if (!record || record.resetAt <= now) {
        record = { count: 0, resetAt: now + rateLimitWindow };
        rateLimits.set(address, record);
    }
    record.count += 1;
    if (record.count > maxAuthRequests) {
        const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
        sendJson(response, 429, { error: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau." }, {
            "Retry-After": String(retryAfter)
        });
        return false;
    }
    return true;
}

async function handleApi(request, response, pathname) {
    if (request.method === "GET" && pathname === "/api/me") {
        const user = getSessionUser(request);
        if (!user) {
            sendJson(response, 200, { user: null }, {
                "Set-Cookie": sessionCookie("", 0)
            });
            return;
        }
        sendJson(response, 200, {
            user: { id: user.id, username: user.username, avatar: user.avatar_data }
        });
        return;
    }

    if (request.method === "POST" && pathname === "/api/avatar") {
        const user = getSessionUser(request);
        if (!user) throw new HttpError(401, "Vui lòng đăng nhập để đổi ảnh đại diện.");
        const body = await readJson(request);
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            throw new HttpError(400, "Dữ liệu ảnh đại diện không hợp lệ.");
        }
        const avatar = validateAvatarData(body.avatar);
        database.prepare("UPDATE users SET avatar_data = ? WHERE id = ?").run(avatar, user.id);
        sendJson(response, 200, {
            user: { id: user.id, username: user.username, avatar }
        });
        return;
    }

    if (request.method === "POST" && (pathname === "/api/register" || pathname === "/api/login")) {
        if (!checkRateLimit(request, response)) return;
        const body = await readJson(request);
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            throw new HttpError(400, "Dữ liệu tài khoản không hợp lệ.");
        }
        const username = validateCredentials(body.username, body.password);

        if (pathname === "/api/register") {
            const salt = crypto.randomBytes(16);
            const passwordHash = await scrypt(body.password, salt, 64);
            let result;
            try {
                result = database.prepare(`
                    INSERT INTO users (username, password_salt, password_hash, created_at)
                    VALUES (?, ?, ?, ?)
                `).run(username, salt.toString("hex"), passwordHash.toString("hex"), Date.now());
            } catch (error) {
                if (error.errcode === 2067) {
                    throw new HttpError(409, "Tên đăng nhập này đã được sử dụng.");
                }
                throw error;
            }
            createSession(Number(result.lastInsertRowid), response);
            sendJson(response, 201, { user: { id: Number(result.lastInsertRowid), username } }, {
                "Set-Cookie": response.getHeader("Set-Cookie")
            });
            return;
        }

        const user = database.prepare(
            "SELECT id, username, password_salt, password_hash FROM users WHERE username = ?"
        ).get(username);
        const salt = user ? Buffer.from(user.password_salt, "hex") : dummySalt;
        const expectedHash = user ? Buffer.from(user.password_hash, "hex") : Buffer.alloc(64);
        const actualHash = await scrypt(body.password, salt, 64);
        if (!user || !crypto.timingSafeEqual(actualHash, expectedHash)) {
            throw new HttpError(401, "Tên đăng nhập hoặc mật khẩu không đúng.");
        }
        createSession(user.id, response);
        sendJson(response, 200, { user: { id: user.id, username: user.username } }, {
            "Set-Cookie": response.getHeader("Set-Cookie")
        });
        return;
    }

    if (request.method === "POST" && pathname === "/api/logout") {
        const token = getCookie(request, "session");
        if (token) {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
        }
        sendJson(response, 200, { user: null }, { "Set-Cookie": sessionCookie("", 0) });
        return;
    }

    if (pathname.startsWith("/api/")) {
        sendJson(response, 404, { error: "Không tìm thấy API." });
        return;
    }
    return false;
}

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
};

async function serveStatic(request, response, pathname) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        sendJson(response, 405, { error: "Phương thức không được hỗ trợ." }, { Allow: "GET, HEAD" });
        return;
    }

    let decodedPath;
    try {
        decodedPath = decodeURIComponent(pathname);
    } catch {
        throw new HttpError(400, "Đường dẫn không hợp lệ.");
    }
    const filePath = path.resolve(root, `.${decodedPath === "/" ? "/index.html" : decodedPath}`);
    const relativePath = path.relative(root, filePath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        throw new HttpError(404, "Không tìm thấy trang.");
    }
    const pathParts = relativePath.split(path.sep);
    if (pathParts.some((part) => part.startsWith(".")) ||
        ["data", "node_modules"].includes(pathParts[0].toLowerCase()) ||
        ["server.js", "package.json", "package-lock.json"].includes(relativePath.toLowerCase())) {
        throw new HttpError(404, "Không tìm thấy trang.");
    }

    const extension = path.extname(filePath).toLowerCase();
    if (!contentTypes[extension]) throw new HttpError(404, "Không tìm thấy trang.");

    let file;
    try {
        file = await fs.promises.readFile(filePath);
    } catch (error) {
        if (error.code === "ENOENT" || error.code === "EISDIR") {
            throw new HttpError(404, "Không tìm thấy trang.");
        }
        throw error;
    }
    response.writeHead(200, {
        "Content-Type": contentTypes[extension],
        "Cache-Control": extension === ".html" || extension === ".js" || extension === ".css"
            ? "no-cache"
            : "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    });
    response.end(request.method === "HEAD" ? undefined : file);
}

const server = http.createServer(async (request, response) => {
    try {
        const url = new URL(request.url, "http://localhost");
        const result = await handleApi(request, response, url.pathname);
        if (result === false) await serveStatic(request, response, url.pathname);
    } catch (error) {
        if (response.headersSent) {
            response.destroy(error);
            return;
        }
        if (error instanceof HttpError) {
            sendJson(response, error.statusCode, { error: error.message });
            return;
        }
        console.error("Request failed:", error);
        sendJson(response, 500, { error: "Máy chủ gặp lỗi. Vui lòng thử lại." });
    }
});

server.listen(port, process.env.HOST || "127.0.0.1", () => {
    console.log(`Website đang chạy tại http://localhost:${port}`);
    if (production) {
        console.warn("Production mode requires HTTPS at the public entry point.");
    }
});

setInterval(() => {
    const now = Date.now();
    database.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
    for (const [address, record] of rateLimits) {
        if (record.resetAt <= now) rateLimits.delete(address);
    }
}, 60 * 60 * 1000).unref();
