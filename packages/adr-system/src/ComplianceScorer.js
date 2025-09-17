/**
 * Compliance Scoring System - Comprehensive Architectural Compliance Assessment
 *
 * This module provides sophisticated scoring and monitoring of architectural
 * compliance across the codebase, with detailed metrics and recommendations.
 */
import { readFile, readdir, stat } from "fs/promises";
import { join } from "path";
export class ComplianceScorer {
    constructor(codebasePath, adrPath) {
        Object.defineProperty(this, "codebasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "adrPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rules", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "adrCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "scoreHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.codebasePath = codebasePath;
        this.adrPath = adrPath;
        this.initializeDefaultRules();
    }
    /**
     * Calculate comprehensive compliance score
     */
    async calculateComplianceScore() {
        console.log("🦦 Calculating compliance score...");
        const files = await this.discoverFiles();
        const violations = [];
        const categoryScores = {
            architectural: 0,
            security: 0,
            performance: 0,
            maintainability: 0,
            scalability: 0,
        };
        let totalScore = 0;
        let totalWeight = 0;
        // Evaluate each rule
        for (const rule of this.rules.values()) {
            if (!rule.enabled)
                continue;
            const ruleViolations = await this.evaluateRule(rule, files);
            violations.push(...ruleViolations);
            // Calculate category score
            const categoryViolations = ruleViolations.filter((v) => v.type === rule.category);
            const categoryScore = this.calculateCategoryScore(rule.category, categoryViolations);
            categoryScores[rule.category] = categoryScore;
            // Calculate weighted score
            const ruleScore = this.calculateRuleScore(rule, ruleViolations);
            totalScore += ruleScore * rule.weight;
            totalWeight += rule.weight;
        }
        const overallScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 100;
        const score = {
            overall: Math.round(overallScore),
            categories: categoryScores,
            violations,
            recommendations: this.generateRecommendations(violations),
            trends: this.calculateTrends(),
            metadata: {
                evaluatedAt: new Date().toISOString(),
                totalFiles: files.length,
                totalRules: this.rules.size,
                violationsCount: violations.length,
            },
        };
        this.scoreHistory.push(score);
        return score;
    }
    /**
     * Generate comprehensive compliance report
     */
    async generateComplianceReport() {
        console.log("🦦 Generating compliance report...");
        const score = await this.calculateComplianceScore();
        const files = await this.discoverFiles();
        // Calculate detailed scores per file
        const detailedScores = new Map();
        for (const file of files) {
            const fileScore = await this.calculateFileScore(file);
            detailedScores.set(file, fileScore);
        }
        // Calculate category breakdown
        const categoryBreakdown = new Map();
        for (const category of Object.keys(score.categories)) {
            const categoryScore = await this.calculateCategoryScore(category, score.violations);
            categoryBreakdown.set(category, {
                overall: categoryScore,
                categories: { ...score.categories },
                violations: score.violations.filter((v) => v.type === category),
                recommendations: this.generateCategoryRecommendations(category, score.violations),
                trends: this.calculateTrends(),
                metadata: score.metadata,
            });
        }
        // Analyze violations
        const violationAnalysis = this.analyzeViolations(score.violations);
        // Generate recommendations
        const recommendations = this.generateDetailedRecommendations(score.violations);
        // Create action plan
        const actionPlan = this.createActionPlan(score.violations);
        return {
            summary: score,
            detailedScores,
            categoryBreakdown,
            violationAnalysis,
            recommendations,
            actionPlan,
        };
    }
    /**
     * Monitor compliance over time
     */
    async monitorCompliance() {
        const current = await this.calculateComplianceScore();
        const alerts = [];
        // Check for significant changes
        if (this.scoreHistory.length > 1) {
            const previous = this.scoreHistory[this.scoreHistory.length - 2];
            const change = current.overall - previous.overall;
            if (change < -10) {
                alerts.push(`⚠️ Compliance score dropped significantly: ${change} points`);
            }
            else if (change > 10) {
                alerts.push(`✅ Compliance score improved significantly: +${change} points`);
            }
            // Check for new critical violations
            const newCriticalViolations = current.violations.filter((v) => v.severity === "critical" &&
                !previous.violations.some((pv) => pv.description === v.description && pv.location === v.location));
            if (newCriticalViolations.length > 0) {
                alerts.push(`🚨 ${newCriticalViolations.length} new critical violations detected`);
            }
        }
        return {
            current,
            history: this.scoreHistory,
            alerts,
        };
    }
    /**
     * Add custom compliance rule
     */
    addRule(rule) {
        this.rules.set(rule.id, rule);
    }
    /**
     * Update existing rule
     */
    updateRule(ruleId, updates) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            Object.assign(rule, updates);
        }
    }
    /**
     * Remove rule
     */
    removeRule(ruleId) {
        this.rules.delete(ruleId);
    }
    /**
     * Get all rules
     */
    getRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Export compliance data
     */
    exportComplianceData() {
        return JSON.stringify({
            rules: Array.from(this.rules.values()),
            scoreHistory: this.scoreHistory,
            metadata: {
                exportedAt: new Date().toISOString(),
                version: "1.0.0",
            },
        }, null, 2);
    }
    /**
     * Import compliance data
     */
    importComplianceData(json) {
        const data = JSON.parse(json);
        if (data.rules) {
            this.rules.clear();
            for (const rule of data.rules) {
                this.rules.set(rule.id, rule);
            }
        }
        if (data.scoreHistory) {
            this.scoreHistory.length = 0;
            this.scoreHistory.push(...data.scoreHistory);
        }
    }
    // Private methods
    async discoverFiles() {
        const files = [];
        const scanDirectory = async (dir) => {
            try {
                const entries = await readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (!["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name)) {
                            await scanDirectory(fullPath);
                        }
                    }
                    else if (entry.isFile()) {
                        const ext = fullPath.split(".").pop();
                        if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "java"].includes(ext || "")) {
                            files.push(fullPath);
                        }
                    }
                }
            }
            catch (error) {
                console.warn(`Could not scan directory ${dir}:`, error);
            }
        };
        await scanDirectory(this.codebasePath);
        return files;
    }
    async evaluateRule(rule, files) {
        const violations = [];
        for (const file of files) {
            try {
                const content = await readFile(file, "utf-8");
                const stats = await stat(file);
                for (const condition of rule.conditions) {
                    const violation = await this.evaluateCondition(condition, file, content, stats);
                    if (violation) {
                        violations.push({
                            type: rule.category,
                            severity: rule.severity,
                            description: violation.description,
                            location: violation.location,
                            rule: rule.name,
                            suggestion: rule.remediation,
                        });
                    }
                }
            }
            catch (error) {
                console.warn(`Could not evaluate rule ${rule.name} for file ${file}:`, error);
            }
        }
        return violations;
    }
    async evaluateCondition(condition, filePath, content, stats) {
        let value;
        let description = "";
        let location = filePath;
        switch (condition.type) {
            case "file-size":
                value = stats.size;
                description = `File size ${value} bytes`;
                break;
            case "function-length":
                const functions = this.findFunctions(content);
                for (const func of functions) {
                    if (this.compareValues(func.lines, condition.operator, condition.value)) {
                        return {
                            description: `Function has ${func.lines} lines`,
                            location: `${filePath}:${func.line}`,
                        };
                    }
                }
                return null;
            case "complexity":
                value = this.calculateComplexity(content);
                description = `Complexity score ${value.toFixed(2)}`;
                break;
            case "dependency-count":
                value = this.countDependencies(content);
                description = `Has ${value} dependencies`;
                break;
            case "naming-convention":
                const namingViolations = this.checkNamingConvention(content, condition.value);
                if (namingViolations.length > 0) {
                    return {
                        description: `Naming convention violations: ${namingViolations.join(", ")}`,
                        location: filePath,
                    };
                }
                return null;
            case "security-pattern":
                const securityIssues = this.findSecurityPatterns(content, condition.value);
                if (securityIssues.length > 0) {
                    return {
                        description: `Security issues: ${securityIssues.join(", ")}`,
                        location: filePath,
                    };
                }
                return null;
            case "performance-pattern":
                const performanceIssues = this.findPerformancePatterns(content, condition.value);
                if (performanceIssues.length > 0) {
                    return {
                        description: `Performance issues: ${performanceIssues.join(", ")}`,
                        location: filePath,
                    };
                }
                return null;
            default:
                return null;
        }
        if (this.compareValues(value, condition.operator, condition.value)) {
            return { description, location };
        }
        return null;
    }
    compareValues(actual, operator, expected) {
        switch (operator) {
            case "lt":
                return actual < expected;
            case "lte":
                return actual <= expected;
            case "gt":
                return actual > expected;
            case "gte":
                return actual >= expected;
            case "eq":
                return actual === expected;
            case "ne":
                return actual !== expected;
            case "contains":
                return actual.includes(expected);
            case "regex":
                return new RegExp(expected).test(actual);
            default:
                return false;
        }
    }
    calculateCategoryScore(category, violations) {
        const categoryViolations = violations.filter((v) => v.type === category);
        if (categoryViolations.length === 0)
            return 100;
        let penalty = 0;
        for (const violation of categoryViolations) {
            switch (violation.severity) {
                case "critical":
                    penalty += 20;
                    break;
                case "high":
                    penalty += 10;
                    break;
                case "medium":
                    penalty += 5;
                    break;
                case "low":
                    penalty += 2;
                    break;
            }
        }
        return Math.max(0, 100 - penalty);
    }
    calculateRuleScore(rule, violations) {
        if (violations.length === 0)
            return 100;
        let penalty = 0;
        for (const violation of violations) {
            switch (violation.severity) {
                case "critical":
                    penalty += 25;
                    break;
                case "high":
                    penalty += 15;
                    break;
                case "medium":
                    penalty += 8;
                    break;
                case "low":
                    penalty += 3;
                    break;
            }
        }
        return Math.max(0, 100 - penalty);
    }
    async calculateFileScore(filePath) {
        try {
            const content = await readFile(filePath, "utf-8");
            const stats = await stat(filePath);
            let score = 100;
            // File size penalty
            if (stats.size > 10000)
                score -= 10;
            if (stats.size > 50000)
                score -= 20;
            // Line count penalty
            const lines = content.split("\n").length;
            if (lines > 200)
                score -= 15;
            if (lines > 500)
                score -= 30;
            // Complexity penalty
            const complexity = this.calculateComplexity(content);
            if (complexity > 10)
                score -= 10;
            if (complexity > 20)
                score -= 20;
            // Dependency penalty
            const dependencies = this.countDependencies(content);
            if (dependencies > 10)
                score -= 5;
            if (dependencies > 20)
                score -= 15;
            return Math.max(0, score);
        }
        catch (error) {
            return 0;
        }
    }
    generateRecommendations(violations) {
        const recommendations = [];
        // Group violations by type
        const violationsByType = new Map();
        for (const violation of violations) {
            const type = violation.type;
            if (!violationsByType.has(type)) {
                violationsByType.set(type, []);
            }
            violationsByType.get(type).push(violation);
        }
        // Generate recommendations for each type
        for (const [type, typeViolations] of violationsByType) {
            const count = typeViolations.length;
            const criticalCount = typeViolations.filter((v) => v.severity === "critical").length;
            if (criticalCount > 0) {
                recommendations.push(`🚨 Address ${criticalCount} critical ${type} violations immediately`);
            }
            if (count > 10) {
                recommendations.push(`📊 High number of ${type} violations (${count}) - consider systematic review`);
            }
            switch (type) {
                case "maintainability":
                    recommendations.push("🔧 Refactor large files and functions to improve maintainability");
                    break;
                case "security":
                    recommendations.push("🔒 Conduct security review and implement secure coding practices");
                    break;
                case "performance":
                    recommendations.push("⚡ Optimize performance bottlenecks and implement caching strategies");
                    break;
                case "scalability":
                    recommendations.push("📈 Review architecture for scalability improvements");
                    break;
            }
        }
        return recommendations;
    }
    generateCategoryRecommendations(category, violations) {
        const categoryViolations = violations.filter((v) => v.type === category);
        return this.generateRecommendations(categoryViolations);
    }
    analyzeViolations(violations) {
        const bySeverity = {};
        const byCategory = {};
        const byFile = new Map();
        const topViolations = [];
        // Count by severity
        for (const violation of violations) {
            bySeverity[violation.severity] =
                (bySeverity[violation.severity] || 0) + 1;
            byCategory[violation.type] = (byCategory[violation.type] || 0) + 1;
            // Group by file
            if (!byFile.has(violation.location)) {
                byFile.set(violation.location, []);
            }
            byFile.get(violation.location).push(violation);
        }
        // Get top violations (most severe)
        topViolations.push(...violations
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        })
            .slice(0, 10));
        return {
            bySeverity,
            byCategory,
            byFile,
            topViolations,
        };
    }
    generateDetailedRecommendations(violations) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        const criticalViolations = violations.filter((v) => v.severity === "critical");
        const highViolations = violations.filter((v) => v.severity === "high");
        const mediumViolations = violations.filter((v) => v.severity === "medium");
        // Immediate actions
        if (criticalViolations.length > 0) {
            immediate.push(`Fix ${criticalViolations.length} critical violations immediately`);
        }
        if (highViolations.length > 0) {
            immediate.push(`Address ${highViolations.length} high-severity violations within 1 week`);
        }
        // Short-term actions
        if (mediumViolations.length > 0) {
            shortTerm.push(`Resolve ${mediumViolations.length} medium-severity violations within 2 weeks`);
        }
        shortTerm.push("Implement automated compliance checking in CI/CD pipeline");
        shortTerm.push("Establish code review guidelines for compliance");
        // Long-term actions
        longTerm.push("Develop comprehensive compliance training program");
        longTerm.push("Implement continuous compliance monitoring");
        longTerm.push("Create compliance dashboard for real-time visibility");
        longTerm.push("Establish compliance metrics and KPIs");
        return { immediate, shortTerm, longTerm };
    }
    createActionPlan(violations) {
        const actionPlan = [];
        // Group violations by type and severity
        const violationsByType = new Map();
        for (const violation of violations) {
            const key = `${violation.type}-${violation.severity}`;
            if (!violationsByType.has(key)) {
                violationsByType.set(key, []);
            }
            violationsByType.get(key).push(violation);
        }
        // Create action items
        for (const [key, typeViolations] of violationsByType) {
            const [type, severity] = key.split("-");
            const count = typeViolations.length;
            let priority;
            let effort;
            let impact;
            switch (severity) {
                case "critical":
                    priority = "high";
                    effort = count * 4; // 4 hours per critical violation
                    impact = 0.9;
                    break;
                case "high":
                    priority = "high";
                    effort = count * 2; // 2 hours per high violation
                    impact = 0.7;
                    break;
                case "medium":
                    priority = "medium";
                    effort = count * 1; // 1 hour per medium violation
                    impact = 0.5;
                    break;
                case "low":
                    priority = "low";
                    effort = count * 0.5; // 30 minutes per low violation
                    impact = 0.3;
                    break;
                default:
                    priority = "medium";
                    effort = count;
                    impact = 0.5;
            }
            actionPlan.push({
                priority,
                action: `Fix ${count} ${severity} ${type} violations`,
                effort,
                impact,
            });
        }
        // Sort by priority and impact
        return actionPlan.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            return b.impact - a.impact;
        });
    }
    calculateTrends() {
        if (this.scoreHistory.length < 2) {
            return {
                current: 0,
                previous: 0,
                change: 0,
                trend: "stable",
            };
        }
        const current = this.scoreHistory[this.scoreHistory.length - 1].overall;
        const previous = this.scoreHistory[this.scoreHistory.length - 2].overall;
        const change = current - previous;
        let trend;
        if (change > 5) {
            trend = "improving";
        }
        else if (change < -5) {
            trend = "declining";
        }
        else {
            trend = "stable";
        }
        return { current, previous, change, trend };
    }
    initializeDefaultRules() {
        // File size rules
        this.addRule({
            id: "file-size-large",
            name: "Large File Size",
            category: "maintainability",
            severity: "medium",
            description: "Files should not exceed 10KB",
            weight: 0.3,
            enabled: true,
            conditions: [
                {
                    type: "file-size",
                    operator: "gt",
                    value: 10240,
                    description: "File size exceeds 10KB",
                },
            ],
            remediation: "Split large files into smaller, focused modules",
        });
        // Function length rules
        this.addRule({
            id: "function-length-long",
            name: "Long Functions",
            category: "maintainability",
            severity: "medium",
            description: "Functions should not exceed 50 lines",
            weight: 0.4,
            enabled: true,
            conditions: [
                {
                    type: "function-length",
                    operator: "gt",
                    value: 50,
                    description: "Function exceeds 50 lines",
                },
            ],
            remediation: "Break long functions into smaller, focused functions",
        });
        // Complexity rules
        this.addRule({
            id: "complexity-high",
            name: "High Complexity",
            category: "maintainability",
            severity: "high",
            description: "Code complexity should be manageable",
            weight: 0.5,
            enabled: true,
            conditions: [
                {
                    type: "complexity",
                    operator: "gt",
                    value: 15,
                    description: "Code complexity exceeds threshold",
                },
            ],
            remediation: "Refactor complex code to reduce cyclomatic complexity",
        });
        // Security rules
        this.addRule({
            id: "security-hardcoded-secrets",
            name: "Hardcoded Secrets",
            category: "security",
            severity: "critical",
            description: "No hardcoded secrets in code",
            weight: 0.9,
            enabled: true,
            conditions: [
                {
                    type: "security-pattern",
                    operator: "contains",
                    value: "password",
                    description: "Hardcoded password detected",
                },
            ],
            remediation: "Use environment variables or secure configuration management",
        });
        // Performance rules
        this.addRule({
            id: "performance-sync-io",
            name: "Synchronous I/O",
            category: "performance",
            severity: "medium",
            description: "Avoid synchronous I/O operations",
            weight: 0.4,
            enabled: true,
            conditions: [
                {
                    type: "performance-pattern",
                    operator: "contains",
                    value: "Sync",
                    description: "Synchronous I/O operation detected",
                },
            ],
            remediation: "Use asynchronous I/O operations",
        });
    }
    findFunctions(content) {
        const functions = [];
        const lines = content.split("\n");
        let inFunction = false;
        let functionStart = 0;
        let braceCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("function") ||
                line.includes("=>") ||
                line.includes("class")) {
                inFunction = true;
                functionStart = i;
                braceCount = 0;
            }
            if (inFunction) {
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                if (braceCount === 0 && line.includes("}")) {
                    const functionLines = i - functionStart + 1;
                    functions.push({ line: functionStart + 1, lines: functionLines });
                    inFunction = false;
                }
            }
        }
        return functions;
    }
    calculateComplexity(content) {
        const lines = content.split("\n");
        let complexity = 0;
        // Count control structures
        complexity += (content.match(/\bif\b/g) || []).length;
        complexity += (content.match(/\bfor\b/g) || []).length;
        complexity += (content.match(/\bwhile\b/g) || []).length;
        complexity += (content.match(/\bswitch\b/g) || []).length;
        complexity += (content.match(/\btry\b/g) || []).length;
        complexity += (content.match(/\bcatch\b/g) || []).length;
        // Normalize by file size
        return complexity / Math.max(1, lines.length / 10);
    }
    countDependencies(content) {
        const importMatches = content.match(/import\s+.*?\s+from\s+['"][^'"]+['"]/g);
        return importMatches ? importMatches.length : 0;
    }
    checkNamingConvention(content, convention) {
        const violations = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for camelCase violations
            if (convention === "camelCase") {
                const variableMatches = line.match(/\b[a-z]+_[a-z]+\b/g);
                if (variableMatches) {
                    violations.push(`Line ${i + 1}: ${variableMatches.join(", ")}`);
                }
            }
        }
        return violations;
    }
    findSecurityPatterns(content, pattern) {
        const issues = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (pattern === "password" &&
                line.includes("password") &&
                line.includes("=") &&
                !line.includes("process.env")) {
                issues.push(`Line ${i + 1}: Hardcoded password`);
            }
            if (pattern === "sql" &&
                line.includes("query") &&
                line.includes("+") &&
                !line.includes("prepared")) {
                issues.push(`Line ${i + 1}: Potential SQL injection`);
            }
        }
        return issues;
    }
    findPerformancePatterns(content, pattern) {
        const issues = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (pattern === "Sync" &&
                (line.includes("readFileSync") || line.includes("writeFileSync"))) {
                issues.push(`Line ${i + 1}: Synchronous I/O operation`);
            }
            if (pattern === "Loop" &&
                line.includes("while") &&
                line.includes("true")) {
                issues.push(`Line ${i + 1}: Potential infinite loop`);
            }
        }
        return issues;
    }
}
