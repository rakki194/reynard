# reynard-features

Advanced feature system for managing application features, dependencies, and capabilities. This package provides a comprehensive framework for feature registration, dependency resolution, and runtime feature management.

## Features

- **Feature Registry**: Centralized registration and management of application features
- **Dependency Resolution**: Automatic dependency checking and resolution
- **Service-Aware Features**: Features that depend on external services
- **Reactive State**: SolidJS integration with reactive feature status updates
- **Configuration Management**: Runtime feature configuration and customization
- **Preset Definitions**: Common feature definitions for typical applications
- **Health Monitoring**: Feature health scoring and status tracking

## Installation

```bash
npm install reynard-features
```

## Usage

### Basic Setup

```typescript
import { FeatureProvider, useFeatures } from 'reynard-features';
import { COMMON_FEATURES } from 'reynard-features/presets';

function App() {
  return (
    <FeatureProvider config={{
      features: COMMON_FEATURES,
      serviceChecker: (serviceName) => {
        // Check if service is available
        return checkServiceAvailability(serviceName);
      },
      autoRefresh: true,
      refreshInterval: 30000
    }}>
      <MyApp />
    </FeatureProvider>
  );
}
```

### Using Features in Components

```typescript
import { useFeatureAvailable, useFeatureStatus } from 'reynard-features';

function MyComponent() {
  const isImageProcessingAvailable = useFeatureAvailable('image-processing');
  const captionStatus = useFeatureStatus('caption-generation');

  return (
    <div>
      {isImageProcessingAvailable() && (
        <ImageProcessor />
      )}
      
      {captionStatus()?.degraded && (
        <div class="warning">
          Caption generation is degraded: {captionStatus()?.message}
        </div>
      )}
    </div>
  );
}
```

### Feature-Aware Components

```typescript
import { useFeatureAware } from 'reynard-features';

function FeatureAwareComponent() {
  const { isAvailable, isDegraded, shouldRender, fallback } = useFeatureAware(
    'object-detection',
    <div>Object detection not available</div>
  );

  return (
    <div>
      {shouldRender() ? (
        <ObjectDetector />
      ) : (
        fallback
      )}
    </div>
  );
}
```

### Feature Configuration

```typescript
import { useFeatureConfiguration } from 'reynard-features';

function FeatureSettings() {
  const { config, updateConfig, setConfigValue } = useFeatureConfiguration('image-processing');

  const handleThresholdChange = (value: number) => {
    setConfigValue('threshold', value);
  };

  return (
    <div>
      <label>
        Processing Threshold:
        <input 
          type="range" 
          value={config()?.threshold || 0.5}
          onInput={(e) => handleThresholdChange(parseFloat(e.target.value))}
        />
      </label>
    </div>
  );
}
```

### Custom Feature Definitions

```typescript
import { FeatureProvider } from 'reynard-features';

const customFeatures = [
  {
    id: 'my-custom-feature',
    name: 'Custom Feature',
    description: 'A custom feature for my application',
    dependencies: [
      { services: ['MyService'], required: true },
      { services: ['OptionalService'], required: false }
    ],
    category: 'utility',
    priority: 'medium',
    tags: ['custom', 'utility'],
    defaultConfig: {
      enabled: true,
      timeout: 5000
    }
  }
];

function App() {
  return (
    <FeatureProvider config={{
      features: customFeatures,
      serviceChecker: (serviceName) => checkService(serviceName)
    }}>
      <MyApp />
    </FeatureProvider>
  );
}
```

### Dependency Resolution

```typescript
import { DependencyResolver } from 'reynard-features';

const resolver = new DependencyResolver();

// Add features
resolver.addFeature(myFeature);

// Set service availability
resolver.setServiceAvailability('MyService', true);

// Resolve dependencies
const result = resolver.resolveDependencies();

console.log('Resolvable features:', result.resolvable);
console.log('Unresolvable features:', result.unresolvable);
console.log('Resolution order:', result.resolutionOrder);
```

### Feature Categories and Priorities

```typescript
import { 
  FEATURE_CATEGORIES, 
  FEATURE_PRIORITIES,
  useFeaturesByCategory,
  useFeaturesByPriority 
} from 'reynard-features';

function FeatureDashboard() {
  const coreFeatures = useFeaturesByCategory('core');
  const criticalFeatures = useFeaturesByPriority('critical');

  return (
    <div>
      <h2>Core Features</h2>
      {coreFeatures().map(feature => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
      
      <h2>Critical Features</h2>
      {criticalFeatures().map(feature => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
```

## API Reference

### Core Types

- `FeatureDefinition` - Feature configuration interface
- `FeatureStatus` - Runtime feature status information
- `FeatureDependency` - Service dependency definition
- `FeatureConfig` - Feature system configuration

### Hooks

- `useFeatures()` - Access the feature context
- `useFeatureAvailable(featureId)` - Check if feature is available
- `useFeatureDegraded(featureId)` - Check if feature is degraded
- `useFeatureStatus(featureId)` - Get detailed feature status
- `useFeatureConfig(featureId)` - Get feature configuration
- `useFeaturesByCategory(category)` - Get features by category
- `useFeaturesByPriority(priority)` - Get features by priority
- `useCriticalFeatures()` - Get critical features status
- `useFeaturesByService(serviceName)` - Get features dependent on service
- `useFeatureAware(featureId, fallback)` - Create feature-aware component
- `useFeatureConfiguration(featureId)` - Manage feature configuration

### Classes

- `FeatureRegistry` - Feature registration and management
- `FeatureManager` - Complete feature system management
- `DependencyResolver` - Dependency resolution and analysis

### Presets

- `COMMON_FEATURES` - Predefined common features
- `FEATURE_CATEGORIES` - Feature category definitions
- `FEATURE_PRIORITIES` - Feature priority definitions

## Feature Categories

- **core**: Essential features required for basic functionality
- **ml**: Machine learning and AI capabilities
- **integration**: Third-party service integrations
- **utility**: Supporting utilities and tools
- **ui**: User interface and experience features
- **data**: Data processing and management features

## Feature Priorities

- **critical**: Essential for application functionality
- **high**: Important for core user experience
- **medium**: Enhances user experience
- **low**: Nice to have features

## Service Dependencies

Features can depend on external services with the following options:

- **Required**: Feature is unavailable if service is missing
- **Optional**: Feature is degraded if service is missing
- **Version Requirements**: Specify minimum/maximum service versions
- **Custom Messages**: Provide custom error messages for missing services

## Configuration

Features support runtime configuration through:

- **Default Configuration**: Set default values in feature definition
- **Runtime Updates**: Modify configuration at runtime
- **Validation**: Validate configuration against schema
- **Persistence**: Save configuration changes

## Health Monitoring

The feature system provides comprehensive health monitoring:

- **Health Scores**: 0-100 health score for each feature
- **Status Tracking**: Real-time status updates
- **Dependency Analysis**: Track service dependencies
- **Performance Metrics**: Monitor feature performance

## TypeScript Support

This package is written in TypeScript and provides full type definitions for all features, configurations, and APIs.

## Contributing

This package is part of the Reynard framework. When contributing:

1. Ensure features are truly reusable and not tied to specific applications
2. Provide comprehensive TypeScript types
3. Include proper error handling and validation
4. Add JSDoc comments for better developer experience
5. Test features in isolation

## License

MIT
