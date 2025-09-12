/**
 * Security Validation Tests
 * Tests for input validation and sanitization functions
 */

import { describe, it, expect } from "vitest";
import { i18n } from "reynard-i18n";
import {
  sanitizeHTML,
  validateURL,
  validateFileName,
  validateJSON,
  validateSQLInput,
  validateXSSInput,
  validateFileSize,
  validateMimeType,
  validateInput,
} from "./validation";

describe("HTML Sanitization", () => {
  describe("sanitizeHTML", () => {
    it("should remove script tags", () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello World");
    });

    it("should remove style tags", () => {
      const input = "<style>body{color:red}</style>Hello World";
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello World");
    });

    it("should remove javascript protocols", () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeHTML(input);
      expect(result).toBe("");
    });

    it("should remove event handlers", () => {
      const input = '<img onload="alert(\'xss\')" src="test.jpg">';
      const result = sanitizeHTML(input);
      expect(result).not.toContain("onload");
      expect(result).not.toContain("alert");
    });

    it("should remove iframe tags", () => {
      const input = '<iframe src="malicious.com"></iframe>Hello';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello");
    });

    it("should remove object and embed tags", () => {
      const input =
        '<object data="malicious.swf"></object><embed src="malicious.swf"></embed>Hello';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello");
    });

    it("should remove form elements", () => {
      const input =
        '<form><input type="text"><button>Click</button></form>Hello';
      const result = sanitizeHTML(input);
      expect(result).toBe("Hello");
    });

    it("should handle empty input", () => {
      expect(sanitizeHTML("")).toBe("");
      expect(sanitizeHTML(null as any)).toBe("");
      expect(sanitizeHTML(undefined as any)).toBe("");
    });

    it("should preserve safe HTML content", () => {
      const input = "<p>Hello <strong>World</strong></p>";
      const result = sanitizeHTML(input);
      expect(result).toBe("<p>Hello <strong>World</strong></p>");
    });
  });
});

describe("URL Validation", () => {
  describe("validateURL", () => {
    it("should validate correct URLs", () => {
      const result = validateURL("https://example.com");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("https://example.com/");
    });

    it("should validate HTTP URLs", () => {
      const result = validateURL("http://example.com");
      expect(result.isValid).toBe(true);
    });

    it("should reject dangerous protocols", () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:msgbox("xss")',
        "file:///etc/passwd",
        "ftp://malicious.com",
      ];

      dangerousUrls.forEach((url) => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject localhost URLs", () => {
      const localhostUrls = [
        "http://localhost:3000",
        "https://127.0.0.1:8080",
        "http://0.0.0.0:9000",
      ];

      localhostUrls.forEach((url) => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
      });
    });

    it("should handle invalid URLs", () => {
      const invalidUrls = [
        "not-a-url",
        "http://",
        "https://",
        "",
        null as any,
        undefined as any,
      ];

      invalidUrls.forEach((url) => {
        const result = validateURL(url);
        expect(result.isValid).toBe(false);
      });
    });

    it("should sanitize URLs with query parameters", () => {
      const result = validateURL("https://example.com/path?param=value");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("https://example.com/path?param=value");
    });
  });
});

