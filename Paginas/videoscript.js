const videoCards = document.querySelectorAll(".video-card .preview");
const videoPopup = document.getElementById("videoPopup");
const popupVideo = document.getElementById("popupVideo");
const closeBtn = document.querySelector(".close-btn");

videoCards.forEach((video) => {
  const img = video.nextElementSibling;

  video.addEventListener("mouseenter", () => {
    video.play();
    img.style.display = "none";
  });

  video.addEventListener("mouseleave", () => {
    video.pause();
    img.style.display = "block";
    video.currentTime = 10; // Volta ao início do trecho de pré-visualização
  });

  video.addEventListener("click", () => {
    // Define o caminho do vídeo na popup e exibe a popup
    const videoSrc = video.querySelector("source").src.split("#")[0];
    popupVideo.querySelector("source").src = videoSrc;
    popupVideo.load();
    videoPopup.style.display = "flex";
  });
});

function closePopup() {
  videoPopup.style.display = "none";
  popupVideo.pause();
}
