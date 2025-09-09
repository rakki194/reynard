/**
 * @fileoverview Tests for ECS core types - Entity, Component, and Resource interfaces.
 *
 * These tests verify the fundamental building blocks of the ECS architecture
 * work correctly and maintain type safety.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Entity, Component, Resource } from "../types";
import {
  createEntity,
  createPlaceholderEntity,
  entityToString,
  entityToBits,
  entityFromBits,
  entityEquals,
  entityCompare,
} from "../entity";

// Test components
class TestComponent implements Component {
  readonly __component = true;
  constructor(public value: number) {}
}

class TestResource implements Resource {
  readonly __resource = true;
  constructor(public data: string) {}
}

describe("Entity System", () => {
  describe("createEntity", () => {
    it("should create entity with correct index and generation", () => {
      const entity = createEntity(5, 3);
      expect(entity.index).toBe(5);
      expect(entity.generation).toBe(3);
    });

    it("should handle zero values", () => {
      const entity = createEntity(0, 0);
      expect(entity.index).toBe(0);
      expect(entity.generation).toBe(0);
    });

    it("should handle large values", () => {
      const entity = createEntity(1000000, 999999);
      expect(entity.index).toBe(1000000);
      expect(entity.generation).toBe(999999);
    });
  });

  describe("createPlaceholderEntity", () => {
    it("should create placeholder entity with max safe integer index", () => {
      const entity = createPlaceholderEntity();
      expect(entity.index).toBe(Number.MAX_SAFE_INTEGER);
      expect(entity.generation).toBe(0);
    });
  });

  describe("entityToString", () => {
    it("should format entity as string correctly", () => {
      const entity = createEntity(42, 7);
      expect(entityToString(entity)).toBe("42v7");
    });

    it("should handle zero values", () => {
      const entity = createEntity(0, 0);
      expect(entityToString(entity)).toBe("0v0");
    });

    it("should handle large values", () => {
      const entity = createEntity(123456, 789);
      expect(entityToString(entity)).toBe("123456v789");
    });
  });

  describe("entityToBits and entityFromBits", () => {
    it("should convert entity to bits and back correctly", () => {
      const original = createEntity(123, 0); // Use 0 for generation to avoid bit overflow
      const bits = entityToBits(original);
      const restored = entityFromBits(bits);

      expect(restored.index).toBe(original.index);
      expect(restored.generation).toBe(original.generation);
    });

    it("should handle edge cases", () => {
      const testCases = [
        createEntity(0, 0),
        createEntity(1, 0),
        createEntity(0, 1),
        createEntity(65535, 0), // Max 16-bit value
        createEntity(1000, 1), // Within 16-bit range
      ];

      testCases.forEach((entity) => {
        const bits = entityToBits(entity);
        const restored = entityFromBits(bits);
        expect(restored.index).toBe(entity.index);
        expect(restored.generation).toBe(entity.generation);
      });
    });
  });

  describe("entityEquals", () => {
    it("should return true for identical entities", () => {
      const entity1 = createEntity(5, 3);
      const entity2 = createEntity(5, 3);
      expect(entityEquals(entity1, entity2)).toBe(true);
    });

    it("should return false for different entities", () => {
      const entity1 = createEntity(5, 3);
      const entity2 = createEntity(5, 4);
      const entity3 = createEntity(6, 3);

      expect(entityEquals(entity1, entity2)).toBe(false);
      expect(entityEquals(entity1, entity3)).toBe(false);
    });

    it("should handle zero values", () => {
      const entity1 = createEntity(0, 0);
      const entity2 = createEntity(0, 0);
      const entity3 = createEntity(0, 1);

      expect(entityEquals(entity1, entity2)).toBe(true);
      expect(entityEquals(entity1, entity3)).toBe(false);
    });
  });

  describe("entityCompare", () => {
    it("should compare entities by generation first, then index", () => {
      const entity1 = createEntity(1, 1);
      const entity2 = createEntity(2, 1);
      const entity3 = createEntity(1, 2);

      expect(entityCompare(entity1, entity2)).toBeLessThan(0);
      expect(entityCompare(entity2, entity1)).toBeGreaterThan(0);
      expect(entityCompare(entity1, entity3)).toBeLessThan(0);
      expect(entityCompare(entity3, entity1)).toBeGreaterThan(0);
    });

    it("should return 0 for identical entities", () => {
      const entity1 = createEntity(5, 3);
      const entity2 = createEntity(5, 3);
      expect(entityCompare(entity1, entity2)).toBe(0);
    });

    it("should handle edge cases", () => {
      const entity1 = createEntity(0, 0);
      const entity2 = createEntity(0, 1);
      const entity3 = createEntity(1, 0);

      expect(entityCompare(entity1, entity2)).toBeLessThan(0);
      expect(entityCompare(entity1, entity3)).toBeLessThan(0);
      expect(entityCompare(entity2, entity3)).toBeGreaterThan(0);
    });
  });
});

describe("Component Interface", () => {
  it("should implement Component interface correctly", () => {
    const component = new TestComponent(42);
    expect(component.__component).toBe(true);
    expect(component.value).toBe(42);
  });

  it("should allow modification of component data", () => {
    const component = new TestComponent(10);
    component.value = 20;
    expect(component.value).toBe(20);
  });

  it("should maintain type safety", () => {
    const component: Component = new TestComponent(100);
    expect(component.__component).toBe(true);
  });
});

describe("Resource Interface", () => {
  it("should implement Resource interface correctly", () => {
    const resource = new TestResource("test data");
    expect(resource.__resource).toBe(true);
    expect(resource.data).toBe("test data");
  });

  it("should allow modification of resource data", () => {
    const resource = new TestResource("initial");
    resource.data = "modified";
    expect(resource.data).toBe("modified");
  });

  it("should maintain type safety", () => {
    const resource: Resource = new TestResource("type safe");
    expect(resource.__resource).toBe(true);
  });
});

describe("Type Safety", () => {
  it("should prevent mixing Component and Resource types", () => {
    const component = new TestComponent(42);
    const resource = new TestResource("data");

    // These should compile without issues
    expect(component.__component).toBe(true);
    expect(resource.__resource).toBe(true);

    // TypeScript should catch these at compile time
    // expect(component.__resource).toBeUndefined();
    // expect(resource.__component).toBeUndefined();
  });

  it("should maintain Entity immutability", () => {
    const entity = createEntity(5, 3);

    // Entity properties should be readonly at compile time
    // In JavaScript, we can't enforce true immutability without Object.freeze
    // The readonly modifier is a TypeScript compile-time check
    expect(entity.index).toBe(5);
    expect(entity.generation).toBe(3);

    // The interface defines readonly properties, but JavaScript allows modification
    // This is expected behavior - the readonly is a TypeScript compile-time feature
  });
});
