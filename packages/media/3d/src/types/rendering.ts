// Rendering utilities and barrel exports
// Refactored from monolithic file to follow 140-line axiom

import type { EmbeddingPoint, EmbeddingRenderingConfig } from "./core";
import type { MaterialManager, GeometryManager } from "./managers";

// Re-export all types for backward compatibility
export * from "./core";
export * from "./threejs";
export * from "./visualization";
export * from "./managers";

// Rendering utilities
export const RENDERING_UTILS = {
  applyColorMapping: (_points: EmbeddingPoint[], _colorMapping: string) => {
    // Implementation will be in the actual utility file
  },
  applySizeMapping: (_points: EmbeddingPoint[], _sizeMapping: string, _baseSize: number) => {
    // Implementation will be in the actual utility file
  },
  filterPoints: (_points: EmbeddingPoint[], _config: EmbeddingRenderingConfig) => {
    // Implementation will be in the actual utility file
    return [] as EmbeddingPoint[];
  },
};
