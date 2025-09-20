/**
 * Default Configuration Values for Reynard Framework
 *
 * Centralized default values that can be overridden by environment
 * variables or user preferences.
 */

import { HTTP_CONSTANTS, PERFORMANCE_CONSTANTS, SECURITY_CONSTANTS, VALIDATION_CONSTANTS } from "./constants";

// ============================================================================
// HTTP Defaults
// ============================================================================

export const HTTP_DEFAULTS = {
  timeout: HTTP_CONSTANTS.DEFAULT_TIMEOUT,
  retries: HTTP_CONSTANTS.DEFAULT_RETRIES,
  backoffMultiplier: HTTP_CONSTANTS.DEFAULT_BACKOFF_MULTIPLIER,
  maxBackoffDelay: HTTP_CONSTANTS.MAX_BACKOFF_DELAY,
  minBackoffDelay: HTTP_CONSTANTS.MIN_BACKOFF_DELAY,

  headers: {
    [HTTP_CONSTANTS.HEADERS.CONTENT_TYPE]: HTTP_CONSTANTS.CONTENT_TYPES.JSON,
    [HTTP_CONSTANTS.HEADERS.ACCEPT]: HTTP_CONSTANTS.CONTENT_TYPES.JSON,
    [HTTP_CONSTANTS.HEADERS.USER_AGENT]: "Reynard/1.0.0",
  },

  baseURL: process.env.VITE_API_BASE_URL || "http://localhost:8000",
} as const;

// ============================================================================
// Validation Defaults
// ============================================================================

export const VALIDATION_DEFAULTS = {
  password: {
    minLength: VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH,
    maxLength: VALIDATION_CONSTANTS.PASSWORD.MAX_LENGTH,
    requireUppercase: VALIDATION_CONSTANTS.PASSWORD.REQUIRE_UPPERCASE,
    requireLowercase: VALIDATION_CONSTANTS.PASSWORD.REQUIRE_LOWERCASE,
    requireNumbers: VALIDATION_CONSTANTS.PASSWORD.REQUIRE_NUMBERS,
    requireSpecialChars: VALIDATION_CONSTANTS.PASSWORD.REQUIRE_SPECIAL_CHARS,
  },

  username: {
    minLength: VALIDATION_CONSTANTS.USERNAME.MIN_LENGTH,
    maxLength: VALIDATION_CONSTANTS.USERNAME.MAX_LENGTH,
    allowedChars: VALIDATION_CONSTANTS.USERNAME.ALLOWED_CHARS,
  },

  email: {
    maxLength: VALIDATION_CONSTANTS.EMAIL.MAX_LENGTH,
    pattern: VALIDATION_CONSTANTS.EMAIL.PATTERN,
  },

  file: {
    maxSize: VALIDATION_CONSTANTS.FILE.MAX_SIZE,
    allowedImageTypes: VALIDATION_CONSTANTS.FILE.ALLOWED_IMAGE_TYPES,
    allowedDocumentTypes: VALIDATION_CONSTANTS.FILE.ALLOWED_DOCUMENT_TYPES,
    allowedVideoTypes: VALIDATION_CONSTANTS.FILE.ALLOWED_VIDEO_TYPES,
    allowedAudioTypes: VALIDATION_CONSTANTS.FILE.ALLOWED_AUDIO_TYPES,
  },
} as const;

// ============================================================================
// Performance Defaults
// ============================================================================

export const PERFORMANCE_DEFAULTS = {
  debounceDelay: PERFORMANCE_CONSTANTS.DEBOUNCE_DELAY,
  throttleDelay: PERFORMANCE_CONSTANTS.THROTTLE_DELAY,
  cacheTTL: PERFORMANCE_CONSTANTS.CACHE_TTL,
  maxCacheSize: PERFORMANCE_CONSTANTS.MAX_CACHE_SIZE,
  maxRetryAttempts: PERFORMANCE_CONSTANTS.MAX_RETRY_ATTEMPTS,
  healthCheckInterval: PERFORMANCE_CONSTANTS.HEALTH_CHECK_INTERVAL,
  metricsCollectionInterval: PERFORMANCE_CONSTANTS.METRICS_COLLECTION_INTERVAL,

  memory: {
    warningThreshold: PERFORMANCE_CONSTANTS.MEMORY.WARNING_THRESHOLD,
    criticalThreshold: PERFORMANCE_CONSTANTS.MEMORY.CRITICAL_THRESHOLD,
  },

  network: {
    slowRequestThreshold: PERFORMANCE_CONSTANTS.NETWORK.SLOW_REQUEST_THRESHOLD,
    timeoutThreshold: PERFORMANCE_CONSTANTS.NETWORK.TIMEOUT_THRESHOLD,
  },
} as const;

