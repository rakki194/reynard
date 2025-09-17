/**
 * @fileoverview README processing utilities
 */
/**
 * Processes and extracts content from README files
 */
export declare class ReadmeProcessor {
    /**
     * Check if a README is rich enough to use directly
     */
    isRichReadme(readme: string): boolean;
    /**
     * Extract quick start section from README
     */
    extractQuickStartFromReadme(readme: string): string;
}
