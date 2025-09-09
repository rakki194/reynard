/**
 * Security Integration Tests
 * End-to-end tests for security features working together
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sanitizeHTML as sanitizeInput,
  validateInput,
  generateCryptoCSRFToken as generateCSRFToken,
  validateCryptoCSRFToken as validateCSRFToken,
  applySecurityHeaders,
  getSecurityHeaders,
  createSecureFetch,
  generateSecurePassword,
  hashString,
  constantTimeCompare,
} from "./index";

// Mock implementations for integration testing
const mockFetch = vi.fn();
const mockCrypto = {
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: vi.fn(async (algorithm: string, data: Uint8Array) => {
      const hash = new Uint8Array(32);
      for (let i = 0; i < hash.length; i++) {
        hash[i] = (data[i % data.length] + i) % 256;
      }
      return hash;
    }),
  },
};

describe("Security Integration Tests", () => {
  beforeEach(() => {
    // Setup mocks
    global.fetch = mockFetch;
    Object.defineProperty(global, "crypto", {
      value: mockCrypto,
      writable: true,
    });

    // Clear localStorage and sessionStorage
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }

    vi.clearAllMocks();
  });

  describe("Authentication and Input Validation Integration", () => {
    it("should handle malicious input in authentication flow", () => {
      // Test malicious input sanitization
      const maliciousInput =
        '<script>alert("xss")</script>\'; DROP TABLE users; --';
      const sanitized = sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain("<script>");
      // Note: HTML sanitization doesn't remove SQL patterns, that's handled by SQL validation

      // Test comprehensive validation
      const validationResult = validateInput(maliciousInput, {
        maxLength: 100,
        allowHTML: false,
        allowSQL: false,
        allowXSS: false,
      });

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });

    it("should validate user input throughout authentication process", () => {
      const testCases = [
        { input: "valid@email.com", shouldPass: true },
        { input: '<script>alert("xss")</script>', shouldPass: false },
        { input: "'; DROP TABLE users; --", shouldPass: false },
        { input: "normalusername", shouldPass: true },
        { input: "../../../etc/passwd", shouldPass: false },
      ];

      testCases.forEach(({ input, shouldPass }) => {
        const result = validateInput(input, {
          maxLength: 100,
          allowHTML: false,
          allowSQL: false,
          allowXSS: false,
        });

        expect(result.isValid).toBe(shouldPass);
      });
    });
  });

  describe("File Upload and Security Integration", () => {
    it("should validate file names with security checks", () => {
      // Test file name validation
      const maliciousFileName = '<script>alert("xss")</script>.txt';
      const sanitizedFileName = sanitizeInput(maliciousFileName);

      expect(sanitizedFileName).not.toContain("<script>");
      expect(sanitizedFileName).not.toContain("alert");
    });

    it("should handle file name validation with dangerous patterns", () => {
      const dangerousNames = [
        "../../../etc/passwd",
        "malware.exe",
        "CON.txt",
        "file\x00.jpg",
      ];

      dangerousNames.forEach((name) => {
        const result = validateInput(name, { maxLength: 100 });
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe("CSRF Protection Integration", () => {
    it("should generate and validate CSRF tokens consistently", () => {
      const token = generateCSRFToken();

      // Token should be valid when compared to itself
      expect(validateCSRFToken(token, token)).toBe(true);

      // Token should be invalid when compared to different token
      const differentToken = generateCSRFToken();
      expect(validateCSRFToken(token, differentToken)).toBe(false);

      // Should prevent timing attacks
      const start = performance.now();
      validateCSRFToken(token, differentToken);
      const end = performance.now();
      expect(end - start).toBeLessThan(1);
    });

    it("should integrate CSRF protection with secure fetch", async () => {
      const secureFetch = createSecureFetch("https://api.example.com");
      mockFetch.mockResolvedValue(new Response());

      // Test POST request with CSRF token
      const csrfToken = generateCSRFToken();
      await secureFetch("/api/data", {
        method: "POST",
        body: JSON.stringify({ data: "test" }),
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-CSRF-Token": csrfToken,
          }),
        }),
      );
    });
  });

  describe("Security Headers Integration", () => {
    it("should apply appropriate headers based on environment", () => {
      const environments = ["development", "production", "strict"] as const;

      environments.forEach((env) => {
        const headers = getSecurityHeaders(env);
        expect(headers).toBeDefined();
        expect(headers["Content-Security-Policy"]).toBeDefined();
        expect(headers["X-Frame-Options"]).toBeDefined();
        expect(headers["Strict-Transport-Security"]).toBeDefined();
      });
    });

    it("should integrate headers with secure fetch", async () => {
      const secureFetch = createSecureFetch("https://api.example.com");
      mockFetch.mockResolvedValue(new Response());

      await secureFetch("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Requested-With": "XMLHttpRequest",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }),
        }),
      );
    });
  });

  describe("Password Security Integration", () => {
    it("should generate secure passwords with proper characteristics", () => {
      const password = generateSecurePassword(16, {
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });

      expect(password).toHaveLength(16);
      expect(password).toMatch(/[A-Z]/); // Uppercase
      expect(password).toMatch(/[a-z]/); // Lowercase
      expect(password).toMatch(/[0-9]/); // Numbers
      expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/); // Symbols
    });

    it("should hash passwords securely", async () => {
      const password = "test-password-123";
      const hash = await hashString(password, "SHA-256");

      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[0-9a-f]+$/);

      // Same password should produce same hash
      const hash2 = await hashString(password, "SHA-256");
      expect(hash).toBe(hash2);
    });

    it("should validate password strength with input validation", () => {
      const weakPassword = "123";
      const strongPassword = "StrongP@ssw0rd!";

      const weakResult = validateInput(weakPassword, {
        maxLength: 100,
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      });

      const strongResult = validateInput(strongPassword, {
        maxLength: 100,
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      });

      expect(weakResult.isValid).toBe(false);
      expect(strongResult.isValid).toBe(true);
    });
  });

  describe("Token Management Integration", () => {
    it("should handle token lifecycle with security measures", () => {
      // Test CSRF token generation and validation
      const csrfToken = generateCSRFToken();
      expect(csrfToken).toBeDefined();
      expect(typeof csrfToken).toBe("string");
      expect(csrfToken.length).toBeGreaterThan(0);

      // Test token validation
      const isValid = validateCSRFToken(csrfToken, csrfToken);
      expect(isValid).toBe(true);

      // Test with different token
      const differentToken = generateCSRFToken();
      const isInvalid = validateCSRFToken(csrfToken, differentToken);
      expect(isInvalid).toBe(false);
    });

    it("should integrate token validation with input sanitization", () => {
      // Test with potentially malicious token
      const maliciousToken = '<script>alert("xss")</script>';
      const sanitizedToken = sanitizeInput(maliciousToken);

      // Sanitized token should not contain script tags
      expect(sanitizedToken).not.toContain("<script>");

      // Token validation should handle invalid tokens gracefully
      const isValid = validateCSRFToken(sanitizedToken, sanitizedToken);
      expect(isValid).toBe(true);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle security errors gracefully across components", () => {
      // Test with invalid input
      const invalidInput = null as any;
      const result = validateInput(invalidInput, { maxLength: 100 });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid input type");
    });

    it("should sanitize error messages", () => {
      const maliciousError = '<script>alert("xss")</script>Error message';
      const sanitizedError = sanitizeInput(maliciousError);

      expect(sanitizedError).not.toContain("<script>");
      expect(sanitizedError).toContain("Error message");
    });
  });

  describe("Performance and Security Integration", () => {
    it("should maintain security while processing multiple inputs", () => {
      // Test multiple input validations
      const inputs = Array.from({ length: 10 }, (_, i) => `test-input-${i}`);

      const startTime = performance.now();
      const results = inputs.map((input) =>
        validateInput(input, { maxLength: 100 }),
      );
      const endTime = performance.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second

      // All inputs should be valid
      results.forEach((result) => {
        expect(result.isValid).toBe(true);
      });
    });

    it("should handle concurrent security operations", async () => {
      const operations = [
        () => generateCSRFToken(),
        () => generateSecurePassword(16),
        () => hashString("test-string"),
        () => sanitizeInput('<script>alert("xss")</script>'),
        () => validateInput("test@example.com", { maxLength: 100 }),
      ];

      const startTime = performance.now();
      const results = await Promise.all(operations.map((op) => op()));
      const endTime = performance.now();

      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("Real-world Attack Scenarios", () => {
    it("should prevent XSS attacks through multiple vectors", () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img onload="alert(\'xss\')" src="test.jpg">',
        "<iframe src=\"javascript:alert('xss')\"></iframe>",
        "<svg onload=\"alert('xss')\"></svg>",
      ];

      xssPayloads.forEach((payload) => {
        const sanitized = sanitizeInput(payload);
        expect(sanitized).not.toContain("<script>");
        expect(sanitized).not.toContain("javascript:");
        expect(sanitized).not.toContain("onload=");
      });
    });

    it("should prevent SQL injection through multiple vectors", () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1 --",
      ];

      sqlPayloads.forEach((payload) => {
        const validation = validateInput(payload, {
          allowSQL: false,
        });
        expect(validation.isValid).toBe(false);
      });
    });

    it("should prevent file upload attacks", () => {
      const attackFileNames = [
        "malware.exe",
        "../../../etc/passwd",
        ".htaccess",
        "script.js",
      ];

      for (const fileName of attackFileNames) {
        const result = validateInput(fileName, { maxLength: 100 });
        expect(result.isValid).toBe(false);
      }
    });

    it("should prevent CSRF attacks", () => {
      const csrfToken = generateCSRFToken();

      // Simulate CSRF attack with different token
      const attackToken = generateCSRFToken();
      expect(validateCSRFToken(csrfToken, attackToken)).toBe(false);

      // Simulate CSRF attack with empty token
      expect(validateCSRFToken(csrfToken, "")).toBe(false);

      // Simulate CSRF attack with null token
      expect(validateCSRFToken(csrfToken, null as any)).toBe(false);
    });
  });
});
