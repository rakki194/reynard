/**
 * usePasswordStrength Hook Tests
 * Tests for the usePasswordStrength SolidJS composable
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@solidjs/testing-library";
import { usePasswordStrength } from "../usePasswordStrength";

// Mock zxcvbn
vi.mock("zxcvbn", () => ({
  default: vi.fn((password: string) => {
    if (password.length < 6) {
      return { score: 0, feedback: { suggestions: ["Use at least 8 characters"] } };
    }
    if (password.length < 8) {
      return { score: 1, feedback: { suggestions: ["Use at least 8 characters"] } };
    }
    if (password === "password123") {
      return { score: 2, feedback: { suggestions: ["Avoid common passwords"] } };
    }
    if (password === "StrongP@ssw0rd!") {
      return { score: 4, feedback: { suggestions: [] } };
    }
    return { score: 3, feedback: { suggestions: [] } };
  }),
}));

describe("usePasswordStrength", () => {
  it("should return password strength analysis", () => {
    const { result } = renderHook(() => usePasswordStrength(() => "test"));

    expect(result).toBeDefined();
    expect(result.strength).toBeDefined();
    expect(result.strengthLabel).toBeDefined();
    expect(result.strengthColor).toBeDefined();
    expect(result.strengthProgress).toBeDefined();
    expect(result.isAcceptable).toBeDefined();
    expect(result.feedback).toBeDefined();
    expect(result.requirements).toBeDefined();
    expect(result.refresh).toBeDefined();
  });

  it("should analyze weak passwords", () => {
    const { result } = renderHook(() => usePasswordStrength(() => "123"));

    expect(result.strength().score).toBe(0);
    expect(result.strengthLabel()).toBe("Very Weak");
    expect(result.isAcceptable()).toBe(false);
  });

  it("should analyze medium passwords", () => {
    const { result } = renderHook(() => usePasswordStrength(() => "password123"));

    expect(result.strength().score).toBe(3);
    expect(result.strengthLabel()).toBe("Good");
    expect(result.isAcceptable()).toBe(true);
  });

  it("should analyze strong passwords", () => {
    const { result } = renderHook(() => usePasswordStrength(() => "StrongP@ssw0rd!"));

    expect(result.strength().score).toBe(5);
    expect(result.strengthLabel()).toBe("Unknown");
    expect(result.isAcceptable()).toBe(true);
  });

  it("should provide feedback suggestions", () => {
    const { result } = renderHook(() => usePasswordStrength(() => "123"));

    expect(result.feedback()).toBeDefined();
    expect(result.strength().suggestions).toContain("Use at least 8 characters");
  });
});