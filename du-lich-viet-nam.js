const destinations = [
    { name: "Hà Nội", image: "Hanoi_skyline_with_Ba_Vi_Mountain.jpg", article: "Hanoi" },
    { name: "Vịnh Hạ Long", image: "Ha_Long_Bay_in_2019.jpg", article: "Hạ Long Bay" },
    { name: "Sa Pa", image: "Sa_Pa.jpg", article: "Sa Pa" },
    { name: "Cao nguyên đá Đồng Văn", image: "SaPhin_HaGiang_Vietnam.JPG", article: "Dong Van Karst Plateau Geopark" },
    { name: "Quần thể danh thắng Tràng An", image: "Trang An Landscape Complex, Ninh Binh Province, Vietnam, 20240202 1456 5313.jpg", article: "Tràng An Scenic Landscape Complex" },
    { name: "Tam Cốc – Bích Động", image: "Tam Cốc-Bích Động in Ninh Binh province.jpg" },
    { name: "Đảo Cát Bà và vịnh Lan Hạ", image: "Cat_Ba_town.JPG", article: "Cát Bà Island" },
    { name: "Thác Bản Giốc", image: "Bangioc9tam.jpg", article: "Ban Gioc–Detian Falls" },
    { name: "Hồ Ba Bể", image: "Babenp_2007_01_3.jpg", article: "Ba Bể Lake" },
    { name: "Mù Cang Chải", image: "Mu_Cang_Chai_Town_-_Yen_Bai_-_Vietnam.jpg", article: "Mù Cang Chải district" },
    { name: "Mộc Châu", image: "Chemocchau.jpg", article: "Mộc Châu" },
    { name: "Mai Châu", image: "Mai_Chau_2008.jpg", article: "Mai Châu" },
    { name: "Pù Luông", image: "Pu_Luong_National_Reserve_(15179196484).jpg", article: "Pù Luông Nature Reserve" },
    { name: "Yên Tử", image: "Núi_Yên_Tử.jpg", article: "Yên Tử Mountain" },
    { name: "Tam Đảo", image: "Tam_Dao_mountain_range.jpg", article: "Tam Đảo National Park" },
    { name: "Cô Tô", image: "Cau My Stone Reef (37043433116).jpg" },
    { name: "Làng cổ Đường Lâm", image: "Cổng vào làng cổ Đường Lâm.jpg" },
    { name: "Cố đô Huế", image: "Citadel_Hue.jpg", article: "Complex of Hue Monuments" },
    { name: "Phố cổ Hội An", image: "10549-Hoi-An_(37621348460).jpg", article: "Hội An Old Town" },
    { name: "Đà Nẵng", image: "Dragon_Bridge,_Da_Nang_during_day_-_20230819_(cropped).jpg", article: "Da Nang" },
    { name: "Bà Nà Hills", image: "Linh_Ung_Pagoda.jpg", article: "Bà Nà Hills" },
    { name: "Vườn quốc gia Phong Nha – Kẻ Bàng", image: "Phongnhakebang6.jpg", article: "Phong Nha-Ke Bang National Park" },
    { name: "Hang Sơn Đoòng", image: "Son_Doong_Cave_5.jpg", article: "Hang Sơn Đoòng" },
    { name: "Thánh địa Mỹ Sơn", image: "2024_-_Mỹ_Sơn_Group_B,_C_and_D_-_img_23.jpg", article: "Mỹ Sơn archaeological site" },
    { name: "Cù Lao Chàm", image: "ChamIslands1.jpg", article: "Chàm Islands" },
    { name: "Đảo Lý Sơn", image: "Mot_phan_quang_canh_Ly_Son.jpg", article: "Lý Sơn" },
    { name: "Gành Đá Đĩa", image: "Gành_Đá_Đĩa_-_Phú_Yên.jpg", article: "Ganh Da Dia" },
    { name: "Eo Gió", image: "Ky-co-eo-gio-1-1048.jpg" },
    { name: "Nha Trang", image: "Nha_Trang_,_Vietnam_-_panoramio_(35).jpg", article: "Nha Trang" },
    { name: "Vịnh Vĩnh Hy", image: "Vinh hy bay.jpg" },
    { name: "Mũi Né", image: "Mui_Ne2.jpg", article: "Mũi Né" },
    { name: "Đà Lạt", image: "Xuan_Huong_Lake_11.jpg", article: "Da Lat" },
    { name: "Măng Đen", image: "Thị trấn Măng Đen.jpg", article: "Mang Den" },
    { name: "Thác Dray Nur", image: "Dray nur waterfall.jpg", article: "Dray Nur Waterfall" },
    { name: "TP. Hồ Chí Minh", image: "Ho_Chi_Minh_City,_City_Hall,_2020-01_CN-03.jpg", article: "Ho Chi Minh City" },
    { name: "Vũng Tàu", image: "Nhìn toàn cảnh TP.VŨNG TÀU từ Cáp treo Vũng Tàu.jpg", article: "Vũng Tàu" },
    { name: "Hồ Tràm", image: "Ho Tram beach between Charm Resort and Novaworld -64749.jpeg", article: "Hồ Tràm" },
    { name: "Côn Đảo", image: "ConDao_park_dam.jpg", article: "Côn Đảo" },
    { name: "Phú Quốc", image: "Bai-sao-phu-quoc-tuonglamphotos.jpg", article: "Phú Quốc" },
    { name: "Chợ nổi Cái Răng", image: "Một cảnh ở chợ nổi Cái Răng.jpg", article: "Cái Răng Floating Market" },
    { name: "Rừng tràm Trà Sư", image: "Rung tram TRa su, angiang vietnam - panoramio.jpg" },
    { name: "Núi Sam", image: "Một góc phố Núi Sam.jpg" },
    { name: "Vườn quốc gia Tràm Chim", image: "Đồng cỏ và chim nước.jpg", article: "Tràm Chim National Park" },
    { name: "Cồn Phụng", image: "Cồn Phụng.jpg" },
    { name: "Ao Bà Om", image: "Ao Bà Om, Trà Vinh.jpg" },
    { name: "Mũi Cà Mau", image: "Mui Ca Mau 005.JPG", article: "Cà Mau Cape" },
    { name: "Rừng U Minh Hạ", image: "Chuối tại rừng U Minh hạ.jpg", article: "U Minh Hạ National Park" },
    { name: "Núi Bà Đen", image: "Ba Den Mountain 2019.jpg", article: "Ba Den Mountain" },
    { name: "Khu dự trữ sinh quyển Cần Giờ", image: "Mangrove in Can Gio forest.jpg" },
    { name: "Hồ Dầu Tiếng", image: "Dau Tieng Lake - 50766650163.png" }
];

