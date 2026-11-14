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
