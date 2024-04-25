
    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        var searchTerm = document.querySelector('input[type="search"]').value.toLowerCase();
        var figures = document.querySelectorAll('#gallery figure');

        figures.forEach(function(figure) {
            var figCaption = figure.querySelector('figcaption').textContent.toLowerCase();
            if (figCaption.includes(searchTerm)) {
                figure.style.display = 'block';
            } else {
                figure.style.display = 'none';
            }
        });
    });

