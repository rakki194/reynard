/**
 * 🦊 Reynard Quality Gate Evaluator
 *
 * *whiskers twitch with strategic intelligence* Evaluates quality gates
 * with fox-like precision and cunning.
 */

import { CodeQualityMetrics, QualityGate, QualityGateResult } from "./types";

export class QualityGateEvaluator {
  private qualityGates: QualityGate[] = [];

  constructor() {
    this.initializeDefaultQualityGates();
  }

  /**
   * 🦊 Evaluate quality gates
   */
  evaluateQualityGates(metrics: CodeQualityMetrics): QualityGateResult[] {
    const results: QualityGateResult[] = [];

    for (const gate of this.qualityGates) {
      if (!gate.enabled) continue;

      for (const condition of gate.conditions) {
        const actualValue = metrics[condition.metric];
        const threshold = condition.threshold;

        let status: "PASSED" | "FAILED" | "WARN" = "PASSED";

        if (typeof actualValue === "number" && typeof threshold === "number") {
          switch (condition.operator) {
            case "GT":
              status = actualValue > threshold ? "FAILED" : "PASSED";
              break;
            case "LT":
              status = actualValue < threshold ? "FAILED" : "PASSED";
              break;
            case "EQ":
              status = actualValue === threshold ? "PASSED" : "FAILED";
              break;
            case "NE":
              status = actualValue !== threshold ? "PASSED" : "FAILED";
              break;
          }
        }

        results.push({
          condition,
          status,
          actualValue,
          threshold,
        });
      }
    }

    return results;
  }

  /**
   * 🦊 Determine overall quality gate status
   */
  determineQualityGateStatus(results: QualityGateResult[]): "PASSED" | "FAILED" | "WARN" {
    const failed = results.filter(r => r.status === "FAILED");
    const warned = results.filter(r => r.status === "WARN");

    if (failed.length > 0) return "FAILED";
    if (warned.length > 0) return "WARN";
    return "PASSED";
  }

  /**
   * 🦊 Add custom quality gate
   */
  addQualityGate(gate: QualityGate): void {
    this.qualityGates.push(gate);
  }

  /**
   * 🦊 Remove quality gate
   */
  removeQualityGate(gateId: string): void {
    this.qualityGates = this.qualityGates.filter(gate => gate.id !== gateId);
  }

  /**
   * 🦊 Get all quality gates
   */
  getQualityGates(): QualityGate[] {
    return [...this.qualityGates];
  }

  /**
   * 🦦 Initialize default quality gates
   */
  private initializeDefaultQualityGates(): void {
    this.qualityGates = [
      {
        id: "reynard-default",
        name: "Reynard Default Quality Gate",
        enabled: true,
        conditions: [
          {
            metric: "bugs",
            operator: "EQ",
            threshold: 0,
          },
          {
            metric: "vulnerabilities",
            operator: "EQ",
            threshold: 0,
          },
          {
            metric: "codeSmells",
            operator: "LT",
            threshold: 100,
          },
          {
            metric: "cyclomaticComplexity",
            operator: "LT",
            threshold: 1000,
          },
          {
            metric: "maintainabilityIndex",
            operator: "GT",
            threshold: 70,
          },
          {
            metric: "criticalJunkFiles",
            operator: "EQ",
            threshold: 0,
          },
          {
            metric: "highJunkFiles",
            operator: "LT",
            threshold: 5,
          },
          {
            metric: "junkFileQualityScore",
            operator: "GT",
            threshold: 80,
          },
        ],
      },
    ];
  }
}
