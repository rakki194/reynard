/**
 * 🦊 Reynard Diffusion-Pipe Components
 *
 * UI components for diffusion-pipe training dashboards
 * with real-time monitoring and configuration management.
 */

// Main dashboard component
export { DiffusionPipeDashboard } from "./dashboard/DiffusionPipeDashboard";
export type { DiffusionPipeDashboardProps } from "./dashboard/DiffusionPipeDashboard";

// Training components
export { TrainingCard } from "./training/TrainingCard";
export type { TrainingCardProps } from "./training/TrainingCard";

export { TrainingProgress } from "./training/TrainingProgress";
export type { TrainingProgressProps } from "./training/TrainingProgress";

export { TrainingMetrics } from "./training/TrainingMetrics";
export type { TrainingMetricsProps } from "./training/TrainingMetrics";

export { TrainingLogs } from "./training/TrainingLogs";
export type { TrainingLogsProps, LogEntry, LogFilter } from "./training/TrainingLogs";

export { ResourceMonitor } from "./training/ResourceMonitor";
export type { ResourceMonitorProps, ResourceData, ResourceAlert } from "./training/ResourceMonitor";

export { TrainingTimeline } from "./training/TrainingTimeline";
export type { TrainingTimelineProps, TimelineEvent } from "./training/TrainingTimeline";

// Configuration components
export { ConfigBuilder } from "./config/ConfigBuilder";
export type { ConfigBuilderProps, TrainingConfig } from "./config/ConfigBuilder";

export { ModelSelector } from "./config/ModelSelector";
export type { ModelSelectorProps } from "./config/ModelSelector";

export { DatasetConfigurator } from "./config/DatasetConfigurator";
export type { DatasetConfiguratorProps } from "./config/DatasetConfigurator";

export { AdvancedSettings } from "./config/AdvancedSettings";
export type { AdvancedSettingsProps } from "./config/AdvancedSettings";

export { ConfigTemplates } from "./config/ConfigTemplates";
export type { ConfigTemplatesProps } from "./config/ConfigTemplates";

export { ConfigValidator } from "./config/ConfigValidator";
export type { ConfigValidatorProps, ValidationError } from "./config/ConfigValidator";

// Chroma-specific components
export { ChromaTrainingWizard } from "./chroma/ChromaTrainingWizard";
export type { ChromaTrainingWizardProps, ChromaWizardStep } from "./chroma/ChromaTrainingWizard";

export { ChromaModelValidator } from "./chroma/ChromaModelValidator";
export type { ChromaModelValidatorProps, ChromaModelInfo, ValidationResult } from "./chroma/ChromaModelValidator";

export { ChromaPresets } from "./chroma/ChromaPresets";
export type { ChromaPresetsProps, ChromaPreset } from "./chroma/ChromaPresets";

// Hooks
export { useTrainingProgress } from "./hooks/useTrainingProgress";
export type {
  UseTrainingProgressOptions,
  UseTrainingProgressReturn,
  TrainingProgressData,
} from "./hooks/useTrainingProgress";

export { useRealTimeUpdates } from "./hooks/useRealTimeUpdates";
export type {
  UseRealTimeUpdatesOptions,
  UseRealTimeUpdatesReturn,
  RealTimeUpdateData,
} from "./hooks/useRealTimeUpdates";

export { useTrainingWebSocket } from "./hooks/useTrainingWebSocket";
export type { UseTrainingWebSocketReturn, TrainingEvent, TrainingWebSocketConfig } from "./hooks/useTrainingWebSocket";

// Types
export * from "./types";
