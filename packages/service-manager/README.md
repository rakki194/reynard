# @reynard/service-manager

A comprehensive service management system for Reynard applications that handles service lifecycle, dependencies, health monitoring, and parallel initialization.

## Features

- **Service Lifecycle Management**: Start, stop, and monitor services with proper state transitions
- **Dependency Resolution**: Automatic dependency resolution and startup ordering
- **Parallel Initialization**: Services can start in parallel when dependencies allow
- **Health Monitoring**: Built-in health checks and monitoring for all services
- **Event System**: Comprehensive event system for service lifecycle events
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @reynard/service-manager
```

## Quick Start

```typescript
import { ServiceManager, BaseService, ServiceStatus, ServiceHealth } from '@reynard/service-manager';

// Create a custom service
class MyService extends BaseService {
  constructor() {
    super({
      name: 'my-service',
      dependencies: ['database'],
      startupPriority: 50,
      autoStart: true
    });
  }

  async initialize(): Promise<void> {
    // Initialize your service
    console.log('MyService initialized');
  }

  async shutdown(): Promise<void> {
    // Cleanup your service
    console.log('MyService shutdown');
  }

  async healthCheck(): Promise<ServiceHealth> {
    // Perform health check
    return ServiceHealth.HEALTHY;
  }
}

// Create and configure service manager
const serviceManager = new ServiceManager({
  maxConcurrentStartup: 4,
  healthCheckInterval: 30000,
  startupTimeout: 300000,
  shutdownTimeout: 60000,
  enableHealthMonitoring: true
});

// Register services
const myService = new MyService();
serviceManager.registerService(myService);

// Start all services
await serviceManager.startServices();

// Get service status
const status = serviceManager.getServiceInfo('my-service');
console.log('Service status:', status);

// Stop all services
await serviceManager.stopServices();
```

## API Reference

### ServiceManager

The main orchestrator for service lifecycle management.

#### Constructor

```typescript
new ServiceManager(config?: ServiceManagerConfig)
```

#### Methods

- `registerService(service: BaseService): void` - Register a service
- `registerServices(services: BaseService[]): void` - Register multiple services
- `startServices(): Promise<void>` - Start all registered services
- `stopServices(): Promise<void>` - Stop all registered services
- `getService(name: string): BaseService | undefined` - Get a service by name
- `getServiceInfo(name: string): ServiceInfo | undefined` - Get service information
- `getState(): ServiceManagerState` - Get current manager state

### BaseService

Abstract base class that all services must extend.

#### Constructor

```typescript
constructor(config: ServiceConfig)
```

#### Abstract Methods

- `initialize(): Promise<void>` - Initialize the service
- `shutdown(): Promise<void>` - Shutdown the service
- `healthCheck(): Promise<ServiceHealth>` - Perform health check

#### Properties

- `name: string` - Service name
- `status: ServiceStatus` - Current service status
- `health: ServiceHealth` - Current service health
- `dependencies: string[]` - Service dependencies
- `startupPriority: number` - Startup priority (lower starts earlier)

### Types

#### ServiceStatus

```typescript
enum ServiceStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error'
}
```

#### ServiceHealth

```typescript
enum ServiceHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}
```

## Advanced Usage

### Event Handling

```typescript
serviceManager.addEventListener((event) => {
  console.log('Service event:', event);
});
```

### Custom Service Configuration

```typescript
class DatabaseService extends BaseService {
  constructor() {
    super({
      name: 'database',
      dependencies: [],
      startupPriority: 10, // Start early
      requiredPackages: ['pg', 'redis'],
      autoStart: true,
      config: {
        host: 'localhost',
        port: 5432
      }
    });
  }

  async initialize(): Promise<void> {
    // Initialize database connection
  }

  async shutdown(): Promise<void> {
    // Close database connection
  }

  async healthCheck(): Promise<ServiceHealth> {
    // Check database connectivity
    return ServiceHealth.HEALTHY;
  }
}
```

### Dependency Management

Services can declare dependencies on other services. The service manager will automatically:

1. Validate that all dependencies exist
2. Calculate the correct startup order
3. Start services in parallel when possible
4. Handle circular dependency detection

```typescript
class ApiService extends BaseService {
  constructor() {
    super({
      name: 'api',
      dependencies: ['database', 'cache'], // Depends on database and cache
      startupPriority: 100
    });
  }
}
```

## License

MIT
