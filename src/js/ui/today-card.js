/** TodayCard: the "Today's poem" shortcut at the top of the map screen. */
const createTodayCard = ({ button, titleElement, metaElement, poem, planet, poet, onOpen }) => {
  titleElement.textContent = poem.title;
  metaElement.textContent = `${planet.name}, ${poet.en}`;
  button.addEventListener("click", () => onOpen(poem.id));
};
