/**
 * Tests for Fluent UI Icons Package
 */

import { describe, it, expect } from "vitest";
import { fluentIconsPackage } from "../fluentIcons";
import { allIcons, iconCategories } from "../categories";

describe("Fluent UI Icons Package", () => {
  describe("Package Properties", () => {
    it("should have correct package metadata", () => {
      expect(fluentIconsPackage.id).toBe("fluent-ui");
      expect(fluentIconsPackage.name).toBe("Fluent UI Icons");
      expect(fluentIconsPackage.version).toBe("1.1.307");
    });

    it("should have required methods", () => {
      expect(typeof fluentIconsPackage.getIcon).toBe("function");
      expect(typeof fluentIconsPackage.getIconNames).toBe("function");
      expect(typeof fluentIconsPackage.hasIcon).toBe("function");
      expect(typeof fluentIconsPackage.getIconMetadata).toBe("function");
    });
  });

  describe("Icon Retrieval", () => {
    it("should return SVG element for valid icon names", () => {
      const icon = fluentIconsPackage.getIcon("search");
      expect(icon).toBeInstanceOf(SVGElement);
      expect(icon?.tagName).toBe("svg");
    });

    it("should return null for invalid icon names", () => {
      const icon = fluentIconsPackage.getIcon("nonexistent-icon");
      expect(icon).toBeNull();
    });

    it("should cache icons for performance", () => {
      const icon1 = fluentIconsPackage.getIcon("search");
      const icon2 = fluentIconsPackage.getIcon("search");

      expect(icon1).toBeInstanceOf(SVGElement);
      expect(icon2).toBeInstanceOf(SVGElement);
      // Should be different instances (cloned)
      expect(icon1).not.toBe(icon2);
    });
  });

  describe("Icon Names", () => {
    it("should return array of icon names", () => {
      const names = fluentIconsPackage.getIconNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it("should include common icons", () => {
      const names = fluentIconsPackage.getIconNames();
      expect(names).toContain("search");
      expect(names).toContain("settings");
      expect(names).toContain("download");
      expect(names).toContain("upload");
    });
  });

  describe("Icon Existence", () => {
    it("should return true for existing icons", () => {
      expect(fluentIconsPackage.hasIcon("search")).toBe(true);
      expect(fluentIconsPackage.hasIcon("settings")).toBe(true);
    });

    it("should return false for non-existing icons", () => {
      expect(fluentIconsPackage.hasIcon("nonexistent")).toBe(false);
    });
  });

  describe("Icon Metadata", () => {
    it("should return metadata for existing icons", () => {
      const getIconMetadata = fluentIconsPackage.getIconMetadata;
      expect(getIconMetadata).toBeDefined();

      const metadata = getIconMetadata!("search");
      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("search");
      expect(metadata?.description).toBeDefined();
      expect(metadata?.tags).toBeDefined();
      expect(metadata?.keywords).toBeDefined();
    });

    it("should return null for non-existing icons", () => {
      const getIconMetadata = fluentIconsPackage.getIconMetadata;
      expect(getIconMetadata).toBeDefined();

      const metadata = getIconMetadata!("nonexistent");
      expect(metadata).toBeNull();
    });

    it("should return mutable arrays for tags and keywords", () => {
      const getIconMetadata = fluentIconsPackage.getIconMetadata;
      expect(getIconMetadata).toBeDefined();

      const metadata = getIconMetadata!("search");
      expect(metadata?.tags).toBeDefined();
      expect(metadata?.keywords).toBeDefined();

      if (metadata?.tags) {
        expect(() => metadata.tags!.push("test")).not.toThrow();
      }
      if (metadata?.keywords) {
        expect(() => metadata.keywords!.push("test")).not.toThrow();
      }
    });
  });
});

describe("Icon Categories", () => {
  describe("Category Structure", () => {
    it("should have all expected categories", () => {
      const expectedCategories = [
        "actions",
        "navigation",
        "files",
        "status",
        "media",
        "interface",
        "development",
        "theme",
        "animals",
        "security",
      ];

      expectedCategories.forEach((category) => {
        expect(
          iconCategories[category as keyof typeof iconCategories],
        ).toBeDefined();
      });
    });

    it("should have category metadata", () => {
      Object.values(iconCategories).forEach((category) => {
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.icons).toBeDefined();
      });
    });
  });

  describe("All Icons", () => {
    it("should contain icons from all categories", () => {
      const allIconNames = Object.keys(allIcons);
      expect(allIconNames.length).toBeGreaterThan(100); // Should have many icons
    });

    it("should have consistent icon structure", () => {
      Object.values(allIcons).forEach((icon) => {
        expect(icon.svg).toBeDefined();
        expect(icon.metadata).toBeDefined();
        expect(icon.metadata.name).toBeDefined();
        expect(icon.metadata.description).toBeDefined();
      });
    });
  });

  describe("Category Coverage", () => {
    it("should have action icons", () => {
      const actionIconNames = Object.keys(iconCategories.actions.icons);
      expect(actionIconNames.length).toBeGreaterThan(0);
      expect(actionIconNames).toContain("add");
      expect(actionIconNames).toContain("delete");
      expect(actionIconNames).toContain("edit");
    });

    it("should have navigation icons", () => {
      const navIconNames = Object.keys(iconCategories.navigation.icons);
      expect(navIconNames.length).toBeGreaterThan(0);
      expect(navIconNames).toContain("home");
      expect(navIconNames).toContain("chevron-down");
      expect(navIconNames).toContain("chevron-up");
    });

    it("should have file icons", () => {
      const fileIconNames = Object.keys(iconCategories.files.icons);
      expect(fileIconNames.length).toBeGreaterThan(0);
      expect(fileIconNames).toContain("folder");
      expect(fileIconNames).toContain("document-text");
      expect(fileIconNames).toContain("file-text");
    });

    it("should have status icons", () => {
      const statusIconNames = Object.keys(iconCategories.status.icons);
      expect(statusIconNames.length).toBeGreaterThan(0);
      expect(statusIconNames).toContain("success");
      expect(statusIconNames).toContain("error");
      expect(statusIconNames).toContain("warning");
    });

    it("should have media icons", () => {
      const mediaIconNames = Object.keys(iconCategories.media.icons);
      expect(mediaIconNames.length).toBeGreaterThan(0);
      expect(mediaIconNames).toContain("play");
      expect(mediaIconNames).toContain("pause");
      expect(mediaIconNames).toContain("stop");
    });

    it("should have interface icons", () => {
      const interfaceIconNames = Object.keys(iconCategories.interface.icons);
      expect(interfaceIconNames.length).toBeGreaterThan(0);
      expect(interfaceIconNames).toContain("settings");
      expect(interfaceIconNames).toContain("search");
      expect(interfaceIconNames).toContain("eye");
    });

    it("should have development icons", () => {
      const devIconNames = Object.keys(iconCategories.development.icons);
      expect(devIconNames.length).toBeGreaterThan(0);
      expect(devIconNames).toContain("code");
      expect(devIconNames).toContain("database");
      expect(devIconNames).toContain("brain");
    });

    it("should have theme icons", () => {
      const themeIconNames = Object.keys(iconCategories.theme.icons);
      expect(themeIconNames.length).toBeGreaterThan(0);
      expect(themeIconNames).toContain("sun");
      expect(themeIconNames).toContain("moon");
      expect(themeIconNames).toContain("sparkle");
    });

    it("should have animal icons", () => {
      const animalIconNames = Object.keys(iconCategories.animals.icons);
      expect(animalIconNames.length).toBeGreaterThan(0);
      expect(animalIconNames).toContain("cat");
      expect(animalIconNames).toContain("dog");
      expect(animalIconNames).toContain("turtle");
    });

    it("should have security icons", () => {
      const securityIconNames = Object.keys(iconCategories.security.icons);
      expect(securityIconNames.length).toBeGreaterThan(0);
      expect(securityIconNames).toContain("user");
      expect(securityIconNames).toContain("lock");
      expect(securityIconNames).toContain("logout");
    });
  });
});
