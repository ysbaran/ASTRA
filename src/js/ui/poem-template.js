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
