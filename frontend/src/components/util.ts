const palette: string[] = [
  "#D32F2F", "#C2185B", "#7B1FA2", "#512DA8", "#303F9F",
  "#1976D2", "#0097A7", "#00796B", "#388E3C", "#AFB42B",
  "#FBC02D", "#FFA000", "#F57C00", "#E64A19",
];

const months: string[] =
  ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
export const randomColor = (courseName: string) => {
  return palette[Array.from(courseName).map((char: string) => char.charCodeAt(0)).reduce(
    (curr: number, next: number) => curr + next) % palette.length];
};

/**
 * Transforms a date object into a user friendly date string.
 * @param date the date to be transformed
 */
export const getDisplayedDate = (date: Date) => {
  const currentDate: Date = new Date();
  const timeDiff = currentDate.getTime() - date.getTime();
  const yearDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 365));

  const isToday = date.getDate() === currentDate.getDate() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear();

  const yesterday = new Date(currentDate.getTime());
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday = date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  // Debugging purposes
  // console.log("======");
  // console.log("Current date: ", new Date().toString());
  // console.log("Handled date: ", date.toString());

  // console.log("Time diff: ", timeDiff);
  // console.log("Year diff: ", yearDiff);

  let dateString = "";

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeString = `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;

  if (isToday) {
    dateString = "today";
  } else if (isYesterday) {
    dateString = "yesterday";
  } else {
    dateString = `on ${date.getDate()} ${months[date.getMonth()]}`;
  }

  if (yearDiff > 0) {
    dateString += ` ${date.getFullYear()}`;
  }

  return `${dateString} at ${timeString}`;
};
