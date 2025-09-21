/**
 * 🦦 Tests for FileDiscoveryService
 *
 * *splashes with testing enthusiasm* Comprehensive tests for the file discovery
 * service that finds and analyzes project files with otter-like thoroughness.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FileDiscoveryService } from "../FileDiscoveryService";
import { readFile, readdir } from "fs/promises";

// Mock fs/promises
vi.mock("fs/promises");

describe("FileDiscoveryService", () => {
  let service: FileDiscoveryService;
  const mockReadFile = vi.mocked(readFile);
  const mockReaddir = vi.mocked(readdir);

  beforeEach(() => {
    service = new FileDiscoveryService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("discoverFiles", () => {
    it("should discover supported files in project", async () => {
      // Mock directory structure
      mockReaddir
        .mockResolvedValueOnce(["src", "package.json", "README.md"]) // root
        .mockResolvedValueOnce(["index.ts", "utils.ts", "test.js"]) // src
        .mockResolvedValueOnce([]); // empty subdirectory

      // Mock file reads (files exist)
      mockReadFile
        .mockResolvedValueOnce("file content") // package.json
        .mockResolvedValueOnce("file content") // README.md
        .mockResolvedValueOnce("file content") // index.ts
        .mockResolvedValueOnce("file content") // utils.ts
        .mockResolvedValueOnce("file content"); // test.js

      const result = await service.discoverFiles("/test/project");

      expect(result).toHaveLength(5);
      expect(result).toContain("/test/project/package.json");
      expect(result).toContain("/test/project/README.md");
      expect(result).toContain("/test/project/src/index.ts");
      expect(result).toContain("/test/project/src/utils.ts");
      expect(result).toContain("/test/project/src/test.js");
    });

    it("should exclude node_modules and other patterns", async () => {
      mockReaddir
        .mockResolvedValueOnce(["src", "node_modules", "dist", "package.json"])
        .mockResolvedValueOnce(["index.ts"])
        .mockResolvedValueOnce([]); // node_modules (should be skipped)
        .mockResolvedValueOnce([]); // dist (should be skipped)
        .mockResolvedValueOnce([]); // empty subdirectory

      mockReadFile
        .mockResolvedValueOnce("file content") // package.json
        .mockResolvedValueOnce("file content"); // index.ts

      const result = await service.discoverFiles("/test/project");

      expect(result).toHaveLength(2);
      expect(result).toContain("/test/project/package.json");
      expect(result).toContain("/test/project/src/index.ts");
      expect(result).not.toContain(expect.stringContaining("node_modules"));
      expect(result).not.toContain(expect.stringContaining("dist"));
    });

    it("should handle permission errors gracefully", async () => {
      mockReaddir.mockRejectedValueOnce(new Error("Permission denied"));

      const result = await service.discoverFiles("/test/project");

      expect(result).toEqual([]);
    });

    it("should only include supported file extensions", async () => {
      mockReaddir
        .mockResolvedValueOnce(["script.py", "style.css", "data.xml", "config.json"])
        .mockResolvedValueOnce([]);

      mockReadFile
        .mockResolvedValueOnce("file content") // script.py
        .mockResolvedValueOnce("file content") // style.css (not supported)
        .mockResolvedValueOnce("file content") // data.xml (not supported)
        .mockResolvedValueOnce("file content"); // config.json

      const result = await service.discoverFiles("/test/project");

      expect(result).toHaveLength(2);
      expect(result).toContain("/test/project/script.py");
      expect(result).toContain("/test/project/config.json");
      expect(result).not.toContain("/test/project/style.css");
      expect(result).not.toContain("/test/project/data.xml");
    });
  });

  describe("countLines", () => {
    it("should count lines in a file", async () => {
      mockReadFile.mockResolvedValueOnce("line 1\nline 2\nline 3\nline 4");

      const result = await service.countLines("/test/file.ts");

      expect(result).toBe(4);
      expect(mockReadFile).toHaveBeenCalledWith("/test/file.ts", "utf-8");
    });

    it("should handle file read errors", async () => {
      mockReadFile.mockRejectedValueOnce(new Error("File not found"));

      const result = await service.countLines("/test/nonexistent.ts");

      expect(result).toBe(0);
    });

    it("should handle empty files", async () => {
      mockReadFile.mockResolvedValueOnce("");

      const result = await service.countLines("/test/empty.ts");

      expect(result).toBe(1); // Empty string still has one line
    });
  });

  describe("detectLanguage", () => {
    it("should detect TypeScript files", () => {
      expect(service.detectLanguage("/test/file.ts")).toBe("typescript");
      expect(service.detectLanguage("/test/component.tsx")).toBe("typescript");
    });

    it("should detect JavaScript files", () => {
      expect(service.detectLanguage("/test/file.js")).toBe("javascript");
      expect(service.detectLanguage("/test/component.jsx")).toBe("javascript");
    });

    it("should detect Python files", () => {
      expect(service.detectLanguage("/test/script.py")).toBe("python");
    });

    it("should detect shell files", () => {
      expect(service.detectLanguage("/test/script.sh")).toBe("shell");
    });

    it("should detect markdown files", () => {
      expect(service.detectLanguage("/test/README.md")).toBe("markdown");
    });

    it("should detect YAML files", () => {
      expect(service.detectLanguage("/test/config.yml")).toBe("yaml");
      expect(service.detectLanguage("/test/config.yaml")).toBe("yaml");
    });

    it("should detect JSON files", () => {
      expect(service.detectLanguage("/test/package.json")).toBe("json");
    });

    it("should return unknown for unsupported extensions", () => {
      expect(service.detectLanguage("/test/file.css")).toBe("unknown");
      expect(service.detectLanguage("/test/file.xml")).toBe("unknown");
      expect(service.detectLanguage("/test/file")).toBe("unknown");
    });
  });

  describe("private methods", () => {
    it("should correctly identify supported files", () => {
      // Access private method through any type
      const serviceAny = service as any;
      
      expect(serviceAny.isSupportedFile(".ts")).toBe(true);
      expect(serviceAny.isSupportedFile(".tsx")).toBe(true);
      expect(serviceAny.isSupportedFile(".js")).toBe(true);
      expect(serviceAny.isSupportedFile(".jsx")).toBe(true);
      expect(serviceAny.isSupportedFile(".py")).toBe(true);
      expect(serviceAny.isSupportedFile(".sh")).toBe(true);
      expect(serviceAny.isSupportedFile(".md")).toBe(true);
      expect(serviceAny.isSupportedFile(".yml")).toBe(true);
      expect(serviceAny.isSupportedFile(".yaml")).toBe(true);
      expect(serviceAny.isSupportedFile(".json")).toBe(true);
      
      expect(serviceAny.isSupportedFile(".css")).toBe(false);
      expect(serviceAny.isSupportedFile(".xml")).toBe(false);
      expect(serviceAny.isSupportedFile(".txt")).toBe(false);
    });
  });
});
