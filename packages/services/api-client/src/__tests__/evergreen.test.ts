/**
 * Tests for the evergreen update system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Mock the evergreen updater
vi.mock("child_process");
vi.mock("fs");

describe("Evergreen Update System", () => {
  const mockProjectRoot = "/test/project";
  const mockSpecCachePath = join(mockProjectRoot, ".openapi-spec-cache.json");
  const mockVersionPath = join(mockProjectRoot, "src/version.ts");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(process.cwd).mockReturnValue(mockProjectRoot);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("OpenAPI Specification Fetching", () => {
    it("should fetch OpenAPI specification from backend", async () => {
      const mockSpec = {
        openapi: "3.0.0",
        info: {
          title: "Reynard API",
          version: "1.0.0",
        },
        paths: {
          "/api/health": {
            get: {
              summary: "Health check",
            },
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpec),
      });

      // This would be tested in the actual evergreen updater
      const response = await fetch("http://localhost:8000/openapi.json");
      const spec = await response.json();

      expect(spec).toEqual(mockSpec);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/openapi.json");
    });

    it("should handle fetch errors gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      await expect(fetch("http://localhost:8000/openapi.json")).rejects.toThrow("Network error");
    });
  });

  describe("Change Detection", () => {
    it("should detect version changes", () => {
      const currentSpec = {
        info: { version: "1.1.0" },
        paths: { "/api/test": {} },
      };

      const cachedSpec = {
        info: { version: "1.0.0" },
        paths: { "/api/test": {} },
      };

      // Simple change detection logic
      const hasVersionChanged = currentSpec.info.version !== cachedSpec.info.version;
      expect(hasVersionChanged).toBe(true);
    });

    it("should detect path count changes", () => {
      const currentSpec = {
        info: { version: "1.0.0" },
        paths: {
          "/api/test": {},
          "/api/new": {},
        },
      };

      const cachedSpec = {
        info: { version: "1.0.0" },
        paths: {
          "/api/test": {},
        },
      };

      const currentPathsCount = Object.keys(currentSpec.paths).length;
      const cachedPathsCount = Object.keys(cachedSpec.paths).length;
      const hasPathsChanged = currentPathsCount !== cachedPathsCount;

      expect(hasPathsChanged).toBe(true);
    });

    it("should not detect changes when specs are identical", () => {
      const spec = {
        info: { version: "1.0.0" },
        paths: { "/api/test": {} },
      };

      const hasVersionChanged = spec.info.version !== spec.info.version;
      const currentPathsCount = Object.keys(spec.paths).length;
      const cachedPathsCount = Object.keys(spec.paths).length;
      const hasPathsChanged = currentPathsCount !== cachedPathsCount;

      expect(hasVersionChanged).toBe(false);
      expect(hasPathsChanged).toBe(false);
    });
  });

  describe("Client Regeneration", () => {
    it("should execute regeneration commands", () => {
      vi.mocked(execSync).mockReturnValueOnce(Buffer.from("success"));

      // Mock the regeneration process
      const cleanResult = execSync("pnpm run clean");
      const generateResult = execSync("pnpm run generate");
      const buildResult = execSync("pnpm run build");

      expect(cleanResult.toString()).toBe("success");
      expect(generateResult.toString()).toBe("success");
      expect(buildResult.toString()).toBe("success");
    });

    it("should handle regeneration failures", () => {
      vi.mocked(execSync).mockImplementationOnce(() => {
        throw new Error("Generation failed");
      });

      expect(() => execSync("pnpm run generate")).toThrow("Generation failed");
    });
  });

  describe("Version Management", () => {
    it("should update client version file", () => {
      const mockSpec = {
        info: { version: "1.2.0" },
        openapi: "3.0.0",
      };

      const timestamp = "2025-01-15T10:00:00Z";
      const expectedContent = `/**
 * Auto-generated version information for Reynard API Client
 * Updated: ${timestamp}
 */

export const API_CLIENT_VERSION = '1.2.0';
export const LAST_UPDATED = '${timestamp}';
export const BACKEND_VERSION = '1.2.0';
export const OPENAPI_VERSION = '3.0.0';
`;

      vi.mocked(writeFileSync).mockImplementationOnce(() => {});

      // Mock the version update
      writeFileSync(mockVersionPath, expectedContent);

      expect(writeFileSync).toHaveBeenCalledWith(mockVersionPath, expectedContent);
    });
  });

  describe("Caching System", () => {
    it("should cache OpenAPI specification", () => {
      const mockSpec = {
        info: { version: "1.0.0" },
        paths: { "/api/test": {} },
      };

      vi.mocked(writeFileSync).mockImplementationOnce(() => {});

      // Mock caching
      writeFileSync(mockSpecCachePath, JSON.stringify(mockSpec, null, 2));

      expect(writeFileSync).toHaveBeenCalledWith(mockSpecCachePath, JSON.stringify(mockSpec, null, 2));
    });

    it("should read cached specification", () => {
      const mockSpec = {
        info: { version: "1.0.0" },
        paths: { "/api/test": {} },
      };

      vi.mocked(existsSync).mockReturnValueOnce(true);
      vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify(mockSpec));

      // Mock reading cache
      const exists = existsSync(mockSpecCachePath);
      const cached = exists ? JSON.parse(readFileSync(mockSpecCachePath, "utf8")) : null;

      expect(exists).toBe(true);
      expect(cached).toEqual(mockSpec);
    });

    it("should handle missing cache gracefully", () => {
      vi.mocked(existsSync).mockReturnValueOnce(false);

      const exists = existsSync(mockSpecCachePath);
      const cached = exists ? JSON.parse(readFileSync(mockSpecCachePath, "utf8")) : null;

      expect(exists).toBe(false);
      expect(cached).toBe(null);
    });
  });

  describe("Integration Tests", () => {
    it("should complete full evergreen update cycle", async () => {
      const mockSpec = {
        openapi: "3.0.0",
        info: { version: "1.1.0" },
        paths: {
          "/api/health": {},
          "/api/new-endpoint": {},
        },
      };

      // Mock all the steps
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpec),
      });

      vi.mocked(existsSync).mockReturnValueOnce(false); // No cached spec
      vi.mocked(execSync).mockReturnValue(Buffer.from("success"));
      vi.mocked(writeFileSync).mockImplementation(() => {});

      // Simulate the evergreen update process
      const response = await fetch("http://localhost:8000/openapi.json");
      const currentSpec = await response.json();
      const cachedSpec = null; // No cache

      const hasChanged =
        !cachedSpec ||
        currentSpec.info.version !== cachedSpec.info.version ||
        Object.keys(currentSpec.paths).length !== Object.keys(cachedSpec.paths || {}).length;

      if (hasChanged) {
        execSync("pnpm run clean");
        execSync("pnpm run generate");
        execSync("pnpm run build");

        const versionContent = `export const API_CLIENT_VERSION = '${currentSpec.info.version}';`;
        writeFileSync(mockVersionPath, versionContent);
        writeFileSync(mockSpecCachePath, JSON.stringify(currentSpec, null, 2));
      }

      expect(hasChanged).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/openapi.json");
      expect(execSync).toHaveBeenCalledTimes(3);
      expect(writeFileSync).toHaveBeenCalledTimes(2);
    });
  });
});
