/**
 * PlanetActor: gives one planet canvas a personality.
 * It owns the timers for talking and blinking, so no other module has to.
 */
const createPlanetActor = ({ canvas, sprite, timing, reducedMotion }) => {
  let current = sprite;
  let talkTimer = null;
  let blinkTimer = null;

  const paint = (options) => PixelPlanet.draw(canvas, current, options);

  const stopTalking = () => {
    if (talkTimer === null) return;
    clearInterval(talkTimer);
    talkTimer = null;
    paint();
  };

  /** Open and close the mouth for a while, as if reading aloud. */
  const talk = (durationMs) => {
    stopTalking();
    if (reducedMotion) return;
    const startedAt = Date.now();
    let open = false;
    talkTimer = setInterval(() => {
      if (Date.now() - startedAt > durationMs) {
        stopTalking();
        return;
      }
      open = !open;
      paint({ talk: open });
    }, timing.talkToggleMs);
  };

  /** A quick blink, skipped while talking. */
  const blink = () => {
    if (reducedMotion || talkTimer !== null) return;
    paint({ blink: true });
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => paint(), timing.blinkHoldMs);
  };

  const hop = () => {
    if (!reducedMotion) Dom.restartAnimation(canvas, "is-hopping");
  };

  const setSprite = (next) => {
    current = next;
    stopTalking();
    paint();
  };

  const dispose = () => {
    clearInterval(talkTimer);
    clearTimeout(blinkTimer);
    talkTimer = null;
  };

  canvas.addEventListener("animationend", (event) => {
    if (event.animationName === "hop") canvas.classList.remove("is-hopping");
  });
  paint();

  return Object.freeze({ talk, blink, hop, setSprite, dispose });
};
