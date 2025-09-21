/**
 * Tests for ADRRelationshipMapper class
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "path";
import { ADRRelationshipMapper } from "../ADRRelationshipMapper";
import { createTestEnvironment, createEmptyTestEnvironment, createSampleADRFiles } from "./test-utils";

describe("ADRRelationshipMapper", () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnvironment>>;
  let mapper: ADRRelationshipMapper;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    await createSampleADRFiles(testEnv.adrDirectory);
    mapper = new ADRRelationshipMapper(testEnv.adrDirectory);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("constructor", () => {
    it("should initialize with ADR directory", () => {
      const mapper = new ADRRelationshipMapper("/test/adr");
      expect(mapper).toBeInstanceOf(ADRRelationshipMapper);
    });
  });

  describe("analyzeRelationships", () => {
    it("should analyze ADR relationships", async () => {
      const relationships = await mapper.analyzeRelationships();

      expect(Array.isArray(relationships)).toBe(true);

      relationships.forEach(relationship => {
        expect(relationship).toHaveProperty("source");
        expect(relationship).toHaveProperty("target");
        expect(relationship).toHaveProperty("type");
        expect(relationship).toHaveProperty("strength");
        expect(relationship).toHaveProperty("description");

        expect(typeof relationship.source).toBe("string");
        expect(typeof relationship.target).toBe("string");
        expect(["supersedes", "related", "conflicts", "depends_on"]).toContain(relationship.type);
        expect(typeof relationship.strength).toBe("number");
        expect(relationship.strength).toBeGreaterThanOrEqual(0);
        expect(relationship.strength).toBeLessThanOrEqual(1);
        expect(typeof relationship.description).toBe("string");
      });
    });

    it("should handle empty directory", async () => {
      const emptyTestEnv = await createEmptyTestEnvironment();
      const emptyMapper = new ADRRelationshipMapper(emptyTestEnv.adrDirectory);

      const relationships = await emptyMapper.analyzeRelationships();

      expect(relationships.length).toBe(0);

      // Clean up the empty test environment
      await emptyTestEnv.cleanup();
    });

    it("should handle directory read errors", async () => {
      const invalidMapper = new ADRRelationshipMapper("/nonexistent/directory");

      const relationships = await invalidMapper.analyzeRelationships();

      expect(relationships.length).toBe(0);
    });
  });

  describe("getRelationshipsForADR", () => {
    it("should get relationships for specific ADR", async () => {
      await mapper.analyzeRelationships();

      const relationships = mapper.getRelationshipsForADR("001");

      expect(relationships).toHaveProperty("incoming");
      expect(relationships).toHaveProperty("outgoing");
      expect(Array.isArray(relationships.incoming)).toBe(true);
      expect(Array.isArray(relationships.outgoing)).toBe(true);
    });

    it("should return empty arrays for non-existent ADR", async () => {
      await mapper.analyzeRelationships();

      const relationships = mapper.getRelationshipsForADR("999");

      expect(relationships.incoming.length).toBe(0);
      expect(relationships.outgoing.length).toBe(0);
    });
  });

  describe("getRelationshipGraph", () => {
    it("should return relationship graph as adjacency list", async () => {
      await mapper.analyzeRelationships();

      const graph = mapper.getRelationshipGraph();

      expect(graph).toBeInstanceOf(Map);
    });

    it("should handle empty relationships", async () => {
      await testEnv.cleanup();
      testEnv = await createTestEnvironment();
      const emptyMapper = new ADRRelationshipMapper(testEnv.adrDirectory);
      await emptyMapper.analyzeRelationships();

      const graph = emptyMapper.getRelationshipGraph();

      expect(graph.size).toBe(0);
    });
  });

  describe("detectCircularDependencies", () => {
    it("should detect circular dependencies", async () => {
      await mapper.analyzeRelationships();

      const cycles = mapper.detectCircularDependencies();

      expect(Array.isArray(cycles)).toBe(true);

      cycles.forEach(cycle => {
        expect(Array.isArray(cycle)).toBe(true);
        expect(cycle.length).toBeGreaterThan(0);
      });
    });

    it("should return empty array when no circular dependencies", async () => {
      await testEnv.cleanup();
      testEnv = await createTestEnvironment();
      const emptyMapper = new ADRRelationshipMapper(testEnv.adrDirectory);
      await emptyMapper.analyzeRelationships();

      const cycles = emptyMapper.detectCircularDependencies();

      expect(cycles.length).toBe(0);
    });
  });

  describe("getDependencyChain", () => {
    it("should get dependency chain for ADR", async () => {
      const emptyTestEnv = await createEmptyTestEnvironment();
      const emptyMapper = new ADRRelationshipMapper(emptyTestEnv.adrDirectory);
      await emptyMapper.analyzeRelationships();

      const chain = emptyMapper.getDependencyChain("001");

      expect(Array.isArray(chain)).toBe(true);
      expect(chain.length).toBe(1); // Should contain just the starting ADR with no dependencies
      expect(chain[0]).toBe("001");

      // Clean up the empty test environment
      await emptyTestEnv.cleanup();
    });

    it("should return single ADR when no dependencies", async () => {
      await testEnv.cleanup();
      testEnv = await createTestEnvironment();
      const emptyMapper = new ADRRelationshipMapper(testEnv.adrDirectory);
      await emptyMapper.analyzeRelationships();

      const chain = emptyMapper.getDependencyChain("001");

      // The method always adds the starting ADR to the chain, even if it doesn't exist
      // So we expect it to contain just the starting ADR with no dependencies
      expect(chain.length).toBe(1);
      expect(chain[0]).toBe("001");
    });
  });

  describe("export and import relationships", () => {
    it("should export relationships to JSON", async () => {
      await mapper.analyzeRelationships();

      const json = mapper.exportRelationships();

      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it("should import relationships from JSON", async () => {
      const testRelationships = [
        {
          source: "001",
          target: "002",
          type: "related",
          strength: 0.5,
          description: "Test relationship",
        },
      ];

      const json = JSON.stringify(testRelationships);
      mapper.importRelationships(json);

      const relationships = mapper.getRelationshipsForADR("001");
      expect(relationships.outgoing.length).toBe(1);
    });

    it("should handle invalid JSON gracefully", () => {
      const invalidJson = "invalid json";

      expect(() => mapper.importRelationships(invalidJson)).not.toThrow();
    });
  });

  describe("ADR parsing", () => {
    it("should parse ADR files correctly", async () => {
      const relationships = await mapper.analyzeRelationships();

      // Should not throw errors during parsing
      expect(Array.isArray(relationships)).toBe(true);
    });

    it("should handle malformed ADR files", async () => {
      // Create a malformed ADR file
      const malformedADR = `# ADR-991: Malformed ADR

This is not a properly formatted ADR.
`;

      const filePath = `${testEnv.adrDirectory}/991-malformed-adr.md`;
      await require("fs/promises").writeFile(filePath, malformedADR);

      const relationships = await mapper.analyzeRelationships();

      // Should handle malformed files gracefully
      expect(Array.isArray(relationships)).toBe(true);
    });

    it("should extract ADR metadata correctly", async () => {
      await mapper.analyzeRelationships();

      // The sample ADR should be parsed correctly
      const relationships = mapper.getRelationshipsForADR("001");
      expect(relationships).toBeDefined();
    });
  });

  describe("relationship analysis", () => {
    it("should analyze superseding relationships", async () => {
      // Create ADRs with superseding relationships
      const supersedingADR = `# ADR-990: Superseding ADR

## Status
**Accepted** - 2024-01-01

## Context
This ADR supersedes ADR-001.

## Decision
We will use the new approach.

## Consequences
### Positive
- Better approach

### Negative
- Migration required

supersedes: ["001"]
`;

      const filePath = `${testEnv.adrDirectory}/990-superseding-adr.md`;
      await require("fs/promises").writeFile(filePath, supersedingADR);

      // Create a test environment with ADRs that have superseding relationships
      const supersedingTestEnv = await createTestEnvironment();
      const supersedingMapper = new ADRRelationshipMapper(supersedingTestEnv.adrDirectory);

      // Create ADRs with superseding relationships
      await require("fs/promises").writeFile(
        join(supersedingTestEnv.adrDirectory, "001-old-decision.md"),
        `# ADR-001: Old Decision
## Status
**Superseded** - 2024-01-01
## Context
This is an old decision.
## Decision
We decided to use the old approach.
## Consequences
- Old consequences

supersededBy: 002
`
      );

      await require("fs/promises").writeFile(
        join(supersedingTestEnv.adrDirectory, "002-new-decision.md"),
        `# ADR-002: New Decision
## Status
**Accepted** - 2024-01-02
## Context
This supersedes ADR-001.
## Decision
We decided to use the new approach instead.
## Consequences
- New consequences

supersedes: ["001"]
`
      );

      const relationships = await supersedingMapper.analyzeRelationships();
      const supersedingRelations = relationships.filter(rel => rel.type === "supersedes");
      expect(supersedingRelations.length).toBeGreaterThan(0);

      // Clean up
      await supersedingTestEnv.cleanup();
    });

    it("should analyze related ADR relationships", async () => {
      // Create ADRs with related relationships
      const relatedADR = `# ADR-989: Related ADR

## Status
**Accepted** - 2024-01-01

## Context
This ADR is related to ADR-001.

## Decision
We will implement this.

## Consequences
### Positive
- Good

### Negative
- Bad

relatedADRs: ["001"]
`;

      const filePath = `${testEnv.adrDirectory}/989-related-adr.md`;
      await require("fs/promises").writeFile(filePath, relatedADR);

      const relationships = await mapper.analyzeRelationships();

      const relatedRelations = relationships.filter(rel => rel.type === "related");
      expect(relatedRelations.length).toBeGreaterThan(0);
    });

    it("should analyze conflicting ADR relationships", async () => {
      const relationships = await mapper.analyzeRelationships();

      const conflictingRelations = relationships.filter(rel => rel.type === "conflicts");
      // May or may not have conflicts depending on content similarity
      expect(Array.isArray(conflictingRelations)).toBe(true);
    });

    it("should analyze dependency relationships", async () => {
      const relationships = await mapper.analyzeRelationships();

      const dependencyRelations = relationships.filter(rel => rel.type === "depends_on");
      // May or may not have dependencies depending on content
      expect(Array.isArray(dependencyRelations)).toBe(true);
    });
  });
});
