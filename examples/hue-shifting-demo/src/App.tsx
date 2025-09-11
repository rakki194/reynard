import { Component } from "solid-js";
import { Route } from "@solidjs/router";
import { HueShiftingDemo } from "./components/HueShiftingDemo";
import { PixelArtEditor } from "./components/PixelArtEditor";
import { PerformanceComparison } from "./components/PerformanceComparison";
import { MaterialShowcase } from "./components/MaterialShowcase";
import { Navigation } from "./components/Navigation";
import "./App.css";

const Layout: Component<{ children?: any }> = (props) => (
  <div class="app">
    <Navigation />
    <main class="main-content">
      {props.children}
    </main>
  </div>
);

const App: Component = () => {
  return (
    <Route path="/*" component={Layout}>
      <Route path="/" component={HueShiftingDemo} />
      <Route path="/editor" component={PixelArtEditor} />
      <Route path="/materials" component={MaterialShowcase} />
      <Route path="/performance" component={PerformanceComparison} />
    </Route>
  );
};

export default App;
