// ✅ Tu URL real del Apps Script (termina en /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbwEEHPR3IzTnt9mh9-U5AfnBmmgBQ06D86mFVpcMdrHBqtRQ7UmTtiU9ix80sXQvAJlOg/exec";

let canalesData = [];

function $(id) { return document.getElementById(id); }

function escapeHTML(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render(lista) {
  const cont = $("canales");
  const vacio = $("vacio");
  const contador = $("contador");

  if (!cont) return;

  cont.innerHTML = "";
  contador.textContent = `${lista.length} canal(es)`;

  if (!lista.length) {
    if (vacio) vacio.style.display = "block";
    return;
  }
  if (vacio) vacio.style.display = "none";

  lista.forEach(canal => {
    const div = document.createElement("div");
    div.className = "card";

    const nombre = canal.nombre || "Canal sin nombre";
    const desc = canal.descripcion || "";
    const cat = canal.categoria || "Sin categoría";
    const link = canal.link || "#";

    div.innerHTML = `
      <h3>${escapeHTML(nombre)}</h3>
      <p>${escapeHTML(desc)}</p>
      <div class="meta">
        <span class="pill">${escapeHTML(cat)}</span>
      </div>
      <div class="actions">
        <a class="link" href="${escapeHTML(link)}" target="_blank" rel="noopener">Unirse</a>
      </div>
    `;

    cont.appendChild(div);
  });
}

function llenarCategorias(lista) {
  const sel = $("categoriaSelect");
  if (!sel) return;

  const cats = new Set();
  lista.forEach(c => {
    const cat = (c.categoria || "").trim();
    if (cat) cats.add(cat);
  });

  const ordenadas = Array.from(cats).sort((a,b) => a.localeCompare(b));

  sel.innerHTML = `<option value="">Todas las categorías</option>` +
    ordenadas.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
}

function aplicarFiltros() {
  const q = ($("buscador")?.value || "").trim().toLowerCase();
  const catSel = ($("categoriaSelect")?.value || "").trim().toLowerCase();

  const filtrados = canalesData.filter(c => {
    const nombre = (c.nombre || "").toLowerCase();
    const desc = (c.descripcion || "").toLowerCase();
    const cat = (c.categoria || "").toLowerCase();

    // filtro categoría
    if (catSel && cat !== catSel) return false;

    // filtro texto
    if (!q) return true;
    return nombre.includes(q) || desc.includes(q) || cat.includes(q);
  });

  render(filtrados);
}

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cbName = "cb_" + Math.random().toString(36).slice(2);

    window[cbName] = (data) => {
      delete window[cbName];
      script.remove();
      resolve(data);
    };

    const script = document.createElement("script");
    script.src = url + (url.includes("?") ? "&" : "?") + "callback=" + cbName;
    script.onerror = () => {
      delete window[cbName];
      script.remove();
      reject(new Error("No se pudo cargar el script JSONP"));
    };

    document.body.appendChild(script);
  });
}

async function cargar() {
  try {
    $("contador").textContent = "Cargando...";
    if ($("vacio")) {
      $("vacio").style.display = "block";
      $("vacio").textContent = "Cargando...";
    }

    const data = await jsonp(API_URL);

    // Si Apps Script devolvió error
    if (data && data.error) {
      $("contador").textContent = "Error";
      if ($("vacio")) $("vacio").textContent = data.error;
      return;
    }

    canalesData = Array.isArray(data) ? data : [];
    llenarCategorias(canalesData);
    aplicarFiltros();

    if (!canalesData.length && $("vacio")) {
      $("vacio").style.display = "block";
      $("vacio").textContent = "No hay canales para mostrar.";
    }
  } catch (e) {
    $("contador").textContent = "Error";
    if ($("vacio")) {
      $("vacio").style.display = "block";
      $("vacio").textContent = "No se pudieron cargar los canales.";
    }
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("buscador")?.addEventListener("input", aplicarFiltros);
  $("categoriaSelect")?.addEventListener("change", aplicarFiltros);
  cargar();
});
