/**
 * Interface Consistency Validator - Advanced Interface Design and Consistency Analysis
 *
 * This module provides comprehensive validation of interface consistency,
 * ensuring proper API design, contract compliance, and architectural patterns.
 */

import { readFile, readdir, stat } from "fs/promises";
import { join, dirname, basename } from "path";

export interface InterfaceDefinition {
  name: string;
  type: "interface" | "type" | "class" | "function" | "api-endpoint";
  filePath: string;
  lineNumber: number;
  properties: InterfaceProperty[];
  methods: InterfaceMethod[];
  extends?: string[];
  implements?: string[];
  metadata: {
    isExported: boolean;
    isPublic: boolean;
    documentation?: string;
    tags?: string[];
    version?: string;
  };
}

export interface InterfaceProperty {
  name: string;
  type: string;
  isOptional: boolean;
  isReadonly: boolean;
  defaultValue?: any;
  documentation?: string;
}

export interface InterfaceMethod {
  name: string;
  parameters: MethodParameter[];
  returnType: string;
  isAsync: boolean;
  isOptional: boolean;
  documentation?: string;
}

export interface MethodParameter {
  name: string;
  type: string;
  isOptional: boolean;
  defaultValue?: any;
  documentation?: string;
}

export interface ConsistencyViolation {
  id: string;
  type:
    | "naming"
    | "structure"
    | "documentation"
    | "versioning"
    | "contract"
    | "pattern";
  severity: "low" | "medium" | "high" | "critical";
  interface: string;
  description: string;
  suggestion: string;
  examples: string[];
  impact: {
    maintainability: number;
    usability: number;
    consistency: number;
    reliability: number;
  };
}

export interface ConsistencyReport {
  overallConsistency: number; // 0-100
  totalInterfaces: number;
  consistentInterfaces: number;
  violationsByType: Record<string, number>;
  violationsBySeverity: Record<string, number>;
  topViolations: ConsistencyViolation[];
  interfaceScores: Map<string, number>;
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  patterns: {
    detected: string[];
    recommended: string[];
    violations: string[];
  };
}

export class InterfaceConsistencyValidator {
  private readonly codebasePath: string;
  private readonly interfaceCache: Map<string, InterfaceDefinition> = new Map();
  private readonly violationCache: Map<string, ConsistencyViolation[]> =
    new Map();
  private readonly patterns = {
    naming: {
      interfaces: /^I[A-Z][a-zA-Z0-9]*$/,
      types: /^[A-Z][a-zA-Z0-9]*$/,
      methods: /^[a-z][a-zA-Z0-9]*$/,
      properties: /^[a-z][a-zA-Z0-9]*$/,
    },
    structure: {
      maxProperties: 10,
      maxMethods: 15,
      maxParameters: 5,
    },
  };

  constructor(codebasePath: string) {
    this.codebasePath = codebasePath;
  }

  /**
   * Perform comprehensive interface consistency validation
   */
  async validateInterfaceConsistency(): Promise<ConsistencyReport> {
    console.log("🐺 Starting interface consistency validation...");

    const interfaces = await this.discoverInterfaces();
    const violations: ConsistencyViolation[] = [];
    const interfaceScores = new Map<string, number>();

    // Analyze each interface
    for (const interfaceDef of interfaces) {
      const interfaceViolations = await this.validateInterface(interfaceDef);
      violations.push(...interfaceViolations);
      this.violationCache.set(interfaceDef.name, interfaceViolations);

      // Calculate interface score
      const score = this.calculateInterfaceScore(
        interfaceDef,
        interfaceViolations,
      );
      interfaceScores.set(interfaceDef.name, score);
    }

    // Generate comprehensive report
    const report = this.generateConsistencyReport(
      interfaces,
      violations,
      interfaceScores,
    );

    console.log(
      `✅ Interface consistency validation complete: ${report.overallConsistency.toFixed(1)}% consistency`,
    );
    return report;
  }

