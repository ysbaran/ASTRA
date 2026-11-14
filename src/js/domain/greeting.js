/** Greeting: pure function of the time of day. */
const Greeting = (() => {
  const partOfDay = (hour) => {
    if (hour < 5) return "up late";
    if (hour < 12) return "good morning";
    if (hour < 18) return "good afternoon";
    return "good evening";
  };

  const forDate = (date, name) => `${partOfDay(date.getHours())}, ${name}`;

  return Object.freeze({ partOfDay, forDate });
})();
