document.addEventListener("DOMContentLoaded", function () {
  const videoCards = document.querySelectorAll(".video-card");

  videoCards.forEach((card) => {
    const video = card.querySelector(".preview");
    const videoThumbnail = card.querySelector(".video-thumbnail");

    // Adicionar botão de som
    const soundButton = document.createElement("button");
    soundButton.className = "sound-button";
    soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    videoThumbnail.appendChild(soundButton);

    let isMuted = true;

    // Controle de som
    soundButton.addEventListener("click", function (e) {
      e.stopPropagation(); // Previne que o popup abra ao clicar no botão
      isMuted = !isMuted;
      if (video) {
        video.muted = isMuted;
        soundButton.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
      }
    });

    // Preview ao passar o mouse
    card.addEventListener("mouseenter", function () {
      if (video) {
        video.play();
        video.muted = isMuted;
      }
    });

    card.addEventListener("mouseleave", function () {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Abrir vídeo em popup
    card.addEventListener("click", function () {
      if (video) {
        const videoSrc = video.querySelector("source").src;
        openVideoPopup(videoSrc);
      }
    });
  });
});

function openVideoPopup(videoSrc) {
  const popup = document.getElementById("videoPopup");
  const popupHTML = `
    <div class="popup-content">
      <button class="close-btn" onclick="closePopup()"></button>
      <video id="popupVideo" controls>
        <source src="${videoSrc}" type="video/mp4">
      </video>
    </div>
  `;

  popup.innerHTML = popupHTML;
  popup.style.display = "flex";

  setTimeout(() => {
    popup.classList.add("active");
    const popupVideo = document.getElementById("popupVideo");
    popupVideo.play();
  }, 10);
}

function closePopup() {
  const popup = document.getElementById("videoPopup");
  const popupVideo = document.getElementById("popupVideo");

  if (popupVideo) {
    popupVideo.pause();
  }

  popup.classList.remove("active");

  setTimeout(() => {
    popup.style.display = "none";
    popup.innerHTML = "";
  }, 300);
}

// Fechar popup ao clicar fora do vídeo
document.getElementById("videoPopup").addEventListener("click", function (e) {
  if (e.target === this) {
    closePopup();
  }
});

// Fechar com tecla ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closePopup();
  }
});
