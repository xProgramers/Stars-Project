// Adicionar temporariamente ao início do seu arquivo JS para limpar dados antigos
Object.keys(localStorage).forEach((key) => {
  if (key.startsWith("video-like-")) {
    localStorage.removeItem(key);
  }
  if (key.startsWith("video-likes-count-")) {
    localStorage.removeItem(key);
  }
});

// Manter apenas as funções de interface como:
// - Controle de reprodução
// - Sistema de avaliação
// - Popups de vídeo
// Remover todas as referências ao Firebase

document.addEventListener("DOMContentLoaded", function () {
  // Função para controlar preview dos vídeos
  function setupVideoPreview(videoCard) {
    const video = videoCard.querySelector(".preview");
    const videoThumbnail = videoCard.querySelector(".video-thumbnail");

    if (!video) return;

    // Configurar vídeo como mudo inicialmente
    video.muted = true;

    // Criar botão de áudio
    const audioToggle = document.createElement("button");
    audioToggle.className = "audio-toggle";
    audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    videoThumbnail.appendChild(audioToggle);

    // Eventos do mouse para preview
    videoThumbnail.addEventListener("mouseenter", function () {
      video.play();
    });

    videoThumbnail.addEventListener("mouseleave", function () {
      video.pause();
      video.currentTime = 0;
      // Resetar áudio para mudo quando o mouse sair
      video.muted = true;
      audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    });

    // Evento de clique no botão de áudio
    audioToggle.addEventListener("click", function (e) {
      e.stopPropagation(); // Previne que o vídeo abra em popup
      video.muted = !video.muted;

      // Atualiza o ícone baseado no estado do áudio
      audioToggle.innerHTML = video.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    // Configurar vídeo para loop
    video.loop = true;
  }

  // Configurar todos os vídeos na galeria
  const videoCards = document.querySelectorAll(".video-card");
  videoCards.forEach(setupVideoPreview);

  // Observar novos vídeos adicionados dinamicamente
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.classList && node.classList.contains("video-card")) {
          setupVideoPreview(node);
        }
      });
    });
  });

  // Configurar o observer
  const config = { childList: true, subtree: true };
  const videoGallery = document.querySelector(".video-gallery");
  if (videoGallery) {
    observer.observe(videoGallery, config);
  }

  // Atualizar controles quando trocar de aba
  const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
  tabButtons.forEach((button) => {
    button.addEventListener("shown.bs.tab", function (event) {
      const targetPane = document.querySelector(button.dataset.bsTarget);
      if (targetPane) {
        const newVideos = targetPane.querySelectorAll(".video-card");
        newVideos.forEach(setupVideoPreview);
      }
    });
  });

  videoCards.forEach((card, index) => {
    const video = card.querySelector(".preview");
    const videoThumbnail = card.querySelector(".video-thumbnail");
    const videoSource = video.querySelector("source").src;

    // Adicionar botão de áudio
    const audioToggle = document.createElement("button");
    audioToggle.className = "audio-toggle";
    audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    videoThumbnail.appendChild(audioToggle);

    // Controle de áudio
    audioToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      video.muted = !video.muted;
      audioToggle.innerHTML = video.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    // Adicionar evento de clique para abrir popup
    videoThumbnail.addEventListener("click", function () {
      openVideoPopup(videoSource);
    });

    // Remove these lines to prevent duplicate initialization
    // const ratingContainer = createRatingStars(card, videoSource);
    // videoThumbnail.appendChild(ratingContainer);

    // ...resto do código existente para preview e reprodução ...
  });

  // Função para abrir popup do vídeo
  function openVideoPopup(videoSrc) {
    const popup = document.getElementById("videoPopup");
    const popupVideo = document.getElementById("popupVideo");

    popupVideo.querySelector("source").src = videoSrc;
    popupVideo.load(); // Recarrega o vídeo com a nova fonte

    popup.style.display = "flex";
    popupVideo.play();
  }

  // Função para fechar popup
  window.closePopup = function () {
    const popup = document.getElementById("videoPopup");
    const popupVideo = document.getElementById("popupVideo");

    popupVideo.pause();
    popup.style.display = "none";
  };

  // Setup para popup de iframes na aba Achadinhos
  setupIframePopups();
});

