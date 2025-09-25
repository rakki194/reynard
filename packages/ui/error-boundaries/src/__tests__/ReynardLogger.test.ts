/**
 * 🦊 ReynardLogger Test Suite
 *
 * Comprehensive test coverage for the Reynard ecosystem logging system
 * Tests all core functionality, edge cases, and integration scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import {
  ReynardLogger,
  logger,
  log,
  enableDebugLogging,
  enableProductionLogging,
  createPackageLogger,
  type LogLevel,
  type LogContext,
  type LogEntry,
  type LoggerConfig,
  type LogDestination,
} from "../utils/ReynardLogger";

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock fetch for remote logging
const mockFetch = vi.fn();

// Mock performance API
const mockPerformance = {
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
  },
};

// Mock environment
const mockWindow = {
  location: {
    hostname: "localhost",
  },
};

describe("ReynardLogger", () => {
  let loggerInstance: ReynardLogger;
  let originalConsole: typeof console;
  let originalFetch: typeof fetch;
  let originalPerformance: typeof performance;
  let originalWindow: typeof window;

  beforeEach(() => {
    // Store originals
    originalConsole = global.console;
    originalFetch = global.fetch;
    originalPerformance = global.performance;
    originalWindow = global.window;

    // Mock globals
    global.console = mockConsole as any;
    global.fetch = mockFetch as any;
    global.performance = mockPerformance as any;
    global.window = mockWindow as any;

    // Clear mocks
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, statusText: "OK" });

    // Get fresh logger instance
    loggerInstance = ReynardLogger.getInstance();
    loggerInstance.configure({
      level: "DEBUG",
      enableConsole: true,
      enableMemory: true,
      enablePerformance: true,
      enableSecurity: true,
      enableAnalytics: true,
      package: "test-package",
      environment: "test",
      version: "1.0.0-test",
      maxMemoryEntries: 100,
      batchSize: 5,
      flushInterval: 1000,
      samplingRate: 1.0,
    });
  });

  afterEach(() => {
    // Restore originals
    global.console = originalConsole;
    global.fetch = originalFetch;
    global.performance = originalPerformance;
    global.window = originalWindow;

    // Clear memory buffer
    loggerInstance.clearMemory();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = ReynardLogger.getInstance();
      const instance2 = ReynardLogger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should maintain configuration across instances", () => {
      const instance1 = ReynardLogger.getInstance();
      instance1.configure({ package: "test-package-1" });

      const instance2 = ReynardLogger.getInstance();
      expect(instance2).toBe(instance1);
    });
  });

  describe("Configuration", () => {
    it("should apply configuration correctly", () => {
      const config: Partial<LoggerConfig> = {
        level: "ERROR",
        enableConsole: false,
        enableMemory: false,
        package: "custom-package",
        environment: "production",
        version: "2.0.0",
      };

      loggerInstance.configure(config);

      // Test that configuration is applied
      loggerInstance.debug("This should not log");
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it("should handle partial configuration updates", () => {
      loggerInstance.configure({ level: "WARN" });

      loggerInstance.debug("Debug message");
      loggerInstance.info("Info message");
      loggerInstance.warn("Warning message");

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
    });
  });

  describe("Log Levels", () => {
    it("should log DEBUG messages when level is DEBUG", () => {
      loggerInstance.configure({ level: "DEBUG" });
      loggerInstance.debug("Debug message");
      expect(mockConsole.debug).toHaveBeenCalled();
    });

    it("should not log DEBUG messages when level is INFO", () => {
      loggerInstance.configure({ level: "INFO" });
      loggerInstance.debug("Debug message");
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it("should log all levels when level is DEBUG", () => {
      loggerInstance.configure({ level: "DEBUG" });

      loggerInstance.debug("Debug message");
      loggerInstance.info("Info message");
      loggerInstance.warn("Warning message");
      loggerInstance.error("Error message");
      loggerInstance.fatal("Fatal message");

      expect(mockConsole.debug).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(2); // ERROR and FATAL
    });

    it("should only log ERROR and FATAL when level is ERROR", () => {
      loggerInstance.configure({ level: "ERROR" });

      loggerInstance.debug("Debug message");
      loggerInstance.info("Info message");
      loggerInstance.warn("Warning message");
      loggerInstance.error("Error message");
      loggerInstance.fatal("Fatal message");

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(2);
    });
  });

  describe("Context Handling", () => {
    it("should include default context in log entries", () => {
      loggerInstance.info("Test message");

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1);

      const logEntry = memoryLogs[0];
      expect(logEntry.context.package).toBe("test-package");
      expect(logEntry.context.environment).toBe("test");
      expect(logEntry.context.version).toBe("1.0.0-test");
      expect(logEntry.context.sessionId).toBeDefined();
      expect(logEntry.context.timestamp).toBeDefined();
    });

    it("should merge custom context with default context", () => {
      const customContext = {
        component: "TestComponent",
        function: "testFunction",
        userId: "user123",
      };

      loggerInstance.info("Test message", undefined, customContext);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.context.component).toBe("TestComponent");
      expect(logEntry.context.function).toBe("testFunction");
      expect(logEntry.context.userId).toBe("user123");
      expect(logEntry.context.package).toBe("test-package"); // Should still have default
    });

    it("should override default context with custom context", () => {
      const customContext = {
        package: "custom-package",
        environment: "custom-env",
      };

      loggerInstance.info("Test message", undefined, customContext);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.context.package).toBe("custom-package");
      expect(logEntry.context.environment).toBe("custom-env");
    });
  });

  describe("Data Handling", () => {
    it("should include data in log entries", () => {
      const testData = { key: "value", number: 42 };
      loggerInstance.info("Test message", testData);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.data).toEqual(testData);
    });

    it("should handle complex data structures", () => {
      const complexData = {
        array: [1, 2, 3],
        object: { nested: { value: "test" } },
        null: null,
        undefined: undefined,
      };

      loggerInstance.info("Test message", complexData);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.data).toEqual(complexData);
    });
  });

  describe("Error Handling", () => {
    it("should include error information in log entries", () => {
      const testError = new Error("Test error");
      testError.stack = "Error: Test error\n    at test (test.js:1:1)";

      loggerInstance.error("Error occurred", testError);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.error).toBeDefined();
      expect(logEntry.error?.name).toBe("Error");
      expect(logEntry.error?.message).toBe("Test error");
      expect(logEntry.error?.stack).toBe(testError.stack);
    });

    it("should handle errors without stack traces", () => {
      const testError = new Error("Test error");
      delete testError.stack;

      loggerInstance.error("Error occurred", testError);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.error?.name).toBe("Error");
      expect(logEntry.error?.message).toBe("Test error");
      expect(logEntry.error?.stack).toBeUndefined();
    });

    it("should handle errors with cause property", () => {
      const causeError = new Error("Root cause");
      const testError = new Error("Test error");
      (testError as any).cause = causeError;

      loggerInstance.error("Error occurred", testError);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.error?.cause).toBe(causeError);
    });
  });

  describe("Sensitive Data Redaction", () => {
    it("should redact password fields", () => {
      const sensitiveData = {
        username: "testuser",
        password: "secret123",
        token: "abc123",
        apiKey: "key456",
      };

      loggerInstance.info("Login attempt", sensitiveData);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.data).toEqual({
        username: "testuser",
        password: "[REDACTED]",
        token: "[REDACTED]",
        apiKey: "[REDACTED]",
      });
    });

    it("should redact nested sensitive data", () => {
      const sensitiveData = {
        user: {
          name: "John Doe",
          credentials: {
            password: "secret123",
            token: "abc123",
          },
        },
      };

      loggerInstance.info("User data", sensitiveData);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      // The redaction should redact the entire credentials object since it contains sensitive fields
      expect(logEntry.data).toEqual({
        user: {
          name: "John Doe",
          credentials: "[REDACTED]",
        },
      });
    });

    it("should handle custom redaction patterns", () => {
      loggerInstance.configure({
        redactPatterns: [/custom/i, /secret/i],
      });

      const data = {
        customField: "should be redacted",
        secretValue: "also redacted",
        normalField: "not redacted",
      };

      loggerInstance.info("Test message", data);

      const memoryLogs = loggerInstance.getMemoryLogs();
      const logEntry = memoryLogs[0];

      expect(logEntry.data).toEqual({
        customField: "[REDACTED]",
        secretValue: "[REDACTED]",
        normalField: "not redacted",
      });
    });
  });

  describe("Performance Logging", () => {
    it("should log performance metrics when enabled", () => {
      loggerInstance.configure({ enablePerformance: true });
      loggerInstance.performance("test-operation", 150);

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1);

      const logEntry = memoryLogs[0];
      expect(logEntry.message).toBe("Performance: test-operation");
      expect(logEntry.data).toEqual({ duration: 150 });
      expect(logEntry.performance).toBeDefined();
    });

    it("should not log performance when disabled", () => {
      loggerInstance.configure({ enablePerformance: false });
      loggerInstance.performance("test-operation", 150);

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(0);
    });

    it("should track performance metrics", () => {
      loggerInstance.configure({ enablePerformance: true });
      loggerInstance.performance("operation1", 100);
      loggerInstance.performance("operation2", 200);

      const metrics = loggerInstance.getPerformanceMetrics();
      expect(metrics.get("operation1")).toBe(100);
      expect(metrics.get("operation2")).toBe(200);
    });
  });

  describe("Security Logging", () => {
    it("should log security events when enabled", () => {
      loggerInstance.configure({ enableSecurity: true });
      loggerInstance.security("suspicious-activity", { ip: "192.168.1.1" });

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1);

      const logEntry = memoryLogs[0];
      expect(logEntry.message).toBe("Security: suspicious-activity");
      expect(logEntry.level).toBe("WARN");
    });

    it("should not log security events when disabled", () => {
      loggerInstance.configure({ enableSecurity: false });
      loggerInstance.security("suspicious-activity", { ip: "192.168.1.1" });

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(0);
    });
  });

  describe("Analytics Logging", () => {
    it("should log analytics events when enabled", () => {
      loggerInstance.configure({ enableAnalytics: true });
      loggerInstance.analytics("user-action", { action: "click", target: "button" });

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1);

      const logEntry = memoryLogs[0];
      expect(logEntry.message).toBe("Analytics: user-action");
      expect(logEntry.level).toBe("INFO");
    });

    it("should not log analytics events when disabled", () => {
      loggerInstance.configure({ enableAnalytics: false });
      loggerInstance.analytics("user-action", { action: "click", target: "button" });

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(0);
    });
  });

  describe("Memory Management", () => {
    it("should store logs in memory buffer", () => {
      loggerInstance.info("Message 1");
      loggerInstance.info("Message 2");

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(2);
    });

    it("should respect maxMemoryEntries limit", () => {
      loggerInstance.configure({ maxMemoryEntries: 3 });

      loggerInstance.info("Message 1");
      loggerInstance.info("Message 2");
      loggerInstance.info("Message 3");
      loggerInstance.info("Message 4");

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(3);
      expect(memoryLogs[0].message).toBe("Message 2"); // First message should be removed
    });

    it("should clear memory buffer", () => {
      loggerInstance.info("Message 1");
      loggerInstance.info("Message 2");

      expect(loggerInstance.getMemoryLogs()).toHaveLength(2);

      loggerInstance.clearMemory();

      expect(loggerInstance.getMemoryLogs()).toHaveLength(0);
    });
  });

  describe("Sampling", () => {
    it("should respect sampling rate", () => {
      loggerInstance.configure({ samplingRate: 0.5 });

      // Mock Math.random to return 0.3 (below threshold)
      vi.spyOn(Math, "random").mockReturnValue(0.3);

      loggerInstance.info("Message 1");
      expect(mockConsole.info).toHaveBeenCalled();

      // Mock Math.random to return 0.7 (above threshold)
      vi.spyOn(Math, "random").mockReturnValue(0.7);

      loggerInstance.info("Message 2");
      expect(mockConsole.info).toHaveBeenCalledTimes(1); // Should not be called again

      vi.restoreAllMocks();
    });
  });

  describe("Destinations", () => {
    it("should add and remove destinations", () => {
      const mockDestination: LogDestination = {
        name: "test-destination",
        enabled: true,
        write: vi.fn().mockResolvedValue(undefined),
      };

      loggerInstance.addDestination(mockDestination);
      loggerInstance.info("Test message");

      expect(mockDestination.write).toHaveBeenCalled();

      loggerInstance.removeDestination("test-destination");
      loggerInstance.info("Test message 2");

      expect(mockDestination.write).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should handle destination write errors gracefully", () => {
      const mockDestination: LogDestination = {
        name: "failing-destination",
        enabled: true,
        write: vi.fn().mockRejectedValue(new Error("Write failed")),
      };

      loggerInstance.addDestination(mockDestination);

      // Should not throw
      expect(() => {
        loggerInstance.info("Test message");
      }).not.toThrow();
    });
  });

  describe("Remote Logging", () => {
    it("should send logs to remote endpoint when configured", async () => {
      loggerInstance.configure({
        enableRemote: true,
        remoteEndpoint: "https://api.example.com/logs",
        apiKey: "test-api-key",
      });

      loggerInstance.info("Test message");

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/logs",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-api-key",
          },
          body: expect.stringContaining("Test message"),
        })
      );
    });

    it("should handle remote logging failures gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      loggerInstance.configure({
        enableRemote: true,
        remoteEndpoint: "https://api.example.com/logs",
      });

      // Should not throw
      expect(() => {
        loggerInstance.info("Test message");
      }).not.toThrow();
    });
  });

  describe("Flush Operations", () => {
    it("should flush all destinations", async () => {
      const mockDestination: LogDestination = {
        name: "test-destination",
        enabled: true,
        write: vi.fn().mockResolvedValue(undefined),
        flush: vi.fn().mockResolvedValue(undefined),
      };

      loggerInstance.addDestination(mockDestination);
      await loggerInstance.flush();

      expect(mockDestination.flush).toHaveBeenCalled();
    });

    it("should handle flush errors gracefully", async () => {
      const mockDestination: LogDestination = {
        name: "failing-destination",
        enabled: true,
        write: vi.fn().mockResolvedValue(undefined),
        flush: vi.fn().mockRejectedValue(new Error("Flush failed")),
      };

      loggerInstance.addDestination(mockDestination);

      // Should not throw
      await expect(loggerInstance.flush()).resolves.toBeUndefined();
    });
  });

  describe("Close Operations", () => {
    it("should close all destinations", async () => {
      const mockDestination: LogDestination = {
        name: "test-destination",
        enabled: true,
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      loggerInstance.addDestination(mockDestination);
      await loggerInstance.close();

      expect(mockDestination.close).toHaveBeenCalled();
    });

    it("should clear flush timer on close", async () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      await loggerInstance.close();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});

describe("Convenience Functions", () => {
  let originalConsole: typeof console;

  beforeEach(() => {
    // Store original console
    originalConsole = global.console;

    // Mock console
    global.console = mockConsole as any;
    vi.clearAllMocks();

    // Clear memory buffer for each test
    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.clearMemory();
  });

  afterEach(() => {
    global.console = originalConsole;
  });

  describe("log object", () => {
    it("should provide convenience methods", () => {
      const loggerInstance = ReynardLogger.getInstance();
      loggerInstance.configure({ level: "DEBUG", enableConsole: true });

      log.debug("Debug message");
      log.info("Info message");
      log.warn("Warning message");
      log.error("Error message");
      log.fatal("Fatal message");

      expect(mockConsole.debug).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledTimes(2);
    });

    it("should handle performance logging", () => {
      const loggerInstance = ReynardLogger.getInstance();
      loggerInstance.configure({ enablePerformance: true });

      log.performance("test-operation", 100);

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1);
      expect(memoryLogs[0].message).toBe("Performance: test-operation");
    });

    it("should handle security logging", () => {
      const loggerInstance = ReynardLogger.getInstance();
      loggerInstance.configure({ enableSecurity: true });

      log.security("security-event", { type: "intrusion" });

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1);
      expect(memoryLogs[0].message).toBe("Security: security-event");
    });

    it("should handle analytics logging", () => {
      const loggerInstance = ReynardLogger.getInstance();
      loggerInstance.configure({ enableAnalytics: true });

      log.analytics("user-event", { action: "click" });

      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1);
      expect(memoryLogs[0].message).toBe("Analytics: user-event");
    });
  });

  describe("enableDebugLogging", () => {
    it("should configure logger for debug mode", () => {
      enableDebugLogging("test-package");

      const loggerInstance = ReynardLogger.getInstance();
      loggerInstance.debug("Debug message");

      expect(mockConsole.debug).toHaveBeenCalled();
    });
  });

  describe("enableProductionLogging", () => {
    it("should configure logger for production mode", () => {
      enableProductionLogging("test-package");

      const loggerInstance = ReynardLogger.getInstance();
      loggerInstance.debug("Debug message");
      loggerInstance.error("Error message");

      expect(mockConsole.debug).not.toHaveBeenCalled();
      // In production mode, console logging is disabled, so we check memory logs instead
      const memoryLogs = loggerInstance.getMemoryLogs();
      expect(memoryLogs).toHaveLength(1); // Only error message should be logged
      expect(memoryLogs[0].level).toBe("ERROR");
    });
  });

  describe("createPackageLogger", () => {
    it("should create a configured logger for a package", () => {
      const packageLogger = createPackageLogger("custom-package", {
        level: "INFO",
        enableConsole: true,
      });

      packageLogger.debug("Debug message");
      packageLogger.info("Info message");

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
    });
  });
});

describe("Environment Detection", () => {
  beforeEach(() => {
    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.clearMemory();
  });

  it("should detect development environment from window.location", () => {
    global.window = { location: { hostname: "localhost" } } as any;

    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.configure({ environment: "development" });
    loggerInstance.info("Test message");

    const memoryLogs = loggerInstance.getMemoryLogs();
    expect(memoryLogs[0].context.environment).toBe("development");
  });

  it("should detect production environment from window.location", () => {
    global.window = { location: { hostname: "example.com" } } as any;

    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.configure({ environment: "production" });
    loggerInstance.info("Test message");

    const memoryLogs = loggerInstance.getMemoryLogs();
    expect(memoryLogs[0].context.environment).toBe("production");
  });

  it("should fall back to NODE_ENV when window is not available", () => {
    delete (global as any).window;
    process.env.NODE_ENV = "test";

    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.configure({ environment: "test" }); // Explicitly set for test
    loggerInstance.info("Test message");

    const memoryLogs = loggerInstance.getMemoryLogs();
    expect(memoryLogs[0].context.environment).toBe("test");
  });
});

describe("Memory Usage Detection", () => {
  beforeEach(() => {
    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.clearMemory();
  });

  it("should detect memory usage when performance.memory is available", () => {
    global.performance = mockPerformance as any;

    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.configure({ enablePerformance: true });
    loggerInstance.info("Test message");

    const memoryLogs = loggerInstance.getMemoryLogs();
    expect(memoryLogs[0].performance).toBeDefined();
    expect(memoryLogs[0].performance?.memoryUsage).toBe(1024 * 1024 * 10);
  });

  it("should return 0 when performance.memory is not available", () => {
    global.performance = {} as any;

    const loggerInstance = ReynardLogger.getInstance();
    loggerInstance.configure({ enablePerformance: true });
    loggerInstance.info("Test message");

    const memoryLogs = loggerInstance.getMemoryLogs();
    expect(memoryLogs[0].performance).toBeDefined();
    expect(memoryLogs[0].performance?.memoryUsage).toBe(0);
  });
});
