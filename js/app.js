document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.channel-card');
    const badges = document.querySelectorAll('.badge'); // Seleccionamos las etiquetas

    // Función principal de filtrado
    function filterChannels(term) {
        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('p').innerText.toLowerCase();
            const badge = card.querySelector('.badge').innerText.toLowerCase();

            if (title.includes(term) || desc.includes(term) || badge.includes(term)) {
                card.style.display = "flex";
                // Pequeña animación de aparición
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            } else {
                card.style.display = "none";
                card.style.opacity = "0";
            }
        });
    }

    // 1. Evento al escribir en el buscador
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterChannels(e.target.value.toLowerCase());
        });
    }

    // 2. Evento al hacer clic en las etiquetas (Badges)
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            const category = badge.innerText.toLowerCase();
            // Escribimos la categoría en el buscador
            searchInput.value = category;
            // Ejecutamos el filtro
            filterChannels(category);
            // Efecto visual en el buscador para que se note el cambio
            searchInput.focus();
        });
    });
});
