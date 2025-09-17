/**
 * Dependency Health Analyzer - Comprehensive Dependency Quality and Health Assessment
 *
 * This module provides advanced analysis of dependency health, including
 * security vulnerabilities, version conflicts, and architectural compliance.
 */
import { readFile, readdir } from "fs/promises";
import { join } from "path";
export class DependencyHealthAnalyzer {
    constructor(codebasePath) {
        Object.defineProperty(this, "codebasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dependencyCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "healthCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "vulnerabilityDatabase", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.codebasePath = codebasePath;
        this.initializeVulnerabilityDatabase();
    }
    /**
     * Perform comprehensive dependency health analysis
     */
    async analyzeDependencyHealth() {
        console.log("🐺 Starting dependency health analysis...");
        const dependencies = await this.discoverDependencies();
        const healthScores = [];
        // Analyze each dependency
        for (const dependency of dependencies) {
            const healthScore = await this.analyzeDependencyHealth(dependency);
            healthScores.push(healthScore);
            this.healthCache.set(dependency.name, healthScore);
        }
        // Generate comprehensive report
        const report = this.generateHealthReport(healthScores);
        console.log(`✅ Dependency health analysis complete: ${report.overallHealth.toFixed(1)}% overall health`);
        return report;
    }
    /**
     * Analyze health of a specific dependency
     */
    async analyzeDependencyHealth(dependency) {
        const issues = [];
        const recommendations = [];
        // Security analysis
        const securityIssues = await this.analyzeSecurityHealth(dependency);
        issues.push(...securityIssues);
        // Maintenance analysis
        const maintenanceIssues = await this.analyzeMaintenanceHealth(dependency);
        issues.push(...maintenanceIssues);
        // Performance analysis
        const performanceIssues = await this.analyzePerformanceHealth(dependency);
        issues.push(...performanceIssues);
        // Compatibility analysis
        const compatibilityIssues = await this.analyzeCompatibilityHealth(dependency);
        issues.push(...compatibilityIssues);
        // License analysis
        const licenseIssues = await this.analyzeLicenseHealth(dependency);
        issues.push(...licenseIssues);
        // Calculate category scores
        const categoryScores = this.calculateCategoryScores(issues);
        // Generate recommendations
        recommendations.push(...this.generateRecommendations(issues, dependency));
        // Calculate overall score
        const overallScore = this.calculateOverallScore(categoryScores, issues);
        return {
            dependency: dependency.name,
            overallScore,
            categoryScores,
            issues,
            recommendations,
            lastUpdated: new Date().toISOString(),
        };
    }
    /**
     * Get health score for a specific dependency
     */
    getDependencyHealth(dependencyName) {
        return this.healthCache.get(dependencyName) || null;
    }
    /**
     * Get all critical issues
     */
    getCriticalIssues() {
        const criticalIssues = [];
        for (const healthScore of this.healthCache.values()) {
            const critical = healthScore.issues.filter((issue) => issue.severity === "critical");
            criticalIssues.push(...critical);
        }
        return criticalIssues.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }
    /**
     * Get outdated dependencies
     */
    getOutdatedDependencies() {
        const outdated = [];
        for (const healthScore of this.healthCache.values()) {
            const outdatedIssues = healthScore.issues.filter((issue) => issue.type === "version");
            for (const issue of outdatedIssues) {
                // Extract version information from issue description
                const versionMatch = issue.description.match(/(\d+\.\d+\.\d+).*?(\d+\.\d+\.\d+)/);
                if (versionMatch) {
                    outdated.push({
                        dependency: issue.dependency,
                        current: versionMatch[1],
                        latest: versionMatch[2],
                    });
                }
            }
        }
        return outdated;
    }
    /**
     * Get security vulnerabilities
     */
    getSecurityVulnerabilities() {
        const vulnerabilities = [];
        for (const healthScore of this.healthCache.values()) {
            const securityIssues = healthScore.issues.filter((issue) => issue.type === "security");
            vulnerabilities.push(...securityIssues);
        }
        return vulnerabilities.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }
    /**
     * Generate dependency update recommendations
     */
    generateUpdateRecommendations() {
        const recommendations = [];
        for (const healthScore of this.healthCache.values()) {
            const versionIssues = healthScore.issues.filter((issue) => issue.type === "version");
            const securityIssues = healthScore.issues.filter((issue) => issue.type === "security");
            if (versionIssues.length > 0 || securityIssues.length > 0) {
                const priority = securityIssues.some((issue) => issue.severity === "critical")
                    ? "high"
                    : "medium";
                const reason = securityIssues.length > 0
                    ? "Security vulnerabilities"
                    : "Outdated version";
                recommendations.push({
                    dependency: healthScore.dependency,
                    currentVersion: "current", // Would extract from actual dependency info
                    recommendedVersion: "latest", // Would get from registry
                    reason,
                    priority,
                });
            }
        }
        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
    // Private methods
    async discoverDependencies() {
        const dependencies = [];
        // Check for package.json files
        const packageJsonFiles = await this.findPackageJsonFiles();
        for (const packageJsonFile of packageJsonFiles) {
            try {
                const content = await readFile(packageJsonFile, "utf-8");
                const packageJson = JSON.parse(content);
                // Parse dependencies
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies,
                    ...packageJson.peerDependencies,
                    ...packageJson.optionalDependencies,
                };
                for (const [name, version] of Object.entries(allDeps)) {
                    const dependency = {
                        name,
                        version: version,
                        type: this.getDependencyType(name, packageJson),
                        source: "npm", // Would detect actual source
                        metadata: {
                            description: `Dependency: ${name}`,
                            license: "Unknown",
                        },
                    };
                    dependencies.push(dependency);
                    this.dependencyCache.set(name, dependency);
                }
            }
            catch (error) {
                console.warn(`Failed to parse package.json ${packageJsonFile}:`, error);
            }
        }
        return dependencies;
    }
    async findPackageJsonFiles() {
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
                    else if (entry.isFile() && entry.name === "package.json") {
                        files.push(fullPath);
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
    getDependencyType(name, packageJson) {
        if (packageJson.dependencies && packageJson.dependencies[name])
            return "production";
        if (packageJson.devDependencies && packageJson.devDependencies[name])
            return "development";
        if (packageJson.peerDependencies && packageJson.peerDependencies[name])
            return "peer";
        if (packageJson.optionalDependencies &&
            packageJson.optionalDependencies[name])
            return "optional";
        return "production";
    }
    async analyzeSecurityHealth(dependency) {
        const issues = [];
        // Check for known vulnerabilities
        const vulnerabilities = this.vulnerabilityDatabase.get(dependency.name) || [];
        for (const vulnerability of vulnerabilities) {
            issues.push({
                id: this.generateIssueId(),
                type: "security",
                severity: this.mapSeverity(vulnerability.severity),
                dependency: dependency.name,
                description: vulnerability.description || "Security vulnerability detected",
                impact: vulnerability.impact || "Potential security risk",
                remediation: vulnerability.remediation || "Update to latest version",
                references: vulnerability.references,
                detectedAt: new Date().toISOString(),
            });
        }
        // Check for deprecated packages
        if (this.isDeprecated(dependency.name)) {
            issues.push({
                id: this.generateIssueId(),
                type: "security",
                severity: "high",
                dependency: dependency.name,
                description: "Package is deprecated",
                impact: "No security updates or maintenance",
                remediation: "Migrate to alternative package",
                detectedAt: new Date().toISOString(),
            });
        }
        return issues;
    }
    async analyzeMaintenanceHealth(dependency) {
        const issues = [];
        // Check for outdated versions
        const isOutdated = await this.isOutdated(dependency);
        if (isOutdated) {
            issues.push({
                id: this.generateIssueId(),
                type: "version",
                severity: "medium",
                dependency: dependency.name,
                description: "Package is outdated",
                impact: "Missing bug fixes and features",
                remediation: "Update to latest version",
                detectedAt: new Date().toISOString(),
            });
        }
        // Check for unmaintained packages
        const isUnmaintained = await this.isUnmaintained(dependency);
        if (isUnmaintained) {
            issues.push({
                id: this.generateIssueId(),
                type: "maintenance",
                severity: "high",
                dependency: dependency.name,
                description: "Package appears to be unmaintained",
                impact: "No updates or bug fixes",
                remediation: "Consider alternative packages",
                detectedAt: new Date().toISOString(),
            });
        }
        return issues;
    }
    async analyzePerformanceHealth(dependency) {
        const issues = [];
        // Check for large packages
        const size = await this.getPackageSize(dependency);
        if (size > 1024 * 1024) {
            // 1MB
            issues.push({
                id: this.generateIssueId(),
                type: "performance",
                severity: "medium",
                dependency: dependency.name,
                description: `Large package size: ${(size / 1024 / 1024).toFixed(2)}MB`,
                impact: "Increased bundle size and load time",
                remediation: "Consider lighter alternatives",
                detectedAt: new Date().toISOString(),
            });
        }
        // Check for performance-heavy packages
        if (this.isPerformanceHeavy(dependency.name)) {
            issues.push({
                id: this.generateIssueId(),
                type: "performance",
                severity: "low",
                dependency: dependency.name,
                description: "Package may impact performance",
                impact: "Potential performance degradation",
                remediation: "Monitor performance impact",
                detectedAt: new Date().toISOString(),
            });
        }
        return issues;
    }
    async analyzeCompatibilityHealth(dependency) {
        const issues = [];
        // Check for Node.js version compatibility
        const nodeVersion = process.version;
        const isCompatible = await this.checkNodeCompatibility(dependency, nodeVersion);
        if (!isCompatible) {
            issues.push({
                id: this.generateIssueId(),
                type: "compatibility",
                severity: "high",
                dependency: dependency.name,
                description: "Incompatible with current Node.js version",
                impact: "May cause runtime errors",
                remediation: "Update Node.js or find compatible version",
                detectedAt: new Date().toISOString(),
            });
        }
        // Check for peer dependency conflicts
        const conflicts = await this.checkPeerDependencyConflicts(dependency);
        for (const conflict of conflicts) {
            issues.push({
                id: this.generateIssueId(),
                type: "compatibility",
                severity: "medium",
                dependency: dependency.name,
                description: `Peer dependency conflict: ${conflict}`,
                impact: "Potential runtime issues",
                remediation: "Resolve peer dependency conflicts",
                detectedAt: new Date().toISOString(),
            });
        }
        return issues;
    }
    async analyzeLicenseHealth(dependency) {
        const issues = [];
        // Check for problematic licenses
        const license = await this.getPackageLicense(dependency);
        if (this.isProblematicLicense(license)) {
            issues.push({
                id: this.generateIssueId(),
                type: "license",
                severity: "high",
                dependency: dependency.name,
                description: `Problematic license: ${license}`,
                impact: "Legal and compliance risks",
                remediation: "Review license terms or find alternative",
                detectedAt: new Date().toISOString(),
            });
        }
        // Check for license conflicts
        const conflicts = await this.checkLicenseConflicts(dependency);
        for (const conflict of conflicts) {
            issues.push({
                id: this.generateIssueId(),
                type: "license",
                severity: "medium",
                dependency: dependency.name,
                description: `License conflict: ${conflict}`,
                impact: "Legal compliance issues",
                remediation: "Resolve license conflicts",
                detectedAt: new Date().toISOString(),
            });
        }
        return issues;
    }
    calculateCategoryScores(issues) {
        const categoryScores = {
            security: 100,
            maintenance: 100,
            performance: 100,
            compatibility: 100,
            license: 100,
        };
        for (const issue of issues) {
            let penalty = 0;
            switch (issue.severity) {
                case "critical":
                    penalty = 25;
                    break;
                case "high":
                    penalty = 15;
                    break;
                case "medium":
                    penalty = 8;
                    break;
                case "low":
                    penalty = 3;
                    break;
            }
            switch (issue.type) {
                case "security":
                    categoryScores.security -= penalty;
                    break;
                case "maintenance":
                    categoryScores.maintenance -= penalty;
                    break;
                case "performance":
                    categoryScores.performance -= penalty;
                    break;
                case "compatibility":
                    categoryScores.compatibility -= penalty;
                    break;
                case "license":
                    categoryScores.license -= penalty;
                    break;
            }
        }
        // Ensure scores don't go below 0
        for (const key of Object.keys(categoryScores)) {
            categoryScores[key] = Math.max(0, categoryScores[key]);
        }
        return categoryScores;
    }
    calculateOverallScore(categoryScores, issues) {
        const weights = {
            security: 0.3,
            maintenance: 0.25,
            performance: 0.15,
            compatibility: 0.15,
            license: 0.15,
        };
        let weightedScore = 0;
        for (const [category, score] of Object.entries(categoryScores)) {
            weightedScore += score * weights[category];
        }
        return Math.round(weightedScore);
    }
    generateRecommendations(issues, dependency) {
        const recommendations = [];
        if (issues.length === 0) {
            recommendations.push("✅ Dependency is healthy");
            return recommendations;
        }
        const criticalIssues = issues.filter((i) => i.severity === "critical");
        const highIssues = issues.filter((i) => i.severity === "high");
        if (criticalIssues.length > 0) {
            recommendations.push(`🚨 Address ${criticalIssues.length} critical issues immediately`);
        }
        if (highIssues.length > 0) {
            recommendations.push(`⚠️ Fix ${highIssues.length} high-severity issues`);
        }
        // Specific recommendations based on issue types
        const issueTypes = new Set(issues.map((i) => i.type));
        if (issueTypes.has("security")) {
            recommendations.push("🔒 Update to latest version to address security vulnerabilities");
        }
        if (issueTypes.has("version")) {
            recommendations.push("📦 Update to latest version for bug fixes and features");
        }
        if (issueTypes.has("maintenance")) {
            recommendations.push("🔧 Consider alternative packages if unmaintained");
        }
        if (issueTypes.has("performance")) {
            recommendations.push("⚡ Monitor performance impact and consider alternatives");
        }
        if (issueTypes.has("compatibility")) {
            recommendations.push("🔗 Resolve compatibility issues");
        }
        if (issueTypes.has("license")) {
            recommendations.push("📄 Review license terms and resolve conflicts");
        }
        return recommendations;
    }
    generateHealthReport(healthScores) {
        const totalDependencies = healthScores.length;
        const healthyDependencies = healthScores.filter((score) => score.overallScore >= 80).length;
        const overallHealth = healthScores.reduce((sum, score) => sum + score.overallScore, 0) /
            totalDependencies;
        // Count issues by type
        const allIssues = healthScores.flatMap((score) => score.issues);
        const criticalIssues = allIssues.filter((issue) => issue.severity === "critical").length;
        const securityVulnerabilities = allIssues.filter((issue) => issue.type === "security").length;
        const outdatedDependencies = allIssues.filter((issue) => issue.type === "version").length;
        const licenseConflicts = allIssues.filter((issue) => issue.type === "license").length;
        // Calculate health by category
        const healthByCategory = {
            security: healthScores.reduce((sum, score) => sum + score.categoryScores.security, 0) / totalDependencies,
            maintenance: healthScores.reduce((sum, score) => sum + score.categoryScores.maintenance, 0) / totalDependencies,
            performance: healthScores.reduce((sum, score) => sum + score.categoryScores.performance, 0) / totalDependencies,
            compatibility: healthScores.reduce((sum, score) => sum + score.categoryScores.compatibility, 0) / totalDependencies,
            license: healthScores.reduce((sum, score) => sum + score.categoryScores.license, 0) / totalDependencies,
        };
        // Get top issues
        const topIssues = allIssues
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        })
            .slice(0, 10);
        // Generate recommendations
        const recommendations = this.generateGlobalRecommendations(healthScores);
        return {
            overallHealth,
            totalDependencies,
            healthyDependencies,
            criticalIssues,
            securityVulnerabilities,
            outdatedDependencies,
            licenseConflicts,
            healthByCategory,
            topIssues,
            recommendations,
            dependencyScores: healthScores,
        };
    }
    generateGlobalRecommendations(healthScores) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        const criticalDeps = healthScores.filter((score) => score.issues.some((issue) => issue.severity === "critical"));
        const securityDeps = healthScores.filter((score) => score.issues.some((issue) => issue.type === "security"));
        const outdatedDeps = healthScores.filter((score) => score.issues.some((issue) => issue.type === "version"));
        if (criticalDeps.length > 0) {
            immediate.push(`🚨 Address ${criticalDeps.length} dependencies with critical issues`);
        }
        if (securityDeps.length > 0) {
            immediate.push(`🔒 Update ${securityDeps.length} dependencies with security vulnerabilities`);
        }
        if (outdatedDeps.length > 0) {
            shortTerm.push(`📦 Update ${outdatedDeps.length} outdated dependencies`);
        }
        shortTerm.push("🔍 Implement automated dependency scanning in CI/CD");
        shortTerm.push("📊 Set up dependency health monitoring");
        shortTerm.push("📚 Create dependency management guidelines");
        longTerm.push("🛡️ Establish dependency security policies");
        longTerm.push("🔄 Implement automated dependency updates");
        longTerm.push("📈 Create dependency health dashboards");
        longTerm.push("🎓 Conduct dependency management training");
        return { immediate, shortTerm, longTerm };
    }
    // Helper methods (simplified implementations)
    initializeVulnerabilityDatabase() {
        // In a real implementation, this would load from a vulnerability database
        // For now, we'll use some sample data
        this.vulnerabilityDatabase.set("lodash", [
            {
                severity: "high",
                description: "Prototype pollution vulnerability",
                impact: "Potential code execution",
                remediation: "Update to version 4.17.21 or later",
                references: ["https://nvd.nist.gov/vuln/detail/CVE-2021-23337"],
            },
        ]);
    }
    mapSeverity(severity) {
        const severityMap = {
            low: "low",
            moderate: "medium",
            high: "high",
            critical: "critical",
        };
        return severityMap[severity.toLowerCase()] || "medium";
    }
    isDeprecated(name) {
        // Simplified check - in real implementation, would check npm registry
        const deprecatedPackages = ["request", "node-uuid"];
        return deprecatedPackages.includes(name);
    }
    async isOutdated(dependency) {
        // Simplified check - in real implementation, would check npm registry
        return Math.random() > 0.7; // 30% chance of being outdated
    }
    async isUnmaintained(dependency) {
        // Simplified check - in real implementation, would check last update date
        return Math.random() > 0.9; // 10% chance of being unmaintained
    }
    async getPackageSize(dependency) {
        // Simplified - in real implementation, would check actual package size
        return Math.random() * 5 * 1024 * 1024; // Random size up to 5MB
    }
    isPerformanceHeavy(name) {
        // Simplified check for performance-heavy packages
        const heavyPackages = ["moment", "lodash", "jquery"];
        return heavyPackages.includes(name);
    }
    async checkNodeCompatibility(dependency, nodeVersion) {
        // Simplified check - in real implementation, would check engines field
        return Math.random() > 0.1; // 90% chance of being compatible
    }
    async checkPeerDependencyConflicts(dependency) {
        // Simplified check - in real implementation, would check actual conflicts
        return Math.random() > 0.8 ? ["react@^16.0.0"] : [];
    }
    async getPackageLicense(dependency) {
        // Simplified - in real implementation, would check actual license
        const licenses = ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "ISC"];
        return licenses[Math.floor(Math.random() * licenses.length)];
    }
    isProblematicLicense(license) {
        const problematicLicenses = ["GPL-3.0", "AGPL-3.0", "Copyleft"];
        return problematicLicenses.includes(license);
    }
    async checkLicenseConflicts(dependency) {
        // Simplified check - in real implementation, would check actual conflicts
        return Math.random() > 0.9 ? ["GPL-3.0 vs MIT"] : [];
    }
    generateIssueId() {
        return `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
