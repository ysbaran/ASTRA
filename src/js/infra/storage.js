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
