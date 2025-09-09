/**
 * GettingStarted Component
 * Displays the getting started section with code example
 */

import { Component } from "solid-js";

export const GettingStarted: Component = () => {
  return (
    <section class="demo-section">
      <h2>Getting Started</h2>
      <div class="code-example">
        <pre>
          <code>{`// Create a new Reynard app
npx reynard-create-app my-app
cd my-app
npm run dev`}</code>
        </pre>
      </div>
    </section>
  );
};
