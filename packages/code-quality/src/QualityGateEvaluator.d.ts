/**
 * 🦊 Reynard Quality Gate Evaluator
 *
 * *whiskers twitch with strategic intelligence* Evaluates quality gates
 * with fox-like precision and cunning.
 */
import { CodeQualityMetrics, QualityGate, QualityGateResult } from "./types";
export declare class QualityGateEvaluator {
    private qualityGates;
    constructor();
    /**
     * 🦊 Evaluate quality gates
     */
    evaluateQualityGates(metrics: CodeQualityMetrics): QualityGateResult[];
    /**
     * 🦊 Determine overall quality gate status
     */
    determineQualityGateStatus(results: QualityGateResult[]): "PASSED" | "FAILED" | "WARN";
    /**
     * 🦊 Add custom quality gate
     */
    addQualityGate(gate: QualityGate): void;
    /**
     * 🦊 Remove quality gate
     */
    removeQualityGate(gateId: string): void;
    /**
     * 🦊 Get all quality gates
     */
    getQualityGates(): QualityGate[];
    /**
     * 🦦 Initialize default quality gates
     */
    private initializeDefaultQualityGates;
}
