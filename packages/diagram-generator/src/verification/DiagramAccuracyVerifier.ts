/**
 * 🦊 Diagram Accuracy Verifier
 * 
 * Verifies that generated diagrams accurately represent the real codebase
 * by cross-referencing with actual file contents and package.json files
 */

import { readFile, readdir, stat } from "fs/promises";
import { join, extname } from "path";

export interface VerificationResult {
  isAccurate: boolean;
  accuracyScore: number;
  issues: VerificationIssue[];
  statistics: VerificationStatistics;
  recommendations: string[];
}

export interface VerificationIssue {
  type: "missing" | "incorrect" | "extra" | "incomplete";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  expected?: string;
  actual?: string;
  file?: string;
  line?: number;
}

export interface VerificationStatistics {
  totalPackages: number;
  verifiedPackages: number;
  totalDependencies: number;
  verifiedDependencies: number;
  totalExports: number;
  verifiedExports: number;
  totalImports: number;
  verifiedImports: number;
  accuracyPercentage: number;
}

export class DiagramAccuracyVerifier {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  async verifyDiagramAccuracy(
    generatedDiagram: string,
    analysisData: any
  ): Promise<VerificationResult> {
    const issues: VerificationIssue[] = [];
    const statistics: VerificationStatistics = {
      totalPackages: 0,
      verifiedPackages: 0,
      totalDependencies: 0,
      verifiedDependencies: 0,
      totalExports: 0,
      verifiedExports: 0,
      totalImports: 0,
      verifiedImports: 0,
      accuracyPercentage: 0,
    };

    // Verify package existence
    await this.verifyPackages(analysisData.packages, issues, statistics);

    // Verify dependencies
    await this.verifyDependencies(analysisData.packages, issues, statistics);

    // Verify exports and imports
    await this.verifyExportsAndImports(analysisData.packages, issues, statistics);

    // Verify diagram content
    await this.verifyDiagramContent(generatedDiagram, analysisData, issues);

    // Calculate accuracy score
    const accuracyScore = this.calculateAccuracyScore(statistics, issues);
    statistics.accuracyPercentage = accuracyScore;

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, statistics);

