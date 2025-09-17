/**
 * Documentation Test Runner
 *
 * Executes tests from documentation examples
 */
export interface DocTestConfig {
    /** Path to the documentation file */
    docPath: string;
    /** Package name for imports */
    packageName: string;
    /** Additional setup code to run before each test */
    setup?: string;
    /** Custom test environment setup */
    environment?: "jsdom" | "node";
}
/**
 * Run documentation tests for a package
 */
export declare function runDocTests(config: DocTestConfig): void;
/**
 * Create a documentation test file for a package
 */
export declare function createDocTestFile(config: DocTestConfig): string;
