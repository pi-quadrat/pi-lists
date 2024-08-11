import { getData } from "./data";

const root = document.getElementById("root");
if (root) {
  const greeting: string = "Hello";
  getData().then((subject) => {
    root.innerHTML = `${greeting} ${subject}`;
  });
}
