/**
 * DestinationView: the panel under the map for the selected planet.
 * The header (planet + speech bubble) redraws only when the planet changes;
 * the list of poems also redraws when favourites change.
 */
const createDestinationView = ({ root, store, catalog, todayPoemId, timing, reducedMotion, onOpenPoem }) => {
  let actor = null;
  let listElement = null;

  const optionHtml = (state, poem) => {
    const poet = catalog.poetOf(poem);
    const kept = Selectors.isFavorite(state, poem.id);
    let tag = "";
    if (poem.id === todayPoemId) tag = '<span class="option__tag">Today</span>';
    else if (kept) tag = '<span class="option__kept" aria-label="kept in your keepsakes">\u2605</span>';

    return `<li><button type="button" class="option" data-poem-id="${Text.escapeHtml(poem.id)}">` +
      '<span class="option__dot" aria-hidden="true"></span>' +
      `<span class="option__text"><span class="option__title">${Text.escapeHtml(poem.title)}</span>` +
      `<span class="option__poet">${Text.escapeHtml(poet.en)}</span>` +
      `<span class="option__verse" lang="fa">${Text.escapeHtml(poem.couplets[0].fa[0])}</span></span>` +
      `${tag}<span class="option__chevron" aria-hidden="true">&rsaquo;</span></button></li>`;
  };

  const renderList = (state) => {
    const poems = catalog.poemsOf(state.planetId);
    Dom.setHtml(listElement, poems.map((poem) => optionHtml(state, poem)).join(""));
  };

  const renderHeader = (state) => {
    const planet = catalog.planet(state.planetId);
    const count = catalog.poemsOf(planet.id).length;

    actor?.dispose();
    root.style.setProperty("--accent", planet.color);
    Dom.setHtml(
      root,
      '<div class="destination__head"><canvas class="sprite destination__sprite" aria-hidden="true"></canvas>' +
        `<div class="destination__bubble">${Text.escapeHtml(planet.greeting)}</div></div>` +
        `<h2 class="destination__name">${Text.escapeHtml(planet.name)}</h2>` +
        `<p class="destination__mood text-muted">${Text.escapeHtml(planet.mood)}, ${count} ${count === 1 ? "poem" : "poems"}</p>` +
        '<ul class="options"></ul>'
    );
    listElement = root.querySelector(".options");
    actor = createPlanetActor({ canvas: root.querySelector(".destination__sprite"), sprite: planet.sprite, timing, reducedMotion });
    actor.talk(timing.talkOnTapMs + 400);
    restartEntrance();
  };

  // replay the panel's entrance animation
  const restartEntrance = () => {
    root.style.animation = "none";
    void root.offsetWidth;
    root.style.animation = "";
  };

  root.addEventListener("click", (event) => {
    const option = Dom.closest(event.target, ".option");
    if (option) onOpenPoem(option.dataset.poemId);
  });

  store.subscribe((state, previous) => {
    if (state.planetId !== previous.planetId) {
      renderHeader(state);
      renderList(state);
    } else if (state.favorites !== previous.favorites) {
      renderList(state);
    }
  });

  renderHeader(store.getState());
  renderList(store.getState());
};
