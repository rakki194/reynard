import { test, expect } from "@playwright/test";
import { DocumentationScanner, ExampleValidator } from "../../modules/documentation/index.js";

let scanner: DocumentationScanner;
let validator: ExampleValidator;

test.beforeAll(async () => {
  scanner = new DocumentationScanner(process.cwd());
  validator = new ExampleValidator(process.cwd());
});

test.afterAll(async () => {
  if (validator) {
    await validator.cleanupAll();
  }
});

test("should scan documentation files for code examples", async ({ page }) => {
  // Navigate to the main README to validate it exists
  await page.goto("file://" + process.cwd() + "/README.md");
  await expect(page.locator("body")).toBeVisible();
  
  // Wait a bit to ensure the page is fully loaded
  await page.waitForTimeout(1000);
  
  // Scroll through the page to generate more trace data
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  
  const examples = await scanner.scanFile("README.md");
  expect(examples.length).toBeGreaterThan(0);
  
  // Take a screenshot of the README for the report
  await page.screenshot({ path: "test-results/readme-screenshot.png" });
  
  // Add some console logging to generate trace data
  await page.evaluate(() => console.log("Documentation validation test completed"));
});

test("should validate README.md code examples", async ({ page }) => {
  // Navigate to the main README to validate it exists
  await page.goto("file://" + process.cwd() + "/README.md");
  await expect(page.locator("body")).toBeVisible();
  
  // Wait for page to load and add some interactions
  await page.waitForTimeout(1000);
  
  // Click on some elements to generate more trace data
  const headings = await page.locator("h1, h2, h3").all();
  if (headings.length > 0) {
    await headings[0].click();
    await page.waitForTimeout(300);
  }
  
  const examples = await scanner.scanFile("README.md");
  const executableExamples = examples.filter(example => example.isExecutable);
  
  if (executableExamples.length > 0) {
    const results = await validator.validateExamples(executableExamples, 2);
    const stats = validator.getValidationStats(results);
    expect(stats.successful).toBeGreaterThan(0);
    
    // Take a screenshot showing the validation results
    await page.screenshot({ path: "test-results/validation-results.png" });
    
    // Add console logging for trace data
    await page.evaluate((stats) => {
      console.log(`Validation completed: ${stats.successful} successful, ${stats.failed} failed`);
    }, stats);
  }
});