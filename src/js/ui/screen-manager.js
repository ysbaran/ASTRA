/**
 * ScreenManager: shows the screen named in the state and hides the other.
 * It also moves keyboard focus to the new screen so assistive tech follows along.
 */
const createScreenManager = ({ store, screens, dock }) => {
  const apply = (state, previous) => {
    Object.entries(screens).forEach(([name, element]) => {
      element.hidden = name !== state.screen;
    });
    dock.hidden = state.screen !== "poem";

    if (previous && previous.screen !== state.screen) {
      window.scrollTo(0, 0);
      screens[state.screen].focus({ preventScroll: true });
    }
  };

  store.subscribe(apply);
  apply(store.getState(), null);
};
