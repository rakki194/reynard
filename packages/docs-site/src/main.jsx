/**
 * @fileoverview Main entry point for the documentation site
 */
import { render } from "solid-js/web";
import App from "./App";
import "./index.css";
// Render the application
render(() => <App />, document.getElementById("root"));
