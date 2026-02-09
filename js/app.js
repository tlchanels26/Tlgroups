const API_URL = "https://script.google.com/macros/s/AKfycbwEEHPR3lzTnt9mh9-USAfnBmmBQ06D8mFVpcMdrHBqtrQ7umTiU9ix8OsXQVAJ10g/exec";

let canalesData = [];

function render(lista){
  const cont = document.getElementById('canales');
  const vacio = document.getElementById('vacio');
  const contador = document.getElementById('contador');

  if(!cont) return;

  cont.innerHTML = "";
  contador.textContent = `${lista.length} canal(es)`;

  if(!lista.length){
    vacio.style.display = "block";
    return;
  }
  vacio.style.display = "none";

  lista.forEach(canal => {
    const div = document.createElement('div');
    div.className = 'card';

    const nombre = canal.nombre ?? "Canal sin nombre";
    const desc = canal.descripcion ?? "";
    const cat = canal.categoria ?? "Sin categoría";
    const link = canal.link ?? "#";

    div.innerHTML = `
      <h3>${escapeHtml(nombre)}</h3>
      <p>${escapeHtml(desc)}</p>
      <div class="meta">
        <span class="pill">#${escapeHtml(cat)}</span>
      </div>
      <div class="actions">
        <a class="link" href="${link}" target="_blank" rel="noopener">Unirse</a>
      </div>
    `;
    cont.appendChild(div);
  });
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    canalesData = Array.isArray(data) ? data : [];
    render(canalesData);

    const input = document.getElementById('buscador');
    if(input){
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        const filtrados = canalesData.filter(c => {
          const t = `${c.nombre||""} ${c.descripcion||""} ${c.categoria||""}`.toLowerCase();
          return t.includes(q);
        });
        render(filtrados);
      });
    }
  })
  .catch(() => {
    if(document.getElementById('contador')){
      document.getElementById('contador').textContent = "Error";
    }
    if(document.getElementById('vacio')){
      document.getElementById('vacio').style.display = "block";
      document.getElementById('vacio').textContent =
        "No se pudieron cargar los canales.";
    }
  });
