/**
 * DOM Focus Management Tests
 * 
 * Focused tests for element focus assertions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test } from "@playwright/test";
import { createDOMAssertions, createTestPage } from "../utils/dom-assertion-helpers";

test.describe("Focus Management", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect focused elements", async () => {
    const element = dom.byId("focusable-button");
    await element.focus();
    await element.toHaveFocus();
  });

  test("should detect unfocused elements", async () => {
    await dom.byId("focusable-button").notToHaveFocus();
  });
});

