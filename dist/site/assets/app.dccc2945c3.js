(() => {
"use strict";

// ---- js/config.js ----
/**
 * Config: every tunable value lives here, so behaviour can be changed in one place
 * and no other module hard-codes numbers, keys or names.
 */
const Config = Object.freeze({
  /** Shown in the greeting. Change "you" to her name or a nickname. */
  recipientName: "Hadisa",

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


// ---- js/data/poets.js ----
/** Poets: who wrote the verses. Pure data. */
const POETS = (() => {
  const poet = (id, en, fa) => Object.freeze({ id, en, fa });
  return Object.freeze({
    hafez: poet("hafez", "Hafez", "حافظ"),
    rumi: poet("rumi", "Rumi", "مولانا"),
    saadi: poet("saadi", "Saadi", "سعدی"),
    khayyam: poet("khayyam", "Omar Khayyam", "خیام"),
    ferdowsi: poet("ferdowsi", "Ferdowsi", "فردوسی"),
    baba: poet("baba", "Baba Tahir", "باباطاهر"),
  });
})();


// ---- js/data/planets.js ----
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


// ---- js/data/map-layout.js ----
/**
 * Where each body sits on the star map.
 *
 * Units: x and radius are percent of the map's width; y is in the same "width units"
 * (the map is `height` units tall). Angles are degrees, 0 = right, positive = down.
 * A body is placed one of three ways: `at` (fixed), `orbit` (around the Sun), or
 * `satelliteOf` (offset from another body, like the Moon from Earth).
 */
const MAP_LAYOUT = (() => {
  const sun = Object.freeze({ x: 4, y: 55 });
  const orbit = (radius, angle) => Object.freeze({ radius, angle });
  const body = (planet, placement, size, label) => Object.freeze({ planet, size, label, ...placement });

  return Object.freeze({
    height: 108,
    sun,
    orbits: Object.freeze([22, 31, 40, 49, 59, 70, 81, 91]),
    bodies: Object.freeze([
      body("sun", { at: sun }, 22, "right"),
      body("mercury", { orbit: orbit(22, -50) }, 9, "top"),
      body("venus", { orbit: orbit(31, 48) }, 11, "bottom"),
      body("earth", { orbit: orbit(40, -38) }, 11, "top"),
      body("moon", { satelliteOf: "earth", offset: Object.freeze({ x: 9, y: -12.5 }) }, 8, "right"),
      body("mars", { orbit: orbit(49, 36) }, 10, "bottom"),
      body("jupiter", { orbit: orbit(59, -27) }, 17, "top"),
      body("saturn", { orbit: orbit(70, 26) }, 17, "bottom"),
      body("uranus", { orbit: orbit(81, -20) }, 12, "top"),
      body("neptune", { orbit: orbit(91, 19) }, 12, "bottom"),
    ]),
  });
})();


// ---- js/data/poems.js ----
/**
 * Poems: pure data, no logic. To add a poem, add one entry below (or in a new file
 * that is listed in manifest.js) and run the tests: they check ids, planets, poets
 * and that every couplet has two Persian and two English lines.
 *
 * Persian verses are classical (public domain). English renderings are original.
 * Each couplet is couplet(persian1, persian2, english1, english2).
 */
const POEMS = (() => {
  const couplet = (fa1, fa2, en1, en2) =>
    Object.freeze({ fa: Object.freeze([fa1, fa2]), en: Object.freeze([en1, en2]) });

  const poem = (id, planet, poet, title, couplets, note = null) =>
    Object.freeze({ id, planet, poet, title, note, couplets: Object.freeze(couplets) });

  return Object.freeze([

    // ---- sun ----
    poem("saadi-green-leaves", "sun", "saadi", "Green Leaves", [
      couplet("برگ درختان سبز در نظر هوشیار", "هر ورقی دفتری است معرفت کردگار", "To a watchful eye, the green leaves of the trees:", "each page is a book that tells of the Maker."),
    ]),
    poem("hafez-blessed-shiraz", "sun", "hafez", "Blessed Shiraz", [
      couplet("خوشا شیراز و وضع بی‌مثالش", "خداوندا نگهدار از زوالش", "How lovely is Shiraz, so beyond compare;", "Lord, keep her safe from fading away."),
      couplet("ز رکن‌آباد ما صد لوحش‌الله", "که عمر خضر می‌بخشد زلالش", "A hundred blessings on our Roknabad,", "whose clear water gives the long life of Khidr."),
    ]),
    poem("hafez-lets-scatter-roses", "sun", "hafez", "Let's Scatter Roses", [
      couplet("بیا تا گل برافشانیم و می در ساغر اندازیم", "فلک را سقف بشکافیم و طرحی نو دراندازیم", "Come, let's scatter roses and pour wine into the cup,", "let's split the roof of heaven and sketch a brand-new plan."),
      couplet("اگر غم لشکر انگیزد که خون عاشقان ریزد", "من و ساقی به هم تازیم و بنیادش براندازیم", "If sorrow raises an army to spill the blood of lovers,", "the cupbearer and I will charge together and uproot its foundations."),
    ]),
    poem("hafez-water-of-life-at-dawn", "sun", "hafez", "Water of Life at Dawn", [
      couplet("دوش وقت سحر از غصه نجاتم دادند", "وندر آن ظلمت شب آب حیاتم دادند", "Last night at dawn they set me free from sorrow,", "and in the darkness of that night they gave me the water of life."),
      couplet("بی‌خود از شعشعه پرتو ذاتم کردند", "باده از جام تجلی صفاتم دادند", "They swept me out of myself in the blaze of the Essence's light,", "and poured me wine from the cup of radiant being."),
    ]),
    poem("hafez-good-news-heart", "sun", "hafez", "Good News, Heart", [
      couplet("مژده ای دل که مسیحا نفسی می‌آید", "که ز انفاس خوشش بوی کسی می‌آید", "Good news, heart: someone with a healing breath is coming,", "for on that sweet breath drifts the scent of someone dear."),
    ]),

    // ---- mercury ----
    poem("hafez-message-to-the-gazelle", "mercury", "hafez", "Message to the Gazelle", [
      couplet("صبا به لطف بگو آن غزال رعنا را", "که سر به کوه و بیابان تو داده‌ای ما را", "Gently, morning breeze, tell that graceful gazelle:", "you have sent me wandering off to the mountains and the wild plains."),
      couplet("شکر فروش که عمرش دراز باد چرا", "تفقدی نکند طوطی شکرخارا", "Sugar-seller, long may you live, why not spare a glance", "for the parrot who lives on sweetness?"),
    ]),
    poem("saadi-slow-down-camel-driver", "mercury", "saadi", "Slow Down, Camel Driver", [
      couplet("ای ساربان آهسته ران کآرام جانم می‌رود", "وان دل که با خود داشتم با دلستانم می‌رود", "Driver, go slowly, the peace of my soul is leaving,", "and the heart I kept with me goes along with my beloved."),
      couplet("محمل بدار ای ساربان تندی مکن با کاروان", "کز عشق آن سرو روان گویی که جانم می‌رود", "Halt the litter, driver, don't hurry the caravan,", "for love of that swaying cypress, it feels my life is going."),
    ]),
    poem("rumi-calls-from-left-and-right", "mercury", "rumi", "Calls from Left and Right", [
      couplet("هر نفس آواز عشق می‌رسد از چپ و راست", "ما به فلک می‌رویم عزم تماشا که راست", "Every moment the call of love arrives from left and right;", "we are off to the heavens, who wants to come and see?"),
      couplet("ما به فلک بوده‌ایم یار ملک بوده‌ایم", "باز همان جا رویم جمله که آن شهر ماست", "We have been in the heavens, companions of the angels;", "we will go back to that very place, for that is our city."),
    ]),

    // ---- venus ----
    poem("hafez-samarkand-for-a-mole", "venus", "hafez", "Samarkand for a Mole", [
      couplet("اگر آن ترک شیرازی به دست آرد دل ما را", "به خال هندویش بخشم سمرقند و بخارا را", "If that beauty of Shiraz would take my heart in her hand,", "for the dark mole on her cheek I'd give Samarkand and Bukhara."),
      couplet("بده ساقی می باقی که در جنت نخواهی یافت", "کنار آب رکن‌آباد و گلگشت مصلا را", "Pour, cupbearer, the lasting wine; in paradise you won't find", "the banks of Roknabad or the rose-walks of Mosalla."),
    ]),
    poem("hafez-zulaykhas-veil", "venus", "hafez", "Zulaykha's Veil", [
      couplet("من از آن حسن روزافزون که یوسف داشت دانستم", "که عشق از پرده عصمت برون آرد زلیخا را", "From the ever-growing beauty that Joseph had, I understood", "that love can draw Zulaykha out from behind her veil of modesty."),
    ]),
    poem("rumi-love-makes-sweet", "venus", "rumi", "Love Makes Sweet", [
      couplet("از محبت تلخ‌ها شیرین شود", "از محبت مس‌ها زرین شود", "Through love, bitter things turn sweet;", "through love, copper turns to gold."),
      couplet("از محبت دردها صافی شود", "از محبت دردها شافی شود", "Through love, dregs become clear wine;", "through love, pains become healing."),
    ]),
    poem("hafez-the-nightingale-and-the-rose", "venus", "hafez", "The Nightingale and the Rose", [
      couplet("صبحدم مرغ چمن با گل نوخاسته گفت", "ناز کم کن که در این باغ بسی چون تو شکفت", "At dawn the bird of the garden said to the newly opened rose:", "\"Be a little less proud; many like you have bloomed in this garden.\""),
      couplet("گل بخندید که از راست نرنجیم ولی", "هیچ عاشق سخن سخت به معشوق نگفت", "The rose laughed: \"We don't mind the truth, but", "no lover ever spoke harshly to the beloved.\""),
    ]),
    poem("hafez-something-more-than-beauty", "venus", "hafez", "Something More Than Beauty", [
      couplet("شاهد آن نیست که موئی و میانی دارد", "بنده طلعت آن باش که آنی دارد", "Beauty isn't only a head of hair and a slender waist;", "be the servant of the face that has that certain something."),
    ]),

    // ---- earth ----
    poem("saadi-limbs-of-one-body", "earth", "saadi", "Limbs of One Body", [
      couplet("بنی‌آدم اعضای یک پیکرند", "که در آفرینش ز یک گوهرند", "The children of Adam are limbs of one body,", "made in creation from a single jewel."),
      couplet("چو عضوی به درد آورد روزگار", "دگر عضوها را نماند قرار", "When time brings one limb to pain,", "the other limbs cannot rest."),
      couplet("تو کز محنت دیگران بی‌غمی", "نشاید که نامت نهند آدمی", "If you feel no grief at the suffering of others,", "you don't deserve the name of human."),
    ]),
    poem("saadi-the-scented-clay", "earth", "saadi", "The Scented Clay", [
      couplet("گلی خوشبوی در حمام روزی", "رسید از دست محبوبی به دستم", "One day in the bathhouse, a sweet-scented clay", "passed from a loved one's hand to mine."),
      couplet("بدو گفتم که مشکی یا عبیری", "که از بوی دلاویز تو مستم", "I asked it, \"Are you musk or ambergris?", "Your lovely scent has made me drunk.\""),
      couplet("بگفتا من گلی ناچیز بودم", "ولیکن مدتی با گل نشستم", "It said, \"I was only a humble bit of clay,", "but for a while I sat beside the rose.\""),
      couplet("کمال همنشین در من اثر کرد", "وگرنه من همان خاکم که هستم", "My companion's perfection rubbed off on me;", "otherwise I am the same old earth I always was."),
    ]),
    poem("rumi-come-to-unite", "earth", "rumi", "Come to Unite", [
      couplet("تو برای وصل کردن آمدی", "نی برای فصل کردن آمدی", "You came to bring people together,", "not to tear them apart."),
    ]),
    poem("hafez-kindness-to-friends", "earth", "hafez", "Kindness to Friends", [
      couplet("آسایش دو گیتی تفسیر این دو حرف است", "با دوستان مروت با دشمنان مدارا", "The peace of both worlds is explained by two small phrases:", "kindness to friends, and patience with enemies."),
    ]),
    poem("hafez-plant-the-tree-of-friendship", "earth", "hafez", "Plant the Tree of Friendship", [
      couplet("درخت دوستی بنشان که کام دل به بار آرد", "نهال دشمنی بر کن که رنج بی‌شمار آرد", "Plant the tree of friendship, for it bears the heart's desire;", "pull up the sapling of enmity, for it bears endless pain."),
    ]),
    poem("saadi-a-friend-in-need", "earth", "saadi", "A Friend in Need", [
      couplet("دوست آن باشد که گیرد دست دوست", "در پریشان‌حالی و درماندگی", "A friend is the one who takes a friend's hand", "in distress and in helplessness."),
    ]),

    // ---- moon ----
    poem("khayyam-moonlight-wine", "moon", "khayyam", "Moonlight Wine", [
      couplet("چون عهده نمی‌شود کسی فردا را", "حالی خوش کن تو این دل شیدا را", "Since no one can answer for tomorrow,", "make this besotted heart glad right now."),
      couplet("می نوش به ماهتاب ای ماه که ماه", "بسیار بتابد و نیابد ما را", "Drink in the moonlight, my moon, for the moon", "will shine on long and never find us here."),
    ], "a quatrain attributed to Khayyam"),
    poem("hafez-do-not-grieve", "moon", "hafez", "Do Not Grieve", [
      couplet("یوسف گمگشته بازآید به کنعان غم مخور", "کلبه احزان شود روزی گلستان غم مخور", "Lost Joseph will come back to Canaan; do not grieve.", "The house of sorrow will be a rose garden one day; do not grieve."),
      couplet("ای دل غمدیده حالت به شود دل بد مکن", "وین سر شوریده باز آید به سامان غم مخور", "O sad heart, you will mend; do not lose hope.", "This restless head will come back to its senses; do not grieve."),
    ]),
    poem("khayyam-dont-grieve-for-tomorrow", "moon", "khayyam", "Don't Grieve for Tomorrow", [
      couplet("ای دوست بیا تا غم فردا نخوریم", "وین یک دم عمر را غنیمت شمریم", "Come, friend, let's not grieve for tomorrow;", "let's treasure this one breath of life."),
      couplet("فردا که از این دیر کهن درگذریم", "با هفت هزار سالگان سر به سریم", "Tomorrow, when we leave this ancient inn,", "we'll stand level with the seven-thousand-year-olds."),
    ], "a quatrain attributed to Khayyam"),
    poem("khayyam-a-place-to-rest", "moon", "khayyam", "A Place to Rest", [
      couplet("ای کاش که جای آرمیدن بودی", "یا این ره دور را رسیدن بودی", "If only there were a place to rest,", "or some end to reach on this long road."),
      couplet("کاش از پی صد هزار سال از دل خاک", "چون سبزه امید بر دمیدن بودی", "If only, after a hundred thousand years, out of the heart of the earth,", "we could rise again like the green shoots of hope."),
    ], "a quatrain attributed to Khayyam"),
    poem("khayyam-the-letter-of-youth", "moon", "khayyam", "The Letter of Youth", [
      couplet("افسوس که نامه جوانی طی شد", "وان تازه بهار زندگانی دی شد", "Alas, the book of youth has been folded away,", "and that fresh spring of life has turned to winter."),
      couplet("حالی که ورا نام جوانی گفتند", "معلوم نشد که او کی آمد کی شد", "That thing they called youth:", "I never knew when it came or when it went."),
    ], "a quatrain attributed to Khayyam"),

    // ---- mars ----
    poem("khayyam-every-knot-but-one", "mars", "khayyam", "Every Knot but One", [
      couplet("از جرم گل سیاه تا اوج زحل", "کردم همه مشکلات گیتی را حل", "From the black clay of earth to the heights of Saturn,", "I solved every riddle of the world."),
      couplet("بیرون جستم ز قید هر مکر و حیل", "هر بند گشاده شد مگر بند اجل", "I slipped free of every trick and snare;", "every knot came undone except the knot of death."),
    ], "a quatrain attributed to Khayyam"),
    poem("saadi-others-faults", "mars", "saadi", "Others' Faults", [
      couplet("هر که عیب دگران پیش تو آورد و شمرد", "بی‌گمان عیب تو پیش دگران خواهد برد", "Whoever lists the faults of others before you", "will surely carry your faults to others."),
    ]),
    poem("hafez-a-fire-in-the-house", "mars", "hafez", "A Fire in the House", [
      couplet("سینه از آتش دل در غم جانانه بسوخت", "آتشی بود در این خانه که کاشانه بسوخت", "My chest burned from the heart's fire, grieving for the beloved;", "there was a fire in this house that burned the whole home down."),
    ]),
    poem("saadi-the-servants-excuse", "mars", "saadi", "The Servant's Excuse", [
      couplet("بنده همان به که ز تقصیر خویش", "عذر به درگاه خدای آورد", "The best servant is the one who, for their shortcomings,", "brings an apology to the court of God."),
      couplet("ورنه سزاوار خداوندیش", "کس نتواند که به جای آورد", "Otherwise no one is able to give", "the thanks that His lordship deserves."),
    ]),
    poem("ferdowsi-thirty-years-of-work", "mars", "ferdowsi", "Thirty Years of Work", [
      couplet("بسی رنج بردم در این سال سی", "عجم زنده کردم بدین پارسی", "I labored long through these thirty years;", "with this Persian tongue I brought the Persians back to life."),
    ]),

    // ---- jupiter ----
    poem("rumi-you-are-your-thought", "jupiter", "rumi", "You Are Your Thought", [
      couplet("ای برادر تو همه اندیشه‌ای", "مابقی خود استخوان و ریشه‌ای", "Brother, you are all thought;", "the rest of you is bone and root."),
      couplet("گر گل است اندیشه‌ات گلشنی", "ور بود خار تو هیزم گلخنی", "If your thought is a rose, you are a rose garden;", "if it is a thorn, you are fuel for the furnace."),
    ]),
    poem("ferdowsi-to-know-is-to-be-strong", "jupiter", "ferdowsi", "To Know Is to Be Strong", [
      couplet("توانا بود هر که دانا بود", "ز دانش دل پیر برنا بود", "Whoever knows is strong,", "and through knowledge an old heart turns young."),
    ]),
    poem("hafez-fall-in-love", "jupiter", "hafez", "Fall in Love", [
      couplet("عاشق شو ار نه روزی کار جهان سر آید", "ناخوانده نقش مقصود از کارگاه هستی", "Fall in love, or one day the world's business will come to an end,", "and you will leave the workshop of being without reading the pattern of its purpose."),
    ]),
    poem("saadi-cloud-wind-moon-and-sun", "jupiter", "saadi", "Cloud, Wind, Moon and Sun", [
      couplet("ابر و باد و مه و خورشید و فلک در کارند", "تا تو نانی به کف آری و به غفلت نخوری", "Cloud and wind, moon and sun and sky are all at work", "so that you may earn your bread and not eat it heedlessly."),
      couplet("همه از بهر تو سرگشته و فرمان‌بردار", "شرط انصاف نباشد که تو فرمان نبری", "All of them wander and obey for your sake;", "it would not be fair if you alone refused to obey."),
    ]),
    poem("ferdowsi-a-palace-of-verse", "jupiter", "ferdowsi", "A Palace of Verse", [
      couplet("بناهای آباد گردد خراب", "ز باران و از تابش آفتاب", "Thriving buildings will fall into ruin", "from the rain and the heat of the sun,"),
      couplet("پی افکندم از نظم کاخی بلند", "که از باد و باران نیابد گزند", "but I have laid the foundation of a lofty palace of verse", "that wind and rain can never harm."),
    ]),
    poem("ferdowsi-i-shall-not-die", "jupiter", "ferdowsi", "I Shall Not Die", [
      couplet("نمیرم از این پس که من زنده‌ام", "که تخم سخن را پراکنده‌ام", "I will not die from now on, for I am alive,", "since I have scattered the seeds of speech."),
    ]),

    // ---- saturn ----
    poem("rumi-listen-to-the-reed", "saturn", "rumi", "Listen to the Reed", [
      couplet("بشنو از نی چون حکایت می‌کند", "از جدایی‌ها شکایت می‌کند", "Listen to the reed and the tale it tells,", "how it complains of separation:"),
      couplet("کز نیستان تا مرا ببریده‌اند", "در نفیرم مرد و زن نالیده‌اند", "\"Since I was cut from the reed-bed,", "men and women have wept at my cry.\""),
      couplet("سینه خواهم شرحه شرحه از فراق", "تا بگویم شرح درد اشتیاق", "I want a heart torn open by parting,", "so I can tell the story of longing."),
    ]),
    poem("khayyam-the-jug-was-a-lover", "saturn", "khayyam", "The Jug Was a Lover", [
      couplet("این کوزه چو من عاشق زاری بوده است", "در بند سر زلف نگاری بوده است", "This jug, like me, was once a weeping lover,", "caught in the curl of some beloved's hair."),
      couplet("این دسته که بر گردن او می‌بینی", "دستی است که بر گردن یاری بوده است", "This handle you see at its neck", "was an arm that once held a sweetheart close."),
    ], "a quatrain attributed to Khayyam"),
    poem("hafez-my-heart-is-slipping-away", "saturn", "hafez", "My Heart Is Slipping Away", [
      couplet("دل می‌رود ز دستم صاحبدلان خدا را", "دردا که راز پنهان خواهد شد آشکارا", "My heart is slipping from my hands; people of heart, for God's sake,", "alas, the hidden secret will be laid bare."),
    ]),
    poem("hafez-remember-those-days", "saturn", "hafez", "Remember Those Days", [
      couplet("روز وصل دوستداران یاد باد", "یاد باد آن روزگاران یاد باد", "Remember the day when friends were reunited;", "remember, oh, remember those days."),
      couplet("کامم از تلخی غم چون زهر گشت", "بانگ نوش شادخواران یاد باد", "My mouth has turned bitter as poison with grief;", "remember the cheers of the merry drinkers."),
    ]),
    poem("khayyam-the-circle-of-coming-and-going", "saturn", "khayyam", "The Circle of Coming and Going", [
      couplet("در دایره‌ای که آمدن و رفتن ماست", "آن را نه بدایت نه نهایت پیداست", "In this circle of our coming and going,", "no beginning and no end can be seen."),
      couplet("کس می‌نزند دمی در این معنی راست", "کاین آمدن از کجا و رفتن به کجاست", "No one speaks one true word on this matter:", "where did this coming come from, and where is the going to?"),
    ], "a quatrain attributed to Khayyam"),
    poem("saadi-snow-in-the-summer-sun", "saturn", "saadi", "Snow in the Summer Sun", [
      couplet("عمر برف است و آفتاب تموز", "اندکی ماند و خواجه غره هنوز", "Life is snow, and the summer sun is high;", "little is left, and the master is still carefree."),
    ]),

    // ---- uranus ----
    poem("hafez-at-the-tavern-door", "uranus", "hafez", "At the Tavern Door", [
      couplet("دوش دیدم که ملایک در میخانه زدند", "گل آدم بسرشتند و به پیمانه زدند", "Last night I saw the angels knocking at the tavern door,", "they kneaded the clay of Adam and shaped it into a cup."),
      couplet("آسمان بار امانت نتوانست کشید", "قرعه کار به نام من دیوانه زدند", "The heavens could not bear the burden of trust,", "so they cast the lot in the name of me, the madman."),
    ]),
    poem("rumi-each-by-their-own-guess", "uranus", "rumi", "Each by Their Own Guess", [
      couplet("هر کسی از ظن خود شد یار من", "وز درون من نجست اسرار من", "Everyone became my friend by their own guess;", "none looked within me for my secrets."),
      couplet("سر من از ناله من دور نیست", "لیک چشم و گوش را آن نور نیست", "My secret is not far from my lament,", "but eyes and ears lack the light to see it."),
    ]),
    poem("hafez-before-time-began", "uranus", "hafez", "Before Time Began", [
      couplet("در ازل پرتو حسنت ز تجلی دم زد", "عشق پیدا شد و آتش به همه عالم زد", "In eternity, the ray of your beauty breathed out its glory;", "love appeared and set fire to the whole world."),
      couplet("جلوه‌ای کرد رخت دید ملک عشق نداشت", "عین آتش شد از این غیرت و بر آدم زد", "Your face shone out; the angel, who had no love, saw it,", "and flared up like fire at this, and fell upon Adam."),
    ]),
    poem("hafez-i-was-an-angel", "uranus", "hafez", "I Was an Angel", [
      couplet("من ملک بودم و فردوس برین جایم بود", "آدم آورد در این دیر خراب‌آبادم", "I was an angel and high paradise was my home;", "Adam brought me down to this ruined inn."),
      couplet("سایه طوبی و دلجویی حور و لب حوض", "به هوای سر کوی تو برفت از یادم", "The shade of the Tuba tree, the comfort of the houris, the pool's edge:", "all slipped from my mind in longing for your street."),
    ]),
    poem("rumi-we-are-from-above", "uranus", "rumi", "We Are From Above", [
      couplet("ما ز بالاییم و بالا می‌رویم", "ما ز دریاییم و دریا می‌رویم", "We are from above, and we go above;", "we are from the sea, and we go to the sea."),
      couplet("ما از آنجا و از اینجا نیستیم", "ما ز بی‌جاییم و بی‌جا می‌رویم", "We are not from there, and not from here;", "we are from placelessness, and to placelessness we go."),
    ]),

    // ---- neptune ----
    poem("hafez-the-cup-of-jamshid", "neptune", "hafez", "The Cup of Jamshid", [
      couplet("سال‌ها دل طلب جام جم از ما می‌کرد", "وان چه خود داشت ز بیگانه تمنا می‌کرد", "For years my heart kept asking me for Jamshid's cup,", "begging a stranger for what it held all along."),
      couplet("گوهری کز صدف کون و مکان بیرون است", "طلب از گمشدگان لب دریا می‌کرد", "A pearl that lies beyond the shell of time and space,", "it sought from those who were lost along the shore."),
    ]),
    poem("baba-i-see-only-you", "neptune", "baba", "I See Only You", [
      couplet("به صحرا بنگرم صحرا ته وینم", "به دریا بنگرم دریا ته وینم", "When I look at the plains, I see only you;", "when I look at the sea, I see only you."),
      couplet("به هر جا بنگرم کوه و در و دشت", "نشان از قامت رعنا ته وینم", "Wherever I look, mountain, door or field,", "I see the trace of your graceful form."),
    ], "in the Hamadani dialect"),
    poem("hafez-a-visitor-at-midnight", "neptune", "hafez", "A Visitor at Midnight", [
      couplet("زلف آشفته و خوی کرده و خندان لب و مست", "پیرهن چاک و غزل‌خوان و صراحی در دست", "Hair tousled, brow damp, lips smiling, a little tipsy,", "collar open, singing a ghazal, a flask in hand,"),
      couplet("نرگسش عربده‌جوی و لبش افسوس‌کنان", "نیم‌شب دوش به بالین من آمد بنشست", "eyes quarrelsome, lips teasing,", "at midnight last night my beloved came and sat by my pillow."),
    ]),
    poem("khayyam-rain-on-the-grass", "neptune", "khayyam", "Rain on the Grass", [
      couplet("ابر آمد و زار بر سر سبزه گریست", "بی‌باده گلرنگ نمی‌باید زیست", "The cloud came and wept bitterly over the grass;", "one shouldn't live without a cup of rose-colored wine."),
      couplet("این سبزه که امروز تماشاگه ماست", "تا سبزه خاک ما تماشاگه کیست", "This grass that is our delight today:", "whose delight will the grass be that grows from our dust?"),
    ], "a quatrain attributed to Khayyam"),
  ]);
})();


// ---- js/domain/text.js ----
/** Text: small pure helpers for strings. */
const Text = (() => {
  const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  /** Escape text before putting it into an HTML template string. */
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

  const splitWords = (line) => line.split(" ").filter(Boolean);

  /** True if the string contains Arabic-script letters (Persian uses that script). */
  const hasPersianScript = (value) => /[\u0600-\u06FF]/.test(value);

  /** Stable 32-bit hash (FNV-1a), used for deterministic "random" jitter. */
  const hashString = (value) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  return Object.freeze({ escapeHtml, splitWords, hasPersianScript, hashString });
})();


// ---- js/domain/greeting.js ----
/** Greeting: pure function of the time of day. */
const Greeting = (() => {
  const partOfDay = (hour) => {
    if (hour < 5) return "up late";
    if (hour < 12) return "good morning";
    if (hour < 18) return "good afternoon";
    return "good evening";
  };

  const forDate = (date, name) => `${partOfDay(date.getHours())}, ${name}`;

  return Object.freeze({ partOfDay, forDate });
})();


// ---- js/domain/catalog.js ----
/**
 * Catalog: a read-only index over poems, planets and poets.
 * It validates its input up front, so a data mistake fails loudly at start-up
 * (and in the tests) instead of showing up as a blank screen later.
 */
const createCatalog = ({ poems, planets, poets }) => {
  const planetById = new Map(planets.map((planet) => [planet.id, planet]));
  const poemsByPlanet = new Map(planets.map((planet) => [planet.id, []]));
  const indexById = new Map();

  poems.forEach((poem, index) => {
    if (indexById.has(poem.id)) throw new Error(`Duplicate poem id "${poem.id}"`);
    if (!planetById.has(poem.planet)) throw new Error(`Poem "${poem.id}" uses unknown planet "${poem.planet}"`);
    if (!poets[poem.poet]) throw new Error(`Poem "${poem.id}" uses unknown poet "${poem.poet}"`);
    if (poem.couplets.length === 0) throw new Error(`Poem "${poem.id}" has no couplets`);
    indexById.set(poem.id, index);
    poemsByPlanet.get(poem.planet).push(poem);
  });

  const size = poems.length;
  const wrap = (index) => ((index % size) + size) % size;

  return Object.freeze({
    size,
    planets,
    poems,
    hasPoem: (id) => indexById.has(id),
    poem: (id) => poems[indexById.get(id)],
    indexOf: (id) => indexById.get(id),
    at: (index) => poems[wrap(index)],
    /** The poem `delta` steps away, wrapping around the ends. */
    neighbour: (id, delta) => poems[wrap(indexById.get(id) + delta)],
    planet: (id) => planetById.get(id),
    poemsOf: (planetId) => poemsByPlanet.get(planetId) ?? [],
    poet: (id) => poets[id],
    planetOf: (poem) => planetById.get(poem.planet),
    poetOf: (poem) => poets[poem.poet],
  });
};


// ---- js/domain/daily.js ----
/**
 * Daily: picks "today's poem" from the date alone, so it is the same all day,
 * changes at midnight, and walks through every poem before repeating.
 */
const Daily = (() => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  /** A step that shares no factor with `count`, so consecutive days never collide. */
  const strideFor = (count) => [7, 5, 3, 2, 1].find((stride) => gcd(stride, count) === 1);

  const dayNumber = (date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

  const indexFor = (count, date) => {
    const day = ((dayNumber(date) % count) + count) % count;
    return (day * strideFor(count)) % count;
  };

  return Object.freeze({ strideFor, dayNumber, indexFor });
})();


// ---- js/domain/orbit.js ----
/**
 * Orbit: turns the declarative map layout into coordinates.
 * Pure geometry, so it can be tested without a browser.
 */
const Orbit = (() => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  /**
   * Returns one entry per body: { planet, size, label, x, y, top }
   *   x   percent of map width
   *   y   position in width units (what the geometry works in)
   *   top percent of map height (what CSS needs)
   */
  const placeBodies = (layout) => {
    const definitions = new Map(layout.bodies.map((body) => [body.planet, body]));
    const placed = new Map();

    const locate = (body) => {
      if (placed.has(body.planet)) return placed.get(body.planet);
      let point;
      if (body.at) {
        point = { x: body.at.x, y: body.at.y };
      } else if (body.orbit) {
        const angle = toRadians(body.orbit.angle);
        point = {
          x: layout.sun.x + body.orbit.radius * Math.cos(angle),
          y: layout.sun.y + body.orbit.radius * Math.sin(angle),
        };
      } else {
        const parent = locate(definitions.get(body.satelliteOf));
        point = { x: parent.x + body.offset.x, y: parent.y + body.offset.y };
      }
      placed.set(body.planet, point);
      return point;
    };

    return layout.bodies.map((body) => {
      const { x, y } = locate(body);
      return { planet: body.planet, size: body.size, label: body.label, x, y, top: (y / layout.height) * 100 };
    });
  };

  return Object.freeze({ placeBodies });
})();


// ---- js/domain/constellation.js ----
/**
 * Constellation: lays kept poems out as stars, snaking through a grid so that
 * neighbours in the list are neighbours on screen. Jitter comes from a hash of the
 * poem id, so a poem always lands in the same spot.
 */
const Constellation = (() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const layout = (ids, { width, minHeight, rowHeight, columns, margin }) => {
    const rows = Math.max(1, Math.ceil(ids.length / columns));
    const height = Math.max(minHeight, rows * rowHeight);
    const cellWidth = width / columns;
    const cellHeight = height / rows;

    const points = ids.map((id, n) => {
      const row = Math.floor(n / columns);
      const column = row % 2 === 0 ? n % columns : columns - 1 - (n % columns);
      const hash = Text.hashString(id);
      const jitterX = (hash % 17) - 8;
      const jitterY = ((hash >>> 5) % 13) - 6;
      return {
        id,
        x: clamp(column * cellWidth + cellWidth / 2 + jitterX, margin, width - margin),
        y: clamp(row * cellHeight + cellHeight / 2 + jitterY, margin, height - margin),
      };
    });

    return { width, height, points };
  };

  return Object.freeze({ layout });
})();


// ---- js/state/actions.js ----
/** Actions: the only ways the app state can change. Each is a plain object. */
const Actions = Object.freeze({
  selectPlanet: (planetId) => ({ type: "selectPlanet", planetId }),
  openPoem: (poemId) => ({ type: "openPoem", poemId }),
  goToMap: () => ({ type: "goToMap" }),
  step: (delta) => ({ type: "step", delta }),
  setLanguage: (language) => ({ type: "setLanguage", language }),
  toggleFavorite: (poemId) => ({ type: "toggleFavorite", poemId }),
  removeFavorite: (poemId) => ({ type: "removeFavorite", poemId }),
  openKeepsakes: () => ({ type: "openKeepsakes" }),
  closeKeepsakes: () => ({ type: "closeKeepsakes" }),
});


// ---- js/state/reducer.js ----
/**
 * Reducer: a pure function (state, action) -> new state.
 * No DOM, no storage, no timers. That keeps every rule about navigation, language and
 * favourites in one testable place.
 *
 * State shape:
 *   screen          "map" | "poem"
 *   planetId        the planet whose poems are listed on the map screen
 *   poemId          the poem being read (or today's poem before anything is opened)
 *   language        "fa" | "both" | "en"
 *   favorites       poem ids in the order they were kept
 *   keepsakesOpen   whether the keepsakes sheet is showing
 */
const createInitialState = ({ catalog, todayId, favorites, language, languages, defaultLanguage }) => {
  const saved = Array.isArray(favorites) ? favorites : [];
  const kept = [...new Set(saved)].filter((id) => catalog.hasPoem(id));
  return Object.freeze({
    screen: "map",
    planetId: catalog.poem(todayId).planet,
    poemId: todayId,
    language: languages.includes(language) ? language : defaultLanguage,
    favorites: Object.freeze(kept),
    keepsakesOpen: false,
  });
};

const createReducer = ({ catalog, languages }) => (state, action) => {
  switch (action.type) {
    case "selectPlanet":
      return catalog.planet(action.planetId) && action.planetId !== state.planetId
        ? { ...state, planetId: action.planetId }
        : state;

    case "openPoem": {
      if (!catalog.hasPoem(action.poemId)) return state;
      const poem = catalog.poem(action.poemId);
      return { ...state, screen: "poem", poemId: poem.id, planetId: poem.planet, keepsakesOpen: false };
    }

    case "goToMap":
      return { ...state, screen: "map", planetId: catalog.poem(state.poemId).planet, keepsakesOpen: false };

    case "step": {
      const poem = catalog.neighbour(state.poemId, action.delta);
      return { ...state, poemId: poem.id, planetId: poem.planet };
    }

    case "setLanguage":
      return languages.includes(action.language) && action.language !== state.language
        ? { ...state, language: action.language }
        : state;

    case "toggleFavorite": {
      if (!catalog.hasPoem(action.poemId)) return state;
      const has = state.favorites.includes(action.poemId);
      const favorites = has ? state.favorites.filter((id) => id !== action.poemId) : [...state.favorites, action.poemId];
      return { ...state, favorites: Object.freeze(favorites) };
    }

    case "removeFavorite":
      return state.favorites.includes(action.poemId)
        ? { ...state, favorites: Object.freeze(state.favorites.filter((id) => id !== action.poemId)) }
        : state;

    case "openKeepsakes":
      return state.keepsakesOpen ? state : { ...state, keepsakesOpen: true };

    case "closeKeepsakes":
      return state.keepsakesOpen ? { ...state, keepsakesOpen: false } : state;

    default:
      return state;
  }
};


// ---- js/state/store.js ----
/**
 * Store: holds the current state and tells subscribers when it changes.
 * Subscribers receive (nextState, previousState) so they can react only to what changed.
 */
const createStore = (reducer, initialState) => {
  let state = initialState;
  const listeners = new Set();

  return Object.freeze({
    getState: () => state,
    dispatch(action) {
      const previous = state;
      const next = reducer(previous, action);
      if (next === previous) return;
      state = next;
      listeners.forEach((listener) => listener(next, previous));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
};


// ---- js/state/selectors.js ----
/** Selectors: small read-only questions about the state. */
const Selectors = Object.freeze({
  isFavorite: (state, poemId) => state.favorites.includes(poemId),
  favoriteCount: (state) => state.favorites.length,
});


// ---- js/infra/storage.js ----
/**
 * Storage: a safe wrapper around localStorage.
 * Browsers can block or empty storage (private mode, embedded views), so every call
 * is guarded and falls back quietly. Callers never need their own try/catch.
 */
const createStorage = (getBackend) => {
  const backend = () => {
    try {
      return getBackend();
    } catch (error) {
      return null;
    }
  };

  const read = (key, fallback) => {
    try {
      const value = backend()?.getItem(key);
      return value ?? fallback;
    } catch (error) {
      return fallback;
    }
  };

  /** Returns true only if the value was really stored. */
  const write = (key, value) => {
    const target = backend();
    if (!target) return false;
    try {
      target.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  };

  const readJSON = (key, fallback) => {
    const raw = read(key, null);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  };

  const writeJSON = (key, value) => write(key, JSON.stringify(value));

  return Object.freeze({ read, write, readJSON, writeJSON });
};


// ---- js/render/pixel-planet.js ----
/**
 * PixelPlanet: draws the little smiling planets on a 24 x 24 grid.
 *
 * It is split in two so the interesting part stays testable:
 *   pixels(sprite, options)   pure: returns [{ x, y, color }] with no canvas involved
 *   draw(canvas, sprite, ...) paints those pixels; CSS scales the tiny canvas up
 *
 * Later pixels overwrite earlier ones, so the order of the steps below is the layering.
 */
const PixelPlanet = (() => {
  const GRID = 24;
  const CENTER = 12;
  const COLORS = Object.freeze({ outline: "#6b3550", face: "#4a1f33", blush: "#ff7fa8", shine: "#ffffff" });

  const PALETTES = Object.freeze({
    sun: { base: "#ffd45e", light: "#fff0a0", dark: "#ffab3d", ray: "#ffd45e" },
    mercury: { base: "#cfc3b6", light: "#ebe2d6", dark: "#a69a8a", crater: "#8f8474" },
    venus: { base: "#ffb3c7", light: "#ffd9e4", dark: "#e5799c" },
    earth: { base: "#6fcaff", light: "#a8e3ff", dark: "#3f9fe0", land: "#7ef0c9", landLight: "#b6f7e0" },
    moon: { base: "#f4efd6", light: "#fffbe8", dark: "#cfc8a8", crater: "#bdb590" },
    mars: { base: "#ff9b7d", light: "#ffc4ae", dark: "#d96b52", crater: "#c85a45", cap: "#fff2ec" },
    jupiter: {
      // [light, base, dark] for three stripe colours
      stripes: [["#ffe8cf", "#ffd9b0", "#e6b98a"], ["#f5bd8c", "#e9a46f", "#c9824e"], ["#fff6e8", "#fff0dc", "#e8d2b4"]],
      spot: "#e0745a",
    },
    saturn: { base: "#b9a9ff", light: "#dcd3ff", dark: "#8d7ae6", ring: "#ffe27a" },
    uranus: { base: "#9de8ee", light: "#cdf6f8", dark: "#6cc3cc" },
    neptune: { base: "#6f8cff", light: "#a8bcff", dark: "#4a62d6", band: "#8ea6ff" },
  });

  const CRATER_SPOTS = Object.freeze([[7, 6], [16, 8], [9, 15], [15, 16], [12, 5]]);
  const SUN_RAYS = Object.freeze([[12, 1], [12, 22], [1, 12], [22, 12], [4, 4], [19, 4], [4, 19], [19, 19]]);
  const RING_Y = 14.5;

  const distance = (x, y) => Math.hypot(x + 0.5 - CENTER, y + 0.5 - CENTER);
  const ringValue = (x, y) => ((x + 0.5 - CENTER) / 11.5) ** 2 + ((y + 0.5 - RING_Y) / 3.2) ** 2;
  const onRing = (x, y) => {
    const value = ringValue(x, y);
    return value <= 1 && value >= 0.55;
  };
  const eachCell = (visit) => {
    for (let y = 0; y < GRID; y += 1) for (let x = 0; x < GRID; x += 1) visit(x, y);
  };

  // Light comes from the top left: 0 = lit, 1 = middle, 2 = shaded.
  const toneAt = (x, y, radius) => {
    const slant = x + 0.5 - CENTER + (y + 0.5 - CENTER);
    if (slant < -radius * 0.55) return 0;
    return slant > radius * 0.6 ? 2 : 1;
  };

  const surfaceColor = (sprite, palette, x, y, tone, radius) => {
    if (sprite === "jupiter") {
      const stripe = palette.stripes[y % 6 < 2 ? 1 : y % 6 < 4 ? 0 : 2];
      const onSpot = x >= 14 && x <= 16 && y >= 15 && y <= 16;
      return onSpot ? palette.spot : stripe[tone];
    }
    let color = [palette.light, palette.base, palette.dark][tone];
    const lit = x + 0.5 - CENTER + (y + 0.5 - CENTER) < radius * 0.6;
    if (sprite === "earth" && ((x >> 1) * 3 + (y >> 1) * 5) % 7 < 2 && lit) color = tone === 0 ? palette.landLight : palette.land;
    if (sprite === "neptune" && (y === 8 || y === 9 || y === 17)) color = palette.band;
    if (sprite === "venus" && (y === 7 || y === 16)) color = palette.light;
    if (sprite === "mars" && y <= 5) color = palette.cap;
    if (sprite === "uranus" && (y === 16 || y === 17)) color = palette.light;
    return color;
  };

  const addRays = (put, palette) => {
    SUN_RAYS.forEach(([x, y]) => {
      put(x, y, palette.ray);
      put(x + (x < CENTER ? 1 : x > CENTER ? -1 : 0), y + (y < CENTER ? 1 : y > CENTER ? -1 : 0), palette.ray);
    });
  };

  const addRing = (put, palette, radius, front) => {
    eachCell((x, y) => {
      if (!onRing(x, y)) return;
      const inFront = y + 0.5 >= RING_Y;
      if (inFront !== front) return;
      if (!front && distance(x, y) <= radius + 1) return; // the back of the ring hides behind the planet
      put(x, y, palette.ring);
    });
  };

  const addBody = (put, sprite, palette, radius) => {
    eachCell((x, y) => {
      if (distance(x, y) <= radius + 1) put(x, y, COLORS.outline);
    });
    eachCell((x, y) => {
      if (distance(x, y) > radius) return;
      put(x, y, surfaceColor(sprite, palette, x, y, toneAt(x, y, radius), radius));
    });
  };

  const addCraters = (put, palette, radius) => {
    CRATER_SPOTS.forEach(([x, y]) => {
      if (distance(x, y) >= radius - 1) return;
      put(x, y, palette.crater);
      put(x + 1, y, palette.crater);
    });
  };

  // Big shiny eyes, rosy cheeks and a tiny smile (or an open mouth while "talking").
  const addFace = (put, { blink, talk, shift }) => {
    const { face, blush, shine } = COLORS;
    if (blink) {
      [7, 8, 15, 16].forEach((x) => put(x, 11 + shift, face));
    } else {
      put(7, 10 + shift, shine); put(8, 10 + shift, face); put(7, 11 + shift, face); put(8, 11 + shift, face);
      put(15, 10 + shift, shine); put(16, 10 + shift, face); put(15, 11 + shift, face); put(16, 11 + shift, face);
    }
    [5, 6, 17, 18].forEach((x) => put(x, 13 + shift, blush));
    const mouth = talk ? [[11, 14], [12, 14], [11, 15], [12, 15]] : [[10, 14], [11, 15], [12, 15], [13, 14]];
    mouth.forEach(([x, y]) => put(x, y + shift, face));
  };

  const pixels = (sprite, { blink = false, talk = false } = {}) => {
    const palette = PALETTES[sprite];
    if (!palette) throw new Error(`Unknown sprite "${sprite}"`);
    const list = [];
    const put = (x, y, color) => list.push({ x, y, color });
    const ringed = sprite === "saturn";
    const radius = ringed ? 7 : 8;

    if (sprite === "sun") addRays(put, palette);
    if (ringed) addRing(put, palette, radius, false);
    addBody(put, sprite, palette, radius);
    if (palette.crater) addCraters(put, palette, radius);
    addFace(put, { blink, talk, shift: ringed ? -2 : 0 }); // Saturn's face rides higher, above its ring
    if (ringed) addRing(put, palette, radius, true);
    return list;
  };

  const draw = (canvas, sprite, options) => {
    if (canvas.width !== GRID) canvas.width = GRID;
    if (canvas.height !== GRID) canvas.height = GRID;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, GRID, GRID);
    pixels(sprite, options).forEach(({ x, y, color }) => {
      context.fillStyle = color;
      context.fillRect(x, y, 1, 1);
    });
  };

  return Object.freeze({ GRID, sprites: Object.keys(PALETTES), pixels, draw });
})();


// ---- js/render/pixel-art.js ----
/** PixelArt: small pixel-art SVGs (stars for keepsakes, the rocket on the map). */
const PixelArt = (() => {
  const STAR = Object.freeze(["...X...", "...X...", "..XXX..", "XXXXXXX", "..XXX..", "...X...", "...X..."]);
  const ROCKET = Object.freeze(["...R...", "..RRR..", "..WBW..", "..WWW..", ".RWWWR.", "RRWWWRR", "..F.F..", "...F..."]);
  const ROCKET_COLORS = Object.freeze({ R: "#ff5c93", W: "#ffffff", B: "#8fe8ef", F: "#ffd36b" });

  const rects = (rows, colorOf, unit, offsetX, offsetY) => {
    let svg = "";
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x += 1) {
        const color = colorOf(row[x]);
        if (color) svg += `<rect x="${offsetX + x * unit}" y="${offsetY + y * unit}" width="${unit}" height="${unit}" fill="${color}"/>`;
      }
    });
    return svg;
  };

  /** Star rectangles to drop into an existing <svg>, centred on (cx, cy). */
  const starAt = (color, cx, cy, unit) => {
    const half = (STAR.length * unit) / 2;
    return rects(STAR, (cell) => (cell === "X" ? color : null), unit, Math.round(cx - half), Math.round(cy - half));
  };

  /** A standalone little star icon. */
  const starIcon = (color) =>
    `<svg viewBox="0 0 7 7" aria-hidden="true">${rects(STAR, (cell) => (cell === "X" ? color : null), 1, 0, 0)}</svg>`;

  const rocket = () =>
    `<svg class="rocket" viewBox="0 0 7 8" aria-hidden="true">${rects(ROCKET, (cell) => ROCKET_COLORS[cell] ?? null, 1, 0, 0)}</svg>`;

  return Object.freeze({ starAt, starIcon, rocket });
})();


// ---- js/infra/dom.js ----
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


// ---- js/ui/effects.js ----
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


// ---- js/ui/planet-actor.js ----
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


// ---- js/ui/blink-loop.js ----
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


// ---- js/ui/spotlight.js ----
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


// ---- js/ui/toast.js ----
/** Toast: a short message that fades in, then out. */
const createToast = ({ element, durationMs }) => {
  let timer = null;

  const show = (message) => {
    element.textContent = message;
    element.classList.add("is-visible");
    clearTimeout(timer);
    timer = setTimeout(() => element.classList.remove("is-visible"), durationMs);
  };

  return Object.freeze({ show });
};


// ---- js/ui/badges.js ----
/** Badges: keeps every "kept poems" counter in sync with the favourites. */
const createBadges = ({ store, elements }) => {
  const apply = (state) => {
    const count = Selectors.favoriteCount(state);
    elements.forEach((element) => {
      element.hidden = count === 0;
      element.textContent = String(count);
    });
  };

  store.subscribe((state, previous) => {
    if (state.favorites !== previous.favorites) apply(state);
  });
  apply(store.getState());
};


// ---- js/ui/launch-effect.js ----
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


// ---- js/ui/screen-manager.js ----
/**
 * ScreenManager: shows the screen named in the state and hides the other.
 * It also moves keyboard focus to the new screen so assistive tech follows along.
 */
const createScreenManager = ({ store, screens, dock }) => {
  const apply = (state, previous) => {
    Object.entries(screens).forEach(([name, element]) => {
      element.hidden = name !== state.screen;
    });
    dock.hidden = state.screen !== "poem";

    if (previous && previous.screen !== state.screen) {
      window.scrollTo(0, 0);
      screens[state.screen].focus({ preventScroll: true });
    }
  };

  store.subscribe(apply);
  apply(store.getState(), null);
};


// ---- js/ui/today-card.js ----
/** TodayCard: the "Today's poem" shortcut at the top of the map screen. */
const createTodayCard = ({ button, titleElement, metaElement, poem, planet, poet, onOpen }) => {
  titleElement.textContent = poem.title;
  metaElement.textContent = `${planet.name}, ${poet.en}`;
  button.addEventListener("click", () => onOpen(poem.id));
};


// ---- js/ui/map-view.js ----
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


// ---- js/ui/destination-view.js ----
/**
 * DestinationView: the panel under the map for the selected planet.
 * The header (planet + speech bubble) redraws only when the planet changes;
 * the list of poems also redraws when favourites change.
 */
const createDestinationView = ({ root, store, catalog, todayPoemId, timing, reducedMotion, onOpenPoem }) => {
  let actor = null;
  let listElement = null;

  const optionHtml = (state, poem) => {
    const poet = catalog.poetOf(poem);
    const kept = Selectors.isFavorite(state, poem.id);
    let tag = "";
    if (poem.id === todayPoemId) tag = '<span class="option__tag">Today</span>';
    else if (kept) tag = '<span class="option__kept" aria-label="kept in your keepsakes">\u2605</span>';

    return `<li><button type="button" class="option" data-poem-id="${Text.escapeHtml(poem.id)}">` +
      '<span class="option__dot" aria-hidden="true"></span>' +
      `<span class="option__text"><span class="option__title">${Text.escapeHtml(poem.title)}</span>` +
      `<span class="option__poet">${Text.escapeHtml(poet.en)}</span>` +
      `<span class="option__verse" lang="fa">${Text.escapeHtml(poem.couplets[0].fa[0])}</span></span>` +
      `${tag}<span class="option__chevron" aria-hidden="true">&rsaquo;</span></button></li>`;
  };

  const renderList = (state) => {
    const poems = catalog.poemsOf(state.planetId);
    Dom.setHtml(listElement, poems.map((poem) => optionHtml(state, poem)).join(""));
  };

  const renderHeader = (state) => {
    const planet = catalog.planet(state.planetId);
    const count = catalog.poemsOf(planet.id).length;

    actor?.dispose();
    root.style.setProperty("--accent", planet.color);
    Dom.setHtml(
      root,
      '<div class="destination__head"><canvas class="sprite destination__sprite" aria-hidden="true"></canvas>' +
        `<div class="destination__bubble">${Text.escapeHtml(planet.greeting)}</div></div>` +
        `<h2 class="destination__name">${Text.escapeHtml(planet.name)}</h2>` +
        `<p class="destination__mood text-muted">${Text.escapeHtml(planet.mood)}, ${count} ${count === 1 ? "poem" : "poems"}</p>` +
        '<ul class="options"></ul>'
    );
    listElement = root.querySelector(".options");
    actor = createPlanetActor({ canvas: root.querySelector(".destination__sprite"), sprite: planet.sprite, timing, reducedMotion });
    actor.talk(timing.talkOnTapMs + 400);
    restartEntrance();
  };

  // replay the panel's entrance animation
  const restartEntrance = () => {
    root.style.animation = "none";
    void root.offsetWidth;
    root.style.animation = "";
  };

  root.addEventListener("click", (event) => {
    const option = Dom.closest(event.target, ".option");
    if (option) onOpenPoem(option.dataset.poemId);
  });

  store.subscribe((state, previous) => {
    if (state.planetId !== previous.planetId) {
      renderHeader(state);
      renderList(state);
    } else if (state.favorites !== previous.favorites) {
      renderList(state);
    }
  });

  renderHeader(store.getState());
  renderList(store.getState());
};


// ---- js/ui/poem-template.js ----
/**
 * PoemTemplate: turns a poem into HTML. Pure functions of their input (no DOM access),
 * and every piece of text is escaped on the way in.
 *
 * Words get an index so CSS can reveal them one after another; English words are offset
 * by the number of Persian words so the two lines flow on from each other.
 */
const PoemTemplate = (() => {
  const wordsHtml = (line, startIndex) =>
    Text.splitWords(line)
      .map((word, i) => `<span class="word" style="--index:${startIndex + i}">${Text.escapeHtml(word)}</span>`)
      .join(" ");

  /** Renders two lines; also reports how many words they contain. */
  const linesHtml = (lines) => {
    let count = 0;
    const html = lines
      .map((line) => {
        const markup = `<span class="line">${wordsHtml(line, count)}</span>`;
        count += Text.splitWords(line).length;
        return markup;
      })
      .join("");
    return { html, count };
  };

  const coupletHtml = (couplet) => {
    const fa = linesHtml(couplet.fa);
    const en = linesHtml(couplet.en);
    return '<section class="couplet">' +
      `<div class="couplet__fa" dir="rtl" lang="fa">${fa.html}</div>` +
      '<div class="couplet__sep" aria-hidden="true"><i></i><i></i><i></i></div>' +
      `<div class="couplet__en" lang="en" style="--offset:${fa.count}">${en.html}</div></section>`;
  };

  const card = ({ poem, planet, poet, position, total }) =>
    `<article class="poem-card card" style="--accent:${Text.escapeHtml(planet.color)}">` +
      `<div class="poem-card__bar"><span>${Text.escapeHtml(planet.name)}, ${Text.escapeHtml(planet.mood)}</span><span>${position} / ${total}</span></div>` +
      '<div class="poem-card__body">' +
        `<h2 class="poem-card__title">${Text.escapeHtml(poem.title)}</h2>` +
        `<p class="poem-card__poet"><span>${Text.escapeHtml(poet.en)}</span><span class="poem-card__poet-fa" lang="fa">${Text.escapeHtml(poet.fa)}</span></p>` +
        (poem.note ? `<p class="poem-card__note">${Text.escapeHtml(poem.note)}</p>` : "") +
        '<div class="poem-card__rule" aria-hidden="true"></div>' +
        `<div class="couplets">${poem.couplets.map(coupletHtml).join("")}</div>` +
        '<p class="poem-card__end" aria-hidden="true"><i></i><i></i><i></i></p>' +
      "</div></article>";

  return Object.freeze({ wordsHtml, linesHtml, coupletHtml, card });
})();


// ---- js/ui/poem-view.js ----
/**
 * PoemView: shows the current poem and its planet. It re-renders when a poem is opened
 * or stepped to, and applies the chosen language.
 */
const createPoemView = ({ store, catalog, elements, actor, spotlight, timing, reducedMotion }) => {
  const render = (state) => {
    const poem = catalog.poem(state.poemId);
    const planet = catalog.planetOf(poem);
    const poet = catalog.poetOf(poem);
    const poems = catalog.poemsOf(planet.id);

    Dom.setHtml(elements.stage, PoemTemplate.card({ poem, planet, poet, position: poems.indexOf(poem) + 1, total: poems.length }));
    elements.planetName.textContent = planet.name;
    elements.planetMood.textContent = planet.mood;

    actor.setSprite(planet.sprite);
    actor.hop();
    actor.talk(Math.min(timing.talkMaxMs, timing.talkBaseMs + poem.couplets.length * timing.talkPerCoupletMs));
    spotlight.watch(elements.stage);
    window.scrollTo(0, 0);
  };

  store.subscribe((state, previous) => {
    elements.stage.dataset.language = state.language;
    const arrived = state.screen === "poem" && previous.screen !== "poem";
    if (state.screen === "poem" && (arrived || state.poemId !== previous.poemId)) render(state);
  });

  elements.stage.dataset.language = store.getState().language;
  createBlinkLoop({
    getActors: () => [actor],
    everyMs: timing.poemBlinkEveryMs,
    isActive: () => store.getState().screen === "poem",
    reducedMotion,
  });
};


// ---- js/ui/language-switch.js ----
/** LanguageSwitch: the Persian / both / English control. */
const createLanguageSwitch = ({ root, store }) => {
  const buttons = [...root.querySelectorAll("[data-language]")];

  root.addEventListener("click", (event) => {
    const button = Dom.closest(event.target, "[data-language]");
    if (button) store.dispatch(Actions.setLanguage(button.dataset.language));
  });

  const apply = (state) => {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.language === state.language)));
  };

  store.subscribe(apply);
  apply(store.getState());
};