// ============================================================================
// Security Defaults
// ============================================================================

export const SECURITY_DEFAULTS = {
  jwt: {
    defaultExpiry: SECURITY_CONSTANTS.JWT.DEFAULT_EXPIRY,
    refreshExpiry: SECURITY_CONSTANTS.JWT.REFRESH_EXPIRY,
    algorithm: SECURITY_CONSTANTS.JWT.ALGORITHM,
  },

  rateLimiting: {
    defaultWindow: SECURITY_CONSTANTS.RATE_LIMITING.DEFAULT_WINDOW,
    defaultMaxRequests: SECURITY_CONSTANTS.RATE_LIMITING.DEFAULT_MAX_REQUESTS,
    strictWindow: SECURITY_CONSTANTS.RATE_LIMITING.STRICT_WINDOW,
    strictMaxRequests: SECURITY_CONSTANTS.RATE_LIMITING.STRICT_MAX_REQUESTS,
  },

  cors: {
    allowedOrigins: SECURITY_CONSTANTS.CORS.ALLOWED_ORIGINS,
    allowedMethods: SECURITY_CONSTANTS.CORS.ALLOWED_METHODS,
    allowedHeaders: SECURITY_CONSTANTS.CORS.ALLOWED_HEADERS,
    maxAge: SECURITY_CONSTANTS.CORS.MAX_AGE,
  },

  encryption: {
    keyLength: SECURITY_CONSTANTS.ENCRYPTION.KEY_LENGTH,
    ivLength: SECURITY_CONSTANTS.ENCRYPTION.IV_LENGTH,
    saltRounds: SECURITY_CONSTANTS.ENCRYPTION.SALT_ROUNDS,
  },
} as const;

// ============================================================================
// UI Defaults
// ============================================================================

export const UI_DEFAULTS = {
  theme: "light",
  language: "en",
  timezone: "UTC",

  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
    largeDesktop: 1440,
  },

  animation: {
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },

  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
} as const;

// ============================================================================
// API Defaults
// ============================================================================

export const API_DEFAULTS = {
  version: "v1",
  prefix: "/api",

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    minPageSize: 1,
  },

  timeout: HTTP_CONSTANTS.DEFAULT_TIMEOUT,
  retries: HTTP_CONSTANTS.DEFAULT_RETRIES,
} as const;

// ============================================================================
// Storage Defaults
// ============================================================================

export const STORAGE_DEFAULTS = {
  localStorage: {
    enabled: true,
    prefix: "reynard_",
    encryption: false,
  },

  sessionStorage: {
    enabled: true,
    prefix: "reynard_session_",
    encryption: false,
  },

  indexedDB: {
    enabled: true,
    name: "ReynardDB",
    version: 1,
  },
} as const;

// ============================================================================
// Feature Defaults
// ============================================================================

export const FEATURE_DEFAULTS = {
  enableAnalytics: process.env.NODE_ENV === "production",
  enableDebugMode: process.env.NODE_ENV === "development",
  enablePerformanceMonitoring: true,
  enableErrorReporting: process.env.NODE_ENV === "production",
  enableCaching: true,
  enableOfflineMode: false,
  enablePWA: false,
  enableDarkMode: true,
  enableI18n: true,
  enableAccessibility: true,
} as const;

// ============================================================================
// Consolidated Defaults
// ============================================================================

export const REYNARD_DEFAULTS = {
  http: HTTP_DEFAULTS,
  validation: VALIDATION_DEFAULTS,
  performance: PERFORMANCE_DEFAULTS,
  security: SECURITY_DEFAULTS,
  ui: UI_DEFAULTS,
  api: API_DEFAULTS,
  storage: STORAGE_DEFAULTS,
  features: FEATURE_DEFAULTS,
} as const;
