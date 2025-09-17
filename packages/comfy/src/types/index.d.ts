/**
 * ComfyUI Types
 *
 * Type definitions for ComfyUI workflow management and operations.
 */
export interface ComfyWorkflow {
    /** Unique workflow identifier */
    id: string;
    /** Workflow name */
    name: string;
    /** Workflow description */
    description: string;
    /** Workflow nodes */
    nodes: ComfyWorkflowNode[];
    /** Node connections */
    connections: ComfyWorkflowConnection[];
    /** Additional metadata */
    metadata: Record<string, any>;
}
export interface ComfyWorkflowNode {
    /** Node identifier */
    id: string;
    /** Node type */
    type: string;
    /** Node inputs */
    inputs: Record<string, unknown>;
    /** Node outputs */
    outputs: Record<string, unknown>;
    /** Node position */
    position: {
        x: number;
        y: number;
    };
    /** Node metadata */
    metadata: Record<string, unknown>;
}
export interface ComfyWorkflowConnection {
    /** Source node and output */
    from: {
        nodeId: string;
        output: string;
    };
    /** Target node and input */
    to: {
        nodeId: string;
        input: string;
    };
}
export interface ComfyJob {
    /** Job identifier */
    id: string;
    /** Job timestamp */
    timestamp: Date;
    /** Job status */
    status: ComfyJobStatus;
    /** Job progress (0-1) */
    progress: number;
    /** Job message */
    message?: string;
    /** Started timestamp */
    startedAt?: Date;
    /** Completed timestamp */
    completedAt?: Date;
    /** Error message */
    error?: string;
}
export type ComfyJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export interface ComfyJobResult {
    /** Job identifier */
    id: string;
    /** Final status */
    status: "completed" | "failed";
    /** Job outputs */
    outputs: Record<string, unknown>;
    /** Error message if failed */
    error?: string;
    /** Completion timestamp */
    completedAt: Date;
}
export interface ComfyImage {
    /** Image filename */
    filename: string;
    /** Image subfolder */
    subfolder: string;
    /** Image type */
    type: "output" | "input" | "temp";
    /** Image URL */
    url?: string;
    /** Image metadata */
    metadata?: Record<string, unknown>;
}
export interface ComfyText2ImgParams {
    /** Positive prompt */
    caption: string;
    /** Negative prompt */
    negative?: string;
    /** Image width */
    width?: number;
    /** Image height */
    height?: number;
    /** Model checkpoint */
    checkpoint?: string;
    /** LoRA models */
    loras?: string[];
    /** LoRA weights */
    loraWeights?: number[];
    /** Sampling method */
    sampler?: string;
    /** Scheduler type */
    scheduler?: string;
    /** Sampling steps */
    steps?: number;
    /** CFG scale */
    cfg?: number;
    /** Random seed */
    seed?: number;
    /** Enable PAG */
    pag?: boolean;
    /** Enable DeepShrink */
    deepshrink?: boolean;
    /** Enable Detail Daemon */
    detailDaemon?: boolean;
    /** Enable Split Sigmas */
    splitSigmas?: boolean;
}
export interface ComfyValidationResult {
    /** Whether the input is valid */
    isValid: boolean;
    /** Alternative suggestions */
    suggestions: string[];
    /** Validation errors */
    errors: string[];
}
export interface ComfyPreset {
    /** Preset name */
    name: string;
    /** Preset description */
    description?: string;
    /** Preset category */
    category: string;
    /** Preset workflow */
    workflow: Record<string, unknown>;
    /** Preset parameters */
    parameters?: Record<string, unknown>;
    /** Whether this is the default preset */
    isDefault: boolean;
    /** Creation timestamp */
    createdAt?: Date;
    /** Last update timestamp */
    updatedAt?: Date;
    /** Creator username */
    createdBy?: string;
}
export interface ComfyWorkflowTemplate {
    /** Template ID */
    id: string;
    /** Template name */
    name: string;
    /** Template description */
    description: string;
    /** Template category */
    category: string;
    /** Template workflow */
    workflow: Record<string, unknown>;
    /** Template author */
    author: string;
    /** Template tags */
    tags: string[];
    /** Template parameters */
    parameters?: Record<string, unknown>;
    /** Template visibility */
    visibility: "private" | "public" | "community";
    /** Parent template ID for branches */
    parentTemplateId?: string;
    /** Branch name */
    branchName?: string;
    /** Whether this is a community template */
    isCommunity: boolean;
    /** Usage count */
    usageCount: number;
    /** Average rating */
    rating?: number;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
}
export interface ComfyQueueStatus {
    /** Whether the queue is running */
    queueRunning: boolean;
    /** Number of items remaining */
    queueRemaining: number;
    /** Whether the queue is paused */
    queuePaused: boolean;
    /** Total queue size */
    queueSize: number;
}
export interface ComfyQueueItem {
    /** Prompt ID */
    promptId: string;
    /** Item status */
    status: ComfyJobStatus;
    /** Progress (0-1) */
    progress: number;
    /** Timestamp */
    timestamp: number;
    /** Workflow definition */
    workflow?: Record<string, any>;
    /** Client ID */
    clientId?: string;
}
export interface ComfyHealthStatus {
    /** Whether ComfyUI integration is enabled */
    enabled: boolean;
    /** Service status */
    status: "ok" | "error" | "disabled";
    /** Connection state */
    connectionState?: string;
    /** Connection attempts */
    connectionAttempts?: number;
    /** ComfyUI base URL */
    baseUrl?: string;
    /** Service information */
    service?: Record<string, any>;
}
export interface ComfyIngestResult {
    /** Whether ingestion was successful */
    success: boolean;
    /** Path to ingested image */
    imagePath?: string;
    /** Path to metadata file */
    metadataPath?: string;
    /** Whether image was deduplicated */
    deduplicated: boolean;
    /** Result message */
    message: string;
}
export interface ComfyStreamEvent {
    /** Event type */
    type: "status" | "error" | "warning" | "images";
    /** Event data */
    data?: any;
    /** Event message */
    message?: string;
    /** Event timestamp */
    timestamp?: number;
}
