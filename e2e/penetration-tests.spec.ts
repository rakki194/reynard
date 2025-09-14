/**
 * 🐺 PENETRATION TESTING E2E SUITE - MODULAR VERSION
 *
 * *snarls with predatory glee* Modular integration of fenrir exploits with E2E 
 * authentication tests for comprehensive security testing of the Reynard ecosystem.
 * 
 * This file orchestrates all penetration testing suites while maintaining
 * the 140-line axiom through modular architecture.
 */

import { test } from "@playwright/test";

// Import all test suites
import "./suites/jwt-security.spec";
import "./suites/sql-injection.spec";
import "./suites/path-traversal.spec";
import "./suites/api-security.spec";
import "./suites/fuzzing-tests.spec";
import "./suites/advanced-attacks.spec";
import "./suites/comprehensive-assessment.spec";

test.describe("🐺 Penetration Testing Suite - Modular", () => {
  test.beforeAll(async () => {
    console.log("🐺 Initializing modular penetration testing suite...");
    console.log("All security test suites loaded and ready for execution.");
  });

  test.afterAll(async () => {
    console.log("🐺 Penetration testing suite completed.");
    console.log("Review results for any security vulnerabilities found.");
  });
});
