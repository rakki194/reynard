/**
 * Tests for the Reynard Validation package
 */

import { describe, expect, it } from "vitest";
import {
  CommonSchemas,
  FormSchemas,
  ValidationUtils,
  validateApiKey,
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validateToken,
  validateUrl,
  validateUrlSecurity,
  validateUsername,
} from "../index.js";

describe("Basic Validators", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("user@example.com").isValid).toBe(true);
      expect(validateEmail("test.email+tag@domain.co.uk").isValid).toBe(true);
      expect(validateEmail("user123@subdomain.example.org").isValid).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid").isValid).toBe(false);
      expect(validateEmail("@example.com").isValid).toBe(false);
      expect(validateEmail("user@").isValid).toBe(false);
      expect(validateEmail("user@.com").isValid).toBe(false);
      expect(validateEmail("").isValid).toBe(false);
    });

    it("should include field name in error messages", () => {
      const result = validateEmail("invalid", "emailAddress");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("emailAddress");
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      expect(validatePassword("SecurePass123!").isValid).toBe(true);
      expect(validatePassword("MyStr0ng#Pass").isValid).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(validatePassword("weak").isValid).toBe(false);
      expect(validatePassword("12345678").isValid).toBe(false);
      expect(validatePassword("password").isValid).toBe(false);
      expect(validatePassword("").isValid).toBe(false);
    });

    it("should provide helpful error messages", () => {
      const result = validatePassword("weak");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("8-128 characters");
    });
  });

  describe("validateUsername", () => {
    it("should validate correct usernames", () => {
      expect(validateUsername("john_doe").isValid).toBe(true);
      expect(validateUsername("user123").isValid).toBe(true);
      expect(validateUsername("test-user").isValid).toBe(true);
    });

    it("should reject invalid usernames", () => {
      expect(validateUsername("ab").isValid).toBe(false); // too short
      expect(validateUsername("a".repeat(31)).isValid).toBe(false); // too long
      expect(validateUsername("user@domain").isValid).toBe(false); // invalid chars
      expect(validateUsername("").isValid).toBe(false);
    });
  });

  describe("validateUrl", () => {
    it("should validate correct URLs", () => {
      expect(validateUrl("https://example.com").isValid).toBe(true);
      expect(validateUrl("http://subdomain.example.org/path").isValid).toBe(true);
      expect(validateUrl("https://api.example.com/v1/endpoint?param=value").isValid).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(validateUrl("invalid").isValid).toBe(false);
      expect(validateUrl("ftp://example.com").isValid).toBe(false);
      expect(validateUrl("").isValid).toBe(false);
    });
  });

  describe("validateApiKey", () => {
    it("should validate correct API keys", () => {
      expect(validateApiKey("sk-1234567890abcdef").isValid).toBe(true);
      expect(validateApiKey("api_key_123").isValid).toBe(true);
    });

    it("should reject invalid API keys", () => {
      expect(validateApiKey("short").isValid).toBe(false); // too short
      expect(validateApiKey("key with spaces").isValid).toBe(false); // spaces
      expect(validateApiKey("").isValid).toBe(false);
    });
  });

  describe("validateToken", () => {
    it("should validate correct tokens", () => {
      expect(validateToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9").isValid).toBe(true);
      expect(validateToken("a".repeat(50)).isValid).toBe(true);
    });

    it("should reject invalid tokens", () => {
      expect(validateToken("short").isValid).toBe(false); // too short
      expect(validateToken("a".repeat(600)).isValid).toBe(false); // too long
      expect(validateToken("").isValid).toBe(false);
    });
  });
});

describe("Advanced Validators", () => {
  describe("validatePasswordStrength", () => {
    it("should analyze password strength correctly", () => {
      const weakResult = validatePasswordStrength("password");
      expect(weakResult.isValid).toBe(false);
      expect(weakResult.feedback).toBe("weak");
      expect(weakResult.suggestions.length).toBeGreaterThan(0);

      const strongResult = validatePasswordStrength("SecurePass123!");
      expect(strongResult.isValid).toBe(true);
      expect(strongResult.feedback).toBe("strong");
      expect(strongResult.suggestions.length).toBe(0);
    });

    it("should respect custom validation rules", () => {
      const customRules = {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecialChar: false,
      };

      const result = validatePasswordStrength("ShortPass1", customRules);
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toContain("Password must be at least 12 characters long");
    });
  });

  describe("validateUrlSecurity", () => {
    it("should validate secure URLs", () => {
      const result = validateUrlSecurity("https://example.com");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("https://example.com/");
    });

    it("should reject insecure URLs", () => {
      expect(validateUrlSecurity("javascript:alert('xss')").isValid).toBe(false);
      expect(validateUrlSecurity("ftp://example.com").isValid).toBe(false);
      expect(validateUrlSecurity("http://localhost:3000").isValid).toBe(false);
      expect(validateUrlSecurity("http://192.168.1.1").isValid).toBe(false);
    });
  });
});

