/** PixelArt: small pixel-art SVGs (stars for keepsakes, the rocket on the map). */
const PixelArt = (() => {
  const STAR = Object.freeze(["...X...", "...X...", "..XXX..", "XXXXXXX", "..XXX..", "...X...", "...X..."]);
  const ROCKET = Object.freeze(["...R...", "..RRR..", "..WBW..", "..WWW..", ".RWWWR.", "RRWWWRR", "..F.F..", "...F..."]);
  const ROCKET_COLORS = Object.freeze({ R: "#ff5c93", W: "#ffffff", B: "#8fe8ef", F: "#ffd36b" });

  const rects = (rows, colorOf, unit, offsetX, offsetY) => {
    let svg = "";
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x += 1) {
        const color = colorOf(row[x]);
        if (color) svg += `<rect x="${offsetX + x * unit}" y="${offsetY + y * unit}" width="${unit}" height="${unit}" fill="${color}"/>`;
      }
    });
    return svg;
  };

  /** Star rectangles to drop into an existing <svg>, centred on (cx, cy). */
  const starAt = (color, cx, cy, unit) => {
    const half = (STAR.length * unit) / 2;
    return rects(STAR, (cell) => (cell === "X" ? color : null), unit, Math.round(cx - half), Math.round(cy - half));
  };

  /** A standalone little star icon. */
  const starIcon = (color) =>
    `<svg viewBox="0 0 7 7" aria-hidden="true">${rects(STAR, (cell) => (cell === "X" ? color : null), 1, 0, 0)}</svg>`;

  const rocket = () =>
    `<svg class="rocket" viewBox="0 0 7 8" aria-hidden="true">${rects(ROCKET, (cell) => ROCKET_COLORS[cell] ?? null, 1, 0, 0)}</svg>`;

  return Object.freeze({ starAt, starIcon, rocket });
})();
