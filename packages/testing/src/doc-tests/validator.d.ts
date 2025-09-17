/**
 * Documentation Example Validator
 *
 * Validates code examples and generates reports
 */
export interface ValidationResult {
    valid: number;
    invalid: number;
    errors: string[];
}
/**
 * Validate that all code examples in documentation are syntactically correct
 */
export declare function validateDocExamples(docPath: string): ValidationResult;
/**
 * Generate a documentation test report
 */
export declare function generateDocTestReport(docPath: string): string;
