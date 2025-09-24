/**
 * Index Tests
 * Tests for the main exports from the auth-composables package
 */

import { describe, it, expect } from "vitest";
import * as AuthComposables from "../index";

describe("Auth Composables Exports", () => {
  it("should export useAuth hook", () => {
    expect(AuthComposables.useAuth).toBeDefined();
    expect(typeof AuthComposables.useAuth).toBe("function");
  });

  it("should export usePasswordStrength hook", () => {
    expect(AuthComposables.usePasswordStrength).toBeDefined();
    expect(typeof AuthComposables.usePasswordStrength).toBe("function");
  });

  it("should export AuthProvider component", () => {
    expect(AuthComposables.AuthProvider).toBeDefined();
    expect(typeof AuthComposables.AuthProvider).toBe("function");
  });

  it("should export LoginForm component", () => {
    expect(AuthComposables.LoginForm).toBeDefined();
    expect(typeof AuthComposables.LoginForm).toBe("function");
  });

  it("should export RegisterForm component", () => {
    expect(AuthComposables.RegisterForm).toBeDefined();
    expect(typeof AuthComposables.RegisterForm).toBe("function");
  });

  it("should export PasswordStrengthMeter component", () => {
    expect(AuthComposables.PasswordStrengthMeter).toBeDefined();
    expect(typeof AuthComposables.PasswordStrengthMeter).toBe("function");
  });
});
