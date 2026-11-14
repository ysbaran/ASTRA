/**
 * Dock: the controls under a poem (previous, keep, keepsakes, next).
 * The "poem was kept" celebration is derived from the state change itself,
 * so it happens however a poem gets kept.
 */
const createDock = ({ store, elements, toast }) => {
  elements.prev.addEventListener("click", () => store.dispatch(Actions.step(-1)));
  elements.next.addEventListener("click", () => store.dispatch(Actions.step(1)));
  elements.keep.addEventListener("click", () => store.dispatch(Actions.toggleFavorite(store.getState().poemId)));
  elements.keepsakes.addEventListener("click", () => store.dispatch(Actions.openKeepsakes()));

  const syncKeepButton = (state) => {
    elements.keep.setAttribute("aria-pressed", String(Selectors.isFavorite(state, state.poemId)));
  };

  const celebrate = (state) => {
    toast.show(Selectors.favoriteCount(state) === 1 ? "yay, your first keepsake! it's a star now" : "added to your keepsakes");
    Effects.confetti(elements.keep);
    if (!Dom.reducedMotion()) Dom.restartAnimation(elements.keepsakes, "is-pinging");
  };

  elements.keepsakes.addEventListener("animationend", () => elements.keepsakes.classList.remove("is-pinging"));

  store.subscribe((state, previous) => {
    syncKeepButton(state);
    if (state.favorites.length > previous.favorites.length) celebrate(state);
  });
  syncKeepButton(store.getState());
};
