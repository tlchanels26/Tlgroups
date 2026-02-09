// ✅ Pega aquí tu URL REAL del Apps Script (debe terminar en /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbwEEHPR3IzTnt9mh9-U5AfnBmmgBQ06D86mFVpcMdrHBqtRQ7UmTtiU9ix80sXQvAJlOg/exec";

/***********************
 * API Canales Telegram
 * - Devuelve SOLO canales con estado = "aprobado"
 * - Devuelve JSON normal o JSONP (si viene ?callback=xxx)
 ************************/


  // ✅ 2) Nombre exacto de la pestaña
  const SHEET_NAME = "Respuestas de formulario 1";

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEET_NAME);

    if (!sh) {
      return salida_(e, { error: "No existe la hoja: " + SHEET_NAME });
    }

    const data = sh.getDataRange().getValues();
    if (data.length < 2) return salida_(e, []); // No hay filas

    // --- Normaliza encabezados ---
    const headers = data[0].map(h =>
      String(h || "")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
        .replace(/[^a-z0-9 ]/g, "")                      // quita símbolos
        .trim()
    );

    // Encuentra columna si el encabezado la "incluye"
    const col = (name) => headers.findIndex(h => h.includes(name));

    const cEstado = col("estado");
    const cNombre = col("nombre del canal");
    const cDesc   = col("descripcion del canal");
    const cCat    = col("categoria");
    const cLink   = col("link"); // agarra "link del canal..." o similar

    if ([cEstado, cNombre, cDesc, cCat, cLink].some(i => i === -1)) {
      return salida_(e, {
        error:
          "Faltan columnas. Encabezados detectados: " +
          JSON.stringify(headers)
      });
    }

    const out = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const estado = String(row[cEstado] || "").toLowerCase().trim();
      if (estado !== "aprobado") continue;

      const nombre = String(row[cNombre] || "").trim();
      const descripcion = String(row[cDesc] || "").trim();
      const categoria = String(row[cCat] || "").trim();
      const link = String(row[cLink] || "").trim();

      // Solo links de Telegram
      if (!link.startsWith("https://t.me/")) continue;

      out.push({ nombre, descripcion, categoria, link });
    }

    return salida_(e, out);

  } catch (err) {
    return salida_(e, { error: "Error en Apps Script: " + err.message });
  }
}

/**
 * Devuelve JSON o JSONP:
 * - Si viene ?callback=handleCanales => handleCanales([...]);
 * - Si no viene callback => JSON normal
 */
function salida_(e, data) {
  const cb = e && e.parameter && e.parameter.callback;

  if (cb) {
    return ContentService
      .createTextOutput(`${cb}(${JSON.stringify(data)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
