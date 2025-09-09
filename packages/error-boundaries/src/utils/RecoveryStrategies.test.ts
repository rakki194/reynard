/**
 * Recovery Strategies Tests
 * Test suite for recovery strategy utilities
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  builtInRecoveryStrategies,
  getApplicableStrategies,
  executeRecoveryStrategy,
  createRecoveryStrategy,
} from "./RecoveryStrategies";
import {
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
} from "../types/ErrorTypes";
import { RecoveryActionType } from "../types/RecoveryTypes";

describe("RecoveryStrategies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create complete ErrorContext for tests
  const createTestContext = (
    overrides: Partial<ErrorContext> = {},
  ): ErrorContext => ({
    componentStack: ["TestComponent"],
    errorBoundaryId: "test-boundary-123",
    timestamp: Date.now(),
    userAgent: "test-user-agent",
    url: "http://localhost:3000/test",
    sessionId: "test-session-123",
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.UNKNOWN,
    recoverable: true,
    metadata: {},
    ...overrides,
  });

  describe("builtInRecoveryStrategies", () => {
    it("should include all expected built-in strategies", () => {
      const strategyIds = builtInRecoveryStrategies.map((s) => s.id);

      expect(strategyIds).toContain("retry");
      expect(strategyIds).toContain("fallback-ui");
      expect(strategyIds).toContain("reset");
      expect(strategyIds).toContain("redirect");
      expect(strategyIds).toContain("reload");
      expect(strategyIds).toContain("custom");
    });

    it("should have strategies with proper structure", () => {
      builtInRecoveryStrategies.forEach((strategy) => {
        expect(strategy.id).toBeDefined();
        expect(strategy.name).toBeDefined();
        expect(strategy.description).toBeDefined();
        expect(typeof strategy.canRecover).toBe("function");
        expect(typeof strategy.recover).toBe("function");
        expect(typeof strategy.priority).toBe("number");
      });
    });
  });

  describe("getApplicableStrategies", () => {
    it("should return strategies that can recover from network errors", () => {
      const networkError = new Error("Network request failed");
      const context = createTestContext({
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
      });

      const applicable = getApplicableStrategies(networkError, context);

      expect(applicable.length).toBeGreaterThan(0);
      expect(applicable.some((s) => s.id === "retry")).toBe(true);
    });

    it("should return strategies that can recover from rendering errors", () => {
      const renderingError = new Error("Component render failed");
      const context = createTestContext({
        category: ErrorCategory.RENDERING,
        severity: ErrorSeverity.HIGH,
        recoverable: true,
      });

      const applicable = getApplicableStrategies(renderingError, context);

      expect(applicable.length).toBeGreaterThan(0);
      expect(applicable.some((s) => s.id === "fallback-ui")).toBe(true);
    });

    it("should return strategies that can recover from critical errors", () => {
      const criticalError = new Error("Critical system failure");
      const context = createTestContext({
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.CRITICAL,
        recoverable: false,
      });

      const applicable = getApplicableStrategies(criticalError, context);

      expect(applicable.length).toBeGreaterThan(0);
      expect(applicable.some((s) => s.id === "redirect")).toBe(true);
    });

    it("should sort strategies by priority", () => {
      const error = new Error("Test error");
      const context = createTestContext({
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
      });

      const applicable = getApplicableStrategies(error, context);

      for (let i = 1; i < applicable.length; i++) {
        expect(applicable[i - 1].priority).toBeLessThanOrEqual(
          applicable[i].priority,
        );
      }
    });

    it("should return empty array when no strategies can recover", () => {
      const error = new Error("Test error");
      const context = createTestContext({
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.LOW,
        recoverable: false,
      });

      // Mock strategies that can't recover
      const mockStrategies = [
        {
          id: "test",
          name: "Test",
          description: "Test strategy",
          canRecover: vi.fn().mockReturnValue(false),
          recover: vi.fn(),
          priority: 1,
        },
      ];

      const applicable = getApplicableStrategies(
        error,
        context,
        mockStrategies,
      );

      expect(applicable).toHaveLength(0);
    });
  });

  describe("executeRecoveryStrategy", () => {
    it("should execute strategy and return success result", async () => {
      const mockStrategy = {
        id: "test",
        name: "Test Strategy",
        description: "Test recovery strategy",
        canRecover: vi.fn().mockReturnValue(true),
        recover: vi.fn().mockResolvedValue({
          success: true,
          action: RecoveryActionType.RETRY,
          message: "Test recovery successful",
        }),
        priority: 1,
      };

      const error = new Error("Test error");
      const context = createTestContext({ category: ErrorCategory.NETWORK });

      const result = await executeRecoveryStrategy(
        mockStrategy,
        error,
        context,
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe(RecoveryActionType.RETRY);
      expect(result.message).toBe("Test recovery successful");
      expect(mockStrategy.recover).toHaveBeenCalledWith(error, context);
    });

    it("should handle strategy execution failure", async () => {
      const mockStrategy = {
        id: "test",
        name: "Test Strategy",
        description: "Test recovery strategy",
        canRecover: vi.fn().mockReturnValue(true),
        recover: vi.fn().mockRejectedValue(new Error("Recovery failed")),
        priority: 1,
      };

      const error = new Error("Test error");
      const context = createTestContext({ category: ErrorCategory.NETWORK });

      const result = await executeRecoveryStrategy(
        mockStrategy,
        error,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.action).toBe(RecoveryActionType.CUSTOM);
      expect(result.message).toBe("Recovery strategy failed");
      expect(result.error).toBeDefined();
    });

    it("should handle strategy timeout", async () => {
      const mockStrategy = {
        id: "test",
        name: "Test Strategy",
        description: "Test recovery strategy",
        canRecover: vi.fn().mockReturnValue(true),
        recover: vi
          .fn()
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 2000)),
          ),
        priority: 1,
        timeout: 100, // 100ms timeout
      };

      const error = new Error("Test error");
      const context = createTestContext({ category: ErrorCategory.NETWORK });

      const result = await executeRecoveryStrategy(
        mockStrategy,
        error,
        context,
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Recovery strategy failed");
      expect(result.error?.message).toBe("Recovery timeout");
    });

    it("should use default timeout when not specified", async () => {
      const mockStrategy = {
        id: "test",
        name: "Test Strategy",
        description: "Test recovery strategy",
        canRecover: vi.fn().mockReturnValue(true),
        recover: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    success: true,
                    action: RecoveryActionType.RETRY,
                  }),
                2000,
              ),
            ),
        ),
        priority: 1,
        // No timeout specified
      };

      const error = new Error("Test error");
      const context = createTestContext({ category: ErrorCategory.NETWORK });

      const result = await executeRecoveryStrategy(
        mockStrategy,
        error,
        context,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.action).toBe(RecoveryActionType.RETRY);
    });
  });

  describe("createRecoveryStrategy", () => {
    it("should create a custom recovery strategy", () => {
      const canRecover = vi.fn().mockReturnValue(true);
      const recover = vi.fn().mockResolvedValue({
        success: true,
        action: RecoveryActionType.RETRY,
      });

      const strategy = createRecoveryStrategy(
        "custom-test",
        "Custom Test",
        "Custom test strategy",
        canRecover,
        recover,
        5,
        5000,
      );

      expect(strategy.id).toBe("custom-test");
      expect(strategy.name).toBe("Custom Test");
      expect(strategy.description).toBe("Custom test strategy");
      expect(strategy.canRecover).toBe(canRecover);
      expect(strategy.recover).toBe(recover);
      expect(strategy.priority).toBe(5);
      expect(strategy.timeout).toBe(5000);
    });

    it("should use default priority and timeout when not specified", () => {
      const canRecover = vi.fn().mockReturnValue(true);
      const recover = vi.fn().mockResolvedValue({
        success: true,
        action: RecoveryActionType.RETRY,
      });

      const strategy = createRecoveryStrategy(
        "custom-test",
        "Custom Test",
        "Custom test strategy",
        canRecover,
        recover,
      );

      expect(strategy.priority).toBe(5);
      expect(strategy.timeout).toBeUndefined();
    });
  });

  describe("Built-in Strategy Behavior", () => {
    it("should have retry strategy that can recover from network errors", () => {
      const retryStrategy = builtInRecoveryStrategies.find(
        (s) => s.id === "retry",
      );
      expect(retryStrategy).toBeDefined();

      const networkError = new Error("Network error");
      const networkContext = createTestContext({
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
      });

      expect(retryStrategy!.canRecover(networkError, networkContext)).toBe(
        true,
      );
    });

    it("should have fallback-ui strategy that can recover from rendering errors", () => {
      const fallbackStrategy = builtInRecoveryStrategies.find(
        (s) => s.id === "fallback-ui",
      );
      expect(fallbackStrategy).toBeDefined();

      const renderingError = new Error("Render error");
      const renderingContext = createTestContext({
        category: ErrorCategory.RENDERING,
        severity: ErrorSeverity.HIGH,
        recoverable: true,
      });

      expect(
        fallbackStrategy!.canRecover(renderingError, renderingContext),
      ).toBe(true);
    });

    it("should have redirect strategy for critical errors", () => {
      const redirectStrategy = builtInRecoveryStrategies.find(
        (s) => s.id === "redirect",
      );
      expect(redirectStrategy).toBeDefined();

      const criticalError = new Error("Critical error");
      const criticalContext = createTestContext({
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.CRITICAL,
        recoverable: false,
      });

      expect(redirectStrategy!.canRecover(criticalError, criticalContext)).toBe(
        true,
      );
    });

    it("should have reload strategy for critical errors", () => {
      const reloadStrategy = builtInRecoveryStrategies.find(
        (s) => s.id === "reload",
      );
      expect(reloadStrategy).toBeDefined();

      const criticalError = new Error("Critical error");
      const criticalContext = createTestContext({
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.CRITICAL,
        recoverable: false,
      });

      expect(reloadStrategy!.canRecover(criticalError, criticalContext)).toBe(
        true,
      );
    });
  });
});
