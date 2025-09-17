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

  describe("promoteUnreleasedToRelease", () => {
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

      await manager.promoteUnreleasedToRelease("1.3.0", "2024-02-01");

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining("CHANGELOG.md"),
        expect.stringContaining("## [1.3.0] - 2024-02-01"),
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

      await manager.promoteUnreleasedToRelease("1.3.0", "2024-02-01");

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should handle promotion errors", async () => {
      mockReadFile.mockRejectedValue(new Error("Read error"));

      await expect(manager.promoteUnreleasedToRelease("1.3.0", "2024-02-01")).rejects.toThrow("Read error");
    });
  });

  describe("addUnreleasedEntry", () => {
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

      await manager.addUnreleasedEntry("added", "New feature X");

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining("CHANGELOG.md"),
        expect.stringContaining("New feature X"),
        "utf-8"
      );
    });

    it("should handle add entry errors", async () => {
      mockReadFile.mockRejectedValue(new Error("Read error"));

      await expect(manager.addUnreleasedEntry("added", "New feature")).rejects.toThrow("Read error");
    });
  });

  describe("validateChangelog", () => {
    it("should validate correct changelog structure", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added
- New feature

## [1.2.0] - 2024-01-15

### Added
- Feature D
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.validateChangelog();

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should detect missing unreleased section", async () => {
      const changelogContent = `# Changelog

## [1.2.0] - 2024-01-15

### Added
- Feature D
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.validateChangelog();

      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Missing [Unreleased] section");
    });

    it("should detect invalid version format", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added
- New feature

## [invalid-version] - 2024-01-15

### Added
- Feature D
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.validateChangelog();

      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Invalid version format: invalid-version");
    });

    it("should detect invalid date format", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added
- New feature

## [1.2.0] - 2024/01/15

### Added
- Feature D
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.validateChangelog();

      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Invalid date format: 2024/01/15");
    });

    it("should detect chronological order issues", async () => {
      const changelogContent = `# Changelog

## [Unreleased]

### Added
- New feature

## [1.2.0] - 2024-01-15

### Added
- Feature D

## [1.3.0] - 2024-02-01

### Added
- Feature E
`;

      mockReadFile.mockResolvedValue(changelogContent);

      const result = await manager.validateChangelog();

      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Releases are not in chronological order (newest first)");
    });

    it("should handle validation errors", async () => {
      mockReadFile.mockRejectedValue(new Error("Read error"));

      await expect(manager.validateChangelog()).rejects.toThrow("Read error");
    });
  });

  describe("displayChangelog", () => {
    it("should display changelog structure correctly", () => {
      const structure = {
        header: "# Changelog",
        unreleased: [
          { type: "added" as const, description: "New feature A" },
          { type: "added" as const, description: "New feature B" },
          { type: "fixed" as const, description: "Bug fix C" },
        ],
        releases: [
          {
            version: "1.2.0",
            date: "2024-01-15",
            entries: [{ type: "added" as const, description: "Feature D" }],
          },
        ],
      };

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      manager.displayChangelog(structure);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📚 CHANGELOG.md Structure:"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📝 Unreleased entries: 3"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📦 Versioned releases: 1"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Added: 2"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Fixed: 1"));

      consoleSpy.mockRestore();
    });

    it("should display empty changelog structure", () => {
      const structure = {
        header: "# Changelog",
        unreleased: [],
        releases: [],
      };

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      manager.displayChangelog(structure);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📝 Unreleased entries: 0"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📦 Versioned releases: 0"));

      consoleSpy.mockRestore();
    });
  });

  describe("getCurrentDate", () => {
    it("should return current date in YYYY-MM-DD format", () => {
      const date = manager.getCurrentDate();

      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Should be today's date
      const today = new Date().toISOString().split("T")[0];
      expect(date).toBe(today);
    });
  });
});
