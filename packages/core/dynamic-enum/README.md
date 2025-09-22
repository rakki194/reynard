# Reynard Dynamic Enum System

A modular, provider-based TypeScript system for managing dynamic enums with intelligent caching, fallback strategies, and comprehensive validation.

## Features

- **🔄 Dynamic Data Sources**: Fetch enum data from APIs, files, databases, or custom sources
- **🏗️ Provider Pattern**: Modular architecture with specialized providers for different enum types
- **⚡ Intelligent Caching**: Configurable caching with TTL, cleanup, and performance metrics
- **🛡️ Fallback Strategies**: Graceful degradation when primary data sources fail
- **✅ Comprehensive Validation**: Type-safe validation with detailed error reporting
- **📊 Performance Metrics**: Built-in monitoring and analytics
- **🎯 TypeScript First**: Full type safety with comprehensive type definitions

## Installation

```bash
pnpm add reynard-dynamic-enum
```

## Quick Start

```typescript
import { DynamicEnumService, SpiritEnumProvider } from 'reynard-dynamic-enum';

// Create the service
const service = new DynamicEnumService({
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  fallbackStrategy: 'warn'
});

// Create a spirit provider
const spiritProvider = new SpiritEnumProvider({
  enumType: 'spirits',
  fallbackData: {
    fox: {
      value: 'fox',
      weight: 0.4,
      metadata: {
        emoji: '🦊',
        description: 'Strategic and cunning',
        category: 'canine'
      }
    },
    wolf: {
      value: 'wolf',
      weight: 0.25,
      metadata: {
        emoji: '🐺',
        description: 'Pack-oriented and loyal',
        category: 'canine'
      }
    }
  },
  defaultFallback: 'fox'
});

// Register the provider
service.registerProvider('spirits', spiritProvider);

// Use the service
const randomSpirit = await service.getRandomValue('spirits');
console.log(randomSpirit.value); // 'fox' or 'wolf'

const spiritData = await service.getEnumData('spirits');
console.log(spiritData.fox.metadata.emoji); // '🦊'
```

## Architecture

### Core Components

- **DynamicEnumService**: Main orchestrator that manages providers and data flow
- **EnumProvider**: Abstract base class for specialized enum providers
- **EnumDataProvider**: Interface for fetching data from various sources
- **CacheManager**: Intelligent caching with TTL and cleanup
- **FallbackManager**: Graceful degradation when primary sources fail
- **ValidationUtils**: Comprehensive validation and sanitization

### Provider Types

- **SpiritEnumProvider**: Animal spirit enums with weighted selection
- **StyleEnumProvider**: Naming style enums with type categorization
- **TraitEnumProvider**: Personality/physical/ability trait enums
- **CustomEnumProvider**: User-defined enums with custom data

### Data Adapters

- **APIClientAdapter**: REST API data fetching with retry logic
- **FileDataAdapter**: Local file data loading (JSON, YAML, TOML)
- **CompositeDataAdapter**: Multiple data sources with fallback logic

## API Reference

### DynamicEnumService

#### Constructor

```typescript
new DynamicEnumService(config?: EnumServiceConfig)
```

**Configuration Options:**

```typescript
interface EnumServiceConfig {
  enableCaching?: boolean;        // Enable intelligent caching (default: true)
  cacheTimeout?: number;          // Cache TTL in milliseconds (default: 5 minutes)
  fallbackStrategy?: 'silent' | 'warn' | 'error'; // Error handling strategy
  enableMetrics?: boolean;        // Enable performance metrics (default: true)
  maxRetries?: number;           // Maximum retry attempts (default: 3)
  dataProvider?: EnumDataProvider; // Custom data provider
}
```

#### Methods

