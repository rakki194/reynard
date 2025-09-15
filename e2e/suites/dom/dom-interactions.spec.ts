/**
 * DOM Interactions Tests
 *
 * Focused tests for complex DOM interactions and dynamic changes.
 *
 * @author 🦊 The Cunning Fox
 */

import { test } from "@playwright/test";
import { createDOMAssertions } from "../../modules/dom";
import { createTestPage } from "../../modules/dom";

test.describe("Complex DOM Interactions", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should handle dynamic content changes", async () => {
    const element = dom.byId("visible-element");
    await element.toHaveTextContent("Visible Element");

    // Change the text content
    await element.locator.page().evaluate(() => {
      const element = document.getElementById("visible-element");
      if (element) element.textContent = "Changed Text";
    });

    await element.toHaveTextContent("Changed Text");
  });

  test("should handle style changes", async () => {
    const element = dom.byId("visible-element");
    await element.toBeVisible();

    // Hide the element
    await element.locator.page().evaluate(() => {
      const element = document.getElementById("visible-element");
      if (element) element.style.display = "none";
    });

    await element.toBeHidden();
  });
});
