/**
 * Feature Integration Example
 *
 * Example showing how to integrate the service manager with the feature system
 * using the FeatureServiceBridge.
 */
import { ServiceManager, BaseService, ServiceHealth, } from "../index.js";
import { FeatureManager, COMMON_FEATURES, } from "reynard-features";
import { FeatureServiceBridge } from "./FeatureServiceBridge.js";
/**
 * Example service that extends BaseService
 */
class ExampleFileProcessingService extends BaseService {
    constructor() {
        super({
            name: "file-processing",
            dependencies: [],
            startupPriority: 50,
            autoStart: true,
        });
    }
    async initialize() {
        console.log("FileProcessingService initialized");
        // Simulate initialization
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    async shutdown() {
        console.log("FileProcessingService shutdown");
    }
    async healthCheck() {
        // Simulate health check
        return ServiceHealth.HEALTHY;
    }
}
class ExampleAuthService extends BaseService {
    constructor() {
        super({
            name: "auth",
            dependencies: [],
            startupPriority: 30,
            autoStart: true,
        });
    }
    async initialize() {
        console.log("AuthService initialized");
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    async shutdown() {
        console.log("AuthService shutdown");
    }
    async healthCheck() {
        return ServiceHealth.HEALTHY;
    }
}
class ExampleAnnotationService extends BaseService {
    constructor() {
        super({
            name: "annotation",
            dependencies: ["file-processing"],
            startupPriority: 40,
            autoStart: true,
        });
    }
    async initialize() {
        console.log("AnnotationService initialized");
        await new Promise((resolve) => setTimeout(resolve, 800));
    }
    async shutdown() {
        console.log("AnnotationService shutdown");
    }
    async healthCheck() {
        return ServiceHealth.HEALTHY;
    }
}
/**
 * Create and configure the integrated system
 */
export function createIntegratedSystem() {
    // Create service manager
    const serviceManager = new ServiceManager({
        maxConcurrentStartup: 4,
        healthCheckInterval: 30000,
        startupTimeout: 300000,
        shutdownTimeout: 60000,
        enableHealthMonitoring: true,
    });
    // Register services
    const fileProcessingService = new ExampleFileProcessingService();
    const authService = new ExampleAuthService();
    const annotationService = new ExampleAnnotationService();
    serviceManager.registerService(fileProcessingService);
    serviceManager.registerService(authService);
    serviceManager.registerService(annotationService);
    // Create feature manager
    const featureManager = new FeatureManager({
        features: COMMON_FEATURES,
        autoRefresh: true,
        refreshInterval: 30000,
        serviceChecker: (serviceName) => {
            // Default service checker - will be overridden by bridge
            return false;
        },
    });
    // Create service name mappings
    const serviceMappings = {
        FileProcessingService: "file-processing",
        AuthService: "auth",
        AnnotationService: "annotation",
        ServiceManager: "service-manager",
    };
    // Create the bridge
    const bridge = new FeatureServiceBridge({
        serviceManager,
        featureManager,
        autoSync: true,
        serviceNameMapping: serviceMappings,
    });
    return {
        serviceManager,
        featureManager,
        bridge,
        services: {
            fileProcessing: fileProcessingService,
            auth: authService,
            annotation: annotationService,
        },
    };
}
/**
 * Example usage function
 */
export async function demonstrateIntegration() {
    console.log("🚀 Creating integrated system...");
    const system = createIntegratedSystem();
    const { serviceManager, featureManager, bridge } = system;
    // Start services
    console.log("📡 Starting services...");
    await serviceManager.startServices();
    // Wait a bit for services to start
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Check feature statuses
    console.log("🔍 Checking feature statuses...");
    const features = featureManager.registry.getAll();
    for (const feature of features) {
        const status = featureManager.getFeatureStatus(feature.id);
        console.log(`Feature: ${feature.name}`);
        console.log(`  Available: ${status?.available}`);
        console.log(`  Degraded: ${status?.degraded}`);
        console.log(`  Health Score: ${status?.healthScore}`);
        console.log(`  Message: ${status?.message || "OK"}`);
        console.log("");
    }
    // Get service statuses from bridge
    console.log("📊 Service statuses from bridge:");
    const serviceStatuses = bridge.getAllServiceStatuses();
    for (const [serviceName, status] of Object.entries(serviceStatuses)) {
        console.log(`Service: ${serviceName}`);
        console.log(`  Available: ${status.available}`);
        console.log(`  Status: ${status.status}`);
        console.log(`  Health: ${status.health}`);
        console.log("");
    }
    // Demonstrate service failure
    console.log("💥 Simulating service failure...");
    const authService = system.services.auth;
    // Simulate service going down
    await authService.shutdown();
    // Wait for feature system to update
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Check auth feature status
    const authFeatureStatus = featureManager.getFeatureStatus("user-authentication");
    console.log("Auth feature after service failure:");
    console.log(`  Available: ${authFeatureStatus?.available}`);
    console.log(`  Degraded: ${authFeatureStatus?.degraded}`);
    console.log(`  Message: ${authFeatureStatus?.message}`);
    // Cleanup
    console.log("🧹 Cleaning up...");
    bridge.destroy();
    await serviceManager.stopServices();
    console.log("✅ Integration demonstration complete!");
}
/**
 * Example React component showing feature-aware UI
 */
export function FeatureAwareComponent() {
    // This would be used in a React/SolidJS component
    return `
    import { useFeatureAvailable, useFeatureStatus } from 'reynard-features';
    
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
  `;
}
