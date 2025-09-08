# Service Manager & Feature System Integration

This document describes the integration between the `reynard-service-manager` and `reynard-features` packages, providing a seamless bridge between service lifecycle management and feature availability.

## 🎯 Overview

The integration allows you to:

- **Automatically sync** service status with feature availability
- **Real-time updates** when services start, stop, or fail
- **Feature-aware UI** that adapts based on service availability
- **Health monitoring** with feature degradation support
- **Service name mapping** between different naming conventions

## 🚀 Quick Start

### Basic Integration

```typescript
import { ServiceManager, BaseService } from 'reynard-service-manager';
import { FeatureManager, FeatureProvider, COMMON_FEATURES } from 'reynard-features';
import { FeatureServiceBridge } from 'reynard-service-manager/integrations';

// Create service manager
const serviceManager = new ServiceManager({
  maxConcurrentStartup: 4,
  healthCheckInterval: 30000,
  enableHealthMonitoring: true
});

// Create feature manager
const featureManager = new FeatureManager({
  features: COMMON_FEATURES,
  autoRefresh: true,
  refreshInterval: 30000
});

// Create the bridge
const bridge = new FeatureServiceBridge({
  serviceManager,
  featureManager,
  autoSync: true,
  serviceNameMapping: {
    'FileProcessingService': 'file-processing',
    'AuthService': 'auth',
    'AnnotationService': 'annotation'
  }
});

// Start services
await serviceManager.startServices();
```

### React/SolidJS Integration

```tsx
import { FeatureProvider } from 'reynard-features';
import { useFeatureAvailable, useFeatureStatus } from 'reynard-features';

function App() {
  return (
    <FeatureProvider config={{
      features: COMMON_FEATURES,
      serviceChecker: (serviceName) => {
        // This will be automatically updated by the bridge
        return bridge.getServiceStatus(serviceName).available;
      },
      autoRefresh: true
    }}>
      <MyApp />
    </FeatureProvider>
  );
}

function MyComponent() {
  const isCaptionAvailable = useFeatureAvailable('caption-generation');
  const captionStatus = useFeatureStatus('caption-generation');

  return (
    <div>
      {isCaptionAvailable() ? (
        <CaptionGenerationPanel />
      ) : (
        <div class="feature-unavailable">
          Caption generation is unavailable: {captionStatus()?.message}
        </div>
      )}
    </div>
  );
}
```

## 🔧 Configuration

### Service Name Mapping

The bridge supports mapping between feature system service names and actual service names:

```typescript
const serviceMappings = {
  // Feature system name -> Actual service name
  'FileProcessingService': 'file-processing',
  'AuthService': 'auth',
  'AnnotationService': 'annotation',
  'ServiceManager': 'service-manager'
};

const bridge = new FeatureServiceBridge({
  serviceManager,
  featureManager,
  serviceNameMapping: serviceMappings
});
```

### Predefined Mappings

The `reynard-features` package includes predefined service mappings:

```typescript
import { SERVICE_MAPPINGS, getActualServiceName } from 'reynard-features/presets';

// Use predefined mappings
const bridge = new FeatureServiceBridge({
  serviceManager,
  featureManager,
  serviceNameMapping: SERVICE_MAPPINGS
});

// Or get individual mappings
const actualName = getActualServiceName('FileProcessingService'); // 'file-processing'
```

## 📊 Service Status Tracking

### Real-time Updates

The bridge automatically tracks service status changes:

```typescript
// Service status changes are automatically synced
serviceManager.onServiceStatusChange((serviceName, status) => {
  console.log(`Service ${serviceName} status changed to ${status}`);
  // Feature availability is automatically updated
});

// Check feature status
const featureStatus = featureManager.getFeatureStatus('caption-generation');
console.log('Available:', featureStatus?.available);
console.log('Health Score:', featureStatus?.healthScore);
```

### Health Monitoring

Services can be in different health states:

- **HEALTHY**: Service is running normally
- **DEGRADED**: Service is running but with reduced functionality
- **UNHEALTHY**: Service is running but experiencing errors
- **UNKNOWN**: Service health is unknown

```typescript
const status = bridge.getServiceStatus('AnnotationService');
if (status.health === ServiceHealth.DEGRADED) {
  console.log('Service is degraded but still available');
}
```

## 🎨 Feature-Aware UI Patterns

### Conditional Rendering

```tsx
function FeatureAwareComponent() {
  const isAvailable = useFeatureAvailable('image-processing');
  const isDegraded = useFeatureDegraded('image-processing');
  const status = useFeatureStatus('image-processing');

  return (
    <div>
      {isAvailable() ? (
        <ImageProcessingPanel />
      ) : (
        <FeatureUnavailable 
          feature="image-processing"
          message={status()?.message}
        />
      )}
      
      {isDegraded() && (
        <div class="warning">
          Image processing is degraded: {status()?.message}
        </div>
      )}
    </div>
  );
}
```

### Feature Status Dashboard

