document.addEventListener("DOMContentLoaded", function () {
  const figures = document.querySelectorAll("#gallery figure");

  figures.forEach((figure, index) => {
    const imgSrc = figure.querySelector("img").src; // Usaremos como ID único

    // Criar o container de avaliação
    const ratingContainer = document.createElement("div");
    ratingContainer.className = "rating-container";

    // Recuperar avaliação salva
    const savedRating = localStorage.getItem(`image-rating-${imgSrc}`) || "0";
    figure.dataset.rating = savedRating;

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

      star.addEventListener("click", function () {
        const rating = this.dataset.value;
        figure.dataset.rating = rating;

        // Salvar no localStorage
        localStorage.setItem(`image-rating-${imgSrc}`, rating);

        updateStars(ratingContainer, rating);
        reorderGallery();
      });

      ratingContainer.appendChild(star);
    }

    figure.appendChild(ratingContainer);
  });

  // Função para atualizar visual das estrelas
  function updateStars(container, rating) {
    container.querySelectorAll(".rating-star").forEach((star, index) => {
      star.classList.toggle("active", index < rating);
    });
  }

  // Função para reordenar a galeria
  function reorderGallery() {
    const gallery = document.getElementById("gallery");
    const sortedFigures = Array.from(figures).sort((a, b) => {
      return b.dataset.rating - a.dataset.rating;
    });

    sortedFigures.forEach((figure) => gallery.appendChild(figure));
  }

  // Ordenar na carga inicial
  reorderGallery();

  // Melhorando a busca
  document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTerm = document.querySelector('input[type="search"]').value.toLowerCase();

    figures.forEach(function (figure) {
      const figCaption = figure.querySelector("figcaption").textContent.toLowerCase();
      figure.style.opacity = "0";
      figure.style.transform = "scale(0.8)";

      setTimeout(() => {
        if (figCaption.includes(searchTerm)) {
          figure.style.display = "block";
          figure.style.opacity = "1";
          figure.style.transform = "scale(1)";
        } else {
          figure.style.display = "none";
        }
      }, 300);
    });
  });
});
