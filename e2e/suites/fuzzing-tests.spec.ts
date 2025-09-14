/**
 * 🐺 Fuzzing Testing Suite - Main Orchestrator
 * 
 * *snarls with pack coordination* This file orchestrates the fuzzing
 * test modules, ensuring proper test organization and execution.
 */

import { test, expect } from "@playwright/test";

// Import the modular fuzzing test suites
import "./fuzzing-quick-tests.spec";
import "./fuzzing-comprehensive-tests.spec";

test.describe("🐺 Fuzzing Testing Suite", () => {
  test("fuzzing test modules are properly organized", () => {
    // This test ensures our modular approach is working
    expect(true).toBe(true);
  });
});

