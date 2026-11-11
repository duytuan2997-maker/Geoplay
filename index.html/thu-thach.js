const places = [
  {
    name: "Tháp Eiffel",
    lat: 48.856360, lon: 2.297430,
    image: "images/geo-challenge/eiffel.jpg",
    creator: "Benh LIEU SONG", license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons.jpg",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/"
  },
  {
    name: "Đấu trường Colosseum",
    lat: 41.890694, lon: 12.490778,
    image: "images/geo-challenge/colosseum.jpg",
    creator: "Diliff", license: "CC BY-SA 2.5",
    source: "https://commons.wikimedia.org/wiki/File:Colosseum_in_Rome-April_2007-1-_%20copie_2B.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5/"
  },
  {
    name: "Taj Mahal",
    lat: 27.173253, lon: 78.042111,
    image: "images/geo-challenge/taj-mahal.jpg",
    creator: "Yann Forget; chỉnh sửa bởi King of Hearts", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra,_India_edit2.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    name: "Nhà hát Opera Sydney",
    lat: -33.852575, lon: 151.210729,
    image: "images/geo-challenge/sydney-opera-house.jpg",
    creator: "Diliff", license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_-_Dec_2008.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    name: "Cầu Cổng Vàng",
    lat: 37.819929, lon: -122.478255,
    image: "images/geo-challenge/golden-gate-bridge.jpg",
    creator: "Dietmar Rabich", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:San_Francisco_(CA,_USA),_Golden_Gate_Bridge_--_2022_--_3023_(bw).jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    name: "Cổng Brandenburg",
    lat: 52.516262, lon: 13.378525,
    image: "images/geo-challenge/brandenburg-gate.jpg",
    creator: "Norbert Nagel", license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Brandenburg_Gate_-_Brandenburger_Tor_-_Berlin_-_Germany_-_02.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    name: "Kho bạc Petra (Al-Khazneh)",
    lat: 30.32206, lon: 35.45145,
    image: "images/geo-challenge/petra.jpg",
    creator: "David Berkowitz", license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Nabatean_Treasury_in_Petra,_Jordan_(4053809982).jpg",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    coordinateSource: "https://www.wikidata.org/wiki/Q1259626"
  },
  {
    name: "Machu Picchu",
    lat: -13.163333, lon: -72.545556,
    image: "images/geo-challenge/machu-picchu.jpg",
    creator: "Diego Delso", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Machu_Picchu,_Per%C3%BA,_2015-07-30,_DD_47.JPG",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    coordinateSource: "https://www.wikidata.org/wiki/Q676203"
  },
  {
    name: "Tượng Nữ thần Tự do",
    lat: 40.680133, lon: -74.038303,
    image: "images/geo-challenge/statue-of-liberty.jpg",
    creator: "Christian David", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Statue_of_Liberty_and_a_sightseeing_boat,_Liberty_Island,_New_York.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    name: "Nhà thờ Sagrada Família",
    lat: 41.404469, lon: 2.175836,
    image: "images/geo-challenge/sagrada-familia.jpg",
    creator: "Canaan", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:SF_maig_2026.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  }
];

const elements = {
  intro: document.querySelector("#intro-panel"),
  game: document.querySelector("#game-panel"),
  results: document.querySelector("#result-panel"),
  start: document.querySelector("#start-button"),
  playAgain: document.querySelector("#play-again-button"),
  round: document.querySelector("#round-status"),
  timer: document.querySelector("#timer"),
  score: document.querySelector("#score-status"),
  photo: document.querySelector("#place-photo"),
  credit: document.querySelector("#photo-credit"),
  instructions: document.querySelector("#map-instructions"),
  guess: document.querySelector("#guess-button"),
  next: document.querySelector("#next-button"),
  roundResult: document.querySelector("#round-result"),
  finalScore: document.querySelector("#final-score"),
  finalDetail: document.querySelector("#final-detail"),
  xpEarned: document.querySelector("#xp-earned"),
  xpProgressLabel: document.querySelector("#xp-progress-label"),
  xpProgress: document.querySelector("#xp-progress"),
  xpProgressFill: document.querySelector("#xp-progress-fill"),
  xpLevel: document.querySelector("#xp-level")
};

const map = L.map("map", {
  worldCopyJump: true,
  minZoom: 2,
  maxZoom: 18
}).setView([20, 0], 2);

L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
}).addTo(map);

let deck = [];
let roundIndex = 0;
let totalScore = 0;
let timeLeft = 60;
let timerId = null;
let guessMarker = null;
let answerMarker = null;
let answerLine = null;
let phase = "intro";
const completedLocations = new Set();

map.on("click", (event) => {
  if (phase !== "guessing") return;
  if (guessMarker) {
    guessMarker.setLatLng(event.latlng);
  } else {
    guessMarker = L.marker(event.latlng, { draggable: true }).addTo(map);
    guessMarker.on("dragend", () => {
      elements.guess.disabled = false;
    });
  }
  elements.guess.disabled = false;
});