function setupIframePopups() {
  // Seleciona todos os títulos de vídeo na aba Achadinhos
  const videoTitles = document.querySelectorAll(".video-title");

  videoTitles.forEach((title) => {
    title.addEventListener("click", function () {
      const iframeSrc = this.getAttribute("data-iframe-src");
      if (iframeSrc) {
        openIframePopup(iframeSrc);
      }
    });
  });
}

function openIframePopup(iframeSrc) {
  const popup = document.getElementById("iframePopup");
  const popupContent = popup.querySelector(".iframe-wrapper");

  // Limpa o conteúdo anterior
  popupContent.innerHTML = "";

  // Cria novo iframe
  const iframe = document.createElement("iframe");
  iframe.src = iframeSrc;
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "true");
  iframe.style.width = "100%";
  iframe.style.height = "100%";

  // Adiciona o iframe ao popup
  popupContent.appendChild(iframe);

  // Mostra o popup
  popup.classList.add("active");

  // Adiciona listener para a tecla ESC
  document.addEventListener("keydown", closeOnEscape);
}

function closeOnEscape(e) {
  if (e.key === "Escape") {
    closeIframePopup();
  }
}

function closeIframePopup() {
  const popup = document.getElementById("iframePopup");
  const popupContent = popup.querySelector(".iframe-wrapper");

  // Remove a classe active
  popup.classList.remove("active");

  // Limpa o iframe após a animação de fechamento
  setTimeout(() => {
    popupContent.innerHTML = "";
  }, 300);

  // Remove o listener do ESC
  document.removeEventListener("keydown", closeOnEscape);
}

// Torna a função closeIframePopup global para o onclick do botão
window.closeIframePopup = closeIframePopup;

// Modifique a parte de criação das estrelas
function createRatingStars(card, videoSource) {
  const ratingContainer = document.createElement("div");
  ratingContainer.className = "rating-container";

  const savedRating = localStorage.getItem(`video-rating-${videoSource}`) || "0";
  card.dataset.rating = savedRating;

  // Criar as 5 estrelas
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = "★";
    star.className = "rating-star";
    star.dataset.value = i;

    // Adicionar classe active nas estrelas até o rating salvo
    if (i <= parseInt(savedRating)) {
      star.classList.add("active");
    }

    // Atualizar o visual ao passar o mouse
    star.addEventListener("mouseenter", function () {
      const stars = ratingContainer.querySelectorAll(".rating-star");
      const value = this.dataset.value;

      stars.forEach((s, index) => {
        s.classList.toggle("active", index < value);
      });
    });

    // Restaurar visual ao sair do container
    ratingContainer.addEventListener("mouseleave", function () {
      const stars = this.querySelectorAll(".rating-star");
      stars.forEach((s, index) => {
        s.classList.toggle("active", index < savedRating);
      });
    });

    star.addEventListener("click", function (e) {
      e.stopPropagation();
      const rating = this.dataset.value;
      updateRating(card, ratingContainer, rating, videoSource);
    });

    ratingContainer.appendChild(star);
  }

  return ratingContainer;
}

function updateRating(card, container, rating, videoSource) {
  // Atualiza o rating no card e no localStorage
  card.dataset.rating = rating;
  localStorage.setItem(`video-rating-${videoSource}`, rating);

  // Atualiza a aparência das estrelas
  const stars = container.querySelectorAll(".rating-star");
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });

  // Reordena os vídeos
  reorderVideos(card.closest(".video-gallery"));
}

