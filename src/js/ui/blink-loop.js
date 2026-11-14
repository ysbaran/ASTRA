/** BlinkLoop: every so often, one randomly chosen actor blinks. */
const createBlinkLoop = ({ getActors, everyMs, isActive, reducedMotion }) => {
  if (reducedMotion) return Object.freeze({ stop() {} });

  const timer = setInterval(() => {
    if (!isActive()) return;
    const actors = getActors();
    if (actors.length === 0) return;
    actors[Math.floor(Math.random() * actors.length)].blink();
  }, everyMs);

  return Object.freeze({ stop: () => clearInterval(timer) });
};
