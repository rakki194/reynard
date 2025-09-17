/**
 * @fileoverview Main documentation generator orchestrator
 */
import type { GeneratorConfig } from "./config/types/core";
import { DocEngineConfig } from "./types.js";
export declare class ReynardDocGenerator {
    private config;
    private isWatching;
    constructor(config: GeneratorConfig);
    generate(): Promise<DocEngineConfig>;
    watch(): Promise<void>;
}
export declare function createDocGenerator(config: GeneratorConfig): ReynardDocGenerator;
