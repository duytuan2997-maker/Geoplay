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
  },
  {
    name: "Vịnh Hạ Long",
    lat: 20.833333, lon: 107.233333,
    image: "images/geo-challenge/ha-long-bay.jpg",
    creator: "Thomas Hirsch (Ravn)", license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Halong_Bay_in_Vietnam.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    name: "Phố cổ Hội An",
    lat: 15.877108, lon: 108.328603,
    image: "images/geo-challenge/hoi-an.jpg",
    creator: "Steffen Schmitz (Carschten)", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:H%E1%BB%99i_An,_Ancient_Town,_2020-01_CN-05.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    name: "Đại Nội Huế",
    lat: 16.470154, lon: 107.577481,
    image: "images/geo-challenge/hue-citadel.jpg",
    creator: "Uwe Aranas (CEphoto)", license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Hue_Vietnam_Citadel-of-Hu%E1%BA%BF-05.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
  },
  {
    name: "Cầu Vàng Bà Nà",
    lat: 15.997735, lon: 107.985889,
    image: "images/geo-challenge/golden-bridge-vietnam.jpg",
    creator: "Laslovarga", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Vietnam,_Ba_Na_Hill,_Golden_Bridge_-_Laslovarga.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    name: "Quần thể Tràng An",
    lat: 20.249643, lon: 105.914801,
    image: "images/geo-challenge/trang-an.jpg",
    creator: "Jakub Hałun", license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Trang_An_Landscape_Complex,_Ninh_Binh_Province,_Vietnam,_20240202_1404_5216.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
  },
  {
  name: "Vạn Lý Trường Thành",
    lat: 40.429152, lon: 116.567248,
  image: "images/geo-challenge/great-wall.jpg",
    creator: "Velatrix",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Great_Wall_of_China_July_2006.JPG",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/"
},
{
  name: "Núi Phú Sĩ",
  lat: 35.360556, lon: 138.727778,
  image: "images/geo-challenge/mount-fuji.jpg",
    creator: "Romain Guy",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Mount_Fuji_at_sunset,_March_2025.jpg",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/"
},
{
  name: "Christ the Redeemer",
  lat: -22.951944, lon: -43.210556,
  image: "images/geo-challenge/christ-redeemer.jpg",
    creator: "Sean Vivek Crasto",
    license: "Public domain",
  source: "https://commons.wikimedia.org/wiki/File:Cristo_Redentor_-_Rio.jpg",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/"
},
{
  name: "Kim tự tháp Giza",
  lat: 29.979167, lon: 31.134167,
  image: "images/geo-challenge/great-pyramid-giza.jpg",
    creator: "Ricardo Liberato",
    license: "CC BY-SA 2.0",
  source: "https://commons.wikimedia.org/wiki/File:All_Gizah_Pyramids.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/"
},
{
  name: "Angkor Wat",
  lat: 13.412469, lon: 103.866986,
  image: "images/geo-challenge/angkor-wat.jpg",
    creator: "Satdeep Gill",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Angkor_Wat_with_its_reflection_(cropped).jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Stonehenge",
  lat: 51.178889, lon: -1.826111,
  image: "images/geo-challenge/stonehenge.jpg",
    creator: "garethwiscombe",
    license: "CC BY 2.0",
  source: "https://commons.wikimedia.org/wiki/File:Stonehenge2007_07_30.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/"
},
{
  name: "Núi Bàn (Table Mountain)",
  lat: -33.962778, lon: 18.409722,
  image: "images/geo-challenge/table-mountain.jpg",
    creator: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Cape_Town_(ZA),_Table_Mountain_--_2024_--_2794+96+98+2800+01.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Lâu đài Neuschwanstein",
  lat: 47.557574, lon: 10.749800,
  image: "images/geo-challenge/neuschwanstein.jpg",
  creator: "Thomas Wolf",
    license: "CC BY-SA 3.0 DE",
  source: "https://commons.wikimedia.org/wiki/File:Schloss_Neuschwanstein_2013.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/de/"
},
{
  name: "Thác Iguazu",
  lat: -25.695278, lon: -54.436667,
  image: "images/geo-challenge/iguazu-falls.jpg",
    creator: "Emesbe",
    license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:Iguazu_Falls.jpg",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Núi Kilimanjaro",
  lat: -3.067425, lon: 37.355627,
  image: "images/geo-challenge/kilimanjaro.jpg",
    creator: "Ray in Manila",
    license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Kibo_Summit,_Mount_Kilimanjaro,_Tanzania_(30819102678).jpg",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/"
},
{
  name: "Đền Parthenon",
  lat: 37.971532, lon: 23.726726,
  image: "images/geo-challenge/parthenon.jpg",
  creator: "Steve Swayne",
  license: "CC BY 2.0",
  source: "https://commons.wikimedia.org/wiki/File:The_Parthenon_in_Athens.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by/2.0/"
},
{
  name: "Cung điện Potala",
  lat: 29.657778, lon: 91.117222,
  image: "images/geo-challenge/potala-palace.jpg",
  creator: "Ondřej Žváček",
  license: "CC BY 2.5",
  source: "https://commons.wikimedia.org/wiki/File:Potala.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by/2.5/"
},
{
  name: "Núi Rushmore",
  lat: 43.879102, lon: -103.459067,
  image: "images/geo-challenge/mount-rushmore.jpg",
  creator: "Jim Bowen",
  license: "CC BY 2.0",
  source: "https://commons.wikimedia.org/wiki/File:Mount_Rushmore_National_Memorial.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by/2.0/"
},
{
  name: "Cung điện Versailles",
  lat: 48.804865, lon: 2.120355,
  image: "images/geo-challenge/versailles.jpg",
  creator: "Simdaperce",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:Chateau_de_Versailles.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Burj Khalifa",
  lat: 25.197197, lon: 55.274376,
  image: "images/geo-challenge/burj-khalifa.jpg",
  creator: "Jpbowen",
  license: "CC BY-SA 4.0",
  source: "https://commons.wikimedia.org/wiki/File:Burj_Khalifa_from_a_ferry,_Dubai.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Lâu đài Edinburgh",
  lat: 55.948611, lon: -3.199913,
  image: "images/geo-challenge/edinburgh-castle.jpg",
  creator: "Kim Traynor",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_the_south_east.JPG",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Moai đảo Phục Sinh",
  lat: -27.121944, lon: -109.366111,
  image: "images/geo-challenge/easter-island-moai.jpg",
  creator: "Aurbina",
  license: "Public domain",
  source: "https://commons.wikimedia.org/wiki/File:Moai_Rano_raraku.jpg",
  licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain"
},
{
  name: "Quảng trường Đỏ",
  lat: 55.753931, lon: 37.620795,
  image: "images/geo-challenge/red-square.jpg",
  creator: "Юрий Д.К.",
  license: "CC BY 4.0",
  source: "https://commons.wikimedia.org/wiki/File:Red_Square_in_Moscow_(general_view_in_2025).jpg",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
},
{
  name: "Tu viện Mont-Saint-Michel",
  lat: 48.636111, lon: -1.511458,
  image: "images/geo-challenge/mont-saint-michel.jpg",
  creator: "Lsvichet",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:Le_Mont-Saint-Michel.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Hẻm núi Grand Canyon",
  lat: 36.106965, lon: -112.112997,
  image: "images/geo-challenge/grand-canyon.jpg",
  creator: "Chensiyuan",
  license: "CC BY-SA 4.0",
  source: "https://commons.wikimedia.org/wiki/File:Grand_Canyon_view_from_Pima_Point_2010.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Tháp Nghiêng Pisa",
  lat: 43.722952, lon: 10.396597,
  image: "images/geo-challenge/leaning-tower-pisa.jpg",
  creator: "Saffron Blaze",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:The_Leaning_Tower_of_Pisa_SB.jpeg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Chichen Itza",
  lat: 20.684284, lon: -88.567783,
  image: "images/geo-challenge/chichen-itza.jpg",
  creator: "Daniel Schwen",
  license: "CC BY-SA 4.0",
  source: "https://commons.wikimedia.org/wiki/File:Chichen_Itza_3.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Borobudur",
  lat: -7.607874, lon: 110.203751,
  image: "images/geo-challenge/borobudur.jpg",
  creator: "Gunawan Kartapranata",
  license: "Public domain",
  source: "https://commons.wikimedia.org/wiki/File:Borobudur-Nothwest-view.jpg",
  licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain"
},
{
  name: "Cung điện Pena",
  lat: 38.787463, lon: -9.390363,
  image: "images/geo-challenge/pena-palace.jpg",
  creator: "CEphoto, Uwe Aranas",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:Sintra_Portugal_Pal%C3%A1cio_da_Pena-01.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Matterhorn",
  lat: 45.976389, lon: 7.658611,
  image: "images/geo-challenge/matterhorn.jpg",
  creator: "Dirk Beyer",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:Matterhorn_Riffelsee_2005-06-11.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Uluru",
  lat: -25.344428, lon: 131.036882,
  image: "images/geo-challenge/uluru.jpg",
  creator: "Dietmar Rabich",
  license: "CC BY-SA 4.0",
  source: "https://commons.wikimedia.org/wiki/File:Petermann_Ranges_(AU),_Uluru-Kata_Tjuta_National_Park,_Uluru,_Kuniya_Walk_--_2019_--_3674.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Nhà thờ Hồi giáo Sheikh Zayed",
  lat: 24.412833, lon: 54.474722,
  image: "images/geo-challenge/sheikh-zayed-mosque.jpg",
  creator: "Guilhem Vellut",
  license: "CC BY 2.0",
  source: "https://commons.wikimedia.org/wiki/File:Sheikh_Zayed_Grand_Mosque_%40_Abu_Dhabi_(15856602738).jpg",
  licenseUrl: "https://creativecommons.org/licenses/by/2.0/"
},
{
  name: "Đền Abu Simbel",
  lat: 22.337231, lon: 31.625799,
  image: "images/geo-challenge/abu-simbel.jpg",
  creator: "Than217 at English Wikipedia",
  license: "Public domain",
  source: "https://commons.wikimedia.org/wiki/File:Abu_Simbel_Temple_May_30_2007.jpg",
  licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain"
},
{
  name: "Làng Hallstatt",
  lat: 47.562161, lon: 13.649300,
  image: "images/geo-challenge/hallstatt.jpg",
  creator: "Himadri",
  license: "CC BY-SA 3.0 AT",
  source: "https://commons.wikimedia.org/wiki/File:Hallstatt.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/at/deed.en"
},
{
  name: "Hồ Moraine",
  lat: 51.321722, lon: -116.186111,
  image: "images/geo-challenge/moraine-lake.jpg",
  creator: "Gorgo",
  license: "Public domain",
  source: "https://commons.wikimedia.org/wiki/File:Moraine_Lake_17092005.jpg",
  licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain"
},
{
  name: "Cappadocia",
  lat: 38.643056, lon: 34.828333,
  image: "images/geo-challenge/cappadocia.jpg",
  creator: "Leventtuncay",
  license: "CC BY-SA 4.0",
  source: "https://commons.wikimedia.org/wiki/File:Cappadocia_balloons.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Blue Lagoon",
  lat: 63.880389, lon: -22.449508,
  image: "images/geo-challenge/blue-lagoon.jpg",
  creator: "Jakub Hałun",
  license: "CC BY-SA 4.0",
  source: "https://commons.wikimedia.org/wiki/File:Blue_Lagoon_with_%C3%9Eorbj%C3%B6rn,_Iceland,_20230430_1626_3692.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
},
{
  name: "Khu bảo tồn Serengeti",
  lat: -2.333333, lon: 34.833333,
  image: "images/geo-challenge/serengeti.jpg",
  creator: "Bjørn Christian Tørrissen",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:Serengeti-Landscape-2012.JPG",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
},
{
  name: "Torres del Paine",
  lat: -50.942326, lon: -72.944640,
  image: "images/geo-challenge/torres-del-paine.jpg",
  creator: "John Spooner",
  license: "CC BY 2.0",
  source: "https://commons.wikimedia.org/wiki/File:Torres_del_Paine.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by/2.0/"
},
{
  name: "India Gate",
  lat: 28.612912, lon: 77.229509,
  image: "images/geo-challenge/india-gate.jpg",
  creator: "Shajankumar",
  license: "CC BY-SA 3.0",
  source: "https://commons.wikimedia.org/wiki/File:India_Gate_in_New_Delhi.jpg",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"
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
  deck = shuffled(places).slice(0, 10);
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
