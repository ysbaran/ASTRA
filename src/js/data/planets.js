/**
 * Planets: every body in the solar system is a mood that poems can belong to.
 * `sprite` names the pixel-art style (see render/pixel-planet.js).
 * The list order is the order poems are walked through with Prev / Next.
 */
const PLANETS = (() => {
  const planet = (id, name, color, mood, greeting) =>
    Object.freeze({ id, name, sprite: id, color, mood, greeting });

  return Object.freeze([
    planet("sun", "Sun", "#ffd45e", "warm and bright", "Hi hi! I keep the warm and bright ones."),
    planet("mercury", "Mercury", "#e3cdb9", "messages and journeys", "Zoom! I carry messages and little journeys."),
    planet("venus", "Venus", "#ff9fc4", "love", "Hello, sweetie. I keep the love poems."),
    planet("earth", "Earth", "#8fe3c3", "home and kindness", "Welcome home! Kindness lives here."),
    planet("moon", "Moon", "#f6e7a6", "night and comfort", "Shh, it's cozy here. Come rest a while."),
    planet("mars", "Mars", "#ff9b7d", "courage and honesty", "Rawr! Brave and honest words, right here."),
    planet("jupiter", "Jupiter", "#ffc58a", "big thoughts", "Big planet, big thoughts. Sit by me!"),
    planet("saturn", "Saturn", "#c4b8ff", "time and longing", "Take your time. I hold the long, slow ones."),
    planet("uranus", "Uranus", "#9be6ec", "wonder and mystery", "Ooh, it's so strange and wonderful in here!"),
    planet("neptune", "Neptune", "#9bb5ff", "the deep and dreamy", "Blub blub. Dreamy deep poems down here."),
  ]);
})();
