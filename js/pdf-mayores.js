// pdf-mayores.js — Conecta tu generador Sudoku al PDF A4 de alta legibilidad.

(function () {
  const { jsPDF } = window.jspdf;

  // Tamaños de subcuadrantes por tamaño de tablero (9x9 soportado hoy)
  const BLOCKS = { 9: { r: 3, c: 3 }, 6: { r: 2, c: 3 }, 4: { r: 2, c: 2 } };

  // --- Dibujo de grilla y números (alto contraste, líneas más gruesas para mayores)
  function drawGrid(doc, x, y, size, cell, opts = {}) {
    const { r: br, c: bc } = BLOCKS[size] || BLOCKS[9];
    const w = cell * size, h = cell * size;

    const thin = opts.thin || 1.2;   // pt (un poco más grueso)
    const thick = opts.thick || 2.4; // pt

    doc.setDrawColor(0,0,0);
    doc.setLineWidth(thick);
    doc.rect(x, y, w, h);

    for (let i = 1; i < size; i++) {
      const lwRow = (i % br === 0) ? thick : thin;
      const lwCol = (i % bc === 0) ? thick : thin;

      doc.setLineWidth(lwRow);
      doc.line(x, y + i * cell, x + w, y + i * cell);

      doc.setLineWidth(lwCol);
      doc.line(x + i * cell, y, x + i * cell, y + h);
    }
  }

  function placeNumbers(doc, x, y, size, cell, grid, fontSize = 24) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0,0,0);
    doc.setFontSize(fontSize);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const v = grid[r * size + c];
        if (!v) continue;
        const cx = x + c * cell + cell / 2;
        const cy = y + r * cell + cell / 2 + fontSize * 0.35;
        doc.text(String(v), cx, cy, { align: "center", baseline: "middle" });
      }
    }
  }

  function addCover(doc, title, subtitle) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text(title, 56, 120);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(subtitle, 56, 152);
  }

  function addSudokuPage(doc, { size, given, index }) {
    doc.addPage("a4", "portrait");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Sudoku #${index}`, 56, 70);

    const cell = size === 9 ? 40 : size === 6 ? 52 : 72; // celdas grandes
    const x = 56, y = 100;

    drawGrid(doc, x, y, size, cell);
    placeNumbers(doc, x, y, size, cell, given, size === 9 ? 24 : size === 6 ? 26 : 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Fundación Falltem – Material imprimible para adultos mayores", 56, 820);
  }

  function addSolutionPage(doc, { size, solution, index }) {
    doc.addPage("a4", "portrait");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Solución – Sudoku #${index}`, 56, 70);

    const cell = size === 9 ? 40 : size === 6 ? 52 : 72;
    const x = 56, y = 100;

    drawGrid(doc, x, y, size, cell);
    placeNumbers(doc, x, y, size, cell, solution, size === 9 ? 24 : size === 6 ? 26 : 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Fundación Falltem – Soluciones", 56, 820);
  }

  function buildPack({ title, subtitle, size, items, includeSolutions = true, filename }) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Portada
    addCover(doc, title, subtitle);

    // Sudokus
    items.forEach((it, i) => addSudokuPage(doc, { size, given: it.given, index: i + 1 }));

    // Soluciones
    if (includeSolutions) {
      doc.addPage("a4", "portrait");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("Soluciones", 56, 120);

      items.forEach((it, i) => addSolutionPage(doc, { size, solution: it.solution || it.given, index: i + 1 }));
    }

    doc.save(filename || `falltem-sudoku-${size}x${size}.pdf`);
  }

  // --- NUEVO: usar TU generador real (9×9) ---
  function generateItemsFromYourCore({ count, difficulty, seed }) {
    if (typeof Sudoku === "undefined" || !Sudoku.generatePuzzle) {
      throw new Error("No se encontró Sudoku.generatePuzzle(). ¿Copiaste js/sudoku-core.js?");
    }
    const rngBase = seed && seed.trim()
      ? RNG.fromSeedString(seed.trim())
      : RNG.fromSeedString(String(Date.now()));

    const items = [];
    for (let i = 0; i < count; i++) {
      const rng = RNG.fromSeedString(String(rngBase.next()) + ":" + i);
      // difficulty: 'easy' | 'medium' | 'hard'
      const { puzzle, solution } = Sudoku.generatePuzzle(difficulty, rng);

      // defensa suave: si por algún motivo no hay huecos, lo aceptamos igual (tu core ya fuerza unicidad)
      items.push({ given: puzzle, solution });
    }
    return items;
  }

  // Hook UI
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnBuild");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const size = parseInt(document.getElementById("inpSize").value, 10);
      const count = Math.max(1, Math.min(30, parseInt(document.getElementById("inpCount").value || "6", 10)));
      const difficulty = (document.getElementById("inpDiff").value || "easy").toLowerCase();
      const seed = (document.getElementById("inpSeed").value || "").trim();
      const includeSolutions = document.getElementById("chkSolutions").checked;

      if (size !== 9) {
        alert("Por ahora el generador produce 9×9. Usaremos 9×9 para este pack.");
      }

      const items = generateItemsFromYourCore({ count, difficulty, seed });

      buildPack({
        title: `Sudoku 9×9 – Adultos Mayores`,
        subtitle: `Alto contraste · Fuente grande · A4 · Dificultad: ${difficulty}`,
        size: 9,
        items,
        includeSolutions,
        filename: `falltem-sudoku-9x9-${difficulty}.pdf`
      });
    });
  });
})();
