const cardPlay = document.querySelector(".cardPlay");
const card = document.querySelector(".card");
let currentSong = new Audio();
let currentFolder;
let songs = [];
let isPlayAble = false;

async function getFolders() {
  let a = await fetch("http://192.168.100.11:5501/src/songs/");

  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element.href.includes("/songs/")) {
      let folder = element.href.split("/").slice(-1)[0];

      let a = await fetch(
        `http://192.168.100.11:5501/src/songs/${folder}/info.json`
      );
      let cardJson = await a.json();

      const card = document.createElement("div");
      card.className =
        "card bg-neutral-800 p-3 md:p-4 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer";

      // Image wrapper
      const imageWrapper = document.createElement("div");
      imageWrapper.className = "relative aspect-square mb-3";

      // Image (cover photo)
      const gradientBox = document.createElement("img");
      gradientBox.src = `http://192.168.100.11:5501/src/songs/${folder}/cover.jpg`;
      gradientBox.className = "w-full h-full object-cover rounded-md";

      // Play button
      const cardPlay = document.createElement("div");
      cardPlay.className =
        "bg-green-500 p-3 rounded-full h-10 w-10 opacity-0 flex justify-center items-center absolute bottom-0 right-2 transition-all duration-700 ease-in-out";
      const icon = document.createElement("i");
      icon.className = "fa-solid fa-play text-black text-lg";
      cardPlay.appendChild(icon);

      // Append play button on top of image
      imageWrapper.appendChild(gradientBox);
      imageWrapper.appendChild(cardPlay);

      // Title
      const title = document.createElement("h3");
      title.className = "text-white font-semibold text-sm md:text-base mb-1";
      title.textContent = cardJson.title;

      // Description
      const description = document.createElement("p");
      description.className = "text-gray-400 text-xs md:text-sm";
      description.textContent = cardJson.description;

      // Append everything to card
      card.appendChild(imageWrapper);
      card.appendChild(title);
      card.appendChild(description);
      cardContainer.appendChild(card);

      // Click event
      card.addEventListener("click", () => {
        getSongs(folder);
      });
      card.addEventListener("mouseover", () => {
        cardPlay.classList.remove("opacity-0", "bottom-0", "scale-90");
        cardPlay.classList.add("opacity-100", "bottom-2", "scale-100");
      });

      card.addEventListener("mouseout", () => {
        cardPlay.classList.add("opacity-0", "bottom-0", "scale-90");
        cardPlay.classList.remove("opacity-100", "bottom-2", "scale-100");
      });
    }
  }
}

async function getSongs(folder) {
  let a = await fetch(`http://192.168.100.11:5501/src/songs/${folder}`);
  let responce = await a.text();

  let div = document.createElement("div");
  div.innerHTML = responce;
  let ac = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < ac.length; index++) {
    let element = ac[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }

  displaylist();
}

async function displaylist() {
  const songOl = document.querySelector(".songlistOl");
  songOl.innerHTML = "";

  for (let songUrl of songs) {
    const li = document.createElement("li");
    let song = songUrl;
    song = song.split("/songs/")[1].split("/")[1];

    song = decodeURIComponent(song);
    let songName = song;

    li.className = `flex items-center p-2 hover:bg-neutral-800 rounded cursor-pointer`;
    li.innerHTML = `  <div class="flex items-center space-x-3 overflow-hidden w-full">
                  <div class="w-12 h-12 min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] bg-neutral-900 rounded flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-music text-white"></i>
                  </div>

                  <!-- Flexible text section -->
                  <div class="min-w-0 w-full">
                    <div class="text-white text-sm font-medium truncate">
                      ${songName}
                    </div>
                    <div class="text-gray-400 text-xs truncate">
                      Artist
                    </div>
                  </div>

                </div>`;

    songOl.appendChild(li);
    playSong(songs[0]);

    li.addEventListener("click", (e) => {
      playSong(songUrl);
    });

    // contolers lisners
  }
}

function playSong(songUrl) {
  currentSong.src = songUrl;

  sliderHandler();

  currentSong.play();
  isPlayAble = true;

  const playIcon = document.getElementById("play");
  playIcon.classList.remove("fa-play");
  playIcon.classList.add("fa-pause");

  let songName = currentSong.src.split("/songs/")[1].split("/")[1];

  songName = decodeURIComponent(songName);

  document.getElementsByClassName("songTitle").innerHTML = "134";
  Array.from(document.getElementsByClassName("songTitle")).forEach((el) => {
    el.innerHTML = songName;
  });
}

