import { describe, it, expect, beforeEach } from "vitest";
import { SimplifiedDiagramGenerator } from "../simplified-diagram-generator.js";

describe("SimplifiedDiagramGenerator", () => {
  let generator: SimplifiedDiagramGenerator;

  beforeEach(() => {
    generator = new SimplifiedDiagramGenerator();
  });

  describe("Category Diagram Generation", () => {
    it("should generate valid Mermaid syntax", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      expect(mermaid).toContain("graph TD");
      expect(mermaid).toContain("classDef");
      expect(mermaid).toContain("-->");
    });

    it("should include main categories", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      // Main categories
      expect(mermaid).toContain("packages");
      expect(mermaid).toContain("services");
      expect(mermaid).toContain("backend");
      expect(mermaid).toContain("docs");
      expect(mermaid).toContain("examples");
      expect(mermaid).toContain("templates");
      expect(mermaid).toContain("scripts");
      expect(mermaid).toContain("e2e");
    });

    it("should include package subcategories", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      // Package subcategories
      expect(mermaid).toContain("packages_ai");
      expect(mermaid).toContain("packages_core");
      expect(mermaid).toContain("packages_ui");
      expect(mermaid).toContain("packages_data");
      expect(mermaid).toContain("packages_media");
      expect(mermaid).toContain("packages_dev_tools");
      expect(mermaid).toContain("packages_docs");
      expect(mermaid).toContain("packages_services");
      expect(mermaid).toContain("packages_algorithms");
    });

    it("should include service subcategories", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      // Service subcategories
      expect(mermaid).toContain("services_agent_naming");
      expect(mermaid).toContain("services_gatekeeper");
      expect(mermaid).toContain("services_mcp_server");
    });

    it("should show proper parent-child relationships", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      // Packages should be parent of subcategories
      expect(mermaid).toContain("packages --> packages_ai");
      expect(mermaid).toContain("packages --> packages_core");
      expect(mermaid).toContain("packages --> packages_ui");
      
      // Services should be parent of service subcategories
      expect(mermaid).toContain("services --> services_agent_naming");
      expect(mermaid).toContain("services --> services_gatekeeper");
      expect(mermaid).toContain("services --> services_mcp_server");
    });

    it("should include key inter-category dependencies", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      // Key dependencies between categories
      expect(mermaid).toContain("packages_core -->|🔗| packages_ai");
      expect(mermaid).toContain("packages_core -->|🔗| packages_ui");
      expect(mermaid).toContain("packages_core -->|🔗| packages_data");
      expect(mermaid).toContain("packages_ai -->|🔗| packages_media");
      expect(mermaid).toContain("packages_ui -->|🔗| packages_media");
      expect(mermaid).toContain("packages_data -->|🔗| packages_ai");
      expect(mermaid).toContain("services -->|🔗| backend");
      expect(mermaid).toContain("packages_services -->|🔗| services");
    });

    it("should include proper styling classes", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      expect(mermaid).toContain("classDef critical");
      expect(mermaid).toContain("classDef important");
      expect(mermaid).toContain("classDef optional");
    });

    it("should use proper node styling", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      // Critical nodes should have critical styling
      expect(mermaid).toContain("packages[\"📦 packages\"]:::critical");
      expect(mermaid).toContain("services[\"🔧 services\"]:::critical");
      expect(mermaid).toContain("backend[\"🐍 backend\"]:::critical");
      expect(mermaid).toContain("docs[\"📚 docs\"]:::critical");
      
      // Important nodes should have important styling
      expect(mermaid).toContain("packages_ai[\"🤖 ai\"]:::important");
      expect(mermaid).toContain("packages_core[\"⚙️ core\"]:::important");
    });

    it("should include proper emojis for categories", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      expect(mermaid).toContain("📦 packages");
      expect(mermaid).toContain("🔧 services");
      expect(mermaid).toContain("🐍 backend");
      expect(mermaid).toContain("📚 docs");
      expect(mermaid).toContain("🎯 examples");
      expect(mermaid).toContain("📋 templates");
      expect(mermaid).toContain("📜 scripts");
      expect(mermaid).toContain("🧪 e2e");
    });

    it("should include proper emojis for subcategories", () => {
      const mermaid = generator.generateCategoryDiagram();
      
      // Package subcategory emojis
      expect(mermaid).toContain("🤖 ai");
      expect(mermaid).toContain("⚙️ core");
      expect(mermaid).toContain("🎨 ui");
      expect(mermaid).toContain("💾 data");
      expect(mermaid).toContain("🎬 media");
      expect(mermaid).toContain("🛠️ dev-tools");
      expect(mermaid).toContain("📖 docs");
      expect(mermaid).toContain("🔌 services");
      expect(mermaid).toContain("🧮 algorithms");
      
      // Service subcategory emojis
      expect(mermaid).toContain("🏷️ agent-naming");
      expect(mermaid).toContain("🔐 gatekeeper");
      expect(mermaid).toContain("🖥️ mcp-server");
    });
  });

  describe("Core Dependencies Diagram Generation", () => {
    it("should generate valid Mermaid syntax", () => {
      const mermaid = generator.generateCoreDependenciesDiagram();
      
      expect(mermaid).toContain("graph TD");
      expect(mermaid).toContain("classDef");
      expect(mermaid).toContain("-->");
    });

    it("should include core packages", () => {
      const mermaid = generator.generateCoreDependenciesDiagram();
      
      // Critical core packages
      expect(mermaid).toContain("packages_core_core");
      expect(mermaid).toContain("packages_ai_ai_shared");
      expect(mermaid).toContain("packages_ui_components_core");
      
      // Important core packages
      expect(mermaid).toContain("packages_data_repository_core");
      expect(mermaid).toContain("packages_core_validation");
      expect(mermaid).toContain("packages_core_connection");
      expect(mermaid).toContain("packages_services_api_client");
    });

    it("should show core dependency relationships", () => {
      const mermaid = generator.generateCoreDependenciesDiagram();
      
      // Core dependencies
      expect(mermaid).toContain("packages_ai_ai_shared -->|🔗| packages_core_core");
      expect(mermaid).toContain("packages_ui_components_core -->|🔗| packages_core_core");
      expect(mermaid).toContain("packages_data_repository_core -->|🔗| packages_core_core");
      expect(mermaid).toContain("packages_core_validation -->|🔗| packages_core_core");
      expect(mermaid).toContain("packages_core_connection -->|🔗| packages_core_core");
      expect(mermaid).toContain("packages_services_api_client -->|🔗| packages_core_connection");
    });

    it("should use proper styling for core packages", () => {
      const mermaid = generator.generateCoreDependenciesDiagram();
      
      // Critical packages should have critical styling
      expect(mermaid).toContain("packages_core_core[\"⚙️ core/core\"]:::critical");
      expect(mermaid).toContain("packages_ai_ai_shared[\"🤖 ai/ai-shared\"]:::critical");
      expect(mermaid).toContain("packages_ui_components_core[\"🎨 ui/components-core\"]:::critical");
      
      // Important packages should have important styling
      expect(mermaid).toContain("packages_data_repository_core[\"💾 data/repository-core\"]:::important");
      expect(mermaid).toContain("packages_core_validation[\"✅ core/validation\"]:::important");
      expect(mermaid).toContain("packages_core_connection[\"🔗 core/connection\"]:::important");
      expect(mermaid).toContain("packages_services_api_client[\"🔌 services/api-client\"]:::important");
    });

    it("should include proper emojis for core packages", () => {
      const mermaid = generator.generateCoreDependenciesDiagram();
      
      expect(mermaid).toContain("⚙️ core/core");
      expect(mermaid).toContain("🤖 ai/ai-shared");
      expect(mermaid).toContain("🎨 ui/components-core");
      expect(mermaid).toContain("💾 data/repository-core");
      expect(mermaid).toContain("✅ core/validation");
      expect(mermaid).toContain("🔗 core/connection");
      expect(mermaid).toContain("🔌 services/api-client");
    });

    it("should include proper styling classes", () => {
      const mermaid = generator.generateCoreDependenciesDiagram();
      
      expect(mermaid).toContain("classDef critical");
      expect(mermaid).toContain("classDef important");
    });
  });

  describe("File Export", () => {
    it("should export files to specified directory", () => {
      // Test that the export method doesn't throw errors
      expect(() => {
        generator.exportDiagrams("test-output");
      }).not.toThrow();
    });

    it("should create directory if it doesn't exist", () => {
      // Test that the export method doesn't throw errors
      expect(() => {
        generator.exportDiagrams("new-directory");
      }).not.toThrow();
    });
  });

  describe("Utility Methods", () => {
    it("should sanitize IDs properly", () => {
      const sanitizeId = (generator as any).sanitizeId;
      
      expect(sanitizeId("packages/core")).toBe("packages_core");
      expect(sanitizeId("services/agent-naming")).toBe("services_agent_naming");
      expect(sanitizeId("packages/ai/ai-shared")).toBe("packages_ai_ai_shared");
      expect(sanitizeId("backend")).toBe("backend");
    });

    it("should generate short names properly", () => {
      const getShortName = (generator as any).getShortName;
      
      expect(getShortName("packages/core/core")).toBe("core/core");
      expect(getShortName("packages/ai/ai-shared")).toBe("ai/ai-shared");
      expect(getShortName("services/agent-naming")).toBe("agent-naming");
      expect(getShortName("backend")).toBe("backend");
    });
  });

  describe("Performance", () => {
    it("should generate category diagram quickly", () => {
      const start = Date.now();
      generator.generateCategoryDiagram();
      const duration = Date.now() - start;
      
      // Should generate in reasonable time (less than 10ms)
      expect(duration).toBeLessThan(10);
    });

    it("should generate core dependencies diagram quickly", () => {
      const start = Date.now();
      generator.generateCoreDependenciesDiagram();
      const duration = Date.now() - start;
      
      // Should generate in reasonable time (less than 10ms)
      expect(duration).toBeLessThan(10);
    });

    it("should export diagrams quickly", () => {
      const start = Date.now();
      generator.exportDiagrams("test-output");
      const duration = Date.now() - start;
      
      // Should export in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Diagram Structure", () => {
    it("should have consistent node naming", () => {
      const categoryDiagram = generator.generateCategoryDiagram();
      const coreDiagram = generator.generateCoreDependenciesDiagram();
      
      // All node IDs should be valid identifiers
      const nodeIdRegex = /^\s*(\w+)\[/gm;
      
      let categoryMatches = categoryDiagram.match(nodeIdRegex) || [];
      let coreMatches = coreDiagram.match(nodeIdRegex) || [];
      
      [...categoryMatches, ...coreMatches].forEach(match => {
        const nodeId = match.trim().replace(/\[.*$/, ''); // Remove everything after [
        expect(nodeId).toMatch(/^[a-zA-Z0-9_]+$/);
      });
    });

    it("should have proper Mermaid syntax structure", () => {
      const categoryDiagram = generator.generateCategoryDiagram();
      const coreDiagram = generator.generateCoreDependenciesDiagram();
      
      // Both diagrams should start with graph declaration
      expect(categoryDiagram).toMatch(/^graph TD/);
      expect(coreDiagram).toMatch(/^graph TD/);
      
      // Both should have classDef declarations
      expect(categoryDiagram).toContain("classDef");
      expect(coreDiagram).toContain("classDef");
    });

    it("should have meaningful relationship labels", () => {
      const categoryDiagram = generator.generateCategoryDiagram();
      const coreDiagram = generator.generateCoreDependenciesDiagram();
      
      // Should use 🔗 for dependencies
      expect(categoryDiagram).toContain("|🔗|");
      expect(coreDiagram).toContain("|🔗|");
    });
  });
});
