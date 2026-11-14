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
