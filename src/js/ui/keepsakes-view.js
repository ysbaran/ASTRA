/**
 * KeepsakesView: the bottom sheet that shows kept poems as a constellation and a list.
 * While it is open the rest of the page is made inert, and focus returns to wherever
 * it came from when it closes.
 */
const createKeepsakesView = ({ store, catalog, elements, background, config, onOpenPoem }) => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  let returnFocusTo = null;

  const noteFor = (count) => {
    if (count === 0) return "Nothing here yet. Tap Keep on a poem you love and it will twinkle here as a star.";
    if (count < 3) return "Tap a star to read it again. Keep a few more and they join up into a constellation.";
    return "Your very own constellation. Tap a star to read it again.";
  };

  const renderSky = (poems) => {
    const { width, height, points } = Constellation.layout(poems.map((poem) => poem.id), config);
    const byId = new Map(poems.map((poem) => [poem.id, poem]));
    let svg = "";

    for (let k = 0; k < 30; k += 1) {
      svg += `<rect class="constellation__dust" x="${(k * 53) % width}" y="${(k * 97) % height}" width="2" height="2"/>`;
    }
    for (let k = 1; k < points.length; k += 1) {
      svg += `<line class="constellation__line" x1="${points[k - 1].x.toFixed(1)}" y1="${points[k - 1].y.toFixed(1)}" x2="${points[k].x.toFixed(1)}" y2="${points[k].y.toFixed(1)}"/>`;
    }
    points.forEach((point, n) => {
      const poem = byId.get(point.id);
      const color = catalog.planetOf(poem).color;
      svg += `<g class="constellation__star" data-poem-id="${Text.escapeHtml(poem.id)}"><title>${Text.escapeHtml(poem.title)}</title>` +
        `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="16" fill="transparent"/>` +
        `<g class="constellation__shape" style="animation-delay:-${((n * 0.7) % 2.8).toFixed(1)}s">${PixelArt.starAt(color, point.x, point.y, config.starPixel)}</g></g>`;
    });

    elements.sky.setAttribute("viewBox", `0 0 ${width} ${height}`);
    Dom.setHtml(elements.sky, svg);
  };

  const renderList = (poems) => {
    Dom.setHtml(
      elements.list,
      poems
        .map((poem) => {
          const planet = catalog.planetOf(poem);
          const id = Text.escapeHtml(poem.id);
          return `<li><button type="button" class="keepsake" data-poem-id="${id}">` +
            `<span class="keepsake__icon">${PixelArt.starIcon(planet.color)}</span>` +
            `<span class="keepsake__text"><span class="keepsake__title">${Text.escapeHtml(poem.title)}</span>` +
            `<span class="keepsake__meta">${Text.escapeHtml(planet.name)}, ${Text.escapeHtml(catalog.poetOf(poem).en)}</span></span></button>` +
            `<button type="button" class="keepsake-remove" data-poem-id="${id}" aria-label="Remove ${Text.escapeHtml(poem.title)} from your keepsakes">&times;</button></li>`;
        })
        .join("")
    );
  };

  const render = (state) => {
    const poems = state.favorites.map((id) => catalog.poem(id));
    renderSky(poems);
    elements.note.textContent = noteFor(poems.length);
    renderList(poems);
  };

  const open = (state) => {
    returnFocusTo = document.activeElement;
    render(state);
    elements.root.hidden = false;
    background.forEach((element) => { element.inert = true; });
    document.body.style.overflow = "hidden";
    elements.closeButton.focus();
  };

  const close = () => {
    elements.root.hidden = true;
    background.forEach((element) => { element.inert = false; });
    document.body.style.overflow = "";
    returnFocusTo?.focus?.({ preventScroll: true });
    returnFocusTo = null;
  };

  elements.closeButton.addEventListener("click", () => store.dispatch(Actions.closeKeepsakes()));
  elements.root.addEventListener("click", (event) => {
    if (event.target === elements.root) store.dispatch(Actions.closeKeepsakes());
  });

  const handleChoice = (event) => {
    const remove = Dom.closest(event.target, ".keepsake-remove");
    if (remove) {
      store.dispatch(Actions.removeFavorite(remove.dataset.poemId));
      return;
    }
    const choice = Dom.closest(event.target, "[data-poem-id]");
    if (choice) onOpenPoem(choice.dataset.poemId);
  };
  elements.sky.addEventListener("click", handleChoice);
  elements.list.addEventListener("click", handleChoice);

  store.subscribe((state, previous) => {
    if (state.keepsakesOpen && !previous.keepsakesOpen) open(state);
    else if (!state.keepsakesOpen && previous.keepsakesOpen) close();
    else if (state.keepsakesOpen && state.favorites !== previous.favorites) render(state);
  });
};
