/**
 * Interface Contract Validator - Advanced Interface Contract Compliance and Validation
 *
 * This module provides comprehensive validation of interface contracts,
 * ensuring API stability, backward compatibility, and contract compliance.
 */
import { readFile, readdir } from "fs/promises";
import { join, basename } from "path";
export class InterfaceContractValidator {
    constructor(codebasePath) {
        Object.defineProperty(this, "codebasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contractCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "violationCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "versionHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.codebasePath = codebasePath;
    }
    /**
     * Perform comprehensive interface contract validation
     */
    async validateInterfaceContracts() {
        console.log("🐺 Starting interface contract validation...");
        const contracts = await this.discoverInterfaceContracts();
        const violations = [];
        // Validate each contract
        for (const contract of contracts) {
            const contractViolations = await this.validateContract(contract);
            violations.push(...contractViolations);
            this.violationCache.set(contract.id, contractViolations);
        }
        // Check for breaking changes
        const breakingChanges = await this.detectBreakingChanges();
        // Generate comprehensive report
        const report = this.generateContractValidationReport(contracts, violations, breakingChanges);
        console.log(`✅ Interface contract validation complete: ${report.overallCompliance.toFixed(1)}% compliance`);
        return report;
    }
    /**
     * Validate a specific interface contract
     */
    async validateContract(contract) {
        const violations = [];
        // Check for missing documentation
        const documentationViolations = this.validateDocumentation(contract);
        violations.push(...documentationViolations);
        // Check for version consistency
        const versionViolations = this.validateVersioning(contract);
        violations.push(...versionViolations);
        // Check for contract stability
        const stabilityViolations = this.validateStability(contract);
        violations.push(...stabilityViolations);
        // Check for breaking changes
        const breakingChangeViolations = this.validateBreakingChanges(contract);
        violations.push(...breakingChangeViolations);
        // Check for compatibility issues
        const compatibilityViolations = this.validateCompatibility(contract);
        violations.push(...compatibilityViolations);
        return violations;
    }
    /**
     * Get contract violations for a specific interface
     */
    getContractViolations(contractId) {
        return this.violationCache.get(contractId) || [];
    }
    /**
     * Get breaking changes for a specific contract
     */
    getBreakingChanges(contractId) {
        const contract = this.contractCache.get(contractId);
        return contract ? contract.metadata.breakingChanges : [];
    }
    /**
     * Check if a contract is compliant
     */
    isContractCompliant(contractId) {
        const violations = this.getContractViolations(contractId);
        return (violations.filter((v) => v.severity === "critical" || v.severity === "high").length === 0);
    }
    /**
     * Get contracts that need immediate attention
     */
    getCriticalContracts() {
        const criticalContracts = [];
        for (const [contractId, violations] of this.violationCache) {
            const criticalViolations = violations.filter((v) => v.severity === "critical");
            if (criticalViolations.length > 0) {
                const contract = this.contractCache.get(contractId);
                if (contract) {
                    criticalContracts.push({ contract, violations: criticalViolations });
                }
            }
        }
        return criticalContracts.sort((a, b) => b.violations.length - a.violations.length);
    }
    /**
     * Generate contract improvement suggestions
     */
    generateContractSuggestions(contractId) {
        const violations = this.getContractViolations(contractId);
        const suggestions = [];
        if (violations.length === 0) {
            suggestions.push("✅ Contract is compliant with standards");
            return suggestions;
        }
        const violationTypes = new Set(violations.map((v) => v.type));
        if (violationTypes.has("documentation-missing")) {
            suggestions.push("📚 Add comprehensive documentation");
        }
        if (violationTypes.has("version-mismatch")) {
            suggestions.push("🔄 Fix version consistency issues");
        }
        if (violationTypes.has("breaking-change")) {
            suggestions.push("⚠️ Address breaking changes");
        }
        if (violationTypes.has("contract-violation")) {
            suggestions.push("📋 Ensure contract compliance");
        }
        if (violationTypes.has("compatibility-issue")) {
            suggestions.push("🔗 Fix compatibility issues");
        }
        return suggestions;
    }
    /**
     * Get contract version history
     */
    getContractVersionHistory(contractId) {
        return this.versionHistory.get(contractId) || [];
    }
    /**
     * Compare two contract versions
     */
    compareContractVersions(contractId, version1, version2) {
        const history = this.getContractVersionHistory(contractId);
        const v1 = history.find((c) => c.version === version1);
        const v2 = history.find((c) => c.version === version2);
        if (!v1 || !v2) {
            return { changes: [], additions: [], removals: [], modifications: [] };
        }
        return this.compareContracts(v1, v2);
    }
    // Private methods
    async discoverInterfaceContracts() {
        const contracts = [];
        const files = await this.discoverFiles();
        for (const file of files) {
            try {
                const content = await readFile(file, "utf-8");
                const fileContracts = this.extractInterfaceContracts(content, file);
                contracts.push(...fileContracts);
                // Cache contracts
                for (const contract of fileContracts) {
                    this.contractCache.set(contract.id, contract);
                }
            }
            catch (error) {
                console.warn(`Failed to analyze file ${file}:`, error);
            }
        }
        return contracts;
    }
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
    extractInterfaceContracts(content, filePath) {
        const contracts = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Interface declarations
            const interfaceMatch = line.match(/interface\s+(\w+)/);
            if (interfaceMatch) {
                const contract = this.parseInterfaceContract(content, filePath, i, "interface", interfaceMatch[1]);
                contracts.push(contract);
            }
            // Type declarations
            const typeMatch = line.match(/type\s+(\w+)\s*=/);
            if (typeMatch) {
                const contract = this.parseInterfaceContract(content, filePath, i, "type", typeMatch[1]);
                contracts.push(contract);
            }
            // Class declarations
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                const contract = this.parseInterfaceContract(content, filePath, i, "class", classMatch[1]);
                contracts.push(contract);
            }
        }
        return contracts;
    }
    parseInterfaceContract(content, filePath, lineNumber, type, name) {
        const lines = content.split("\n");
        const properties = [];
        const methods = [];
        const events = [];
        // Parse contract content (simplified)
        let braceCount = 0;
        let inContract = false;
        for (let i = lineNumber; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("{")) {
                inContract = true;
                braceCount++;
            }
            if (inContract) {
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                // Parse properties and methods
                if (line.includes(":") &&
                    !line.includes("function") &&
                    !line.includes("(")) {
                    const property = this.parseContractProperty(line);
                    if (property)
                        properties.push(property);
                }
                else if (line.includes("(") && line.includes(")")) {
                    const method = this.parseContractMethod(line);
                    if (method)
                        methods.push(method);
                }
                if (braceCount === 0)
                    break;
            }
        }
        return {
            id: this.generateContractId(name, filePath),
            name,
            version: this.extractVersion(content, lineNumber),
            filePath,
            lineNumber: lineNumber + 1,
            type,
            properties,
            methods,
            events,
            metadata: {
                isExported: this.isExported(content, name),
                isPublic: this.isPublic(content, name),
                documentation: this.extractDocumentation(content, lineNumber),
                tags: this.extractTags(content, lineNumber),
                stability: this.extractStability(content, lineNumber),
                lastModified: new Date().toISOString(),
                breakingChanges: [],
            },
        };
    }
    parseContractProperty(line) {
        const propertyMatch = line.match(/(\w+)(\?)?\s*:\s*([^;]+)/);
        if (!propertyMatch)
            return null;
        return {
            name: propertyMatch[1],
            type: propertyMatch[3].trim(),
            isOptional: !!propertyMatch[2],
            isReadonly: line.includes("readonly"),
            documentation: this.extractInlineDocumentation(line),
            constraints: this.extractPropertyConstraints(line),
            version: "1.0.0",
        };
    }
    parseContractMethod(line) {
        const methodMatch = line.match(/(\w+)(\?)?\s*\(([^)]*)\)\s*:\s*([^{;]+)/);
        if (!methodMatch)
            return null;
        const parameters = this.parseContractParameters(methodMatch[3]);
        return {
            name: methodMatch[1],
            parameters,
            returnType: methodMatch[4].trim(),
            isAsync: line.includes("async"),
            isOptional: !!methodMatch[2],
            documentation: this.extractInlineDocumentation(line),
            version: "1.0.0",
            sideEffects: this.extractSideEffects(line),
        };
    }
    parseContractParameters(paramString) {
        if (!paramString.trim())
            return [];
        const parameters = [];
        const paramList = paramString.split(",");
        for (const param of paramList) {
            const paramMatch = param.match(/(\w+)(\?)?\s*:\s*([^=]+)(\s*=\s*(.+))?/);
            if (paramMatch) {
                parameters.push({
                    name: paramMatch[1],
                    type: paramMatch[3].trim(),
                    isOptional: !!paramMatch[2],
                    defaultValue: paramMatch[5]?.trim(),
                    documentation: this.extractInlineDocumentation(param),
                    constraints: this.extractParameterConstraints(param),
                });
            }
        }
        return parameters;
    }
    validateDocumentation(contract) {
        const violations = [];
        // Check for missing contract documentation
        if (!contract.metadata.documentation) {
            violations.push({
                id: this.generateViolationId(),
                type: "documentation-missing",
                severity: "medium",
                contract: contract.name,
                description: "Contract lacks documentation",
                location: `${contract.filePath}:${contract.lineNumber}`,
                suggestion: "Add comprehensive JSDoc documentation",
                impact: {
                    backwardCompatibility: 0.3,
                    forwardCompatibility: 0.2,
                    stability: 0.4,
                    usability: 0.8,
                },
                examples: [
                    "/**\n * Represents a user in the system\n * @version 1.0.0\n * @stable\n */\ninterface IUser { ... }",
                ],
                detectedAt: new Date().toISOString(),
            });
        }
        // Check for missing property documentation
        for (const property of contract.properties) {
            if (!property.documentation) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "documentation-missing",
                    severity: "low",
                    contract: contract.name,
                    description: `Property '${property.name}' lacks documentation`,
                    location: `${contract.filePath}:${contract.lineNumber}`,
                    suggestion: "Add JSDoc documentation for the property",
                    impact: {
                        backwardCompatibility: 0.2,
                        forwardCompatibility: 0.1,
                        stability: 0.3,
                        usability: 0.6,
                    },
                    examples: ["/** User identifier */\nid: string;"],
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        // Check for missing method documentation
        for (const method of contract.methods) {
            if (!method.documentation) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "documentation-missing",
                    severity: "low",
                    contract: contract.name,
                    description: `Method '${method.name}' lacks documentation`,
                    location: `${contract.filePath}:${contract.lineNumber}`,
                    suggestion: "Add JSDoc documentation for the method",
                    impact: {
                        backwardCompatibility: 0.2,
                        forwardCompatibility: 0.1,
                        stability: 0.3,
                        usability: 0.6,
                    },
                    examples: [
                        "/**\n * Calculates the total price\n * @param items - Array of items\n * @returns Total price\n */",
                    ],
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        return violations;
    }
    validateVersioning(contract) {
        const violations = [];
        // Check for missing version information
        if (!contract.version || contract.version === "1.0.0") {
            violations.push({
                id: this.generateViolationId(),
                type: "version-mismatch",
                severity: "medium",
                contract: contract.name,
                description: "Contract lacks proper versioning",
                location: `${contract.filePath}:${contract.lineNumber}`,
                suggestion: "Add proper version information and follow semantic versioning",
                impact: {
                    backwardCompatibility: 0.6,
                    forwardCompatibility: 0.5,
                    stability: 0.7,
                    usability: 0.4,
                },
                examples: ["@version 1.2.3", "@since 1.0.0", "@deprecated 2.0.0"],
                detectedAt: new Date().toISOString(),
            });
        }
        return violations;
    }
    validateStability(contract) {
        const violations = [];
        // Check for experimental contracts without proper warnings
        if (contract.metadata.stability === "experimental" &&
            !contract.metadata.documentation?.includes("experimental")) {
            violations.push({
                id: this.generateViolationId(),
                type: "contract-violation",
                severity: "medium",
                contract: contract.name,
                description: "Experimental contract lacks proper warning",
                location: `${contract.filePath}:${contract.lineNumber}`,
                suggestion: "Add experimental warning to documentation",
                impact: {
                    backwardCompatibility: 0.8,
                    forwardCompatibility: 0.9,
                    stability: 0.2,
                    usability: 0.5,
                },
                examples: [
                    "/**\n * @experimental This API is experimental and may change\n * @version 0.1.0\n */",
                ],
                detectedAt: new Date().toISOString(),
            });
        }
        return violations;
    }
    validateBreakingChanges(contract) {
        const violations = [];
        // Check for breaking changes without proper migration
        for (const breakingChange of contract.metadata.breakingChanges) {
            if (!breakingChange.migration) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "breaking-change",
                    severity: "critical",
                    contract: contract.name,
                    description: `Breaking change '${breakingChange.type}' lacks migration guide`,
                    location: `${contract.filePath}:${contract.lineNumber}`,
                    suggestion: "Provide clear migration instructions",
                    impact: {
                        backwardCompatibility: 1.0,
                        forwardCompatibility: 0.8,
                        stability: 0.9,
                        usability: 0.7,
                    },
                    examples: [
                        "// Migration: Replace oldProperty with newProperty",
                        "// Old: user.oldProperty",
                        "// New: user.newProperty",
                    ],
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        return violations;
    }
    validateCompatibility(contract) {
        const violations = [];
        // Check for deprecated properties without replacements
        for (const property of contract.properties) {
            if (property.deprecated && !property.deprecated.replacement) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "compatibility-issue",
                    severity: "medium",
                    contract: contract.name,
                    description: `Deprecated property '${property.name}' lacks replacement`,
                    location: `${contract.filePath}:${contract.lineNumber}`,
                    suggestion: "Provide replacement property or migration path",
                    impact: {
                        backwardCompatibility: 0.7,
                        forwardCompatibility: 0.6,
                        stability: 0.5,
                        usability: 0.8,
                    },
                    examples: [
                        "/**\n * @deprecated Use newProperty instead\n * @since 2.0.0\n */\noldProperty: string;",
                    ],
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        // Check for deprecated methods without replacements
        for (const method of contract.methods) {
            if (method.deprecated && !method.deprecated.replacement) {
                violations.push({
                    id: this.generateViolationId(),
                    type: "compatibility-issue",
                    severity: "medium",
                    contract: contract.name,
                    description: `Deprecated method '${method.name}' lacks replacement`,
                    location: `${contract.filePath}:${contract.lineNumber}`,
                    suggestion: "Provide replacement method or migration path",
                    impact: {
                        backwardCompatibility: 0.7,
                        forwardCompatibility: 0.6,
                        stability: 0.5,
                        usability: 0.8,
                    },
                    examples: [
                        "/**\n * @deprecated Use newMethod instead\n * @since 2.0.0\n */\noldMethod(): void;",
                    ],
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        return violations;
    }
    async detectBreakingChanges() {
        const breakingChanges = [];
        // Compare current contracts with previous versions
        for (const [contractId, history] of this.versionHistory) {
            if (history.length > 1) {
                const current = history[history.length - 1];
                const previous = history[history.length - 2];
                const changes = this.compareContracts(previous, current);
                breakingChanges.push(...changes.changes);
            }
        }
        return breakingChanges;
    }
    compareContracts(oldContract, newContract) {
        const changes = [];
        const additions = [];
        const removals = [];
        const modifications = [];
        // Compare properties
        const oldProperties = new Map(oldContract.properties.map((p) => [p.name, p]));
        const newProperties = new Map(newContract.properties.map((p) => [p.name, p]));
        for (const [name, newProp] of newProperties) {
            const oldProp = oldProperties.get(name);
            if (!oldProp) {
                additions.push(`Property: ${name}`);
                changes.push({
                    type: "property-added",
                    description: `Property '${name}' was added`,
                    impact: "low",
                    migration: "No migration needed - new property is optional",
                    version: newContract.version,
                    detectedAt: new Date().toISOString(),
                });
            }
            else if (oldProp.type !== newProp.type) {
                modifications.push(`Property: ${name} (type changed)`);
                changes.push({
                    type: "property-type-changed",
                    description: `Property '${name}' type changed from '${oldProp.type}' to '${newProp.type}'`,
                    impact: "critical",
                    migration: `Update code using '${name}' to handle new type '${newProp.type}'`,
                    version: newContract.version,
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        for (const [name, oldProp] of oldProperties) {
            if (!newProperties.has(name)) {
                removals.push(`Property: ${name}`);
                changes.push({
                    type: "property-removed",
                    description: `Property '${name}' was removed`,
                    impact: "critical",
                    migration: `Remove usage of '${name}' or use alternative property`,
                    version: newContract.version,
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        // Compare methods
        const oldMethods = new Map(oldContract.methods.map((m) => [m.name, m]));
        const newMethods = new Map(newContract.methods.map((m) => [m.name, m]));
        for (const [name, newMethod] of newMethods) {
            const oldMethod = oldMethods.get(name);
            if (!oldMethod) {
                additions.push(`Method: ${name}`);
                changes.push({
                    type: "method-added",
                    description: `Method '${name}' was added`,
                    impact: "low",
                    migration: "No migration needed - new method is available",
                    version: newContract.version,
                    detectedAt: new Date().toISOString(),
                });
            }
            else if (this.methodSignaturesDiffer(oldMethod, newMethod)) {
                modifications.push(`Method: ${name} (signature changed)`);
                changes.push({
                    type: "method-signature-changed",
                    description: `Method '${name}' signature changed`,
                    impact: "critical",
                    migration: `Update method calls to '${name}' with new signature`,
                    version: newContract.version,
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        for (const [name, oldMethod] of oldMethods) {
            if (!newMethods.has(name)) {
                removals.push(`Method: ${name}`);
                changes.push({
                    type: "method-removed",
                    description: `Method '${name}' was removed`,
                    impact: "critical",
                    migration: `Remove calls to '${name}' or use alternative method`,
                    version: newContract.version,
                    detectedAt: new Date().toISOString(),
                });
            }
        }
        return { changes, additions, removals, modifications };
    }
    methodSignaturesDiffer(method1, method2) {
        if (method1.parameters.length !== method2.parameters.length)
            return true;
        if (method1.returnType !== method2.returnType)
            return true;
        for (let i = 0; i < method1.parameters.length; i++) {
            const param1 = method1.parameters[i];
            const param2 = method2.parameters[i];
            if (param1.type !== param2.type ||
                param1.isOptional !== param2.isOptional) {
                return true;
            }
        }
        return false;
    }
    generateContractValidationReport(contracts, violations, breakingChanges) {
        const totalContracts = contracts.length;
        const compliantContracts = contracts.filter((contract) => this.isContractCompliant(contract.id)).length;
        const overallCompliance = totalContracts > 0 ? (compliantContracts / totalContracts) * 100 : 100;
        // Group violations by type and severity
        const violationsByType = {};
        const violationsBySeverity = {};
        for (const violation of violations) {
            violationsByType[violation.type] =
                (violationsByType[violation.type] || 0) + 1;
            violationsBySeverity[violation.severity] =
                (violationsBySeverity[violation.severity] || 0) + 1;
        }
        // Get top violations
        const topViolations = violations
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        })
            .slice(0, 10);
        // Calculate compatibility matrix
        const compatibilityMatrix = {
            backwardCompatible: contracts.filter((c) => c.metadata.breakingChanges.length === 0).length,
            forwardCompatible: contracts.filter((c) => c.metadata.stability === "stable").length,
            breakingChanges: breakingChanges.length,
        };
        // Generate recommendations
        const recommendations = this.generateRecommendations(violations, breakingChanges);
        // Determine versioning strategy
        const versioning = this.determineVersioningStrategy(breakingChanges);
        return {
            overallCompliance,
            totalContracts,
            compliantContracts,
            violationsByType,
            violationsBySeverity,
            breakingChanges,
            topViolations,
            compatibilityMatrix,
            recommendations,
            versioning,
        };
    }
    generateRecommendations(violations, breakingChanges) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        const criticalViolations = violations.filter((v) => v.severity === "critical");
        const highViolations = violations.filter((v) => v.severity === "high");
        const breakingChangeCount = breakingChanges.length;
        if (criticalViolations.length > 0) {
            immediate.push(`🚨 Address ${criticalViolations.length} critical contract violations`);
        }
        if (breakingChangeCount > 0) {
            immediate.push(`⚠️ Handle ${breakingChangeCount} breaking changes`);
        }
        if (highViolations.length > 0) {
            immediate.push(`🔧 Fix ${highViolations.length} high-severity violations`);
        }
        shortTerm.push("📚 Implement comprehensive contract documentation");
        shortTerm.push("🔄 Establish proper versioning strategy");
        shortTerm.push("🔍 Add contract validation to CI/CD pipeline");
        longTerm.push("🏗️ Establish contract design guidelines");
        longTerm.push("📊 Implement contract monitoring and alerting");
        longTerm.push("🎓 Conduct contract design training");
        longTerm.push("🔄 Implement automated contract testing");
        return { immediate, shortTerm, longTerm };
    }
    determineVersioningStrategy(breakingChanges) {
        const currentVersion = "1.0.0";
        let nextVersion = "1.1.0";
        let recommendedVersion = "1.1.0";
        let versioningStrategy = "Semantic Versioning";
        if (breakingChanges.length > 0) {
            const criticalChanges = breakingChanges.filter((bc) => bc.impact === "critical").length;
            const highChanges = breakingChanges.filter((bc) => bc.impact === "high").length;
            if (criticalChanges > 0) {
                nextVersion = "2.0.0";
                recommendedVersion = "2.0.0";
                versioningStrategy =
                    "Major version bump required due to breaking changes";
            }
            else if (highChanges > 0) {
                nextVersion = "1.1.0";
                recommendedVersion = "1.1.0";
                versioningStrategy = "Minor version bump for significant changes";
            }
        }
        return {
            currentVersion,
            nextVersion,
            recommendedVersion,
            versioningStrategy,
        };
    }
    // Helper methods
    isExported(content, name) {
        return (content.includes(`export ${name}`) ||
            content.includes(`export { ${name} }`));
    }
    isPublic(content, name) {
        return (!content.includes(`private ${name}`) &&
            !content.includes(`protected ${name}`));
    }
    extractDocumentation(content, lineNumber) {
        const lines = content.split("\n");
        const docLines = [];
        for (let i = lineNumber - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith("*")) {
                docLines.unshift(line.replace(/^\*\s?/, ""));
            }
            else if (line.startsWith("/**")) {
                docLines.unshift(line.replace(/^\/\*\*\s?/, ""));
                break;
            }
            else if (line === "" || line.startsWith("//")) {
                continue;
            }
            else {
                break;
            }
        }
        return docLines.length > 0 ? docLines.join("\n") : undefined;
    }
    extractTags(content, lineNumber) {
        const documentation = this.extractDocumentation(content, lineNumber);
        if (!documentation)
            return [];
        const tagMatches = documentation.match(/@(\w+)/g);
        return tagMatches ? tagMatches.map((tag) => tag.substring(1)) : [];
    }
    extractVersion(content, lineNumber) {
        const tags = this.extractTags(content, lineNumber);
        const versionTag = tags.find((tag) => tag.startsWith("version"));
        return versionTag ? versionTag.split(" ")[1] : "1.0.0";
    }
    extractStability(content, lineNumber) {
        const tags = this.extractTags(content, lineNumber);
        if (tags.includes("experimental"))
            return "experimental";
        if (tags.includes("beta"))
            return "beta";
        if (tags.includes("deprecated"))
            return "deprecated";
        return "stable";
    }
    extractInlineDocumentation(line) {
        const commentMatch = line.match(/\/\*\*([^*]+)\*\//);
        return commentMatch ? commentMatch[1].trim() : undefined;
    }
    extractPropertyConstraints(line) {
        const constraints = [];
        // Extract common constraints
        if (line.includes("@min")) {
            const minMatch = line.match(/@min\s+(\d+)/);
            if (minMatch) {
                constraints.push({
                    type: "min",
                    value: parseInt(minMatch[1]),
                    message: `Minimum value: ${minMatch[1]}`,
                });
            }
        }
        if (line.includes("@max")) {
            const maxMatch = line.match(/@max\s+(\d+)/);
            if (maxMatch) {
                constraints.push({
                    type: "max",
                    value: parseInt(maxMatch[1]),
                    message: `Maximum value: ${maxMatch[1]}`,
                });
            }
        }
        return constraints;
    }
    extractParameterConstraints(param) {
        const constraints = [];
        // Extract common constraints
        if (param.includes("@required")) {
            constraints.push({
                type: "required",
                value: true,
                message: "Parameter is required",
            });
        }
        return constraints;
    }
    extractSideEffects(line) {
        const sideEffects = [];
        if (line.includes("database") || line.includes("db")) {
            sideEffects.push("database");
        }
        if (line.includes("file") || line.includes("fs")) {
            sideEffects.push("file-system");
        }
        if (line.includes("network") || line.includes("http")) {
            sideEffects.push("network");
        }
        return sideEffects;
    }
    generateContractId(name, filePath) {
        return `${name}-${basename(filePath)}-${Date.now()}`;
    }
    generateViolationId() {
        return `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