elements.start.addEventListener("click", startGame);
elements.playAgain.addEventListener("click", startGame);
elements.guess.addEventListener("click", submitGuess);
elements.next.addEventListener("click", nextRound);
elements.photo.addEventListener("error", () => {
  elements.photo.alt = "Không tải được ảnh địa điểm.";
});

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function startGame() {
  window.clearInterval(timerId);
  deck = shuffled(places);
  roundIndex = 0;
  totalScore = 0;
  timeLeft = 60;
  phase = "guessing";
  completedLocations.clear();

  elements.intro.classList.add("hide");
  elements.results.classList.add("hide");
  elements.game.classList.remove("hide");
  elements.next.classList.add("hide");
  elements.guess.classList.remove("hide");
  elements.guess.disabled = true;
  elements.roundResult.innerText = "";
  elements.score.innerText = "Điểm: 0";
  elements.timer.innerText = "⏱️ 60 giây";
  map.invalidateSize();

  showRound();
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    elements.timer.innerText = `⏱️ ${timeLeft} giây`;
    if (timeLeft <= 0) finishGame(true);
  }, 1000);
}

function showRound() {
  if (roundIndex >= deck.length) {
    finishGame(false);
    return;
  }

  phase = "guessing";
  const place = deck[roundIndex];
  elements.round.innerText = `Lượt ${roundIndex + 1} / ${deck.length}`;
  elements.photo.src = place.image;
  elements.photo.alt = `Ảnh địa điểm bí mật, lượt ${roundIndex + 1}`;
  elements.credit.innerText = "";
  elements.credit.append(document.createTextNode(`Ảnh: ${place.creator} · Đã thu nhỏ · `));
  elements.credit.append(makeLink(place.license, place.licenseUrl));
  elements.credit.append(document.createTextNode(" · "));
  elements.credit.append(makeLink("Nguồn Wikimedia Commons", place.source));
  if (place.coordinateSource) {
    elements.credit.append(document.createTextNode(" · "));
    elements.credit.append(makeLink("Nguồn tọa độ", place.coordinateSource));
  }

  elements.instructions.innerText = "Nhấp vào bản đồ để đặt ghim, sau đó chọn “Chốt vị trí”.";
  elements.roundResult.innerText = "";
  elements.guess.disabled = true;
  elements.guess.classList.remove("hide");
  elements.next.classList.add("hide");
  clearRoundMarkers();
  map.setView([20, 0], 2);
}

function makeLink(label, href) {
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.innerText = label;
  return link;
}

function submitGuess() {
  if (phase !== "guessing" || !guessMarker) return;
  phase = "review";

  const place = deck[roundIndex];
  const guessPosition = guessMarker.getLatLng();
  const answerPosition = L.latLng(place.lat, place.lon);
  const distanceKm = guessPosition.distanceTo(answerPosition) / 1000;
  const points = Math.round(5000 * Math.exp(-distanceKm / 2000));
  totalScore += points;
  completedLocations.add(place.name);
  elements.score.innerText = `Điểm: ${totalScore.toLocaleString("vi-VN")}`;
  elements.instructions.innerText = `Địa điểm: ${place.name}`;
  elements.roundResult.innerText =
    `Cách vị trí đúng khoảng ${formatDistance(distanceKm)} · +${points.toLocaleString("vi-VN")} điểm`;
  elements.guess.classList.add("hide");
  elements.next.innerText = roundIndex === deck.length - 1 ? "Xem kết quả" : "Địa điểm tiếp theo";
  elements.next.classList.remove("hide");

  answerMarker = L.marker(answerPosition).addTo(map)
    .bindPopup(`Vị trí đúng: ${place.name}`).openPopup();
  answerLine = L.polyline([guessPosition, answerPosition], {
    color: "#e14848",
    weight: 3,
    dashArray: "8 8"
  }).addTo(map);
  map.fitBounds(L.latLngBounds([guessPosition, answerPosition]).pad(0.35), { maxZoom: 5 });
}

function nextRound() {
  if (phase !== "review") return;
  roundIndex += 1;
  showRound();
}

function finishGame(timeExpired) {
  if (phase === "finished") return;
  phase = "finished";
  window.clearInterval(timerId);

  const xpBefore = Number(localStorage.getItem("xp")) || 0;
  const xpEarned = Math.floor(totalScore / 500);
  const xpAfter = xpBefore + xpEarned;
  const levelBefore = Math.floor(xpBefore / 100) + 1;
  const levelAfter = Math.floor(xpAfter / 100) + 1;
  const levelProgress = xpAfter % 100;
  localStorage.setItem("xp", xpAfter);

  elements.game.classList.add("hide");
  elements.results.classList.remove("hide");
  elements.finalScore.innerText = `${totalScore.toLocaleString("vi-VN")} / 50.000 điểm`;
  elements.finalDetail.innerText =
    `${completedLocations.size} / ${deck.length} địa điểm đã đoán${timeExpired ? " · Hết giờ!" : ""}`;
  elements.xpEarned.innerText = `Bạn nhận được: +${xpEarned} XP`;
  elements.xpProgressLabel.innerText = `Tiến độ cấp ${levelAfter}: ${levelProgress} / 100 XP`;
  elements.xpProgressFill.style.width = `${levelProgress}%`;
  elements.xpProgress.setAttribute("aria-valuenow", levelProgress);
  elements.xpLevel.innerText = levelAfter > levelBefore
    ? `🎉 Lên cấp ${levelAfter}!`
    : `Cấp hiện tại: ${levelAfter}`;
}

function clearRoundMarkers() {
  if (guessMarker) map.removeLayer(guessMarker);
  if (answerMarker) map.removeLayer(answerMarker);
  if (answerLine) map.removeLayer(answerLine);
  guessMarker = null;
  answerMarker = null;
  answerLine = null;
}

function formatDistance(distanceKm) {
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m`
    : `${Math.round(distanceKm).toLocaleString("vi-VN")} km`;
}
