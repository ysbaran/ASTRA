/**
 * Store: holds the current state and tells subscribers when it changes.
 * Subscribers receive (nextState, previousState) so they can react only to what changed.
 */
const createStore = (reducer, initialState) => {
  let state = initialState;
  const listeners = new Set();

  return Object.freeze({
    getState: () => state,
    dispatch(action) {
      const previous = state;
      const next = reducer(previous, action);
      if (next === previous) return;
      state = next;
      listeners.forEach((listener) => listener(next, previous));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
};
