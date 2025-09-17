/**
 * 🦊 Reynard Quality Gate Manager
 *
 * *whiskers twitch with precision* Manages quality gates and thresholds
 * for the Reynard code quality analysis system. Provides configurable
 * quality standards that can be enforced across different environments.
 */
import { EventEmitter } from "events";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
export class QualityGateManager extends EventEmitter {
    constructor(projectRoot) {
        super();
        Object.defineProperty(this, "configuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "configPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.configPath = join(projectRoot, ".reynard", "quality-gates.json");
        this.configuration = this.getDefaultConfiguration();
    }
    /**
     * 🦊 Load quality gate configuration from file
     */
    async loadConfiguration() {
        try {
            const configData = await readFile(this.configPath, "utf-8");
            this.configuration = JSON.parse(configData);
            this.emit("configurationLoaded", this.configuration);
        }
        catch (error) {
            console.warn("⚠️ Could not load quality gate configuration, using defaults");
            await this.saveConfiguration();
        }
    }
    /**
     * 🦦 Save quality gate configuration to file
     */
    async saveConfiguration() {
        try {
            await writeFile(this.configPath, JSON.stringify(this.configuration, null, 2));
            this.emit("configurationSaved", this.configuration);
        }
        catch (error) {
            console.error("❌ Failed to save quality gate configuration:", error);
            throw error;
        }
    }
    /**
     * 🐺 Evaluate quality gates against metrics
     */
    evaluateQualityGates(metrics, environment = "all") {
        const results = [];
        for (const gate of this.configuration.gates) {
            if (!gate.enabled)
                continue;
            if (gate.environment !== "all" && gate.environment !== environment)
                continue;
            const result = this.evaluateGate(gate, metrics);
            results.push(result);
        }
        return results;
    }
    /**
     * 🦊 Evaluate a single quality gate
     */
    evaluateGate(gate, metrics) {
        const conditionResults = [];
        let passedConditions = 0;
        let failedConditions = 0;
        let warningConditions = 0;
        for (const condition of gate.conditions) {
            const result = this.evaluateCondition(condition, metrics);
            conditionResults.push(result);
            switch (result.status) {
                case "PASSED":
                    passedConditions++;
                    break;
                case "FAILED":
                    failedConditions++;
                    break;
                case "WARN":
                    warningConditions++;
                    break;
            }
        }
        const totalConditions = gate.conditions.length;
        const overallScore = (passedConditions / totalConditions) * 100;
        let status = "PASSED";
        if (failedConditions > 0) {
            status = "FAILED";
        }
        else if (warningConditions > 0) {
            status = "WARN";
        }
        return {
            gateId: gate.id,
            gateName: gate.name,
            status,
            conditions: conditionResults,
            overallScore,
            passedConditions,
            totalConditions,
            failedConditions,
            warningConditions,
        };
    }
    /**
     * 🦦 Evaluate a single condition
     */
    evaluateCondition(condition, metrics) {
        const actualValue = metrics[condition.metric];
        const threshold = condition.threshold;
        let status = "PASSED";
        let message = "";
        if (actualValue === undefined || actualValue === null) {
            status = "FAILED";
            message = `Metric '${condition.metric}' not found in analysis results`;
        }
        else {
            const comparison = this.compareValues(actualValue, threshold, condition.operator);
            if (comparison === false) {
                status = "FAILED";
                message = `Condition failed: ${condition.metric} ${condition.operator} ${threshold} (actual: ${actualValue})`;
            }
            else if (comparison === "warning") {
                status = "WARN";
                message = `Warning threshold exceeded: ${condition.metric} ${condition.operator} ${threshold} (actual: ${actualValue})`;
            }
            else {
                status = "PASSED";
                message = `Condition passed: ${condition.metric} ${condition.operator} ${threshold} (actual: ${actualValue})`;
            }
        }
        return {
            condition,
            status,
            actualValue,
            threshold,
            message,
        };
    }
    /**
     * 🐺 Compare values based on operator
     */
    compareValues(actual, threshold, operator) {
        // Handle numeric comparisons
        if (typeof actual === "number" && typeof threshold === "number") {
            switch (operator) {
                case "GT":
                    return actual > threshold;
                case "LT":
                    return actual < threshold;
                case "GTE":
                    return actual >= threshold;
                case "LTE":
                    return actual <= threshold;
                case "EQ":
                    return actual === threshold;
                case "NE":
                    return actual !== threshold;
            }
        }
        // Handle string comparisons
        if (typeof actual === "string" && typeof threshold === "string") {
            switch (operator) {
                case "EQ":
                    return actual === threshold;
                case "NE":
                    return actual !== threshold;
                case "GT":
                    return actual > threshold;
                case "LT":
                    return actual < threshold;
                case "GTE":
                    return actual >= threshold;
                case "LTE":
                    return actual <= threshold;
            }
        }
        // Handle boolean comparisons
        if (typeof actual === "boolean" && typeof threshold === "boolean") {
            switch (operator) {
                case "EQ":
                    return actual === threshold;
                case "NE":
                    return actual !== threshold;
            }
        }
        return false;
    }
    /**
     * 🦊 Add a new quality gate
     */
    async addQualityGate(gate) {
        const now = new Date();
        const newGate = {
            ...gate,
            createdAt: now,
            updatedAt: now,
        };
        this.configuration.gates.push(newGate);
        await this.saveConfiguration();
        this.emit("qualityGateAdded", newGate);
    }
    /**
     * 🦦 Update an existing quality gate
     */
    async updateQualityGate(gateId, updates) {
        const gateIndex = this.configuration.gates.findIndex(gate => gate.id === gateId);
        if (gateIndex === -1) {
            throw new Error(`Quality gate with ID '${gateId}' not found`);
        }
        this.configuration.gates[gateIndex] = {
            ...this.configuration.gates[gateIndex],
            ...updates,
            updatedAt: new Date(),
        };
        await this.saveConfiguration();
        this.emit("qualityGateUpdated", this.configuration.gates[gateIndex]);
    }
    /**
     * 🐺 Remove a quality gate
     */
    async removeQualityGate(gateId) {
        const gateIndex = this.configuration.gates.findIndex(gate => gate.id === gateId);
        if (gateIndex === -1) {
            throw new Error(`Quality gate with ID '${gateId}' not found`);
        }
        const removedGate = this.configuration.gates.splice(gateIndex, 1)[0];
        await this.saveConfiguration();
        this.emit("qualityGateRemoved", removedGate);
    }
    /**
     * 🦊 Get all quality gates
     */
    getQualityGates() {
        return [...this.configuration.gates];
    }
    /**
     * 🦦 Get quality gate by ID
     */
    getQualityGate(gateId) {
        return this.configuration.gates.find(gate => gate.id === gateId) || null;
    }
    /**
     * 🐺 Get quality gates for environment
     */
    getQualityGatesForEnvironment(environment) {
        return this.configuration.gates.filter(gate => gate.enabled && (gate.environment === "all" || gate.environment === environment));
    }
    /**
     * 🦊 Set default quality gate
     */
    async setDefaultQualityGate(gateId) {
        const gate = this.getQualityGate(gateId);
        if (!gate) {
            throw new Error(`Quality gate with ID '${gateId}' not found`);
        }
        this.configuration.defaultGate = gateId;
        await this.saveConfiguration();
        this.emit("defaultQualityGateChanged", gate);
    }
    /**
     * 🦦 Get default quality gate
     */
    getDefaultQualityGate() {
        return this.getQualityGate(this.configuration.defaultGate);
    }
    /**
     * 🐺 Create Reynard-specific quality gates
     */
    async createReynardQualityGates() {
        const reynardGates = [
            {
                id: "reynard-development",
                name: "Reynard Development Quality Gate",
                description: "Quality standards for development environment",
                environment: "development",
                enabled: true,
                conditions: [
                    {
                        metric: "bugs",
                        operator: "EQ",
                        threshold: 0,
                        description: "No bugs allowed in development",
                    },
                    {
                        metric: "vulnerabilities",
                        operator: "EQ",
                        threshold: 0,
                        description: "No security vulnerabilities allowed",
                    },
                    {
                        metric: "codeSmells",
                        operator: "LT",
                        threshold: 50,
                        description: "Keep code smells under 50",
                    },
                    {
                        metric: "cyclomaticComplexity",
                        operator: "LT",
                        threshold: 500,
                        description: "Keep complexity manageable",
                    },
                    {
                        metric: "maintainabilityIndex",
                        operator: "GT",
                        threshold: 60,
                        description: "Maintain good maintainability",
                    },
                    {
                        metric: "linesOfCode",
                        operator: "LT",
                        threshold: 100000,
                        description: "Keep codebase size reasonable",
                    },
                ],
            },
            {
                id: "reynard-production",
                name: "Reynard Production Quality Gate",
                description: "Strict quality standards for production environment",
                environment: "production",
                enabled: true,
                conditions: [
                    {
                        metric: "bugs",
                        operator: "EQ",
                        threshold: 0,
                        description: "Zero tolerance for bugs in production",
                    },
                    {
                        metric: "vulnerabilities",
                        operator: "EQ",
                        threshold: 0,
                        description: "Zero tolerance for security vulnerabilities",
                    },
                    {
                        metric: "codeSmells",
                        operator: "LT",
                        threshold: 20,
                        description: "Minimal code smells in production",
                    },
                    {
                        metric: "cyclomaticComplexity",
                        operator: "LT",
                        threshold: 200,
                        description: "Low complexity in production",
                    },
                    {
                        metric: "maintainabilityIndex",
                        operator: "GT",
                        threshold: 80,
                        description: "High maintainability in production",
                    },
                    {
                        metric: "lineCoverage",
                        operator: "GT",
                        threshold: 80,
                        description: "High test coverage required",
                    },
                    {
                        metric: "branchCoverage",
                        operator: "GT",
                        threshold: 70,
                        description: "Good branch coverage required",
                    },
                ],
            },
            {
                id: "reynard-modularity",
                name: "Reynard Modularity Standards",
                description: "Enforce Reynard modularity principles",
                environment: "all",
                enabled: true,
                conditions: [
                    {
                        metric: "maxFileLines",
                        operator: "LT",
                        threshold: 250,
                        description: "Source files must be under 250 lines",
                    },
                    {
                        metric: "maxTestFileLines",
                        operator: "LT",
                        threshold: 300,
                        description: "Test files must be under 300 lines",
                    },
                    {
                        metric: "averageFileComplexity",
                        operator: "LT",
                        threshold: 10,
                        description: "Keep average file complexity low",
                    },
                ],
            },
        ];
        for (const gate of reynardGates) {
            await this.addQualityGate(gate);
        }
        // Set development as default
        await this.setDefaultQualityGate("reynard-development");
    }
    /**
     * 🦊 Get default configuration
     */
    getDefaultConfiguration() {
        return {
            gates: [],
            defaultGate: "",
            environments: {
                development: "reynard-development",
                staging: "reynard-development",
                production: "reynard-production",
            },
        };
    }
    /**
     * 🦦 Export quality gate configuration
     */
    exportConfiguration() {
        return { ...this.configuration };
    }
    /**
     * 🐺 Import quality gate configuration
     */
    async importConfiguration(config) {
        this.configuration = config;
        await this.saveConfiguration();
        this.emit("configurationImported", this.configuration);
    }
    /**
     * 🦊 Validate quality gate configuration
     */
    validateConfiguration() {
        const errors = [];
        // Check for duplicate gate IDs
        const gateIds = this.configuration.gates.map(gate => gate.id);
        const duplicateIds = gateIds.filter((id, index) => gateIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            errors.push(`Duplicate quality gate IDs: ${duplicateIds.join(", ")}`);
        }
        // Check default gate exists
        if (this.configuration.defaultGate && !this.getQualityGate(this.configuration.defaultGate)) {
            errors.push(`Default quality gate '${this.configuration.defaultGate}' not found`);
        }
        // Validate each gate
        for (const gate of this.configuration.gates) {
            if (!gate.id || !gate.name) {
                errors.push(`Quality gate missing required fields: ${gate.id || "unknown"}`);
            }
            if (gate.conditions.length === 0) {
                errors.push(`Quality gate '${gate.id}' has no conditions`);
            }
            for (const condition of gate.conditions) {
                if (!condition.metric || !condition.operator || condition.threshold === undefined) {
                    errors.push(`Invalid condition in gate '${gate.id}': missing required fields`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
