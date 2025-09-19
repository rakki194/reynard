import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChangelogManager } from "./changelog-manager.js";
import { readFile, writeFile } from "fs/promises";

// Mock dependencies
vi.mock("fs/promises");
vi.mock("chalk", () => ({
  default: {
    blue: (text: string) => text,
    green: (text: string) => text,
    yellow: (text: string) => text,
    cyan: (text: string) => text,
    gray: (text: string) => text,
  },
}));
vi.mock("ora", () => ({
  default: () => ({
    start: () => ({ succeed: vi.fn(), fail: vi.fn(), warn: vi.fn() }),
  }),
}));

describe("ChangelogManager", () => {
  let manager: ChangelogManager;
  const mockReadFile = vi.mocked(readFile);
  const mockWriteFile = vi.mocked(writeFile);

  beforeEach(() => {
    manager = new ChangelogManager(".");
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("readChangelog", () => {
    it("should read and parse changelog correctly", async () => {
      const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature A
- New feature B

### Changed
- Updated feature C

## [1.2.0] - 2024-01-15

### Added
- Feature D
- Feature E

### Fixed
- Bug fix F

## [1.1.0] - 2024-01-01

### Added
- Feature G
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.readChangelog();

      expect(result.header).toContain("# Changelog");
      expect(result.unreleased).toHaveLength(3);
      expect(result.unreleased[0].type).toBe("added");
      expect(result.unreleased[0].description).toBe("New feature A");
      expect(result.releases).toHaveLength(2);
      expect(result.releases[0].version).toBe("1.2.0");
      expect(result.releases[0].date).toBe("2024-01-15");
      expect(result.releases[0].entries).toHaveLength(3);
    });

    it("should handle empty changelog", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.readChangelog();

      expect(result.header).toContain("# Changelog");
      expect(result.unreleased).toHaveLength(0);
      expect(result.releases).toHaveLength(0);
    });

    it("should handle changelog with only header", async () => {
      const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.readChangelog();

      expect(result.header).toContain("# Changelog");
      expect(result.unreleased).toHaveLength(0);
      expect(result.releases).toHaveLength(0);
    });

    it("should handle file read errors", async () => {
      mockReadFile.mockRejectedValue(new Error("File not found"));

      await expect(manager.readChangelog()).rejects.toThrow("File not found");
    });
  });

  describe("promoteToVersion", () => {
    it("should promote unreleased changes to release", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added
- New feature A
- New feature B

### Fixed
- Bug fix C

## [1.2.0] - 2024-01-15

### Added
- Feature D
`;

      mockReadFile.mockResolvedValue(changelogContent);
      mockWriteFile.mockResolvedValue();

      await manager.promoteToVersion("1.3.0");

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining("CHANGELOG.md"),
        expect.stringContaining("## [1.3.0]"),
        "utf-8"
      );
    });

    it("should handle no unreleased changes", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [1.2.0] - 2024-01-15

### Added
- Feature D
`;

      mockReadFile.mockResolvedValue(changelogContent);

      await manager.promoteToVersion("1.3.0");

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should handle promotion errors", async () => {
      mockReadFile.mockRejectedValue(new Error("Read error"));

      await expect(manager.promoteToVersion("1.3.0")).rejects.toThrow("Read error");
    });
  });

  describe("addEntry", () => {
    it("should add new entry to unreleased section", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added
- Existing feature

## [1.2.0] - 2024-01-15

### Added
- Feature D
`;

      mockReadFile.mockResolvedValue(changelogContent);
      mockWriteFile.mockResolvedValue();

      await manager.addEntry({ type: "added", description: "New feature X" });

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining("CHANGELOG.md"),
        expect.stringContaining("New feature X"),
        "utf-8"
      );
    });

    it("should handle add entry errors", async () => {
      mockReadFile.mockRejectedValue(new Error("Read error"));

      await expect(manager.addEntry({ type: "added", description: "New feature" })).rejects.toThrow("Read error");
    });
  });

  describe("getCurrentVersion", () => {
    it("should return current version from changelog structure", () => {
      const structure = {
        header: "# Changelog",
        unreleased: [],
        releases: [
          {
            version: "1.2.0",
            date: "2024-01-15",
            entries: [{ type: "added" as const, description: "Feature D" }],
          },
        ],
      };

      const version = manager.getCurrentVersion(structure);

      expect(version).toBe("1.2.0");
    });

    it("should return null when no releases exist", () => {
      const structure = {
        header: "# Changelog",
        unreleased: [],
        releases: [],
      };

      const version = manager.getCurrentVersion(structure);

      expect(version).toBeNull();
    });
  });

  describe("getNextVersion", () => {
    it("should calculate next major version for breaking changes", () => {
      const nextVersion = manager.getNextVersion("1.2.0", ["breaking", "major"]);

      expect(nextVersion).toBe("2.0.0");
    });

    it("should calculate next minor version for features", () => {
      const nextVersion = manager.getNextVersion("1.2.0", ["feature", "minor"]);

      expect(nextVersion).toBe("1.3.0");
    });

    it("should calculate next patch version for fixes", () => {
      const nextVersion = manager.getNextVersion("1.2.0", ["fix", "patch"]);

      expect(nextVersion).toBe("1.2.1");
    });
  });
});
