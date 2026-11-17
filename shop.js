document.addEventListener("DOMContentLoaded", function () {
    const dialog = document.getElementById("shop-dialog");
    const openButton = document.getElementById("shop-open");
    const closeButton = document.getElementById("shop-close");
    const itemsElement = document.getElementById("shop-items");
    const coinsElement = document.getElementById("shop-coins");
    const messageElement = document.getElementById("shop-message");
    const profileAvatar = document.getElementById("account-avatar");
    if (!dialog || !openButton || !itemsElement) return;

    const catalog = [
        { id: "gold", name: "Viền hoàng kim", type: "frame", price: 120, description: "Viền vàng sáng cho avatar hồ sơ và chat." },
        { id: "sakura", name: "Diềm hoa anh đào", type: "trim", price: 180, description: "Cánh hoa điểm quanh avatar trong khung chat." },
        { id: "ocean", name: "Viền đại dương", type: "frame", price: 150, description: "Sắc xanh biển nổi bật quanh avatar." }
    ];
    const ownedKey = "geoplay.shop.owned";
    const equippedKey = "geoplay.shop.equipped";
    const namesById = Object.fromEntries(catalog.map(function (item) { return [item.id, item]; }));

    function readOwned() {
        try {
            const value = JSON.parse(localStorage.getItem(ownedKey) || "[]");
            return Array.isArray(value) ? value.filter(function (id) { return namesById[id]; }) : [];
        } catch (_) { return []; }
    }

    function readEquipped() {
        try {
            const value = JSON.parse(localStorage.getItem(equippedKey) || "{}");
            return value && typeof value === "object" ? value : {};
        } catch (_) { return {}; }
    }

    function notifyCosmeticsChange() {
        window.dispatchEvent(new CustomEvent("geoplaycosmeticschange", { detail: readEquipped() }));
    }

    function updateProfileAvatar() {
        if (!profileAvatar) return;
        profileAvatar.classList.remove("avatar-frame-gold", "avatar-frame-ocean", "avatar-trim-sakura");
        const equipped = readEquipped();
        if (equipped.frame) profileAvatar.classList.add("avatar-frame-" + equipped.frame);
        if (equipped.trim) profileAvatar.classList.add("avatar-trim-" + equipped.trim);
    }

    function render() {
        const owned = readOwned();
        const equipped = readEquipped();
        const coins = Number(localStorage.getItem("geoCoins")) || 0;
        coinsElement.textContent = coins.toLocaleString("vi-VN");
        itemsElement.replaceChildren();
        catalog.forEach(function (item) {
            const card = document.createElement("article");
            card.className = "shop-item";
            card.classList.add(item.type === "frame" ? "shop-preview-frame-" + item.id : "shop-preview-trim-" + item.id);
            const preview = document.createElement("div");
            preview.className = "shop-avatar-preview " + (item.type === "frame" ? "avatar-frame-" + item.id : "avatar-trim-" + item.id);
            preview.textContent = "G";
            const detail = document.createElement("div");
            detail.className = "shop-item-copy";
            const title = document.createElement("h3");
            title.textContent = item.name;
            const description = document.createElement("p");
            description.textContent = item.description;
            const price = document.createElement("span");
            price.className = "shop-price";
            price.textContent = "🪙 " + item.price.toLocaleString("vi-VN");
            detail.append(title, description, price);
            const action = document.createElement("button");
            action.type = "button";
            const equippedNow = equipped[item.type] === item.id;
            const isOwned = owned.includes(item.id);
            action.textContent = equippedNow ? "Đang dùng" : isOwned ? "Trang bị" : "Mua";
            action.disabled = equippedNow;
            action.addEventListener("click", function () {
                messageElement.textContent = "";
                if (!isOwned) {
                    const balance = Number(localStorage.getItem("geoCoins")) || 0;
                    if (balance < item.price) {
                        messageElement.textContent = "Bạn chưa có đủ Geo Coin.";
                        return;
                    }
                    localStorage.setItem("geoCoins", String(balance - item.price));
                    localStorage.setItem(ownedKey, JSON.stringify(owned.concat(item.id)));
                }
                const current = readEquipped();
                current[item.type] = item.id;
                localStorage.setItem(equippedKey, JSON.stringify(current));
                updateProfileAvatar();
                notifyCosmeticsChange();
                window.dispatchEvent(new Event("accountstatschange"));
                render();
                messageElement.textContent = "Đã trang bị " + item.name + ".";
            });
            card.append(preview, detail, action);
            itemsElement.appendChild(card);
        });
    }

    openButton.addEventListener("click", function () {
        if (!document.getElementById("account-status").textContent.trim()) return;
        render();
        dialog.showModal();
    });
    closeButton.addEventListener("click", function () { dialog.close(); });
    window.addEventListener("accountstatschange", updateProfileAvatar);
    window.addEventListener("geoplaycosmeticschange", updateProfileAvatar);
    updateProfileAvatar();
});