  /**
   * Validate a specific interface
   */
  async validateInterface(
    interfaceDef: InterfaceDefinition,
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = [];

    // Naming consistency
    const namingViolations = this.validateNamingConsistency(interfaceDef);
    violations.push(...namingViolations);

    // Structure consistency
    const structureViolations = this.validateStructureConsistency(interfaceDef);
    violations.push(...structureViolations);

    // Documentation consistency
    const documentationViolations =
      this.validateDocumentationConsistency(interfaceDef);
    violations.push(...documentationViolations);

    // Versioning consistency
    const versioningViolations =
      this.validateVersioningConsistency(interfaceDef);
    violations.push(...versioningViolations);

    // Contract consistency
    const contractViolations =
      await this.validateContractConsistency(interfaceDef);
    violations.push(...contractViolations);

    // Pattern consistency
    const patternViolations = this.validatePatternConsistency(interfaceDef);
    violations.push(...patternViolations);

    return violations;
  }

  /**
   * Get consistency score for a specific interface
   */
  getInterfaceScore(interfaceName: string): number {
    const violations = this.violationCache.get(interfaceName) || [];
    return this.calculateInterfaceScore(
      this.interfaceCache.get(interfaceName)!,
      violations,
    );
  }

  /**
   * Get violations for a specific interface
   */
  getInterfaceViolations(interfaceName: string): ConsistencyViolation[] {
    return this.violationCache.get(interfaceName) || [];
  }

  /**
   * Check if an interface is consistent
   */
  isInterfaceConsistent(interfaceName: string): boolean {
    const score = this.getInterfaceScore(interfaceName);
    return score >= 80;
  }

  /**
   * Get interfaces that need immediate attention
   */
  getCriticalInterfaces(): Array<{
    interface: InterfaceDefinition;
    violations: ConsistencyViolation[];
  }> {
    const criticalInterfaces: Array<{
      interface: InterfaceDefinition;
      violations: ConsistencyViolation[];
    }> = [];

    for (const [interfaceName, violations] of this.violationCache) {
      const criticalViolations = violations.filter(
        (v) => v.severity === "critical",
      );
      if (criticalViolations.length > 0) {
        const interfaceDef = this.interfaceCache.get(interfaceName);
        if (interfaceDef) {
          criticalInterfaces.push({
            interface: interfaceDef,
            violations: criticalViolations,
          });
        }
      }
    }

    return criticalInterfaces.sort(
      (a, b) => b.violations.length - a.violations.length,
    );
  }

  /**
   * Generate interface improvement suggestions
   */
  generateImprovementSuggestions(interfaceName: string): string[] {
    const violations = this.getInterfaceViolations(interfaceName);
    const suggestions: string[] = [];

    if (violations.length === 0) {
      suggestions.push("✅ Interface is consistent with standards");
      return suggestions;
    }

    const violationTypes = new Set(violations.map((v) => v.type));

    if (violationTypes.has("naming")) {
      suggestions.push("📝 Fix naming convention violations");
    }

    if (violationTypes.has("structure")) {
      suggestions.push("🏗️ Refactor interface structure");
    }

    if (violationTypes.has("documentation")) {
      suggestions.push("📚 Add comprehensive documentation");
    }

    if (violationTypes.has("versioning")) {
      suggestions.push("🔄 Implement proper versioning");
    }

    if (violationTypes.has("contract")) {
      suggestions.push("📋 Ensure contract compliance");
    }

    if (violationTypes.has("pattern")) {
      suggestions.push("🎯 Follow established patterns");
    }

    return suggestions;
  }

