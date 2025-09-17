/**
 * Feature Integration Example
 *
 * Example showing how to integrate the service manager with the feature system
 * using the FeatureServiceBridge.
 */
import { ServiceManager, BaseService, ServiceHealth } from "../index.js";
import { FeatureManager } from "reynard-features";
import { FeatureServiceBridge } from "./FeatureServiceBridge.js";
/**
 * Example service that extends BaseService
 */
declare class ExampleFileProcessingService extends BaseService {
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<ServiceHealth>;
}
declare class ExampleAuthService extends BaseService {
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<ServiceHealth>;
}
declare class ExampleAnnotationService extends BaseService {
    constructor();
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<ServiceHealth>;
}
/**
 * Create and configure the integrated system
 */
export declare function createIntegratedSystem(): {
    serviceManager: ServiceManager;
    featureManager: FeatureManager;
    bridge: FeatureServiceBridge;
    services: {
        fileProcessing: ExampleFileProcessingService;
        auth: ExampleAuthService;
        annotation: ExampleAnnotationService;
    };
};
/**
 * Example usage function
 */
export declare function demonstrateIntegration(): Promise<void>;
/**
 * Example React component showing feature-aware UI
 */
export declare function FeatureAwareComponent(): string;
export {};
