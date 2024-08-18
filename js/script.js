

let currentSong = new Audio();
let files;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}





async function getSongs(folder) {
  currFolder = folder;
  let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let text = await response.text();
  let parser = new DOMParser();
  let doc = parser.parseFromString(text, 'text/html');

  files = [];
  let fileElements = doc.querySelectorAll('a');
  fileElements.forEach(el => {
    let href = el.getAttribute('href');
    if (href.endsWith('.mp3')) {
      files.push(el.href.split(`/${folder}/`)[1]);
    }
  });




  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songUL.innerHTML = ""
  for (const song of files) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Jai</div>
                    </div>
                    <div class="playnow">
                        <span>play now</span>
                        <img class="invert"src="img/play.svg" alt="">
                    </div>
                    
                    </li>`;
  }
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {

      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })

  })
  return files; 
}




const playMusic = (track, pause = false) => {
  // let audio=new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let text = await a.text();
  // let div=document.createElement("div");
  // div.innerHTML=text;
  let parser = new DOMParser();
  let doc = parser.parseFromString(text, 'text/html');

  let anchors = doc.getElementsByTagName("a");
  let cardContiner = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];



    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();

      cardContiner.innerHTML = cardContiner.innerHTML + `<div data-folder="${folder}" class="card">
                        <div  class="play">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           xmlns="img/http://www.w3.org/2000/svg">
                           <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                           stroke-linejoin="round" />
 
                           </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.tittle}</h2>
                        <p>${response.description}</p>
                    </div>`
    }
  }


  //load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {

    e.addEventListener("click", async item => {
     
      files = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
       playMusic(files[0])
    })
  })

}

async function main() {
  await getSongs("songs/cs");
  playMusic(files[0], true);


  //Display all the albums on the page
  displayAlbums()


  //Attach an event listener to play, next and previous

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      play.src = "img/pause.svg"
    }
    else {
      currentSong.pause()
      play.src = "img/play.svg"
    }
  })


  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {

    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })


  //Add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })

  //Add Eventlistenr for Hamburger
  document.querySelector(".hamburger").addEventListener("click", e => {
    document.querySelector(".left").style.left = "0";
  })

  //Add eventListener for Close button
  document.querySelector(".close").addEventListener("click", e => {
    document.querySelector(".left").style.left = "-120%";
  })

  //Add event listener for  prev
  previous.addEventListener("click", () => {
    console.log("previous clicked")

    let index = files.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (index - 1 >= 0) {
      playMusic(files[index - 1])
    }
  })

  //Add event listener for  next
  next.addEventListener("click", () => {
    console.log("next clicked")

    let index = files.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (index + 1 < files.length) {
      playMusic(files[index + 1])
    }
  })

  //Add eventListener for Volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("setting volume to", e.target.value)
    currentSong.volume = parseInt(e.target.value) / 100;
   
  })


//add event listener for mute to track
  document.querySelector(".volume>img").addEventListener("click",e=>{
  
    if(e.target.src.includes("img/volume.svg")){
      e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg")
      currentSong.volume=0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }
    else {
      e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg")
      currentSong.volume=0.2;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10;
    }
  })



}






main();