// ---- js/ui/dock.js ----
/**
 * Dock: the controls under a poem (previous, keep, keepsakes, next).
 * The "poem was kept" celebration is derived from the state change itself,
 * so it happens however a poem gets kept.
 */
const createDock = ({ store, elements, toast }) => {
  elements.prev.addEventListener("click", () => store.dispatch(Actions.step(-1)));
  elements.next.addEventListener("click", () => store.dispatch(Actions.step(1)));
  elements.keep.addEventListener("click", () => store.dispatch(Actions.toggleFavorite(store.getState().poemId)));
  elements.keepsakes.addEventListener("click", () => store.dispatch(Actions.openKeepsakes()));

  const syncKeepButton = (state) => {
    elements.keep.setAttribute("aria-pressed", String(Selectors.isFavorite(state, state.poemId)));
  };

  const celebrate = (state) => {
    toast.show(Selectors.favoriteCount(state) === 1 ? "yay, your first keepsake! it's a star now" : "added to your keepsakes");
    Effects.confetti(elements.keep);
    if (!Dom.reducedMotion()) Dom.restartAnimation(elements.keepsakes, "is-pinging");
  };

  elements.keepsakes.addEventListener("animationend", () => elements.keepsakes.classList.remove("is-pinging"));

  store.subscribe((state, previous) => {
    syncKeepButton(state);
    if (state.favorites.length > previous.favorites.length) celebrate(state);
  });
  syncKeepButton(store.getState());
};


