# Reynard Features Demo

🦊 **Interactive demonstration of the Reynard feature management system**

This demo application showcases the powerful capabilities of the `reynard-features` package, demonstrating how to build resilient, service-aware applications that gracefully handle various deployment scenarios and service availability states.

## 🎯 What This Demo Shows

### Feature Management System

- **Real-time Feature Status**: Live updates of feature availability, degradation, and health scores
- **Service Dependencies**: Features automatically adapt based on external service availability
- **Graceful Degradation**: Optional dependencies allow features to work in degraded mode
- **Health Monitoring**: Comprehensive feature health scoring and status tracking

### Interactive Components

- **Feature Dashboard**: Real-time statistics and feature overview
- **Service Controls**: Toggle services to see features adapt in real-time
- **Feature Demos**: Interactive examples of feature-aware components
- **Multi-language Support**: Demonstrates internationalization capabilities
- **Theme System**: Light/dark theme switching

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The demo will be available at `http://localhost:3002`

### Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run serve
```

## 🦦 How It Works

### Feature Configuration

The demo uses a comprehensive feature configuration with 25+ predefined features across all categories:

```typescript
const featureConfig = {
  features: COMMON_FEATURES,
  serviceChecker: (serviceName: string) => serviceAvailability[serviceName],
  autoRefresh: true,
  refreshInterval: 5000,
  onStatusChange: (featureId: string, status: FeatureStatus) => {
    console.log(`Feature ${featureId} status changed:`, status);
  },
};
```

### Service Simulation

Services are simulated with toggle controls to demonstrate real-time feature adaptation:

- **Core Services**: DataSourceService, AuthService, DatabaseService
- **ML/AI Services**: ImageProcessingService, CaptionGeneratorService, DetectionModelsService
- **Integration Services**: GitService, APIGateway, CloudStorageService
- **Utility Services**: CacheService, LoggingService, MonitoringService
- **Data Services**: ExportService, ImportService, ValidationService, SearchService

### Feature-Aware Components

Each demo component uses the `useFeatureAware` hook to automatically adapt based on feature availability:

```typescript
const { shouldRender, fallback } = useFeatureAware(
  "image-processing",
  <div>Image processing unavailable</div>
);

return (
  <div>
    {shouldRender() ? (
      <ImageProcessingInterface />
    ) : (
      fallback
    )}
  </div>
);
```

## 🐺 Key Features Demonstrated

### 1. Real-time Status Updates

- Features automatically update when services become available/unavailable
- Health scores reflect current service status
- Degraded mode handling for optional dependencies

### 2. Service Dependency Management

- Required vs optional service dependencies
- Automatic feature availability calculation
- Service impact analysis

### 3. Feature Categories & Priorities

- **Categories**: Core, ML/AI, Integration, Utility, UI, Data
- **Priorities**: Critical, High, Medium, Low
- Smart filtering and organization

### 4. Interactive Demonstrations

- **Image Processing**: Upload and process images (when service available)
- **Caption Generation**: AI-powered caption generation with degraded mode
- **Object Detection**: Simulated object detection with loading states
- **Text Analysis**: Comprehensive text analysis with statistics
- **Git Integration**: Repository status checking and management

### 5. Graceful Degradation

- Features show appropriate fallback content when unavailable
- Degraded mode with limited functionality
- Clear status messages and user feedback

## 🦊 Advanced Usage Patterns

### Custom Feature Definitions

```typescript
const customFeatures = [
  {
    id: "my-custom-feature",
    name: "Custom Feature",
    description: "A custom feature for my application",
    dependencies: [
      { services: ["MyService"], required: true },
      { services: ["OptionalService"], required: false },
    ],
    category: "utility",
    priority: "medium",
    defaultConfig: {
      enabled: true,
      timeout: 5000,
    },
  },
];
```

### Feature Configuration Management

```typescript
const { config, setConfigValue } = useFeatureConfiguration("image-processing");
setConfigValue("threshold", 0.8);
setConfigValue("timeout", 5000);
```

### Service Availability Monitoring

```typescript
const { getFeaturesDependentOnService } = useFeatures();
const affectedFeatures = getFeaturesDependentOnService("MyService");
```

## 🦦 Testing the System

### Service Toggle Scenarios

1. **Disable Core Services**: See critical features become unavailable
2. **Disable ML Services**: Watch AI features degrade or become unavailable
3. **Disable Integration Services**: Observe optional features adapt
4. **Enable All Services**: See full feature availability

### Feature Interaction

- Upload images to test image processing
- Generate captions to see degraded mode in action
- Analyze text to demonstrate NLP capabilities
- Check Git repositories to test integration features

## 🐺 Architecture Highlights

### Reactive State Management

- SolidJS signals for real-time updates
- Efficient re-rendering only when status changes
- Memory management with proper cleanup

### Error Resilience

- Circuit breaker pattern for service failures
- Fallback mechanisms for optional dependencies
- Health scoring for monitoring

### Performance Optimizations

- Lazy evaluation of feature checks
- Efficient dependency resolution
- Minimal re-renders with reactive updates

## 🦊 Contributing

This demo is part of the Reynard framework. When contributing:

1. Ensure features are truly reusable and not tied to specific applications
2. Provide comprehensive TypeScript types
3. Include proper error handling and validation
4. Add JSDoc comments for better developer experience
5. Test features in isolation

## 📚 Related Documentation

- [Reynard Features Package](../../packages/features/README.md)
- [Reynard Core Package](../../packages/core/README.md)
- [Reynard Themes Package](../../packages/themes/README.md)

## 🎉 Conclusion

This demo showcases how the Reynard features package enables building resilient, service-aware applications that can gracefully handle various deployment scenarios. The system provides:

- **Intelligent Feature Management**: Automatic dependency resolution and health monitoring
- **Graceful Degradation**: Features adapt to service availability without breaking
- **Real-time Updates**: Live status updates with reactive UI components
- **Developer Experience**: Simple hooks and clear APIs for feature-aware development

Try toggling different services to see how features adapt in real-time, and explore the various demo components to understand the power of feature-aware application development!

---

## Built with 🦊 Reynard

The cunning framework for modern applications
