/**
 * 🦊 Package Dependencies Diagram Generator
 * 
 * Generates detailed package dependency diagrams showing
 * how packages depend on each other and external libraries.
 */

import type {
  DiagramGenerator,
  DiagramOutput,
  DiagramMetadata,
  CodebaseAnalysis,
  DiagramGenerationConfig
} from '../types.js';

export class PackageDependenciesGenerator implements DiagramGenerator {
  name = 'Package Dependencies Generator';
  type = 'package-dependencies' as const;
  description = 'Generates package dependency relationship diagrams';

  async generate(analysis: CodebaseAnalysis, _config: DiagramGenerationConfig): Promise<DiagramOutput> {
    const mermaidContent = this.generateMermaidContent(analysis, _config);
    
    const metadata: DiagramMetadata = {
      type: this.type,
      title: 'Reynard Package Dependencies',
      description: 'Detailed view of package dependencies and relationships',
      nodeCount: analysis.packages.length,
      edgeCount: this.countDependencyEdges(analysis),
      complexityScore: this.calculateComplexity(analysis),
      generatedAt: new Date().toISOString(),
      sourceFiles: analysis.packages.map(pkg => pkg.path),
      dependencies: analysis.dependencies.map(dep => dep.name)
    };

    return {
      mermaidContent,
      metadata,
      outputPaths: {}
    };
  }

  validate(analysis: CodebaseAnalysis): boolean {
    return analysis.packages.length > 0;
  }

  private generateMermaidContent(analysis: CodebaseAnalysis, config: DiagramGenerationConfig): string {
    const lines = [
      '%%{init: {\'theme\': \'neutral\'}}%%',
      'graph LR',
      '    subgraph "🦊 Reynard Package Dependencies"',
      '        direction TB',
      ''
    ];

    // Group packages by importance
    const criticalPackages = analysis.packages.filter(pkg => pkg.importance === 'critical');
    const importantPackages = analysis.packages.filter(pkg => pkg.importance === 'important');
    const optionalPackages = analysis.packages.filter(pkg => pkg.importance === 'optional');

    // Add critical packages
    if (criticalPackages.length > 0) {
      lines.push('        subgraph critical["🔴 Critical Packages"]');
      lines.push('            direction LR');
      for (const pkg of criticalPackages) {
        const pkgId = this.sanitizeId(pkg.name);
        lines.push(`            ${pkgId}["${pkg.name}"]`);
      }
      lines.push('        end');
      lines.push('');
    }

    // Add important packages
    if (importantPackages.length > 0) {
      lines.push('        subgraph important["🟡 Important Packages"]');
      lines.push('            direction LR');
      for (const pkg of importantPackages) {
        const pkgId = this.sanitizeId(pkg.name);
        lines.push(`            ${pkgId}["${pkg.name}"]`);
      }
      lines.push('        end');
      lines.push('');
    }

    // Add optional packages
    if (optionalPackages.length > 0) {
      lines.push('        subgraph optional["🟢 Optional Packages"]');
      lines.push('            direction LR');
      for (const pkg of optionalPackages) {
        const pkgId = this.sanitizeId(pkg.name);
        lines.push(`            ${pkgId}["${pkg.name}"]`);
      }
      lines.push('        end');
      lines.push('');
    }

    // Add dependency relationships
    lines.push('        %% Internal Dependencies');
    for (const pkg of analysis.packages) {
      const pkgId = this.sanitizeId(pkg.name);
      
      for (const dep of pkg.dependencies) {
        if (dep.startsWith('reynard-')) {
          const depId = this.sanitizeId(dep);
          const depPkg = analysis.packages.find(p => p.name === dep);
          if (depPkg) {
            lines.push(`        ${pkgId} --> ${depId}`);
          }
        }
      }
    }

    lines.push('    end');
    lines.push('');

    // Add external dependencies
    const externalDeps = analysis.dependencies.filter(dep => dep.type === 'external');
    if (externalDeps.length > 0) {
      lines.push('    subgraph external["External Dependencies"]');
      lines.push('        direction TB');
      
      // Group by usage count
      const highUsage = externalDeps.filter(dep => dep.usageCount > 5);
      const mediumUsage = externalDeps.filter(dep => dep.usageCount > 2 && dep.usageCount <= 5);
      // const lowUsage = externalDeps.filter(dep => dep.usageCount <= 2);

      if (highUsage.length > 0) {
        lines.push('        subgraph high_usage["High Usage"]');
        for (const dep of highUsage.slice(0, 10)) {
          const depId = this.sanitizeId(dep.name);
          lines.push(`            ${depId}["${dep.name}"]`);
        }
        lines.push('        end');
      }

      if (mediumUsage.length > 0) {
        lines.push('        subgraph medium_usage["Medium Usage"]');
        for (const dep of mediumUsage.slice(0, 15)) {
          const depId = this.sanitizeId(dep.name);
          lines.push(`            ${depId}["${dep.name}"]`);
        }
        lines.push('        end');
      }

      lines.push('    end');
      lines.push('');
    }

    // Add connections from packages to external dependencies
    lines.push('    %% Package to External Dependencies');
    for (const pkg of analysis.packages) {
      const pkgId = this.sanitizeId(pkg.name);
      
      for (const dep of pkg.dependencies) {
        if (!dep.startsWith('reynard-')) {
          const depId = this.sanitizeId(dep);
          const externalDep = analysis.dependencies.find(d => d.name === dep);
          if (externalDep) {
            lines.push(`    ${pkgId} -.-> ${depId}`);
          }
        }
      }
    }

    return lines.join('\n');
  }

  private countDependencyEdges(analysis: CodebaseAnalysis): number {
    let count = 0;
    for (const pkg of analysis.packages) {
      count += pkg.dependencies.length;
    }
    return count;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
  }

  private calculateComplexity(analysis: CodebaseAnalysis): number {
    return analysis.packages.length + 
           analysis.dependencies.length + 
           this.countDependencyEdges(analysis);
  }
}