    return {
      isAccurate: accuracyScore >= 80,
      accuracyScore,
      issues,
      statistics,
      recommendations,
    };
  }

  private async verifyPackages(packages: any[], issues: VerificationIssue[], statistics: VerificationStatistics): Promise<void> {
    statistics.totalPackages = packages.length;

    for (const pkg of packages) {
      try {
        const packagePath = join(this.rootPath, pkg.path);
        const packageJsonPath = join(packagePath, "package.json");
        
        await stat(packageJsonPath);
        statistics.verifiedPackages++;

        // Verify package.json content
        const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        
        if (packageJson.name !== pkg.name) {
          issues.push({
            type: "incorrect",
            severity: "medium",
            description: `Package name mismatch for ${pkg.path}`,
            expected: packageJson.name,
            actual: pkg.name,
            file: packageJsonPath,
          });
        }

      } catch (error) {
        issues.push({
          type: "missing",
          severity: "high",
          description: `Package not found: ${pkg.path}`,
          file: join(this.rootPath, pkg.path),
        });
      }
    }
  }

  private async verifyDependencies(packages: any[], issues: VerificationIssue[], statistics: VerificationStatistics): Promise<void> {
    for (const pkg of packages) {
      try {
        const packagePath = join(this.rootPath, pkg.path);
        const packageJsonPath = join(packagePath, "package.json");
        const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        
        const actualDeps = [
          ...Object.keys(packageJson.dependencies || {}),
          ...Object.keys(packageJson.devDependencies || {}),
          ...Object.keys(packageJson.peerDependencies || {}),
        ];

        statistics.totalDependencies += pkg.dependencies.length;

        for (const dep of pkg.dependencies) {
          if (actualDeps.includes(dep)) {
            statistics.verifiedDependencies++;
          } else {
            issues.push({
              type: "extra",
              severity: "low",
              description: `Dependency not found in package.json: ${dep}`,
              expected: "Not in package.json",
              actual: dep,
              file: packageJsonPath,
            });
          }
        }

        // Check for missing dependencies
        for (const actualDep of actualDeps) {
          if (!pkg.dependencies.includes(actualDep)) {
            issues.push({
              type: "missing",
              severity: "medium",
              description: `Missing dependency in analysis: ${actualDep}`,
              expected: actualDep,
              actual: "Not in analysis",
              file: packageJsonPath,
            });
          }
        }

      } catch (error) {
        // Package not found, already handled in verifyPackages
      }
    }
  }

  private async verifyExportsAndImports(packages: any[], issues: VerificationIssue[], statistics: VerificationStatistics): Promise<void> {
    for (const pkg of packages) {
      try {
        const packagePath = join(this.rootPath, pkg.path);
        const indexPath = join(packagePath, "src", "index.ts");
        
        try {
          const indexContent = await readFile(indexPath, "utf-8");
          const actualExports = this.extractExportsFromContent(indexContent);
          
          statistics.totalExports += pkg.exports.length;
          
          for (const exportName of pkg.exports) {
            if (actualExports.includes(exportName)) {
              statistics.verifiedExports++;
            } else {
              issues.push({
                type: "extra",
                severity: "low",
                description: `Export not found in index.ts: ${exportName}`,
                expected: "Not in index.ts",
                actual: exportName,
                file: indexPath,
              });
            }
          }

        } catch (error) {
          // No index.ts file, check other files
          await this.verifyExportsInDirectory(packagePath, pkg, issues, statistics);
        }

        // Verify imports in components
        for (const component of pkg.components || []) {
          statistics.totalImports += component.imports?.length || 0;
          
          if (component.imports) {
            for (const importPath of component.imports) {
              if (await this.verifyImportExists(importPath, packagePath)) {
                statistics.verifiedImports++;
              } else {
                issues.push({
                  type: "incorrect",
                  severity: "medium",
                  description: `Import path not found: ${importPath}`,
                  expected: "Valid import path",
                  actual: importPath,
                  file: component.filePath,
                });
              }
            }
          }
        }

      } catch (error) {
        // Package not found, already handled
      }
    }
  }

  private async verifyExportsInDirectory(dirPath: string, pkg: any, issues: VerificationIssue[], statistics: VerificationStatistics): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && extname(entry.name) === ".ts") {
          const filePath = join(dirPath, entry.name);
          const content = await readFile(filePath, "utf-8");
          const actualExports = this.extractExportsFromContent(content);
          
          for (const exportName of pkg.exports) {
            if (actualExports.includes(exportName)) {
              statistics.verifiedExports++;
              break;
            }
          }
        } else if (entry.isDirectory() && entry.name !== "node_modules") {
          await this.verifyExportsInDirectory(join(dirPath, entry.name), pkg, issues, statistics);
        }
      }
    } catch (error) {
      // Directory not accessible
    }
  }

  private async verifyImportExists(importPath: string, packagePath: string): Promise<boolean> {
    try {
      // Handle different import path types
      if (importPath.startsWith("reynard-")) {
        // External package import
        return true; // Assume external packages exist
      } else if (importPath.startsWith("./") || importPath.startsWith("../")) {
        // Relative import
        const fullPath = join(packagePath, "src", importPath);
        await stat(fullPath);
        return true;
      } else {
        // Absolute import from src
        const fullPath = join(packagePath, "src", importPath);
        await stat(fullPath);
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  private async verifyDiagramContent(diagram: string, analysisData: any, issues: VerificationIssue[]): Promise<void> {
    // Verify that all packages mentioned in analysis are in the diagram
    for (const pkg of analysisData.packages) {
      const sanitizedName = pkg.name.replace(/[^a-zA-Z0-9_]/g, "_");
      if (!diagram.includes(sanitizedName)) {
        issues.push({
          type: "missing",
          severity: "high",
          description: `Package not found in diagram: ${pkg.name}`,
          expected: pkg.name,
          actual: "Not in diagram",
        });
      }
    }

    // Verify Mermaid syntax
    if (!diagram.includes("graph TB") && !diagram.includes("graph TD")) {
      issues.push({
        type: "incorrect",
        severity: "critical",
        description: "Invalid Mermaid diagram syntax",
        expected: "Valid Mermaid graph syntax",
        actual: "Missing graph declaration",
      });
    }
  }

  private extractExportsFromContent(content: string): string[] {
    const exports: string[] = [];
    
    const exportPatterns = [
      /export\s+(?:const|let|var|function|class|interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /export\s*\{\s*([^}]+)\s*\}/g,
      /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const exportName = match[1];
        if (exportName && exportName.trim()) {
          if (exportName.includes(',')) {
            const namedExports = exportName.split(',').map(e => e.trim().split(' as ')[0].trim());
            exports.push(...namedExports);
          } else {
            exports.push(exportName.trim());
          }
        }
      }
    }

    return [...new Set(exports)];
  }

  private calculateAccuracyScore(statistics: VerificationStatistics, issues: VerificationIssue[]): number {
    const weights = {
      packages: 0.3,
      dependencies: 0.25,
      exports: 0.2,
      imports: 0.15,
      issues: 0.1,
    };

    const packageAccuracy = statistics.totalPackages > 0 ? 
      (statistics.verifiedPackages / statistics.totalPackages) * 100 : 100;
    
    const dependencyAccuracy = statistics.totalDependencies > 0 ? 
      (statistics.verifiedDependencies / statistics.totalDependencies) * 100 : 100;
    
    const exportAccuracy = statistics.totalExports > 0 ? 
      (statistics.verifiedExports / statistics.totalExports) * 100 : 100;
    
    const importAccuracy = statistics.totalImports > 0 ? 
      (statistics.verifiedImports / statistics.totalImports) * 100 : 100;

    const issuePenalty = issues.reduce((penalty, issue) => {
      const severityWeights = { low: 1, medium: 3, high: 5, critical: 10 };
      return penalty + severityWeights[issue.severity];
    }, 0);

    const baseScore = (
      packageAccuracy * weights.packages +
      dependencyAccuracy * weights.dependencies +
      exportAccuracy * weights.exports +
      importAccuracy * weights.imports
    );

    return Math.max(0, Math.min(100, baseScore - issuePenalty));
  }

  private generateRecommendations(issues: VerificationIssue[], statistics: VerificationStatistics): string[] {
    const recommendations: string[] = [];

    if (statistics.accuracyPercentage < 80) {
      recommendations.push("🔍 Consider improving the codebase analyzer to better extract package information");
    }

    const criticalIssues = issues.filter(issue => issue.severity === "critical");
    if (criticalIssues.length > 0) {
      recommendations.push("🚨 Fix critical issues in diagram generation");
    }

    const missingPackages = issues.filter(issue => issue.type === "missing" && issue.description.includes("Package not found"));
    if (missingPackages.length > 0) {
      recommendations.push("📦 Verify package paths and ensure all packages are accessible");
    }

    const incorrectDeps = issues.filter(issue => issue.type === "incorrect" && issue.description.includes("Dependency"));
    if (incorrectDeps.length > 0) {
      recommendations.push("🔗 Improve dependency extraction from package.json files");
    }

    if (statistics.verifiedExports < statistics.totalExports * 0.8) {
      recommendations.push("📤 Enhance export detection to find all exported symbols");
    }

    if (statistics.verifiedImports < statistics.totalImports * 0.8) {
      recommendations.push("📥 Improve import path resolution and validation");
    }

    return recommendations;
  }
}
