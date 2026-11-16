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

    function appendMessage(message) {
        const item = document.createElement("li");
        item.className = "chat-message";
        if (message.user_id === chatUser.id) item.classList.add("chat-message-own");

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
        item.append(heading, content);
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
                "chat_messages?select=id,user_id,username,content,created_at&order=created_at.desc&limit=100",
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
                    : emailUsername || "Học viên").trim().slice(0, 32)
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
        if (chatUser) {
            loadMessages();
            startPolling();
        } else {
            startChat();
        }
    });

    closeButton.addEventListener("click", function () {
        dialog.close();
    });
    dialog.addEventListener("close", stopPolling);
});
