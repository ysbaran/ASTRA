/**
 * MapView: draws the solar-system map once, then only updates which planet is selected.
 * Positions come from MAP_LAYOUT (via Orbit), colours from the planets themselves.
 */
const createMapView = ({ root, store, catalog, layout, todayPlanetId, timing, reducedMotion }) => {
  const ORBIT_SECONDS = 34;
  const ORBIT_SECONDS_STEP = 9;
  const NODE_DELAY_START = 0.2;
  const NODE_DELAY_STEP = 0.1;

  const placed = Orbit.placeBodies(layout);
  const nodes = new Map(); // planet id -> { button, actor }

  const orbitColor = (radius) => {
    const body = layout.bodies.find((candidate) => candidate.orbit?.radius === radius);
    return body ? catalog.planet(body.planet).color : "#ff8fb3";
  };

  const orbitsHtml = layout.orbits
    .map((radius, i) => {
      const top = (layout.sun.y / layout.height) * 100;
      return `<div class="orbit" style="left:${layout.sun.x}%;top:${top}%;width:${radius * 2}%;animation-delay:${i * 0.1}s">` +
        `<i class="orbit__runner" style="--runner-color:${orbitColor(radius)};animation-duration:${ORBIT_SECONDS + i * ORBIT_SECONDS_STEP}s;` +
        `animation-direction:${i % 2 ? "reverse" : "normal"}"></i></div>`;
    })
    .join("");

  Dom.setHtml(root, `<div class="orbits">${orbitsHtml}</div>${PixelArt.rocket()}`);

  const buildNode = (body, index) => {
    const planet = catalog.planet(body.planet);
    const poems = catalog.poemsOf(planet.id);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "planet-node";
    button.dataset.label = body.label;
    button.dataset.planetId = planet.id;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${planet.name}: ${planet.mood}, ${poems.length} poems`);
    button.style.cssText = `left:${body.x.toFixed(2)}%;top:${body.top.toFixed(2)}%;--size:${body.size}%;--delay:${(NODE_DELAY_START + index * NODE_DELAY_STEP).toFixed(2)}s`;

    const canvas = document.createElement("canvas");
    canvas.className = "sprite planet-node__sprite";
    button.appendChild(canvas);

    if (planet.id === todayPlanetId) {
      const mark = document.createElement("span");
      mark.className = "planet-node__today";
      mark.setAttribute("aria-hidden", "true");
      button.appendChild(mark);
    }

    const label = document.createElement("span");
    label.className = "planet-node__label";
    label.textContent = planet.name;
    button.appendChild(label);

    const actor = createPlanetActor({ canvas, sprite: planet.sprite, timing, reducedMotion });
    nodes.set(planet.id, { button, actor });
    root.appendChild(button);
  };

  placed.forEach(buildNode);

  root.addEventListener("click", (event) => {
    const button = Dom.closest(event.target, ".planet-node");
    if (!button) return;
    const { actor } = nodes.get(button.dataset.planetId);
    store.dispatch(Actions.selectPlanet(button.dataset.planetId));
    actor.hop();
    actor.talk(timing.talkOnTapMs);
  });

  const showSelection = (state) => {
    nodes.forEach(({ button }, planetId) => button.setAttribute("aria-pressed", String(planetId === state.planetId)));
  };

  store.subscribe((state, previous) => {
    if (state.planetId !== previous.planetId) showSelection(state);
  });
  showSelection(store.getState());

  createBlinkLoop({
    getActors: () => [...nodes.values()].map((node) => node.actor),
    everyMs: timing.mapBlinkEveryMs,
    isActive: () => store.getState().screen === "map",
    reducedMotion,
  });
};