  // Private methods
  private async discoverInterfaces(): Promise<InterfaceDefinition[]> {
    const interfaces: InterfaceDefinition[] = [];
    const files = await this.discoverFiles();

    for (const file of files) {
      try {
        const content = await readFile(file, "utf-8");
        const fileInterfaces = this.extractInterfaces(content, file);
        interfaces.push(...fileInterfaces);

        // Cache interfaces
        for (const interfaceDef of fileInterfaces) {
          this.interfaceCache.set(interfaceDef.name, interfaceDef);
        }
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    return interfaces;
  }

  private async discoverFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (entry.isDirectory()) {
            if (
              !["node_modules", ".git", "dist", "build", "coverage"].includes(
                entry.name,
              )
            ) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = fullPath.split(".").pop();
            if (["ts", "tsx", "js", "jsx"].includes(ext || "")) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
      }
    };

    await scanDirectory(this.codebasePath);
    return files;
  }

  private extractInterfaces(
    content: string,
    filePath: string,
  ): InterfaceDefinition[] {
    const interfaces: InterfaceDefinition[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Interface declarations
      const interfaceMatch = line.match(/interface\s+(\w+)/);
      if (interfaceMatch) {
        const interfaceDef = this.parseInterface(
          content,
          filePath,
          i,
          "interface",
          interfaceMatch[1],
        );
        interfaces.push(interfaceDef);
      }

      // Type declarations
      const typeMatch = line.match(/type\s+(\w+)\s*=/);
      if (typeMatch) {
        const interfaceDef = this.parseInterface(
          content,
          filePath,
          i,
          "type",
          typeMatch[1],
        );
        interfaces.push(interfaceDef);
      }

      // Class declarations
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        const interfaceDef = this.parseInterface(
          content,
          filePath,
          i,
          "class",
          classMatch[1],
        );
        interfaces.push(interfaceDef);
      }

      // Function declarations
      const functionMatch = line.match(/function\s+(\w+)/);
      if (functionMatch) {
        const interfaceDef = this.parseInterface(
          content,
          filePath,
          i,
          "function",
          functionMatch[1],
        );
        interfaces.push(interfaceDef);
      }
    }

