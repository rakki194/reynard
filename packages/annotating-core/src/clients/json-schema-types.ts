/**
 * JSON Schema Types for Caption Generation Configuration
 *
 * Defines the structure for JSON schema validation used by caption generators.
 * These types ensure type safety when validating generator configuration options.
 */

export interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  minimum?: number;
  maximum?: number;
  default?: string | number | boolean;
  description?: string;
  enum?: string[];
}

export interface JsonSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
}
