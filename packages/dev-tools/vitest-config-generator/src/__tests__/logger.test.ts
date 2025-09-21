/**
 * 🦊 Logger Tests
 * Tests for the VitestConfigLogger
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { VitestConfigLogger } from "../logger.js";

describe("VitestConfigLogger", () => {
  let logger: VitestConfigLogger;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    logger = new VitestConfigLogger(false);
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  describe("info", () => {
    it("should log info messages with proper prefix", () => {
      logger.info("Test info message");

      expect(consoleSpy.log).toHaveBeenCalledWith("ℹ️  Test info message");
    });

    it("should handle multiple info messages", () => {
      logger.info("First message");
      logger.info("Second message");

      expect(consoleSpy.log).toHaveBeenCalledTimes(2);
      expect(consoleSpy.log).toHaveBeenNthCalledWith(1, "ℹ️  First message");
      expect(consoleSpy.log).toHaveBeenNthCalledWith(2, "ℹ️  Second message");
    });
  });

  describe("warn", () => {
    it("should log warning messages with proper prefix", () => {
      logger.warn("Test warning message");

      expect(consoleSpy.warn).toHaveBeenCalledWith("⚠️  Test warning message");
    });
  });

  describe("error", () => {
    it("should log error messages with proper prefix", () => {
      logger.error("Test error message");

      expect(consoleSpy.error).toHaveBeenCalledWith("❌ Test error message");
    });
  });

  describe("debug", () => {
    it("should not log debug messages when verbose is false", () => {
      logger.debug("Test debug message");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should log debug messages when verbose is true", () => {
      logger.setVerbose(true);
      logger.debug("Test debug message");

      expect(consoleSpy.log).toHaveBeenCalledWith("🔍 Test debug message");
    });

    it("should toggle verbose mode", () => {
      logger.setVerbose(true);
      logger.debug("Debug message 1");

      logger.setVerbose(false);
      logger.debug("Debug message 2");

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith("🔍 Debug message 1");
    });
  });

  describe("constructor", () => {
    it("should initialize with verbose false by default", () => {
      const newLogger = new VitestConfigLogger();
      newLogger.debug("Should not appear");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should initialize with verbose true when specified", () => {
      const newLogger = new VitestConfigLogger(true);
      newLogger.debug("Should appear");

      expect(consoleSpy.log).toHaveBeenCalledWith("🔍 Should appear");
    });
  });
});
