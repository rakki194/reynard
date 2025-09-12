/**
 * Authentication Types and Interfaces
 *
 * Note: These types will be replaced with generated types from the API client
 * once the backend auth system is fully integrated.
 */

export interface User {
  /** Unique user identifier */
  id: string;
  /** Username */
  username: string;
  /** Email address */
  email?: string;
  /** Full name */
  fullName?: string;
  /** User role */
  role: UserRole;
  /** Avatar URL */
  avatarUrl?: string;
  /** Account creation date */
  createdAt: Date;
  /** Last login date */
  lastLogin?: Date;
  /** Whether user is active */
  isActive: boolean;
  /** User preferences */
  preferences?: UserPreferences;
  /** User profile data */
  profile?: UserProfile;
}

export type UserRole = "admin" | "user" | "guest" | "moderator";

export interface UserProfile {
  /** Bio or description */
  bio?: string;
  /** Location */
  location?: string;
  /** Website URL */
  website?: string;
  /** Social media links */
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  /** User tags or skills */
  tags?: string[];
  /** Public contact info */
  publicContact?: {
    email?: string;
    phone?: string;
  };
}

export interface UserPreferences {
  /** UI theme preference */
  theme?: "light" | "dark" | "auto";
  /** Language preference */
  language?: string;
  /** Timezone */
  timezone?: string;
  /** Notification settings */
  notifications?: NotificationSettings;
  /** Privacy settings */
  privacy?: PrivacySettings;
}

export interface NotificationSettings {
  /** Email notifications enabled */
  email: boolean;
  /** Push notifications enabled */
  push: boolean;
  /** In-app notifications enabled */
  inApp: boolean;
  /** Specific notification types */
  types?: {
    security: boolean;
    updates: boolean;
    mentions: boolean;
    messages: boolean;
  };
}

export interface PrivacySettings {
  /** Profile visibility */
  profileVisibility: "public" | "private" | "friends";
  /** Show email publicly */
  showEmail: boolean;
  /** Show last login */
  showLastLogin: boolean;
  /** Allow search indexing */
  allowSearchIndexing: boolean;
}

export interface LoginCredentials {
  /** Username or email */
  identifier: string;
  /** Password */
  password: string;
  /** Remember login */
  rememberMe?: boolean;
}

export interface RegisterData {
  /** Username */
  username: string;
  /** Email address */
  email: string;
  /** Password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** Full name */
  fullName?: string;
  /** Accept terms of service */
  acceptTerms: boolean;
  /** Accept privacy policy */
  acceptPrivacy: boolean;
}

export interface PasswordChangeData {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
  /** Confirm new password */
  confirmPassword: string;
}

export interface PasswordResetRequest {
  /** Email address */
  email: string;
}

export interface PasswordResetConfirm {
  /** Reset token */
  token: string;
  /** New password */
  newPassword: string;
  /** Confirm new password */
  confirmPassword: string;
}

export interface AuthTokens {
  /** JWT access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Token type (usually "Bearer") */
  tokenType?: string;
  /** Token expiration in seconds */
  expiresIn?: number;
}

export interface DecodedToken {
  /** Subject (user ID) */
  sub: string;
  /** User role */
  role: UserRole;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** Token type */
  type?: "access" | "refresh";
}

export interface AuthState {
  /** Currently authenticated user */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth is loading */
  isLoading: boolean;
  /** Authentication error */
  error: string | null;
  /** Whether tokens are being refreshed */
  isRefreshing: boolean;
}

export interface AuthConfiguration {
  /** API base URL */
  apiBaseUrl?: string;
  /** Login endpoint */
  loginEndpoint?: string;
  /** Register endpoint */
  registerEndpoint?: string;
  /** Refresh token endpoint */
  refreshEndpoint?: string;
  /** User profile endpoint */
  profileEndpoint?: string;
  /** Token storage key */
  tokenStorageKey?: string;
  /** Refresh token storage key */
  refreshTokenStorageKey?: string;
  /** Auto-refresh tokens */
  autoRefresh?: boolean;
  /** Token refresh threshold (minutes before expiry) */
  refreshThresholdMinutes?: number;
  /** Redirect after login */
  loginRedirectPath?: string;
  /** Redirect after logout */
  logoutRedirectPath?: string;
  /** Enable remember me */
  enableRememberMe?: boolean;
  /** Session timeout (minutes) */
  sessionTimeoutMinutes?: number;
}

export interface AuthCallbacks {
  /** Called when login succeeds */
  onLoginSuccess?: (user: User, tokens: AuthTokens) => void;
  /** Called when login fails */
  onLoginError?: (error: string) => void;
  /** Called when logout occurs */
  onLogout?: () => void;
  /** Called when session expires */
  onSessionExpired?: () => void;
  /** Called when tokens are refreshed */
  onTokenRefresh?: (tokens: AuthTokens) => void;
  /** Called when authentication state changes */
  onAuthStateChange?: (state: AuthState) => void;
  /** Called when unauthorized request occurs */
  onUnauthorized?: () => void;
}

export interface PasswordStrength {
  /** Strength score (0-4) */
  score: number;
  /** Whether password is valid */
  isValid: boolean;
  /** Feedback message */
  feedback: string;
  /** Specific suggestions */
  suggestions: string[];
  /** Estimated crack time */
  crackTime?: string;
}

export interface ValidationRules {
  /** Minimum password length */
  minLength?: number;
  /** Require uppercase letter */
  requireUppercase?: boolean;
  /** Require lowercase letter */
  requireLowercase?: boolean;
  /** Require number */
  requireNumber?: boolean;
  /** Require special character */
  requireSpecialChar?: boolean;
  /** Custom password pattern */
  customPattern?: RegExp;
  /** Username validation pattern */
  usernamePattern?: RegExp;
  /** Email validation pattern */
  emailPattern?: RegExp;
}

export interface TwoFactorAuth {
  /** Whether 2FA is enabled */
  enabled: boolean;
  /** 2FA method */
  method?: "totp" | "sms" | "email";
  /** Backup codes */
  backupCodes?: string[];
  /** Recovery email */
  recoveryEmail?: string;
}

export interface SecuritySettings {
  /** Two-factor authentication */
  twoFactor?: TwoFactorAuth;
  /** Active sessions */
  activeSessions?: UserSession[];
  /** Login history */
  loginHistory?: LoginHistoryEntry[];
  /** Security questions */
  securityQuestions?: SecurityQuestion[];
}

export interface UserSession {
  /** Session ID */
  id: string;
  /** Device/browser info */
  device: string;
  /** IP address */
  ipAddress: string;
  /** Location */
  location?: string;
  /** Login time */
  loginTime: Date;
  /** Last activity */
  lastActivity: Date;
  /** Whether current session */
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  /** Login timestamp */
  timestamp: Date;
  /** IP address */
  ipAddress: string;
  /** Device/browser info */
  device: string;
  /** Location */
  location?: string;
  /** Whether login was successful */
  success: boolean;
  /** Failure reason if unsuccessful */
  failureReason?: string;
}

export interface SecurityQuestion {
  /** Question ID */
  id: string;
  /** Question text */
  question: string;
  /** Whether question is answered */
  isAnswered: boolean;
}

export interface ApiResponse<T> {
  /** Response data */
  data?: T;
  /** Error message */
  error?: string;
  /** Success status */
  success: boolean;
  /** HTTP status code */
  status: number;
  /** Additional metadata */
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Default configurations
export const DEFAULT_AUTH_CONFIG: AuthConfiguration = {
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

export const DEFAULT_VALIDATION_RULES: ValidationRules = {
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