// ---- js/ui/keepsakes-view.js ----
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


// ---- js/ui/input.js ----
/** Input: keyboard shortcuts and swipe gestures. They only dispatch actions. */
const createInput = ({ store, swipeTarget, gestures }) => {
  document.addEventListener("keydown", (event) => {
    const state = store.getState();
    if (event.key === "Escape" && state.keepsakesOpen) {
      store.dispatch(Actions.closeKeepsakes());
      return;
    }
    if (state.keepsakesOpen || state.screen !== "poem") return;
    if (event.key === "ArrowRight") store.dispatch(Actions.step(1));
    if (event.key === "ArrowLeft") store.dispatch(Actions.step(-1));
  });

  let start = null;
  swipeTarget.addEventListener("touchstart", (event) => {
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });

  swipeTarget.addEventListener("touchend", (event) => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    const mostlyHorizontal = Math.abs(dx) >= gestures.swipeMinDistance && Math.abs(dx) >= Math.abs(dy) * gestures.swipeDominance;
    if (mostlyHorizontal) store.dispatch(Actions.step(dx < 0 ? 1 : -1));
  }, { passive: true });
};


// ---- js/app.js ----
/**
 * App: the composition root. It is the only place that knows about every module:
 * it creates them, hands each one exactly what it needs, and connects them.
 * Everything else depends only on what it is given.
 */
