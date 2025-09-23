/**
 * 🎬 Animation Demo Main Entry Point
 * 
 * Entry point for the Reynard Animation System Demo
 */

import { render } from "solid-js/web";
import App from "./App";

const root = document.getElementById("root");

if (root) {
  render(() => <App />, root);
} else {
  console.error("Root element not found!");
}
