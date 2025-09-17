/**
 * ADR Validator - Automated ADR Validation and Quality Assurance
 *
 * This module provides comprehensive validation of ADR documents to ensure
 * they meet quality standards and follow best practices.
 */
import { ADRValidationResult } from "./types";
export declare class ADRValidator {
    private readonly adrDirectory;
    private readonly validationRules;
    constructor(adrDirectory: string);
    /**
     * Validate a single ADR file
     */
    validateADR(filePath: string): Promise<ADRValidationResult>;
    /**
     * Validate all ADRs in the directory
     */
    validateAllADRs(): Promise<Map<string, ADRValidationResult>>;
    /**
     * Parse ADR content into structured format
     */
    private parseADR;
    /**
     * Set section content in ADR object
     */
    private setSectionContent;
    /**
     * Extract status from content
     */
    private extractStatus;
    /**
     * Parse consequences section
     */
    private parseConsequences;
    /**
     * Initialize validation rules
     */
    private initializeValidationRules;
}
