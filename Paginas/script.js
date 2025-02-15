document.addEventListener("DOMContentLoaded", function () {
  const figures = document.querySelectorAll("#gallery figure");

  // Animação sequencial na carga inicial
  figures.forEach((figure, index) => {
    figure.style.animationDelay = `${index * 0.1}s`;
  });

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
