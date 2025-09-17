/**
 * ADR Generator - Intelligent ADR Creation and Management
 *
 * This module provides intelligent ADR generation capabilities based on
 * codebase analysis and architectural patterns.
 */
import { ADRSuggestion } from "./CodebaseAnalyzer";
import { ADRTemplate } from "./types";
export declare class ADRGenerator {
    private readonly templates;
    private readonly adrDirectory;
    private readonly templateDirectory;
    constructor(adrDirectory: string, templateDirectory: string);
    /**
     * Generate ADR from suggestion
     */
    generateADRFromSuggestion(suggestion: ADRSuggestion): Promise<string>;
    /**
     * Generate multiple ADRs from suggestions
     */
    generateMultipleADRs(suggestions: ADRSuggestion[]): Promise<string[]>;
    /**
     * Generate ADR content from template and suggestion
     */
    private generateADRContent;
    /**
     * Get the next available ADR ID
     */
    private getNextADRId;
    /**
     * Sanitize title for filename
     */
    private sanitizeTitle;
    /**
     * Initialize ADR templates
     */
    private initializeTemplates;
    /**
     * Get available templates
     */
    getAvailableTemplates(): ADRTemplate[];
    /**
     * Get template by name
     */
    getTemplate(name: string): ADRTemplate | undefined;
    /**
     * Add custom template
     */
    addTemplate(template: ADRTemplate): void;
}
