/**
 * AppFooter Component
 * Displays the application footer with links and attribution
 */

import { Component } from "solid-js";

export const AppFooter: Component = () => {
  return (
    <footer class="app-footer">
      <p>Built with ❤️ using Reynard framework</p>
      <p>
        <a
          href="https://github.com/rakki194/reynard"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </p>
    </footer>
  );
};
