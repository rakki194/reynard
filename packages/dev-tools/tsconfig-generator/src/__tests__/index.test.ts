/**
 * 🦊 TypeScript Configuration Generator Index Tests
 * Tests the main exports from the index file
 */

import { describe, it, expect } from "vitest";
import { TSConfigGenerator } from "../index.js";

describe("Index Exports", () => {
  it("should export TSConfigGenerator class", () => {
    expect(TSConfigGenerator).toBeDefined();
    expect(typeof TSConfigGenerator).toBe("function");
  });

  it("should be able to instantiate TSConfigGenerator", () => {
    const generator = new TSConfigGenerator();
    expect(generator).toBeInstanceOf(TSConfigGenerator);
  });

  it("should have generateConfig method", () => {
    const generator = new TSConfigGenerator();
    expect(typeof generator.generateConfig).toBe("function");
  });
});
