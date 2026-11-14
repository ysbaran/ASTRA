#!/usr/bin/env node
/**
 * Smoke test: boots the real app (every module in manifest.pure + manifest.ui) against a
 * tiny fake DOM and walks through the main journey. It cannot judge how things look, but it
 * catches wiring mistakes: missing elements, misspelled names, handlers that throw.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const manifest = require("../manifest.js");

const SRC = path.join(__dirname, "..", "src");
const bundle = [...manifest.pure, ...manifest.ui].map((file) => fs.readFileSync(path.join(SRC, file), "utf8")).join("\n");

// ---------------- a very small fake DOM ----------------
class FakeElement {
  constructor(name = "") {
    this.name = name;
    this.dataset = {};
    this.attrs = {};
    this.listeners = {};
    this.classes = new Set();
    this.children = [];
    this.found = new Map();
    this.lists = {};
    this.hidden = false;
    this.inert = false;
    this.textContent = "";
    this.htmlText = "";
    this.width = 24;
    this.height = 24;
    this.offsetWidth = 0;
    this.style = { setProperty(key, value) { this[key] = value; } };
    this.classList = {
      add: (...names) => names.forEach((n) => this.classes.add(n)),
      remove: (...names) => names.forEach((n) => this.classes.delete(n)),
      toggle: (n, force) => ((force === undefined ? !this.classes.has(n) : force) ? this.classes.add(n) : this.classes.delete(n)),
      contains: (n) => this.classes.has(n),
    };
  }
  set className(value) { this.classes = new Set(String(value).split(/\s+/).filter(Boolean)); }
  get className() { return [...this.classes].join(" "); }
  set innerHTML(value) { this.htmlText = String(value); }
  get innerHTML() { return this.htmlText; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  getAttribute(key) { return this.attrs[key] ?? null; }
  addEventListener(type, handler) { (this.listeners[type] ||= []).push(handler); }
  removeEventListener() {}
  appendChild(child) { this.children.push(child); return child; }
  remove() {}
  focus() { this.ownerDocument.activeElement = this; }
  querySelector(selector) {
    if (!this.found.has(selector)) {
      const child = new FakeElement(selector);
      child.ownerDocument = this.ownerDocument;
      this.found.set(selector, child);
    }
    return this.found.get(selector);
  }
  querySelectorAll(selector) { return this.lists[selector] ?? []; }
  closest() { return null; }
  getBoundingClientRect() { return { top: 0, height: 0 }; }
  getContext() { return { clearRect() {}, fillRect() {}, set fillStyle(value) {} }; }
}

const boot = ({ savedFavorites = null, savedLanguage = null } = {}) => {
  const timers = [];
  const store = new Map();
  if (savedFavorites !== null) store.set("planetPoems.favorites.v1", savedFavorites);
  if (savedLanguage !== null) store.set("planetPoems.language.v1", savedLanguage);

  const elements = new Map();
  const documentListeners = {};
  const document = {
    activeElement: null,
    documentElement: new FakeElement("html"),
    body: new FakeElement("body"),
    getElementById(id) {
      if (!elements.has(id)) {
        const element = new FakeElement(id);
        element.ownerDocument = document;
        elements.set(id, element);
        if (id === "language-switch") {
          element.lists["[data-language]"] = ["fa", "both", "en"].map((language) => Object.assign(new FakeElement(language), { dataset: { language }, ownerDocument: document }));
        }
      }
      return elements.get(id);
    },
    createElement(tag) { const element = new FakeElement(tag); element.ownerDocument = document; return element; },
    querySelectorAll(selector) {
      if (selector === "[data-keepsake-badge]") return badges;
      if (selector === "[data-star-icon]") return [];
      return [];
    },
    addEventListener(type, handler) { (documentListeners[type] ||= []).push(handler); },
  };
  document.documentElement.ownerDocument = document;
  document.body.ownerDocument = document;
  const badges = [new FakeElement("badge-top"), new FakeElement("badge-dock")];
  badges.forEach((badge) => { badge.hidden = true; badge.ownerDocument = document; });

  const window = {
    localStorage: { getItem: (key) => (store.has(key) ? store.get(key) : null), setItem: (key, value) => store.set(key, String(value)) },
    matchMedia: () => ({ matches: false }),
    scrollTo() {},
    innerHeight: 800,
    addEventListener() {},
  };

  const context = vm.createContext({
    window, document, Element: FakeElement, console, Promise,
    setTimeout: (fn) => { timers.push(fn); return timers.length; },
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
    requestAnimationFrame: (fn) => { fn(); return 1; },
  });
  vm.runInContext(`(() => {\n"use strict";\n${bundle}\n})();`, context, { filename: "bundle.js" });

  const el = (id) => document.getElementById(id);
  const fire = (target, type, event = {}) => (target.listeners[type] || []).forEach((handler) => handler({ target, ...event }));
  /** A fake click target whose nearest match for any selector is `match`. */
  const aim = (match) => Object.assign(new FakeElement("target"), { closest: () => match });
  const flush = () => { while (timers.length) timers.shift()(); };
  const press = (key) => (documentListeners.keydown || []).forEach((handler) => handler({ key }));
  return { el, fire, aim, flush, press, store, badges, document };
};

// ---------------- tiny test runner ----------------
const failures = [];
let passed = 0;
const queue = [];
const step = (name, body) => queue.push({ name, body });
const tick = () => new Promise((resolve) => setImmediate(resolve)); // lets pending Promise callbacks run
const runAll = async () => {
  for (const { name, body } of queue) {
    try { await body(); passed += 1; } catch (error) { failures.push(`${name}\n    ${error.stack.split("\n").slice(0, 3).join("\n    ")}`); }
  }
};
const assert = (condition, message) => { if (!condition) throw new Error(message || "assertion failed"); };

