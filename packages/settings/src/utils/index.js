/**
 * Settings Utilities
 * Helper functions for validation, migration, and settings management
 */
/**
 * Validate a single setting value
 */
export function validateSetting(definition, value) {
  const { validation, type, required } = definition;
  // Check if required
  if (required && (value === null || value === undefined || value === "")) {
    return {
      isValid: false,
      error: validation?.errorMessage || `${definition.label} is required`,
    };
  }
  // Skip validation if value is empty and not required
  if (!required && (value === null || value === undefined || value === "")) {
    return { isValid: true };
  }
  // Type-specific validation
  switch (type) {
    case "boolean":
      if (typeof value !== "boolean") {
        return {
          isValid: false,
          error: `${definition.label} must be a boolean`,
        };
      }
      break;
    case "string":
      if (typeof value !== "string") {
        return {
          isValid: false,
          error: `${definition.label} must be a string`,
        };
      }
      if (validation?.minLength && value.length < validation.minLength) {
        return {
          isValid: false,
          error: `${definition.label} must be at least ${validation.minLength} characters`,
        };
      }
      if (validation?.maxLength && value.length > validation.maxLength) {
        return {
          isValid: false,
          error: `${definition.label} must be no more than ${validation.maxLength} characters`,
        };
      }
      if (validation?.pattern && !validation.pattern.test(value)) {
        return {
          isValid: false,
          error:
            validation.errorMessage || `${definition.label} format is invalid`,
        };
      }
      break;
    case "number":
    case "range":
      if (typeof value !== "number" || isNaN(value)) {
        return {
          isValid: false,
          error: `${definition.label} must be a valid number`,
        };
      }
      if (validation?.min !== undefined && value < validation.min) {
        return {
          isValid: false,
          error: `${definition.label} must be at least ${validation.min}`,
        };
      }
      if (validation?.max !== undefined && value > validation.max) {
        return {
          isValid: false,
          error: `${definition.label} must be no more than ${validation.max}`,
        };
      }
      if (validation?.step && value % validation.step !== 0) {
        return {
          isValid: false,
          error: `${definition.label} must be a multiple of ${validation.step}`,
        };
      }
      break;
    case "select":
      if (!definition.options?.some((option) => option.value === value)) {
        return {
          isValid: false,
          error: `${definition.label} must be one of the available options`,
        };
      }
      break;
    case "multiselect":
      if (!Array.isArray(value)) {
        return {
          isValid: false,
          error: `${definition.label} must be an array`,
        };
      }
      const validOptions =
        definition.options?.map((option) => option.value) || [];
      const invalidValues = value.filter((v) => !validOptions.includes(v));
      if (invalidValues.length > 0) {
        return {
          isValid: false,
          error: `${definition.label} contains invalid options: ${invalidValues.join(", ")}`,
        };
      }
      break;
    case "color":
      if (typeof value !== "string") {
        return {
          isValid: false,
          error: `${definition.label} must be a string`,
        };
      }
      // Basic color validation (hex, rgb, hsl)
      const colorRegex =
        /^(#[0-9A-F]{6}|#[0-9A-F]{3}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\))$/i;
      if (!colorRegex.test(value)) {
        return {
          isValid: false,
          error: `${definition.label} must be a valid color (hex, rgb, or hsl)`,
        };
      }
      break;
    case "date":
    case "time":
    case "datetime":
      // Allow both string and Date objects
      let dateValue;
      if (value instanceof Date) {
        dateValue = value;
      } else if (typeof value === "string") {
        dateValue = new Date(value);
      } else {
        return {
          isValid: false,
          error: `${definition.label} must be a valid date`,
        };
      }
      if (isNaN(dateValue.getTime())) {
        return {
          isValid: false,
          error: `${definition.label} must be a valid date`,
        };
      }
      break;
    case "json":
      if (typeof value !== "object" || value === null) {
        return {
          isValid: false,
          error: `${definition.label} must be a valid object`,
        };
      }
      // Try to serialize to ensure it's valid JSON
      try {
        JSON.stringify(value);
      } catch {
        return {
          isValid: false,
          error: `${definition.label} must be valid JSON`,
        };
      }
      break;
    case "file":
    case "folder":
      if (typeof value !== "string") {
        return {
          isValid: false,
          error: `${definition.label} must be a valid path`,
        };
      }
      break;
  }
  // Custom validation function
  if (validation?.validator) {
    const customResult = validation.validator(value);
    if (customResult === false) {
      return {
        isValid: false,
        error: validation.errorMessage || `${definition.label} is invalid`,
      };
    }
    if (typeof customResult === "string") {
      return {
        isValid: false,
        error: customResult,
      };
    }
  }
  return { isValid: true };
}
/**
 * Validate all settings against their definitions
 */
export function validateAllSettings(definitions, values) {
  const errors = {};
  for (const [key, definition] of Object.entries(definitions)) {
    const value = values[key];
    const result = validateSetting(definition, value);
    if (!result.isValid && result.error) {
      errors[key] = result.error;
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
/**
 * Evaluate a setting condition
 */
export function evaluateCondition(condition, values) {
  const { key, value: expectedValue, operator = "equals", and, or } = condition;
  // Handle compound conditions
  if (and) {
    return and.every((cond) => evaluateCondition(cond, values));
  }
  if (or) {
    return or.some((cond) => evaluateCondition(cond, values));
  }
  // Get the actual value
  const actualValue = values[key];
  // Evaluate based on operator
  switch (operator) {
    case "equals":
      return actualValue === expectedValue;
    case "not-equals":
      return actualValue !== expectedValue;
    case "greater":
      return (
        typeof actualValue === "number" &&
        typeof expectedValue === "number" &&
        actualValue > expectedValue
      );
    case "less":
      return (
        typeof actualValue === "number" &&
        typeof expectedValue === "number" &&
        actualValue < expectedValue
      );
    case "contains":
      if (
        typeof actualValue === "string" &&
        typeof expectedValue === "string"
      ) {
        return actualValue.includes(expectedValue);
      }
      if (Array.isArray(actualValue)) {
        return actualValue.includes(expectedValue);
      }
      return false;
    case "exists":
      return actualValue !== null && actualValue !== undefined;
    default:
      return false;
  }
}
/**
 * Check if a setting should be visible based on its conditions
 */
export function isSettingVisible(definition, values) {
  if (!definition.condition) return true;
  return evaluateCondition(definition.condition, values);
}
/**
 * Filter settings based on visibility conditions
 */
export function getVisibleSettings(definitions, values) {
  const visible = {};
  for (const [key, definition] of Object.entries(definitions)) {
    if (isSettingVisible(definition, values)) {
      visible[key] = definition;
    }
  }
  return visible;
}
/**
 * Migrate a setting value from an old version
 */
export function migrateSettingValue(definition, oldValue, oldVersion) {
  if (definition.migrate) {
    try {
      return definition.migrate(oldValue, oldVersion);
    } catch (error) {
      console.warn(`Migration failed for setting ${definition.key}:`, error);
      return definition.defaultValue;
    }
  }
  return oldValue;
}
/**
 * Serialize a setting value for storage
 */
export function serializeSettingValue(definition, value) {
  if (definition.serialize) {
    return definition.serialize(value);
  }
  // Default JSON serialization
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error(`Failed to serialize setting ${definition.key}:`, error);
    return JSON.stringify(definition.defaultValue);
  }
}
/**
 * Deserialize a setting value from storage
 */
export function deserializeSettingValue(definition, serializedValue) {
  if (definition.deserialize) {
    try {
      return definition.deserialize(serializedValue);
    } catch (error) {
      console.warn(
        `Custom deserialization failed for ${definition.key}:`,
        error,
      );
      return definition.defaultValue;
    }
  }
  // Default JSON deserialization
  try {
    return JSON.parse(serializedValue);
  } catch (error) {
    console.warn(`Failed to deserialize setting ${definition.key}:`, error);
    return definition.defaultValue;
  }
}
/**
 * Get setting dependencies
 */
export function getSettingDependencies(key, definitions) {
  const definition = definitions[key];
  if (!definition?.dependencies) return [];
  return definition.dependencies.filter((dep) => dep in definitions);
}
/**
 * Resolve setting dependencies in correct order
 */
export function resolveDependencyOrder(definitions) {
  const resolved = [];
  const visiting = new Set();
  const visited = new Set();
  function visit(key) {
    if (visited.has(key)) return;
    if (visiting.has(key)) {
      throw new Error(`Circular dependency detected: ${key}`);
    }
    visiting.add(key);
    const dependencies = getSettingDependencies(key, definitions);
    for (const dep of dependencies) {
      visit(dep);
    }
    visiting.delete(key);
    visited.add(key);
    resolved.push(key);
  }
  for (const key of Object.keys(definitions)) {
    visit(key);
  }
  return resolved;
}
/**
 * Create a settings schema builder
 */
export class SettingsSchemaBuilder {
  constructor(version = "1.0.0") {
    Object.defineProperty(this, "schema", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0,
    });
    this.schema = {
      version,
      settings: {},
      groups: {},
    };
  }
  /**
   * Add a setting definition
   */
  addSetting(definition) {
    this.schema.settings[definition.key] = definition;
    return this;
  }
  /**
   * Add multiple setting definitions
   */
  addSettings(definitions) {
    for (const definition of definitions) {
      this.addSetting(definition);
    }
    return this;
  }
  /**
   * Add a setting group
   */
  addGroup(group) {
    this.schema.groups[group.id] = {
      ...group,
      category: "general", // Default category
    };
    return this;
  }
  /**
   * Set schema metadata
   */
  setMetadata(metadata) {
    this.schema.metadata = metadata;
    return this;
  }
  /**
   * Build the final schema
   */
  build() {
    // Validate schema
    const settingKeys = Object.keys(this.schema.settings);
    for (const group of Object.values(this.schema.groups)) {
      for (const settingKey of group.settings) {
        if (!settingKeys.includes(settingKey)) {
          console.warn(
            `Group ${group.id} references unknown setting: ${settingKey}`,
          );
        }
      }
    }
    return { ...this.schema };
  }
}
/**
 * Deep clone an object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
/**
 * Check if code is running in browser environment
 */
export function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}
/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
