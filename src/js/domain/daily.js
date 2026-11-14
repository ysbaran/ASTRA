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
