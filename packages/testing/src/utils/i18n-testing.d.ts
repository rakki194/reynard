/**
 * i18n Testing Utilities
 * Comprehensive tools for testing internationalization across Reynard packages
 */
export interface I18nTestConfig {
    /** List of packages to test */
    packages: string[];
    /** Locales to test */
    locales: string[];
    /** Whether to check for hardcoded strings */
    checkHardcodedStrings: boolean;
    /** Whether to validate translation completeness */
    validateCompleteness: boolean;
    /** Whether to test pluralization */
    testPluralization: boolean;
    /** Whether to test RTL support */
    testRTL: boolean;
    /** Custom ignore patterns for hardcoded strings */
    ignorePatterns: string[];
}
export interface HardcodedStringResult {
    file: string;
    line: number;
    column: number;
    text: string;
    severity: "error" | "warning";
    suggestion?: string;
}
export interface TranslationValidationResult {
    locale: string;
    missingKeys: string[];
    unusedKeys: string[];
    incompleteTranslations: string[];
    pluralizationIssues: string[];
}
export interface I18nTestResult {
    hardcodedStrings: HardcodedStringResult[];
    translationValidation: TranslationValidationResult[];
    rtlIssues: string[];
    performanceMetrics: {
        loadTime: number;
        memoryUsage: number;
    };
}
/**
 * Detect hardcoded strings in JSX/TSX files
 */
export declare function detectHardcodedStrings(filePath: string, content: string, config: I18nTestConfig): HardcodedStringResult[];
/**
 * Validate translation completeness across locales
 */
export declare function validateTranslations(config: I18nTestConfig): Promise<TranslationValidationResult[]>;
/**
 * Test RTL support
 */
export declare function testRTLSupport(config: I18nTestConfig): string[];
/**
 * Run comprehensive i18n tests
 */
export declare function runI18nTests(config: I18nTestConfig): Promise<I18nTestResult>;
/**
 * Generate i18n test report
 */
export declare function generateI18nReport(result: I18nTestResult): string;
