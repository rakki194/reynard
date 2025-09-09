/**
 * Service Name Mappings
 *
 * Maps feature system service names to actual Reynard service implementations.
 * This helps bridge the gap between feature definitions and actual service names.
 */

export const SERVICE_MAPPINGS = {
  // Core Services
  FileProcessingService: "file-processing",
  AuthService: "auth",
  DatabaseService: "database",
  ServiceManager: "service-manager",

  // AI/ML Services
  AnnotationService: "annotation",
  RAGService: "rag",
  AIService: "ai-shared",

  // Integration Services
  GitService: "git",
  ConnectionService: "connection",

  // Utility Services
  CoreService: "core",
  ToolsService: "tools",

  // UI Services
  ThemesService: "themes",
  UIService: "ui",
  ComponentsService: "components",

  // Data Services
  GalleryService: "gallery",
  GalleryAIService: "gallery-ai",

  // Backend Services (for backend integration)
  CaptionGeneratorService: "caption-backend",
  ImageProcessingService: "image-processing-backend",
  DetectionModelsService: "detection-backend",
  NLPService: "nlp-backend",
  TrainingService: "training-backend",
  APIGateway: "api-gateway",
  CloudStorageService: "cloud-storage",
  NotificationService: "notification-backend",
  CacheService: "cache-backend",
  LoggingService: "logging-backend",
  MonitoringService: "monitoring-backend",
  BackupService: "backup-backend",
  ExportService: "export-backend",
  ImportService: "import-backend",
  ValidationService: "validation-backend",
  SearchService: "search-backend",
} as const;

/**
 * Reverse mapping from actual service names to feature system names
 */
export const REVERSE_SERVICE_MAPPINGS = Object.fromEntries(
  Object.entries(SERVICE_MAPPINGS).map(([feature, actual]) => [
    actual,
    feature,
  ]),
) as Record<string, string>;

/**
 * Get the actual service name for a feature system service name
 */
export function getActualServiceName(featureServiceName: string): string {
  return (
    SERVICE_MAPPINGS[featureServiceName as keyof typeof SERVICE_MAPPINGS] ||
    featureServiceName
  );
}

/**
 * Get the feature system service name for an actual service name
 */
export function getFeatureServiceName(actualServiceName: string): string {
  return REVERSE_SERVICE_MAPPINGS[actualServiceName] || actualServiceName;
}

/**
 * Get all service mappings
 */
export function getAllServiceMappings(): Record<string, string> {
  return { ...SERVICE_MAPPINGS };
}

/**
 * Get all reverse service mappings
 */
export function getAllReverseServiceMappings(): Record<string, string> {
  return { ...REVERSE_SERVICE_MAPPINGS };
}
