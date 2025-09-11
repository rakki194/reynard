import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { ReynardProvider } from "reynard-themes";
import "reynard-themes/themes.css";
import App from "./App";

render(() => (
  <ReynardProvider defaultTheme="light">
    <Router>
      <App />
    </Router>
  </ReynardProvider>
), document.getElementById("app")!);
