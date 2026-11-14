/**
 * Where each body sits on the star map.
 *
 * Units: x and radius are percent of the map's width; y is in the same "width units"
 * (the map is `height` units tall). Angles are degrees, 0 = right, positive = down.
 * A body is placed one of three ways: `at` (fixed), `orbit` (around the Sun), or
 * `satelliteOf` (offset from another body, like the Moon from Earth).
 */
const MAP_LAYOUT = (() => {
  const sun = Object.freeze({ x: 4, y: 55 });
  const orbit = (radius, angle) => Object.freeze({ radius, angle });
  const body = (planet, placement, size, label) => Object.freeze({ planet, size, label, ...placement });

  return Object.freeze({
    height: 108,
    sun,
    orbits: Object.freeze([22, 31, 40, 49, 59, 70, 81, 91]),
    bodies: Object.freeze([
      body("sun", { at: sun }, 22, "right"),
      body("mercury", { orbit: orbit(22, -50) }, 9, "top"),
      body("venus", { orbit: orbit(31, 48) }, 11, "bottom"),
      body("earth", { orbit: orbit(40, -38) }, 11, "top"),
      body("moon", { satelliteOf: "earth", offset: Object.freeze({ x: 9, y: -12.5 }) }, 8, "right"),
      body("mars", { orbit: orbit(49, 36) }, 10, "bottom"),
      body("jupiter", { orbit: orbit(59, -27) }, 17, "top"),
      body("saturn", { orbit: orbit(70, 26) }, 17, "bottom"),
      body("uranus", { orbit: orbit(81, -20) }, 12, "top"),
      body("neptune", { orbit: orbit(91, 19) }, 12, "bottom"),
    ]),
  });
})();
