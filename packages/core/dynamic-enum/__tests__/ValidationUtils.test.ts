/**
 * Tests for the ValidationUtils
 */

import { describe, it, expect } from "vitest";
import { ValidationUtils } from "../src/utils/ValidationUtils";
import type { EnumData, EnumValue } from "../src/types";

describe("ValidationUtils", () => {
  describe("validateEnumData", () => {
    it("should validate valid enum data", () => {
      const validData: EnumData = {
        fox: {
          value: "fox",
          weight: 0.4,
          metadata: { emoji: "🦊" },
        },
      };

      const result = ValidationUtils.validateEnumData(validData);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe("valid");
    });

    it("should reject non-object data", () => {
      const result = ValidationUtils.validateEnumData("invalid");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be an object");
    });

    it("should reject array data", () => {
      const result = ValidationUtils.validateEnumData(["fox", "wolf"]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be an object, not an array");
    });

    it("should reject empty object", () => {
      const result = ValidationUtils.validateEnumData({});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("at least one valid enum value");
    });

    it("should reject data with invalid enum values", () => {
      const invalidData = {
        fox: "invalid", // Should be an object
      };

      const result = ValidationUtils.validateEnumData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid enum value for key");
    });
  });

  describe("validateEnumValue", () => {
    it("should validate valid enum value", () => {
      const validValue: EnumValue = {
        value: "fox",
        weight: 0.4,
        metadata: { emoji: "🦊" },
      };

      const result = ValidationUtils.validateEnumValue(validValue);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe("fox");
    });

    it("should reject non-object value", () => {
      const result = ValidationUtils.validateEnumValue("invalid");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be an object");
    });

    it("should reject value without value property", () => {
      const result = ValidationUtils.validateEnumValue({ weight: 0.4 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("string value property");
    });

    it("should reject empty value", () => {
      const result = ValidationUtils.validateEnumValue({ value: "" });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject negative weight", () => {
      const result = ValidationUtils.validateEnumValue({
        value: "fox",
        weight: -1,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("non-negative number");
    });

    it("should reject invalid metadata", () => {
      const result = ValidationUtils.validateEnumValue({
        value: "fox",
        metadata: "invalid",
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid metadata");
    });
  });

  describe("validateMetadata", () => {
    it("should validate valid metadata", () => {
      const validMetadata = {
        emoji: "🦊",
        description: "Strategic and cunning",
        category: "canine",
        tags: ["strategic", "cunning"],
      };

      const result = ValidationUtils.validateMetadata(validMetadata);
      expect(result.isValid).toBe(true);
    });

    it("should accept null metadata", () => {
      const result = ValidationUtils.validateMetadata(null);
      expect(result.isValid).toBe(true);
    });

    it("should accept undefined metadata", () => {
      const result = ValidationUtils.validateMetadata(undefined);
      expect(result.isValid).toBe(true);
    });

    it("should reject non-object metadata", () => {
      const result = ValidationUtils.validateMetadata("invalid");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be an object");
    });

    it("should reject non-string emoji", () => {
      const result = ValidationUtils.validateMetadata({ emoji: 123 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("emoji must be a string");
    });

    it("should reject non-string description", () => {
      const result = ValidationUtils.validateMetadata({ description: 123 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("description must be a string");
    });

    it("should reject non-string category", () => {
      const result = ValidationUtils.validateMetadata({ category: 123 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("category must be a string");
    });

    it("should reject non-array tags", () => {
      const result = ValidationUtils.validateMetadata({ tags: "invalid" });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("tags must be an array");
    });

    it("should reject non-string tags", () => {
      const result = ValidationUtils.validateMetadata({ tags: [123, "valid"] });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("All metadata tags must be strings");
    });
  });

  describe("validateEnumKey", () => {
    it("should validate valid enum key", () => {
      const result = ValidationUtils.validateEnumKey("fox");
      expect(result.isValid).toBe(true);
      expect(result.value).toBe("fox");
    });

    it("should validate key with underscore", () => {
      const result = ValidationUtils.validateEnumKey("fox_spirit");
      expect(result.isValid).toBe(true);
    });

    it("should validate key with hyphen", () => {
      const result = ValidationUtils.validateEnumKey("fox-spirit");
      expect(result.isValid).toBe(true);
    });

    it("should reject non-string key", () => {
      const result = ValidationUtils.validateEnumKey(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be a non-empty string");
    });

    it("should reject empty key", () => {
      const result = ValidationUtils.validateEnumKey("");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject key with invalid characters", () => {
      const result = ValidationUtils.validateEnumKey("fox@spirit");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("alphanumeric characters");
    });
  });

  describe("validateEnumType", () => {
    it("should validate valid enum type", () => {
      const result = ValidationUtils.validateEnumType("spirits");
      expect(result.isValid).toBe(true);
      expect(result.value).toBe("spirits");
    });

    it("should reject non-string enum type", () => {
      const result = ValidationUtils.validateEnumType(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be a non-empty string");
    });

    it("should reject empty enum type", () => {
      const result = ValidationUtils.validateEnumType("");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });

    it("should reject enum type with invalid characters", () => {
      const result = ValidationUtils.validateEnumType("spirits@type");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("alphanumeric characters");
    });
  });

  describe("Sanitization", () => {
    it("should sanitize enum value", () => {
      const result = ValidationUtils.sanitizeEnumValue("  fox  ");
      expect(result).toBe("fox");
    });

    it("should sanitize enum key", () => {
      const result = ValidationUtils.sanitizeEnumKey("fox@spirit!");
      expect(result).toBe("fox_spirit_");
    });

    it("should sanitize enum type", () => {
      const result = ValidationUtils.sanitizeEnumType("spirits@type!");
      expect(result).toBe("spirits_type_");
    });

    it("should handle non-string inputs", () => {
      expect(ValidationUtils.sanitizeEnumValue(123)).toBe("");
      expect(ValidationUtils.sanitizeEnumKey(123)).toBe("");
      expect(ValidationUtils.sanitizeEnumType(123)).toBe("");
    });
  });

  describe("Comparison and Analysis", () => {
    it("should compare enum values", () => {
      const value1: EnumValue = { value: "fox", weight: 0.4 };
      const value2: EnumValue = { value: "fox", weight: 0.5 };
      const value3: EnumValue = { value: "wolf", weight: 0.4 };

      expect(ValidationUtils.areEnumValuesEqual(value1, value2)).toBe(true);
      expect(ValidationUtils.areEnumValuesEqual(value1, value3)).toBe(false);
    });

    it("should check if enum data contains value", () => {
      const data: EnumData = {
        fox: { value: "fox", weight: 0.4 },
        wolf: { value: "wolf", weight: 0.25 },
      };

      expect(ValidationUtils.enumDataContainsValue(data, "fox")).toBe(true);
      expect(ValidationUtils.enumDataContainsValue(data, "otter")).toBe(false);
    });

    it("should find duplicate values", () => {
      const data: EnumData = {
        fox1: { value: "fox", weight: 0.4 },
        fox2: { value: "fox", weight: 0.5 },
        wolf: { value: "wolf", weight: 0.25 },
      };

      const duplicates = ValidationUtils.getDuplicateValues(data);
      expect(duplicates).toContain("fox");
      expect(duplicates).not.toContain("wolf");
    });

    it("should find duplicate keys", () => {
      const data: EnumData = {
        fox: { value: "fox", weight: 0.4 },
        wolf: { value: "wolf", weight: 0.25 },
      };

      // This is a bit contrived since objects can't have duplicate keys
      // But the function should handle it gracefully
      const duplicates = ValidationUtils.getDuplicateKeys(data);
      expect(duplicates).toHaveLength(0);
    });

    it("should validate no duplicates", () => {
      const data: EnumData = {
        fox: { value: "fox", weight: 0.4 },
        wolf: { value: "wolf", weight: 0.25 },
      };

      const result = ValidationUtils.validateNoDuplicates(data);
      expect(result.isValid).toBe(true);
    });

    it("should detect duplicate values", () => {
      const data: EnumData = {
        fox1: { value: "fox", weight: 0.4 },
        fox2: { value: "fox", weight: 0.5 },
      };

      const result = ValidationUtils.validateNoDuplicates(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Duplicate values found");
    });
  });
});
