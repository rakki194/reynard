/**
 * @fileoverview Config utilities: load, validate, merge
 */
import { GeneratorConfig } from "./types/core";
export declare function loadConfig(configPath: string): Promise<GeneratorConfig>;
export declare function validateConfig(config: GeneratorConfig): {
    isValid: boolean;
    errors: string[];
};
export declare function mergeConfig(base: Partial<GeneratorConfig>, override: Partial<GeneratorConfig>): GeneratorConfig;
