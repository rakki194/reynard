/**
 * Configuration Types for Reynard Framework
 *
 * TypeScript interfaces and types for configuration management
 * across Reynard packages.
 */
export interface BaseConfig {
    name: string;
    version: string;
    environment: string;
    debug: boolean;
}
export interface HTTPConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    headers: Record<string, string>;
    enableRetry: boolean;
    enableCircuitBreaker: boolean;
    enableMetrics: boolean;
}
export interface ValidationConfig {
    password: {
        minLength: number;
        maxLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
    };
    username: {
        minLength: number;
        maxLength: number;
        allowedChars: RegExp;
    };
    email: {
        maxLength: number;
        pattern: RegExp;
    };
    file: {
        maxSize: number;
        allowedImageTypes: string[];
        allowedDocumentTypes: string[];
        allowedVideoTypes: string[];
        allowedAudioTypes: string[];
    };
}
export interface PerformanceConfig {
    debounceDelay: number;
    throttleDelay: number;
    cacheTTL: number;
    maxCacheSize: number;
    maxRetryAttempts: number;
    healthCheckInterval: number;
    metricsCollectionInterval: number;
    memory: {
        warningThreshold: number;
        criticalThreshold: number;
    };
    network: {
        slowRequestThreshold: number;
        timeoutThreshold: number;
    };
}
export interface SecurityConfig {
    jwt: {
        defaultExpiry: number;
        refreshExpiry: number;
        algorithm: string;
    };
    rateLimiting: {
        defaultWindow: number;
        defaultMaxRequests: number;
        strictWindow: number;
        strictMaxRequests: number;
    };
    cors: {
        allowedOrigins: string[];
        allowedMethods: string[];
        allowedHeaders: string[];
        maxAge: number;
    };
    encryption: {
        keyLength: number;
        ivLength: number;
        saltRounds: number;
    };
}
export interface UIConfig {
    theme: string;
    language: string;
    timezone: string;
    breakpoints: {
        mobile: number;
        tablet: number;
        desktop: number;
        largeDesktop: number;
    };
    animation: {
        duration: number;
        easing: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
}
export interface APIConfig {
    version: string;
    prefix: string;
    pagination: {
        defaultPageSize: number;
        maxPageSize: number;
        minPageSize: number;
    };
    timeout: number;
    retries: number;
}
export interface StorageConfig {
    localStorage: {
        enabled: boolean;
        prefix: string;
        encryption: boolean;
    };
    sessionStorage: {
        enabled: boolean;
        prefix: string;
        encryption: boolean;
    };
    indexedDB: {
        enabled: boolean;
        name: string;
        version: number;
    };
}
export interface FeatureConfig {
    enableAnalytics: boolean;
    enableDebugMode: boolean;
    enablePerformanceMonitoring: boolean;
    enableErrorReporting: boolean;
    enableCaching: boolean;
    enableOfflineMode: boolean;
    enablePWA: boolean;
    enableDarkMode: boolean;
    enableI18n: boolean;
    enableAccessibility: boolean;
}
export interface ReynardConfig extends BaseConfig {
    http: HTTPConfig;
    validation: ValidationConfig;
    performance: PerformanceConfig;
    security: SecurityConfig;
    ui: UIConfig;
    api: APIConfig;
    storage: StorageConfig;
    features: FeatureConfig;
}
export interface ConfigManager {
    get<K extends keyof ReynardConfig>(key: K): ReynardConfig[K];
    set<K extends keyof ReynardConfig>(key: K, value: ReynardConfig[K]): void;
    update(updates: Partial<ReynardConfig>): void;
    reset(): void;
    validate(): boolean;
    export(): ReynardConfig;
    import(config: Partial<ReynardConfig>): void;
}
export interface ConfigValidator {
    validate(config: Partial<ReynardConfig>): ValidationResult;
    validateSection<K extends keyof ReynardConfig>(section: K, config: ReynardConfig[K]): ValidationResult;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export type Environment = "development" | "staging" | "production" | "test";
export interface EnvironmentConfig {
    NODE_ENV: string;
    VITE_API_BASE_URL?: string;
    VITE_WS_URL?: string;
    VITE_APP_NAME?: string;
    VITE_APP_VERSION?: string;
    VITE_DEBUG?: string;
    VITE_LOG_LEVEL?: string;
    VITE_ENABLE_ANALYTICS?: string;
    VITE_ENABLE_ERROR_REPORTING?: string;
    VITE_ENABLE_PERFORMANCE_MONITORING?: string;
    VITE_AUTH_DOMAIN?: string;
    VITE_AUTH_CLIENT_ID?: string;
    VITE_AUTH_REDIRECT_URI?: string;
    VITE_CDN_URL?: string;
    VITE_SENTRY_DSN?: string;
    VITE_GOOGLE_ANALYTICS_ID?: string;
}
export interface ConfigChangeEvent {
    key: keyof ReynardConfig;
    oldValue: unknown;
    newValue: unknown;
    timestamp: number;
}
export interface ConfigEventListener {
    (event: ConfigChangeEvent): void;
}
export interface ConfigEventEmitter {
    on(event: "change", listener: ConfigEventListener): void;
    off(event: "change", listener: ConfigEventListener): void;
    emit(event: "change", data: ConfigChangeEvent): void;
}
export interface ConfigStorage {
    save(config: ReynardConfig): Promise<void>;
    load(): Promise<Partial<ReynardConfig>>;
    clear(): Promise<void>;
    exists(): Promise<boolean>;
}
export interface ConfigPersistenceOptions {
    storage: ConfigStorage;
    autoSave: boolean;
    saveInterval: number;
    encrypt: boolean;
}
export interface ConfigFactory {
    createDefault(): ReynardConfig;
    createFromEnvironment(): ReynardConfig;
    createFromFile(path: string): Promise<ReynardConfig>;
    createFromObject(obj: Partial<ReynardConfig>): ReynardConfig;
}
export interface ConfigBuilder {
    setBase(base: Partial<BaseConfig>): ConfigBuilder;
    setHTTP(http: Partial<HTTPConfig>): ConfigBuilder;
    setValidation(validation: Partial<ValidationConfig>): ConfigBuilder;
    setPerformance(performance: Partial<PerformanceConfig>): ConfigBuilder;
    setSecurity(security: Partial<SecurityConfig>): ConfigBuilder;
    setUI(ui: Partial<UIConfig>): ConfigBuilder;
    setAPI(api: Partial<APIConfig>): ConfigBuilder;
    setStorage(storage: Partial<StorageConfig>): ConfigBuilder;
    setFeatures(features: Partial<FeatureConfig>): ConfigBuilder;
    build(): ReynardConfig;
}
export interface ConfigUtils {
    merge<T>(target: T, source: Partial<T>): T;
    deepMerge<T>(target: T, source: Partial<T>): T;
    clone<T>(obj: T): T;
    isEqual<T>(a: T, b: T): boolean;
    validateConfig(config: Partial<ReynardConfig>): ValidationResult;
    sanitizeConfig(config: Partial<ReynardConfig>): Partial<ReynardConfig>;
}
export interface ConfigHook {
    beforeLoad?(): Promise<void>;
    afterLoad?(config: ReynardConfig): Promise<void>;
    beforeSave?(config: ReynardConfig): Promise<void>;
    afterSave?(config: ReynardConfig): Promise<void>;
    beforeValidate?(config: Partial<ReynardConfig>): Promise<void>;
    afterValidate?(result: ValidationResult): Promise<void>;
}
export interface ConfigHooks {
    addHook(hook: ConfigHook): void;
    removeHook(hook: ConfigHook): void;
    executeHook(method: keyof ConfigHook, ...args: unknown[]): Promise<void>;
}
