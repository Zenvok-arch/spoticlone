let currentSong = new Audio();
let songs;
let currfolder;
let currentIndex = 0;

function formatSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`/songs/${folder}/info.json`);
    let responce = await a.json();
    songs = responce.songs;

    let songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";

    for (const song of songs) {
        songUl.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song}</div>
                    
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/songs/${currfolder}/${track}`;
    currentIndex = songs.indexOf(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
    let a = await fetch(`/songs/info.json`);
    let responce = await a.json();
    let cardContainer = document.querySelector(".cardcontainer");

    for (const folder of responce.albums) {
        let a = await fetch(`/songs/${folder}/info.json`);
        let album = await a.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <img class="play" src="img/p2.png" alt="">
                <img class="playlistimg" src="/songs/${folder}/cover.png" alt="">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getsongs(e.dataset.folder);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getsongs("myFav");
    playMusic(songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        let duration = currentSong.duration - currentSong.currentTime;
        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

   previous.addEventListener("click", () => {
    if (currentIndex - 1 >= 0) {
        playMusic(songs[currentIndex - 1]);
    }
});

next.addEventListener("click", () => {
    if (currentIndex + 1 < songs.length) {
        playMusic(songs[currentIndex + 1]);
    }
});


    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = Number(e.target.value) / 100;
    });

    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
