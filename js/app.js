document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterPills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.channel-card');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // Función de filtrado combinada
    function filterContent() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-pill.active').dataset.filter;

        cards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const category = card.dataset.category;
            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = activeCategory === 'todos' || category === activeCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    }

    // Evento buscador
    searchInput.addEventListener('input', filterContent);

    // Evento botones de categoría
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterContent();
        });
    });

    // Mostrar/Ocultar botón Volver Arriba
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = "block";
        } else {
            scrollTopBtn.style.display = "none";
        }
    });

    // Acción Volver Arriba
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
