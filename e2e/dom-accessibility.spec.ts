/**
 * DOM Accessibility Tests
 * 
 * Tests for accessibility attributes and roles.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test, expect } from "@playwright/test";
import { loadDomTestPage } from "./utils/dom-test-helpers";

test.describe("DOM Element Roles", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect element roles", async ({ page }) => {
    const element = page.locator("#button-role");
    await expect(element).toHaveAttribute("role", "button");
  });

  test("should detect different roles", async ({ page }) => {
    const element = page.locator("#link-role");
    await expect(element).toHaveAttribute("role", "link");
  });
});

test.describe("DOM Accessible Names", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect aria-label", async ({ page }) => {
    const element = page.locator("#named-button");
    await expect(element).toHaveAttribute("aria-label", "Submit Form");
  });

  test("should detect labeled inputs", async ({ page }) => {
    const element = page.locator("#labeled-input");
    await expect(element).toHaveAttribute("aria-label", "Email Address");
  });
});

test.describe("DOM Accessible Descriptions", () => {
  test.beforeEach(async ({ page }) => {
    await loadDomTestPage(page);
  });

  test("should detect aria-describedby", async ({ page }) => {
    const element = page.locator("#described-input");
    await expect(element).toHaveAttribute("aria-describedby", "description");
    
    // Check that the described element exists and has the right content
    const description = page.locator("#description");
    await expect(description).toHaveText("Enter your email address");
  });

  test("should detect title attributes", async ({ page }) => {
    const element = page.locator("#titled-button");
    await expect(element).toHaveAttribute("title", "Click to submit");
  });
});
