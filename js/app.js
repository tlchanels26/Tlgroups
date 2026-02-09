document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('channelList');
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.querySelectorAll('.filter-pill');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  if (!container) return;

  // ✅ TU LINK DIRECTO (Drive público)
  const JSON_URL = 'https://drive.google.com/uc?export=download&id=11Xo3rZrnzOSb3JCmUs5IFK36MwQ-Irqx';

  let channels = [];

  // Formato miembros: 950 -> 950, 15800 -> 15.8k, 1200000 -> 1.2M
  function formatMembers(n) {
    const num = Number(n) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(num);
  }

  // "Nuevo" si fue enviado en los últimos 7 días
  function isNew(fecha) {
    if (!fecha) return false;
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return false;
    const diff = Date.now() - d.getTime();
    return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }

  // ✅ Cargar JSON
  try {
    const res = await fetch(JSON_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo cargar el JSON');
    channels = await res.json();
  } catch (err) {
    container.innerHTML = '<p style="text-align:center; opacity:.85;">No se pudieron cargar los canales.</p>';
    return;
  }

  // ✅ Anti-spam (extra por si acaso): solo Telegram + solo aprobados
  channels = (channels || []).filter(c => {
    const link = (c.link || '').trim();
    return c.estado === 'Aprobado' && /^https:\/\/t\.me\//i.test(link);
  });

  // ✅ Orden por miembros (desc)
  channels.sort((a, b) => (Number(b.miembros) || 0) - (Number(a.miembros) || 0));

  function render(list) {
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML = '<p style="text-align:center; opacity:.85;">No hay resultados 😕</p>';
      return;
    }

    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'channel-card';
      card.dataset.category = c.categoria || 'otros';

      const badge = isNew(c.fecha) ? `<span class="badge-new">Nuevo</span>` : '';

      card.innerHTML = `
        <div class="card-top">
          <div class="card-icon"><i class="fas fa-${c.icono || 'layer-group'}"></i></div>
          <span class="member-count"><i class="fas fa-users"></i> ${formatMembers(c.miembros)}</span>
        </div>

        ${badge}
        <h3>${c.nombre || 'Canal'}</h3>
        <p>${c.descripcion || ''}</p>

        <a href="${c.link}" class="btn-join" target="_blank" rel="noopener">Unirme</a>
      `;

      container.appendChild(card);
    });
  }

  // Render inicial
  render(channels);

  // 🔍 Buscador (nombre + descripción)
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = channels.filter(c => {
        const n = (c.nombre || '').toLowerCase();
        const d = (c.descripcion || '').toLowerCase();
        return !q || n.includes(q) || d.includes(q);
      });
      render(filtered);
    });
  }

  // 🏷️ Filtros por categoría
  if (filterPills.length) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const cat = pill.dataset.filter;
        const filtered = (cat === 'todos')
          ? channels
          : channels.filter(c => (c.categoria || 'otros') === cat);

        // Si hay texto en buscador, combínalo
        const q = (searchInput?.value || '').toLowerCase().trim();
        const combined = filtered.filter(c => {
          const n = (c.nombre || '').toLowerCase();
          const d = (c.descripcion || '').toLowerCase();
          return !q || n.includes(q) || d.includes(q);
        });

        render(combined);
      });
    });
  }

  // ⬆️ Scroll top
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
