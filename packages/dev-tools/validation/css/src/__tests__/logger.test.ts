/**
 * 🦊 CSS Logger Tests
 * Test suite for the CSS logger functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { CSSLogger } from "../logger.js";

describe("CSSLogger", () => {
  let logger: CSSLogger;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create logger with verbose disabled by default", () => {
      logger = new CSSLogger();
      expect(logger).toBeInstanceOf(CSSLogger);
    });

    it("should create logger with verbose enabled", () => {
      logger = new CSSLogger(true);
      expect(logger).toBeInstanceOf(CSSLogger);
    });
  });

  describe("log", () => {
    it("should log message without color when no color specified", () => {
      logger = new CSSLogger();
      logger.log("Test message");

      expect(consoleSpy.log).toHaveBeenCalledWith("Test message");
    });

    it("should log message with color when color specified", () => {
      logger = new CSSLogger();
      logger.log("Test message", "red");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[31mTest message\x1b[0m");
    });
  });

  describe("error", () => {
    it("should log error message with red color and error icon", () => {
      logger = new CSSLogger();
      logger.error("Test error");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[31m❌ Test error\x1b[0m");
    });
  });

  describe("warn", () => {
    it("should log warning message with yellow color and warning icon", () => {
      logger = new CSSLogger();
      logger.warn("Test warning");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[33m⚠️  Test warning\x1b[0m");
    });
  });

  describe("info", () => {
    it("should log info message with blue color and info icon", () => {
      logger = new CSSLogger();
      logger.info("Test info");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[34mℹ️  Test info\x1b[0m");
    });
  });

  describe("success", () => {
    it("should log success message with green color and success icon", () => {
      logger = new CSSLogger();
      logger.success("Test success");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[32m✅ Test success\x1b[0m");
    });
  });

  describe("section", () => {
    it("should log section header with cyan color and bold formatting", () => {
      logger = new CSSLogger();
      logger.section("Test Section");

      expect(consoleSpy.log).toHaveBeenCalledWith("\n\x1b[1m\x1b[36mTest Section\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[36m============\x1b[0m");
    });
  });

  describe("verbose", () => {
    it("should not log when verbose is disabled", () => {
      logger = new CSSLogger(false);
      logger.verbose("Test verbose");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should log when verbose is enabled", () => {
      logger = new CSSLogger(true);
      logger.verbose("Test verbose");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍 Test verbose\x1b[0m");
    });
  });

  describe("header", () => {
    it("should log header with blue color and bold formatting", () => {
      logger = new CSSLogger();
      logger.header("Test Header");

      expect(consoleSpy.log).toHaveBeenCalledWith("\n\x1b[1m\x1b[34mTest Header\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[34m===========\x1b[0m");
    });
  });

  describe("summary", () => {
    it("should log summary with statistics", () => {
      logger = new CSSLogger();
      const stats = {
        "Total Files": 5,
        Errors: 2,
        Warnings: 1,
      };

      logger.summary(stats);

      expect(consoleSpy.log).toHaveBeenCalledWith("\n\x1b[1m\x1b[36m📊 Summary\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[36m==========\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[36m  Total Files: 5\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[36m  Errors: 2\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[36m  Warnings: 1\x1b[0m");
    });
  });

  describe("fileInfo", () => {
    it("should not log when verbose is disabled", () => {
      logger = new CSSLogger(false);
      logger.fileInfo("/test/file.css", "processing");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should log file info when verbose is enabled", () => {
      logger = new CSSLogger(true);
      logger.fileInfo("/test/file.css", "processing");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍 🔄 /test/file.css\x1b[0m");
    });

    it("should log different status icons", () => {
      logger = new CSSLogger(true);

      logger.fileInfo("/test/file.css", "completed");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍 ✅ /test/file.css\x1b[0m");

      logger.fileInfo("/test/file.css", "error");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍 ❌ /test/file.css\x1b[0m");
    });
  });

  describe("importInfo", () => {
    it("should not log when verbose is disabled", () => {
      logger = new CSSLogger(false);
      logger.importInfo("styles.css", "/path/to/styles.css", true);

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should log import info when verbose is enabled", () => {
      logger = new CSSLogger(true);
      logger.importInfo("styles.css", "/path/to/styles.css", true);

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍   ✅ styles.css → /path/to/styles.css\x1b[0m");
    });

    it("should show different status for missing files", () => {
      logger = new CSSLogger(true);
      logger.importInfo("missing.css", "/path/to/missing.css", false);

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍   ❌ missing.css → /path/to/missing.css\x1b[0m");
    });
  });

  describe("variableInfo", () => {
    it("should not log when verbose is disabled", () => {
      logger = new CSSLogger(false);
      logger.variableInfo("accent-color", 5, "definition");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should log variable info when verbose is enabled", () => {
      logger = new CSSLogger(true);
      logger.variableInfo("accent-color", 5, "definition");

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍   📝 accent-color: 5 definitions\x1b[0m");
    });

    it("should handle singular vs plural correctly", () => {
      logger = new CSSLogger(true);

      logger.variableInfo("accent-color", 1, "definition");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍   📝 accent-color: 1 definition\x1b[0m");

      logger.variableInfo("accent-color", 2, "usage");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[35m🔍   🔍 accent-color: 2 usages\x1b[0m");
    });
  });

  describe("validationResults", () => {
    it("should log successful validation results", () => {
      logger = new CSSLogger();
      logger.validationResults({
        total: 10,
        errors: 0,
        warnings: 0,
        success: true,
      });

      expect(consoleSpy.log).toHaveBeenCalledWith("\n\x1b[1m\x1b[36m🎯 Validation Results\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[36m=====================\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[32m✅ All validations passed! (10 checks)\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[34m  Total checks: 10\x1b[0m");
    });

    it("should log failed validation results", () => {
      logger = new CSSLogger();
      logger.validationResults({
        total: 10,
        errors: 2,
        warnings: 1,
        success: false,
      });

      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[31m❌ Validation failed with 2 errors and 1 warnings\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[34m  Total checks: 10\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[31m  Errors: 2\x1b[0m");
      expect(consoleSpy.log).toHaveBeenCalledWith("\x1b[33m  Warnings: 1\x1b[0m");
    });
  });
});
