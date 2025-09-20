/**
 * Core Constants for Reynard Framework
 *
 * Centralized constants that are used across multiple packages
 * to eliminate duplication and ensure consistency.
 */

// ============================================================================
// HTTP Constants
// ============================================================================

export const HTTP_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  DEFAULT_RETRIES: 3,
  DEFAULT_BACKOFF_MULTIPLIER: 2,
  MAX_BACKOFF_DELAY: 10000, // 10 seconds
  MIN_BACKOFF_DELAY: 1000, // 1 second

  HEADERS: {
    CONTENT_TYPE: "Content-Type",
    ACCEPT: "Accept",
    AUTHORIZATION: "Authorization",
    USER_AGENT: "User-Agent",
    X_REQUESTED_WITH: "X-Requested-With",
    CACHE_CONTROL: "Cache-Control",
  },

  CONTENT_TYPES: {
    JSON: "application/json",
    FORM_DATA: "multipart/form-data",
    URL_ENCODED: "application/x-www-form-urlencoded",
    TEXT: "text/plain",
    HTML: "text/html",
  },

  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION_CONSTANTS = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },

  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/,
  },

  EMAIL: {
    MAX_LENGTH: 254, // RFC 5321 limit
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  URL: {
    MAX_LENGTH: 2048,
    ALLOWED_PROTOCOLS: ["http:", "https:", "ftp:", "ftps:"],
  },

  FILE: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ALLOWED_DOCUMENT_TYPES: ["application/pdf", "text/plain", "application/msword"],
    ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
    ALLOWED_AUDIO_TYPES: ["audio/mpeg", "audio/wav", "audio/ogg"],
  },
} as const;

// ============================================================================
// Performance Constants
// ============================================================================

export const PERFORMANCE_CONSTANTS = {
  DEBOUNCE_DELAY: 300, // milliseconds
  THROTTLE_DELAY: 100, // milliseconds
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 1000, // items
  MAX_RETRY_ATTEMPTS: 3,
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  METRICS_COLLECTION_INTERVAL: 60000, // 1 minute

  MEMORY: {
    WARNING_THRESHOLD: 0.8, // 80%
    CRITICAL_THRESHOLD: 0.9, // 90%
  },

  NETWORK: {
    SLOW_REQUEST_THRESHOLD: 5000, // 5 seconds
    TIMEOUT_THRESHOLD: 30000, // 30 seconds
  },
} as const;

// ============================================================================
// Security Constants
// ============================================================================

export const SECURITY_CONSTANTS = {
  JWT: {
    DEFAULT_EXPIRY: 24 * 60 * 60, // 24 hours in seconds
    REFRESH_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
    ALGORITHM: "HS256",
  },

  RATE_LIMITING: {
    DEFAULT_WINDOW: 60, // 1 minute
    DEFAULT_MAX_REQUESTS: 100,
    STRICT_WINDOW: 15, // 15 seconds
    STRICT_MAX_REQUESTS: 10,
  },

  CORS: {
    ALLOWED_ORIGINS: ["http://localhost:3000", "http://localhost:3001"],
    ALLOWED_METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    ALLOWED_HEADERS: ["Content-Type", "Authorization", "X-Requested-With"],
    MAX_AGE: 86400, // 24 hours
  },

  ENCRYPTION: {
    KEY_LENGTH: 32, // 256 bits
    IV_LENGTH: 16, // 128 bits
    SALT_ROUNDS: 12,
  },
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const UI_CONSTANTS = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
    LARGE_DESKTOP: 1440,
  },

  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },

  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    EASING: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  SPACING: {
    XS: "0.25rem", // 4px
    SM: "0.5rem", // 8px
    MD: "1rem", // 16px
    LG: "1.5rem", // 24px
    XL: "2rem", // 32px
    XXL: "3rem", // 48px
  },

  BORDER_RADIUS: {
    SM: "0.25rem", // 4px
    MD: "0.5rem", // 8px
    LG: "0.75rem", // 12px
    XL: "1rem", // 16px
    FULL: "9999px",
  },
} as const;

// ============================================================================
// API Constants
// ============================================================================

export const API_CONSTANTS = {
  ENDPOINTS: {
    HEALTH: "/api/health",
    AUTH: {
      LOGIN: "/api/auth/login",
      LOGOUT: "/api/auth/logout",
      REFRESH: "/api/auth/refresh",
      REGISTER: "/api/auth/register",
      PROFILE: "/api/auth/profile",
    },
    USERS: {
      BASE: "/api/users",
      PROFILE: "/api/users/profile",
      AVATAR: "/api/users/avatar",
    },
    FILES: {
      UPLOAD: "/api/files/upload",
      DOWNLOAD: "/api/files/download",
      DELETE: "/api/files/delete",
    },
    CHAT: {
      MESSAGES: "/api/chat/messages",
      STREAM: "/api/chat/stream",
    },
    RAG: {
      QUERY: "/api/rag/query",
      INGEST: "/api/rag/ingest",
      DOCUMENTS: "/api/rag/documents",
    },
  },

  VERSION: "v1",
  PREFIX: "/api",

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1,
  },
} as const;

// ============================================================================
// Error Constants
// ============================================================================

export const ERROR_CONSTANTS = {
  CODES: {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
    NETWORK_ERROR: "NETWORK_ERROR",
    TIMEOUT_ERROR: "TIMEOUT_ERROR",
    RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
    NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
    CONFLICT_ERROR: "CONFLICT_ERROR",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  },

  MESSAGES: {
    GENERIC: "An unexpected error occurred",
    NETWORK: "Network connection failed",
    TIMEOUT: "Request timed out",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    VALIDATION: "Invalid input provided",
    RATE_LIMIT: "Too many requests",
    SERVER_ERROR: "Internal server error",
  },

  SEVERITY: {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
  },
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NODE_ENV === "production",
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === "development",
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_ERROR_REPORTING: process.env.NODE_ENV === "production",
  ENABLE_CACHING: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_PWA: false,
  ENABLE_DARK_MODE: true,
  ENABLE_I18N: true,
  ENABLE_ACCESSIBILITY: true,
} as const;

// ============================================================================
// Environment Constants
// ============================================================================

export const ENVIRONMENT = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const CURRENT_ENVIRONMENT = process.env.NODE_ENV || ENVIRONMENT.DEVELOPMENT;

// ============================================================================
// Storage Constants
// ============================================================================

export const STORAGE_CONSTANTS = {
  KEYS: {
    AUTH_TOKEN: "reynard_auth_token",
    REFRESH_TOKEN: "reynard_refresh_token",
    USER_PREFERENCES: "reynard_user_preferences",
    THEME: "reynard_theme",
    LANGUAGE: "reynard_language",
    CACHE_PREFIX: "reynard_cache_",
  },

  QUOTAS: {
    LOCAL_STORAGE: 5 * 1024 * 1024, // 5MB
    SESSION_STORAGE: 5 * 1024 * 1024, // 5MB
    INDEXED_DB: 50 * 1024 * 1024, // 50MB
  },
} as const;
