/**
 * Test Code Generator
 *
 * Creates testable code from documentation examples
 */
import type { CodeExample } from "./code-parser.js";
/**
 * Create a test-safe version of code by wrapping it in proper test structure
 */
export declare function createTestableCode(example: CodeExample, packageName: string): string;
