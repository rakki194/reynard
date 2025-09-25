/**
 * 🦊 Vitest Configuration Generator Index Tests
 * Tests the main exports from the index file
 */

import { describe, it, expect } from "vitest";
import { VitestConfigGenerator, ConfigWriter } from "../index.js";

describe("Index Exports", () => {
  it("should export VitestConfigGenerator class", () => {
    expect(VitestConfigGenerator).toBeDefined();
    expect(typeof VitestConfigGenerator).toBe("function");
  });

  it("should export ConfigWriter class", () => {
    expect(ConfigWriter).toBeDefined();
    expect(typeof ConfigWriter).toBe("function");
  });

  it("should be able to instantiate VitestConfigGenerator", () => {
    const generator = new VitestConfigGenerator();
    expect(generator).toBeInstanceOf(VitestConfigGenerator);
  });

  it("should be able to instantiate ConfigWriter", () => {
    const writer = new ConfigWriter();
    expect(writer).toBeInstanceOf(ConfigWriter);
  });

  it("should have generateConfig method on VitestConfigGenerator", () => {
    const generator = new VitestConfigGenerator();
    expect(typeof generator.generateConfig).toBe("function");
  });

  it("should have writeConfig method on ConfigWriter", () => {
    const writer = new ConfigWriter();
    expect(typeof writer.writeConfig).toBe("function");
  });

  it("should have validateConfig method on ConfigWriter", () => {
    const writer = new ConfigWriter();
    expect(typeof writer.validateConfig).toBe("function");
  });

  it("should have backupCurrentConfig method on ConfigWriter", () => {
    const writer = new ConfigWriter();
    expect(typeof writer.backupCurrentConfig).toBe("function");
  });
});
