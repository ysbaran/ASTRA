/** Input: keyboard shortcuts and swipe gestures. They only dispatch actions. */
const createInput = ({ store, swipeTarget, gestures }) => {
  document.addEventListener("keydown", (event) => {
    const state = store.getState();
    if (event.key === "Escape" && state.keepsakesOpen) {
      store.dispatch(Actions.closeKeepsakes());
      return;
    }
    if (state.keepsakesOpen || state.screen !== "poem") return;
    if (event.key === "ArrowRight") store.dispatch(Actions.step(1));
    if (event.key === "ArrowLeft") store.dispatch(Actions.step(-1));
  });

  let start = null;
  swipeTarget.addEventListener("touchstart", (event) => {
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });

  swipeTarget.addEventListener("touchend", (event) => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    const mostlyHorizontal = Math.abs(dx) >= gestures.swipeMinDistance && Math.abs(dx) >= Math.abs(dy) * gestures.swipeDominance;
    if (mostlyHorizontal) store.dispatch(Actions.step(dx < 0 ? 1 : -1));
  }, { passive: true });
};
