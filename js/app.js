document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('channelList');
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.querySelectorAll('.filter-pill');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  if (!container) return;

  let channels = [];

  // 1️⃣ Cargar JSON
  try {
    const res = await fetch('https://drive.google.com/uc?export=download&id=11Xo3rZrnzOSb3JCmUs5IFK36MwQ-Irqx');

    channels = await res.json();
  } catch (err) {
    container.innerHTML = '<p style="text-align:center;">Error cargando canales</p>';
    return;
  }

  // 2️⃣ Solo aprobados
  channels = channels.filter(c => c.estado === 'Aprobado');

  function render(list) {
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = '<p style="text-align:center;">No hay resultados 😕</p>';
      return;
    }

    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'channel-card';
      card.dataset.category = c.categoria;

      card.innerHTML = `
        <div class="card-top">
          <div class="card-icon">
            <i class="fas fa-${c.icono}"></i>
          </div>
          <span class="member-count">
            <i class="fas fa-users"></i> ${(c.miembros / 1000).toFixed(1)}k
          </span>
        </div>
        <h3>${c.nombre}</h3>
        <p>${c.descripcion}</p>
        <a href="${c.link}" target="_blank" class="btn-join">Unirme</a>
      `;

      container.appendChild(card);
    });
  }

  render(channels);

  // 🔍 Buscador
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    render(
      channels.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q)
      )
    );
  });

  // 🏷️ Filtros
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const cat = pill.dataset.filter;
      render(cat === 'todos'
        ? channels
        : channels.filter(c => c.categoria === cat)
      );
    });
  });

  // ⬆️ Scroll top
  window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
