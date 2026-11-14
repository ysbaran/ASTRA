/**
 * PoemView: shows the current poem and its planet. It re-renders when a poem is opened
 * or stepped to, and applies the chosen language.
 */
const createPoemView = ({ store, catalog, elements, actor, spotlight, timing, reducedMotion }) => {
  const render = (state) => {
    const poem = catalog.poem(state.poemId);
    const planet = catalog.planetOf(poem);
    const poet = catalog.poetOf(poem);
    const poems = catalog.poemsOf(planet.id);

    Dom.setHtml(elements.stage, PoemTemplate.card({ poem, planet, poet, position: poems.indexOf(poem) + 1, total: poems.length }));
    elements.planetName.textContent = planet.name;
    elements.planetMood.textContent = planet.mood;

    actor.setSprite(planet.sprite);
    actor.hop();
    actor.talk(Math.min(timing.talkMaxMs, timing.talkBaseMs + poem.couplets.length * timing.talkPerCoupletMs));
    spotlight.watch(elements.stage);
    window.scrollTo(0, 0);
  };

  store.subscribe((state, previous) => {
    elements.stage.dataset.language = state.language;
    const arrived = state.screen === "poem" && previous.screen !== "poem";
    if (state.screen === "poem" && (arrived || state.poemId !== previous.poemId)) render(state);
  });

  elements.stage.dataset.language = store.getState().language;
  createBlinkLoop({
    getActors: () => [actor],
    everyMs: timing.poemBlinkEveryMs,
    isActive: () => store.getState().screen === "poem",
    reducedMotion,
  });
};
