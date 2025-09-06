/**
 * Features Demo App Entry Point
 * Showcasing Reynard feature management system
 */

import { render } from "solid-js/web";
import App from "./App";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget wto add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);
