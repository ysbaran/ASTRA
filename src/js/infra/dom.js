/** Dom: tiny helpers so UI modules stay short and consistent. */
const Dom = (() => {
  const byId = (id) => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing element #${id}`);
    return element;
  };

  /** The nearest ancestor (or self) of an event target that matches the selector. */
  const closest = (target, selector) => (target instanceof Element ? target.closest(selector) : null);

  /** Re-triggers a CSS animation that is driven by a class. */
  const restartAnimation = (element, className) => {
    element.classList.remove(className);
    void element.offsetWidth; // force a reflow so the animation can start again
    element.classList.add(className);
  };

  const setHtml = (element, html) => {
    element.innerHTML = html;
  };

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return Object.freeze({ byId, closest, restartAnimation, setHtml, reducedMotion });
})();
