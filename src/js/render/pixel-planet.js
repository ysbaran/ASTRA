/**
 * PixelPlanet: draws the little smiling planets on a 24 x 24 grid.
 *
 * It is split in two so the interesting part stays testable:
 *   pixels(sprite, options)   pure: returns [{ x, y, color }] with no canvas involved
 *   draw(canvas, sprite, ...) paints those pixels; CSS scales the tiny canvas up
 *
 * Later pixels overwrite earlier ones, so the order of the steps below is the layering.
 */
const PixelPlanet = (() => {
  const GRID = 24;
  const CENTER = 12;
  const COLORS = Object.freeze({ outline: "#6b3550", face: "#4a1f33", blush: "#ff7fa8", shine: "#ffffff" });

  const PALETTES = Object.freeze({
    sun: { base: "#ffd45e", light: "#fff0a0", dark: "#ffab3d", ray: "#ffd45e" },
    mercury: { base: "#cfc3b6", light: "#ebe2d6", dark: "#a69a8a", crater: "#8f8474" },
    venus: { base: "#ffb3c7", light: "#ffd9e4", dark: "#e5799c" },
    earth: { base: "#6fcaff", light: "#a8e3ff", dark: "#3f9fe0", land: "#7ef0c9", landLight: "#b6f7e0" },
    moon: { base: "#f4efd6", light: "#fffbe8", dark: "#cfc8a8", crater: "#bdb590" },
    mars: { base: "#ff9b7d", light: "#ffc4ae", dark: "#d96b52", crater: "#c85a45", cap: "#fff2ec" },
    jupiter: {
      // [light, base, dark] for three stripe colours
      stripes: [["#ffe8cf", "#ffd9b0", "#e6b98a"], ["#f5bd8c", "#e9a46f", "#c9824e"], ["#fff6e8", "#fff0dc", "#e8d2b4"]],
      spot: "#e0745a",
    },
    saturn: { base: "#b9a9ff", light: "#dcd3ff", dark: "#8d7ae6", ring: "#ffe27a" },
    uranus: { base: "#9de8ee", light: "#cdf6f8", dark: "#6cc3cc" },
    neptune: { base: "#6f8cff", light: "#a8bcff", dark: "#4a62d6", band: "#8ea6ff" },
  });

  const CRATER_SPOTS = Object.freeze([[7, 6], [16, 8], [9, 15], [15, 16], [12, 5]]);
  const SUN_RAYS = Object.freeze([[12, 1], [12, 22], [1, 12], [22, 12], [4, 4], [19, 4], [4, 19], [19, 19]]);
  const RING_Y = 14.5;

  const distance = (x, y) => Math.hypot(x + 0.5 - CENTER, y + 0.5 - CENTER);
  const ringValue = (x, y) => ((x + 0.5 - CENTER) / 11.5) ** 2 + ((y + 0.5 - RING_Y) / 3.2) ** 2;
  const onRing = (x, y) => {
    const value = ringValue(x, y);
    return value <= 1 && value >= 0.55;
  };
  const eachCell = (visit) => {
    for (let y = 0; y < GRID; y += 1) for (let x = 0; x < GRID; x += 1) visit(x, y);
  };

  // Light comes from the top left: 0 = lit, 1 = middle, 2 = shaded.
  const toneAt = (x, y, radius) => {
    const slant = x + 0.5 - CENTER + (y + 0.5 - CENTER);
    if (slant < -radius * 0.55) return 0;
    return slant > radius * 0.6 ? 2 : 1;
  };

  const surfaceColor = (sprite, palette, x, y, tone, radius) => {
    if (sprite === "jupiter") {
      const stripe = palette.stripes[y % 6 < 2 ? 1 : y % 6 < 4 ? 0 : 2];
      const onSpot = x >= 14 && x <= 16 && y >= 15 && y <= 16;
      return onSpot ? palette.spot : stripe[tone];
    }
    let color = [palette.light, palette.base, palette.dark][tone];
    const lit = x + 0.5 - CENTER + (y + 0.5 - CENTER) < radius * 0.6;
    if (sprite === "earth" && ((x >> 1) * 3 + (y >> 1) * 5) % 7 < 2 && lit) color = tone === 0 ? palette.landLight : palette.land;
    if (sprite === "neptune" && (y === 8 || y === 9 || y === 17)) color = palette.band;
    if (sprite === "venus" && (y === 7 || y === 16)) color = palette.light;
    if (sprite === "mars" && y <= 5) color = palette.cap;
    if (sprite === "uranus" && (y === 16 || y === 17)) color = palette.light;
    return color;
  };

  const addRays = (put, palette) => {
    SUN_RAYS.forEach(([x, y]) => {
      put(x, y, palette.ray);
      put(x + (x < CENTER ? 1 : x > CENTER ? -1 : 0), y + (y < CENTER ? 1 : y > CENTER ? -1 : 0), palette.ray);
    });
  };

  const addRing = (put, palette, radius, front) => {
    eachCell((x, y) => {
      if (!onRing(x, y)) return;
      const inFront = y + 0.5 >= RING_Y;
      if (inFront !== front) return;
      if (!front && distance(x, y) <= radius + 1) return; // the back of the ring hides behind the planet
      put(x, y, palette.ring);
    });
  };

  const addBody = (put, sprite, palette, radius) => {
    eachCell((x, y) => {
      if (distance(x, y) <= radius + 1) put(x, y, COLORS.outline);
    });
    eachCell((x, y) => {
      if (distance(x, y) > radius) return;
      put(x, y, surfaceColor(sprite, palette, x, y, toneAt(x, y, radius), radius));
    });
  };

  const addCraters = (put, palette, radius) => {
    CRATER_SPOTS.forEach(([x, y]) => {
      if (distance(x, y) >= radius - 1) return;
      put(x, y, palette.crater);
      put(x + 1, y, palette.crater);
    });
  };

  // Big shiny eyes, rosy cheeks and a tiny smile (or an open mouth while "talking").
  const addFace = (put, { blink, talk, shift }) => {
    const { face, blush, shine } = COLORS;
    if (blink) {
      [7, 8, 15, 16].forEach((x) => put(x, 11 + shift, face));
    } else {
      put(7, 10 + shift, shine); put(8, 10 + shift, face); put(7, 11 + shift, face); put(8, 11 + shift, face);
      put(15, 10 + shift, shine); put(16, 10 + shift, face); put(15, 11 + shift, face); put(16, 11 + shift, face);
    }
    [5, 6, 17, 18].forEach((x) => put(x, 13 + shift, blush));
    const mouth = talk ? [[11, 14], [12, 14], [11, 15], [12, 15]] : [[10, 14], [11, 15], [12, 15], [13, 14]];
    mouth.forEach(([x, y]) => put(x, y + shift, face));
  };

  const pixels = (sprite, { blink = false, talk = false } = {}) => {
    const palette = PALETTES[sprite];
    if (!palette) throw new Error(`Unknown sprite "${sprite}"`);
    const list = [];
    const put = (x, y, color) => list.push({ x, y, color });
    const ringed = sprite === "saturn";
    const radius = ringed ? 7 : 8;

    if (sprite === "sun") addRays(put, palette);
    if (ringed) addRing(put, palette, radius, false);
    addBody(put, sprite, palette, radius);
    if (palette.crater) addCraters(put, palette, radius);
    addFace(put, { blink, talk, shift: ringed ? -2 : 0 }); // Saturn's face rides higher, above its ring
    if (ringed) addRing(put, palette, radius, true);
    return list;
  };

  const draw = (canvas, sprite, options) => {
    if (canvas.width !== GRID) canvas.width = GRID;
    if (canvas.height !== GRID) canvas.height = GRID;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, GRID, GRID);
    pixels(sprite, options).forEach(({ x, y, color }) => {
      context.fillStyle = color;
      context.fillRect(x, y, 1, 1);
    });
  };

  return Object.freeze({ GRID, sprites: Object.keys(PALETTES), pixels, draw });
})();
