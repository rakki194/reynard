/**
 * Generator Management Service
 *
 * Manages caption generator lifecycle and availability.
 */
import { CaptionGenerator } from "../types/index.js";
import { CaptionApiClient } from "../clients/index.js";
export declare class GeneratorManager {
    private client;
    private generators;
    constructor(client: CaptionApiClient);
    initializeGenerators(): Promise<void>;
    getAvailableGenerators(): Promise<CaptionGenerator[]>;
    getGenerator(name: string): CaptionGenerator | undefined;
    isGeneratorAvailable(name: string): boolean;
    preloadModel(name: string): Promise<void>;
    unloadModel(name: string): Promise<void>;
}