const startApp = () => {
  const reducedMotion = Dom.reducedMotion();
  const { timing } = Config;
  document.documentElement.style.setProperty("--word-step", `${timing.wordStepMs}ms`);

  // ---- data and state ----
  const storage = createStorage(() => window.localStorage);
  const catalog = createCatalog({ poems: POEMS, planets: PLANETS, poets: POETS });
  const today = catalog.at(Daily.indexFor(catalog.size, new Date()));

  const store = createStore(
    createReducer({ catalog, languages: Config.languages }),
    createInitialState({
      catalog,
      todayId: today.id,
      favorites: storage.readJSON(Config.storageKeys.favorites, []),
      language: storage.read(Config.storageKeys.language, Config.defaultLanguage),
      languages: Config.languages,
      defaultLanguage: Config.defaultLanguage,
    })
  );

  // ---- elements ----
  const el = Dom.byId;
  const screens = { map: el("screen-map"), poem: el("screen-poem") };
  const dock = el("dock");

  // ---- small, static bits of the page ----
  el("greeting").textContent = Greeting.forDate(new Date(), Config.recipientName);
  document.querySelectorAll("[data-star-icon]").forEach((node) => Dom.setHtml(node, PixelArt.starIcon(node.dataset.starIcon)));

  // ---- behaviours shared by several views ----
  const toast = createToast({ element: el("toast"), durationMs: timing.toastMs });
  const launch = createLaunchEffect({ element: el("launch-bloom"), delayMs: timing.launchMs, reducedMotion });
  const spotlight = createSpotlight({ reducedMotion });

  /** Open a poem; from the map the bloom plays first, from a poem it is instant. */
  const openPoem = (poemId) => {
    store.dispatch(Actions.closeKeepsakes());
    if (store.getState().screen === "poem") {
      store.dispatch(Actions.openPoem(poemId));
      return;
    }
    launch.play().then((ready) => {
      if (ready) store.dispatch(Actions.openPoem(poemId));
    });
  };

  // ---- views (the screen manager goes first so a screen is visible before its content renders) ----
  createScreenManager({ store, screens, dock });
  createBadges({ store, elements: document.querySelectorAll("[data-keepsake-badge]") });

  createTodayCard({
    button: el("today-card"),
    titleElement: el("today-title"),
    metaElement: el("today-meta"),
    poem: today,
    planet: catalog.planetOf(today),
    poet: catalog.poetOf(today),
    onOpen: openPoem,
  });

  createMapView({ root: el("solar-map"), store, catalog, layout: MAP_LAYOUT, todayPlanetId: today.planet, timing, reducedMotion });
  createDestinationView({ root: el("destination"), store, catalog, todayPoemId: today.id, timing, reducedMotion, onOpenPoem: openPoem });

  const poemActor = createPlanetActor({ canvas: el("poem-sprite"), sprite: catalog.planetOf(today).sprite, timing, reducedMotion });
  createPoemView({
    store,
    catalog,
    elements: { stage: el("poem-stage"), planetName: el("poem-planet-name"), planetMood: el("poem-planet-mood") },
    actor: poemActor,
    spotlight,
    timing,
    reducedMotion,
  });

  createLanguageSwitch({ root: el("language-switch"), store });
  el("back-to-map").addEventListener("click", () => store.dispatch(Actions.goToMap()));

  createDock({
    store,
    toast,
    elements: { prev: el("dock-prev"), next: el("dock-next"), keep: el("dock-keep"), keepsakes: el("dock-keepsakes") },
  });

  createKeepsakesView({
    store,
    catalog,
    config: Config.constellation,
    background: [el("app"), dock],
    onOpenPoem: openPoem,
    elements: {
      root: el("keepsakes"),
      closeButton: el("keepsakes-close"),
      sky: el("constellation"),
      note: el("keepsakes-note"),
      list: el("keepsakes-list"),
    },
  });
  el("keepsakes-open-top").addEventListener("click", () => store.dispatch(Actions.openKeepsakes()));

  createInput({ store, swipeTarget: el("poem-stage"), gestures: Config.gestures });

  // ---- persistence: save only what changed ----
  store.subscribe((state, previous) => {
    if (state.favorites !== previous.favorites) storage.writeJSON(Config.storageKeys.favorites, state.favorites);
    if (state.language !== previous.language) storage.write(Config.storageKeys.language, state.language);
  });
};

startApp();

})();