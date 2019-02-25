const palette: string[] = [
  "#D32F2F", "#C2185B", "#7B1FA2", "#512DA8", "#303F9F",
  "#1976D2", "#0097A7", "#00796B", "#388E3C", "#AFB42B",
  "#FBC02D", "#FFA000", "#F57C00", "#E64A19",
];
export const randomColor = (courseName: string) => {
  return palette[Array.from(courseName).map((char: string) => char.charCodeAt(0)).reduce(
    (curr: number, next: number) => curr + next) % palette.length];
};