```tsx
function FeatureDashboard() {
  const { featureSummary } = useFeatures();
  const criticalFeatures = useCriticalFeatures();

  return (
    <div class="dashboard">
      <div class="summary">
        <h3>Feature Status</h3>
        <p>Available: {featureSummary().available}</p>
        <p>Degraded: {featureSummary().degraded}</p>
        <p>Unavailable: {featureSummary().unavailable}</p>
        <p>Success Rate: {featureSummary().successRate.toFixed(1)}%</p>
      </div>
      
      <div class="critical-features">
        <h3>Critical Features</h3>
        {criticalFeatures().unavailable.map(feature => (
          <div key={feature.id} class="critical-unavailable">
            ⚠️ {feature.name} is unavailable
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔍 Advanced Usage

### Custom Service Checker

```typescript
const bridge = new FeatureServiceBridge({
  serviceManager,
  featureManager,
  autoSync: true,
  serviceNameMapping: {
    'CustomService': 'my-custom-service'
  }
});

// Add custom service mapping at runtime
bridge.addServiceMapping('new-service', 'NewService');

// Remove service mapping
bridge.removeServiceMapping('old-service');
```

### Manual Sync

```typescript
// Force sync all service statuses
bridge.forceSync();

// Get all service statuses
const allStatuses = bridge.getAllServiceStatuses();
console.log('All service statuses:', allStatuses);
```

### Event Handling

```typescript
// Listen to service manager events
serviceManager.addEventListener((event) => {
  switch (event.type) {
    case 'startup':
      console.log(`Service ${event.serviceName} started`);
      break;
    case 'shutdown':
      console.log(`Service ${event.serviceName} stopped`);
      break;
    case 'health_change':
      console.log(`Service ${event.serviceName} health changed`);
      break;
  }
});
```

## 🧪 Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { FeatureServiceBridge } from 'reynard-service-manager/integrations';

describe('FeatureServiceBridge', () => {
  it('should sync service status with features', async () => {
    const bridge = new FeatureServiceBridge({
      serviceManager,
      featureManager,
      autoSync: true
    });

    // Test service registration
    serviceManager.registerService(mockService);
    await serviceManager.startServices();

    // Verify feature availability
    const status = bridge.getServiceStatus('TestService');
    expect(status.available).toBe(true);
  });
});
```

### Integration Tests

```typescript
import { createIntegratedSystem } from 'reynard-service-manager/integrations';

describe('Service-Feature Integration', () => {
  it('should handle service failures gracefully', async () => {
    const system = createIntegratedSystem();
    
    // Start services
    await system.serviceManager.startServices();
    
    // Simulate service failure
    const service = system.services.auth;
    await service.shutdown();
    
    // Verify feature status updates
    const authFeature = system.featureManager.getFeatureStatus('user-authentication');
    expect(authFeature?.available).toBe(false);
  });
});
```

## 📚 API Reference

### FeatureServiceBridge

#### Constructor Options

```typescript
interface FeatureServiceBridgeConfig {
  serviceManager: ServiceManager;
  featureManager: FeatureManager;
  autoSync?: boolean;
  serviceNameMapping?: Record<string, string>;
}
```

#### Methods

- `initialize()`: Initialize the bridge and start syncing
- `destroy()`: Cleanup and stop syncing
- `getServiceStatus(serviceName: string)`: Get status for a specific service
- `getAllServiceStatuses()`: Get status for all services
- `forceSync()`: Force sync of all service statuses
- `addServiceMapping(original: string, mapped: string)`: Add service name mapping
- `removeServiceMapping(original: string)`: Remove service name mapping

### Service Status

```typescript
interface ServiceStatus {
  available: boolean;
  status: ServiceStatus;
  health: ServiceHealth;
  lastError?: string;
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Services not syncing**: Ensure `autoSync` is enabled and services are properly registered
2. **Feature status not updating**: Check that the bridge is initialized and service mappings are correct
3. **Memory leaks**: Always call `bridge.destroy()` when cleaning up

### Debug Mode

```typescript
const bridge = new FeatureServiceBridge({
  serviceManager,
  featureManager,
  autoSync: true
});

// Enable debug logging
bridge.forceSync();
console.log('All service statuses:', bridge.getAllServiceStatuses());
```

## 🔄 Migration Guide

### From Manual Service Checking

**Before:**

```typescript
const isServiceAvailable = (serviceName: string) => {
  const service = serviceManager.getService(serviceName);
  return service?.status === ServiceStatus.RUNNING;
};
```

**After:**

```typescript
const bridge = new FeatureServiceBridge({
  serviceManager,
  featureManager,
  autoSync: true
});

const isServiceAvailable = (serviceName: string) => {
  return bridge.getServiceStatus(serviceName).available;
};
```

### From Static Feature Definitions

**Before:**

```typescript
const features = [
  {
    id: 'caption-generation',
    dependencies: [{ services: ['CaptionService'], required: true }]
  }
];
```

**After:**

```typescript
import { COMMON_FEATURES, SERVICE_MAPPINGS } from 'reynard-features/presets';

const bridge = new FeatureServiceBridge({
  serviceManager,
  featureManager,
  serviceNameMapping: SERVICE_MAPPINGS
});
```

## 🎉 Benefits

- **Automatic Sync**: No manual service status checking required
- **Real-time Updates**: Features update immediately when services change
- **Type Safety**: Full TypeScript support with comprehensive types
- **Flexible Mapping**: Support for different service naming conventions
- **Health Monitoring**: Granular health status tracking
- **Easy Testing**: Comprehensive test utilities and examples
- **Performance**: Efficient event-driven updates with minimal overhead

This integration provides a robust foundation for building feature-aware applications that gracefully handle service dependencies and failures.
