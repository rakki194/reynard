/**
 * Configuration Validation for Reynard Framework
 *
 * Validation utilities for configuration objects to ensure
 * consistency and correctness across Reynard packages.
 */
import { APIConfig, FeatureConfig, HTTPConfig, PerformanceConfig, ReynardConfig, SecurityConfig, StorageConfig, UIConfig, ValidationConfig, ValidationResult } from "./types";
export declare class ConfigValidator {
    /**
     * Validate complete configuration
     */
    static validate(config: Partial<ReynardConfig>): ValidationResult;
    /**
     * Validate HTTP configuration
     */
    static validateHTTP(config: Partial<HTTPConfig>): ValidationResult;
    /**
     * Validate validation configuration
     */
    static validateValidation(config: Partial<ValidationConfig>): ValidationResult;
    /**
     * Validate performance configuration
     */
    static validatePerformance(config: Partial<PerformanceConfig>): ValidationResult;
    /**
     * Validate security configuration
     */
    static validateSecurity(config: Partial<SecurityConfig>): ValidationResult;
    /**
     * Validate UI configuration
     */
    static validateUI(config: Partial<UIConfig>): ValidationResult;
    /**
     * Validate API configuration
     */
    static validateAPI(config: Partial<APIConfig>): ValidationResult;
    /**
     * Validate storage configuration
     */
    static validateStorage(config: Partial<StorageConfig>): ValidationResult;
    /**
     * Validate features configuration
     */
    static validateFeatures(config: Partial<FeatureConfig>): ValidationResult;
}
/**
 * Validate configuration
 */
export declare function validateConfig(config: Partial<ReynardConfig>): ValidationResult;
/**
 * Validate configuration section
 */
export declare function validateConfigSection<K extends keyof ReynardConfig>(section: K, config: ReynardConfig[K]): ValidationResult;
/**
 * Check if configuration is valid
 */
export declare function isConfigValid(config: Partial<ReynardConfig>): boolean;
/**
 * Get configuration validation errors
 */
export declare function getConfigErrors(config: Partial<ReynardConfig>): string[];
/**
 * Get configuration validation warnings
 */
export declare function getConfigWarnings(config: Partial<ReynardConfig>): string[];
