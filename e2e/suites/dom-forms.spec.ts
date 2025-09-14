/**
 * DOM Form Element Tests
 * 
 * Focused tests for form element state assertions.
 * 
 * @author 🦊 The Cunning Fox
 */

import { test } from "@playwright/test";
import { createDOMAssertions, createTestPage } from "../utils/dom-assertion-helpers";

test.describe("Form Element States", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect disabled elements", async () => {
    await dom.byId("disabled-input").toBeDisabled();
  });

  test("should detect enabled elements", async () => {
    await dom.byId("text-input").toBeEnabled();
  });

  test("should detect required elements", async () => {
    await dom.byId("required-input").toBeRequired();
  });

  test("should detect valid elements", async () => {
    await dom.byId("valid-input").toBeValid();
  });

  test("should detect invalid elements", async () => {
    await dom.byId("invalid-input").toBeInvalid();
  });
});

test.describe("Checkbox States", () => {
  let dom: ReturnType<typeof createDOMAssertions>;

  test.beforeEach(async ({ page }) => {
    await createTestPage(page);
    dom = createDOMAssertions(page);
  });

  test("should detect checked checkboxes", async () => {
    await dom.byId("checked-checkbox").toBeChecked();
  });

  test("should detect unchecked checkboxes", async () => {
    await dom.byId("unchecked-checkbox").notToBeChecked();
  });

  test("should detect partially checked checkboxes", async () => {
    await dom.byId("partial-checkbox").toBePartiallyChecked();
  });
});

