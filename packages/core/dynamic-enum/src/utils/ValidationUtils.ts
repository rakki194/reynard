/**
 * Validation utilities for the Dynamic Enum System
 */

import type { EnumData, EnumValue, ValidationResult } from "../types/EnumTypes";

/**
 * Validation utilities for enum data and values
 */
export class ValidationUtils {
  /**
   * Validate enum data structure
   */
  static validateEnumData(data: any): ValidationResult {
    if (!data || typeof data !== "object") {
      return {
        isValid: false,
        value: null,
        error: "Enum data must be an object",
      };
    }

    if (Array.isArray(data)) {
      return {
        isValid: false,
        value: null,
        error: "Enum data must be an object, not an array",
      };
    }

    // Check if it has at least one valid enum value
    let hasValidValue = false;
    for (const [key, value] of Object.entries(data)) {
      const validation = this.validateEnumValue(value);
      if (validation.isValid) {
        hasValidValue = true;
      } else {
        return {
          isValid: false,
          value: null,
          error: `Invalid enum value for key '${key}': ${validation.error}`,
        };
      }
    }

    if (!hasValidValue) {
      return {
        isValid: false,
        value: null,
        error: "Enum data must contain at least one valid enum value",
      };
    }

    return {
      isValid: true,
      value: "valid",
      error: null,
    };
  }

  /**
   * Validate enum value structure
   */
  static validateEnumValue(value: any): ValidationResult {
    if (!value || typeof value !== "object") {
      return {
        isValid: false,
        value: null,
        error: "Enum value must be an object",
      };
    }

    if (typeof value.value !== "string") {
      return {
        isValid: false,
        value: null,
        error: "Enum value must have a string value property",
      };
    }

    if (value.value.trim() === "") {
      return {
        isValid: false,
        value: null,
        error: "Enum value cannot be empty",
      };
    }

    // Validate weight if present
    if (value.weight !== undefined) {
      if (typeof value.weight !== "number" || value.weight < 0) {
        return {
          isValid: false,
          value: null,
          error: "Enum value weight must be a non-negative number",
        };
      }
    }

    // Validate metadata if present
    if (value.metadata !== undefined) {
      const metadataValidation = this.validateMetadata(value.metadata);
      if (!metadataValidation.isValid) {
        return {
          isValid: false,
          value: null,
          error: `Invalid metadata: ${metadataValidation.error}`,
        };
      }
    }

    return {
      isValid: true,
      value: value.value,
      error: null,
    };
  }

  /**
   * Validate metadata structure
   */
  static validateMetadata(metadata: any): ValidationResult {
    if (metadata === null || metadata === undefined) {
      return {
        isValid: true,
        value: null,
        error: null,
      };
    }

    if (typeof metadata !== "object") {
      return {
        isValid: false,
        value: null,
        error: "Metadata must be an object",
      };
    }

    // Validate emoji if present
    if (metadata.emoji !== undefined) {
      if (typeof metadata.emoji !== "string") {
        return {
          isValid: false,
          value: null,
          error: "Metadata emoji must be a string",
        };
      }
    }

    // Validate description if present
    if (metadata.description !== undefined) {
      if (typeof metadata.description !== "string") {
        return {
          isValid: false,
          value: null,
          error: "Metadata description must be a string",
        };
      }
    }

    // Validate category if present
    if (metadata.category !== undefined) {
      if (typeof metadata.category !== "string") {
        return {
          isValid: false,
          value: null,
          error: "Metadata category must be a string",
        };
      }
    }

    // Validate tags if present
    if (metadata.tags !== undefined) {
      if (!Array.isArray(metadata.tags)) {
        return {
          isValid: false,
          value: null,
          error: "Metadata tags must be an array",
        };
      }

      for (const tag of metadata.tags) {
        if (typeof tag !== "string") {
          return {
            isValid: false,
            value: null,
            error: "All metadata tags must be strings",
          };
        }
      }
    }

    return {
      isValid: true,
      value: "valid",
      error: null,
    };
  }

