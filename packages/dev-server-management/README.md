# 🦊 Dev Server Management

*Modern development server management for the Reynard ecosystem*

A sophisticated, type-safe development server management system that provides intelligent port allocation, process orchestration, health monitoring, and seamless integration with the Reynard ecosystem.

## ✨ Features

- **🎯 Intelligent Port Management**: Automatic port allocation with conflict detection and resolution
- **🔄 Process Orchestration**: Cross-platform process management with dependency resolution
- **🏥 Health Monitoring**: Real-time health checks with multiple protocols (HTTP, command, port)
- **⚙️ Type-Safe Configuration**: Comprehensive TypeScript support with runtime validation
- **🔗 Reynard Integration**: Seamless integration with existing Reynard packages
- **📊 Real-time Monitoring**: Event-driven architecture with comprehensive status reporting
- **🛠️ CLI Interface**: Modern command-line interface with rich output formatting

## 🚀 Quick Start

### Installation

```bash
pnpm add dev-server-management
```

### Basic Usage

```typescript
import { DevServerManager } from 'dev-server-management';

// Create and initialize the manager
const manager = new DevServerManager('dev-server.config.json');
await manager.initialize();

// Start a development server
await manager.start('my-project');

// Check status
const status = await manager.status('my-project');
console.log(status);

// Stop the server
await manager.stop('my-project');
```

### CLI Usage

```bash
# Start a development server
dev-server start my-project

# Check server status
dev-server status

# List available projects
dev-server list

# Stop all servers
dev-server stop-all
```

## 📋 Configuration

### Configuration File (`dev-server.config.json`)

```json
{
  "version": "1.0.0",
  "global": {
    "defaultStartupTimeout": 30000,
    "defaultShutdownTimeout": 10000,
    "healthCheckInterval": 5000,
    "autoRestart": true,
    "maxRestartAttempts": 3
  },
  "projects": {
    "my-frontend": {
      "name": "my-frontend",
      "port": 3000,
      "description": "Frontend application",
      "category": "package",
      "autoReload": true,
      "hotReload": true,
      "command": "pnpm",
      "args": ["run", "dev"],
      "healthCheck": {
        "endpoint": "http://localhost:3000/health",
        "timeout": 5000,
        "interval": 10000
      }
    },
    "my-backend": {
      "name": "my-backend",
      "port": 8000,
      "description": "Backend API server",
      "category": "backend",
      "autoReload": true,
      "hotReload": false,
      "command": "python",
      "args": ["main.py"],
      "healthCheck": {
        "endpoint": "http://localhost:8000/health",
        "timeout": 5000
      }
    }
  },
  "portRanges": {
    "package": { "start": 3000, "end": 3009 },
    "example": { "start": 3010, "end": 3019 },
    "backend": { "start": 8000, "end": 8009 },
    "e2e": { "start": 3020, "end": 3029 }
  },
  "logging": {
    "level": "info",
    "format": "colored"
  }
}
```

## 🏗️ Architecture

### Core Components

- **ConfigManager**: Type-safe configuration management with validation
- **PortManager**: Intelligent port allocation and conflict resolution
- **ProcessManager**: Cross-platform process lifecycle management
- **HealthChecker**: Real-time health monitoring with multiple protocols
- **DevServerManager**: Main orchestrator integrating all components

### Integration with Reynard Ecosystem

- **ServiceManager**: Leverages existing service management patterns
- **QueueManager**: Uses queue-based processing for startup orchestration
- **Event System**: Integrates with Reynard's event-driven architecture
- **Type System**: Consistent TypeScript patterns across the ecosystem

## 📚 API Reference

### DevServerManager

```typescript
class DevServerManager {
  // Lifecycle
  initialize(): Promise<void>
  cleanup(): Promise<void>
  
  // Server management
  start(project: string): Promise<void>
  stop(project: string): Promise<void>
  restart(project: string): Promise<void>
  startMultiple(projects: string[]): Promise<void>
  stopAll(): Promise<void>
  
  // Status and monitoring
  status(project?: string): Promise<ServerInfo[]>
  health(project?: string): Promise<HealthStatus[]>
  list(): Promise<ProjectConfig[]>
  
  // Configuration
  reloadConfig(): Promise<void>
}
```

### Event System

```typescript
// Listen for events
manager.on('server_started', (event) => {
  console.log(`Server ${event.project} started on port ${event.data.port}`);
});

manager.on('health_check_failed', (event) => {
  console.log(`Health check failed for ${event.project}: ${event.data.error}`);
});
```

## 🔧 Advanced Usage

### Custom Health Checks

```typescript
// HTTP health check
const config = {
  healthCheck: {
    endpoint: 'http://localhost:3000/health',
    timeout: 5000,
    expectedResponse: 'OK'
  }
};

// Command-based health check
const config = {
  healthCheck: {
    command: 'curl -f http://localhost:3000/health',
    timeout: 5000,
    expectedResponse: /OK/
  }
};
```

### Dependency Management

```typescript
const config = {
  name: 'frontend',
  dependencies: ['backend', 'database'],
  // ... other config
};
```

### Event Handling

```typescript
manager.on('event', (event) => {
  switch (event.type) {
    case 'server_started':
      console.log(`✅ ${event.project} started`);
      break;
    case 'server_error':
      console.log(`❌ ${event.project} error: ${event.data.error}`);
      break;
    case 'health_check_failed':
      console.log(`🏥 ${event.project} health check failed`);
      break;
  }
});
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 📦 Migration from Legacy System

The package includes migration utilities to transition from the existing shell-based system:

```typescript
import { ConfigManager } from 'dev-server-management';

const configManager = new ConfigManager();
await configManager.migrateFromOldFormat('old-dev-server-config.json');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🦊 Reynard Ecosystem

This package is part of the Reynard ecosystem. Learn more at [reynard.dev](https://reynard.dev).

---

*Built with the cunning precision of a fox* 🦊