function reorderVideos(gallery) {
  if (!gallery) return;

  const videoCards = Array.from(gallery.children);

  // Ordena os cards por rating (maior para menor)
  videoCards.sort((a, b) => {
    const ratingA = parseInt(a.dataset.rating) || 0;
    const ratingB = parseInt(b.dataset.rating) || 0;
    return ratingB - ratingA;
  });

  // Reinsere os cards na ordem correta
  videoCards.forEach((card) => {
    gallery.appendChild(card);
  });
}

// Função para inicializar os ratings salvos
function initializeRatings() {
  const videoGalleries = document.querySelectorAll(".video-gallery");

  videoGalleries.forEach((gallery) => {
    // Skip if this is the achadinhos container
    if (gallery.id === "achadinhos-container") return;

    const videoCards = gallery.querySelectorAll(".video-card");

    videoCards.forEach((card) => {
      const videoSource = card.querySelector("video source")?.src;
      if (videoSource) {
        const ratingContainer = createRatingStars(card, videoSource);
        const videoThumbnail = card.querySelector(".video-thumbnail");
        if (videoThumbnail) {
          videoThumbnail.appendChild(ratingContainer);
        }
      }
    });

    // Ordena inicialmente
    reorderVideos(gallery);
  });
}

// Nova função para o sistema de avaliação
function initializeRatingSystem() {
  const achadinhosContainer = document.getElementById("achadinhos-container");

  function createRatingStars(videoContainer, videoId) {
    const ratingContainer = document.createElement("div");
    ratingContainer.className = "rating-container";

    // Get saved rating from localStorage
    const savedRating = localStorage.getItem(`video-rating-${videoId}`) || "0";
    videoContainer.dataset.rating = savedRating;

    // Create 5 stars
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.innerHTML = "★";
      star.className = "rating-star";
      if (i <= parseInt(savedRating)) {
        star.classList.add("active");
      }

      star.addEventListener("click", (e) => {
        e.stopPropagation();
        updateRating(videoContainer, ratingContainer, i, videoId);
      });

      ratingContainer.appendChild(star);
    }

    return ratingContainer;
  }

  function updateRating(videoContainer, ratingContainer, rating, videoId) {
    // Update localStorage
    localStorage.setItem(`video-rating-${videoId}`, rating.toString());
    videoContainer.dataset.rating = rating;

    // Update star appearance
    const stars = ratingContainer.querySelectorAll(".rating-star");
    stars.forEach((star, index) => {
      star.classList.toggle("active", index < rating);
    });

    // Reorder videos
    reorderVideos();
  }

  function reorderVideos() {
    const videoContainers = Array.from(achadinhosContainer.querySelectorAll(".video-container"));

    // Sort by rating (highest first)
    videoContainers.sort((a, b) => {
      const ratingA = parseInt(a.dataset.rating) || 0;
      const ratingB = parseInt(b.dataset.rating) || 0;
      return ratingB - ratingA;
    });

    // Reappend in new order
    videoContainers.forEach((container) => {
      achadinhosContainer.appendChild(container);
    });
  }

  // Initialize ratings for existing videos
  function initializeExistingVideos() {
    const videoContainers = achadinhosContainer.querySelectorAll(".video-container");
    videoContainers.forEach((container, index) => {
      const videoId = container.querySelector("iframe").src;
      const ratingStars = createRatingStars(container, videoId);
      container.appendChild(ratingStars);
    });

    // Initial sorting
    reorderVideos();
  }

  // Initialize when DOM is loaded
  if (achadinhosContainer) {
    initializeExistingVideos();
  }
}

// Adicionar ao DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  // Remove qualquer inicialização anterior de likes
  const achadinhosContainer = document.getElementById("achadinhos-container");
  if (achadinhosContainer) {
    // Remover botões de like existentes para evitar duplicação
    const existingLikeButtons = achadinhosContainer.querySelectorAll(".like-button");
    existingLikeButtons.forEach((button) => button.remove());

    // Inicializar sistema de likes
    initializeLikeSystem();
  }

  // Inicializar ratings apenas para outras abas
  const mainGallery = document.querySelector(".video-gallery");
  if (mainGallery) {
    initializeRatings();
  }
});

