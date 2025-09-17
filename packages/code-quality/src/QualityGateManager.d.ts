/**
 * 🦊 Reynard Quality Gate Manager
 *
 * *whiskers twitch with precision* Manages quality gates and thresholds
 * for the Reynard code quality analysis system. Provides configurable
 * quality standards that can be enforced across different environments.
 */
import { EventEmitter } from "events";
export interface QualityGateCondition {
    metric: string;
    operator: "GT" | "LT" | "EQ" | "NE" | "GTE" | "LTE";
    threshold: number | string;
    errorThreshold?: number | string;
    warningThreshold?: number | string;
    description?: string;
}
export interface QualityGate {
    id: string;
    name: string;
    description?: string;
    conditions: QualityGateCondition[];
    enabled: boolean;
    environment: "development" | "staging" | "production" | "all";
    createdAt: Date;
    updatedAt: Date;
}
export interface QualityGateResult {
    gateId: string;
    gateName: string;
    status: "PASSED" | "FAILED" | "WARN";
    conditions: QualityGateConditionResult[];
    overallScore: number;
    passedConditions: number;
    totalConditions: number;
    failedConditions: number;
    warningConditions: number;
}
export interface QualityGateConditionResult {
    condition: QualityGateCondition;
    status: "PASSED" | "FAILED" | "WARN";
    actualValue: number | string;
    threshold: number | string;
    message: string;
}
export interface QualityGateConfiguration {
    gates: QualityGate[];
    defaultGate: string;
    environments: {
        development: string;
        staging: string;
        production: string;
    };
}
export declare class QualityGateManager extends EventEmitter {
    private configuration;
    private readonly configPath;
    constructor(projectRoot: string);
    /**
     * 🦊 Load quality gate configuration from file
     */
    loadConfiguration(): Promise<void>;
    /**
     * 🦦 Save quality gate configuration to file
     */
    saveConfiguration(): Promise<void>;
    /**
     * 🐺 Evaluate quality gates against metrics
     */
    evaluateQualityGates(metrics: Record<string, any>, environment?: string): QualityGateResult[];
    /**
     * 🦊 Evaluate a single quality gate
     */
    private evaluateGate;
    /**
     * 🦦 Evaluate a single condition
     */
    private evaluateCondition;
    /**
     * 🐺 Compare values based on operator
     */
    private compareValues;
    /**
     * 🦊 Add a new quality gate
     */
    addQualityGate(gate: Omit<QualityGate, "createdAt" | "updatedAt">): Promise<void>;
    /**
     * 🦦 Update an existing quality gate
     */
    updateQualityGate(gateId: string, updates: Partial<QualityGate>): Promise<void>;
    /**
     * 🐺 Remove a quality gate
     */
    removeQualityGate(gateId: string): Promise<void>;
    /**
     * 🦊 Get all quality gates
     */
    getQualityGates(): QualityGate[];
    /**
     * 🦦 Get quality gate by ID
     */
    getQualityGate(gateId: string): QualityGate | null;
    /**
     * 🐺 Get quality gates for environment
     */
    getQualityGatesForEnvironment(environment: string): QualityGate[];
    /**
     * 🦊 Set default quality gate
     */
    setDefaultQualityGate(gateId: string): Promise<void>;
    /**
     * 🦦 Get default quality gate
     */
    getDefaultQualityGate(): QualityGate | null;
    /**
     * 🐺 Create Reynard-specific quality gates
     */
    createReynardQualityGates(): Promise<void>;
    /**
     * 🦊 Get default configuration
     */
    private getDefaultConfiguration;
    /**
     * 🦦 Export quality gate configuration
     */
    exportConfiguration(): QualityGateConfiguration;
    /**
     * 🐺 Import quality gate configuration
     */
    importConfiguration(config: QualityGateConfiguration): Promise<void>;
    /**
     * 🦊 Validate quality gate configuration
     */
    validateConfiguration(): {
        valid: boolean;
        errors: string[];
    };
}
