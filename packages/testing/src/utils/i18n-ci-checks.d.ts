/**
 * CI/CD i18n Checks
 * Automated i18n validation for continuous integration
 */
export interface I18nCIConfig {
    /** Packages to check */
    packages: string[];
    /** Locales to validate */
    locales: string[];
    /** Whether to fail on hardcoded strings */
    failOnHardcodedStrings: boolean;
    /** Whether to fail on missing translations */
    failOnMissingTranslations: boolean;
    /** Whether to fail on RTL issues */
    failOnRTLIssues: boolean;
    /** Whether to generate coverage report */
    generateCoverageReport: boolean;
    /** Whether to upload results to external service */
    uploadResults: boolean;
}
export interface I18nCIResult {
    success: boolean;
    hardcodedStrings: number;
    missingTranslations: number;
    rtlIssues: number;
    coverage: number;
    duration: number;
    errors: string[];
    warnings: string[];
}
/**
 * Run i18n checks in CI environment
 */
export declare function runI18nCIChecks(config: I18nCIConfig): Promise<I18nCIResult>;
/**
 * Create GitHub Actions workflow
 */
export declare function createGitHubActionsWorkflow(): string;
/**
 * Create GitLab CI configuration
 */
export declare function createGitLabCIConfig(): string;
