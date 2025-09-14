/**
 * 🐺 Advanced Attack Testing Suite
 * 
 * *snarls with predatory sophistication* Advanced security attack
 * vectors for comprehensive penetration testing of the Reynard system.
 */

import { test } from "@playwright/test";
import "./csrf-attacks.spec";
import "./ssrf-attacks.spec";
import "./race-condition-attacks.spec";
import "./http-smuggling-attacks.spec";
import "./unicode-attacks.spec";

test.describe("🐺 Advanced Attack Testing", () => {
  // This suite now imports and orchestrates all advanced attack tests
  // Each attack type is tested in its own focused module
});

