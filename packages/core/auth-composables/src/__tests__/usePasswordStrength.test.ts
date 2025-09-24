/**
 * usePasswordStrength Tests
 * Tests for the usePasswordStrength composable
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@solidjs/testing-library";
import { usePasswordStrength } from "../usePasswordStrength";

// Mock zxcvbn
vi.mock("@zxcvbn-ts/core", () => ({
  zxcvbn: vi.fn((password: string) => {
    if (password.length < 6) {
      return {
        score: 0,
        feedback: {
          suggestions: ["Use a longer password"],
          warning: "This is a very common password",
        },
      };
    }
    if (password.length < 10) {
      return {
        score: 2,
        feedback: {
          suggestions: ["Add more characters"],
          warning: "",
        },
      };
    }
    return {
      score: 4,
      feedback: {
        suggestions: [],
        warning: "",
      },
    };
  }),
}));

describe("usePasswordStrength", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("password strength calculation", () => {
    it("should calculate strength for weak password", () => {
      const { result } = renderHook(() => usePasswordStrength("123"));

      expect(result.score()).toBe(0);
      expect(result.feedback().suggestions).toContain("Use a longer password");
    });

    it("should calculate strength for medium password", () => {
      const { result } = renderHook(() => usePasswordStrength("password123"));

      expect(result.score()).toBe(2);
      expect(result.feedback().suggestions).toContain("Add more characters");
    });

    it("should calculate strength for strong password", () => {
      const { result } = renderHook(() => usePasswordStrength("VeryStrongPassword123!"));

      expect(result.score()).toBe(4);
      expect(result.feedback().suggestions).toHaveLength(0);
    });

    it("should handle empty password", () => {
      const { result } = renderHook(() => usePasswordStrength(""));

      expect(result.score()).toBe(0);
    });
  });

  describe("strength labels", () => {
    it("should return correct label for score 0", () => {
      const { result } = renderHook(() => usePasswordStrength("123"));
      expect(result.label()).toBe("Very Weak");
    });

    it("should return correct label for score 1", () => {
      const { result } = renderHook(() => usePasswordStrength("123456"));
      expect(result.label()).toBe("Weak");
    });

    it("should return correct label for score 2", () => {
      const { result } = renderHook(() => usePasswordStrength("password123"));
      expect(result.label()).toBe("Fair");
    });

    it("should return correct label for score 3", () => {
      const { result } = renderHook(() => usePasswordStrength("Password123"));
      expect(result.label()).toBe("Good");
    });

    it("should return correct label for score 4", () => {
      const { result } = renderHook(() => usePasswordStrength("VeryStrongPassword123!"));
      expect(result.label()).toBe("Very Strong");
    });
  });

  describe("strength colors", () => {
    it("should return correct color for score 0", () => {
      const { result } = renderHook(() => usePasswordStrength("123"));
      expect(result.color()).toBe("red");
    });

    it("should return correct color for score 1", () => {
      const { result } = renderHook(() => usePasswordStrength("123456"));
      expect(result.color()).toBe("orange");
    });

    it("should return correct color for score 2", () => {
      const { result } = renderHook(() => usePasswordStrength("password123"));
      expect(result.color()).toBe("yellow");
    });

    it("should return correct color for score 3", () => {
      const { result } = renderHook(() => usePasswordStrength("Password123"));
      expect(result.color()).toBe("lightgreen");
    });

    it("should return correct color for score 4", () => {
      const { result } = renderHook(() => usePasswordStrength("VeryStrongPassword123!"));
      expect(result.color()).toBe("green");
    });
  });

  describe("validation", () => {
    it("should validate password strength", () => {
      const { result } = renderHook(() => usePasswordStrength("password123"));

      expect(result.isValid()).toBe(false); // score 2 is not >= 3
    });

    it("should validate strong password", () => {
      const { result } = renderHook(() => usePasswordStrength("VeryStrongPassword123!"));

      expect(result.isValid()).toBe(true); // score 4 is >= 3
    });
  });
});
