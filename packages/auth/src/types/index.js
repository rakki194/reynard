/**
 * Authentication Types and Interfaces
 */
// Default configurations
export const DEFAULT_AUTH_CONFIG = {
  apiBaseUrl: "/api",
  loginEndpoint: "/auth/login",
  registerEndpoint: "/auth/register",
  refreshEndpoint: "/auth/refresh",
  profileEndpoint: "/auth/profile",
  tokenStorageKey: "auth_token",
  refreshTokenStorageKey: "refresh_token",
  autoRefresh: true,
  refreshThresholdMinutes: 10,
  loginRedirectPath: "/dashboard",
  logoutRedirectPath: "/login",
  enableRememberMe: true,
  sessionTimeoutMinutes: 30,
};
export const DEFAULT_VALIDATION_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  usernamePattern: /^[a-zA-Z0-9_-]{3,20}$/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
export const PASSWORD_STRENGTH_LABELS = [
  "Very Weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];
export const PASSWORD_STRENGTH_COLORS = [
  "#dc2626", // red-600
  "#ea580c", // orange-600
  "#d97706", // amber-600
  "#65a30d", // lime-600
  "#16a34a", // green-600
];
