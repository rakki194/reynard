import { describe, it, expect } from "vitest";
import { validatePassword } from "../../utils";
import { DEFAULT_VALIDATION_RULES } from "../../types";

describe("Password Validation - Special Characters", () => {
  const specialCharRules = {
    ...DEFAULT_VALIDATION_RULES,
    requireSpecialChar: true,
    minLength: 1, // Set to 1 to focus on special character testing
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
  };

  describe("All special characters should be accepted", () => {
    // Test each special character individually
    const specialCharacters = [
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "_",
      "+",
      "-",
      "=",
      "[",
      "]",
      "{",
      "}",
      ";",
      "'",
      ":",
      '"',
      "\\",
      "|",
      ",",
      ".",
      "<",
      ">",
      "/",
      "?",
    ];

    specialCharacters.forEach((char) => {
      it(`should accept password with special character: ${char}`, () => {
        const result = validatePassword(char, specialCharRules);
        expect(result.isValid).toBe(true);
        expect(result.score).toBeGreaterThan(0);
        expect(result.suggestions).toHaveLength(0);
      });
    });
  });

  describe("Combinations of special characters", () => {
    it("should accept password with multiple special characters", () => {
      const password = "!@#$%^&*()";
      const result = validatePassword(password, specialCharRules);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should accept password with special characters and letters", () => {
      const password = "Test@123!";
      const result = validatePassword(password, {
        ...DEFAULT_VALIDATION_RULES,
        requireSpecialChar: true,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        minLength: 8,
      });
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should accept password with complex special character combinations", () => {
      const password = "P@ssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?";
      const result = validatePassword(password, {
        ...DEFAULT_VALIDATION_RULES,
        requireSpecialChar: true,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        minLength: 8,
      });
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe("Edge cases with special characters", () => {
    it("should handle password with only special characters", () => {
      const password = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const result = validatePassword(password, specialCharRules);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should handle password with escaped special characters in regex", () => {
      // These characters need escaping in regex but should work in passwords
      const password = "\\^$.*+?()[]{}|";
      const result = validatePassword(password, specialCharRules);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should handle password with mixed special characters and spaces", () => {
      const password = "! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : , . < > ?";
      const result = validatePassword(password, specialCharRules);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe("Special character validation with different rule combinations", () => {
    it("should work with only special character requirement", () => {
      const password = "!";
      const result = validatePassword(password, {
        minLength: 1,
        requireSpecialChar: true,
        requireUppercase: false,
        requireLowercase: false,
        requireNumber: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(1);
    });

    it("should work with special character and length requirements", () => {
      const password = "!@#";
      const result = validatePassword(password, {
        minLength: 3,
        requireSpecialChar: true,
        requireUppercase: false,
        requireLowercase: false,
        requireNumber: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(1);
    });

    it("should work with all requirements enabled", () => {
      const password = "Test@123!";
      const result = validatePassword(password, {
        minLength: 8,
        requireSpecialChar: true,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
      });
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(5);
      expect(result.feedback).toBe("very-strong");
    });
  });

  describe("Special character validation failure cases", () => {
    it("should fail when special character is required but not present", () => {
      const password = "Test123";
      const result = validatePassword(password, {
        ...DEFAULT_VALIDATION_RULES,
        requireSpecialChar: true,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        minLength: 8,
      });
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toContain(
        "Password must contain at least one special character",
      );
    });

    it("should fail when only special character requirement is enabled but not met", () => {
      const password = "abc";
      const result = validatePassword(password, {
        minLength: 1,
        requireSpecialChar: true,
        requireUppercase: false,
        requireLowercase: false,
        requireNumber: false,
      });
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toContain(
        "Password must contain at least one special character",
      );
    });
  });
});
