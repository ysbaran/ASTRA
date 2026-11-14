/**
 * Spotlight: couplets fade in as they scroll into view, and the one nearest the
 * middle of the screen is "in focus" while the others dim.
 */
const createSpotlight = ({ reducedMotion }) => {
  let couplets = [];
  let observer = null;
  let frame = 0;

  const updateFocus = () => {
    const middle = window.innerHeight * 0.45;
    let best = null;
    let bestDistance = Infinity;
    couplets.forEach((element) => {
      if (!element.classList.contains("is-visible")) return;
      const rect = element.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - middle);
      if (distance < bestDistance) {
        best = element;
        bestDistance = distance;
      }
    });
    couplets.forEach((element) => element.classList.toggle("is-focus", element === best));
  };

  const focusOn = (target) => couplets.forEach((element) => element.classList.toggle("is-focus", element === target));

  /** Start watching the couplets inside `container` (call again after each re-render). */
  const watch = (container) => {
    observer?.disconnect();
    couplets = [...container.querySelectorAll(".couplet")];

    if (reducedMotion || !("IntersectionObserver" in window)) {
      couplets.forEach((element) => element.classList.add("is-visible"));
      updateFocus();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
          updateFocus();
        },
        { threshold: 0.2 }
      );
      couplets.forEach((element) => observer.observe(element));
    }

    // Tapping a couplet puts it in focus. The wrapper is new after every render, so no duplicate listeners.
    couplets[0]?.parentElement.addEventListener("click", (event) => {
      const target = Dom.closest(event.target, ".couplet");
      if (target?.classList.contains("is-visible")) focusOn(target);
    });
  };

  window.addEventListener(
    "scroll",
    () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateFocus();
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", updateFocus);

  return Object.freeze({ watch });
};
