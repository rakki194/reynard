/**
 * DOM Visibility Tests
 * 
 * Focused tests for element visibility assertions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { createDOMAssertions, createTestPage } from "../utils/dom-assertion-helpers";

test.describe("Element Visibility", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect visible elements", async () => {
    await dom.byId("visible-element").toBeVisible();
  });

  test("should detect hidden elements", async () => {
    await dom.byId("hidden-element").toBeHidden();
  });

  test("should detect invisible elements", async () => {
    await dom.byId("invisible-element").toBeHidden();
  });

  test("should detect transparent elements", async () => {
    // Elements with opacity: 0 are still considered visible by Playwright
    // because they take up space, so we check the computed opacity instead
    const element = dom.byId("transparent-element");
    await expect(element.locator).toHaveCSS("opacity", "0");
  });
});

