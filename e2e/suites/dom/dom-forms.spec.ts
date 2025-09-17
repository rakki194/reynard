/**
 * DOM Form Element Tests
 *
 * Tests for form element states and validation.
 *
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { loadDomTestPage } from "../../modules/dom";

test.describe("DOM Form Element States", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect disabled elements", async ({ page }) => {
    const element = page.locator("#disabled-input");
    await expect(element).toBeDisabled();
  });

  test("should detect enabled elements", async ({ page }) => {
    const element = page.locator("#text-input");
    await expect(element).toBeEnabled();
  });

  test("should detect required elements", async ({ page }) => {
    const element = page.locator("#required-input");
    await expect(element).toHaveAttribute("required");
  });

  test("should detect valid elements", async ({ page }) => {
    const element = page.locator("#valid-input");
    await expect(element).toHaveJSProperty("validity.valid", true);
  });

  test("should detect invalid elements", async ({ page }) => {
    const element = page.locator("#invalid-input");
    await expect(element).toHaveJSProperty("validity.valid", false);
  });
});

test.describe("DOM Checkbox States", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect checked checkboxes", async ({ page }) => {
    const element = page.locator("#checked-checkbox");
    await expect(element).toBeChecked();
  });

  test("should detect unchecked checkboxes", async ({ page }) => {
    const element = page.locator("#unchecked-checkbox");
    await expect(element).not.toBeChecked();
  });

  test("should detect partially checked checkboxes", async ({ page }) => {
    const element = page.locator("#partial-checkbox");
    await expect(element).toHaveJSProperty("indeterminate", true);
  });
});
