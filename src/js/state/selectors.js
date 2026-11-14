/** Selectors: small read-only questions about the state. */
const Selectors = Object.freeze({
  isFavorite: (state, poemId) => state.favorites.includes(poemId),
  favoriteCount: (state) => state.favorites.length,
});
