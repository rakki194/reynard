/**
 * Test setup for reynard-games package
 */

// Using reynard-testing instead of jest-dom
import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

// Clean up after each test
afterEach(() => {
  cleanup();
});
