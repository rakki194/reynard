/**
 * Example usage of the Dynamic Enum System
 */

import { DynamicEnumService, SpiritEnumProvider, StyleEnumProvider, APIClientAdapter, FileDataAdapter } from "./src";

// Example 1: Basic usage with fallback data
async function basicExample() {
  console.log("=== Basic Example ===");

  const service = new DynamicEnumService({
    enableCaching: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    fallbackStrategy: "warn",
  });

  // Create spirit provider with fallback data
  const spiritProvider = new SpiritEnumProvider({
    enumType: "spirits",
    fallbackData: {
      fox: {
        value: "fox",
        weight: 0.4,
        metadata: {
          emoji: "🦊",
          description: "Strategic and cunning",
          category: "canine",
        },
      },
      wolf: {
        value: "wolf",
        weight: 0.25,
        metadata: {
          emoji: "🐺",
          description: "Pack-oriented and loyal",
          category: "canine",
        },
      },
      otter: {
        value: "otter",
        weight: 0.35,
        metadata: {
          emoji: "🦦",
          description: "Playful and thorough",
          category: "aquatic",
        },
      },
    },
    defaultFallback: "fox",
  });

  // Register the provider
  service.registerProvider("spirits", spiritProvider);

  // Get random spirit
  const randomSpirit = await service.getRandomValue("spirits");
  console.log("Random spirit:", randomSpirit.value);
  console.log("Metadata:", randomSpirit.metadata);

  // Get all spirit data
  const spiritData = await service.getEnumData("spirits");
  console.log("Available spirits:", Object.keys(spiritData));

  // Get spirit by category
  const canineSpirits = await spiritProvider.getSpiritsByCategory("canine");
  console.log("Canine spirits:", Object.keys(canineSpirits));

  // Get spirit statistics
  const stats = await spiritProvider.getSpiritStatistics();
  console.log("Spirit statistics:", stats);
}

// Example 2: Using API data source
async function apiExample() {
  console.log("\n=== API Example ===");

  const apiAdapter = new APIClientAdapter({
    baseUrl: "https://api.example.com",
    endpoint: "enums",
    timeout: 10000,
    headers: {
      Authorization: "Bearer your-token",
    },
    retryConfig: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    },
  });

  const service = new DynamicEnumService({
    dataProvider: apiAdapter,
    enableCaching: true,
    cacheTimeout: 5 * 60 * 1000,
  });

  // Create provider with API data source
  service.createAndRegisterProvider(
    "spirits",
    {
      enumType: "spirits",
      fallbackData: {
        fox: { value: "fox", weight: 0.4, metadata: { emoji: "🦊" } },
      },
      defaultFallback: "fox",
    },
    apiAdapter
  );

  try {
    const spiritData = await service.getEnumData("spirits");
    console.log("API spirit data:", Object.keys(spiritData));
  } catch (error) {
    console.log("API failed, using fallback:", error);
  }
}

// Example 3: Using file data source
async function fileExample() {
  console.log("\n=== File Example ===");

  const fileAdapter = new FileDataAdapter({
    filePath: "./data/spirits.json",
    format: "json",
    watch: true,
  });

  const service = new DynamicEnumService({
    dataProvider: fileAdapter,
  });

  // Create provider with file data source
  service.createAndRegisterProvider(
    "spirits",
    {
      enumType: "spirits",
      fallbackData: {
        fox: { value: "fox", weight: 0.4, metadata: { emoji: "🦊" } },
      },
      defaultFallback: "fox",
    },
    fileAdapter
  );

  try {
    const spiritData = await service.getEnumData("spirits");
    console.log("File spirit data:", Object.keys(spiritData));
  } catch (error) {
    console.log("File failed, using fallback:", error);
  }
}

// Example 4: Performance monitoring
async function performanceExample() {
  console.log("\n=== Performance Example ===");

  const service = new DynamicEnumService({
    enableMetrics: true,
    enableCaching: true,
  });

  // Create and register providers
  const spiritProvider = new SpiritEnumProvider({
    enumType: "spirits",
    fallbackData: {
      fox: { value: "fox", weight: 0.4, metadata: { emoji: "🦊" } },
      wolf: { value: "wolf", weight: 0.25, metadata: { emoji: "🐺" } },
    },
    defaultFallback: "fox",
  });

  const styleProvider = new StyleEnumProvider({
    enumType: "styles",
    fallbackData: {
      foundation: { value: "foundation", weight: 1.0, metadata: { type: "strategic" } },
      exo: { value: "exo", weight: 1.0, metadata: { type: "technical" } },
    },
    defaultFallback: "foundation",
  });

  service.registerProvider("spirits", spiritProvider);
  service.registerProvider("styles", styleProvider);

  // Perform some operations
  for (let i = 0; i < 10; i++) {
    await service.getRandomValue("spirits");
    await service.getRandomValue("styles");
    await service.getEnumData("spirits");
  }

  // Get metrics
  const metrics = service.getMetrics();
  console.log("Service metrics:", {
    requests: metrics.requests,
    cacheHits: metrics.cacheHits,
    cacheMisses: metrics.cacheMisses,
    averageResponseTime: metrics.averageResponseTime,
    providerCount: metrics.providerCount,
  });

  // Get cache statistics
  const cacheStats = service.getCacheStats();
  console.log("Cache statistics:", {
    size: cacheStats.size,
    hitRate: cacheStats.hitRate,
    totalAccesses: cacheStats.totalAccesses,
  });

  // Get provider statistics
  const providerStats = service.getProviderStats();
  console.log("Provider statistics:", providerStats);
}

// Example 5: Custom provider
async function customProviderExample() {
  console.log("\n=== Custom Provider Example ===");

  class CustomEnumProvider extends SpiritEnumProvider {
    protected async fetchEnumData() {
      // Simulate custom data fetching
      return {
        custom1: {
          value: "custom1",
          weight: 0.5,
          metadata: {
            emoji: "🎯",
            description: "Custom spirit 1",
            category: "custom",
          },
        },
        custom2: {
          value: "custom2",
          weight: 0.5,
          metadata: {
            emoji: "⚡",
            description: "Custom spirit 2",
            category: "custom",
          },
        },
      };
    }
  }

  const service = new DynamicEnumService();
  const customProvider = new CustomEnumProvider({
    enumType: "custom",
    fallbackData: {
      fallback: { value: "fallback", weight: 1.0, metadata: {} },
    },
    defaultFallback: "fallback",
  });

  service.registerProvider("custom", customProvider);

  const customData = await service.getEnumData("custom");
  console.log("Custom data:", Object.keys(customData));

  const randomCustom = await service.getRandomValue("custom");
  console.log("Random custom value:", randomCustom.value);
}

// Run all examples
async function runExamples() {
  try {
    await basicExample();
    await apiExample();
    await fileExample();
    await performanceExample();
    await customProviderExample();
  } catch (error) {
    console.error("Example failed:", error);
  }
}

// Export for use in other files
export { basicExample, apiExample, fileExample, performanceExample, customProviderExample, runExamples };

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
