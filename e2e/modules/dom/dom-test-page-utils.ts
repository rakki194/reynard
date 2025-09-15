/**
 * DOM Test Page Utilities for Playwright E2E Tests
 *
 * Utilities for creating test pages with common DOM elements.
 *
 * @author 🦊 The Cunning Fox
 */

import { Page } from "@playwright/test";

/**
 * HTML content for DOM test page
 */
const DOM_TEST_PAGE_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>DOM Assertions Test Page</title>
    <style>
      .hidden { display: none; }
      .sr-only { position: absolute; left: -10000px; }
      .visible { display: block; }
      .invisible { visibility: hidden; }
      .transparent { opacity: 0; }
      .focusable { outline: 2px solid blue; }
    </style>
  </head>
  <body>
    <div id="test-container">
      <!-- Basic elements -->
      <div id="visible-element" class="visible">Visible Element</div>
      <div id="hidden-element" class="hidden">Hidden Element</div>
      <div id="invisible-element" class="invisible">Invisible Element</div>
      <div id="transparent-element" class="transparent">Transparent Element</div>

      <!-- Form elements -->
      <input id="text-input" type="text" value="Test Input" />
      <input id="disabled-input" type="text" disabled />
      <input id="required-input" type="text" required />
      <input id="invalid-input" type="email" value="invalid-email" />
      <input id="valid-input" type="email" value="test@example.com" />

      <!-- Checkboxes -->
      <input id="checked-checkbox" type="checkbox" checked />
      <input id="unchecked-checkbox" type="checkbox" />
      <input id="partial-checkbox" type="checkbox" />

      <!-- Buttons -->
      <button id="focusable-button" class="focusable">Focusable Button</button>
      <button id="disabled-button" disabled>Disabled Button</button>

      <!-- Elements with roles -->
      <div id="button-role" role="button">Button Role</div>
      <div id="link-role" role="link">Link Role</div>

      <!-- Elements with accessible names -->
      <button id="named-button" aria-label="Submit Form">Submit</button>
      <input id="labeled-input" aria-label="Email Address" type="email" />

      <!-- Elements with accessible descriptions -->
      <input id="described-input" aria-describedby="description" type="email" />
      <div id="description">Enter your email address</div>

      <!-- Elements with titles -->
      <button id="titled-button" title="Click to submit">Submit</button>

      <!-- Elements with classes -->
      <div id="multi-class" class="class1 class2 class3">Multi Class</div>

      <!-- Elements with attributes -->
      <div id="attributed-element" data-testid="test-element" data-value="123">Attributed</div>

      <!-- Elements not in document -->
      <div id="removable-element">Will be removed</div>
    </div>
  </body>
</html>
`;

/**
 * Utility function to create a test page with common DOM elements
 */
export async function createTestPage(page: Page): Promise<void> {
  await page.setContent(DOM_TEST_PAGE_HTML);

  // Set indeterminate state for the partial checkbox via JavaScript
  await page.evaluate(() => {
    const checkbox = document.getElementById("partial-checkbox") as HTMLInputElement;
    if (checkbox) {
      checkbox.indeterminate = true;
    }
  });
}
