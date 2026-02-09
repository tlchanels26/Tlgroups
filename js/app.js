// ✅ Pega aquí tu URL REAL del Apps Script (debe terminar en /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbwEEHPR3IzTnt9mh9-U5AfnBmmgBQ06D86mFVpcMdrHBqtRQ7UmTtiU9ix80sXQvAJlOg/exec";

let canalesData = [];

function $(id) { return document.getElementById(id); }

// Carga usando JSONP para evitar CORS
function loadJSONP(url, callbackName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${callbackName}`;

    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("No se pudo cargar JSONP"));
    document.body.appendChild(script);
  });
}

// Esta función la llama Apps Script: callback(data)
window.handleCanales = function (data) {
  // si viene error desde el backend
  if (data && data.error) {
    mostrarError(data.error);
    return;
  }

  canalesData = Array.isArray(data) ? data : [];
  llenarCategorias(canalesData);
  aplicarFiltros(); // render inicial
};

function llenarCategorias(lista) {
  const sel = $("categoriaSelect");
  if (!sel) return;

  // categorías únicas
  const set = new Set(
    lista
      .map(x => (x.categoria || "").trim())
      .filter(x => x.length > 0)
  );

  const cats = Array.from(set).sort((a, b) => a.localeCompare(b, "es"));

  // limpia opciones
  sel.innerHTML = `<option value="">Todas las categorías</option>` +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function aplicarFiltros() {
  const q = ($("buscador")?.value || "").toLowerCase().trim();
  const catSel = ($("categoriaSelect")?.value || "").trim();

  const filtrados = canalesData.filter(c => {
    const nombre = (c.nombre || "").toLowerCase();
    const desc = (c.descripcion || "").toLowerCase();
    const cat = (c.categoria || "").toLowerCase();

    const coincideTexto = !q || `${nombre} ${desc} ${cat}`.includes(q);
    const coincideCat = !catSel || (c.categoria || "").trim() === catSel;

    return coincideTexto && coincideCat;
  });

  render(filtrados);
}

function render(lista) {
  const cont = $("canales");
  const vacio = $("vacio");
  const contador = $("contador");

  if (contador) contador.textContent = `${lista.length} canal(es)`;
  if (!cont) return;

  cont.innerHTML = "";

  if (!lista.length) {
    if (vacio) vacio.style.display = "block";
    return;
  }
  if (vacio) vacio.style.display = "none";

  lista.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${escapeHtml(c.nombre || "Canal sin nombre")}</h3>
      <p>${escapeHtml(c.descripcion || "")}</p>
      <div class="meta">
        <span class="pill">${escapeHtml(c.categoria || "Sin categoría")}</span>
      </div>
      <div class="actions">
        <a class="link" href="${escapeAttr(c.link || "#")}" target="_blank" rel="noopener">Unirse</a>
      </div>
    `;

    cont.appendChild(div);
  });
}

function mostrarError(msg) {
  const contador = $("contador");
  const vacio = $("vacio");

  if (contador) contador.textContent = "Error";
  if (vacio) {
    vacio.style.display = "block";
    vacio.textContent = "No se pudieron cargar los canales. " + msg;
  }
}

// helpers seguros
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  // evita romper atributos
  return escapeHtml(str).replaceAll(" ", "%20");
}

// INIT
document.addEventListener("DOMContentLoaded", async () => {
  // eventos
  const input = $("buscador");
  const sel = $("categoriaSelect");

  if (input) input.addEventListener("input", aplicarFiltros);
  if (sel) sel.addEventListener("change", aplicarFiltros);

  try {
    await loadJSONP(API_URL, "handleCanales");
  } catch (err) {
    mostrarError("Revisa que el link /exec sea correcto y que esté implementado como 'Cualquiera'.");
  }
});
