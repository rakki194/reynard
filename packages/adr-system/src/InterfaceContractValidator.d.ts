/**
 * Interface Contract Validator - Advanced Interface Contract Compliance and Validation
 *
 * This module provides comprehensive validation of interface contracts,
 * ensuring API stability, backward compatibility, and contract compliance.
 */
export interface InterfaceContract {
    id: string;
    name: string;
    version: string;
    filePath: string;
    lineNumber: number;
    type: "interface" | "type" | "class" | "api-endpoint";
    properties: ContractProperty[];
    methods: ContractMethod[];
    events: ContractEvent[];
    metadata: {
        isExported: boolean;
        isPublic: boolean;
        documentation?: string;
        tags?: string[];
        stability: "experimental" | "beta" | "stable" | "deprecated";
        lastModified: string;
        breakingChanges: BreakingChange[];
    };
}
export interface ContractProperty {
    name: string;
    type: string;
    isOptional: boolean;
    isReadonly: boolean;
    defaultValue?: any;
    documentation?: string;
    constraints?: PropertyConstraint[];
    version: string;
    deprecated?: {
        since: string;
        reason: string;
        replacement?: string;
    };
}
export interface ContractMethod {
    name: string;
    parameters: ContractParameter[];
    returnType: string;
    isAsync: boolean;
    isOptional: boolean;
    documentation?: string;
    version: string;
    sideEffects: string[];
    deprecated?: {
        since: string;
        reason: string;
        replacement?: string;
    };
}
export interface ContractParameter {
    name: string;
    type: string;
    isOptional: boolean;
    defaultValue?: any;
    documentation?: string;
    constraints?: ParameterConstraint[];
}
export interface ContractEvent {
    name: string;
    type: string;
    documentation?: string;
    version: string;
    deprecated?: {
        since: string;
        reason: string;
        replacement?: string;
    };
}
export interface PropertyConstraint {
    type: "min" | "max" | "pattern" | "enum" | "required" | "format";
    value: any;
    message: string;
}
export interface ParameterConstraint {
    type: "min" | "max" | "pattern" | "enum" | "required" | "format";
    value: any;
    message: string;
}
export interface BreakingChange {
    type: "property-removed" | "property-added" | "property-type-changed" | "method-removed" | "method-added" | "method-signature-changed" | "parameter-added" | "parameter-removed" | "parameter-type-changed";
    description: string;
    impact: "low" | "medium" | "high" | "critical";
    migration: string;
    version: string;
    detectedAt: string;
}
export interface ContractViolation {
    id: string;
    type: "breaking-change" | "contract-violation" | "compatibility-issue" | "documentation-missing" | "version-mismatch";
    severity: "low" | "medium" | "high" | "critical";
    contract: string;
    description: string;
    location: string;
    suggestion: string;
    impact: {
        backwardCompatibility: number;
        forwardCompatibility: number;
        stability: number;
        usability: number;
    };
    examples: string[];
    detectedAt: string;
}
export interface ContractValidationReport {
    overallCompliance: number;
    totalContracts: number;
    compliantContracts: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    breakingChanges: BreakingChange[];
    topViolations: ContractViolation[];
    compatibilityMatrix: {
        backwardCompatible: number;
        forwardCompatible: number;
        breakingChanges: number;
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    versioning: {
        currentVersion: string;
        nextVersion: string;
        recommendedVersion: string;
        versioningStrategy: string;
    };
}
export declare class InterfaceContractValidator {
    private readonly codebasePath;
    private readonly contractCache;
    private readonly violationCache;
    private readonly versionHistory;
    constructor(codebasePath: string);
    /**
     * Perform comprehensive interface contract validation
     */
    validateInterfaceContracts(): Promise<ContractValidationReport>;
    /**
     * Validate a specific interface contract
     */
    validateContract(contract: InterfaceContract): Promise<ContractViolation[]>;
    /**
     * Get contract violations for a specific interface
     */
    getContractViolations(contractId: string): ContractViolation[];
    /**
     * Get breaking changes for a specific contract
     */
    getBreakingChanges(contractId: string): BreakingChange[];
    /**
     * Check if a contract is compliant
     */
    isContractCompliant(contractId: string): boolean;
    /**
     * Get contracts that need immediate attention
     */
    getCriticalContracts(): Array<{
        contract: InterfaceContract;
        violations: ContractViolation[];
    }>;
    /**
     * Generate contract improvement suggestions
     */
    generateContractSuggestions(contractId: string): string[];
    /**
     * Get contract version history
     */
    getContractVersionHistory(contractId: string): InterfaceContract[];
    /**
     * Compare two contract versions
     */
    compareContractVersions(contractId: string, version1: string, version2: string): {
        changes: BreakingChange[];
        additions: string[];
        removals: string[];
        modifications: string[];
    };
    private discoverInterfaceContracts;
    private discoverFiles;
    private extractInterfaceContracts;
    private parseInterfaceContract;
    private parseContractProperty;
    private parseContractMethod;
    private parseContractParameters;
    private validateDocumentation;
    private validateVersioning;
    private validateStability;
    private validateBreakingChanges;
    private validateCompatibility;
    private detectBreakingChanges;
    private compareContracts;
    private methodSignaturesDiffer;
    private generateContractValidationReport;
    private generateRecommendations;
    private determineVersioningStrategy;
    private isExported;
    private isPublic;
    private extractDocumentation;
    private extractTags;
    private extractVersion;
    private extractStability;
    private extractInlineDocumentation;
    private extractPropertyConstraints;
    private extractParameterConstraints;
    private extractSideEffects;
    private generateContractId;
    private generateViolationId;
}
