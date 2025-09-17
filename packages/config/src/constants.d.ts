/**
 * Core Constants for Reynard Framework
 *
 * Centralized constants that are used across multiple packages
 * to eliminate duplication and ensure consistency.
 */
export declare const HTTP_CONSTANTS: {
    readonly DEFAULT_TIMEOUT: 30000;
    readonly DEFAULT_RETRIES: 3;
    readonly DEFAULT_BACKOFF_MULTIPLIER: 2;
    readonly MAX_BACKOFF_DELAY: 10000;
    readonly MIN_BACKOFF_DELAY: 1000;
    readonly HEADERS: {
        readonly CONTENT_TYPE: "Content-Type";
        readonly ACCEPT: "Accept";
        readonly AUTHORIZATION: "Authorization";
        readonly USER_AGENT: "User-Agent";
        readonly X_REQUESTED_WITH: "X-Requested-With";
        readonly CACHE_CONTROL: "Cache-Control";
    };
    readonly CONTENT_TYPES: {
        readonly JSON: "application/json";
        readonly FORM_DATA: "multipart/form-data";
        readonly URL_ENCODED: "application/x-www-form-urlencoded";
        readonly TEXT: "text/plain";
        readonly HTML: "text/html";
    };
    readonly STATUS_CODES: {
        readonly OK: 200;
        readonly CREATED: 201;
        readonly NO_CONTENT: 204;
        readonly BAD_REQUEST: 400;
        readonly UNAUTHORIZED: 401;
        readonly FORBIDDEN: 403;
        readonly NOT_FOUND: 404;
        readonly CONFLICT: 409;
        readonly UNPROCESSABLE_ENTITY: 422;
        readonly TOO_MANY_REQUESTS: 429;
        readonly INTERNAL_SERVER_ERROR: 500;
        readonly BAD_GATEWAY: 502;
        readonly SERVICE_UNAVAILABLE: 503;
        readonly GATEWAY_TIMEOUT: 504;
    };
};
export declare const VALIDATION_CONSTANTS: {
    readonly PASSWORD: {
        readonly MIN_LENGTH: 8;
        readonly MAX_LENGTH: 128;
        readonly REQUIRE_UPPERCASE: true;
        readonly REQUIRE_LOWERCASE: true;
        readonly REQUIRE_NUMBERS: true;
        readonly REQUIRE_SPECIAL_CHARS: true;
    };
    readonly USERNAME: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 30;
        readonly ALLOWED_CHARS: RegExp;
    };
    readonly EMAIL: {
        readonly MAX_LENGTH: 254;
        readonly PATTERN: RegExp;
    };
    readonly URL: {
        readonly MAX_LENGTH: 2048;
        readonly ALLOWED_PROTOCOLS: readonly ["http:", "https:", "ftp:", "ftps:"];
    };
    readonly FILE: {
        readonly MAX_SIZE: number;
        readonly ALLOWED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
        readonly ALLOWED_DOCUMENT_TYPES: readonly ["application/pdf", "text/plain", "application/msword"];
        readonly ALLOWED_VIDEO_TYPES: readonly ["video/mp4", "video/webm", "video/ogg"];
        readonly ALLOWED_AUDIO_TYPES: readonly ["audio/mpeg", "audio/wav", "audio/ogg"];
    };
};
export declare const PERFORMANCE_CONSTANTS: {
    readonly DEBOUNCE_DELAY: 300;
    readonly THROTTLE_DELAY: 100;
    readonly CACHE_TTL: number;
    readonly MAX_CACHE_SIZE: 1000;
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly HEALTH_CHECK_INTERVAL: 30000;
    readonly METRICS_COLLECTION_INTERVAL: 60000;
    readonly MEMORY: {
        readonly WARNING_THRESHOLD: 0.8;
        readonly CRITICAL_THRESHOLD: 0.9;
    };
    readonly NETWORK: {
        readonly SLOW_REQUEST_THRESHOLD: 5000;
        readonly TIMEOUT_THRESHOLD: 30000;
    };
};
export declare const SECURITY_CONSTANTS: {
    readonly JWT: {
        readonly DEFAULT_EXPIRY: number;
        readonly REFRESH_EXPIRY: number;
        readonly ALGORITHM: "HS256";
    };
    readonly RATE_LIMITING: {
        readonly DEFAULT_WINDOW: 60;
        readonly DEFAULT_MAX_REQUESTS: 100;
        readonly STRICT_WINDOW: 15;
        readonly STRICT_MAX_REQUESTS: 10;
    };
    readonly CORS: {
        readonly ALLOWED_ORIGINS: readonly ["http://localhost:3000", "http://localhost:3001"];
        readonly ALLOWED_METHODS: readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
        readonly ALLOWED_HEADERS: readonly ["Content-Type", "Authorization", "X-Requested-With"];
        readonly MAX_AGE: 86400;
    };
    readonly ENCRYPTION: {
        readonly KEY_LENGTH: 32;
        readonly IV_LENGTH: 16;
        readonly SALT_ROUNDS: 12;
    };
};
export declare const UI_CONSTANTS: {
    readonly BREAKPOINTS: {
        readonly MOBILE: 768;
        readonly TABLET: 1024;
        readonly DESKTOP: 1200;
        readonly LARGE_DESKTOP: 1440;
    };
    readonly Z_INDEX: {
        readonly DROPDOWN: 1000;
        readonly STICKY: 1020;
        readonly FIXED: 1030;
        readonly MODAL_BACKDROP: 1040;
        readonly MODAL: 1050;
        readonly POPOVER: 1060;
        readonly TOOLTIP: 1070;
        readonly TOAST: 1080;
    };
    readonly ANIMATION: {
        readonly FAST: 150;
        readonly NORMAL: 300;
        readonly SLOW: 500;
        readonly EASING: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
    readonly SPACING: {
        readonly XS: "0.25rem";
        readonly SM: "0.5rem";
        readonly MD: "1rem";
        readonly LG: "1.5rem";
        readonly XL: "2rem";
        readonly XXL: "3rem";
    };
    readonly BORDER_RADIUS: {
        readonly SM: "0.25rem";
        readonly MD: "0.5rem";
        readonly LG: "0.75rem";
        readonly XL: "1rem";
        readonly FULL: "9999px";
    };
};
export declare const API_CONSTANTS: {
    readonly ENDPOINTS: {
        readonly HEALTH: "/api/health";
        readonly AUTH: {
            readonly LOGIN: "/api/auth/login";
            readonly LOGOUT: "/api/auth/logout";
            readonly REFRESH: "/api/auth/refresh";
            readonly REGISTER: "/api/auth/register";
            readonly PROFILE: "/api/auth/profile";
        };
        readonly USERS: {
            readonly BASE: "/api/users";
            readonly PROFILE: "/api/users/profile";
            readonly AVATAR: "/api/users/avatar";
        };
        readonly FILES: {
            readonly UPLOAD: "/api/files/upload";
            readonly DOWNLOAD: "/api/files/download";
            readonly DELETE: "/api/files/delete";
        };
        readonly CHAT: {
            readonly MESSAGES: "/api/chat/messages";
            readonly STREAM: "/api/chat/stream";
        };
        readonly RAG: {
            readonly QUERY: "/api/rag/query";
            readonly INGEST: "/api/rag/ingest";
            readonly DOCUMENTS: "/api/rag/documents";
        };
    };
    readonly VERSION: "v1";
    readonly PREFIX: "/api";
    readonly PAGINATION: {
        readonly DEFAULT_PAGE_SIZE: 20;
        readonly MAX_PAGE_SIZE: 100;
        readonly MIN_PAGE_SIZE: 1;
    };
};
export declare const ERROR_CONSTANTS: {
    readonly CODES: {
        readonly VALIDATION_ERROR: "VALIDATION_ERROR";
        readonly AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR";
        readonly AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR";
        readonly NETWORK_ERROR: "NETWORK_ERROR";
        readonly TIMEOUT_ERROR: "TIMEOUT_ERROR";
        readonly RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR";
        readonly NOT_FOUND_ERROR: "NOT_FOUND_ERROR";
        readonly CONFLICT_ERROR: "CONFLICT_ERROR";
        readonly INTERNAL_ERROR: "INTERNAL_ERROR";
        readonly EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR";
    };
    readonly MESSAGES: {
        readonly GENERIC: "An unexpected error occurred";
        readonly NETWORK: "Network connection failed";
        readonly TIMEOUT: "Request timed out";
        readonly UNAUTHORIZED: "Authentication required";
        readonly FORBIDDEN: "Access denied";
        readonly NOT_FOUND: "Resource not found";
        readonly VALIDATION: "Invalid input provided";
        readonly RATE_LIMIT: "Too many requests";
        readonly SERVER_ERROR: "Internal server error";
    };
    readonly SEVERITY: {
        readonly LOW: "low";
        readonly MEDIUM: "medium";
        readonly HIGH: "high";
        readonly CRITICAL: "critical";
    };
};
export declare const FEATURE_FLAGS: {
    readonly ENABLE_ANALYTICS: boolean;
    readonly ENABLE_DEBUG_MODE: boolean;
    readonly ENABLE_PERFORMANCE_MONITORING: true;
    readonly ENABLE_ERROR_REPORTING: boolean;
    readonly ENABLE_CACHING: true;
    readonly ENABLE_OFFLINE_MODE: false;
    readonly ENABLE_PWA: false;
    readonly ENABLE_DARK_MODE: true;
    readonly ENABLE_I18N: true;
    readonly ENABLE_ACCESSIBILITY: true;
};
export declare const ENVIRONMENT: {
    readonly DEVELOPMENT: "development";
    readonly STAGING: "staging";
    readonly PRODUCTION: "production";
    readonly TEST: "test";
};
export declare const CURRENT_ENVIRONMENT: string;
export declare const STORAGE_CONSTANTS: {
    readonly KEYS: {
        readonly AUTH_TOKEN: "reynard_auth_token";
        readonly REFRESH_TOKEN: "reynard_refresh_token";
        readonly USER_PREFERENCES: "reynard_user_preferences";
        readonly THEME: "reynard_theme";
        readonly LANGUAGE: "reynard_language";
        readonly CACHE_PREFIX: "reynard_cache_";
    };
    readonly QUOTAS: {
        readonly LOCAL_STORAGE: number;
        readonly SESSION_STORAGE: number;
        readonly INDEXED_DB: number;
    };
};
