/**
 * Tests for Icon Registry
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  iconRegistry,
  registerIconPackage,
  unregisterIconPackage,
  getIcon,
  getAllIconNames,
  getIconPackages,
  searchIcons,
} from "../../registry";
import { fluentIconsPackage } from "../../fluentIcons";

describe("Icon Registry", () => {
  beforeEach(() => {
    // Clear registry before each test
    const packages = iconRegistry.getPackages();
    packages.forEach(pkg => {
      iconRegistry.unregister(pkg.id);
    });
  });

  describe("Package Registration", () => {
    it("should register a package", () => {
      iconRegistry.register(fluentIconsPackage);
      const packages = iconRegistry.getPackages();
      expect(packages).toHaveLength(1);
      expect(packages[0].id).toBe("fluent-ui");
    });

    it("should not register duplicate packages", () => {
      iconRegistry.register(fluentIconsPackage);
      iconRegistry.register(fluentIconsPackage);
      const packages = iconRegistry.getPackages();
      expect(packages).toHaveLength(1);
    });

    it("should unregister a package", () => {
      iconRegistry.register(fluentIconsPackage);
      iconRegistry.unregister("fluent-ui");
      const packages = iconRegistry.getPackages();
      expect(packages).toHaveLength(0);
    });
  });

  describe("Icon Retrieval", () => {
    beforeEach(() => {
      iconRegistry.register(fluentIconsPackage);
    });

    it("should get icon from registered package", () => {
      const icon = iconRegistry.getIcon("search");
      expect(icon).toBeInstanceOf(SVGElement);
    });

    it("should get icon from specific package", () => {
      const icon = iconRegistry.getIcon("search", "fluent-ui");
      expect(icon).toBeInstanceOf(SVGElement);
    });

    it("should return null for non-existent icon", () => {
      const icon = iconRegistry.getIcon("nonexistent");
      expect(icon).toBeNull();
    });

    it("should return null for non-existent package", () => {
      const icon = iconRegistry.getIcon("search", "nonexistent");
      expect(icon).toBeNull();
    });
  });

  describe("Icon Names", () => {
    beforeEach(() => {
      iconRegistry.register(fluentIconsPackage);
    });

    it("should get all icon names from all packages", () => {
      const names = iconRegistry.getAllIconNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain("search");
    });
  });

  describe("Icon Search", () => {
    beforeEach(() => {
      iconRegistry.register(fluentIconsPackage);
    });

    it("should search icons by name", () => {
      const results = iconRegistry.searchIcons("search");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe("search");
      expect(results[0].packageId).toBe("fluent-ui");
    });

    it("should search icons by keywords", () => {
      const results = iconRegistry.searchIcons("magnifying");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe("search");
    });

    it("should return empty array for no matches", () => {
      const results = iconRegistry.searchIcons("nonexistent");
      expect(results).toHaveLength(0);
    });

    it("should return results sorted by relevance", () => {
      const results = iconRegistry.searchIcons("add");
      expect(results.length).toBeGreaterThan(0);
      // Results should be sorted by score (highest first)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score || 0).toBeGreaterThanOrEqual(results[i].score || 0);
      }
    });
  });

  describe("Utility Functions", () => {
    beforeEach(() => {
      iconRegistry.register(fluentIconsPackage);
    });

    it("should register package using utility function", () => {
      // Clear registry first
      iconRegistry.unregister("fluent-ui");

      registerIconPackage(fluentIconsPackage);
      const packages = getIconPackages();
      expect(packages).toHaveLength(1);
    });

    it("should unregister package using utility function", () => {
      unregisterIconPackage("fluent-ui");
      const packages = getIconPackages();
      expect(packages).toHaveLength(0);
    });

    it("should get icon using utility function", () => {
      const icon = getIcon("search");
      expect(icon).toBeInstanceOf(SVGElement);
    });

    it("should get all icon names using utility function", () => {
      const names = getAllIconNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it("should get icon packages using utility function", () => {
      const packages = getIconPackages();
      expect(Array.isArray(packages)).toBe(true);
      expect(packages).toHaveLength(1);
    });

    it("should search icons using utility function", () => {
      const results = searchIcons("search");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
