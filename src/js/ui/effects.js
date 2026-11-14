/** Effects: small one-off visual flourishes. */
const Effects = (() => {
  const CONFETTI_COLORS = Object.freeze(["#ff5c93", "#ff8fb3", "#ffc3a0", "#cdb8ff"]);

  /** A ring of little dots that fly out of `host` and fade. */
  const confetti = (host, count = 10) => {
    if (Dom.reducedMotion()) return;
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement("span");
      const angle = (Math.PI * 2 * i) / count;
      const distance = 38 + Math.random() * 24;
      dot.className = "confetti";
      dot.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      dot.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      dot.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      host.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    }
  };

  return Object.freeze({ confetti });
})();