describe("File Name Validation", () => {
  describe("validateFileName", () => {
    it("should validate correct file names", () => {
      const validNames = [
        "document.pdf",
        "image.jpg",
        "file_name.txt",
        "file-name.doc",
        "123file.png",
      ];

      validNames.forEach((name) => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(true);
        expect(result.sanitized).toBe(name);
      });
    });

    it("should reject directory traversal attempts", () => {
      const traversalNames = [
        "../../../etc/passwd",
        "..\\..\\windows\\system32",
        "file/../secret.txt",
        "file\\..\\secret.txt",
      ];

      traversalNames.forEach((name) => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject invalid characters", () => {
      const invalidNames = [
        "file<name>.txt",
        "file>name.txt",
        "file:name.txt",
        'file"name.txt',
        "file|name.txt",
        "file?name.txt",
        "file*name.txt",
      ];

      invalidNames.forEach((name) => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject Windows reserved names", () => {
      const reservedNames = [
        "CON.txt",
        "PRN.doc",
        "AUX.pdf",
        "NUL.jpg",
        "COM1.txt",
        "LPT1.doc",
      ];

      reservedNames.forEach((name) => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject hidden files", () => {
      const hiddenNames = [".htaccess", ".env", ".gitignore", ".hidden"];

      hiddenNames.forEach((name) => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject executable files", () => {
      const executableNames = [
        "malware.exe",
        "script.bat",
        "command.cmd",
        "program.com",
        "screensaver.scr",
        "installer.msi",
      ];

      executableNames.forEach((name) => {
        const result = validateFileName(name);
        expect(result.isValid).toBe(false);
      });
    });

    it("should sanitize file names with special characters", () => {
      const result = validateFileName("file@name#test$.txt");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("file_name_test_.txt");
    });

    it("should handle empty file names", () => {
      const result = validateFileName("");
      expect(result.isValid).toBe(false);
    });
  });
});

describe("JSON Validation", () => {
  describe("validateJSON", () => {
    it("should validate correct JSON", () => {
      const validJson = '{"name": "test", "value": 123}';
      const result = validateJSON(validJson);
      expect(result.isValid).toBe(true);
      expect(result.parsed).toEqual({ name: "test", value: 123 });
    });

    it("should reject prototype pollution attempts", () => {
      const maliciousJson = '{"__proto__": {"isAdmin": true}}';
      const result = validateJSON(maliciousJson);
      expect(result.isValid).toBe(false);
    });

    it("should reject constructor pollution attempts", () => {
      const maliciousJson = '{"constructor": {"prototype": {"isAdmin": true}}}';
      const result = validateJSON(maliciousJson);
      expect(result.isValid).toBe(false);
    });

    it("should handle invalid JSON", () => {
      const invalidJson = '{"name": "test", "value": 123'; // Missing closing brace
      const result = validateJSON(invalidJson);
      expect(result.isValid).toBe(false);
    });

    it("should handle empty input", () => {
      const result = validateJSON("");
      expect(result.isValid).toBe(false);
    });

    it("should handle null and undefined", () => {
      expect(validateJSON(null as any).isValid).toBe(false);
      expect(validateJSON(undefined as any).isValid).toBe(false);
    });
  });
});

describe("SQL Injection Validation", () => {
  describe("validateSQLInput", () => {
    it("should allow safe input", () => {
      const safeInputs = [
        "Hello World",
        "user@example.com",
        "12345",
        "normal text with spaces",
      ];

      safeInputs.forEach((input) => {
        expect(validateSQLInput(input)).toBe(true);
      });
    });

    it("should detect SQL injection attempts", () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1 --",
        "'; EXEC xp_cmdshell('dir'); --",
        "<script>alert('xss')</script>",
        "-- comment",
        "/* comment */",
        "' AND 1=1 OR '1'='1",
      ];

      maliciousInputs.forEach((input) => {
        expect(validateSQLInput(input)).toBe(false);
      });
    });

    it("should handle empty input", () => {
      expect(validateSQLInput("")).toBe(true);
      expect(validateSQLInput(null as any)).toBe(true);
      expect(validateSQLInput(undefined as any)).toBe(true);
    });
  });
});

describe("XSS Validation", () => {
  describe("validateXSSInput", () => {
    it("should allow safe input", () => {
      const safeInputs = [
        "Hello World",
        "user@example.com",
        "12345",
        "normal text with spaces",
      ];

      safeInputs.forEach((input) => {
        expect(validateXSSInput(input)).toBe(true);
      });
    });

    it("should detect XSS attempts", () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<iframe src="malicious.com"></iframe>',
        '<object data="malicious.swf"></object>',
        '<embed src="malicious.swf"></embed>',
        'javascript:alert("xss")',
        'vbscript:msgbox("xss")',
        '<img onload="alert(\'xss\')" src="test.jpg">',
        '<img onerror="alert(\'xss\')" src="test.jpg">',
        '<img onclick="alert(\'xss\')" src="test.jpg">',
        '<img onmouseover="alert(\'xss\')" src="test.jpg">',
        '<link rel="stylesheet" href="malicious.css">',
        '<meta http-equiv="refresh" content="0;url=malicious.com">',
      ];

      maliciousInputs.forEach((input) => {
        expect(validateXSSInput(input)).toBe(false);
      });
    });

    it("should handle empty input", () => {
      expect(validateXSSInput("")).toBe(true);
      expect(validateXSSInput(null as any)).toBe(true);
      expect(validateXSSInput(undefined as any)).toBe(true);
    });
  });
});

