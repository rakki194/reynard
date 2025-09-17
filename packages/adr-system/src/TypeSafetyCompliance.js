/**
 * Type Safety Compliance - Advanced TypeScript Type Safety Analysis and Enforcement
 *
 * This module provides comprehensive analysis of type safety compliance,
 * ensuring strict TypeScript usage and preventing type-related issues.
 */
import { readFile, readdir } from "fs/promises";
import { join } from "path";
export class TypeSafetyCompliance {
    constructor(codebasePath) {
        Object.defineProperty(this, "codebasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "violationCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "coverageCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "strictModeRules", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                noImplicitAny: true,
                strictNullChecks: true,
                strictFunctionTypes: true,
                strictBindCallApply: true,
                strictPropertyInitialization: true,
                noImplicitReturns: true,
                noImplicitThis: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
            }
        });
        this.codebasePath = codebasePath;
    }
    /**
     * Perform comprehensive type safety compliance analysis
     */
    async analyzeTypeSafety() {
        console.log("🐺 Starting type safety compliance analysis...");
        const files = await this.discoverTypeScriptFiles();
        const violations = [];
        const typeCoverageByFile = new Map();
        // Analyze each file
        for (const file of files) {
            const fileViolations = await this.analyzeFileTypeSafety(file);
            violations.push(...fileViolations);
            this.violationCache.set(file, fileViolations);
            const coverage = await this.analyzeTypeCoverage(file);
            typeCoverageByFile.set(file, coverage);
            this.coverageCache.set(file, coverage);
        }
        // Check strict mode compliance
        const strictModeCompliance = await this.checkStrictModeCompliance();
        // Generate comprehensive report
        const report = this.generateTypeSafetyReport(files, violations, typeCoverageByFile, strictModeCompliance);
        console.log(`✅ Type safety analysis complete: ${report.overallTypeSafety.toFixed(1)}% type safety`);
        return report;
    }
    /**
     * Analyze type safety for a specific file
     */
    async analyzeFileTypeSafety(filePath) {
        try {
            const content = await readFile(filePath, "utf-8");
            const violations = [];
            // Check for 'any' usage
            const anyViolations = this.detectAnyUsage(content, filePath);
            violations.push(...anyViolations);
            // Check for 'unknown' usage
            const unknownViolations = this.detectUnknownUsage(content, filePath);
            violations.push(...unknownViolations);
            // Check for type assertions
            const assertionViolations = this.detectTypeAssertions(content, filePath);
            violations.push(...assertionViolations);
            // Check for non-null assertions
            const nonNullViolations = this.detectNonNullAssertions(content, filePath);
            violations.push(...nonNullViolations);
            // Check for implicit any
            const implicitAnyViolations = this.detectImplicitAny(content, filePath);
            violations.push(...implicitAnyViolations);
            // Check for strict mode violations
            const strictViolations = this.detectStrictModeViolations(content, filePath);
            violations.push(...strictViolations);
            return violations;
        }
        catch (error) {
            console.warn(`Failed to analyze type safety for ${filePath}:`, error);
            return [];
        }
    }
    /**
     * Analyze type coverage for a specific file
     */
    async analyzeTypeCoverage(filePath) {
        try {
            const content = await readFile(filePath, "utf-8");
            const lines = content.split("\n");
            let totalExpressions = 0;
            let typedExpressions = 0;
            let anyExpressions = 0;
            let unknownExpressions = 0;
            const untypedLocations = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Count expressions and their types
                const expressions = this.extractExpressions(line);
                totalExpressions += expressions.length;
                for (const expr of expressions) {
                    if (expr.type === "any") {
                        anyExpressions++;
                        untypedLocations.push({
                            line: i + 1,
                            column: expr.column,
                            expression: expr.text,
                            type: "any",
                        });
                    }
                    else if (expr.type === "unknown") {
                        unknownExpressions++;
                        untypedLocations.push({
                            line: i + 1,
                            column: expr.column,
                            expression: expr.text,
                            type: "unknown",
                        });
                    }
                    else if (expr.type !== "untyped") {
                        typedExpressions++;
                    }
                    else {
                        untypedLocations.push({
                            line: i + 1,
                            column: expr.column,
                            expression: expr.text,
                            type: "untyped",
                        });
                    }
                }
            }
            const coveragePercentage = totalExpressions > 0
                ? (typedExpressions / totalExpressions) * 100
                : 100;
            return {
                filePath,
                totalExpressions,
                typedExpressions,
                anyExpressions,
                unknownExpressions,
                coveragePercentage,
                untypedLocations,
            };
        }
        catch (error) {
            console.warn(`Failed to analyze type coverage for ${filePath}:`, error);
            return {
                filePath,
                totalExpressions: 0,
                typedExpressions: 0,
                anyExpressions: 0,
                unknownExpressions: 0,
                coveragePercentage: 0,
                untypedLocations: [],
            };
        }
    }
    /**
     * Get type safety score for a specific file
     */
    getFileTypeSafetyScore(filePath) {
        const violations = this.violationCache.get(filePath) || [];
        const coverage = this.coverageCache.get(filePath);
        if (!coverage)
            return 0;
        let score = coverage.coveragePercentage;
        // Apply penalties for violations
        for (const violation of violations) {
            switch (violation.severity) {
                case "critical":
                    score -= 20;
                    break;
                case "high":
                    score -= 15;
                    break;
                case "medium":
                    score -= 10;
                    break;
                case "low":
                    score -= 5;
                    break;
            }
        }
        return Math.max(0, score);
    }
    /**
     * Get type coverage for a specific file
     */
    getFileTypeCoverage(filePath) {
        return this.coverageCache.get(filePath) || null;
    }
    /**
     * Check if a file is type safe
     */
    isFileTypeSafe(filePath) {
        const score = this.getFileTypeSafetyScore(filePath);
        return score >= 80;
    }
    /**
     * Get files with critical type safety issues
     */
    getCriticalTypeSafetyFiles() {
        const criticalFiles = [];
        for (const [filePath, violations] of this.violationCache) {
            const criticalViolations = violations.filter((v) => v.severity === "critical");
            if (criticalViolations.length > 0) {
                criticalFiles.push({ filePath, violations: criticalViolations });
            }
        }
        return criticalFiles.sort((a, b) => b.violations.length - a.violations.length);
    }
    /**
     * Generate type safety improvement suggestions
     */
    generateTypeSafetySuggestions(filePath) {
        const violations = this.violationCache.get(filePath) || [];
        const coverage = this.coverageCache.get(filePath);
        const suggestions = [];
        if (violations.length === 0 &&
            coverage &&
            coverage.coveragePercentage >= 95) {
            suggestions.push("✅ File has excellent type safety");
            return suggestions;
        }
        const violationTypes = new Set(violations.map((v) => v.type));
        if (violationTypes.has("any-usage")) {
            suggestions.push("🚫 Replace `any` types with specific types");
        }
        if (violationTypes.has("unknown-usage")) {
            suggestions.push("❓ Use type guards with `unknown` types");
        }
        if (violationTypes.has("type-assertion")) {
            suggestions.push("⚠️ Minimize type assertions and use type guards instead");
        }
        if (violationTypes.has("non-null-assertion")) {
            suggestions.push("❗ Avoid non-null assertions and handle null cases properly");
        }
        if (violationTypes.has("implicit-any")) {
            suggestions.push("🔍 Add explicit type annotations");
        }
        if (coverage && coverage.coveragePercentage < 90) {
            suggestions.push(`📊 Improve type coverage (current: ${coverage.coveragePercentage.toFixed(1)}%)`);
        }
        return suggestions;
    }
    // Private methods
    async discoverTypeScriptFiles() {
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
                        if (["ts", "tsx"].includes(ext || "")) {
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
    detectAnyUsage(content, filePath) {
        const violations = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for explicit 'any' usage
            const anyMatches = line.matchAll(/\bany\b/g);
            for (const match of anyMatches) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "any-usage",
                    severity: this.getAnyUsageSeverity(line, match.index),
                    filePath,
                    lineNumber: i + 1,
                    description: "Explicit `any` type usage detected",
                    codeSnippet: line.trim(),
                    suggestion: "Replace with specific type or use `unknown` for truly unknown types",
                    impact: {
                        typeSafety: 0.9,
                        maintainability: 0.7,
                        reliability: 0.8,
                        performance: 0.3,
                    },
                });
            }
        }
        return violations;
    }
    detectUnknownUsage(content, filePath) {
        const violations = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for 'unknown' usage without type guards
            const unknownMatches = line.matchAll(/\bunknown\b/g);
            for (const match of unknownMatches) {
                if (!this.hasTypeGuard(line)) {
                    violations.push({
                        id: this.generateViolationId(),
                        type: "unknown-usage",
                        severity: "medium",
                        filePath,
                        lineNumber: i + 1,
                        description: "`unknown` type used without type guard",
                        codeSnippet: line.trim(),
                        suggestion: "Use type guards to narrow down the type before using",
                        impact: {
                            typeSafety: 0.6,
                            maintainability: 0.5,
                            reliability: 0.7,
                            performance: 0.2,
                        },
                    });
                }
            }
        }
        return violations;
    }
    detectTypeAssertions(content, filePath) {
        const violations = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for type assertions (as Type)
            const assertionMatches = line.matchAll(/\bas\s+[A-Z][a-zA-Z0-9]*/g);
            for (const match of assertionMatches) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "type-assertion",
                    severity: this.getTypeAssertionSeverity(line),
                    filePath,
                    lineNumber: i + 1,
                    description: "Type assertion detected",
                    codeSnippet: line.trim(),
                    suggestion: "Use type guards or proper type narrowing instead of assertions",
                    impact: {
                        typeSafety: 0.7,
                        maintainability: 0.6,
                        reliability: 0.8,
                        performance: 0.1,
                    },
                });
            }
        }
        return violations;
    }
    detectNonNullAssertions(content, filePath) {
        const violations = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for non-null assertions (!)
            const nonNullMatches = line.matchAll(/[^!]!([^=]|$)/g);
            for (const match of nonNullMatches) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "non-null-assertion",
                    severity: this.getNonNullAssertionSeverity(line),
                    filePath,
                    lineNumber: i + 1,
                    description: "Non-null assertion operator (!) detected",
                    codeSnippet: line.trim(),
                    suggestion: "Handle null/undefined cases properly instead of using assertions",
                    impact: {
                        typeSafety: 0.8,
                        maintainability: 0.5,
                        reliability: 0.9,
                        performance: 0.1,
                    },
                });
            }
        }
        return violations;
    }
    detectImplicitAny(content, filePath) {
        const violations = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for function parameters without types
            const functionMatches = line.matchAll(/function\s+\w+\s*\(([^)]*)\)/g);
            for (const match of functionMatches) {
                const params = match[1];
                if (params && !this.hasExplicitTypes(params)) {
                    violations.push({
                        id: this.generateViolationId(),
                        type: "implicit-any",
                        severity: "high",
                        filePath,
                        lineNumber: i + 1,
                        description: "Function parameters without explicit types",
                        codeSnippet: line.trim(),
                        suggestion: "Add explicit type annotations to function parameters",
                        impact: {
                            typeSafety: 0.8,
                            maintainability: 0.7,
                            reliability: 0.6,
                            performance: 0.2,
                        },
                    });
                }
            }
            // Check for arrow function parameters without types
            const arrowMatches = line.matchAll(/\(([^)]*)\)\s*=>/g);
            for (const match of arrowMatches) {
                const params = match[1];
                if (params && !this.hasExplicitTypes(params)) {
                    violations.push({
                        id: this.generateViolationId(),
                        type: "implicit-any",
                        severity: "high",
                        filePath,
                        lineNumber: i + 1,
                        description: "Arrow function parameters without explicit types",
                        codeSnippet: line.trim(),
                        suggestion: "Add explicit type annotations to arrow function parameters",
                        impact: {
                            typeSafety: 0.8,
                            maintainability: 0.7,
                            reliability: 0.6,
                            performance: 0.2,
                        },
                    });
                }
            }
        }
        return violations;
    }
    detectStrictModeViolations(content, filePath) {
        const violations = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check for unused variables
            if (this.hasUnusedVariable(line)) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "strict-mode",
                    severity: "low",
                    filePath,
                    lineNumber: i + 1,
                    description: "Unused variable detected",
                    codeSnippet: line.trim(),
                    suggestion: "Remove unused variable or prefix with underscore",
                    impact: {
                        typeSafety: 0.2,
                        maintainability: 0.6,
                        reliability: 0.3,
                        performance: 0.1,
                    },
                });
            }
            // Check for missing return statements
            if (this.hasMissingReturn(line)) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "strict-mode",
                    severity: "medium",
                    filePath,
                    lineNumber: i + 1,
                    description: "Function may not return a value on all code paths",
                    codeSnippet: line.trim(),
                    suggestion: "Add explicit return statements or mark function as void",
                    impact: {
                        typeSafety: 0.6,
                        maintainability: 0.5,
                        reliability: 0.7,
                        performance: 0.1,
                    },
                });
            }
        }
        return violations;
    }
    async checkStrictModeCompliance() {
        try {
            const tsconfigPath = join(this.codebasePath, "tsconfig.json");
            const tsconfigContent = await readFile(tsconfigPath, "utf-8");
            const tsconfig = JSON.parse(tsconfigContent);
            const compilerOptions = tsconfig.compilerOptions || {};
            const violations = [];
            // Check strict mode settings
            for (const [rule, expected] of Object.entries(this.strictModeRules)) {
                if (compilerOptions[rule] !== expected) {
                    violations.push(`${rule} should be ${expected}`);
                }
            }
            return {
                enabled: compilerOptions.strict === true,
                violations: violations.length,
                recommendations: violations,
            };
        }
        catch (error) {
            return {
                enabled: false,
                violations: 1,
                recommendations: ["Enable strict mode in tsconfig.json"],
            };
        }
    }
    generateTypeSafetyReport(files, violations, typeCoverageByFile, strictModeCompliance) {
        const totalFiles = files.length;
        const typeSafeFiles = files.filter((file) => this.isFileTypeSafe(file)).length;
        const overallTypeSafety = files.reduce((sum, file) => sum + this.getFileTypeSafetyScore(file), 0) /
            totalFiles;
        // Group violations by type and severity
        const violationsByType = {};
        const violationsBySeverity = {};
        for (const violation of violations) {
            violationsByType[violation.type] =
                (violationsByType[violation.type] || 0) + 1;
            violationsBySeverity[violation.severity] =
                (violationsBySeverity[violation.severity] || 0) + 1;
        }
        // Calculate overall type coverage
        const coverageValues = Array.from(typeCoverageByFile.values());
        const overallCoverage = coverageValues.reduce((sum, coverage) => sum + coverage.coveragePercentage, 0) / coverageValues.length;
        const averageCoverage = overallCoverage;
        // Get top violations
        const topViolations = violations
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        })
            .slice(0, 10);
        // Generate recommendations
        const recommendations = this.generateGlobalRecommendations(violations, typeCoverageByFile, strictModeCompliance);
        return {
            overallTypeSafety,
            totalFiles,
            typeSafeFiles,
            violationsByType,
            violationsBySeverity,
            typeCoverage: {
                overall: overallCoverage,
                byFile: typeCoverageByFile,
                average: averageCoverage,
            },
            strictModeCompliance,
            topViolations,
            recommendations,
        };
    }
    generateGlobalRecommendations(violations, typeCoverageByFile, strictModeCompliance) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        const criticalViolations = violations.filter((v) => v.severity === "critical");
        const highViolations = violations.filter((v) => v.severity === "high");
        const violationTypes = new Set(violations.map((v) => v.type));
        if (criticalViolations.length > 0) {
            immediate.push(`🚨 Address ${criticalViolations.length} critical type safety violations`);
        }
        if (highViolations.length > 0) {
            immediate.push(`⚠️ Fix ${highViolations.length} high-severity type safety violations`);
        }
        if (violationTypes.has("any-usage")) {
            immediate.push("🚫 Eliminate all `any` type usage");
        }
        if (violationTypes.has("implicit-any")) {
            immediate.push("🔍 Add explicit type annotations to all functions");
        }
        if (!strictModeCompliance.enabled) {
            immediate.push("🔒 Enable strict mode in TypeScript configuration");
        }
        if (violationTypes.has("type-assertion")) {
            shortTerm.push("⚠️ Replace type assertions with type guards");
        }
        if (violationTypes.has("non-null-assertion")) {
            shortTerm.push("❗ Handle null/undefined cases properly");
        }
        shortTerm.push("🔍 Implement automated type safety checking in CI/CD");
        shortTerm.push("📊 Set up type coverage monitoring");
        longTerm.push("🎯 Establish type safety guidelines and best practices");
        longTerm.push("🔄 Implement automated type safety improvements");
        longTerm.push("📈 Create type safety dashboards");
        longTerm.push("🎓 Conduct type safety training");
        return { immediate, shortTerm, longTerm };
    }
    // Helper methods
    extractExpressions(line) {
        const expressions = [];
        // Simple expression extraction (in a real implementation, would use TypeScript compiler API)
        const variableMatches = line.matchAll(/(\w+)\s*[:=]/g);
        for (const match of variableMatches) {
            expressions.push({
                text: match[1],
                type: "typed", // Simplified
                column: match.index || 0,
            });
        }
        return expressions;
    }
    hasTypeGuard(line) {
        return (line.includes("typeof") ||
            line.includes("instanceof") ||
            line.includes("in "));
    }
    hasExplicitTypes(params) {
        return params.includes(":") && !params.includes("any");
    }
    hasUnusedVariable(line) {
        // Simplified check - in real implementation, would use TypeScript compiler
        return (line.includes("const ") &&
            line.includes("= ") &&
            !line.includes("console.log"));
    }
    hasMissingReturn(line) {
        // Simplified check - in real implementation, would analyze function body
        return (line.includes("function") &&
            !line.includes("void") &&
            !line.includes("return"));
    }
    getAnyUsageSeverity(line, index) {
        // Determine severity based on context
        if (line.includes("// TODO") || line.includes("// FIXME")) {
            return "medium";
        }
        if (line.includes("any[]") || line.includes("any>")) {
            return "high";
        }
        return "critical";
    }
    getTypeAssertionSeverity(line) {
        if (line.includes("as HTMLElement") || line.includes("as Element")) {
            return "medium";
        }
        return "high";
    }
    getNonNullAssertionSeverity(line) {
        if (line.includes("!.")) {
            return "medium";
        }
        return "high";
    }
    generateViolationId() {
        return `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
