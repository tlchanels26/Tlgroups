document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('channelList');
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.querySelectorAll('.filter-pill');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  if (!container) return;

  const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vS9bJm9Gy7_zOXLqpYjTg9Dg0YzD39NHV_2jE-OfPFoa_yF23KRIUvPvx4F6c2NyN91CuRUsq-lRMSM/pub?gid=2119025005&single=true&output=csv';

  // ---- Helpers ----
  function formatMembers(n) {
    const num = Number(n) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(num);
  }

  // Nuevo si fue enviado en los últimos 7 días
  function isNew(fechaRaw) {
    if (!fechaRaw) return false;
    const d = new Date(fechaRaw);
    if (isNaN(d.getTime())) return false;
    const diff = Date.now() - d.getTime();
    return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
  }

  // Parser CSV que soporta comillas y comas dentro de campos
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    // Normalizar saltos de línea
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"') {
        // Dobles comillas dentro de un campo entrecomillado -> "
        if (inQuotes && next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else if (c === '\n' && !inQuotes) {
        row.push(field);
        field = '';
        // Evitar filas vacías al final
        if (row.some(v => v !== '')) rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }

    // Último campo/fila
    row.push(field);
    if (row.some(v => v !== '')) rows.push(row);

    return rows;
  }

  async function loadChannelsFromCSV() {
    const res = await fetch(CSV_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo cargar el CSV');
    const text = await res.text();

    const rows = parseCSV(text);
    if (!rows.length) return [];

    // headers = rows[0] (no lo usamos, pero está bien)
    const dataRows = rows.slice(1);

    const channels = [];

    dataRows.forEach(cols => {
      // Tus columnas:
      // A fecha, B nombre, C link, D categoria, E descripcion, F estado, G miembros, H icono
      const fecha = (cols[0] || '').trim();
      const nombre = (cols[1] || '').trim();
      const link = (cols[2] || '').trim();
      const categoria = (cols[3] || '').trim().toLowerCase() || 'otros';
      const descripcion = (cols[4] || '').trim();
      const estado = (cols[5] || '').trim();
      const miembros = Number((cols[6] || '').trim()) || 0;
      const icono = (cols[7] || '').trim() || 'layer-group';

      // ✅ Solo aprobados
      if (estado !== 'Aprobado') return;

      // ✅ Anti-spam: link Telegram
      if (!/^https:\/\/t\.me\//i.test(link)) return;

      // ✅ Mínimos
      if (!nombre || !descripcion) return;

      channels.push({
        fecha,
        nombre,
        link,
        categoria,
        descripcion,
        estado,
        miembros,
        icono,
      });
    });

    // ✅ Orden por miembros desc
    channels.sort((a, b) => (b.miembros || 0) - (a.miembros || 0));

    return channels;
  }

  function render(list) {
    container.innerHTML = '';

    if (!list.length) {
      container.innerHTML =
        '<p style="text-align:center; opacity:.85;">No hay resultados 😕</p>';
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
        <h3>${escapeHTML(c.nombre)}</h3>
        <p>${escapeHTML(c.descripcion)}</p>

        <a href="${c.link}" class="btn-join" target="_blank" rel="noopener">Unirme</a>
      `;

      container.appendChild(card);
    });
  }

  // Escapar HTML básico por seguridad
  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applySearchAndFilter(allChannels) {
    const activePill = document.querySelector('.filter-pill.active');
    const activeCategory = activePill ? activePill.dataset.filter : 'todos';
    const q = (searchInput?.value || '').toLowerCase().trim();

    let filtered = allChannels;

    if (activeCategory !== 'todos') {
      filtered = filtered.filter(c => (c.categoria || 'otros') === activeCategory);
    }

    if (q) {
      filtered = filtered.filter(c => {
        const n = (c.nombre || '').toLowerCase();
        const d = (c.descripcion || '').toLowerCase();
        return n.includes(q) || d.includes(q);
      });
    }

    render(filtered);
  }

  // ---- Main ----
  let channels = [];

  try {
    channels = await loadChannelsFromCSV();
  } catch (e) {
    container.innerHTML =
      '<p style="text-align:center; opacity:.85;">Error cargando los canales.</p>';
    return;
  }

  // Render inicial
  applySearchAndFilter(channels);

  // Buscador
  if (searchInput) {
    searchInput.addEventListener('input', () => applySearchAndFilter(channels));
  }

  // Filtros
  if (filterPills.length) {
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        applySearchAndFilter(channels);
      });
    });
  }

  // Scroll top
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