describe("File Validation", () => {
  describe("validateFileSize", () => {
    it("should validate correct file sizes", () => {
      expect(validateFileSize(1024, 2048)).toBe(true);
      expect(validateFileSize(0, 1024)).toBe(false); // Empty file
      expect(validateFileSize(2048, 1024)).toBe(false); // Too large
    });

    it("should use default max size", () => {
      expect(validateFileSize(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(validateFileSize(15 * 1024 * 1024)).toBe(false); // 15MB
    });
  });

  describe("validateMimeType", () => {
    it("should validate correct MIME types", () => {
      const allowedTypes = ["image/jpeg", "image/png", "text/plain"];
      expect(validateMimeType("image/jpeg", allowedTypes)).toBe(true);
      expect(validateMimeType("image/png", allowedTypes)).toBe(true);
      expect(validateMimeType("text/plain", allowedTypes)).toBe(true);
    });

    it("should reject invalid MIME types", () => {
      const allowedTypes = ["image/jpeg", "image/png", "text/plain"];
      expect(validateMimeType("application/pdf", allowedTypes)).toBe(false);
      expect(validateMimeType("video/mp4", allowedTypes)).toBe(false);
    });

    it("should handle empty input", () => {
      expect(validateMimeType("", ["image/jpeg"])).toBe(false);
      expect(validateMimeType("image/jpeg", [])).toBe(false);
    });
  });
});

describe("Comprehensive Input Validation", () => {
  describe("validateInput", () => {
    it("should validate input with all options", () => {
      const result = validateInput("Hello World", {
        maxLength: 20,
        allowHTML: false,
        allowSQL: false,
        allowXSS: false,
        pattern: /^[a-zA-Z\s]+$/,
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("Hello World");
      expect(result.errors).toHaveLength(0);
    });

    it("should detect length violations", () => {
      const result = validateInput("a".repeat(25), {
        maxLength: 20,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Input exceeds maximum length of 20");
    });

    it("should detect HTML violations", () => {
      const result = validateInput('<script>alert("xss")</script>', {
        allowHTML: false,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        i18n.t("core.security.input-contains-potentially-dangerous-html"),
      );
    });

    it("should detect SQL violations", () => {
      const result = validateInput("'; DROP TABLE users; --", {
        allowSQL: false,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        i18n.t(
          "core.security.input-contains-potentially-dangerous-sql-patterns",
        ),
      );
    });

    it("should detect XSS violations", () => {
      const result = validateInput('<script>alert("xss")</script>', {
        allowXSS: false,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        i18n.t(
          "core.security.input-contains-potentially-dangerous-xss-patterns",
        ),
      );
    });

    it("should detect pattern violations", () => {
      const result = validateInput("Hello123", {
        pattern: /^[a-zA-Z\s]+$/,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "[core.validation.does-not-match-pattern]",
      );
    });

    it("should handle multiple violations", () => {
      const result = validateInput(
        '<script>alert("xss")</script>\'; DROP TABLE users; --',
        {
          maxLength: 10,
          allowHTML: false,
          allowSQL: false,
          allowXSS: false,
        },
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it("should handle empty input", () => {
      const result = validateInput("", {});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("[core.validation.invalid-input-type]");
    });

    it("should handle null input", () => {
      const result = validateInput(null as any, {});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("[core.validation.invalid-input-type]");
    });
  });
});

describe("Edge Cases and Security", () => {
  it("should handle extremely long inputs", () => {
    const longInput = "a".repeat(100000);
    const result = validateInput(longInput, { maxLength: 1000 });
    expect(result.isValid).toBe(false);
  });

  it("should handle unicode characters", () => {
    const unicodeInput = "Hello 世界 🌍";
    const result = validateInput(unicodeInput, {});
    expect(result.isValid).toBe(true);
  });

  it("should handle mixed case attacks", () => {
    const mixedCaseInput = '<ScRiPt>alert("xss")</ScRiPt>';
    const result = validateInput(mixedCaseInput, { allowXSS: false });
    expect(result.isValid).toBe(false);
  });

  it("should handle encoded attacks", () => {
    const encodedInput = '&#60;script&#62;alert("xss")&#60;/script&#62;';
    const result = validateInput(encodedInput, { allowXSS: false });
    expect(result.isValid).toBe(false);
  });

  it("should handle null byte attacks", () => {
    const nullByteInput = "file.txt\x00.jpg";
    const result = validateFileName(nullByteInput);
    expect(result.isValid).toBe(false);
  });
});
