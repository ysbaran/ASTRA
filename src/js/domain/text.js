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
