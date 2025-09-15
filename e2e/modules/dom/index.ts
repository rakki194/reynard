/**
 * DOM Testing Module - Barrel Export
 *
 * 🦦 *splashes with DOM testing precision* Clean exports for all
 * DOM testing utilities in the Reynard e2e testing framework.
 */

// DOM assertion helpers
export { DOMAssertions, createDOMAssertions } from "./dom-assertion-helpers";
export { DOMElementAssertions } from "./dom-element-assertions";

// DOM test utilities
export {
  addElementAttribute,
  changeElementStyle,
  changeElementText,
  loadDomTestPage,
  removeElement,
} from "./dom-test-helpers";

// DOM test page utilities
export { createTestPage } from "./dom-test-page-utils";
