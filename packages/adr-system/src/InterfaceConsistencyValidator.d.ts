/**
 * Interface Consistency Validator - Advanced Interface Design and Consistency Analysis
 *
 * This module provides comprehensive validation of interface consistency,
 * ensuring proper API design, contract compliance, and architectural patterns.
 */
export interface InterfaceDefinition {
    name: string;
    type: "interface" | "type" | "class" | "function" | "api-endpoint";
    filePath: string;
    lineNumber: number;
    properties: InterfaceProperty[];
    methods: InterfaceMethod[];
    extends?: string[];
    implements?: string[];
    metadata: {
        isExported: boolean;
        isPublic: boolean;
        documentation?: string;
        tags?: string[];
        version?: string;
    };
}
export interface InterfaceProperty {
    name: string;
    type: string;
    isOptional: boolean;
    isReadonly: boolean;
    defaultValue?: any;
    documentation?: string;
}
export interface InterfaceMethod {
    name: string;
    parameters: MethodParameter[];
    returnType: string;
    isAsync: boolean;
    isOptional: boolean;
    documentation?: string;
}
export interface MethodParameter {
    name: string;
    type: string;
    isOptional: boolean;
    defaultValue?: any;
    documentation?: string;
}
export interface ConsistencyViolation {
    id: string;
    type: "naming" | "structure" | "documentation" | "versioning" | "contract" | "pattern";
    severity: "low" | "medium" | "high" | "critical";
    interface: string;
    description: string;
    suggestion: string;
    examples: string[];
    impact: {
        maintainability: number;
        usability: number;
        consistency: number;
        reliability: number;
    };
}
export interface ConsistencyReport {
    overallConsistency: number;
    totalInterfaces: number;
    consistentInterfaces: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    topViolations: ConsistencyViolation[];
    interfaceScores: Map<string, number>;
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    patterns: {
        detected: string[];
        recommended: string[];
        violations: string[];
    };
}
export declare class InterfaceConsistencyValidator {
    private readonly codebasePath;
    private readonly interfaceCache;
    private readonly violationCache;
    private readonly patterns;
    constructor(codebasePath: string);
    /**
     * Perform comprehensive interface consistency validation
     */
    validateInterfaceConsistency(): Promise<ConsistencyReport>;
    /**
     * Validate a specific interface
     */
    validateInterface(interfaceDef: InterfaceDefinition): Promise<ConsistencyViolation[]>;
    /**
     * Get consistency score for a specific interface
     */
    getInterfaceScore(interfaceName: string): number;
    /**
     * Get violations for a specific interface
     */
    getInterfaceViolations(interfaceName: string): ConsistencyViolation[];
    /**
     * Check if an interface is consistent
     */
    isInterfaceConsistent(interfaceName: string): boolean;
    /**
     * Get interfaces that need immediate attention
     */
    getCriticalInterfaces(): Array<{
        interface: InterfaceDefinition;
        violations: ConsistencyViolation[];
    }>;
    /**
     * Generate interface improvement suggestions
     */
    generateImprovementSuggestions(interfaceName: string): string[];
    private discoverInterfaces;
    private discoverFiles;
    private extractInterfaces;
    private parseInterface;
    private parseProperty;
    private parseMethod;
    private parseParameters;
    private validateNamingConsistency;
    private validateStructureConsistency;
    private validateDocumentationConsistency;
    private validateVersioningConsistency;
    private validateContractConsistency;
    private validatePatternConsistency;
    private calculateInterfaceScore;
    private generateConsistencyReport;
    private generateGlobalRecommendations;
    private detectPatterns;
    private isExported;
    private isPublic;
    private extractDocumentation;
    private extractTags;
    private extractVersion;
    private extractInlineDocumentation;
    private generateViolationId;
}
