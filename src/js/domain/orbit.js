/**
 * Orbit: turns the declarative map layout into coordinates.
 * Pure geometry, so it can be tested without a browser.
 */
const Orbit = (() => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  /**
   * Returns one entry per body: { planet, size, label, x, y, top }
   *   x   percent of map width
   *   y   position in width units (what the geometry works in)
   *   top percent of map height (what CSS needs)
   */
  const placeBodies = (layout) => {
    const definitions = new Map(layout.bodies.map((body) => [body.planet, body]));
    const placed = new Map();

    const locate = (body) => {
      if (placed.has(body.planet)) return placed.get(body.planet);
      let point;
      if (body.at) {
        point = { x: body.at.x, y: body.at.y };
      } else if (body.orbit) {
        const angle = toRadians(body.orbit.angle);
        point = {
          x: layout.sun.x + body.orbit.radius * Math.cos(angle),
          y: layout.sun.y + body.orbit.radius * Math.sin(angle),
        };
      } else {
        const parent = locate(definitions.get(body.satelliteOf));
        point = { x: parent.x + body.offset.x, y: parent.y + body.offset.y };
      }
      placed.set(body.planet, point);
      return point;
    };

    return layout.bodies.map((body) => {
      const { x, y } = locate(body);
      return { planet: body.planet, size: body.size, label: body.label, x, y, top: (y / layout.height) * 100 };
    });
  };

  return Object.freeze({ placeBodies });
})();
