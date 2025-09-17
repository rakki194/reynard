/**
 * Code Example Parser
 *
 * Extracts and parses code examples from markdown documentation
 */
export interface CodeExample {
    /** The extracted code block */
    code: string;
    /** Line number in the documentation */
    lineNumber: number;
    /** Test description derived from context */
    description: string;
    /** Whether this is a TypeScript example */
    isTypeScript: boolean;
    /** Whether this is a component example */
    isComponent: boolean;
}
/**
 * Extract code examples from markdown documentation
 */
export declare function extractCodeExamples(docPath: string): CodeExample[];