  /**
   * Validate enum key
   */
  static validateEnumKey(key: any): ValidationResult {
    if (typeof key !== "string") {
      return {
        isValid: false,
        value: null,
        error: "Enum key must be a non-empty string",
      };
    }

    if (key.trim() === "") {
      return {
        isValid: false,
        value: null,
        error: "Enum key cannot be empty",
      };
    }

    // Check for valid key characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      return {
        isValid: false,
        value: null,
        error: "Enum key can only contain alphanumeric characters, underscores, and hyphens",
      };
    }

    return {
      isValid: true,
      value: key,
      error: null,
    };
  }

  /**
   * Validate enum type name
   */
  static validateEnumType(enumType: any): ValidationResult {
    if (typeof enumType !== "string") {
      return {
        isValid: false,
        value: null,
        error: "Enum type must be a non-empty string",
      };
    }

    if (enumType.trim() === "") {
      return {
        isValid: false,
        value: null,
        error: "Enum type cannot be empty",
      };
    }

    // Check for valid enum type characters
    if (!/^[a-zA-Z0-9_-]+$/.test(enumType)) {
      return {
        isValid: false,
        value: null,
        error: "Enum type can only contain alphanumeric characters, underscores, and hyphens",
      };
    }

    return {
      isValid: true,
      value: enumType,
      error: null,
    };
  }

  /**
   * Sanitize enum value
   */
  static sanitizeEnumValue(value: string): string {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim();
  }

  /**
   * Sanitize enum key
   */
  static sanitizeEnumKey(key: string): string {
    if (typeof key !== "string") {
      return "";
    }

    return key.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  /**
   * Sanitize enum type
   */
  static sanitizeEnumType(enumType: string): string {
    if (typeof enumType !== "string") {
      return "";
    }

    return enumType.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  /**
   * Check if two enum values are equal
   */
  static areEnumValuesEqual(value1: EnumValue, value2: EnumValue): boolean {
    if (!value1 || !value2) {
      return false;
    }

    return value1.value === value2.value;
  }

  /**
   * Check if enum data contains a value
   */
  static enumDataContainsValue(data: EnumData, value: string): boolean {
    if (!data || typeof value !== "string") {
      return false;
    }

    return Object.values(data).some(enumValue => enumValue.value === value);
  }

  /**
   * Get duplicate values in enum data
   */
  static getDuplicateValues(data: EnumData): string[] {
    if (!data) {
      return [];
    }

    const values = Object.values(data).map(v => v.value);
    const duplicates = new Set<string>();
    const seen = new Set<string>();

    for (const value of values) {
      if (seen.has(value)) {
        duplicates.add(value);
      } else {
        seen.add(value);
      }
    }

    return Array.from(duplicates);
  }

  /**
   * Get duplicate keys in enum data
   */
  static getDuplicateKeys(data: EnumData): string[] {
    if (!data) {
      return [];
    }

    const keys = Object.keys(data);
    const duplicates = new Set<string>();
    const seen = new Set<string>();

    for (const key of keys) {
      if (seen.has(key)) {
        duplicates.add(key);
      } else {
        seen.add(key);
      }
    }

    return Array.from(duplicates);
  }

  /**
   * Validate enum data for duplicates
   */
  static validateNoDuplicates(data: EnumData): ValidationResult {
    const duplicateValues = this.getDuplicateValues(data);
    const duplicateKeys = this.getDuplicateKeys(data);

    if (duplicateValues.length > 0) {
      return {
        isValid: false,
        value: null,
        error: `Duplicate values found: ${duplicateValues.join(", ")}`,
      };
    }

    if (duplicateKeys.length > 0) {
      return {
        isValid: false,
        value: null,
        error: `Duplicate keys found: ${duplicateKeys.join(", ")}`,
      };
    }

    return {
      isValid: true,
      value: "valid",
      error: null,
    };
  }
}
