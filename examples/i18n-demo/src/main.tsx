import { render } from "solid-js/web";
import { ReynardProvider } from "reynard-themes";
import App from "./App";
import "./styles.css";

// Render the app with unified Reynard provider
render(
  () => (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <App />
    </ReynardProvider>
  ),
  document.getElementById("root")!
);
