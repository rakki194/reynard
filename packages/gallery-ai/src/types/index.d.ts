/**
 * AI Gallery Types
 *
 * Core type definitions for the AI-enhanced gallery system.
 * Extends the base gallery types with AI-specific functionality.
 */
import type { CaptionType } from "reynard-ai-shared";
export type { CaptionType } from "reynard-ai-shared";
export interface GalleryCaptionResult {
    success: boolean;
    caption?: string;
    processingTime?: number;
    captionType?: CaptionType;
    generator: string;
    imagePath: string;
    error?: string;
    metadata?: Record<string, any>;
}
export interface AnnotationProgress {
    completed: number;
    total: number;
    current: string;
    percentage: number;
}
export interface ModelConfig {
    [key: string]: any;
}
export interface FileItem {
    id: string;
    name: string;
    path: string;
    type: string;
    size: number;
    modified: Date;
    [key: string]: any;
}
export interface FolderItem {
    id: string;
    name: string;
    path: string;
    type: "folder";
    [key: string]: any;
}
export interface GalleryData {
    items: (FileItem | FolderItem)[];
    currentPath: string;
    [key: string]: any;
}
export interface GalleryConfiguration {
    [key: string]: any;
}
export interface GalleryCallbacks {
    [key: string]: any;
}
export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    children?: ContextMenuItem[];
    onClick?: () => void;
}
export interface AIGalleryState {
    /** Whether AI features are currently generating */
    isGenerating: boolean;
    /** Currently selected caption generator */
    selectedGenerator: string;
    /** Available caption generators */
    availableGenerators: string[];
    /** Current batch processing progress */
    batchProgress: AnnotationProgress | null;
    /** Whether AI features are enabled */
    aiEnabled: boolean;
    /** Current AI operation status */
    operationStatus: AIOperationStatus;
    /** Last error message */
    lastError: string | null;
    /** AI configuration */
    config: AIGalleryConfig;
}
export interface AIGalleryConfig {
    /** Default caption generator */
    defaultGenerator: string;
    /** Auto-generate captions on upload */
    autoGenerateOnUpload: boolean;
    /** Batch processing settings */
    batchSettings: BatchProcessingSettings;
    /** Caption generation settings */
    captionSettings: CaptionGenerationSettings;
    /** UI preferences */
    uiPreferences: AIGalleryUIPreferences;
}
export interface BatchProcessingSettings {
    /** Maximum concurrent operations */
    maxConcurrent: number;
    /** Retry failed operations */
    retryFailed: boolean;
    /** Maximum retry attempts */
    maxRetries: number;
    /** Progress update interval (ms) */
    progressInterval: number;
}
export interface CaptionGenerationSettings {
    /** Default caption type */
    defaultCaptionType: CaptionType;
    /** Post-processing enabled */
    postProcessing: boolean;
    /** Force regeneration */
    forceRegeneration: boolean;
    /** Generator-specific configs */
    generatorConfigs: Record<string, ModelConfig>;
}
export interface AIGalleryUIPreferences {
    /** Show AI indicators */
    showAIIndicators: boolean;
    /** Show generation progress */
    showProgress: boolean;
    /** Auto-expand caption editor */
    autoExpandCaptionEditor: boolean;
    /** Show batch operation controls */
    showBatchControls: boolean;
}
export declare enum AIOperationStatus {
    IDLE = "idle",
    GENERATING = "generating",
    BATCH_PROCESSING = "batch_processing",
    ERROR = "error",
    SUCCESS = "success"
}
export interface AIGalleryProps extends Partial<GalleryConfiguration> {
    /** Gallery data */
    data?: GalleryData;
    /** Loading state */
    loading?: boolean;
    /** Error state */
    error?: string;
    /** Gallery callbacks */
    callbacks?: GalleryCallbacks;
    /** AI-specific callbacks */
    aiCallbacks?: AIGalleryCallbacks;
    /** AI configuration */
    aiConfig?: Partial<AIGalleryConfig>;
    /** Whether to show AI features */
    showAIFeatures?: boolean;
    /** Whether to show upload zone */
    showUpload?: boolean;
    /** Whether to show breadcrumb navigation */
    showBreadcrumbs?: boolean;
    /** Whether to show toolbar */
    showToolbar?: boolean;
    /** Custom class name */
    class?: string;
}
export interface AIGalleryCallbacks {
    /** Called when caption generation starts */
    onCaptionGenerationStart?: (item: FileItem, generator: string) => void;
    /** Called when caption generation completes */
    onCaptionGenerationComplete?: (item: FileItem, result: GalleryCaptionResult) => void;
    /** Called when caption generation fails */
    onCaptionGenerationError?: (item: FileItem, error: string) => void;
    /** Called when batch processing starts */
    onBatchProcessingStart?: (items: FileItem[], generator: string) => void;
    /** Called during batch processing */
    onBatchProcessingProgress?: (progress: AnnotationProgress) => void;
    /** Called when batch processing completes */
    onBatchProcessingComplete?: (results: GalleryCaptionResult[]) => void;
    /** Called when batch processing fails */
    onBatchProcessingError?: (error: string) => void;
    /** Called when AI configuration changes */
    onAIConfigChange?: (config: AIGalleryConfig) => void;
}
export interface AIContextMenuAction extends ContextMenuItem {
    /** AI-specific action type */
    aiActionType: AIContextMenuActionType;
    /** Required generator for this action */
    requiredGenerator?: string;
    /** Whether this action requires multiple selection */
    requiresMultipleSelection?: boolean;
    /** Whether this action is destructive */
    isDestructive?: boolean;
    /** AI-specific configuration */
    aiConfig?: AIContextMenuActionConfig;
    /** Children actions (for submenus) */
    children?: AIContextMenuAction[];
}
export declare enum AIContextMenuActionType {
    GENERATE_CAPTION = "generate_caption",
    BATCH_ANNOTATE = "batch_annotate",
    EDIT_CAPTION = "edit_caption",
    DELETE_CAPTION = "delete_caption",
    REGENERATE_CAPTION = "regenerate_caption",
    SMART_ORGANIZE = "smart_organize",
    AI_SEARCH = "ai_search"
}
export interface AIContextMenuActionConfig {
    /** Generator to use for this action */
    generator?: string;
    /** Caption type to generate */
    captionType?: CaptionType;
    /** Whether to force regeneration */
    forceRegeneration?: boolean;
    /** Custom configuration for the action */
    customConfig?: Record<string, any>;
}
export interface AIGalleryGridProps {
    /** Base gallery grid props */
    items: (FileItem | FolderItem)[];
    /** View configuration */
    viewConfig: any;
    /** Selection state */
    selectionState: any;
    /** Loading state */
    loading: boolean;
    /** Empty message */
    emptyMessage?: string;
    /** AI-specific props */
    aiProps?: AIGalleryGridAIProps;
    /** Event handlers */
    onItemClick?: (item: FileItem | FolderItem) => void;
    onItemDoubleClick?: (item: FileItem | FolderItem) => void;
    onSelectionChange?: (item: FileItem | FolderItem, mode: "single" | "add" | "range") => void;
    onContextMenu?: (item: FileItem | FolderItem, x: number, y: number) => void;
}
export interface AIGalleryGridAIProps {
    /** Whether to show AI generation indicators */
    showAIIndicators?: boolean;
    /** Whether to show caption previews */
    showCaptionPreviews?: boolean;
    /** Whether to show batch selection controls */
    showBatchControls?: boolean;
    /** Available generators */
    availableGenerators?: string[];
    /** Current batch progress */
    batchProgress?: AnnotationProgress | null;
}
export interface AIImageViewerProps {
    /** Base image viewer props */
    imageInfo: any;
    /** Caption data */
    captions?: Record<string, any>;
    /** AI-specific props */
    aiProps?: AIImageViewerAIProps;
    /** Event handlers */
    onClose?: () => void;
    onCaptionSave?: (caption: any) => Promise<void>;
    onCaptionDelete?: (type: string) => Promise<void>;
    onCaptionGenerate?: (generator: string) => Promise<void>;
}
export interface AIImageViewerAIProps {
    /** Whether to show caption editing */
    enableCaptionEditing?: boolean;
    /** Available caption types */
    captionTypes?: CaptionType[];
    /** Available generators */
    availableGenerators?: string[];
    /** Whether to show generation controls */
    showGenerationControls?: boolean;
    /** Whether to auto-generate on open */
    autoGenerateOnOpen?: boolean;
    /** Default generator */
    defaultGenerator?: string;
}
export interface UseGalleryAIOptions {
    /** Initial AI configuration */
    initialConfig?: Partial<AIGalleryConfig>;
    /** Whether to auto-initialize annotation manager */
    autoInitialize?: boolean;
    /** Callbacks for AI operations */
    callbacks?: AIGalleryCallbacks;
    /** Whether to persist AI state */
    persistState?: boolean;
    /** Storage key for persistence */
    storageKey?: string;
}
export interface UseGalleryAIReturn {
    /** AI state */
    aiState: () => AIGalleryState;
    /** Generate caption for single item */
    generateCaption: (item: FileItem, generator: string) => Promise<GalleryCaptionResult>;
    /** Batch annotate multiple items */
    batchAnnotate: (items: FileItem[], generator: string) => Promise<GalleryCaptionResult[]>;
    /** Update AI configuration */
    updateAIConfig: (config: Partial<AIGalleryConfig>) => void;
    /** Get available generators */
    getAvailableGenerators: () => string[];
    /** Check if generator is available */
    isGeneratorAvailable: (generator: string) => boolean;
    /** Get annotation service */
    getAnnotationService: () => any;
    /** Clear AI state */
    clearAIState: () => void;
    /** Set AI enabled state */
    setAIEnabled: (enabled: boolean) => void;
}
export interface AIGalleryProviderProps {
    /** Children components */
    children: any;
    /** Initial AI configuration */
    initialConfig?: Partial<AIGalleryConfig>;
    /** Callbacks for AI operations */
    callbacks?: AIGalleryCallbacks;
    /** Whether to persist state */
    persistState?: boolean;
    /** Storage key for persistence */
    storageKey?: string;
}
export * from "./index";
