/**
 * Generator Management Service
 *
 * Manages caption generator lifecycle and availability.
 */

import { CaptionGenerator } from "../types/index.js";
import { CaptionApiClient } from "../clients/index.js";
import { GeneratorConverter } from "./GeneratorConverter.js";

export class GeneratorManager {
  private generators: Map<string, CaptionGenerator> = new Map();

  constructor(private client: CaptionApiClient) {}

  async initializeGenerators(): Promise<void> {
    try {
      const generators = await this.client.getAvailableGenerators();
      Object.values(generators).forEach((generatorInfo) => {
        const generator =
          GeneratorConverter.convertGeneratorInfo(generatorInfo);
        this.generators.set(generator.name, generator);
      });
    } catch (error) {
      console.error("Failed to initialize generators:", error);
    }
  }

  async getAvailableGenerators(): Promise<CaptionGenerator[]> {
    try {
      const generators = await this.client.getAvailableGenerators();
      return GeneratorConverter.convertGeneratorInfos(generators);
    } catch (error) {
      console.error("Failed to get available generators:", error);
      return Array.from(this.generators.values());
    }
  }

  getGenerator(name: string): CaptionGenerator | undefined {
    return this.generators.get(name);
  }

  isGeneratorAvailable(name: string): boolean {
    const generator = this.generators.get(name);
    return generator?.isAvailable ?? false;
  }

  async preloadModel(name: string): Promise<void> {
    try {
      await this.client.loadModel(name);
    } catch (error) {
      console.error(`Failed to preload model ${name}:`, error);
      throw error;
    }
  }

  async unloadModel(name: string): Promise<void> {
    try {
      await this.client.unloadModel(name);
    } catch (error) {
      console.error(`Failed to unload model ${name}:`, error);
      throw error;
    }
  }
}