// Nova função para o sistema de bookmarks
function initializeBookmarkSystem() {
  const achadinhosContainer = document.getElementById("achadinhos-container");

  function createBookmarkButton(videoContainer, videoId) {
    // Verificar se já existe um botão de bookmark
    const existingButton = videoContainer.querySelector(".bookmark-button");
    if (existingButton) {
      return existingButton;
    }

    const bookmarkButton = document.createElement("button");
    bookmarkButton.className = "bookmark-button";
    bookmarkButton.title = "Adicionar aos favoritos";

    // Verificar estado salvo do bookmark
    const isBookmarked = localStorage.getItem(`video-bookmark-${videoId}`) === "true";

    // Criar ícone
    const icon = document.createElement("i");
    icon.className = isBookmarked ? "fas fa-bookmark" : "far fa-bookmark";

    if (isBookmarked) {
      bookmarkButton.classList.add("bookmarked");
      videoContainer.classList.add("bookmarked");
    }

    bookmarkButton.appendChild(icon);

    bookmarkButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleBookmark(videoContainer, bookmarkButton, videoId);
    });

    return bookmarkButton;
  }

  function toggleBookmark(videoContainer, bookmarkButton, videoId) {
    const icon = bookmarkButton.querySelector("i");
    const isCurrentlyBookmarked = bookmarkButton.classList.contains("bookmarked");

    // Alternar estado do bookmark
    const newBookmarkState = !isCurrentlyBookmarked;

    // Atualizar UI
    bookmarkButton.classList.toggle("bookmarked");
    videoContainer.classList.toggle("bookmarked");
    icon.className = newBookmarkState ? "fas fa-bookmark" : "far fa-bookmark";

    // Atualizar localStorage
    localStorage.setItem(`video-bookmark-${videoId}`, newBookmarkState);

    // Reordenar vídeos
    reorderVideos();
  }

  function reorderVideos() {
    const videoContainers = Array.from(achadinhosContainer.querySelectorAll(".video-container"));

    // Ordenar: bookmarked primeiro, resto depois
    videoContainers.sort((a, b) => {
      const isBookmarkedA = a.classList.contains("bookmarked");
      const isBookmarkedB = b.classList.contains("bookmarked");

      if (isBookmarkedA === isBookmarkedB) return 0;
      return isBookmarkedA ? -1 : 1;
    });

    // Reposicionar na nova ordem
    videoContainers.forEach((container) => {
      achadinhosContainer.appendChild(container);
    });
  }

  // Inicializar bookmarks para vídeos existentes
  function initializeExistingVideos() {
    const videoContainers = achadinhosContainer.querySelectorAll(".video-container");
    videoContainers.forEach((container) => {
      const videoId = container.querySelector("iframe").src;
      const bookmarkButton = createBookmarkButton(container, videoId);
      container.querySelector(".video-info").appendChild(bookmarkButton);
    });

    // Ordenação inicial
    reorderVideos();
  }

  // Inicializar quando o container existe
  if (achadinhosContainer) {
    initializeExistingVideos();
  }
}

// Modificar o evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  const achadinhosContainer = document.getElementById("achadinhos-container");
  if (achadinhosContainer) {
    // Remover botões existentes para evitar duplicação
    const existingButtons = achadinhosContainer.querySelectorAll(".bookmark-button");
    existingButtons.forEach((button) => button.remove());

    // Inicializar apenas o sistema de bookmarks
    initializeBookmarkSystem();
  }

  // Inicializar ratings apenas para outras abas
  const mainGallery = document.querySelector(".video-gallery");
  if (mainGallery) {
    initializeRatings();
  }

  // Setup interface de vídeo
  setupVideoPreview();
  setupIframePopups();
});
