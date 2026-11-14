/**
 * Reducer: a pure function (state, action) -> new state.
 * No DOM, no storage, no timers. That keeps every rule about navigation, language and
 * favourites in one testable place.
 *
 * State shape:
 *   screen          "map" | "poem"
 *   planetId        the planet whose poems are listed on the map screen
 *   poemId          the poem being read (or today's poem before anything is opened)
 *   language        "fa" | "both" | "en"
 *   favorites       poem ids in the order they were kept
 *   keepsakesOpen   whether the keepsakes sheet is showing
 */
const createInitialState = ({ catalog, todayId, favorites, language, languages, defaultLanguage }) => {
  const saved = Array.isArray(favorites) ? favorites : [];
  const kept = [...new Set(saved)].filter((id) => catalog.hasPoem(id));
  return Object.freeze({
    screen: "map",
    planetId: catalog.poem(todayId).planet,
    poemId: todayId,
    language: languages.includes(language) ? language : defaultLanguage,
    favorites: Object.freeze(kept),
    keepsakesOpen: false,
  });
};

const createReducer = ({ catalog, languages }) => (state, action) => {
  switch (action.type) {
    case "selectPlanet":
      return catalog.planet(action.planetId) && action.planetId !== state.planetId
        ? { ...state, planetId: action.planetId }
        : state;

    case "openPoem": {
      if (!catalog.hasPoem(action.poemId)) return state;
      const poem = catalog.poem(action.poemId);
      return { ...state, screen: "poem", poemId: poem.id, planetId: poem.planet, keepsakesOpen: false };
    }

    case "goToMap":
      return { ...state, screen: "map", planetId: catalog.poem(state.poemId).planet, keepsakesOpen: false };

    case "step": {
      const poem = catalog.neighbour(state.poemId, action.delta);
      return { ...state, poemId: poem.id, planetId: poem.planet };
    }

    case "setLanguage":
      return languages.includes(action.language) && action.language !== state.language
        ? { ...state, language: action.language }
        : state;

    case "toggleFavorite": {
      if (!catalog.hasPoem(action.poemId)) return state;
      const has = state.favorites.includes(action.poemId);
      const favorites = has ? state.favorites.filter((id) => id !== action.poemId) : [...state.favorites, action.poemId];
      return { ...state, favorites: Object.freeze(favorites) };
    }

    case "removeFavorite":
      return state.favorites.includes(action.poemId)
        ? { ...state, favorites: Object.freeze(state.favorites.filter((id) => id !== action.poemId)) }
        : state;

    case "openKeepsakes":
      return state.keepsakesOpen ? state : { ...state, keepsakesOpen: true };

    case "closeKeepsakes":
      return state.keepsakesOpen ? { ...state, keepsakesOpen: false } : state;

    default:
      return state;
  }
};
