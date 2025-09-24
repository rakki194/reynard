/**
 * Documentation Testing Module Barrel Export
 *
 * Provides a centralized export point for all documentation testing utilities,
 * following the modular architecture pattern for easy importing.
 */

// Core Classes
export { DocumentationScanner } from "./doc-scanner.js";
export { ExampleValidator } from "./example-validator.js";

// Type Definitions
export type { ICodeExample, ValidationRule } from "./doc-scanner.js";
export type { IValidationResult, ITestEnvironment } from "./example-validator.js";

