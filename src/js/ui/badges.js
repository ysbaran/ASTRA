/** Badges: keeps every "kept poems" counter in sync with the favourites. */
const createBadges = ({ store, elements }) => {
  const apply = (state) => {
    const count = Selectors.favoriteCount(state);
    elements.forEach((element) => {
      element.hidden = count === 0;
      element.textContent = String(count);
    });
  };

  store.subscribe((state, previous) => {
    if (state.favorites !== previous.favorites) apply(state);
  });
  apply(store.getState());
};
