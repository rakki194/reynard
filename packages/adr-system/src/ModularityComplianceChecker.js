/**
 * Modularity Compliance Checker - Advanced Architectural Modularity Analysis
 *
 * This module provides comprehensive analysis of code modularity compliance,
 * enforcing the Reynard 140-line axiom and modular architecture patterns.
 */
import { readFile, readdir, stat } from "fs/promises";
import { join } from "path";
export class ModularityComplianceChecker {
    constructor(codebasePath) {
        Object.defineProperty(this, "codebasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thresholds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                maxFileLines: 140,
                maxFunctionLines: 50,
                maxComplexity: 15,
                maxCoupling: 10,
                minCohesion: 0.7,
            }
        });
        Object.defineProperty(this, "fileCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "analysisCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.codebasePath = codebasePath;
    }
    /**
     * Perform comprehensive modularity compliance check
     */
    async checkModularityCompliance() {
        console.log("🐺 Starting modularity compliance check...");
        const files = await this.discoverFiles();
        const analyses = [];
        // Analyze each file
        for (const file of files) {
            const analysis = await this.analyzeModule(file);
            analyses.push(analysis);
            this.analysisCache.set(file, analysis);
        }
        // Generate comprehensive report
        const report = this.generateModularityReport(analyses);
        console.log(`✅ Modularity compliance check complete: ${report.overallCompliance.toFixed(1)}% compliance`);
        return report;
    }
    /**
     * Analyze a single module for compliance
     */
    async analyzeModule(filePath) {
        try {
            const content = await this.getFileContent(filePath);
            const stats = await stat(filePath);
            const metrics = this.calculateMetrics(content, filePath);
            const violations = await this.detectViolations(filePath, content, metrics);
            const recommendations = this.generateRecommendations(violations, metrics);
            const complianceScore = this.calculateComplianceScore(violations, metrics);
            return {
                filePath,
                metrics,
                violations,
                recommendations,
                complianceScore,
            };
        }
        catch (error) {
            console.warn(`Failed to analyze module ${filePath}:`, error);
            return {
                filePath,
                metrics: this.getDefaultMetrics(),
                violations: [],
                recommendations: ["Unable to analyze this file"],
                complianceScore: 0,
            };
        }
    }
    /**
     * Get modularity violations for a specific file
     */
    getViolationsForFile(filePath) {
        const analysis = this.analysisCache.get(filePath);
        return analysis ? analysis.violations : [];
    }
    /**
     * Get compliance score for a specific file
     */
    getComplianceScore(filePath) {
        const analysis = this.analysisCache.get(filePath);
        return analysis ? analysis.complianceScore : 0;
    }
    /**
     * Check if a file is compliant
     */
    isFileCompliant(filePath) {
        const analysis = this.analysisCache.get(filePath);
        return analysis ? analysis.complianceScore >= 80 : false;
    }
    /**
     * Get files that need immediate attention
     */
    getCriticalFiles() {
        const criticalFiles = [];
        for (const [filePath, analysis] of this.analysisCache) {
            const criticalViolations = analysis.violations.filter((v) => v.severity === "critical");
            if (criticalViolations.length > 0) {
                criticalFiles.push({ filePath, violations: criticalViolations });
            }
        }
        return criticalFiles.sort((a, b) => b.violations.length - a.violations.length);
    }
    /**
     * Generate refactoring suggestions for a file
     */
    generateRefactoringSuggestions(filePath) {
        const analysis = this.analysisCache.get(filePath);
        if (!analysis)
            return [];
        const suggestions = [];
        // File size violations
        if (analysis.metrics.linesOfCode > this.thresholds.maxFileLines) {
            suggestions.push(`Split file into smaller modules (current: ${analysis.metrics.linesOfCode} lines)`);
            suggestions.push("Consider extracting related functionality into separate files");
        }
        // Function length violations
        const longFunctions = analysis.violations.filter((v) => v.type === "function-length");
        if (longFunctions.length > 0) {
            suggestions.push(`Refactor ${longFunctions.length} long functions into smaller, focused functions`);
        }
        // Complexity violations
        if (analysis.metrics.complexity > this.thresholds.maxComplexity) {
            suggestions.push("Reduce cyclomatic complexity by simplifying control flow");
            suggestions.push("Extract complex logic into separate utility functions");
        }
        // Coupling violations
        if (analysis.metrics.coupling > this.thresholds.maxCoupling) {
            suggestions.push("Reduce coupling by using dependency injection");
            suggestions.push("Consider using interfaces to decouple dependencies");
        }
        // Cohesion violations
        if (analysis.metrics.cohesion < this.thresholds.minCohesion) {
            suggestions.push("Improve module cohesion by grouping related functionality");
            suggestions.push("Consider splitting unrelated concerns into separate modules");
        }
        return suggestions;
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
                        if (![
                            "node_modules",
                            ".git",
                            "dist",
                            "build",
                            "coverage",
                            "__tests__",
                        ].includes(entry.name)) {
                            await scanDirectory(fullPath);
                        }
                    }
                    else if (entry.isFile()) {
                        const ext = fullPath.split(".").pop();
                        if (["ts", "tsx", "js", "jsx"].includes(ext || "")) {
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
    async getFileContent(filePath) {
        if (this.fileCache.has(filePath)) {
            return this.fileCache.get(filePath);
        }
        const content = await readFile(filePath, "utf-8");
        this.fileCache.set(filePath, content);
        return content;
    }
    calculateMetrics(content, filePath) {
        const lines = content.split("\n");
        const linesOfCode = lines.filter((line) => line.trim() && !line.trim().startsWith("//")).length;
        const functions = this.countFunctions(content);
        const classes = this.countClasses(content);
        const exports = this.countExports(content);
        const imports = this.countImports(content);
        const complexity = this.calculateComplexity(content);
        const cohesion = this.calculateCohesion(content, filePath);
        const coupling = this.calculateCoupling(content);
        return {
            linesOfCode,
            functions,
            classes,
            exports,
            imports,
            complexity,
            cohesion,
            coupling,
        };
    }
    async detectViolations(filePath, content, metrics) {
        const violations = [];
        // File size violation
        if (metrics.linesOfCode > this.thresholds.maxFileLines) {
            violations.push({
                id: this.generateViolationId(),
                type: "file-size",
                severity: this.getFileSizeSeverity(metrics.linesOfCode),
                filePath,
                description: `File exceeds maximum line count (${metrics.linesOfCode} > ${this.thresholds.maxFileLines})`,
                currentValue: metrics.linesOfCode,
                threshold: this.thresholds.maxFileLines,
                suggestion: "Split file into smaller, focused modules",
                impact: {
                    maintainability: 0.8,
                    testability: 0.7,
                    reusability: 0.6,
                    readability: 0.9,
                },
            });
        }
        // Function length violations
        const longFunctions = this.findLongFunctions(content);
        for (const func of longFunctions) {
            violations.push({
                id: this.generateViolationId(),
                type: "function-length",
                severity: this.getFunctionLengthSeverity(func.lines),
                filePath,
                lineNumber: func.line,
                description: `Function exceeds maximum line count (${func.lines} > ${this.thresholds.maxFunctionLines})`,
                currentValue: func.lines,
                threshold: this.thresholds.maxFunctionLines,
                suggestion: "Break function into smaller, focused functions",
                impact: {
                    maintainability: 0.7,
                    testability: 0.8,
                    reusability: 0.5,
                    readability: 0.8,
                },
            });
        }
        // Complexity violations
        if (metrics.complexity > this.thresholds.maxComplexity) {
            violations.push({
                id: this.generateViolationId(),
                type: "module-cohesion",
                severity: this.getComplexitySeverity(metrics.complexity),
                filePath,
                description: `Module complexity exceeds threshold (${metrics.complexity.toFixed(2)} > ${this.thresholds.maxComplexity})`,
                currentValue: metrics.complexity,
                threshold: this.thresholds.maxComplexity,
                suggestion: "Simplify control flow and extract complex logic",
                impact: {
                    maintainability: 0.9,
                    testability: 0.8,
                    reusability: 0.6,
                    readability: 0.9,
                },
            });
        }
        // Coupling violations
        if (metrics.coupling > this.thresholds.maxCoupling) {
            violations.push({
                id: this.generateViolationId(),
                type: "coupling",
                severity: this.getCouplingSeverity(metrics.coupling),
                filePath,
                description: `Module coupling exceeds threshold (${metrics.coupling} > ${this.thresholds.maxCoupling})`,
                currentValue: metrics.coupling,
                threshold: this.thresholds.maxCoupling,
                suggestion: "Reduce dependencies and use dependency injection",
                impact: {
                    maintainability: 0.8,
                    testability: 0.9,
                    reusability: 0.7,
                    readability: 0.6,
                },
            });
        }
        // Cohesion violations
        if (metrics.cohesion < this.thresholds.minCohesion) {
            violations.push({
                id: this.generateViolationId(),
                type: "separation-of-concerns",
                severity: this.getCohesionSeverity(metrics.cohesion),
                filePath,
                description: `Module cohesion below threshold (${metrics.cohesion.toFixed(2)} < ${this.thresholds.minCohesion})`,
                currentValue: metrics.cohesion,
                threshold: this.thresholds.minCohesion,
                suggestion: "Group related functionality and separate concerns",
                impact: {
                    maintainability: 0.7,
                    testability: 0.6,
                    reusability: 0.8,
                    readability: 0.7,
                },
            });
        }
        return violations;
    }
    generateRecommendations(violations, metrics) {
        const recommendations = [];
        if (violations.length === 0) {
            recommendations.push("✅ File is compliant with modularity standards");
            return recommendations;
        }
        const criticalViolations = violations.filter((v) => v.severity === "critical");
        const highViolations = violations.filter((v) => v.severity === "high");
        if (criticalViolations.length > 0) {
            recommendations.push(`🚨 Address ${criticalViolations.length} critical violations immediately`);
        }
        if (highViolations.length > 0) {
            recommendations.push(`⚠️ Fix ${highViolations.length} high-severity violations`);
        }
        // Specific recommendations based on violation types
        const violationTypes = new Set(violations.map((v) => v.type));
        if (violationTypes.has("file-size")) {
            recommendations.push("📄 Split large files into smaller, focused modules");
        }
        if (violationTypes.has("function-length")) {
            recommendations.push("🔧 Refactor long functions into smaller, focused functions");
        }
        if (violationTypes.has("module-cohesion")) {
            recommendations.push("🧩 Improve module cohesion by grouping related functionality");
        }
        if (violationTypes.has("coupling")) {
            recommendations.push("🔗 Reduce coupling through dependency injection and interfaces");
        }
        if (violationTypes.has("separation-of-concerns")) {
            recommendations.push("🎯 Separate concerns into distinct modules");
        }
        return recommendations;
    }
    calculateComplianceScore(violations, metrics) {
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
    generateModularityReport(analyses) {
        const totalViolations = analyses.reduce((sum, analysis) => sum + analysis.violations.length, 0);
        const overallCompliance = analyses.reduce((sum, analysis) => sum + analysis.complianceScore, 0) /
            analyses.length;
        // Group violations by type and severity
        const violationsByType = {};
        const violationsBySeverity = {};
        for (const analysis of analyses) {
            for (const violation of analysis.violations) {
                violationsByType[violation.type] =
                    (violationsByType[violation.type] || 0) + 1;
                violationsBySeverity[violation.severity] =
                    (violationsBySeverity[violation.severity] || 0) + 1;
            }
        }
        // Get top violating files
        const topViolatingFiles = analyses
            .filter((analysis) => analysis.violations.length > 0)
            .sort((a, b) => b.violations.length - a.violations.length)
            .slice(0, 10)
            .map((analysis) => ({
            filePath: analysis.filePath,
            violationCount: analysis.violations.length,
            complianceScore: analysis.complianceScore,
        }));
        // Generate recommendations
        const recommendations = this.generateGlobalRecommendations(analyses);
        // Calculate metrics
        const metrics = {
            averageFileSize: analyses.reduce((sum, a) => sum + a.metrics.linesOfCode, 0) /
                analyses.length,
            averageFunctionLength: this.calculateAverageFunctionLength(analyses),
            averageComplexity: analyses.reduce((sum, a) => sum + a.metrics.complexity, 0) /
                analyses.length,
            modularityIndex: this.calculateModularityIndex(analyses),
        };
        return {
            overallCompliance,
            totalViolations,
            violationsByType,
            violationsBySeverity,
            topViolatingFiles,
            recommendations,
            metrics,
        };
    }
    generateGlobalRecommendations(analyses) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        const criticalFiles = analyses.filter((a) => a.violations.some((v) => v.severity === "critical"));
        const highViolationFiles = analyses.filter((a) => a.violations.some((v) => v.severity === "high"));
        if (criticalFiles.length > 0) {
            immediate.push(`🚨 Address ${criticalFiles.length} files with critical violations`);
        }
        if (highViolationFiles.length > 0) {
            immediate.push(`⚠️ Fix ${highViolationFiles.length} files with high-severity violations`);
        }
        shortTerm.push("🔧 Implement automated modularity checking in CI/CD pipeline");
        shortTerm.push("📚 Create modularity guidelines and best practices documentation");
        shortTerm.push("🎓 Conduct team training on modular architecture principles");
        longTerm.push("🏗️ Establish modularity metrics and KPIs");
        longTerm.push("📊 Implement continuous modularity monitoring");
        longTerm.push("🔄 Create automated refactoring suggestions system");
        return { immediate, shortTerm, longTerm };
    }
    // Helper methods for metrics calculation
    countFunctions(content) {
        const functionPatterns = [
            /function\s+\w+\s*\(/g,
            /const\s+\w+\s*=\s*\(/g,
            /const\s+\w+\s*=\s*async\s*\(/g,
            /=>\s*{/g,
        ];
        let count = 0;
        for (const pattern of functionPatterns) {
            const matches = content.match(pattern);
            if (matches)
                count += matches.length;
        }
        return count;
    }
    countClasses(content) {
        const classMatches = content.match(/class\s+\w+/g);
        return classMatches ? classMatches.length : 0;
    }
    countExports(content) {
        const exportMatches = content.match(/export\s+/g);
        return exportMatches ? exportMatches.length : 0;
    }
    countImports(content) {
        const importMatches = content.match(/import\s+.*?\s+from\s+['"][^'"]+['"]/g);
        return importMatches ? importMatches.length : 0;
    }
    calculateComplexity(content) {
        const lines = content.split("\n");
        let complexity = 1; // Base complexity
        for (const line of lines) {
            const trimmedLine = line.trim();
            // Count control structures
            if (trimmedLine.includes("if") || trimmedLine.includes("else"))
                complexity++;
            if (trimmedLine.includes("for") || trimmedLine.includes("while"))
                complexity++;
            if (trimmedLine.includes("switch") || trimmedLine.includes("case"))
                complexity++;
            if (trimmedLine.includes("try") || trimmedLine.includes("catch"))
                complexity++;
            if (trimmedLine.includes("&&") || trimmedLine.includes("||"))
                complexity++;
        }
        return complexity;
    }
    calculateCohesion(content, filePath) {
        // Simplified cohesion calculation based on related functionality
        const lines = content.split("\n");
        const functions = this.findFunctions(content);
        const classes = this.countClasses(content);
        if (functions.length === 0 && classes.length === 0)
            return 1.0;
        // Calculate based on naming patterns and related functionality
        const relatedFunctions = this.findRelatedFunctions(content);
        const cohesion = relatedFunctions / Math.max(1, functions.length);
        return Math.min(1.0, cohesion);
    }
    calculateCoupling(content) {
        const imports = this.countImports(content);
        const exports = this.countExports(content);
        // Coupling is based on number of dependencies
        return imports + exports;
    }
    findLongFunctions(content) {
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
                    if (functionLines > this.thresholds.maxFunctionLines) {
                        functions.push({ line: functionStart + 1, lines: functionLines });
                    }
                    inFunction = false;
                }
            }
        }
        return functions;
    }
    findRelatedFunctions(content) {
        // Simplified related function detection based on naming patterns
        const functions = this.findFunctions(content);
        const functionNames = functions.map((f) => f.name || "");
        let relatedCount = 0;
        const nameGroups = new Map();
        for (const name of functionNames) {
            const baseName = name.replace(/(get|set|is|has|can|should|will)/, "");
            nameGroups.set(baseName, (nameGroups.get(baseName) || 0) + 1);
        }
        for (const count of nameGroups.values()) {
            if (count > 1) {
                relatedCount += count;
            }
        }
        return relatedCount;
    }
    findFunctions(content) {
        const functions = [];
        const lines = content.split("\n");
        let inFunction = false;
        let functionStart = 0;
        let functionName = "";
        let braceCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("function") ||
                line.includes("=>") ||
                line.includes("class")) {
                inFunction = true;
                functionStart = i;
                functionName = this.extractFunctionName(line);
                braceCount = 0;
            }
            if (inFunction) {
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                if (braceCount === 0 && line.includes("}")) {
                    const functionLines = i - functionStart + 1;
                    functions.push({
                        name: functionName,
                        line: functionStart + 1,
                        lines: functionLines,
                    });
                    inFunction = false;
                }
            }
        }
        return functions;
    }
    extractFunctionName(line) {
        const functionMatch = line.match(/function\s+(\w+)/);
        if (functionMatch)
            return functionMatch[1];
        const constMatch = line.match(/const\s+(\w+)\s*=/);
        if (constMatch)
            return constMatch[1];
        return "";
    }
    calculateAverageFunctionLength(analyses) {
        let totalFunctions = 0;
        let totalLines = 0;
        for (const analysis of analyses) {
            totalFunctions += analysis.metrics.functions;
            totalLines += analysis.metrics.linesOfCode;
        }
        return totalFunctions > 0 ? totalLines / totalFunctions : 0;
    }
    calculateModularityIndex(analyses) {
        if (analyses.length === 0)
            return 0;
        let totalIndex = 0;
        for (const analysis of analyses) {
            const cohesion = analysis.metrics.cohesion;
            const coupling = Math.max(0, 1 - analysis.metrics.coupling / 20); // Normalize coupling
            const size = Math.max(0, 1 - analysis.metrics.linesOfCode / 200); // Normalize size
            const index = (cohesion + coupling + size) / 3;
            totalIndex += index;
        }
        return totalIndex / analyses.length;
    }
    getDefaultMetrics() {
        return {
            linesOfCode: 0,
            functions: 0,
            classes: 0,
            exports: 0,
            imports: 0,
            complexity: 0,
            cohesion: 1.0,
            coupling: 0,
        };
    }
    getFileSizeSeverity(lines) {
        if (lines > 500)
            return "critical";
        if (lines > 300)
            return "high";
        if (lines > 200)
            return "medium";
        return "low";
    }
    getFunctionLengthSeverity(lines) {
        if (lines > 100)
            return "critical";
        if (lines > 75)
            return "high";
        if (lines > 60)
            return "medium";
        return "low";
    }
    getComplexitySeverity(complexity) {
        if (complexity > 25)
            return "critical";
        if (complexity > 20)
            return "high";
        if (complexity > 15)
            return "medium";
        return "low";
    }
    getCouplingSeverity(coupling) {
        if (coupling > 20)
            return "critical";
        if (coupling > 15)
            return "high";
        if (coupling > 10)
            return "medium";
        return "low";
    }
    getCohesionSeverity(cohesion) {
        if (cohesion < 0.3)
            return "critical";
        if (cohesion < 0.5)
            return "high";
        if (cohesion < 0.7)
            return "medium";
        return "low";
    }
    generateViolationId() {
        return `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
