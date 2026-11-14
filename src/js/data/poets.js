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
