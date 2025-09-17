// Rendering utilities and barrel exports
// Refactored from monolithic file to follow 140-line axiom
// Re-export all types for backward compatibility
export * from "./core";
export * from "./threejs";
export * from "./visualization";
export * from "./managers";
// Rendering utilities
export const RENDERING_UTILS = {
    applyColorMapping: (_points, _colorMapping) => {
        // Implementation will be in the actual utility file
    },
    applySizeMapping: (_points, _sizeMapping, _baseSize) => {
        // Implementation will be in the actual utility file
    },
    filterPoints: (_points, _config) => {
        // Implementation will be in the actual utility file
        return [];
    },
};