    return interfaces;
  }

  private parseInterface(
    content: string,
    filePath: string,
    lineNumber: number,
    type: InterfaceDefinition["type"],
    name: string,
  ): InterfaceDefinition {
    const lines = content.split("\n");
    const properties: InterfaceProperty[] = [];
    const methods: InterfaceMethod[] = [];

    // Parse interface content (simplified)
    let braceCount = 0;
    let inInterface = false;

    for (let i = lineNumber; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes("{")) {
        inInterface = true;
        braceCount++;
      }

      if (inInterface) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        // Parse properties and methods
        if (line.includes(":") && !line.includes("function")) {
          const property = this.parseProperty(line);
          if (property) properties.push(property);
        } else if (line.includes("(") && line.includes(")")) {
          const method = this.parseMethod(line);
          if (method) methods.push(method);
        }

        if (braceCount === 0) break;
      }
    }

    return {
      name,
      type,
      filePath,
      lineNumber: lineNumber + 1,
      properties,
      methods,
      metadata: {
        isExported: this.isExported(content, name),
        isPublic: this.isPublic(content, name),
        documentation: this.extractDocumentation(content, lineNumber),
        tags: this.extractTags(content, lineNumber),
        version: this.extractVersion(content, lineNumber),
      },
    };
  }

  private parseProperty(line: string): InterfaceProperty | null {
    const propertyMatch = line.match(/(\w+)(\?)?\s*:\s*([^;]+)/);
    if (!propertyMatch) return null;

    return {
      name: propertyMatch[1],
      type: propertyMatch[3].trim(),
      isOptional: !!propertyMatch[2],
      isReadonly: line.includes("readonly"),
      documentation: this.extractInlineDocumentation(line),
    };
  }

  private parseMethod(line: string): InterfaceMethod | null {
    const methodMatch = line.match(/(\w+)(\?)?\s*\(([^)]*)\)\s*:\s*([^{;]+)/);
    if (!methodMatch) return null;

    const parameters = this.parseParameters(methodMatch[3]);

    return {
      name: methodMatch[1],
      parameters,
      returnType: methodMatch[4].trim(),
      isAsync: line.includes("async"),
      isOptional: !!methodMatch[2],
      documentation: this.extractInlineDocumentation(line),
    };
  }

  private parseParameters(paramString: string): MethodParameter[] {
    if (!paramString.trim()) return [];

    const parameters: MethodParameter[] = [];
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
        });
      }
    }

    return parameters;
  }

  private validateNamingConsistency(
    interfaceDef: InterfaceDefinition,
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // Interface naming
    if (
      interfaceDef.type === "interface" &&
      !this.patterns.naming.interfaces.test(interfaceDef.name)
    ) {
      violations.push({
        id: this.generateViolationId(),
        type: "naming",
        severity: "medium",
        interface: interfaceDef.name,
        description: `Interface name '${interfaceDef.name}' doesn't follow naming convention (should start with 'I')`,
        suggestion: `Rename to 'I${interfaceDef.name}'`,
        examples: [`interface I${interfaceDef.name} { ... }`],
        impact: {
          maintainability: 0.6,
          usability: 0.4,
          consistency: 0.8,
          reliability: 0.3,
        },
      });
    }

    // Type naming
    if (
      interfaceDef.type === "type" &&
      !this.patterns.naming.types.test(interfaceDef.name)
    ) {
      violations.push({
        id: this.generateViolationId(),
        type: "naming",
        severity: "low",
        interface: interfaceDef.name,
        description: `Type name '${interfaceDef.name}' doesn't follow PascalCase convention`,
        suggestion: "Use PascalCase for type names",
        examples: [
          `type ${interfaceDef.name.charAt(0).toUpperCase() + interfaceDef.name.slice(1)} = { ... }`,
        ],
        impact: {
          maintainability: 0.4,
          usability: 0.3,
          consistency: 0.6,
          reliability: 0.2,
        },
      });
    }

    // Method naming
    for (const method of interfaceDef.methods) {
      if (!this.patterns.naming.methods.test(method.name)) {
        violations.push({
          id: this.generateViolationId(),
          type: "naming",
          severity: "low",
          interface: interfaceDef.name,
          description: `Method name '${method.name}' doesn't follow camelCase convention`,
          suggestion: "Use camelCase for method names",
          examples: [
            `${method.name.charAt(0).toLowerCase() + method.name.slice(1)}()`,
          ],
          impact: {
            maintainability: 0.3,
            usability: 0.4,
            consistency: 0.5,
            reliability: 0.2,
          },
        });
      }
    }

    // Property naming
    for (const property of interfaceDef.properties) {
      if (!this.patterns.naming.properties.test(property.name)) {
        violations.push({
          id: this.generateViolationId(),
          type: "naming",
          severity: "low",
          interface: interfaceDef.name,
          description: `Property name '${property.name}' doesn't follow camelCase convention`,
          suggestion: "Use camelCase for property names",
          examples: [
            `${property.name.charAt(0).toLowerCase() + property.name.slice(1)}: string`,
          ],
          impact: {
            maintainability: 0.3,
            usability: 0.4,
            consistency: 0.5,
            reliability: 0.2,
          },
        });
      }
    }

    return violations;
  }

  private validateStructureConsistency(
    interfaceDef: InterfaceDefinition,
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // Too many properties
    if (
      interfaceDef.properties.length > this.patterns.structure.maxProperties
    ) {
      violations.push({
        id: this.generateViolationId(),
        type: "structure",
        severity: "high",
        interface: interfaceDef.name,
        description: `Interface has too many properties (${interfaceDef.properties.length} > ${this.patterns.structure.maxProperties})`,
        suggestion: "Split interface into smaller, focused interfaces",
        examples: [
          "Use composition or inheritance to break down large interfaces",
        ],
        impact: {
          maintainability: 0.8,
          usability: 0.7,
          consistency: 0.6,
          reliability: 0.5,
        },
      });
    }

    // Too many methods
    if (interfaceDef.methods.length > this.patterns.structure.maxMethods) {
      violations.push({
        id: this.generateViolationId(),
        type: "structure",
        severity: "high",
        interface: interfaceDef.name,
        description: `Interface has too many methods (${interfaceDef.methods.length} > ${this.patterns.structure.maxMethods})`,
        suggestion: "Split interface into smaller, focused interfaces",
        examples: [
          "Use composition or inheritance to break down large interfaces",
        ],
        impact: {
          maintainability: 0.8,
          usability: 0.7,
          consistency: 0.6,
          reliability: 0.5,
        },
      });
    }

    // Methods with too many parameters
    for (const method of interfaceDef.methods) {
      if (method.parameters.length > this.patterns.structure.maxParameters) {
        violations.push({
          id: this.generateViolationId(),
          type: "structure",
          severity: "medium",
          interface: interfaceDef.name,
          description: `Method '${method.name}' has too many parameters (${method.parameters.length} > ${this.patterns.structure.maxParameters})`,
          suggestion: "Use parameter objects or builder pattern",
          examples: ["Use options object: method(options: MethodOptions)"],
          impact: {
            maintainability: 0.6,
            usability: 0.8,
            consistency: 0.4,
            reliability: 0.3,
          },
        });
      }
    }

    return violations;
  }

  private validateDocumentationConsistency(
    interfaceDef: InterfaceDefinition,
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // Missing interface documentation
    if (!interfaceDef.metadata.documentation) {
      violations.push({
        id: this.generateViolationId(),
        type: "documentation",
        severity: "medium",
        interface: interfaceDef.name,
        description: "Interface lacks documentation",
        suggestion: "Add comprehensive JSDoc documentation",
        examples: [
          "/**\n * Represents a user in the system\n */\ninterface IUser { ... }",
        ],
        impact: {
          maintainability: 0.7,
          usability: 0.8,
          consistency: 0.6,
          reliability: 0.4,
        },
      });
    }

    // Missing method documentation
    for (const method of interfaceDef.methods) {
      if (!method.documentation) {
        violations.push({
          id: this.generateViolationId(),
          type: "documentation",
          severity: "low",
          interface: interfaceDef.name,
          description: `Method '${method.name}' lacks documentation`,
          suggestion: "Add JSDoc documentation for the method",
          examples: [
            "/**\n * Calculates the total price\n * @param items - Array of items\n * @returns Total price\n */",
          ],
          impact: {
            maintainability: 0.5,
            usability: 0.7,
            consistency: 0.4,
            reliability: 0.3,
          },
        });
      }
    }

    // Missing property documentation
    for (const property of interfaceDef.properties) {
      if (!property.documentation) {
        violations.push({
          id: this.generateViolationId(),
          type: "documentation",
          severity: "low",
          interface: interfaceDef.name,
          description: `Property '${property.name}' lacks documentation`,
          suggestion: "Add JSDoc documentation for the property",
          examples: ["/** User identifier */\nid: string;"],
          impact: {
            maintainability: 0.4,
            usability: 0.6,
            consistency: 0.3,
            reliability: 0.2,
          },
        });
      }
    }

    return violations;
  }

  private validateVersioningConsistency(
    interfaceDef: InterfaceDefinition,
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // Missing version information
    if (!interfaceDef.metadata.version) {
      violations.push({
        id: this.generateViolationId(),
        type: "versioning",
        severity: "low",
        interface: interfaceDef.name,
        description: "Interface lacks version information",
        suggestion: "Add version information to interface metadata",
        examples: ["@version 1.0.0", "@since 1.0.0"],
        impact: {
          maintainability: 0.6,
          usability: 0.4,
          consistency: 0.5,
          reliability: 0.3,
        },
      });
    }

    return violations;
  }

  private async validateContractConsistency(
    interfaceDef: InterfaceDefinition,
  ): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = [];

    // Check for contract violations (simplified)
    for (const method of interfaceDef.methods) {
      // Check for void return types without proper documentation
      if (
        method.returnType === "void" &&
        !method.documentation?.includes("side effect")
      ) {
        violations.push({
          id: this.generateViolationId(),
          type: "contract",
          severity: "low",
          interface: interfaceDef.name,
          description: `Method '${method.name}' returns void but lacks side effect documentation`,
          suggestion: "Document side effects for void methods",
          examples: [
            "/**\n * Saves the user data (side effect: updates database)\n */",
          ],
          impact: {
            maintainability: 0.4,
            usability: 0.5,
            consistency: 0.3,
            reliability: 0.4,
          },
        });
      }
    }

    return violations;
  }

  private validatePatternConsistency(
    interfaceDef: InterfaceDefinition,
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // Check for common anti-patterns
    if (
      interfaceDef.type === "interface" &&
      interfaceDef.methods.length === 0 &&
      interfaceDef.properties.length === 0
    ) {
      violations.push({
        id: this.generateViolationId(),
        type: "pattern",
        severity: "medium",
        interface: interfaceDef.name,
        description: "Empty interface detected",
        suggestion: "Remove empty interface or add meaningful members",
        examples: [
          "Use type aliases for simple types",
          "Add meaningful properties/methods",
        ],
        impact: {
          maintainability: 0.5,
          usability: 0.3,
          consistency: 0.6,
          reliability: 0.2,
        },
      });
    }

    // Check for God interface pattern
    if (
      interfaceDef.properties.length > 15 ||
      interfaceDef.methods.length > 20
    ) {
      violations.push({
        id: this.generateViolationId(),
        type: "pattern",
        severity: "high",
        interface: interfaceDef.name,
        description:
          'Interface appears to be a "God interface" (too many responsibilities)',
        suggestion: "Apply Single Responsibility Principle and split interface",
        examples: [
          "Break into multiple focused interfaces",
          "Use composition over large interfaces",
        ],
        impact: {
          maintainability: 0.9,
          usability: 0.8,
          consistency: 0.7,
          reliability: 0.6,
        },
      });
    }

    return violations;
  }

  private calculateInterfaceScore(
    interfaceDef: InterfaceDefinition,
    violations: ConsistencyViolation[],
  ): number {
    if (violations.length === 0) return 100;

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

  private generateConsistencyReport(
    interfaces: InterfaceDefinition[],
    violations: ConsistencyViolation[],
    interfaceScores: Map<string, number>,
  ): ConsistencyReport {
    const totalInterfaces = interfaces.length;
    const consistentInterfaces = Array.from(interfaceScores.values()).filter(
      (score) => score >= 80,
    ).length;
    const overallConsistency =
      Array.from(interfaceScores.values()).reduce(
        (sum, score) => sum + score,
        0,
      ) / totalInterfaces;

    // Group violations by type and severity
    const violationsByType: Record<string, number> = {};
    const violationsBySeverity: Record<string, number> = {};

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

    // Generate recommendations
    const recommendations = this.generateGlobalRecommendations(
      violations,
      interfaces,
    );

    // Detect patterns
    const patterns = this.detectPatterns(interfaces, violations);

    return {
      overallConsistency,
      totalInterfaces,
      consistentInterfaces,
      violationsByType,
      violationsBySeverity,
      topViolations,
      interfaceScores,
      recommendations,
      patterns,
    };
  }

  private generateGlobalRecommendations(
    violations: ConsistencyViolation[],
    interfaces: InterfaceDefinition[],
  ): ConsistencyReport["recommendations"] {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    const criticalViolations = violations.filter(
      (v) => v.severity === "critical",
    );
    const highViolations = violations.filter((v) => v.severity === "high");
    const violationTypes = new Set(violations.map((v) => v.type));

    if (criticalViolations.length > 0) {
      immediate.push(
        `🚨 Address ${criticalViolations.length} critical interface violations`,
      );
    }

    if (highViolations.length > 0) {
      immediate.push(
        `⚠️ Fix ${highViolations.length} high-severity interface violations`,
      );
    }

    if (violationTypes.has("naming")) {
      shortTerm.push("📝 Establish and enforce naming conventions");
    }

    if (violationTypes.has("structure")) {
      shortTerm.push("🏗️ Refactor large interfaces into smaller, focused ones");
    }

    if (violationTypes.has("documentation")) {
      shortTerm.push("📚 Implement comprehensive documentation standards");
    }

    shortTerm.push("🔍 Implement automated interface validation in CI/CD");
    shortTerm.push("📊 Create interface consistency monitoring");

    longTerm.push("🎯 Establish interface design patterns and guidelines");
    longTerm.push("🔄 Implement automated interface refactoring suggestions");
    longTerm.push("📈 Create interface quality dashboards");
    longTerm.push("🎓 Conduct interface design training");

    return { immediate, shortTerm, longTerm };
  }

  private detectPatterns(
    interfaces: InterfaceDefinition[],
    violations: ConsistencyViolation[],
  ): ConsistencyReport["patterns"] {
    const detected: string[] = [];
    const recommended: string[] = [];
    const violations: string[] = [];

    // Detect common patterns
    const interfaceCount = interfaces.filter(
      (i) => i.type === "interface",
    ).length;
    const typeCount = interfaces.filter((i) => i.type === "type").length;

    if (interfaceCount > typeCount) {
      detected.push("Interface-heavy design");
    } else {
      detected.push("Type-heavy design");
    }

    // Detect anti-patterns
    const emptyInterfaces = interfaces.filter(
      (i) => i.properties.length === 0 && i.methods.length === 0,
    );
    if (emptyInterfaces.length > 0) {
      violations.push("Empty interfaces detected");
    }

    const largeInterfaces = interfaces.filter(
      (i) => i.properties.length > 10 || i.methods.length > 15,
    );
    if (largeInterfaces.length > 0) {
      violations.push("God interfaces detected");
    }

    // Recommended patterns
    recommended.push("Single Responsibility Principle");
    recommended.push("Interface Segregation Principle");
    recommended.push("Consistent naming conventions");
    recommended.push("Comprehensive documentation");

    return { detected, recommended, violations };
  }

  // Helper methods
  private isExported(content: string, name: string): boolean {
    return (
      content.includes(`export ${name}`) ||
      content.includes(`export { ${name} }`)
    );
  }

  private isPublic(content: string, name: string): boolean {
    return (
      !content.includes(`private ${name}`) &&
      !content.includes(`protected ${name}`)
    );
  }

  private extractDocumentation(
    content: string,
    lineNumber: number,
  ): string | undefined {
    const lines = content.split("\n");
    const docLines: string[] = [];

    // Look for JSDoc comments above the interface
    for (let i = lineNumber - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith("*")) {
        docLines.unshift(line.replace(/^\*\s?/, ""));
      } else if (line.startsWith("/**")) {
        docLines.unshift(line.replace(/^\/\*\*\s?/, ""));
        break;
      } else if (line === "" || line.startsWith("//")) {
        continue;
      } else {
        break;
      }
    }

    return docLines.length > 0 ? docLines.join("\n") : undefined;
  }

  private extractTags(content: string, lineNumber: number): string[] {
    const documentation = this.extractDocumentation(content, lineNumber);
    if (!documentation) return [];

    const tagMatches = documentation.match(/@(\w+)/g);
    return tagMatches ? tagMatches.map((tag) => tag.substring(1)) : [];
  }

  private extractVersion(
    content: string,
    lineNumber: number,
  ): string | undefined {
    const tags = this.extractTags(content, lineNumber);
    const versionTag = tags.find((tag) => tag.startsWith("version"));
    return versionTag ? versionTag.split(" ")[1] : undefined;
  }

  private extractInlineDocumentation(line: string): string | undefined {
    const commentMatch = line.match(/\/\*\*([^*]+)\*\//);
    return commentMatch ? commentMatch[1].trim() : undefined;
  }

  private generateViolationId(): string {
    return `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
