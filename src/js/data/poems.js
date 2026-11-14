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