function sliderHandler() {
  currentSong.onloadedmetadata = () => {
    const totalTime = currentSong.duration;

    let minuts = parseInt(totalTime / 60);
    let seconds = parseInt(totalTime - minuts * 60);
    document.getElementById("currentTime").innerHTML = `00:00`;
    document.getElementById("duration").innerHTML = ` / ${
      minuts < 10 ? "0" + minuts : minuts
    }:${seconds < 10 ? "0" + seconds : seconds}`;

    const slider = document.getElementById("timeSlider");

    slider.value = 0;
    slider.max = currentSong.duration;
    setInterval(() => {
      slider.value = currentSong.currentTime;
      minuts = parseInt(currentSong.currentTime / 60);
      seconds = parseInt(currentSong.currentTime - minuts * 60);
      document.getElementById("currentTime").innerHTML = `${
        minuts < 10 ? "0" + minuts : minuts
      }:${seconds < 10 ? "0" + seconds : seconds}`;
    }, 1000);
    slider.addEventListener("input", () => {
      currentSong.currentTime = slider.value;
    });
  };
}

function nextHandler() {
  const currentFile = decodeURIComponent(currentSong.src.split("/").pop());

  const index = songs.findIndex((song) => {
    return decodeURIComponent(song.split("/").pop()) === currentFile;
  });

  if (index !== -1 && index + 1 < songs.length) {
    playSong(songs[index + 1]);
  }
}
function playHandler() {
  const playIcon = document.getElementById("play");

  if (currentSong.paused && isPlayAble) {
    currentSong.play();
    playIcon.classList.remove("fa-play");
    playIcon.classList.add("fa-pause");
  } else {
    currentSong.pause();
    playIcon.classList.remove("fa-pause");
    playIcon.classList.add("fa-play");
  }
}
function previousHandler() {
  const currentFile = decodeURIComponent(currentSong.src.split("/").pop());

  const index = songs.findIndex((song) => {
    return decodeURIComponent(song.split("/").pop()) === currentFile;
  });

  if (index > 0) {
    playSong(songs[index - 1]);
  }
}

function controlerLisners(songs) {
  const play = document.getElementById("play");
  play.addEventListener("click", playHandler);
  document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
      playHandler();
    }
  });

  const next = document.getElementById("next");
  next.addEventListener("click", nextHandler);

  const previous = document.getElementById("previous");
  previous.addEventListener("click", previousHandler);
}
function songEndHandler() {
  const playIcon = document.getElementById("play"); // e.g., your play/pause icon

  currentSong.addEventListener("ended", () => {
    // Change icon back to "play"

    playIcon.classList.add("fa-play");
    playIcon.classList.remove("fa-pause");
  });
}
function volumeHandler() {
  const volumeSlider = document.getElementById("soundSlider");
  const icon = document.getElementsByClassName("volumeIcon");
  const iconWrapper = document.getElementById("volumeIcon");

  currentSong.volume = volumeSlider.value / 100;

  volumeSlider.addEventListener("input", () => {
    if (volumeSlider.value == 0) {
      iconWrapper.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M11 5L6 9H3v6h3l5 4V5z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15 9l6 6" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M21 9l-6 6" />
                  </svg>`;
    } else if (currentSong.volume == 0) {
      iconWrapper.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M11 5L6 9H3v6h3l5 4V5z" />
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.54 8.46a5 5 0 010 7.07" />
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M19.07 4.93a9 9 0 010 14.14" />
                    </svg>`;
    }
    currentSong.volume = volumeSlider.value / 100;
  });

  iconWrapper.addEventListener("click", () => {
    if (currentSong.volume === 0) {
      volumeSlider.value = 20;
      currentSong.volume = 0.2;

      iconWrapper.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M11 5L6 9H3v6h3l5 4V5z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.54 8.46a5 5 0 010 7.07" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19.07 4.93a9 9 0 010 14.14" />
                  </svg>`;
    } else {
      currentSong.volume = 0;
      volumeSlider.value = 0;
      iconWrapper.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M11 5L6 9H3v6h3l5 4V5z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15 9l6 6" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M21 9l-6 6" />
                  </svg>`;
    }
  });
}

function hamburgerControler() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const closeSidebar = document.getElementById("closeSidebar");

  function showSidebar() {
    sidebar.classList.add("show");
    sidebarOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function hideSidebar() {
    sidebar.classList.remove("show");
    sidebarOverlay.classList.add("hidden");
    document.body.style.overflow = "auto";
  }

  hamburgerBtn.addEventListener("click", showSidebar);
  closeSidebar.addEventListener("click", hideSidebar);
  sidebarOverlay.addEventListener("click", hideSidebar);
}

async function main() {
  getFolders();
  hamburgerControler();
  volumeHandler();

  controlerLisners();
  songEndHandler();
}

main();
