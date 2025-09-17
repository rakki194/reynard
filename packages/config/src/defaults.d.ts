/**
 * Default Configuration Values for Reynard Framework
 *
 * Centralized default values that can be overridden by environment
 * variables or user preferences.
 */
export declare const HTTP_DEFAULTS: {
    readonly timeout: 30000;
    readonly retries: 3;
    readonly backoffMultiplier: 2;
    readonly maxBackoffDelay: 10000;
    readonly minBackoffDelay: 1000;
    readonly headers: {
        readonly "Content-Type": "application/json";
        readonly Accept: "application/json";
        readonly "User-Agent": "Reynard/1.0.0";
    };
    readonly baseURL: string;
};
export declare const VALIDATION_DEFAULTS: {
    readonly password: {
        readonly minLength: 8;
        readonly maxLength: 128;
        readonly requireUppercase: true;
        readonly requireLowercase: true;
        readonly requireNumbers: true;
        readonly requireSpecialChars: true;
    };
    readonly username: {
        readonly minLength: 3;
        readonly maxLength: 30;
        readonly allowedChars: RegExp;
    };
    readonly email: {
        readonly maxLength: 254;
        readonly pattern: RegExp;
    };
    readonly file: {
        readonly maxSize: number;
        readonly allowedImageTypes: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
        readonly allowedDocumentTypes: readonly ["application/pdf", "text/plain", "application/msword"];
        readonly allowedVideoTypes: readonly ["video/mp4", "video/webm", "video/ogg"];
        readonly allowedAudioTypes: readonly ["audio/mpeg", "audio/wav", "audio/ogg"];
    };
};
export declare const PERFORMANCE_DEFAULTS: {
    readonly debounceDelay: 300;
    readonly throttleDelay: 100;
    readonly cacheTTL: number;
    readonly maxCacheSize: 1000;
    readonly maxRetryAttempts: 3;
    readonly healthCheckInterval: 30000;
    readonly metricsCollectionInterval: 60000;
    readonly memory: {
        readonly warningThreshold: 0.8;
        readonly criticalThreshold: 0.9;
    };
    readonly network: {
        readonly slowRequestThreshold: 5000;
        readonly timeoutThreshold: 30000;
    };
};
export declare const SECURITY_DEFAULTS: {
    readonly jwt: {
        readonly defaultExpiry: number;
        readonly refreshExpiry: number;
        readonly algorithm: "HS256";
    };
    readonly rateLimiting: {
        readonly defaultWindow: 60;
        readonly defaultMaxRequests: 100;
        readonly strictWindow: 15;
        readonly strictMaxRequests: 10;
    };
    readonly cors: {
        readonly allowedOrigins: readonly ["http://localhost:3000", "http://localhost:3001"];
        readonly allowedMethods: readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
        readonly allowedHeaders: readonly ["Content-Type", "Authorization", "X-Requested-With"];
        readonly maxAge: 86400;
    };
    readonly encryption: {
        readonly keyLength: 32;
        readonly ivLength: 16;
        readonly saltRounds: 12;
    };
};
export declare const UI_DEFAULTS: {
    readonly theme: "light";
    readonly language: "en";
    readonly timezone: "UTC";
    readonly breakpoints: {
        readonly mobile: 768;
        readonly tablet: 1024;
        readonly desktop: 1200;
        readonly largeDesktop: 1440;
    };
    readonly animation: {
        readonly duration: 300;
        readonly easing: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
    readonly spacing: {
        readonly xs: "0.25rem";
        readonly sm: "0.5rem";
        readonly md: "1rem";
        readonly lg: "1.5rem";
        readonly xl: "2rem";
        readonly xxl: "3rem";
    };
    readonly borderRadius: {
        readonly sm: "0.25rem";
        readonly md: "0.5rem";
        readonly lg: "0.75rem";
        readonly xl: "1rem";
        readonly full: "9999px";
    };
};
export declare const API_DEFAULTS: {
    readonly version: "v1";
    readonly prefix: "/api";
    readonly pagination: {
        readonly defaultPageSize: 20;
        readonly maxPageSize: 100;
        readonly minPageSize: 1;
    };
    readonly timeout: 30000;
    readonly retries: 3;
};
export declare const STORAGE_DEFAULTS: {
    readonly localStorage: {
        readonly enabled: true;
        readonly prefix: "reynard_";
        readonly encryption: false;
    };
    readonly sessionStorage: {
        readonly enabled: true;
        readonly prefix: "reynard_session_";
        readonly encryption: false;
    };
    readonly indexedDB: {
        readonly enabled: true;
        readonly name: "ReynardDB";
        readonly version: 1;
    };
};
export declare const FEATURE_DEFAULTS: {
    readonly enableAnalytics: boolean;
    readonly enableDebugMode: boolean;
    readonly enablePerformanceMonitoring: true;
    readonly enableErrorReporting: boolean;
    readonly enableCaching: true;
    readonly enableOfflineMode: false;
    readonly enablePWA: false;
    readonly enableDarkMode: true;
    readonly enableI18n: true;
    readonly enableAccessibility: true;
};
export declare const REYNARD_DEFAULTS: {
    readonly http: {
        readonly timeout: 30000;
        readonly retries: 3;
        readonly backoffMultiplier: 2;
        readonly maxBackoffDelay: 10000;
        readonly minBackoffDelay: 1000;
        readonly headers: {
            readonly "Content-Type": "application/json";
            readonly Accept: "application/json";
            readonly "User-Agent": "Reynard/1.0.0";
        };
        readonly baseURL: string;
    };
    readonly validation: {
        readonly password: {
            readonly minLength: 8;
            readonly maxLength: 128;
            readonly requireUppercase: true;
            readonly requireLowercase: true;
            readonly requireNumbers: true;
            readonly requireSpecialChars: true;
        };
        readonly username: {
            readonly minLength: 3;
            readonly maxLength: 30;
            readonly allowedChars: RegExp;
        };
        readonly email: {
            readonly maxLength: 254;
            readonly pattern: RegExp;
        };
        readonly file: {
            readonly maxSize: number;
            readonly allowedImageTypes: readonly ["image/jpeg", "image/png", "image/gif", "image/webp"];
            readonly allowedDocumentTypes: readonly ["application/pdf", "text/plain", "application/msword"];
            readonly allowedVideoTypes: readonly ["video/mp4", "video/webm", "video/ogg"];
            readonly allowedAudioTypes: readonly ["audio/mpeg", "audio/wav", "audio/ogg"];
        };
    };
    readonly performance: {
        readonly debounceDelay: 300;
        readonly throttleDelay: 100;
        readonly cacheTTL: number;
        readonly maxCacheSize: 1000;
        readonly maxRetryAttempts: 3;
        readonly healthCheckInterval: 30000;
        readonly metricsCollectionInterval: 60000;
        readonly memory: {
            readonly warningThreshold: 0.8;
            readonly criticalThreshold: 0.9;
        };
        readonly network: {
            readonly slowRequestThreshold: 5000;
            readonly timeoutThreshold: 30000;
        };
    };
    readonly security: {
        readonly jwt: {
            readonly defaultExpiry: number;
            readonly refreshExpiry: number;
            readonly algorithm: "HS256";
        };
        readonly rateLimiting: {
            readonly defaultWindow: 60;
            readonly defaultMaxRequests: 100;
            readonly strictWindow: 15;
            readonly strictMaxRequests: 10;
        };
        readonly cors: {
            readonly allowedOrigins: readonly ["http://localhost:3000", "http://localhost:3001"];
            readonly allowedMethods: readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
            readonly allowedHeaders: readonly ["Content-Type", "Authorization", "X-Requested-With"];
            readonly maxAge: 86400;
        };
        readonly encryption: {
            readonly keyLength: 32;
            readonly ivLength: 16;
            readonly saltRounds: 12;
        };
    };
    readonly ui: {
        readonly theme: "light";
        readonly language: "en";
        readonly timezone: "UTC";
        readonly breakpoints: {
            readonly mobile: 768;
            readonly tablet: 1024;
            readonly desktop: 1200;
            readonly largeDesktop: 1440;
        };
        readonly animation: {
            readonly duration: 300;
            readonly easing: "cubic-bezier(0.4, 0, 0.2, 1)";
        };
        readonly spacing: {
            readonly xs: "0.25rem";
            readonly sm: "0.5rem";
            readonly md: "1rem";
            readonly lg: "1.5rem";
            readonly xl: "2rem";
            readonly xxl: "3rem";
        };
        readonly borderRadius: {
            readonly sm: "0.25rem";
            readonly md: "0.5rem";
            readonly lg: "0.75rem";
            readonly xl: "1rem";
            readonly full: "9999px";
        };
    };
    readonly api: {
        readonly version: "v1";
        readonly prefix: "/api";
        readonly pagination: {
            readonly defaultPageSize: 20;
            readonly maxPageSize: 100;
            readonly minPageSize: 1;
        };
        readonly timeout: 30000;
        readonly retries: 3;
    };
    readonly storage: {
        readonly localStorage: {
            readonly enabled: true;
            readonly prefix: "reynard_";
            readonly encryption: false;
        };
        readonly sessionStorage: {
            readonly enabled: true;
            readonly prefix: "reynard_session_";
            readonly encryption: false;
        };
        readonly indexedDB: {
            readonly enabled: true;
            readonly name: "ReynardDB";
            readonly version: 1;
        };
    };
    readonly features: {
        readonly enableAnalytics: boolean;
        readonly enableDebugMode: boolean;
        readonly enablePerformanceMonitoring: true;
        readonly enableErrorReporting: boolean;
        readonly enableCaching: true;
        readonly enableOfflineMode: false;
        readonly enablePWA: false;
        readonly enableDarkMode: true;
        readonly enableI18n: true;
        readonly enableAccessibility: true;
    };
};
