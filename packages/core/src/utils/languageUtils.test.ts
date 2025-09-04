/**
 * Tests for Language Utilities
 */

import { describe, it, expect } from "vitest";
import {
  getMonacoLanguage,
  getLanguageInfo,
  getFileExtension,
  getLanguageDisplayName,
  getLanguageCategory,
  isCodeFile,
  getFileNameWithoutExtension,
  getFileName,
  getDirectoryPath,
} from "./languageUtils";

describe("Language Utilities", () => {
  describe("getMonacoLanguage", () => {
    it("should return correct Monaco language for JavaScript", () => {
      expect(getMonacoLanguage("script.js")).toBe("javascript");
      expect(getMonacoLanguage("component.jsx")).toBe("javascript");
    });

    it("should return correct Monaco language for TypeScript", () => {
      expect(getMonacoLanguage("script.ts")).toBe("typescript");
      expect(getMonacoLanguage("component.tsx")).toBe("typescript");
    });

    it("should return correct Monaco language for web technologies", () => {
      expect(getMonacoLanguage("index.html")).toBe("html");
      expect(getMonacoLanguage("styles.css")).toBe("css");
      expect(getMonacoLanguage("styles.scss")).toBe("scss");
    });

    it("should return correct Monaco language for programming languages", () => {
      expect(getMonacoLanguage("main.py")).toBe("python");
      expect(getMonacoLanguage("app.java")).toBe("java");
      expect(getMonacoLanguage("main.cpp")).toBe("cpp");
    });

    it("should return correct Monaco language for data formats", () => {
      expect(getMonacoLanguage("data.json")).toBe("json");
      expect(getMonacoLanguage("config.xml")).toBe("xml");
      expect(getMonacoLanguage("settings.yaml")).toBe("yaml");
    });

    it("should return correct Monaco language for shell scripts", () => {
      expect(getMonacoLanguage("script.sh")).toBe("shell");
      expect(getMonacoLanguage("script.bash")).toBe("shell");
      expect(getMonacoLanguage("script.ps1")).toBe("powershell");
    });

    it("should return correct Monaco language for configuration files", () => {
      expect(getMonacoLanguage("Dockerfile")).toBe("dockerfile");
      expect(getMonacoLanguage("config.ini")).toBe("ini");
      expect(getMonacoLanguage("package.json")).toBe("json");
    });

    it("should return plaintext for unknown extensions", () => {
      expect(getMonacoLanguage("unknown.xyz")).toBe("plaintext");
      expect(getMonacoLanguage("file.abc")).toBe("plaintext");
    });

    it("should handle files without extensions", () => {
      expect(getMonacoLanguage("README")).toBe("plaintext");
      expect(getMonacoLanguage("Dockerfile")).toBe("dockerfile");
    });

    it("should handle case insensitive extensions", () => {
      expect(getMonacoLanguage("script.JS")).toBe("javascript");
      expect(getMonacoLanguage("styles.CSS")).toBe("css");
    });
  });

  describe("getLanguageInfo", () => {
    it("should return language info for known extensions", () => {
      const jsInfo = getLanguageInfo("script.js");
      expect(jsInfo).toEqual({
        monacoLanguage: "javascript",
        displayName: "JavaScript",
        isCode: true,
        category: "web",
      });

      const pyInfo = getLanguageInfo("main.py");
      expect(pyInfo).toEqual({
        monacoLanguage: "python",
        displayName: "Python",
        isCode: true,
        category: "programming",
      });
    });

    it("should return language info for full filenames", () => {
      const dockerInfo = getLanguageInfo("Dockerfile");
      expect(dockerInfo).toEqual({
        monacoLanguage: "dockerfile",
        displayName: "Dockerfile",
        isCode: true,
        category: "config",
      });

      const packageInfo = getLanguageInfo("package.json");
      expect(packageInfo).toEqual({
        monacoLanguage: "json",
        displayName: "Package.json",
        isCode: true,
        category: "config",
      });
    });

    it("should return default info for unknown extensions", () => {
      const unknownInfo = getLanguageInfo("unknown.xyz");
      expect(unknownInfo).toEqual({
        monacoLanguage: "plaintext",
        displayName: "Plain Text",
        isCode: false,
        category: "other",
      });
    });

    it("should handle files without extensions", () => {
      const readmeInfo = getLanguageInfo("README");
      expect(readmeInfo).toEqual({
        monacoLanguage: "plaintext",
        displayName: "Plain Text",
        isCode: false,
        category: "other",
      });
    });
  });

  describe("getFileExtension", () => {
    it("should extract file extension correctly", () => {
      expect(getFileExtension("script.js")).toBe("js");
      expect(getFileExtension("styles.css")).toBe("css");
      expect(getFileExtension("component.tsx")).toBe("tsx");
    });

    it("should handle files with multiple dots", () => {
      expect(getFileExtension("config.prod.env")).toBe("env");
      expect(getFileExtension("bundle.min.js")).toBe("js");
    });

    it("should handle files without extensions", () => {
      expect(getFileExtension("README")).toBe("readme");
      expect(getFileExtension("Dockerfile")).toBe("dockerfile");
      expect(getFileExtension("LICENSE")).toBe("license");
    });

    it("should handle hidden files", () => {
      expect(getFileExtension(".env")).toBe("env");
      expect(getFileExtension(".gitignore")).toBe("gitignore");
    });

    it("should handle case insensitive extensions", () => {
      expect(getFileExtension("script.JS")).toBe("js");
      expect(getFileExtension("styles.CSS")).toBe("css");
    });
  });

  describe("getLanguageDisplayName", () => {
    it("should return display name for known extensions", () => {
      expect(getLanguageDisplayName("script.js")).toBe("JavaScript");
      expect(getLanguageDisplayName("main.py")).toBe("Python");
      expect(getLanguageDisplayName("index.html")).toBe("HTML");
    });

    it("should return display name for full filenames", () => {
      expect(getLanguageDisplayName("Dockerfile")).toBe("Dockerfile");
      expect(getLanguageDisplayName("package.json")).toBe("Package.json");
    });

    it("should return default display name for unknown extensions", () => {
      expect(getLanguageDisplayName("unknown.xyz")).toBe("Plain Text");
      expect(getLanguageDisplayName("file.abc")).toBe("Plain Text");
    });

    it("should handle files without extensions", () => {
      expect(getLanguageDisplayName("README")).toBe("Plain Text");
      expect(getLanguageDisplayName("LICENSE")).toBe("Plain Text");
    });
  });

  describe("getLanguageCategory", () => {
    it("should return correct category for known extensions", () => {
      expect(getLanguageCategory("script.js")).toBe("web");
      expect(getLanguageCategory("main.py")).toBe("programming");
      expect(getLanguageCategory("data.json")).toBe("data");
      expect(getLanguageCategory("script.sh")).toBe("shell");
      expect(getLanguageCategory("config.ini")).toBe("config");
    });

    it("should return 'other' for unknown extensions", () => {
      expect(getLanguageCategory("unknown.xyz")).toBe("other");
    });
  });

  describe("isCodeFile", () => {
    it("should return true for code files", () => {
      expect(isCodeFile("script.js")).toBe(true);
      expect(isCodeFile("main.py")).toBe(true);
      expect(isCodeFile("index.html")).toBe(true);
      expect(isCodeFile("styles.css")).toBe(true);
    });

    it("should return false for non-code files", () => {
      expect(isCodeFile("README.md")).toBe(false);
      expect(isCodeFile("data.csv")).toBe(false);
      expect(isCodeFile("document.txt")).toBe(false);
    });

    it("should return false for unknown extensions", () => {
      expect(isCodeFile("unknown.xyz")).toBe(false);
    });
  });

  describe("getFileNameWithoutExtension", () => {
    it("should return filename without extension", () => {
      expect(getFileNameWithoutExtension("script.js")).toBe("script");
      expect(getFileNameWithoutExtension("styles.css")).toBe("styles");
      expect(getFileNameWithoutExtension("component.tsx")).toBe("component");
    });

    it("should handle files without extensions", () => {
      expect(getFileNameWithoutExtension("README")).toBe("README");
      expect(getFileNameWithoutExtension("Dockerfile")).toBe("Dockerfile");
    });

    it("should handle files with multiple dots", () => {
      expect(getFileNameWithoutExtension("config.prod.env")).toBe("config.prod");
      expect(getFileNameWithoutExtension("bundle.min.js")).toBe("bundle.min");
    });
  });

  describe("getFileName", () => {
    it("should return filename from path", () => {
      expect(getFileName("path/to/script.js")).toBe("script.js");
      expect(getFileName("styles.css")).toBe("styles.css");
      expect(getFileName("component.tsx")).toBe("component.tsx");
    });

    it("should handle root files", () => {
      expect(getFileName("script.js")).toBe("script.js");
      expect(getFileName("README")).toBe("README");
    });
  });

  describe("getDirectoryPath", () => {
    it("should return directory path from file path", () => {
      expect(getDirectoryPath("path/to/script.js")).toBe("path/to");
      expect(getDirectoryPath("styles.css")).toBe("/");
      expect(getDirectoryPath("folder/subfolder/file.txt")).toBe("folder/subfolder");
    });

    it("should handle root files", () => {
      expect(getDirectoryPath("script.js")).toBe("/");
      expect(getDirectoryPath("README")).toBe("/");
    });
  });
});