describe("ValidationUtils", () => {
  describe("validateValue", () => {
    it("should validate against custom schemas", () => {
      const customSchema = {
        type: "string" as const,
        required: true,
        minLength: 5,
        maxLength: 10,
        pattern: /^[a-zA-Z]+$/,
        errorMessage: "Must be 5-10 letters only",
      };

      expect(ValidationUtils.validateValue("hello", customSchema).isValid).toBe(true);
      expect(ValidationUtils.validateValue("hi", customSchema).isValid).toBe(false);
      expect(ValidationUtils.validateValue("hello123", customSchema).isValid).toBe(false);
    });

    it("should handle required field validation", () => {
      const schema = { type: "string" as const, required: true };

      expect(ValidationUtils.validateValue("", schema).isValid).toBe(false);
      expect(ValidationUtils.validateValue("value", schema).isValid).toBe(true);
      expect(ValidationUtils.validateValue(null, schema).isValid).toBe(false);
    });

    it("should handle optional field validation", () => {
      const schema = { type: "string" as const, required: false };

      expect(ValidationUtils.validateValue("", schema).isValid).toBe(true);
      expect(ValidationUtils.validateValue("value", schema).isValid).toBe(true);
      expect(ValidationUtils.validateValue(null, schema).isValid).toBe(true);
    });
  });

  describe("validateMultiple", () => {
    it("should validate multiple fields", () => {
      const data = {
        email: "user@example.com",
        username: "john_doe",
        password: "SecurePass123!",
      };

      const result = ValidationUtils.validateMultiple(data, FormSchemas.registration);

      expect(result.isValid).toBe(true);
      expect(result.validFields).toEqual(["email", "username", "password"]);
      expect(result.invalidFields).toEqual([]);
    });

    it("should handle validation errors", () => {
      const data = {
        email: "invalid",
        username: "ab", // too short
        password: "weak",
      };

      const result = ValidationUtils.validateMultiple(data, FormSchemas.registration);

      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toEqual(["email", "username", "password"]);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.username).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });
});

describe("CommonSchemas", () => {
  it("should have all expected schemas", () => {
    expect(CommonSchemas.email).toBeDefined();
    expect(CommonSchemas.password).toBeDefined();
    expect(CommonSchemas.username).toBeDefined();
    expect(CommonSchemas.url).toBeDefined();
    expect(CommonSchemas.apiKey).toBeDefined();
    expect(CommonSchemas.token).toBeDefined();
    expect(CommonSchemas.filename).toBeDefined();
    expect(CommonSchemas.mimeType).toBeDefined();
    expect(CommonSchemas.port).toBeDefined();
    expect(CommonSchemas.timeout).toBeDefined();
    expect(CommonSchemas.modelName).toBeDefined();
    expect(CommonSchemas.prompt).toBeDefined();
    expect(CommonSchemas.temperature).toBeDefined();
    expect(CommonSchemas.maxTokens).toBeDefined();
    expect(CommonSchemas.theme).toBeDefined();
    expect(CommonSchemas.language).toBeDefined();
    expect(CommonSchemas.color).toBeDefined();
  });
});

describe("FormSchemas", () => {
  it("should have all expected form schemas", () => {
    expect(FormSchemas.login).toBeDefined();
    expect(FormSchemas.registration).toBeDefined();
    expect(FormSchemas.profile).toBeDefined();
    expect(FormSchemas.settings).toBeDefined();
    expect(FormSchemas.api).toBeDefined();
    expect(FormSchemas.file).toBeDefined();
    expect(FormSchemas.network).toBeDefined();
  });

  it("should have correct field definitions", () => {
    expect(FormSchemas.login.email).toBeDefined();
    expect(FormSchemas.login.password).toBeDefined();

    expect(FormSchemas.registration.email).toBeDefined();
    expect(FormSchemas.registration.username).toBeDefined();
    expect(FormSchemas.registration.password).toBeDefined();
  });
});
