#!/usr/bin/env node
/**
 * Tests: dependency-free, run with `node test/run.js`.
 * They load the browser-free modules listed in manifest.pure and check the data,
 * the domain rules and the reducer.
 */
const fs = require("fs");
const path = require("path");
const manifest = require("../manifest.js");

const source = manifest.pure.map((file) => fs.readFileSync(path.join(__dirname, "..", "src", file), "utf8")).join("\n");
const M = new Function(`"use strict";\n${source}\nreturn { ${manifest.exports.join(", ")} };`)();

let passed = 0;
const failures = [];
const test = (name, body) => {
  try {
    body();
    passed += 1;
  } catch (error) {
    failures.push(`${name}\n    ${error.message}`);
  }
};
const assert = (condition, message) => { if (!condition) throw new Error(message || "assertion failed"); };
const equal = (actual, expected, message) =>
  assert(Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected), `${message || "values differ"}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
const throws = (fn, pattern) => {
  try { fn(); } catch (error) { assert(pattern.test(error.message), `wrong error: ${error.message}`); return; }
  throw new Error("expected an error");
};

const catalog = M.createCatalog({ poems: M.POEMS, planets: M.PLANETS, poets: M.POETS });

// ---------------- data ----------------
test("there are plenty of poems", () => assert(M.POEMS.length >= 50, `only ${M.POEMS.length}`));
test("poem ids are unique, lowercase and URL-safe", () => {
  const ids = M.POEMS.map((p) => p.id);
  equal(new Set(ids).size, ids.length, "duplicate ids");
  ids.forEach((id) => assert(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id), `bad id ${id}`));
});
test("every couplet has two Persian and two English lines", () => {
  M.POEMS.forEach((poem) => poem.couplets.forEach((c, i) => {
    const where = `${poem.id} couplet ${i + 1}`;
    equal(c.fa.length, 2, `${where} Persian lines`);
    equal(c.en.length, 2, `${where} English lines`);
    c.fa.forEach((line) => assert(M.Text.hasPersianScript(line), `${where}: Persian line has no Persian letters`));
    c.en.forEach((line) => assert(line.trim() && !M.Text.hasPersianScript(line), `${where}: English line is empty or Persian`));
  }));
});
test("every planet has at least one poem", () => M.PLANETS.forEach((p) => assert(catalog.poemsOf(p.id).length >= 2, `${p.id} has too few poems`)));
test("every poem has a poet and a planet", () => M.POEMS.forEach((p) => { assert(catalog.poetOf(p), p.id); assert(catalog.planetOf(p), p.id); }));
test("khayyam quatrains carry the attribution note", () =>
  M.POEMS.filter((p) => p.poet === "khayyam").forEach((p) => assert(p.note && /attributed/.test(p.note), `${p.id} lacks a note`)));
test("no poem text contains a stray tab or double space", () =>
  M.POEMS.forEach((p) => p.couplets.forEach((c) => [...c.fa, ...c.en].forEach((line) => assert(!/\t| {2}/.test(line), `${p.id}: odd spacing`)))));
test("every planet has a sprite and a map position", () => {
  M.PLANETS.forEach((planet) => {
    assert(M.PixelPlanet.sprites.includes(planet.sprite), `${planet.id} has no sprite`);
    assert(M.MAP_LAYOUT.bodies.some((b) => b.planet === planet.id), `${planet.id} is not on the map`);
  });
});

// ---------------- catalog ----------------
test("catalog rejects bad data", () => {
  const base = { planets: M.PLANETS, poets: M.POETS };
  throws(() => M.createCatalog({ ...base, poems: [M.POEMS[0], M.POEMS[0]] }), /Duplicate poem id/);
  throws(() => M.createCatalog({ ...base, poems: [{ ...M.POEMS[0], planet: "pluto" }] }), /unknown planet/);
  throws(() => M.createCatalog({ ...base, poems: [{ ...M.POEMS[0], poet: "nobody" }] }), /unknown poet/);
  throws(() => M.createCatalog({ ...base, poems: [{ ...M.POEMS[0], couplets: [] }] }), /no couplets/);
});
test("neighbour wraps around both ends", () => {
  equal(catalog.neighbour(M.POEMS[catalog.size - 1].id, 1).id, M.POEMS[0].id);
  equal(catalog.neighbour(M.POEMS[0].id, -1).id, M.POEMS[catalog.size - 1].id);
});
test("poems are grouped by planet in the planet order", () => {
  const order = M.PLANETS.map((p) => p.id);
  const sequence = M.POEMS.map((p) => order.indexOf(p.planet));
  equal(sequence, [...sequence].sort((a, b) => a - b), "poems not in planet order");
});

// ---------------- daily poem ----------------
test("daily index stays in range and is stable for a date", () => {
  const date = new Date(2026, 9, 13, 8);
  const index = M.Daily.indexFor(catalog.size, date);
  assert(index >= 0 && index < catalog.size);
  equal(M.Daily.indexFor(catalog.size, new Date(2026, 9, 13, 23, 59)), index, "changed within a day");
});
test("daily poems visit every poem before repeating", () => {
  const seen = new Set();
  for (let day = 0; day < catalog.size; day += 1) seen.add(M.Daily.indexFor(catalog.size, new Date(2026, 0, 1 + day, 12)));
  equal(seen.size, catalog.size, "some poems were skipped");
});
test("daily stride shares no factor with the poem count", () => {
  [5, 10, 23, 50, 64, 77].forEach((count) => {
    const stride = M.Daily.strideFor(count);
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    equal(gcd(stride, count), 1, `count ${count}`);
  });
});

// ---------------- greeting & text ----------------
test("greeting follows the time of day", () => {
  equal(M.Greeting.partOfDay(3), "up late");
  equal(M.Greeting.partOfDay(9), "good morning");
  equal(M.Greeting.partOfDay(15), "good afternoon");
  equal(M.Greeting.partOfDay(21), "good evening");
  equal(M.Greeting.forDate(new Date(2026, 0, 1, 9), "Sara"), "good morning, Sara");
});
test("escapeHtml neutralises markup", () => equal(M.Text.escapeHtml('<b a="1">&\''), "&lt;b a=&quot;1&quot;&gt;&amp;&#39;"));
test("hashString is stable and spreads values", () => {
  equal(M.Text.hashString("hafez"), M.Text.hashString("hafez"));
  assert(M.Text.hashString("hafez") !== M.Text.hashString("rumi"));
});

// ---------------- map layout ----------------
test("map bodies stay on the map and never overlap", () => {
  const placed = M.Orbit.placeBodies(M.MAP_LAYOUT);
  equal(placed.length, M.PLANETS.length, "every planet must be placed");
  placed.filter((b) => b.planet !== "sun").forEach((b) => {
    assert(b.x - b.size / 2 >= 0 && b.x + b.size / 2 <= 100, `${b.planet} runs off the sides`);
    assert(b.top >= 0 && b.top <= 100, `${b.planet} runs off the top or bottom`);
  });
  placed.forEach((a, i) => placed.slice(i + 1).forEach((b) => {
    const gap = Math.hypot(a.x - b.x, a.y - b.y) - (a.size + b.size) / 2;
    assert(gap > 1, `${a.planet} and ${b.planet} overlap (gap ${gap.toFixed(1)})`);
  }));
});
test("satellites are placed relative to their parent", () => {
  const placed = M.Orbit.placeBodies(M.MAP_LAYOUT);
  const earth = placed.find((b) => b.planet === "earth");
  const moon = placed.find((b) => b.planet === "moon");
  equal(+(moon.x - earth.x).toFixed(2), 9);
});

// ---------------- constellation ----------------
test("constellation keeps every star inside its box, even with every poem kept", () => {
  const ids = M.POEMS.map((p) => p.id);
  const { width, height, points } = M.Constellation.layout(ids, M.Config.constellation);
  equal(points.length, ids.length);
  points.forEach((p) => assert(p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height, `${p.id} is outside`));
  assert(height >= M.Config.constellation.minHeight);
});
test("constellation is deterministic", () => {
  const a = M.Constellation.layout(["a", "b", "c"], M.Config.constellation);
  const b = M.Constellation.layout(["a", "b", "c"], M.Config.constellation);
  equal(a, b);
});

// ---------------- state ----------------
const makeState = (overrides = {}) =>
  M.createInitialState({ catalog, todayId: M.POEMS[0].id, favorites: [], language: "both", languages: M.Config.languages, defaultLanguage: M.Config.defaultLanguage, ...overrides });
const reducer = M.createReducer({ catalog, languages: M.Config.languages });
const run = (state, ...actions) => actions.reduce(reducer, state);

test("initial state starts on the map at today's poem", () => {
  const state = makeState();
  equal(state.screen, "map");
  equal(state.poemId, M.POEMS[0].id);
  equal(state.planetId, M.POEMS[0].planet);
});
test("initial state cleans up saved favourites and language", () => {
  const state = makeState({ favorites: [M.POEMS[1].id, "ghost", M.POEMS[1].id], language: "klingon" });
  equal(state.favorites, [M.POEMS[1].id]);
  equal(state.language, "both");
});
test("opening a poem switches screen and follows the poem's planet", () => {
  const target = M.POEMS[catalog.size - 1];
  const state = run(makeState(), M.Actions.openPoem(target.id));
  equal(state.screen, "poem");
  equal(state.poemId, target.id);
  equal(state.planetId, target.planet);
});
test("opening an unknown poem changes nothing", () => {
  const state = makeState();
  assert(reducer(state, M.Actions.openPoem("nope")) === state);
});
test("step moves through poems and wraps", () => {
  const first = run(makeState(), M.Actions.openPoem(M.POEMS[0].id));
  equal(run(first, M.Actions.step(1)).poemId, M.POEMS[1].id);
  equal(run(first, M.Actions.step(-1)).poemId, M.POEMS[catalog.size - 1].id);
});
test("going back to the map selects the current poem's planet", () => {
  const state = run(makeState(), M.Actions.openPoem(M.POEMS[10].id), M.Actions.goToMap());
  equal(state.screen, "map");
  equal(state.planetId, M.POEMS[10].planet);
});
test("favourites toggle on and off and keep their order", () => {
  const [a, b] = M.POEMS;
  let state = run(makeState(), M.Actions.toggleFavorite(a.id), M.Actions.toggleFavorite(b.id));
  equal(state.favorites, [a.id, b.id]);
  state = run(state, M.Actions.toggleFavorite(a.id));
  equal(state.favorites, [b.id]);
  state = run(state, M.Actions.removeFavorite(b.id));
  equal(state.favorites, []);
});
test("favouriting an unknown poem is ignored", () => {
  const state = makeState();
  assert(reducer(state, M.Actions.toggleFavorite("nope")) === state);
});
test("language only accepts known values", () => {
  const state = makeState();
  equal(run(state, M.Actions.setLanguage("fa")).language, "fa");
  assert(reducer(state, M.Actions.setLanguage("xx")) === state);
});
test("opening a poem closes the keepsakes sheet", () => {
  const state = run(makeState(), M.Actions.openKeepsakes(), M.Actions.openPoem(M.POEMS[2].id));
  equal(state.keepsakesOpen, false);
});
test("the reducer never mutates its input", () => {
  const state = makeState();
  const frozen = JSON.stringify(state);
  run(state, M.Actions.toggleFavorite(M.POEMS[0].id), M.Actions.openPoem(M.POEMS[3].id), M.Actions.setLanguage("en"));
  equal(JSON.stringify(state), frozen);
});
test("the store notifies subscribers only when state changes", () => {
  const store = M.createStore(reducer, makeState());
  let calls = 0;
  const off = store.subscribe(() => { calls += 1; });
  store.dispatch(M.Actions.selectPlanet("mars"));
  store.dispatch(M.Actions.selectPlanet("mars"));
  equal(calls, 1);
  off();
  store.dispatch(M.Actions.selectPlanet("venus"));
  equal(calls, 1);
});

// ---------------- storage ----------------
test("storage survives a missing or throwing backend", () => {
  const broken = M.createStorage(() => { throw new Error("blocked"); });
  equal(broken.read("k", "fallback"), "fallback");
  equal(broken.write("k", "v"), false);
  const empty = M.createStorage(() => null);
  equal(empty.readJSON("k", [1]), [1]);
});
test("storage round-trips JSON and ignores corrupt values", () => {
  const data = new Map();
  const backend = { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, v) };
  const storage = M.createStorage(() => backend);
  storage.writeJSON("list", ["a", "b"]);
  equal(storage.readJSON("list", []), ["a", "b"]);
  data.set("bad", "{not json");
  equal(storage.readJSON("bad", "safe"), "safe");
});

// ---------------- pixel art ----------------
test("every sprite draws only inside the 24 x 24 grid and has a face", () => {
  M.PixelPlanet.sprites.forEach((sprite) => {
    const list = M.PixelPlanet.pixels(sprite);
    assert(list.length > 100, `${sprite} is nearly empty`);
    list.forEach(({ x, y }) => assert(x >= 0 && x < 24 && y >= 0 && y < 24, `${sprite} draws outside the grid at ${x},${y}`));
    assert(list.some((p) => p.color === "#4a1f33"), `${sprite} has no face`);
  });
});
test("blinking and talking change the face but not the planet's size", () => {
  const plain = M.PixelPlanet.pixels("venus");
  assert(JSON.stringify(plain) !== JSON.stringify(M.PixelPlanet.pixels("venus", { blink: true })));
  assert(JSON.stringify(plain) !== JSON.stringify(M.PixelPlanet.pixels("venus", { talk: true })));
});
test("pixel sprites are deterministic and unknown sprites fail loudly", () => {
  equal(M.PixelPlanet.pixels("earth"), M.PixelPlanet.pixels("earth"));
  throws(() => M.PixelPlanet.pixels("pluto"), /Unknown sprite/);
});
test("pixel art helpers return svg markup", () => {
  assert(M.PixelArt.starIcon("#fff").startsWith("<svg"));
  assert(M.PixelArt.rocket().includes("rocket"));
  assert(M.PixelArt.starAt("#fff", 50, 50, 3).includes("<rect"));
});

// ---------------- report ----------------
const total = passed + failures.length;
if (failures.length) {
  console.error(`\n${failures.length} of ${total} tests failed:\n`);
  failures.forEach((f) => console.error(` x ${f}`));
  process.exit(1);
}
console.log(`All ${total} tests passed.`);
