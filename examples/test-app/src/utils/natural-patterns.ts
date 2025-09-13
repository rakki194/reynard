/**
 * 🦊 Natural Pattern Configurations
 * Predefined configurations for different natural phyllotactic patterns
 */

/**
 * Calculate optimal parameters for different natural patterns
 */
export const NATURAL_PATTERNS = {
  sunflower: {
    pointCount: 200,
    spiralGrowth: 2.5,
    baseRadius: 20,
    colorSaturation: 0.3,
    colorLightness: 0.7,
    description: "Sunflower seed arrangement - optimal packing for maximum seeds",
  },
  pinecone: {
    pointCount: 150,
    spiralGrowth: 1.8,
    baseRadius: 15,
    colorSaturation: 0.2,
    colorLightness: 0.6,
    description: "Pinecone scale arrangement - compact spiral pattern",
  },
  cactus: {
    pointCount: 100,
    spiralGrowth: 3.2,
    baseRadius: 25,
    colorSaturation: 0.4,
    colorLightness: 0.8,
    description: "Cactus spine arrangement - wide spiral for protection",
  },
  fibonacci: {
    pointCount: 300,
    spiralGrowth: 2.0,
    baseRadius: 10,
    colorSaturation: 0.25,
    colorLightness: 0.65,
    description: "Pure Fibonacci spiral - mathematical perfection",
  },
} as const;
