/**
 * Manifest: the one list of source files and the order they are bundled in.
 * Modules are plain scripts that define a `const`; a module may only use modules listed above it.
 *
 *   pure   no DOM access: the build checks these load in Node, and the tests exercise them
 *   ui     needs the browser
 */
module.exports = {
  styles: [
    "styles/00-tokens.css",
    "styles/10-base.css",
    "styles/20-components.css",
    "styles/30-map.css",
    "styles/40-poem.css",
    "styles/50-keepsakes.css",
    "styles/60-motion.css",
  ],
  pure: [
    "js/config.js",
    "js/data/poets.js",
    "js/data/planets.js",
    "js/data/map-layout.js",
    "js/data/poems.js",
    "js/domain/text.js",
    "js/domain/greeting.js",
    "js/domain/catalog.js",
    "js/domain/daily.js",
    "js/domain/orbit.js",
    "js/domain/constellation.js",
    "js/state/actions.js",
    "js/state/reducer.js",
    "js/state/store.js",
    "js/state/selectors.js",
    "js/infra/storage.js",
    "js/render/pixel-planet.js",
    "js/render/pixel-art.js",
  ],
  ui: [
    "js/infra/dom.js",
    "js/ui/effects.js",
    "js/ui/planet-actor.js",
    "js/ui/blink-loop.js",
    "js/ui/spotlight.js",
    "js/ui/toast.js",
    "js/ui/badges.js",
    "js/ui/launch-effect.js",
    "js/ui/screen-manager.js",
    "js/ui/today-card.js",
    "js/ui/map-view.js",
    "js/ui/destination-view.js",
    "js/ui/poem-template.js",
    "js/ui/poem-view.js",
    "js/ui/language-switch.js",
    "js/ui/dock.js",
    "js/ui/keepsakes-view.js",
    "js/ui/input.js",
    "js/app.js",
  ],
  /** Names the test harness reads from the loaded `pure` modules. */
  exports: [
    "Config", "POETS", "PLANETS", "MAP_LAYOUT", "POEMS", "Text", "Greeting", "createCatalog", "Daily", "Orbit",
    "Constellation", "Actions", "createInitialState", "createReducer", "createStore", "Selectors", "createStorage",
    "PixelPlanet", "PixelArt",
  ],
};
