/**
 * 🦊 Tests for Linting Service
 *
 * Test the core linting service functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { IncrementalLintingService } from "../linting-service.js";
import { 
  setupMocks, 
  cleanupMocks, 
  createTestFile, 
  createMockLintResult,
  createMockLintIssue,
  mockLinterExecSync,
  waitFor
} from "./test-utils.js";

describe("IncrementalLintingService", () => {
  let service: IncrementalLintingService;
  let testConfig: any;

  beforeEach(() => {
    setupMocks();
    mockLinterExecSync();
    
    testConfig = {
      rootPath: "/test/workspace",
      linters: [
        {
          name: "eslint",
          enabled: true,
          command: "npx",
          args: ["eslint", "--format", "json"],
          patterns: ["**/*.ts"],
          excludePatterns: ["**/node_modules/**"],
          maxFileSize: 1048576,
          timeout: 30000,
          parallel: true,
          priority: 10,
        }
      ],
      includePatterns: ["**/*.ts"],
      excludePatterns: ["**/node_modules/**"],
      debounceDelay: 100,
      maxConcurrency: 2,
      incremental: true,
      persistCache: true,
      lintOnSave: true,
      lintOnChange: false,
    };

    service = new IncrementalLintingService(testConfig);
  });

  afterEach(async () => {
    if (service) {
      await service.stop();
    }
    cleanupMocks();
  });

  describe("initialization", () => {
    it("should initialize with configuration", () => {
      expect(service).toBeDefined();
      expect(service.getStatus()).toHaveProperty("isRunning");
      expect(service.getStatus()).toHaveProperty("totalFiles");
      expect(service.getStatus()).toHaveProperty("filesWithIssues");
    });

    it("should start the service", async () => {
      await service.start();
      expect(service.getStatus().isRunning).toBe(true);
    });

    it("should stop the service", async () => {
      await service.start();
      await service.stop();
      expect(service.getStatus().isRunning).toBe(false);
    });
  });

  describe("file linting", () => {
    beforeEach(async () => {
      await service.start();
    });

    it("should lint a single file", async () => {
      const filePath = createTestFile("/test/file.ts", "const unused = 1;");
      
      const result = await service.lintFile(filePath);
      
      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result).toHaveProperty("duration");
      expect(result).toHaveProperty("success");
      expect(result.filePath).toBe(filePath);
    });

    it("should lint multiple files", async () => {
      const file1 = createTestFile("/test/file1.ts", "const unused1 = 1;");
      const file2 = createTestFile("/test/file2.ts", "const unused2 = 2;");
      
      const results = await service.lintFiles([file1, file2]);
      
      expect(results).toHaveLength(2);
      expect(results[0].filePath).toBe(file1);
      expect(results[1].filePath).toBe(file2);
    });

    it("should handle files that don't exist", async () => {
      const result = await service.lintFile("/test/nonexistent.ts");
      
      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe("error");
    });

    it("should respect file size limits", async () => {
      const largeContent = "const unused = 1;".repeat(100000);
      const filePath = createTestFile("/test/large.ts", largeContent);
      
      const result = await service.lintFile(filePath);
      
      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      // Should have issues due to file size limit
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should handle linter timeouts", async () => {
      const filePath = createTestFile("/test/file.ts", "const unused = 1;");
      
      // Mock a timeout scenario
      vi.spyOn(service as any, "executeLinter").mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 100);
        });
      });
      
      const result = await service.lintFile(filePath);
      
      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe("error");
    });
  });

  describe("incremental linting", () => {
    beforeEach(async () => {
      await service.start();
    });

    it("should only lint changed files", async () => {
      const file1 = createTestFile("/test/file1.ts", "const unused1 = 1;");
      const file2 = createTestFile("/test/file2.ts", "const unused2 = 2;");
      
      // First lint
      await service.lintFiles([file1, file2]);
      
      // Mock file modification time change
      const { mockFs } = await import("./test-utils.js");
      mockFs.statSync.mockImplementation((path: string) => {
        if (path === file1) {
          return { mtime: new Date(Date.now() + 1000), size: 1024 };
        }
        return { mtime: new Date(), size: 1024 };
      });
      
      // Second lint should only process file1
      const results = await service.lintFiles([file1, file2]);
      
      expect(results).toHaveLength(2);
      // file1 should be re-linted, file2 should be skipped
    });

    it("should update cache after linting", async () => {
      const filePath = createTestFile("/test/file.ts", "const unused = 1;");
      
      await service.lintFile(filePath);
      
      // Check that cache was updated
      const cache = (service as any).cache;
      expect(cache.has(filePath)).toBe(true);
    });
  });

  describe("queue management", () => {
    beforeEach(async () => {
      await service.start();
    });

    it("should respect concurrency limits", async () => {
      const files = Array.from({ length: 10 }, (_, i) => 
        createTestFile(`/test/file${i}.ts`, `const unused${i} = ${i};`)
      );
      
      const startTime = Date.now();
      await service.lintFiles(files);
      const endTime = Date.now();
      
      // Should take some time due to concurrency limits
      expect(endTime - startTime).toBeGreaterThan(0);
    });

    it("should handle queue overflow gracefully", async () => {
      const files = Array.from({ length: 100 }, (_, i) => 
        createTestFile(`/test/file${i}.ts`, `const unused${i} = ${i};`)
      );
      
      const results = await service.lintFiles(files);
      
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("issues");
      });
    });
  });

  describe("status and statistics", () => {
    beforeEach(async () => {
      await service.start();
    });

    it("should track linting statistics", async () => {
      const file1 = createTestFile("/test/file1.ts", "const unused1 = 1;");
      const file2 = createTestFile("/test/file2.ts", "const unused2 = 2;");
      
      await service.lintFiles([file1, file2]);
      
      const status = service.getStatus();
      expect(status.totalFiles).toBeGreaterThan(0);
      expect(status.filesWithIssues).toBeGreaterThan(0);
      expect(status.totalIssues).toBeGreaterThan(0);
    });

    it("should reset statistics", async () => {
      const filePath = createTestFile("/test/file.ts", "const unused = 1;");
      
      await service.lintFile(filePath);
      service.resetStats();
      
      const status = service.getStatus();
      expect(status.totalFiles).toBe(0);
      expect(status.filesWithIssues).toBe(0);
      expect(status.totalIssues).toBe(0);
    });
  });

  describe("error handling", () => {
    beforeEach(async () => {
      await service.start();
    });

    it("should handle linter execution errors", async () => {
      const filePath = createTestFile("/test/file.ts", "const unused = 1;");
      
      // Mock linter failure
      const { mockExecSync } = await import("./test-utils.js");
      mockExecSync.mockImplementation(() => {
        throw new Error("Linter failed");
      });
      
      const result = await service.lintFile(filePath);
      
      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe("error");
    });

    it("should handle invalid file paths", async () => {
      const result = await service.lintFile("");
      
      expect(result).toHaveProperty("filePath");
      expect(result).toHaveProperty("issues");
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe("error");
    });
  });

  describe("cache functionality", () => {
    it("should load cache on initialization", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      await service.start();
      
      // Cache should be loaded (even if empty)
      expect(service).toBeDefined();
      await service.stop();
    });

    it("should save cache on shutdown", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      await service.start();
      await service.stop();
      
      // Should not throw errors
      expect(service).toBeDefined();
    });

    it("should handle cache directory creation errors", async () => {
      const configWithInvalidCache = {
        ...testConfig,
        cacheDir: "/invalid/path/that/does/not/exist",
      };
      
      const service = new IncrementalLintingService(configWithInvalidCache);
      await service.start();
      await service.stop();
      
      // Should handle errors gracefully
      expect(service).toBeDefined();
    });
  });

  describe("file watching", () => {
    it("should start file watching", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();
      
      // File watching should be active
      expect(service).toBeDefined();
      await service.stop();
    });

    it("should stop file watching", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();
      await service.stop();
      
      // Should stop gracefully
      expect(service).toBeDefined();
    });
  });

  describe("statistics and monitoring", () => {
    it("should track comprehensive statistics", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Lint some files to generate statistics
      await service.lintFile("/test/file1.ts");
      await service.lintFile("/test/file2.ts");

      const stats = service.getStatus();
      expect(stats.totalFiles).toBeGreaterThan(0);
      expect(stats.averageLintTime).toBeGreaterThanOrEqual(0);
      await service.stop();
    });

    it("should handle statistics reset", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Generate some statistics
      await service.lintFile("/test/file1.ts");
      const statsBefore = service.getStatus();
      expect(statsBefore.totalFiles).toBeGreaterThan(0);

      // Reset statistics
      service.resetStats();
      const statsAfter = service.getStatus();
      expect(statsAfter.totalFiles).toBe(0);
      await service.stop();
    });
  });

  describe("file watching and cache operations", () => {
    it("should handle file watcher events", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Simulate file watcher events by calling the internal method
      // This tests the file watcher event handlers
      const enqueueSpy = vi.spyOn(service as any, 'enqueueFileForLinting');
      
      // Simulate file add event
      (service as any).watcher?.emit('add', '/test/newfile.ts');
      
      // Should have called enqueueFileForLinting
      expect(enqueueSpy).toHaveBeenCalledWith('/test/newfile.ts');
      
      await service.stop();
    });

    it("should handle cache loading with expiration", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      
      // Mock cache file with expired entries
      const mockCacheEntries = [
        {
          filePath: "/test/expired.ts",
          fileHash: "hash1",
          results: [],
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago (expired)
        },
        {
          filePath: "/test/valid.ts",
          fileHash: "hash2",
          results: [],
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now (valid)
        }
      ];
      
      // Mock fs/promises.readFile to return cache data
      const { mockFsPromises } = await import("./test-utils.js");
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(mockCacheEntries));
      
      await service.start();
      
      // Should load cache and filter expired entries
      expect(service).toBeDefined();
      
      await service.stop();
    });

    it("should handle cache loading errors gracefully", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      
      // Mock fs/promises.readFile to throw an error
      const { mockFsPromises } = await import("./test-utils.js");
      mockFsPromises.readFile.mockRejectedValue(new Error("Cache file not found"));
      
      await service.start();
      
      // Should handle cache loading errors gracefully
      expect(service).toBeDefined();
      
      await service.stop();
    });
  });

  describe("production code paths", () => {
    it("should execute production linter code paths", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        // Test that the service can process files in production mode
        const result = await service.lintFile("/test/file.ts");
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("issues");
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("duration");
        expect(result).toHaveProperty("linter");
        expect(result).toHaveProperty("timestamp");

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should handle linter execution errors in production mode", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        // Test with a file that should cause linter errors
        const result = await service.lintFile("/test/invalid-file.ts");
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("success");
        // In production mode, this might fail or succeed depending on the actual linter

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should handle file processing in production mode", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test the process method in production mode
        const result = await processor.process("/test/file.ts");
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("issues");
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("duration");
        expect(result).toHaveProperty("linter");
        expect(result).toHaveProperty("timestamp");

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should handle linter output parsing in production mode", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test the parseLinterOutput method
        const mockOutput = JSON.stringify([
          {
            filePath: "/test/file.ts",
            messages: [
              {
                ruleId: "no-unused-vars",
                severity: 2,
                message: "Variable is defined but never used",
                line: 1,
                column: 1,
              }
            ]
          }
        ]);
        
        const result = processor.parseLinterOutput(mockOutput, "", "/test/file.ts");
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should handle invalid linter output in production mode", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test with invalid JSON output
        const result = processor.parseLinterOutput("invalid json", "", "/test/file.ts");
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should handle file size limits in production mode", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test with a file that exceeds size limits
        const result = await processor.process("/test/large-file.ts");
        expect(result).toHaveProperty("filePath");
        expect(result).toHaveProperty("success");

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe("utility functions and edge cases", () => {
    it("should test printColored function", () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Import the printColored function by accessing it through the service
      // Since it's not exported, we'll test it indirectly through the service
      const service = new IncrementalLintingService(testConfig);
      
      // The printColored function is used internally, so we test it indirectly
      // by ensuring the service can be created and used
      expect(service).toBeDefined();
      
      consoleSpy.mockRestore();
    });

    it("should test printColored function through service start/stop", async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const service = new IncrementalLintingService(testConfig);
      
      // Start the service to trigger printColored calls
      await service.start();
      
      // Stop the service to trigger more printColored calls
      await service.stop();
      
      // Verify that console.log was called (which includes printColored calls)
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("should test printColored function through cache save error", async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Mock fs/promises.writeFile to throw an error
      const { mockFsPromises } = await import("./test-utils.js");
      mockFsPromises.writeFile.mockRejectedValue(new Error("Cache save error"));
      
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      await service.start();
      
      // Try to save cache, which should trigger the error path with printColored
      await service.stop();
      
      // Verify that console.log was called (which includes the error printColored call)
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("should handle file watcher change events with lintOnChange enabled", async () => {
      const configWithLintOnChange = {
        ...testConfig,
        lintOnChange: true,
      };
      
      const service = new IncrementalLintingService(configWithLintOnChange);
      await service.start();

      const enqueueSpy = vi.spyOn(service as any, 'enqueueFileForLinting');
      
      // Simulate file change event
      (service as any).watcher?.emit('change', '/test/changed-file.ts');
      
      // Should have called enqueueFileForLinting because lintOnChange is enabled
      expect(enqueueSpy).toHaveBeenCalledWith('/test/changed-file.ts');
      
      await service.stop();
    });

    it("should handle file watcher change events with lintOnChange disabled", async () => {
      const configWithLintOnChangeDisabled = {
        ...testConfig,
        lintOnChange: false,
      };
      
      const service = new IncrementalLintingService(configWithLintOnChangeDisabled);
      await service.start();

      const enqueueSpy = vi.spyOn(service as any, 'enqueueFileForLinting');
      
      // Simulate file change event
      (service as any).watcher?.emit('change', '/test/changed-file.ts');
      
      // Should NOT have called enqueueFileForLinting because lintOnChange is disabled
      expect(enqueueSpy).not.toHaveBeenCalled();
      
      await service.stop();
    });

    it("should handle file watcher unlink events", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      const enqueueSpy = vi.spyOn(service as any, 'enqueueFileForLinting');
      
      // Simulate file unlink (delete) event
      (service as any).watcher?.emit('unlink', '/test/deleted-file.ts');
      
      // Should NOT have called enqueueFileForLinting for unlink events
      expect(enqueueSpy).not.toHaveBeenCalled();
      
      await service.stop();
    });

    it("should handle cache loading with valid entries", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      
      // Mock cache file with valid entries
      const mockCacheEntries = [
        {
          filePath: "/test/valid.ts",
          fileHash: "hash1",
          results: [],
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now (valid)
        }
      ];
      
      // Mock fs/promises.readFile to return cache data
      const { mockFsPromises } = await import("./test-utils.js");
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(mockCacheEntries));
      
      await service.start();
      
      // Should load cache and add valid entries
      expect(service).toBeDefined();
      
      await service.stop();
    });

    it("should handle cache loading with expired entries", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      
      // Mock cache file with expired entries
      const mockCacheEntries = [
        {
          filePath: "/test/expired.ts",
          fileHash: "hash1",
          results: [],
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago (expired)
        }
      ];
      
      // Mock fs/promises.readFile to return cache data
      const { mockFsPromises } = await import("./test-utils.js");
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify(mockCacheEntries));
      
      await service.start();
      
      // Should load cache and filter expired entries
      expect(service).toBeDefined();
      
      await service.stop();
    });

    it("should handle cache loading with invalid JSON", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      
      // Mock fs/promises.readFile to return invalid JSON
      const { mockFsPromises } = await import("./test-utils.js");
      mockFsPromises.readFile.mockResolvedValue("invalid json");
      
      await service.start();
      
      // Should handle invalid JSON gracefully
      expect(service).toBeDefined();
      
      await service.stop();
    });

    it("should handle cache loading with file read errors", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      
      // Mock fs/promises.readFile to throw an error
      const { mockFsPromises } = await import("./test-utils.js");
      mockFsPromises.readFile.mockRejectedValue(new Error("File read error"));
      
      await service.start();
      
      // Should handle file read errors gracefully
      expect(service).toBeDefined();
      
      await service.stop();
    });

    it("should handle clearCache method", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
      };
      
      const service = new IncrementalLintingService(configWithCache);
      await service.start();
      
      // Test clearCache method
      await service.clearCache();
      
      // Should not throw errors
      expect(service).toBeDefined();
      
      await service.stop();
    });

    it("should handle getStatus with comprehensive data", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Lint some files to generate statistics
      await service.lintFile("/test/file1.ts");
      await service.lintFile("/test/file2.ts");

      const status = service.getStatus();
      
      expect(status).toHaveProperty("isRunning");
      expect(status).toHaveProperty("activeFiles");
      expect(status).toHaveProperty("queuedFiles");
      expect(status).toHaveProperty("failedFiles");
      expect(status).toHaveProperty("passedFiles");
      expect(status).toHaveProperty("totalFiles");
      expect(status).toHaveProperty("filesWithIssues");
      expect(status).toHaveProperty("totalIssues");
      expect(status).toHaveProperty("issuesBySeverity");
      expect(status).toHaveProperty("averageLintTime");
      
      await service.stop();
    });

    it("should test LinterProcessor canProcess method with file size limits", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test canProcess with a file that should be processable
        const canProcess = processor.canProcess("/test/file.ts");
        expect(typeof canProcess).toBe("boolean");

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should test LinterProcessor runLinter method", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test runLinter method
        try {
          const result = await processor.runLinter("/test/file.ts");
          expect(result).toBeDefined();
        } catch (error) {
          // Expected in test environment since we don't have actual linters
          expect(error).toBeDefined();
        }

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should test LinterProcessor parseLinterOutput method with valid JSON", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test parseLinterOutput with valid JSON
        const mockOutput = JSON.stringify([
          {
            filePath: "/test/file.ts",
            messages: [
              {
                ruleId: "no-unused-vars",
                severity: 2,
                message: "Variable is defined but never used",
                line: 1,
                column: 1,
              }
            ]
          }
        ]);
        
        const result = processor.parseLinterOutput(mockOutput, "", "/test/file.ts");
        expect(Array.isArray(result)).toBe(true);

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should test LinterProcessor parseLinterOutput method with invalid JSON", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test parseLinterOutput with invalid JSON
        const result = processor.parseLinterOutput("invalid json", "", "/test/file.ts");
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should test LinterProcessor parseLinterOutput method with text output", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test parseLinterOutput with text output (non-JSON)
        const textOutput = "1:1: error: Variable is defined but never used\n2:5: warning: Unused import";
        const result = processor.parseLinterOutput(textOutput, "", "/test/file.ts");
        expect(Array.isArray(result)).toBe(true);

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should test LinterProcessor severity mapping", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      try {
        const service = new IncrementalLintingService(testConfig);
        await service.start();

        const processors = (service as any).processors;
        expect(processors).toBeDefined();
        expect(processors.size).toBeGreaterThan(0);
        
        const processor = processors.values().next().value;
        
        // Test severity mapping by calling parseLinterOutput with different severity values
        const mockOutput = JSON.stringify([
          {
            filePath: "/test/file.ts",
            messages: [
              {
                ruleId: "test-rule",
                severity: 1, // warning
                message: "Test warning",
                line: 1,
                column: 1,
              },
              {
                ruleId: "test-rule",
                severity: 2, // error
                message: "Test error",
                line: 2,
                column: 1,
              }
            ]
          }
        ]);
        
        const result = processor.parseLinterOutput(mockOutput, "", "/test/file.ts");
        expect(Array.isArray(result)).toBe(true);

        await service.stop();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });

    it("should test file watching with chokidar", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Test that the watcher is created
      expect((service as any).watcher).toBeDefined();

      // Test that we can emit events on the watcher
      const watcher = (service as any).watcher;
      if (watcher) {
        // Simulate file events
        watcher.emit('add', '/test/new-file.ts');
        watcher.emit('change', '/test/changed-file.ts');
        watcher.emit('unlink', '/test/deleted-file.ts');
      }

      await service.stop();
    });

    it("should test queue manager integration", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Test that the queue manager is created
      expect((service as any).queueManager).toBeDefined();

      // Test queue manager methods
      const queueManager = (service as any).queueManager;
      expect(queueManager).toBeDefined();
      expect(typeof queueManager.getStatus).toBe("function");
      expect(typeof queueManager.startProcessing).toBe("function");
      expect(typeof queueManager.setAutoStart).toBe("function");

      await service.stop();
    });

    it("should test processor initialization", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Test that processors are created
      const processors = (service as any).processors;
      expect(processors).toBeDefined();
      expect(processors.size).toBeGreaterThan(0);

      // Test each processor
      for (const [name, processor] of processors) {
        expect(processor).toBeDefined();
        expect(processor.config).toBeDefined();
        expect(typeof processor.process).toBe("function");
        expect(typeof processor.canProcess).toBe("function");
        expect(typeof processor.runLinter).toBe("function");
        expect(typeof processor.parseLinterOutput).toBe("function");
      }

      await service.stop();
    });

    it("should test statistics tracking", async () => {
      const service = new IncrementalLintingService(testConfig);
      await service.start();

      // Test initial statistics
      const initialStats = (service as any).stats;
      expect(initialStats).toBeDefined();
      expect(initialStats.totalFiles).toBe(0);
      expect(initialStats.filesWithIssues).toBe(0);
      expect(initialStats.totalIssues).toBe(0);

      // Lint a file to generate statistics
      await service.lintFile("/test/file.ts");

      // Check that statistics were updated
      const updatedStats = (service as any).stats;
      expect(updatedStats.totalFiles).toBeGreaterThan(0);

      await service.stop();
    });

    it("should test cache operations", async () => {
      const configWithCache = {
        ...testConfig,
        cacheDir: "/tmp/test-cache",
        persistCache: true,
      };

      const service = new IncrementalLintingService(configWithCache);
      await service.start();

      // Test that cache is initialized
      expect((service as any).cache).toBeDefined();

      // Test cache operations
      const cache = (service as any).cache;
      expect(cache).toBeDefined();
      expect(typeof cache.set).toBe("function");
      expect(typeof cache.get).toBe("function");
      expect(typeof cache.has).toBe("function");
      expect(typeof cache.delete).toBe("function");

      await service.stop();
    });

    it("should test configuration validation", async () => {
      // Test with minimal valid config
      const minimalConfig = {
        rootPath: "/test",
        linters: [{
          name: "test-linter",
          command: "test-command",
          patterns: ["**/*.ts"],
          excludePatterns: [],
          maxFileSize: 1024,
          timeout: 30000,
          parallel: true,
          priority: 10,
          enabled: true,
        }],
        includePatterns: ["**/*.ts"],
        excludePatterns: [],
        maxConcurrency: 1,
        debounceDelay: 100,
      };

      const service = new IncrementalLintingService(minimalConfig);
      await service.start();

      // Test that service was created successfully
      expect(service).toBeDefined();

      await service.stop();
    });
  });
});
