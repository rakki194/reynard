/**
 * Generator Management Service
 *
 * Manages caption generator lifecycle and availability.
 */
import { GeneratorConverter } from "./GeneratorConverter.js";
export class GeneratorManager {
    constructor(client) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: client
        });
        Object.defineProperty(this, "generators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    async initializeGenerators() {
        try {
            const generators = await this.client.getAvailableGenerators();
            Object.values(generators).forEach((generatorInfo) => {
                const generator = GeneratorConverter.convertGeneratorInfo(generatorInfo);
                this.generators.set(generator.name, generator);
            });
        }
        catch (error) {
            console.error("Failed to initialize generators:", error);
        }
    }
    async getAvailableGenerators() {
        try {
            const generators = await this.client.getAvailableGenerators();
            return GeneratorConverter.convertGeneratorInfos(generators);
        }
        catch (error) {
            console.error("Failed to get available generators:", error);
            return Array.from(this.generators.values());
        }
    }
    getGenerator(name) {
        return this.generators.get(name);
    }
    isGeneratorAvailable(name) {
        const generator = this.generators.get(name);
        return generator?.isAvailable ?? false;
    }
    async preloadModel(name) {
        try {
            await this.client.loadModel(name);
        }
        catch (error) {
            console.error(`Failed to preload model ${name}:`, error);
            throw error;
        }
    }
    async unloadModel(name) {
        try {
            await this.client.unloadModel(name);
        }
        catch (error) {
            console.error(`Failed to unload model ${name}:`, error);
            throw error;
        }
    }
}
