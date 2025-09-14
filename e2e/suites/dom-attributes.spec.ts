/**
 * DOM Attributes Tests
 * 
 * Focused tests for element attribute and class assertions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test } from "@playwright/test";
import { createDOMAssertions, createTestPage } from "../utils/dom-assertion-helpers";

test.describe("Element Classes", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect single class", async () => {
    await dom.byId("visible-element").toHaveClasses("visible");
  });

  test("should detect multiple classes", async () => {
    await dom.byId("multi-class").toHaveClasses("class1", "class2", "class3");
  });
});

test.describe("Element Attributes", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect data attributes", async () => {
    await dom.byId("attributed-element").toHaveAttributes({
      "data-testid": "test-element",
      "data-value": "123"
    });
  });
});