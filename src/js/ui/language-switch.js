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
