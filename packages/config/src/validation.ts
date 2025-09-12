/**
 * Configuration Validation for Reynard Framework
 *
 * Validation utilities for configuration objects to ensure
 * consistency and correctness across Reynard packages.
 */

import {
  APIConfig,
  FeatureConfig,
  HTTPConfig,
  PerformanceConfig,
  ReynardConfig,
  SecurityConfig,
  StorageConfig,
  UIConfig,
  ValidationConfig,
  ValidationResult,
} from "./types";

// ============================================================================
// Configuration Validators
// ============================================================================

export class ConfigValidator {
  /**
   * Validate complete configuration
   */
  static validate(config: Partial<ReynardConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate base configuration
    if (config.name && typeof config.name !== "string") {
      errors.push("Configuration name must be a string");
    }

    if (config.version && typeof config.version !== "string") {
      errors.push("Configuration version must be a string");
    }

    if (
      config.environment &&
      !["development", "staging", "production", "test"].includes(
        config.environment,
      )
    ) {
      errors.push(
        "Configuration environment must be one of: development, staging, production, test",
      );
    }

    if (config.debug !== undefined && typeof config.debug !== "boolean") {
      errors.push("Configuration debug must be a boolean");
    }

    // Validate HTTP configuration
    if (config.http) {
      const httpResult = this.validateHTTP(config.http);
      errors.push(...httpResult.errors);
      warnings.push(...httpResult.warnings);
    }

    // Validate validation configuration
    if (config.validation) {
      const validationResult = this.validateValidation(config.validation);
      errors.push(...validationResult.errors);
      warnings.push(...validationResult.warnings);
    }

    // Validate performance configuration
    if (config.performance) {
      const performanceResult = this.validatePerformance(config.performance);
      errors.push(...performanceResult.errors);
      warnings.push(...performanceResult.warnings);
    }

    // Validate security configuration
    if (config.security) {
      const securityResult = this.validateSecurity(config.security);
      errors.push(...securityResult.errors);
      warnings.push(...securityResult.warnings);
    }

    // Validate UI configuration
    if (config.ui) {
      const uiResult = this.validateUI(config.ui);
      errors.push(...uiResult.errors);
      warnings.push(...uiResult.warnings);
    }

    // Validate API configuration
    if (config.api) {
      const apiResult = this.validateAPI(config.api);
      errors.push(...apiResult.errors);
      warnings.push(...apiResult.warnings);
    }

    // Validate storage configuration
    if (config.storage) {
      const storageResult = this.validateStorage(config.storage);
      errors.push(...storageResult.errors);
      warnings.push(...storageResult.warnings);
    }

    // Validate features configuration
    if (config.features) {
      const featuresResult = this.validateFeatures(config.features);
      errors.push(...featuresResult.errors);
      warnings.push(...featuresResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate HTTP configuration
   */
  static validateHTTP(config: Partial<HTTPConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.baseUrl && typeof config.baseUrl !== "string") {
      errors.push("HTTP baseUrl must be a string");
    }

    if (config.timeout !== undefined) {
      if (typeof config.timeout !== "number" || config.timeout <= 0) {
        errors.push("HTTP timeout must be a positive number");
      } else if (config.timeout > 300000) {
        warnings.push("HTTP timeout is very high (>5 minutes)");
      }
    }

    if (config.retries !== undefined) {
      if (
        typeof config.retries !== "number" ||
        config.retries < 0 ||
        config.retries > 10
      ) {
        errors.push("HTTP retries must be a number between 0 and 10");
      }
    }

    if (config.headers && typeof config.headers !== "object") {
      errors.push("HTTP headers must be an object");
    }

    if (
      config.enableRetry !== undefined &&
      typeof config.enableRetry !== "boolean"
    ) {
      errors.push("HTTP enableRetry must be a boolean");
    }

    if (
      config.enableCircuitBreaker !== undefined &&
      typeof config.enableCircuitBreaker !== "boolean"
    ) {
      errors.push("HTTP enableCircuitBreaker must be a boolean");
    }

    if (
      config.enableMetrics !== undefined &&
      typeof config.enableMetrics !== "boolean"
    ) {
      errors.push("HTTP enableMetrics must be a boolean");
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate validation configuration
   */
  static validateValidation(
    config: Partial<ValidationConfig>,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.password) {
      if (
        config.password.minLength !== undefined &&
        (typeof config.password.minLength !== "number" ||
          config.password.minLength < 1)
      ) {
        errors.push("Password minLength must be a positive number");
      }
      if (
        config.password.maxLength !== undefined &&
        (typeof config.password.maxLength !== "number" ||
          config.password.maxLength < config.password.minLength ||
          0)
      ) {
        errors.push(
          "Password maxLength must be a number greater than minLength",
        );
      }
      if (
        config.password.requireUppercase !== undefined &&
        typeof config.password.requireUppercase !== "boolean"
      ) {
        errors.push("Password requireUppercase must be a boolean");
      }
      if (
        config.password.requireLowercase !== undefined &&
        typeof config.password.requireLowercase !== "boolean"
      ) {
        errors.push("Password requireLowercase must be a boolean");
      }
      if (
        config.password.requireNumbers !== undefined &&
        typeof config.password.requireNumbers !== "boolean"
      ) {
        errors.push("Password requireNumbers must be a boolean");
      }
      if (
        config.password.requireSpecialChars !== undefined &&
        typeof config.password.requireSpecialChars !== "boolean"
      ) {
        errors.push("Password requireSpecialChars must be a boolean");
      }
    }

    if (config.username) {
      if (
        config.username.minLength !== undefined &&
        (typeof config.username.minLength !== "number" ||
          config.username.minLength < 1)
      ) {
        errors.push("Username minLength must be a positive number");
      }
      if (
        config.username.maxLength !== undefined &&
        (typeof config.username.maxLength !== "number" ||
          config.username.maxLength < config.username.minLength ||
          0)
      ) {
        errors.push(
          "Username maxLength must be a number greater than minLength",
        );
      }
      if (
        config.username.allowedChars &&
        !(config.username.allowedChars instanceof RegExp)
      ) {
        errors.push("Username allowedChars must be a RegExp");
      }
    }

    if (config.email) {
      if (
        config.email.maxLength !== undefined &&
        (typeof config.email.maxLength !== "number" ||
          config.email.maxLength < 1)
      ) {
        errors.push("Email maxLength must be a positive number");
      }
      if (config.email.pattern && !(config.email.pattern instanceof RegExp)) {
        errors.push("Email pattern must be a RegExp");
      }
    }

    if (config.file) {
      if (
        config.file.maxSize !== undefined &&
        (typeof config.file.maxSize !== "number" || config.file.maxSize <= 0)
      ) {
        errors.push("File maxSize must be a positive number");
      }
      if (
        config.file.allowedImageTypes &&
        !Array.isArray(config.file.allowedImageTypes)
      ) {
        errors.push("File allowedImageTypes must be an array");
      }
      if (
        config.file.allowedDocumentTypes &&
        !Array.isArray(config.file.allowedDocumentTypes)
      ) {
        errors.push("File allowedDocumentTypes must be an array");
      }
      if (
        config.file.allowedVideoTypes &&
        !Array.isArray(config.file.allowedVideoTypes)
      ) {
        errors.push("File allowedVideoTypes must be an array");
      }
      if (
        config.file.allowedAudioTypes &&
        !Array.isArray(config.file.allowedAudioTypes)
      ) {
        errors.push("File allowedAudioTypes must be an array");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate performance configuration
   */
  static validatePerformance(
    config: Partial<PerformanceConfig>,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (
      config.debounceDelay !== undefined &&
      (typeof config.debounceDelay !== "number" || config.debounceDelay < 0)
    ) {
      errors.push("Performance debounceDelay must be a non-negative number");
    }

    if (
      config.throttleDelay !== undefined &&
      (typeof config.throttleDelay !== "number" || config.throttleDelay < 0)
    ) {
      errors.push("Performance throttleDelay must be a non-negative number");
    }

    if (
      config.cacheTTL !== undefined &&
      (typeof config.cacheTTL !== "number" || config.cacheTTL <= 0)
    ) {
      errors.push("Performance cacheTTL must be a positive number");
    }

    if (
      config.maxCacheSize !== undefined &&
      (typeof config.maxCacheSize !== "number" || config.maxCacheSize <= 0)
    ) {
      errors.push("Performance maxCacheSize must be a positive number");
    }

    if (
      config.maxRetryAttempts !== undefined &&
      (typeof config.maxRetryAttempts !== "number" ||
        config.maxRetryAttempts < 0 ||
        config.maxRetryAttempts > 10)
    ) {
      errors.push(
        "Performance maxRetryAttempts must be a number between 0 and 10",
      );
    }

    if (
      config.healthCheckInterval !== undefined &&
      (typeof config.healthCheckInterval !== "number" ||
        config.healthCheckInterval <= 0)
    ) {
      errors.push("Performance healthCheckInterval must be a positive number");
    }

    if (
      config.metricsCollectionInterval !== undefined &&
      (typeof config.metricsCollectionInterval !== "number" ||
        config.metricsCollectionInterval <= 0)
    ) {
      errors.push(
        "Performance metricsCollectionInterval must be a positive number",
      );
    }

    if (config.memory) {
      if (
        config.memory.warningThreshold !== undefined &&
        (typeof config.memory.warningThreshold !== "number" ||
          config.memory.warningThreshold < 0 ||
          config.memory.warningThreshold > 1)
      ) {
        errors.push("Memory warningThreshold must be a number between 0 and 1");
      }
      if (
        config.memory.criticalThreshold !== undefined &&
        (typeof config.memory.criticalThreshold !== "number" ||
          config.memory.criticalThreshold < 0 ||
          config.memory.criticalThreshold > 1)
      ) {
        errors.push(
          "Memory criticalThreshold must be a number between 0 and 1",
        );
      }
      if (
        config.memory.warningThreshold !== undefined &&
        config.memory.criticalThreshold !== undefined &&
        config.memory.warningThreshold >= config.memory.criticalThreshold
      ) {
        errors.push(
          "Memory warningThreshold must be less than criticalThreshold",
        );
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate security configuration
   */
  static validateSecurity(config: Partial<SecurityConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.jwt) {
      if (
        config.jwt.defaultExpiry !== undefined &&
        (typeof config.jwt.defaultExpiry !== "number" ||
          config.jwt.defaultExpiry <= 0)
      ) {
        errors.push("JWT defaultExpiry must be a positive number");
      }
      if (
        config.jwt.refreshExpiry !== undefined &&
        (typeof config.jwt.refreshExpiry !== "number" ||
          config.jwt.refreshExpiry <= 0)
      ) {
        errors.push("JWT refreshExpiry must be a positive number");
      }
      if (config.jwt.algorithm && typeof config.jwt.algorithm !== "string") {
        errors.push("JWT algorithm must be a string");
      }
    }

    if (config.rateLimiting) {
      if (
        config.rateLimiting.defaultWindow !== undefined &&
        (typeof config.rateLimiting.defaultWindow !== "number" ||
          config.rateLimiting.defaultWindow <= 0)
      ) {
        errors.push("Rate limiting defaultWindow must be a positive number");
      }
      if (
        config.rateLimiting.defaultMaxRequests !== undefined &&
        (typeof config.rateLimiting.defaultMaxRequests !== "number" ||
          config.rateLimiting.defaultMaxRequests <= 0)
      ) {
        errors.push(
          "Rate limiting defaultMaxRequests must be a positive number",
        );
      }
    }

    if (config.cors) {
      if (
        config.cors.allowedOrigins &&
        !Array.isArray(config.cors.allowedOrigins)
      ) {
        errors.push("CORS allowedOrigins must be an array");
      }
      if (
        config.cors.allowedMethods &&
        !Array.isArray(config.cors.allowedMethods)
      ) {
        errors.push("CORS allowedMethods must be an array");
      }
      if (
        config.cors.allowedHeaders &&
        !Array.isArray(config.cors.allowedHeaders)
      ) {
        errors.push("CORS allowedHeaders must be an array");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate UI configuration
   */
  static validateUI(config: Partial<UIConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.theme && typeof config.theme !== "string") {
      errors.push("UI theme must be a string");
    }

    if (config.language && typeof config.language !== "string") {
      errors.push("UI language must be a string");
    }

    if (config.timezone && typeof config.timezone !== "string") {
      errors.push("UI timezone must be a string");
    }

    if (config.breakpoints) {
      const breakpointKeys = ["mobile", "tablet", "desktop", "largeDesktop"];
      for (const key of breakpointKeys) {
        if (
          config.breakpoints[key as keyof typeof config.breakpoints] !==
          undefined
        ) {
          const value =
            config.breakpoints[key as keyof typeof config.breakpoints];
          if (typeof value !== "number" || value <= 0) {
            errors.push(`UI breakpoint ${key} must be a positive number`);
          }
        }
      }
    }

    if (config.animation) {
      if (
        config.animation.duration !== undefined &&
        (typeof config.animation.duration !== "number" ||
          config.animation.duration < 0)
      ) {
        errors.push("Animation duration must be a non-negative number");
      }
      if (
        config.animation.easing &&
        typeof config.animation.easing !== "string"
      ) {
        errors.push("Animation easing must be a string");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate API configuration
   */
  static validateAPI(config: Partial<APIConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.version && typeof config.version !== "string") {
      errors.push("API version must be a string");
    }

    if (config.prefix && typeof config.prefix !== "string") {
      errors.push("API prefix must be a string");
    }

    if (config.pagination) {
      if (
        config.pagination.defaultPageSize !== undefined &&
        (typeof config.pagination.defaultPageSize !== "number" ||
          config.pagination.defaultPageSize <= 0)
      ) {
        errors.push("API pagination defaultPageSize must be a positive number");
      }
      if (
        config.pagination.maxPageSize !== undefined &&
        (typeof config.pagination.maxPageSize !== "number" ||
          config.pagination.maxPageSize <= 0)
      ) {
        errors.push("API pagination maxPageSize must be a positive number");
      }
      if (
        config.pagination.minPageSize !== undefined &&
        (typeof config.pagination.minPageSize !== "number" ||
          config.pagination.minPageSize <= 0)
      ) {
        errors.push("API pagination minPageSize must be a positive number");
      }
    }

    if (
      config.timeout !== undefined &&
      (typeof config.timeout !== "number" || config.timeout <= 0)
    ) {
      errors.push("API timeout must be a positive number");
    }

    if (
      config.retries !== undefined &&
      (typeof config.retries !== "number" || config.retries < 0)
    ) {
      errors.push("API retries must be a non-negative number");
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate storage configuration
   */
  static validateStorage(config: Partial<StorageConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.localStorage) {
      if (
        config.localStorage.enabled !== undefined &&
        typeof config.localStorage.enabled !== "boolean"
      ) {
        errors.push("LocalStorage enabled must be a boolean");
      }
      if (
        config.localStorage.prefix &&
        typeof config.localStorage.prefix !== "string"
      ) {
        errors.push("LocalStorage prefix must be a string");
      }
      if (
        config.localStorage.encryption !== undefined &&
        typeof config.localStorage.encryption !== "boolean"
      ) {
        errors.push("LocalStorage encryption must be a boolean");
      }
    }

    if (config.sessionStorage) {
      if (
        config.sessionStorage.enabled !== undefined &&
        typeof config.sessionStorage.enabled !== "boolean"
      ) {
        errors.push("SessionStorage enabled must be a boolean");
      }
      if (
        config.sessionStorage.prefix &&
        typeof config.sessionStorage.prefix !== "string"
      ) {
        errors.push("SessionStorage prefix must be a string");
      }
      if (
        config.sessionStorage.encryption !== undefined &&
        typeof config.sessionStorage.encryption !== "boolean"
      ) {
        errors.push("SessionStorage encryption must be a boolean");
      }
    }

    if (config.indexedDB) {
      if (
        config.indexedDB.enabled !== undefined &&
        typeof config.indexedDB.enabled !== "boolean"
      ) {
        errors.push("IndexedDB enabled must be a boolean");
      }
      if (config.indexedDB.name && typeof config.indexedDB.name !== "string") {
        errors.push("IndexedDB name must be a string");
      }
      if (
        config.indexedDB.version !== undefined &&
        (typeof config.indexedDB.version !== "number" ||
          config.indexedDB.version <= 0)
      ) {
        errors.push("IndexedDB version must be a positive number");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate features configuration
   */
  static validateFeatures(config: Partial<FeatureConfig>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const booleanFeatures = [
      "enableAnalytics",
      "enableDebugMode",
      "enablePerformanceMonitoring",
      "enableErrorReporting",
      "enableCaching",
      "enableOfflineMode",
      "enablePWA",
      "enableDarkMode",
      "enableI18n",
      "enableAccessibility",
    ];

    for (const feature of booleanFeatures) {
      if (
        config[feature as keyof FeatureConfig] !== undefined &&
        typeof config[feature as keyof FeatureConfig] !== "boolean"
      ) {
        errors.push(`Feature ${feature} must be a boolean`);
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Validate configuration
 */
export function validateConfig(
  config: Partial<ReynardConfig>,
): ValidationResult {
  return ConfigValidator.validate(config);
}

/**
 * Validate configuration section
 */
export function validateConfigSection<K extends keyof ReynardConfig>(
  section: K,
  config: ReynardConfig[K],
): ValidationResult {
  const partialConfig = { [section]: config } as Partial<ReynardConfig>;
  return ConfigValidator.validate(partialConfig);
}

/**
 * Check if configuration is valid
 */
export function isConfigValid(config: Partial<ReynardConfig>): boolean {
  return ConfigValidator.validate(config).isValid;
}

/**
 * Get configuration validation errors
 */
export function getConfigErrors(config: Partial<ReynardConfig>): string[] {
  return ConfigValidator.validate(config).errors;
}

/**
 * Get configuration validation warnings
 */
export function getConfigWarnings(config: Partial<ReynardConfig>): string[] {
  return ConfigValidator.validate(config).warnings;
}