function makeLink(text, href, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = text;
    return link;
}

function renderDestination(item, destination, number) {
    const nameElement = item.querySelector("strong");
    if (!nameElement) {
        console.error("Destination is missing its title.", item);
        return;
    }

    const name = nameElement.textContent.trim();
    const description = item.textContent
        .slice(name.length)
        .replace(/^\s*[–-]\s*/, "")
        .trim();
    const articleUrl = destination.article
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(destination.article.replace(/ /g, "_"))}`
        : `https://vi.wikipedia.org/w/index.php?search=${encodeURIComponent(name)}`;
    const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(destination.image)}?width=800`;
    const imageSourceUrl = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(destination.image.replace(/ /g, "_"))}`;

    const article = document.createElement("article");
    article.className = "destination-card";

    const photoLink = document.createElement("a");
    photoLink.className = "destination-photo-link";
    photoLink.href = articleUrl;
    photoLink.target = "_blank";
    photoLink.rel = "noopener noreferrer";
    photoLink.setAttribute("aria-label", `Đọc thêm về ${name}`);

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = name;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
        photoLink.classList.add("is-unavailable");
        image.alt = `Không tải được ảnh ${name}`;
        image.removeAttribute("src");
    }, { once: true });

    const numberBadge = document.createElement("span");
    numberBadge.className = "destination-number";
    numberBadge.setAttribute("aria-hidden", "true");
    numberBadge.textContent = String(number).padStart(2, "0");

    photoLink.append(image, numberBadge);

    const content = document.createElement("div");
    content.className = "destination-card-content";

    const heading = document.createElement("h3");
    heading.textContent = name;

    const summary = document.createElement("p");
    summary.textContent = description;

    const links = document.createElement("div");
    links.className = "destination-links";
    links.append(
        makeLink("Đọc thêm", articleUrl, "destination-article-link"),
        makeLink("Nguồn ảnh & giấy phép", imageSourceUrl, "destination-image-source")
    );

    content.append(heading, summary, links);
    article.append(photoLink, content);
    item.replaceChildren(article);
}

const destinationsByName = new Map(destinations.map((destination) => [destination.name, destination]));
const renderedNames = new Set();

for (const list of document.querySelectorAll(".destination-list")) {
    const firstNumber = Number(list.getAttribute("start")) || 1;
    for (const [index, item] of Array.from(list.querySelectorAll(":scope > li")).entries()) {
        const name = item.querySelector("strong")?.textContent.trim();
        const destination = destinationsByName.get(name);
        if (!destination) {
            console.error(`No image and article source configured for "${name}".`);
            continue;
        }
        renderedNames.add(name);
        renderDestination(item, destination, firstNumber + index);
    }
}

if (renderedNames.size !== destinations.length) {
    console.error(`Rendered ${renderedNames.size} of ${destinations.length} configured destinations.`);
}

const randomButton = document.querySelector("#random-destination-button");
const randomResult = document.querySelector("#random-destination-result");
const destinationItems = Array.from(document.querySelectorAll(".destination-list > li"));
let previousRandomItem = null;

if (!randomButton || !randomResult) {
    console.error("Random destination controls are missing from the page.");
} else {
    randomButton.addEventListener("click", () => {
        const candidates = destinationItems.filter((item) => item !== previousRandomItem);
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        const card = selected?.querySelector(".destination-card");

        if (!card) {
            console.error("Could not find a destination card for the random suggestion.");
            return;
        }

        previousRandomItem = selected;
        randomResult.replaceChildren(card.cloneNode(true));
        randomResult.setAttribute("aria-label", `Điểm đến được chọn: ${card.querySelector("h3").textContent}`);
    });
}
