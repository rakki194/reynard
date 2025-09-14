/**
 * DOM Presence Tests
 * 
 * Focused tests for element presence assertions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test } from "@playwright/test";
import { createDOMAssertions, createTestPage } from "../utils/dom-assertion-helpers";

test.describe("Element Presence", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect elements in document", async () => {
    await dom.byId("visible-element").toBeInDocument();
  });

  test("should detect elements not in document", async () => {
    const element = dom.byId("removable-element");
    await element.toBeInDocument();
    
    // Remove the element
    await element.locator.page().evaluate(() => {
      const element = document.getElementById("removable-element");
      element?.remove();
    });
    
    await element.notToBeInDocument();
  });
});

