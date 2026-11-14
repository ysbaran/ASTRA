/**
 * Config: every tunable value lives here, so behaviour can be changed in one place
 * and no other module hard-codes numbers, keys or names.
 */
const Config = Object.freeze({
  /** Shown in the greeting. Change "you" to her name or a nickname. */
  recipientName: "you",

  storageKeys: Object.freeze({
    favorites: "planetPoems.favorites.v1",
    language: "planetPoems.language.v1",
  }),

  languages: Object.freeze(["fa", "both", "en"]),
  defaultLanguage: "both",

  timing: Object.freeze({
    launchMs: 330, // when the screen swaps during the pink bloom
    toastMs: 1900,
    pingMs: 700,
    wordStepMs: 55, // delay between words as a couplet appears
    talkBaseMs: 900, // a planet "reads aloud" for base + perCouplet * couplets
    talkPerCoupletMs: 1300,
    talkMaxMs: 5200,
    talkOnTapMs: 1000,
    talkToggleMs: 230, // how fast the mouth opens and closes
    blinkHoldMs: 165,
    poemBlinkEveryMs: 3600,
    mapBlinkEveryMs: 1500,
  }),

  gestures: Object.freeze({
    swipeMinDistance: 80,
    swipeDominance: 1.6, // horizontal travel must beat vertical by this factor
  }),

  constellation: Object.freeze({
    width: 288,
    minHeight: 200,
    rowHeight: 50,
    columns: 6,
    margin: 16,
    starPixel: 3,
  }),
});