```typescript
// Provider Management
registerProvider(enumType: string, provider: EnumProvider): void
createAndRegisterProvider(enumType: string, config: any, dataProvider?: EnumDataProvider): void
unregisterProvider(enumType: string): void
hasProvider(enumType: string): boolean
getRegisteredTypes(): string[]

// Data Operations
getEnumData(enumType: string, options?: EnumOperationOptions): Promise<EnumData>
getEnumValue(enumType: string, key: string, options?: EnumOperationOptions): Promise<EnumValue | null>
getMetadata(enumType: string, key: string): Promise<any>
validateValue(enumType: string, value: string): ValidationResult

// Random Selection
getRandomValue(enumType: string, options?: EnumOperationOptions): Promise<EnumResult>
getRandomValues(enumType: string, count: number, options?: EnumOperationOptions): Promise<EnumResult[]>

// Utility Methods
hasValue(enumType: string, value: string): Promise<boolean>
getKeys(enumType: string): Promise<string[]>
getCount(enumType: string): Promise<number>
refresh(enumType: string): Promise<void>
refreshAll(): Promise<void>

// Statistics and Monitoring
getMetrics(): EnumServiceMetrics
getCacheStats(): any
getFallbackStats(): any
getProviderStats(): any

// Fallback Management
setFallbackData(enumType: string, data: EnumData): void
setDefaultFallback(enumType: string, value: string): void

// Lifecycle
destroy(): void
```

### EnumProvider

#### BaseEnumProvider

```typescript
abstract class BaseEnumProvider implements EnumProvider {
  constructor(config: EnumProviderConfig, dataProvider?: EnumDataProvider)
  
  // Core Methods
  getEnumType(): string
  getEnumData(options?: EnumOperationOptions): Promise<EnumData>
  getEnumValue(key: string, options?: EnumOperationOptions): Promise<EnumValue | null>
  getMetadata(key: string): Promise<EnumMetadata | null>
  validateValue(value: string): ValidationResult
  getRandomValue(options?: EnumOperationOptions): Promise<EnumResult>
  getRandomValues(count: number, options?: EnumOperationOptions): Promise<EnumResult[]>
  
  // Utility Methods
  hasValue(value: string): boolean
  getKeys(): string[]
  getCount(): number
  refresh(): Promise<void>
  isReady(): boolean
}
```

#### SpiritEnumProvider

```typescript
class SpiritEnumProvider extends BaseEnumProvider {
  // Specialized Methods
  getRandomSpirit(weighted?: boolean): Promise<EnumValue>
  getSpiritsByCategory(category: string): Promise<EnumData>
  getSpiritCategories(): Promise<string[]>
  getSpiritByEmoji(emoji: string): Promise<EnumValue | null>
  getHighWeightSpirits(threshold?: number): Promise<EnumData>
  getLowWeightSpirits(threshold?: number): Promise<EnumData>
  getSpiritStatistics(): Promise<SpiritStatistics>
}
```

### Data Adapters

#### APIClientAdapter

```typescript
class APIClientAdapter implements EnumDataProvider {
  constructor(config: APIDataProviderConfig)
  
  fetchEnumData(enumType: string): Promise<EnumData>
  isAvailable(): Promise<boolean>
  getProviderName(): string
}
```

**Configuration:**

```typescript
interface APIDataProviderConfig {
  baseUrl: string;                    // Base URL for the API
  endpoint: string;                   // API endpoint for fetching enum data
  timeout?: number;                   // Request timeout in milliseconds
  headers?: Record<string, string>;   // Authentication headers
  retryConfig?: {                     // Request retry configuration
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}
```

#### FileDataAdapter

```typescript
class FileDataAdapter implements EnumDataProvider {
  constructor(config: FileDataProviderConfig)
  
  fetchEnumData(enumType: string): Promise<EnumData>
  isAvailable(): Promise<boolean>
  getProviderName(): string
}
```

**Configuration:**

```typescript
interface FileDataProviderConfig {
  filePath: string;        // Path to the data file
  format: 'json' | 'yaml' | 'toml'; // File format
  watch?: boolean;         // Whether to watch for file changes
}
```

## Usage Examples

### Basic Usage

