/**
 * Reynard Gallery AI
 * 
 * AI-enhanced gallery components for the Reynard framework.
 * Integrates caption generation, batch annotation, and smart features
 * with the core gallery system.
 */

// Main exports
export { AIGalleryProvider } from './components/AIGalleryProvider';
export { useGalleryAI, useAIGalleryContext } from './composables/useGalleryAI';

// Type exports
export * from './types';

// Re-export everything for convenience
export * from './components';
export * from './composables';
