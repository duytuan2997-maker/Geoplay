document.addEventListener("DOMContentLoaded", function () {
    const dialog = document.getElementById("chat-dialog");
    const openButton = document.getElementById("account-chat-open");
    const closeButton = document.getElementById("chat-close");
    const messagesElement = document.getElementById("chat-messages");
    const statusElement = document.getElementById("chat-status");
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-message-input");
    const sendButton = document.getElementById("chat-send");
    const supabase = window.geoplaySupabase;
    let chatUser = null;
    let loadingMessages = false;
    let pollTimer = null;

    function stopPolling() {
        if (pollTimer) {
            window.clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    function startPolling() {
        if (!pollTimer) pollTimer = window.setInterval(loadMessages, 4000);
    }

    function showChatError(error) {
        console.error("Không thể tải kênh chat:", error);
        statusElement.textContent =
            "Không thể kết nối kênh chat. Hãy kiểm tra cấu hình Supabase và chạy supabase-chat.sql.";
    }

    function getSafeAvatar(avatar) {
        if (typeof avatar !== "string" || avatar.length > 140000 ||
            !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar)) {
            return null;
        }
        return avatar;
    }

    async function getChatAvatar() {
        const equipped = JSON.parse(localStorage.getItem("geoplay.shop.equipped") || "{}");
        if (!equipped.frame && !equipped.trim) return chatUser.avatar;

        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext("2d");
        if (!context) return chatUser.avatar;
        context.save();
        context.beginPath();
        context.arc(128, 128, 105, 0, Math.PI * 2);
        context.clip();
        if (chatUser.avatar) {
            const image = new Image();
            image.src = chatUser.avatar;
            await new Promise(function (resolve) {
                image.onload = resolve;
                image.onerror = resolve;
            });
            if (image.naturalWidth) {
                const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
                context.drawImage(image,
                    (image.naturalWidth - cropSize) / 2,
                    (image.naturalHeight - cropSize) / 2,
                    cropSize, cropSize, 23, 23, 210, 210);
            } else {
                drawInitial();
            }
        } else {
            drawInitial();
        }
        context.restore();

        function drawInitial() {
            context.fillStyle = "#258052";
            context.fillRect(0, 0, 256, 256);
            context.fillStyle = "#ffffff";
            context.font = "bold 112px Segoe UI, sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(chatUser.username.charAt(0).toLocaleUpperCase("vi-VN") || "?", 128, 132);
        }

        const frameColors = { gold: "#f4c74e", ocean: "#47cde0" };
        if (frameColors[equipped.frame]) {
            context.beginPath();
            context.arc(128, 128, 113, 0, Math.PI * 2);
            context.strokeStyle = frameColors[equipped.frame];
            context.lineWidth = 15;
            context.stroke();
        }
        if (equipped.trim === "sakura") {
            [[128, 13], [243, 128], [128, 243], [13, 128]].forEach(function (point) {
                context.fillStyle = "#ffb1cd";
                context.beginPath();
                context.arc(point[0], point[1], 11, 0, Math.PI * 2);
                context.fill();
                context.fillStyle = "#ffe98a";
                context.beginPath();
                context.arc(point[0], point[1], 4, 0, Math.PI * 2);
                context.fill();
            });
        }
        return canvas.toDataURL("image/jpeg", 0.88);
    }

    function appendMessage(message) {
        const item = document.createElement("li");
        item.className = "chat-message";
        if (message.user_id === chatUser.id) item.classList.add("chat-message-own");

        const avatar = document.createElement("span");
        avatar.className = "chat-message-avatar";
        const avatarUrl = getSafeAvatar(message.avatar);
        if (avatarUrl) {
            const image = document.createElement("img");
            image.src = avatarUrl;
            image.alt = "";
            avatar.appendChild(image);
        } else {
            avatar.textContent = message.username.trim().charAt(0).toLocaleUpperCase("vi-VN") || "?";
        }

        const body = document.createElement("div");
        body.className = "chat-message-body";
        const heading = document.createElement("div");
        heading.className = "chat-message-heading";
        const username = document.createElement("strong");
        username.textContent = message.username;
        const time = document.createElement("time");
        const createdAt = new Date(message.created_at);
        time.dateTime = createdAt.toISOString();
        time.textContent = createdAt.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });
        heading.append(username, time);

        const content = document.createElement("p");
        content.textContent = message.content;
        body.append(heading, content);
        item.append(avatar, body);
        messagesElement.appendChild(item);
    }

    async function loadMessages() {
        if (loadingMessages || !chatUser) return;
        loadingMessages = true;
        try {
            const session = await supabase.getValidSession();
            if (!session) {
                statusElement.textContent = "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại ở trang chủ.";
                return;
            }
            const wasAtBottom = messagesElement.scrollHeight - messagesElement.scrollTop -
                messagesElement.clientHeight < 48;
            const messages = await supabase.dataRequest(
                "chat_messages?select=id,user_id,username,avatar,content,created_at&order=created_at.desc&limit=100",
                { session: session }
            );
            messagesElement.replaceChildren();
            messages.reverse().forEach(appendMessage);
            if (wasAtBottom) messagesElement.scrollTop = messagesElement.scrollHeight;
            statusElement.textContent = `Đang trò chuyện với tư cách ${chatUser.username}.`;
        } catch (error) {
            showChatError(error);
        } finally {
            loadingMessages = false;
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const content = input.value.trim();
        if (!content || !chatUser) return;

        sendButton.disabled = true;
        try {
            const session = await supabase.getValidSession();
            if (!session) throw new Error("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại ở trang chủ.");
            await supabase.dataRequest("chat_messages", {
                method: "POST",
                session: session,
                body: {
                    user_id: chatUser.id,
                    username: chatUser.username,
                    avatar: await getChatAvatar(),
                    content: content
                }
            });
            input.value = "";
            await loadMessages();
            input.focus();
        } catch (error) {
            showChatError(error);
        } finally {
            sendButton.disabled = false;
        }
    });

    async function startChat() {
        try {
            const session = await supabase.getValidSession();
            if (!session) {
                statusElement.textContent = "Hãy đăng nhập ở trang chủ để tham gia kênh chat.";
                return;
            }
            const user = await supabase.authRequest("user", {
                accessToken: session.access_token
            });
            if (!user || !user.id) throw new Error("Không xác định được tài khoản.");

            const metadataUsername = user.user_metadata && user.user_metadata.username;
            const emailUsername = user.email ? user.email.split("@")[0] : "";
            chatUser = {
                id: user.id,
                username: (typeof metadataUsername === "string" && metadataUsername.trim()
                    ? metadataUsername
                    : emailUsername || "Học viên").trim().slice(0, 32),
                avatar: getSafeAvatar(user.user_metadata && user.user_metadata.avatar)
            };
            input.disabled = false;
            sendButton.disabled = false;
            await loadMessages();
            if (dialog.open) startPolling();
        } catch (error) {
            showChatError(error);
        }
    }

    openButton.addEventListener("click", function () {
        dialog.showModal();
        startChat();
    });

    closeButton.addEventListener("click", function () {
        dialog.close();
    });
    dialog.addEventListener("close", stopPolling);
});
