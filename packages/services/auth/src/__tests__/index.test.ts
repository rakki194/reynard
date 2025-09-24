/**
 * Auth Package Index Tests
 * Tests for the main exports from the auth package
 */

import { describe, it, expect } from "vitest";
import * as AuthPackage from "../index";

describe("Auth Package Exports", () => {
  it("should export useAuth hook", () => {
    expect(AuthPackage.useAuth).toBeDefined();
    expect(typeof AuthPackage.useAuth).toBe("function");
  });

  it("should export usePasswordStrength hook", () => {
    expect(AuthPackage.usePasswordStrength).toBeDefined();
    expect(typeof AuthPackage.usePasswordStrength).toBe("function");
  });

  it("should export AuthProvider component", () => {
    expect(AuthPackage.AuthProvider).toBeDefined();
    expect(typeof AuthPackage.AuthProvider).toBe("function");
  });

  it("should export LoginForm component", () => {
    expect(AuthPackage.LoginForm).toBeDefined();
    expect(typeof AuthPackage.LoginForm).toBe("function");
  });

  it("should export RegisterForm component", () => {
    expect(AuthPackage.RegisterForm).toBeDefined();
    expect(typeof AuthPackage.RegisterForm).toBe("function");
  });

  it("should export PasswordStrengthMeter component", () => {
    expect(AuthPackage.PasswordStrengthMeter).toBeDefined();
    expect(typeof AuthPackage.PasswordStrengthMeter).toBe("function");
  });

  it("should export core types and utilities", () => {
    expect(AuthPackage.DEFAULT_AUTH_CONFIG).toBeDefined();
    expect(AuthPackage.TokenManager).toBeDefined();
    expect(AuthPackage.createAuthClient).toBeDefined();
    expect(AuthPackage.createAuthOrchestrator).toBeDefined();
  });
});
