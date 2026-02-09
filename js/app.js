// ✅ Pega aquí tu URL REAL del Apps Script (debe terminar en /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbwEEHPR3IzTnt9mh9-U5AfnBmmgBQ06D86mFVpcMdrHBqtRQ7UmTtiU9ix80sXQvAJlOg/exec";

let canalesData = [];

function normalizar(s) {
  return (s ?? "").toString().trim();
}

function escapeHTML(str) {
  return normalizar(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setContador(texto) {
  const el = document.getElementById("contador");
  if (el) el.textContent = texto;
}

function setVacio(mensaje, mostrar) {
  const vacio = document.getElementById("vacio");
  if (!vacio) return;
  vacio.textContent = mensaje || "";
  vacio.style.display = mostrar ? "block" : "none";
}

function render(lista) {
  const cont = document.getElementById("canales");
  if (!cont) return;

  cont.innerHTML = "";

  setContador(`${lista.length} canal(es)`);

  if (!lista.length) {
    setVacio("No hay canales para mostrar.", true);
    return;
  }
  setVacio("", false);

  lista.forEach((c) => {
    const nombre = escapeHTML(c.nombre || "Canal sin nombre");
    const desc = escapeHTML(c.descripcion || "");
    const cat = escapeHTML(c.categoria || "Sin categoría");
    const link = normalizar(c.link || "");

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <h3 class="card-title">${nombre}</h3>
      ${desc ? `<p class="card-desc">${desc}</p>` : ""}
      <div class="pill">${cat}</div>

      <div class="actions">
        <a class="btn btn-primary" href="${escapeHTML(link)}" target="_blank" rel="noopener">
          Unirse
        </a>
      </div>
    `;

    cont.appendChild(card);
  });
}

function setCategorias(lista) {
  const sel = document.getElementById("categoriaSelect");
  if (!sel) return;

  const cats = Array.from(
    new Set(lista.map((x) => normalizar(x.categoria)).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "es"));

  const actual = sel.value;

  sel.innerHTML = `<option value="">Todas las categorías</option>`;
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });

  sel.value = actual;
}

function aplicarFiltros() {
  const input = document.getElementById("buscador");
  const sel = document.getElementById("categoriaSelect");

  const q = (input?.value || "").trim().toLowerCase();
  const catSel = (sel?.value || "").trim().toLowerCase();

  const filtrados = canalesData.filter((c) => {
    const nombre = (c.nombre || "").toLowerCase();
    const desc = (c.descripcion || "").toLowerCase();
    const cat = (c.categoria || "").toLowerCase();

    const matchTexto = !q || (nombre + " " + desc + " " + cat).includes(q);
    const matchCat = !catSel || cat === catSel;

    return matchTexto && matchCat;
  });

  render(filtrados);
}

async function cargar() {
  try {
    setContador("Cargando...");
    setVacio("", false);

    // Si la URL no termina en /exec, te va a fallar sí o sí
    if (!API_URL.includes("/exec")) {
      throw new Error("API_URL debe terminar en /exec");
    }

    const res = await fetch(API_URL, { method: "GET" });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // Esperamos que sea un array
    canalesData = Array.isArray(data) ? data : [];

    setCategorias(canalesData);
    aplicarFiltros(); // render inicial con filtros

    // listeners
    const input = document.getElementById("buscador");
    const sel = document.getElementById("categoriaSelect");

    if (input) input.addEventListener("input", aplicarFiltros);
    if (sel) sel.addEventListener("change", aplicarFiltros);
  } catch (err) {
    console.error(err);
    setContador("Error");
    setVacio("No se pudieron cargar los canales.", true);
  }
}

cargar();
