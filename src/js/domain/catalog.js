/**
 * Catalog: a read-only index over poems, planets and poets.
 * It validates its input up front, so a data mistake fails loudly at start-up
 * (and in the tests) instead of showing up as a blank screen later.
 */
const createCatalog = ({ poems, planets, poets }) => {
  const planetById = new Map(planets.map((planet) => [planet.id, planet]));
  const poemsByPlanet = new Map(planets.map((planet) => [planet.id, []]));
  const indexById = new Map();

  poems.forEach((poem, index) => {
    if (indexById.has(poem.id)) throw new Error(`Duplicate poem id "${poem.id}"`);
    if (!planetById.has(poem.planet)) throw new Error(`Poem "${poem.id}" uses unknown planet "${poem.planet}"`);
    if (!poets[poem.poet]) throw new Error(`Poem "${poem.id}" uses unknown poet "${poem.poet}"`);
    if (poem.couplets.length === 0) throw new Error(`Poem "${poem.id}" has no couplets`);
    indexById.set(poem.id, index);
    poemsByPlanet.get(poem.planet).push(poem);
  });

  const size = poems.length;
  const wrap = (index) => ((index % size) + size) % size;

  return Object.freeze({
    size,
    planets,
    poems,
    hasPoem: (id) => indexById.has(id),
    poem: (id) => poems[indexById.get(id)],
    indexOf: (id) => indexById.get(id),
    at: (index) => poems[wrap(index)],
    /** The poem `delta` steps away, wrapping around the ends. */
    neighbour: (id, delta) => poems[wrap(indexById.get(id) + delta)],
    planet: (id) => planetById.get(id),
    poemsOf: (planetId) => poemsByPlanet.get(planetId) ?? [],
    poet: (id) => poets[id],
    planetOf: (poem) => planetById.get(poem.planet),
    poetOf: (poem) => poets[poem.poet],
  });
};
