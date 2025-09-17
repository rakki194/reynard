/**
 * Service Name Mappings
 *
 * Maps feature system service names to actual Reynard service implementations.
 * This helps bridge the gap between feature definitions and actual service names.
 */
export declare const SERVICE_MAPPINGS: {
    readonly FileProcessingService: "file-processing";
    readonly AuthService: "auth";
    readonly DatabaseService: "database";
    readonly ServiceManager: "service-manager";
    readonly AnnotationService: "annotation";
    readonly RAGService: "rag";
    readonly AIService: "ai-shared";
    readonly GitService: "git";
    readonly ConnectionService: "connection";
    readonly CoreService: "core";
    readonly ToolsService: "tools";
    readonly ThemesService: "themes";
    readonly UIService: "ui";
    readonly ComponentsService: "components";
    readonly GalleryService: "gallery";
    readonly GalleryAIService: "gallery-ai";
    readonly CaptionGeneratorService: "caption-backend";
    readonly ImageProcessingService: "image-processing-backend";
    readonly DetectionModelsService: "detection-backend";
    readonly NLPService: "nlp-backend";
    readonly TrainingService: "training-backend";
    readonly APIGateway: "api-gateway";
    readonly CloudStorageService: "cloud-storage";
    readonly NotificationService: "notification-backend";
    readonly CacheService: "cache-backend";
    readonly LoggingService: "logging-backend";
    readonly MonitoringService: "monitoring-backend";
    readonly BackupService: "backup-backend";
    readonly ExportService: "export-backend";
    readonly ImportService: "import-backend";
    readonly ValidationService: "validation-backend";
    readonly SearchService: "search-backend";
};
/**
 * Reverse mapping from actual service names to feature system names
 */
export declare const REVERSE_SERVICE_MAPPINGS: Record<string, string>;
/**
 * Get the actual service name for a feature system service name
 */
export declare function getActualServiceName(featureServiceName: string): string;
/**
 * Get the feature system service name for an actual service name
 */
export declare function getFeatureServiceName(actualServiceName: string): string;
/**
 * Get all service mappings
 */
export declare function getAllServiceMappings(): Record<string, string>;
/**
 * Get all reverse service mappings
 */
export declare function getAllReverseServiceMappings(): Record<string, string>;
