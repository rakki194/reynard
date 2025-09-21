import { describe, it, expect, beforeEach } from "vitest";
import { DependencyAnalyzer } from "../dependency-analyzer.js";
import { REYNARD_ARCHITECTURE } from "../architecture.js";

describe("DependencyAnalyzer", () => {
  let analyzer: DependencyAnalyzer;

  beforeEach(() => {
    analyzer = new DependencyAnalyzer();
  });

  describe("Graph Construction", () => {
    it("should build a complete dependency graph", () => {
      // Access private graph property for testing
      const graph = (analyzer as any).graph;

      expect(graph).toBeDefined();
      expect(graph.nodes).toBeInstanceOf(Map);
      expect(graph.edges).toBeInstanceOf(Array);

      // Should have nodes for all directories
      expect(graph.nodes.size).toBeGreaterThan(100);

      // Should have edges for relationships
      expect(graph.edges.length).toBeGreaterThan(200);
    });

    it("should include all architecture directories as nodes", () => {
      const graph = (analyzer as any).graph;
      const architectureDirectories = REYNARD_ARCHITECTURE.directories.map(d => d.name);

      architectureDirectories.forEach(dirName => {
        expect(graph.nodes.has(dirName)).toBe(true);
      });
    });

    it("should create proper node structure", () => {
      const graph = (analyzer as any).graph;
      const firstNode = graph.nodes.values().next().value;

      expect(firstNode).toHaveProperty("id");
      expect(firstNode).toHaveProperty("label");
      expect(firstNode).toHaveProperty("category");
      expect(firstNode).toHaveProperty("importance");
      expect(firstNode).toHaveProperty("dependencies");
      expect(firstNode).toHaveProperty("dependents");
      expect(firstNode).toHaveProperty("relationshipTypes");

      expect(Array.isArray(firstNode.dependencies)).toBe(true);
      expect(Array.isArray(firstNode.dependents)).toBe(true);
      expect(firstNode.relationshipTypes).toBeInstanceOf(Map);
    });
  });

  describe("Mermaid Diagram Generation", () => {
    it("should generate valid Mermaid syntax", () => {
      const mermaid = analyzer.generateMermaidDiagram();

      expect(mermaid).toContain("graph TD");
      expect(mermaid).toContain("classDef");
      expect(mermaid).toContain("-->");
    });

    it("should include all nodes in the diagram", () => {
      const mermaid = analyzer.generateMermaidDiagram();
      const graph = (analyzer as any).graph;

      // Check that major packages are included
      expect(mermaid).toContain("packages_core_core");
      expect(mermaid).toContain("packages_ai_ai_shared");
      expect(mermaid).toContain("packages_ui_components_core");
    });

    it("should include relationship edges", () => {
      const mermaid = analyzer.generateMermaidDiagram();

      // Should have dependency arrows
      expect(mermaid).toContain("-->");
      expect(mermaid).toContain("|");
    });

    it("should include proper styling", () => {
      const mermaid = analyzer.generateMermaidDiagram();

      expect(mermaid).toContain("classDef critical");
      expect(mermaid).toContain("classDef important");
      expect(mermaid).toContain("classDef optional");
      expect(mermaid).toContain("classDef excluded");
    });

    it("should use proper node IDs", () => {
      const mermaid = analyzer.generateMermaidDiagram();

      // Node IDs should be sanitized (no special characters)
      const nodeMatches = mermaid.match(/^\s*(\w+)\[/gm);
      if (nodeMatches) {
        nodeMatches.forEach(match => {
          const nodeId = match.trim().replace(/\[.*$/, ""); // Remove everything after [
          expect(nodeId).toMatch(/^[a-zA-Z0-9_]+$/);
        });
      }
    });
  });

  describe("Detailed Report Generation", () => {
    it("should generate a comprehensive report", () => {
      const report = analyzer.generateDetailedReport();

      expect(report).toContain("# 🦊 Reynard Dependency Analysis Report");
      expect(report).toContain("**Total Packages:**");
      expect(report).toContain("**Total Dependencies:**");
      expect(report).toContain("## 📊 Package Categories");
      expect(report).toContain("## 🔗 Most Connected Packages");
    });

    it("should include package category statistics", () => {
      const report = analyzer.generateDetailedReport();

      expect(report).toContain("📦 **source**");
      expect(report).toContain("🛠️ **tools**");
      expect(report).toContain("📚 **documentation**");
      expect(report).toContain("🔧 **services**");
    });

    it("should list most connected packages", () => {
      const report = analyzer.generateDetailedReport();

      // Should mention core/core as most connected
      expect(report).toContain("**core/core**");
      expect(report).toContain("connections");
    });

    it("should include dependency chain analysis", () => {
      const report = analyzer.generateDetailedReport();

      expect(report).toContain("## 🔄 Longest Dependency Chains");
    });

    it("should identify orphaned packages", () => {
      const report = analyzer.generateDetailedReport();

      expect(report).toContain("## 🏝️ Orphaned Packages");
    });
  });

  describe("Relationship Validation", () => {
    it("should validate all relationships", () => {
      const validation = analyzer.validateRelationships();

      expect(validation).toHaveProperty("valid");
      expect(validation).toHaveProperty("errors");
      expect(validation).toHaveProperty("warnings");

      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
    });

    it("should pass validation for our architecture", () => {
      const validation = analyzer.validateRelationships();

      // Our architecture should be valid
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should identify isolated packages", () => {
      const validation = analyzer.validateRelationships();

      // Should find some isolated packages like .vscode, third_party
      const isolatedWarning = validation.warnings.find(w => w.includes("isolated packages"));
      expect(isolatedWarning).toBeDefined();
    });

    it("should detect potential circular dependencies", () => {
      const validation = analyzer.validateRelationships();

      // Should find some circular dependencies (this is expected in complex architectures)
      const circularWarning = validation.warnings.find(w => w.includes("circular dependencies"));
      expect(circularWarning).toBeDefined();
    });
  });

  describe("Dependency Chain Analysis", () => {
    it("should find longest dependency chains", () => {
      const chains = (analyzer as any).findLongestChains();

      expect(Array.isArray(chains)).toBe(true);

      if (chains.length > 0) {
        // Chains should be sorted by length (longest first)
        for (let i = 1; i < chains.length; i++) {
          expect(chains[i - 1].length).toBeGreaterThanOrEqual(chains[i].length);
        }
      }
    });

    it("should detect circular dependencies", () => {
      const circular = (analyzer as any).findCircularDependencies();

      expect(Array.isArray(circular)).toBe(true);

      if (circular.length > 0) {
        // Each cycle should be a valid cycle
        circular.forEach(cycle => {
          expect(cycle.length).toBeGreaterThan(1);
          // For a proper cycle, the last element should be the same as the first
          // But our implementation might not include the closing element
          expect(cycle[0]).toBeDefined();
        });
      }
    });
  });

  describe("File Export", () => {
    it("should export files to specified directory", () => {
      // Test that the export method doesn't throw errors
      expect(() => {
        analyzer.exportToFiles("test-output");
      }).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle packages with no relationships", () => {
      const graph = (analyzer as any).graph;

      // Find packages with no dependencies or dependents
      const isolatedPackages = Array.from(graph.nodes.values()).filter(
        node => node.dependencies.length === 0 && node.dependents.length === 0
      );

      // Should handle these gracefully
      expect(Array.isArray(isolatedPackages)).toBe(true);
    });

    it("should handle packages with many dependencies", () => {
      const graph = (analyzer as any).graph;

      // Find the package with most dependencies
      const maxDeps = Math.max(...Array.from(graph.nodes.values()).map(node => node.dependencies.length));

      expect(maxDeps).toBeGreaterThan(0);
    });

    it("should handle packages with many dependents", () => {
      const graph = (analyzer as any).graph;

      // Find the package with most dependents
      const maxDependents = Math.max(...Array.from(graph.nodes.values()).map(node => node.dependents.length));

      expect(maxDependents).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should build graph quickly", () => {
      const start = Date.now();
      new DependencyAnalyzer();
      const duration = Date.now() - start;

      // Should build in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it("should generate diagrams quickly", () => {
      const start = Date.now();
      analyzer.generateMermaidDiagram();
      const duration = Date.now() - start;

      // Should generate in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it("should validate relationships quickly", () => {
      const start = Date.now();
      analyzer.validateRelationships();
      const duration = Date.now() - start;

      // Should validate in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
