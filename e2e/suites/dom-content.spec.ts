/**
 * DOM Content Tests
 * 
 * Focused tests for element text content assertions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test } from "@playwright/test";
import { createDOMAssertions, createTestPage } from "../utils/dom-assertion-helpers";

test.describe("Element Text Content", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect text content", async () => {
    await dom.byId("visible-element").toHaveTextContent("Visible Element");
  });

  test("should detect partial text content", async () => {
    await dom.byId("visible-element").toContainText("Visible");
  });
});
