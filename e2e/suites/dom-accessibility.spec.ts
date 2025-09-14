/**
 * DOM Accessibility Tests
 * 
 * Focused tests for accessibility assertions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test } from "@playwright/test";
import { createDOMAssertions, createTestPage } from "../utils/dom-assertion-helpers";

test.describe("Element Roles", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect element roles", async () => {
    await dom.byId("button-role").toHaveRole("button");
  });

  test("should detect different roles", async () => {
    await dom.byId("link-role").toHaveRole("link");
  });
});

test.describe("Accessible Names", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect aria-label", async () => {
    await dom.byId("named-button").toHaveAccessibleName("Submit Form");
  });

  test("should detect labeled inputs", async () => {
    await dom.byId("labeled-input").toHaveAccessibleName("Email Address");
  });
});

test.describe("Accessible Descriptions", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect aria-describedby", async () => {
    await dom.byId("described-input").toHaveAccessibleDescription("Enter your email address");
  });

  test("should detect title attributes", async () => {
    await dom.byId("titled-button").toHaveAccessibleDescription("Click to submit");
  });
});