```typescript
import { DynamicEnumService, SpiritEnumProvider } from 'reynard-dynamic-enum';

const service = new DynamicEnumService();

// Create and register a spirit provider
const spiritProvider = new SpiritEnumProvider({
  enumType: 'spirits',
  fallbackData: {
    fox: { value: 'fox', weight: 0.4, metadata: { emoji: '🦊' } },
    wolf: { value: 'wolf', weight: 0.25, metadata: { emoji: '🐺' } }
  },
  defaultFallback: 'fox'
});

service.registerProvider('spirits', spiritProvider);

// Get random spirit
const spirit = await service.getRandomValue('spirits');
console.log(spirit.value); // 'fox' or 'wolf'

// Get spirit data
const data = await service.getEnumData('spirits');
console.log(data.fox.metadata.emoji); // '🦊'
```

### With API Data Source

```typescript
import { DynamicEnumService, APIClientAdapter } from 'reynard-dynamic-enum';

const apiAdapter = new APIClientAdapter({
  baseUrl: 'https://api.example.com',
  endpoint: 'enums',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});

const service = new DynamicEnumService({
  dataProvider: apiAdapter,
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000
});

// Create provider with API data source
service.createAndRegisterProvider('spirits', {
  enumType: 'spirits',
  fallbackData: { /* fallback data */ },
  defaultFallback: 'fox'
}, apiAdapter);
```

### With File Data Source

```typescript
import { DynamicEnumService, FileDataAdapter } from 'reynard-dynamic-enum';

const fileAdapter = new FileDataAdapter({
  filePath: '/path/to/spirits.json',
  format: 'json',
  watch: true
});

const service = new DynamicEnumService({
  dataProvider: fileAdapter
});

// Create provider with file data source
service.createAndRegisterProvider('spirits', {
  enumType: 'spirits',
  fallbackData: { /* fallback data */ },
  defaultFallback: 'fox'
}, fileAdapter);
```

### Custom Provider

```typescript
import { BaseEnumProvider } from 'reynard-dynamic-enum';

class CustomEnumProvider extends BaseEnumProvider {
  protected async fetchEnumData(): Promise<EnumData> {
    // Custom data fetching logic
    return {
      custom1: { value: 'custom1', weight: 1.0, metadata: {} },
      custom2: { value: 'custom2', weight: 1.0, metadata: {} }
    };
  }
}

const service = new DynamicEnumService();
const customProvider = new CustomEnumProvider({
  enumType: 'custom',
  fallbackData: { /* fallback data */ },
  defaultFallback: 'custom1'
});

service.registerProvider('custom', customProvider);
```

### Performance Monitoring

```typescript
const service = new DynamicEnumService({
  enableMetrics: true
});

// Use the service...
await service.getRandomValue('spirits');
await service.getEnumData('spirits');

// Get metrics
const metrics = service.getMetrics();
console.log('Total requests:', metrics.requests);
console.log('Cache hits:', metrics.cacheHits);
console.log('Average response time:', metrics.averageResponseTime);

// Get cache statistics
const cacheStats = service.getCacheStats();
console.log('Cache size:', cacheStats.size);
console.log('Hit rate:', cacheStats.hitRate);
```

## Type Definitions

### Core Types

```typescript
interface EnumValue {
  value: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

interface EnumData {
  [key: string]: EnumValue;
}

interface EnumMetadata {
  emoji?: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

interface ValidationResult {
  isValid: boolean;
  value: string | null;
  error: string | null;
}

interface EnumResult {
  value: string;
  metadata?: EnumMetadata;
  fromCache?: boolean;
  isFallback?: boolean;
}
```

## Error Handling

The system provides comprehensive error handling with multiple fallback strategies:

- **Silent**: Failures are logged but don't interrupt execution
- **Warn**: Failures are logged with warnings
- **Error**: Failures are logged as errors

```typescript
const service = new DynamicEnumService({
  fallbackStrategy: 'warn' // or 'silent' or 'error'
});
```

## Performance Considerations

- **Caching**: Enable caching for frequently accessed data
- **Batch Operations**: Use batch methods when possible
- **Provider Optimization**: Implement efficient data fetching in custom providers
- **Memory Management**: Monitor cache size and cleanup intervals

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/reynard/dynamic-enum).