// the same poems the app will pick for "today"
const pure = new Function(`"use strict";\n${manifest.pure.map((f) => fs.readFileSync(path.join(SRC, f), "utf8")).join("\n")}\nreturn { POEMS, PLANETS, POETS, Daily, createCatalog };`)();
const catalog = pure.createCatalog({ poems: pure.POEMS, planets: pure.PLANETS, poets: pure.POETS });
const today = catalog.at(pure.Daily.indexFor(catalog.size, new Date()));
const after = catalog.neighbour(today.id, 1);

let app;
try { app = boot(); passed += 1; } catch (error) { console.error(`the app failed to boot\n${error.stack}`); process.exit(1); }

step("the map screen is filled in", () => {
  assert(app.el("greeting").textContent.includes(", you"), "greeting missing");
  assert(app.el("today-title").textContent === today.title, "today's title missing");
  assert(app.el("solar-map").children.length === pure.PLANETS.length, "every planet should be a node on the map");
  assert(app.el("destination").innerHTML.includes(catalog.planetOf(today).name), "destination panel should show today's planet");
});

step("tapping a planet shows its poems", () => {
  const button = Object.assign(new FakeElement("node"), { dataset: { planetId: "mars" } });
  app.fire(app.el("solar-map"), "click", { target: app.aim(button) });
  assert(app.el("destination").innerHTML.includes("Mars"), "Mars panel missing");
  assert(app.el("destination").querySelector(".options").innerHTML.includes("Every Knot but One"), "Mars poems missing");
});

step("opening today's poem moves to the poem screen", async () => {
  app.fire(app.el("today-card"), "click");
  app.flush(); // let the launch bloom finish
  await tick();
  assert(app.el("screen-map").hidden === true && app.el("screen-poem").hidden === false, "screens did not swap");
  assert(app.el("dock").hidden === false, "dock should show");
  assert(app.el("poem-stage").innerHTML.includes(today.title), "poem title missing");
  assert(app.el("poem-stage").innerHTML.includes("couplet__fa"), "couplets missing");
});

step("next shows the following poem", () => {
  app.fire(app.el("dock-next"), "click");
  assert(app.el("poem-stage").innerHTML.includes(after.title), "next poem missing");
});

step("keeping a poem saves it, updates badges and celebrates", () => {
  app.fire(app.el("dock-keep"), "click");
  const saved = JSON.parse(app.store.get("planetPoems.favorites.v1"));
  assert(saved.length === 1 && saved[0] === after.id, "favourite not persisted");
  assert(app.badges.every((b) => b.textContent === "1" && b.hidden === false), "badges not updated");
  assert(app.el("toast").textContent.includes("first keepsake"), "toast missing");
  assert(app.el("dock-keep").getAttribute("aria-pressed") === "true", "keep button state wrong");
});

step("the keepsakes sheet opens, lists the poem, and closes with Escape", () => {
  app.fire(app.el("dock-keepsakes"), "click");
  assert(app.el("keepsakes").hidden === false, "sheet should be open");
  assert(app.el("keepsakes-list").innerHTML.includes(after.title), "kept poem missing from list");
  assert(app.el("app").inert === true, "page behind should be inert");
  app.press("Escape");
  assert(app.el("keepsakes").hidden === true && app.el("app").inert === false, "sheet should close and release the page");
});

step("removing a keepsake updates the list and storage", () => {
  app.fire(app.el("dock-keepsakes"), "click");
  const remove = Object.assign(new FakeElement("remove"), { dataset: { poemId: after.id } });
  app.fire(app.el("keepsakes-list"), "click", { target: app.aim(remove) });
  assert(JSON.parse(app.store.get("planetPoems.favorites.v1")).length === 0, "favourite not removed");
  assert(app.badges.every((b) => b.hidden === true), "badges should hide at zero");
  app.press("Escape");
});

step("choosing a language applies and persists", () => {
  const button = Object.assign(new FakeElement("lang"), { dataset: { language: "fa" } });
  app.fire(app.el("language-switch"), "click", { target: app.aim(button) });
  assert(app.el("poem-stage").dataset.language === "fa", "stage language not applied");
  assert(app.store.get("planetPoems.language.v1") === "fa", "language not saved");
});

step("back returns to the map on the current poem's planet", () => {
  app.fire(app.el("back-to-map"), "click");
  assert(app.el("screen-map").hidden === false && app.el("screen-poem").hidden === true, "map not shown");
  assert(app.el("destination").innerHTML.includes(catalog.planetOf(after).name), "destination should follow the poem");
});

step("arrow keys only work on the poem screen", () => {
  const before = app.el("poem-stage").innerHTML;
  app.press("ArrowRight");
  assert(app.el("poem-stage").innerHTML === before, "arrow key changed the poem while on the map");
});

step("corrupt saved data does not stop the app starting", () => {
  boot({ savedFavorites: "{not json", savedLanguage: "klingon" });
  boot({ savedFavorites: JSON.stringify([5, "ghost", {}]), savedLanguage: "fa" });
  boot({ savedFavorites: JSON.stringify("a string") });
});

step("saved favourites and language are restored", () => {
  const restored = boot({ savedFavorites: JSON.stringify([today.id, "ghost"]), savedLanguage: "en" });
  assert(restored.badges.every((b) => b.textContent === "1"), "favourite not restored (unknown ids should be dropped)");
  assert(restored.el("poem-stage").dataset.language === "en", "language not restored");
});

runAll().then(() => {
  const total = passed + failures.length;
  if (failures.length) {
    console.error(`\n${failures.length} of ${total} smoke steps failed:\n`);
    failures.forEach((f) => console.error(` x ${f}`));
    process.exit(1);
  }
  console.log(`Smoke test passed (${total} steps).`);
});
