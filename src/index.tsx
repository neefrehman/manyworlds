import { h, render } from "preact";
import App from "./App.js";

const root = document.getElementById("root");

if (root) {
  render(<App />, root);
}
