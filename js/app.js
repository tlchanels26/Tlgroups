document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.channel-card');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  // Si no hay cards, no hay nada que filtrar
  if (!cards.length) return;

  // Mensaje opcional cuando no hay resultados
  let emptyMsg = document.getElementById('emptyMsg');
  if (!emptyMsg) {
    emptyMsg = document.createElement('div');
    emptyMsg.id = 'emptyMsg';
    emptyMsg.style.display = 'none';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '20px';
    emptyMsg.style.opacity = '0.8';
    emptyMsg.textContent = 'No se encontraron resultados 😕';
    cards[0].parentElement.appendChild(emptyMsg);
  }

  function getActiveCategory() {
    const active = document.querySelector('.filter-pill.active');
    return active ? active.dataset.filter : 'todos';
  }

  function filterContent() {
    const searchTerm = (searchInput?.value || '').toLowerCase().trim();
    const activeCategory = getActiveCategory();

    let visibleCount = 0;

    cards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      const category = card.dataset.category || '';

      const matchesSearch =
        !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm);

      const matchesCategory =
        activeCategory === 'todos' || category === activeCategory;

      const show = matchesSearch && matchesCategory;

      card.style.display = show ? 'flex' : 'none';
      if (show) visibleCount++;
    });

    emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  // Evento buscador
  if (searchInput) {
    searchInput.addEventListener('input', filterContent);
  }

  // Evento botones de categoría
  if (filterPills.length) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterContent();
      });
    });
  }

  // Mostrar/Ocultar botón Volver Arriba
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    // Acción Volver Arriba
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Ejecutar filtro al cargar (por si hay pill activa o input con valor)
  filterContent();
});
