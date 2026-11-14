/**
 * LaunchEffect: the soft pink bloom that covers the screen while we move to a poem.
 * play() resolves to true at the moment the screen should swap, or to false if a bloom
 * is already playing (so rapid taps cannot stack up).
 */
const createLaunchEffect = ({ element, delayMs, reducedMotion }) => {
  let playing = false;

  element.addEventListener("animationend", () => {
    element.classList.remove("is-playing");
    playing = false;
  });

  const play = () => {
    if (reducedMotion) return Promise.resolve(true);
    if (playing) return Promise.resolve(false);
    playing = true;
    Dom.restartAnimation(element, "is-playing");
    return new Promise((resolve) => setTimeout(() => resolve(true), delayMs));
  };

  return Object.freeze({ play });
};
