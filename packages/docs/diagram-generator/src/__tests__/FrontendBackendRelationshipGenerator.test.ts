/**
 * 🦊 Frontend-Backend Relationship Generator Tests
 */

import { describe, it, expect } from "vitest";
import { FrontendBackendRelationshipGenerator } from "../generators/FrontendBackendRelationshipGenerator.js";
import type { CodebaseAnalysis, DiagramGenerationConfig } from "../types.js";

describe("FrontendBackendRelationshipGenerator", () => {
  const generator = new FrontendBackendRelationshipGenerator();

  const mockAnalysis: CodebaseAnalysis = {
    packages: [
      {
        name: "reynard-api-client",
        path: "packages/api-client",
        type: "source",
        importance: "critical",
        dependencies: ["reynard-connection", "reynard-i18n"],
        exports: ["useAuth", "useCaption", "useChat"],
        components: [],
        files: [],
      },
      {
        name: "reynard-connection",
        path: "packages/connection",
        type: "source",
        importance: "critical",
        dependencies: ["reynard-validation"],
        exports: ["HTTPClient", "WebSocketClient"],
        components: [],
        files: [],
      },
      {
        name: "reynard-caption",
        path: "packages/caption",
        type: "source",
        importance: "important",
        dependencies: ["reynard-api-client", "reynard-components-core"],
        exports: ["CaptionComponent", "CaptionService"],
        components: [],
        files: [],
      },
      {
        name: "reynard-chat",
        path: "packages/chat",
        type: "source",
        importance: "important",
        dependencies: ["reynard-api-client", "reynard-connection"],
        exports: ["ChatComponent", "ChatService"],
        components: [],
        files: [],
      },
      {
        name: "backend",
        path: "backend",
        type: "source",
        importance: "critical",
        dependencies: [],
        exports: [],
        components: [],
        files: [],
      },
    ],
    dependencies: [
      {
        name: "solid-js",
        type: "external",
        version: "1.9.9",
        usageCount: 5,
        packages: ["packages/api-client", "packages/connection"],
      },
    ],
    components: [],
    fileStructure: {
      rootDirectories: ["packages", "backend"],
      structure: {
        name: "root",
        path: "",
        type: "directory",
        children: [],
        files: [],
        metadata: {},
      },
      totalFiles: 0,
      totalDirectories: 0,
      fileTypeDistribution: {},
    },
    relationships: [],
  };

  const mockConfig: DiagramGenerationConfig = {
    outputDir: "./test-diagrams",
    generateSvg: false,
    generatePng: false,
    generateHighRes: false,
    theme: "neutral",
    maxComplexity: 50,
    includeFilePaths: true,
    includeRelationships: true,
    includeMetadata: true,
  };

  it("should validate input correctly", () => {
    expect(generator.validate(mockAnalysis)).toBe(true);

    const emptyAnalysis: CodebaseAnalysis = {
      packages: [],
      dependencies: [],
      components: [],
      fileStructure: {
        rootDirectories: [],
        structure: {
          name: "root",
          path: "",
          type: "directory",
          children: [],
          files: [],
          metadata: {},
        },
        totalFiles: 0,
        totalDirectories: 0,
        fileTypeDistribution: {},
      },
      relationships: [],
    };

    expect(generator.validate(emptyAnalysis)).toBe(false);
  });

  it("should generate Mermaid content", async () => {
    const result = await generator.generate(mockAnalysis, mockConfig);

    expect(result.mermaidContent).toBeDefined();
    expect(result.mermaidContent).toContain("graph TB");
    expect(result.mermaidContent).toContain("🦊 Reynard Frontend-Backend Architecture");
    expect(result.mermaidContent).toContain("🖥️ Frontend Packages");
    expect(result.mermaidContent).toContain("⚙️ Backend Services");
    expect(result.mermaidContent).toContain("reynard-api-client");
    expect(result.mermaidContent).toContain("reynard-connection");
    expect(result.mermaidContent).toContain("reynard-caption");
    expect(result.mermaidContent).toContain("reynard-chat");
    expect(result.mermaidContent).toContain("backend");
  });

  it("should include proper metadata", async () => {
    const result = await generator.generate(mockAnalysis, mockConfig);

    expect(result.metadata).toBeDefined();
    expect(result.metadata.type).toBe("frontend-backend-relationships");
    expect(result.metadata.title).toBe("Reynard Frontend-Backend Relationships");
    expect(result.metadata.nodeCount).toBeGreaterThan(0);
    expect(result.metadata.edgeCount).toBeGreaterThan(0);
    expect(result.metadata.complexityScore).toBeGreaterThan(0);
    expect(result.metadata.generatedAt).toBeDefined();
  });

  it("should include authentication and real-time indicators", async () => {
    const result = await generator.generate(mockAnalysis, mockConfig);

    // Should include legend with authentication and real-time indicators
    expect(result.mermaidContent).toContain("🔐 Authentication Required");
    expect(result.mermaidContent).toContain("⚡ Real-time Features");
    expect(result.mermaidContent).toContain("📋 Legend");
  });

  it("should include API connection types", async () => {
    const result = await generator.generate(mockAnalysis, mockConfig);

    // Should include different connection types in legend
    expect(result.mermaidContent).toContain("--> HTTP API");
    expect(result.mermaidContent).toContain("<--> WebSocket");
    expect(result.mermaidContent).toContain("--> Server-Sent Events");
    expect(result.mermaidContent).toContain("-.-> Internal Dependency");
  });

  it("should group packages by type", async () => {
    const result = await generator.generate(mockAnalysis, mockConfig);

    // Should group frontend packages by type
    expect(result.mermaidContent).toContain("api-client");
    expect(result.mermaidContent).toContain("connection");
    expect(result.mermaidContent).toContain("ui");
  });
});
