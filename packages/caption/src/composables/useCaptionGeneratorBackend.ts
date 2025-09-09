/**
 * Caption Generator Backend Composable
 * 
 * Manages backend initialization and generator discovery.
 * Extracted to keep the main component under the 140-line limit.
 */

import { onMount, onCleanup } from "solid-js";
import { createBackendAnnotationManager } from "reynard-annotating";
import type { CaptionGeneratorState, GeneratorInfo } from "./useCaptionGeneratorState";

export interface BackendConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface CaptionGeneratorBackend {
  manager: ReturnType<typeof createBackendAnnotationManager> | null;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}

/**
 * Creates backend management for the caption generator
 */
export function useCaptionGeneratorBackend(
  state: CaptionGeneratorState,
  config?: BackendConfig
): CaptionGeneratorBackend {
  let manager: ReturnType<typeof createBackendAnnotationManager> | null = null;

  const initialize = async () => {
    try {
      manager = createBackendAnnotationManager({
        baseUrl: config?.baseUrl || "http://localhost:8000",
        apiKey: config?.apiKey,
      });
      
      await manager.initialize();
      
      // Get available generators
      const generators = await manager.getAvailableGenerators();
      const generatorInfos: GeneratorInfo[] = [
        {
          name: "jtp2",
          displayName: "JTP2 (Furry Tags)",
          description: "Specialized for furry and anthropomorphic content",
          available: generators.some(g => g.name === "jtp2"),
          loading: false,
        },
        {
          name: "joycaption",
          displayName: "JoyCaption (Detailed)",
          description: "Detailed descriptive captions",
          available: generators.some(g => g.name === "joycaption"),
          loading: false,
        },
        {
          name: "wdv3",
          displayName: "WDv3 (Anime Tags)",
          description: "Anime and manga style tags",
          available: generators.some(g => g.name === "wdv3"),
          loading: false,
        },
        {
          name: "florence2",
          displayName: "Florence2 (General)",
          description: "General purpose image captions",
          available: generators.some(g => g.name === "florence2"),
          loading: false,
        },
      ];
      
      state.setAvailableGenerators(generatorInfos);
    } catch (err) {
      state.setError(`Failed to initialize backend: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const shutdown = async () => {
    if (manager) {
      await manager.shutdown();
    }
  };

  // Auto-initialize on mount
  onMount(initialize);
  onCleanup(shutdown);

  return {
    get manager() { return manager; },
    initialize,
    shutdown,
  };
}
