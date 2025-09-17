/**
 * 🦊 Reynard Quality Gate Evaluator
 *
 * *whiskers twitch with strategic intelligence* Evaluates quality gates
 * with fox-like precision and cunning.
 */
export class QualityGateEvaluator {
    constructor() {
        Object.defineProperty(this, "qualityGates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.initializeDefaultQualityGates();
    }
    /**
     * 🦊 Evaluate quality gates
     */
    evaluateQualityGates(metrics) {
        const results = [];
        for (const gate of this.qualityGates) {
            if (!gate.enabled)
                continue;
            for (const condition of gate.conditions) {
                const actualValue = metrics[condition.metric];
                const threshold = condition.threshold;
                let status = "PASSED";
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
    determineQualityGateStatus(results) {
        const failed = results.filter(r => r.status === "FAILED");
        const warned = results.filter(r => r.status === "WARN");
        if (failed.length > 0)
            return "FAILED";
        if (warned.length > 0)
            return "WARN";
        return "PASSED";
    }
    /**
     * 🦊 Add custom quality gate
     */
    addQualityGate(gate) {
        this.qualityGates.push(gate);
    }
    /**
     * 🦊 Remove quality gate
     */
    removeQualityGate(gateId) {
        this.qualityGates = this.qualityGates.filter(gate => gate.id !== gateId);
    }
    /**
     * 🦊 Get all quality gates
     */
    getQualityGates() {
        return [...this.qualityGates];
    }
    /**
     * 🦦 Initialize default quality gates
     */
    initializeDefaultQualityGates() {
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
                ],
            },
        ];
    }
}
