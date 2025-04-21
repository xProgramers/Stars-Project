document.addEventListener("DOMContentLoaded", function () {
  const videoCards = document.querySelectorAll(".video-card");

  videoCards.forEach((card, index) => {
    const video = card.querySelector(".preview");
    const videoThumbnail = card.querySelector(".video-thumbnail");
    const videoSource = video.querySelector("source").src; // Usaremos como ID único

    // Criar o container de avaliação
    const ratingContainer = document.createElement("div");
    ratingContainer.className = "rating-container video-rating";

    // Recuperar avaliação salva
    const savedRating = localStorage.getItem(`video-rating-${videoSource}`) || "0";
    card.dataset.rating = savedRating;

    // Adicionar 5 estrelas
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.innerHTML = "★";
      star.className = "rating-star";
      star.dataset.value = i;

      // Marcar estrelas baseado na avaliação salva
      if (i <= parseInt(savedRating)) {
        star.classList.add("active");
      }

      star.addEventListener("click", function (e) {
        e.stopPropagation(); // Previne que o vídeo abra ao clicar na estrela
        const rating = this.dataset.value;
        card.dataset.rating = rating;

        // Salvar no localStorage
        localStorage.setItem(`video-rating-${videoSource}`, rating);

        updateStars(ratingContainer, rating);
        reorderVideoGallery();
      });

      ratingContainer.appendChild(star);
    }

    videoThumbnail.appendChild(ratingContainer);

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

  // Função para atualizar visual das estrelas
  function updateStars(container, rating) {
    container.querySelectorAll(".rating-star").forEach((star, index) => {
      star.classList.toggle("active", index < rating);
    });
  }

  // Função para reordenar a galeria de vídeos
  function reorderVideoGallery() {
    const galleries = document.querySelectorAll(".video-gallery");
    galleries.forEach((gallery) => {
      const sortedCards = Array.from(gallery.querySelectorAll(".video-card")).sort((a, b) => {
        return b.dataset.rating - a.dataset.rating;
      });
      sortedCards.forEach((card) => gallery.appendChild(card));
    });
  }

  // Ordenar vídeos na carga inicial
  reorderVideoGallery();
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

// Funções para manipular o popup de iframe
function openIframePopup(iframeUrl, title) {
  const popup = document.getElementById("iframePopup");
  const popupHTML = `
    <div class="popup-content">
      <button class="close-btn" onclick="closeIframePopup()"></button>
      <div class="iframe-wrapper">
        <iframe src="${iframeUrl}" allowfullscreen></iframe>
      </div>
    </div>
  `;

  popup.innerHTML = popupHTML;
  popup.style.display = "flex";

  setTimeout(() => {
    popup.classList.add("active");
  }, 10);
}

function closeIframePopup() {
  const popup = document.getElementById("iframePopup");
  popup.classList.remove("active");

  setTimeout(() => {
    popup.style.display = "none";
    popup.innerHTML = "";
  }, 300);
}

// Adicionar evento de click nos containers de vídeo
document.addEventListener("DOMContentLoaded", function () {
  const videoContainers = document.querySelectorAll(".video-container");

  videoContainers.forEach((container) => {
    container.addEventListener("click", function () {
      const iframe = container.querySelector("iframe");
      const iframeUrl = iframe.src;
      const title = container.querySelector(".video-info h3").textContent;
      openIframePopup(iframeUrl, title);
    });
  });
});

// Fechar popup ao clicar fora ou pressionar ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeIframePopup();
  }
});

document.getElementById("iframePopup").addEventListener("click", function (e) {
  if (e.target === this) {
    closeIframePopup();
  }
});
