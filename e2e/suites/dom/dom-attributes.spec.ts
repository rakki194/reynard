/**
 * DOM Element Attributes Tests
 *
 * Tests for element attributes, classes, and text content.
 *
 * @author 🦊 The Cunning Fox
 */

import { expect, test } from "@playwright/test";
import { addElementAttribute, changeElementText, loadDomTestPage } from "../../modules/dom";

test.describe("DOM Element Classes", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect single class", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).toHaveClass("visible");
  });

  test("should detect multiple classes", async ({ page }) => {
    const element = page.locator("#multi-class");
    await expect(element).toHaveClass(/class1/);
    await expect(element).toHaveClass(/class2/);
    await expect(element).toHaveClass(/class3/);
  });
});

test.describe("DOM Element Attributes", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect data attributes", async ({ page }) => {
    const element = page.locator("#attributed-element");
    await expect(element).toHaveAttribute("data-testid", "test-element");
    await expect(element).toHaveAttribute("data-value", "123");
  });

  test("should detect multiple attributes", async ({ page }) => {
    const element = page.locator("#attributed-element");
    await expect(element).toHaveAttribute("id", "attributed-element");
    await expect(element).toHaveAttribute("data-testid", "test-element");
  });

  test("should handle dynamic attribute changes", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).not.toHaveAttribute("data-test");

    // Add an attribute
    await addElementAttribute(page, "#visible-element", "data-test", "dynamic");

    await expect(element).toHaveAttribute("data-test", "dynamic");
  });
});

test.describe("DOM Element Text Content", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect text content", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).toHaveText("Visible Element");
  });

  test("should detect partial text content", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).toContainText("Visible");
  });

  test("should handle dynamic content changes", async ({ page }) => {
    const element = page.locator("#visible-element");
    await expect(element).toHaveText("Visible Element");

    // Change the text content
    await changeElementText(page, "#visible-element", "Changed Text");

    await expect(element).toHaveText("Changed Text");
  });
});
