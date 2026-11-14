/** Actions: the only ways the app state can change. Each is a plain object. */
const Actions = Object.freeze({
  selectPlanet: (planetId) => ({ type: "selectPlanet", planetId }),
  openPoem: (poemId) => ({ type: "openPoem", poemId }),
  goToMap: () => ({ type: "goToMap" }),
  step: (delta) => ({ type: "step", delta }),
  setLanguage: (language) => ({ type: "setLanguage", language }),
  toggleFavorite: (poemId) => ({ type: "toggleFavorite", poemId }),
  removeFavorite: (poemId) => ({ type: "removeFavorite", poemId }),
  openKeepsakes: () => ({ type: "openKeepsakes" }),
  closeKeepsakes: () => ({ type: "closeKeepsakes" }),
});
