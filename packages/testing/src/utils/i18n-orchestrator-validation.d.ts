/**
 * Validation for i18n Package Testing Setup
 */
/**
 * Validate that all packages have proper i18n setup
 */
export declare function validatePackageI18nSetup(): Promise<{
    valid: boolean;
    issues: string[];
}>;
