/**
 * App: the composition root. It is the only place that knows about every module:
 * it creates them, hands each one exactly what it needs, and connects them.
 * Everything else depends only on what it is given.
 */
const startApp = () => {
  const reducedMotion = Dom.reducedMotion();
  const { timing } = Config;
  document.documentElement.style.setProperty("--word-step", `${timing.wordStepMs}ms`);

  // ---- data and state ----
  const storage = createStorage(() => window.localStorage);
  const catalog = createCatalog({ poems: POEMS, planets: PLANETS, poets: POETS });
  const today = catalog.at(Daily.indexFor(catalog.size, new Date()));

  const store = createStore(
    createReducer({ catalog, languages: Config.languages }),
    createInitialState({
      catalog,
      todayId: today.id,
      favorites: storage.readJSON(Config.storageKeys.favorites, []),
      language: storage.read(Config.storageKeys.language, Config.defaultLanguage),
      languages: Config.languages,
      defaultLanguage: Config.defaultLanguage,
    })
  );

  // ---- elements ----
  const el = Dom.byId;
  const screens = { map: el("screen-map"), poem: el("screen-poem") };
  const dock = el("dock");

  // ---- small, static bits of the page ----
  el("greeting").textContent = Greeting.forDate(new Date(), Config.recipientName);
  document.querySelectorAll("[data-star-icon]").forEach((node) => Dom.setHtml(node, PixelArt.starIcon(node.dataset.starIcon)));

  // ---- behaviours shared by several views ----
  const toast = createToast({ element: el("toast"), durationMs: timing.toastMs });
  const launch = createLaunchEffect({ element: el("launch-bloom"), delayMs: timing.launchMs, reducedMotion });
  const spotlight = createSpotlight({ reducedMotion });

  /** Open a poem; from the map the bloom plays first, from a poem it is instant. */
  const openPoem = (poemId) => {
    store.dispatch(Actions.closeKeepsakes());
    if (store.getState().screen === "poem") {
      store.dispatch(Actions.openPoem(poemId));
      return;
    }
    launch.play().then((ready) => {
      if (ready) store.dispatch(Actions.openPoem(poemId));
    });
  };

  // ---- views (the screen manager goes first so a screen is visible before its content renders) ----
  createScreenManager({ store, screens, dock });
  createBadges({ store, elements: document.querySelectorAll("[data-keepsake-badge]") });

  createTodayCard({
    button: el("today-card"),
    titleElement: el("today-title"),
    metaElement: el("today-meta"),
    poem: today,
    planet: catalog.planetOf(today),
    poet: catalog.poetOf(today),
    onOpen: openPoem,
  });

  createMapView({ root: el("solar-map"), store, catalog, layout: MAP_LAYOUT, todayPlanetId: today.planet, timing, reducedMotion });
  createDestinationView({ root: el("destination"), store, catalog, todayPoemId: today.id, timing, reducedMotion, onOpenPoem: openPoem });

  const poemActor = createPlanetActor({ canvas: el("poem-sprite"), sprite: catalog.planetOf(today).sprite, timing, reducedMotion });
  createPoemView({
    store,
    catalog,
    elements: { stage: el("poem-stage"), planetName: el("poem-planet-name"), planetMood: el("poem-planet-mood") },
    actor: poemActor,
    spotlight,
    timing,
    reducedMotion,
  });

  createLanguageSwitch({ root: el("language-switch"), store });
  el("back-to-map").addEventListener("click", () => store.dispatch(Actions.goToMap()));

  createDock({
    store,
    toast,
    elements: { prev: el("dock-prev"), next: el("dock-next"), keep: el("dock-keep"), keepsakes: el("dock-keepsakes") },
  });

  createKeepsakesView({
    store,
    catalog,
    config: Config.constellation,
    background: [el("app"), dock],
    onOpenPoem: openPoem,
    elements: {
      root: el("keepsakes"),
      closeButton: el("keepsakes-close"),
      sky: el("constellation"),
      note: el("keepsakes-note"),
      list: el("keepsakes-list"),
    },
  });
  el("keepsakes-open-top").addEventListener("click", () => store.dispatch(Actions.openKeepsakes()));

  createInput({ store, swipeTarget: el("poem-stage"), gestures: Config.gestures });

  // ---- persistence: save only what changed ----
  store.subscribe((state, previous) => {
    if (state.favorites !== previous.favorites) storage.writeJSON(Config.storageKeys.favorites, state.favorites);
    if (state.language !== previous.language) storage.write(Config.storageKeys.language, state.language);
  });
};

startApp();
