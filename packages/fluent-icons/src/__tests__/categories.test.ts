/**
 * Tests for Icon Categories
 */

import { describe, it, expect } from "vitest";
import {
  actionIcons,
  navigationIcons,
  fileIcons,
  statusIcons,
  mediaIcons,
  interfaceIcons,
  developmentIcons,
  themeIcons,
  animalIcons,
  securityIcons,
  customIcons,
  allIcons,
  iconCategories,
} from "../categories";

describe("Icon Categories", () => {
  describe("Action Icons", () => {
    it("should have action icons", () => {
      expect(Object.keys(actionIcons).length).toBeGreaterThan(0);
    });

    it("should have common action icons", () => {
      expect(actionIcons.add).toBeDefined();
      expect(actionIcons.delete).toBeDefined();
      expect(actionIcons.edit).toBeDefined();
      expect(actionIcons.download).toBeDefined();
      expect(actionIcons.upload).toBeDefined();
    });

    it("should have proper metadata for action icons", () => {
      const addIcon = actionIcons.add;
      expect(addIcon.metadata.tags).toContain("action");
      expect(addIcon.metadata.keywords).toContain("add");
    });
  });

  describe("Navigation Icons", () => {
    it("should have navigation icons", () => {
      expect(Object.keys(navigationIcons).length).toBeGreaterThan(0);
    });

    it("should have common navigation icons", () => {
      expect(navigationIcons.home).toBeDefined();
      expect(navigationIcons["chevron-down"]).toBeDefined();
      expect(navigationIcons["chevron-up"]).toBeDefined();
      expect(navigationIcons["chevron-left"]).toBeDefined();
      expect(navigationIcons["chevron-right"]).toBeDefined();
    });
  });

  describe("File Icons", () => {
    it("should have file icons", () => {
      expect(Object.keys(fileIcons).length).toBeGreaterThan(0);
    });

    it("should have common file icons", () => {
      expect(fileIcons.folder).toBeDefined();
      expect(fileIcons["document-text"]).toBeDefined();
      expect(fileIcons["file-text"]).toBeDefined();
      expect(fileIcons.document).toBeDefined();
    });
  });

  describe("Status Icons", () => {
    it("should have status icons", () => {
      expect(Object.keys(statusIcons).length).toBeGreaterThan(0);
    });

    it("should have common status icons", () => {
      expect(statusIcons.success).toBeDefined();
      expect(statusIcons.error).toBeDefined();
      expect(statusIcons.warning).toBeDefined();
      expect(statusIcons.info).toBeDefined();
      expect(statusIcons.spinner).toBeDefined();
    });
  });

  describe("Media Icons", () => {
    it("should have media icons", () => {
      expect(Object.keys(mediaIcons).length).toBeGreaterThan(0);
    });

    it("should have common media icons", () => {
      expect(mediaIcons.play).toBeDefined();
      expect(mediaIcons.pause).toBeDefined();
      expect(mediaIcons.stop).toBeDefined();
      expect(mediaIcons.speaker).toBeDefined();
      expect(mediaIcons.video).toBeDefined();
    });
  });

  describe("Interface Icons", () => {
    it("should have interface icons", () => {
      expect(Object.keys(interfaceIcons).length).toBeGreaterThan(0);
    });

    it("should have common interface icons", () => {
      expect(interfaceIcons.settings).toBeDefined();
      expect(interfaceIcons.search).toBeDefined();
      expect(interfaceIcons.eye).toBeDefined();
      expect(interfaceIcons.grid).toBeDefined();
      expect(interfaceIcons.list).toBeDefined();
    });
  });

  describe("Development Icons", () => {
    it("should have development icons", () => {
      expect(Object.keys(developmentIcons).length).toBeGreaterThan(0);
    });

    it("should have common development icons", () => {
      expect(developmentIcons.code).toBeDefined();
      expect(developmentIcons.database).toBeDefined();
      expect(developmentIcons.brain).toBeDefined();
      expect(developmentIcons["git-branch"]).toBeDefined();
    });
  });

  describe("Theme Icons", () => {
    it("should have theme icons", () => {
      expect(Object.keys(themeIcons).length).toBeGreaterThan(0);
    });

    it("should have common theme icons", () => {
      expect(themeIcons.sun).toBeDefined();
      expect(themeIcons.moon).toBeDefined();
      expect(themeIcons.cloud).toBeDefined();
      expect(themeIcons.sparkle).toBeDefined();
    });
  });

  describe("Animal Icons", () => {
    it("should have animal icons", () => {
      expect(Object.keys(animalIcons).length).toBeGreaterThan(0);
    });

    it("should have common animal icons", () => {
      expect(animalIcons.cat).toBeDefined();
      expect(animalIcons.dog).toBeDefined();
      expect(animalIcons.turtle).toBeDefined();
      expect(animalIcons["paw-print"]).toBeDefined();
    });
  });

  describe("Security Icons", () => {
    it("should have security icons", () => {
      expect(Object.keys(securityIcons).length).toBeGreaterThan(0);
    });

    it("should have common security icons", () => {
      expect(securityIcons.user).toBeDefined();
      expect(securityIcons.lock).toBeDefined();
      expect(securityIcons.logout).toBeDefined();
      expect(securityIcons.login).toBeDefined();
    });
  });

  describe("Custom Icons", () => {
    it("should have custom icons", () => {
      expect(Object.keys(customIcons).length).toBeGreaterThan(0);
    });

    it("should have common custom icons", () => {
      expect(customIcons.yipyap).toBeDefined();
      expect(customIcons.peanut).toBeDefined();
      expect(customIcons.banana).toBeDefined();
      expect(customIcons.strawberry).toBeDefined();
    });
  });

  describe("All Icons", () => {
    it("should combine all categories", () => {
      const totalIcons = Object.keys(allIcons).length;
      const categoryIcons =
        Object.keys(actionIcons).length +
        Object.keys(navigationIcons).length +
        Object.keys(fileIcons).length +
        Object.keys(statusIcons).length +
        Object.keys(mediaIcons).length +
        Object.keys(interfaceIcons).length +
        Object.keys(developmentIcons).length +
        Object.keys(themeIcons).length +
        Object.keys(animalIcons).length +
        Object.keys(securityIcons).length +
        Object.keys(customIcons).length;

      expect(totalIcons).toBe(categoryIcons);
    });

    it("should have unique icon names", () => {
      const iconNames = Object.keys(allIcons);
      const uniqueNames = new Set(iconNames);
      expect(iconNames.length).toBe(uniqueNames.size);
    });
  });

  describe("Icon Categories Metadata", () => {
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
        "custom",
      ];

      expectedCategories.forEach((category) => {
        expect(
          iconCategories[category as keyof typeof iconCategories],
        ).toBeDefined();
      });
    });

    it("should have proper category metadata", () => {
      Object.values(iconCategories).forEach((category) => {
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.icons).toBeDefined();
        expect(typeof category.name).toBe("string");
        expect(typeof category.description).toBe("string");
        expect(typeof category.icons).toBe("object");
      });
    });
  });

  describe("Icon Structure Consistency", () => {
    it("should have consistent icon structure across all categories", () => {
      Object.values(allIcons).forEach((icon) => {
        expect(icon.svg).toBeDefined();
        expect(icon.metadata).toBeDefined();
        expect(icon.metadata.name).toBeDefined();
        expect(icon.metadata.description).toBeDefined();
        expect(typeof icon.svg).toBe("string");
        expect(typeof icon.metadata.name).toBe("string");
        expect(typeof icon.metadata.description).toBe("string");
      });
    });

    it("should have proper metadata arrays", () => {
      Object.values(allIcons).forEach((icon) => {
        if (icon.metadata.tags) {
          expect(Array.isArray(icon.metadata.tags)).toBe(true);
        }
        if (icon.metadata.keywords) {
          expect(Array.isArray(icon.metadata.keywords)).toBe(true);
        }
      });
    });
  });
});
