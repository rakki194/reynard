/**
 * @fileoverview 404 Not Found page
 */

import { Component } from "solid-js";
import { DocsPage, DocsSection } from "reynard-docs-components";

/**
 * 404 Not Found page component
 */
export const NotFoundPage: Component = () => {
  return (
    <DocsPage>
      <DocsSection>
        <div class="docs-404">
          <div class="docs-404-content">
            <h1 class="docs-404-title">404</h1>
            <h2 class="docs-404-subtitle">Page Not Found</h2>
            <p class="docs-404-description">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div class="docs-404-actions">
              <a href="/" class="docs-404-button docs-404-button--primary">
                Go Home
              </a>
              <a
                href="/search"
                class="docs-404-button docs-404-button--secondary"
              >
                Search Documentation
              </a>
            </div>
          </div>
          <div class="docs-404-illustration">
            <div class="docs-404-fox">🦊</div>
          </div>
        </div>
      </DocsSection>
    </DocsPage>
  );
};
