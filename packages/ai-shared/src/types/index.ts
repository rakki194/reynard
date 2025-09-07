/**
 * Shared AI/ML Types for Reynard
 * 
 * This module provides common type definitions used across all AI/ML packages
 * in the Reynard framework. These types ensure consistency and type safety
 * throughout the AI/ML ecosystem.
 */

// ============================================================================
// Service Health and Status Types
// ============================================================================

export enum ServiceStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error',
  UNKNOWN = 'unknown'
}

export enum ServiceHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export interface ServiceHealthInfo {
  status: ServiceStatus
  health: ServiceHealth
  lastCheck: Date
  uptime: number
  memoryUsage: number
  cpuUsage: number
  errorCount: number
  lastError?: string
  metadata: Record<string, any>
}

// ============================================================================
// Model Management Types
// ============================================================================

export enum ModelStatus {
  NOT_LOADED = 'not_loaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  UNLOADING = 'unloading',
  ERROR = 'error'
}

export enum ModelType {
  CAPTION = 'caption',
  EMBEDDING = 'embedding',
  DIFFUSION = 'diffusion',
  TTS = 'tts',
  LLM = 'llm',
  VISION = 'vision'
}

export interface ModelInfo {
  id: string
  name: string
  type: ModelType
  version: string
  description: string
  status: ModelStatus
  size: number
  memoryUsage: number
  gpuAcceleration: boolean
  supportedFormats: string[]
  configSchema: Record<string, any>
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ModelConfig {
  threshold?: number
  maxLength?: number
  temperature?: number
  batchSize?: number
  gpuAcceleration?: boolean
  postProcessing?: PostProcessingRules
  [key: string]: any
}

// ============================================================================
// Caption Generation Types
// ============================================================================

export enum CaptionType {
  TAGS = 'tags',
  CAPTION = 'caption',
  DESCRIPTION = 'description',
  E621 = 'e621',
  TOML = 'toml'
}

export interface CaptionTask {
  imagePath: string
  generatorName: string
  config?: ModelConfig
  postProcess?: boolean
  force?: boolean
  metadata?: Record<string, any>
}

export interface CaptionResult {
  imagePath: string
  generatorName: string
  success: boolean
  caption: string
  captionType: CaptionType
  processingTime: number
  confidence?: number
  error?: string
  metadata?: Record<string, any>
}

export interface PostProcessingRules {
  replaceUnderscores: boolean
  normalizeSpacing: boolean
  addPunctuation: boolean
  removeDuplicates: boolean
  customRules: Array<{
    pattern: string
    replacement: string
    flags?: string
  }>
}

// ============================================================================
// Embedding and Vector Search Types
// ============================================================================

export interface EmbeddingResult {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
  createdAt: Date
}

export interface SearchResult {
  id: string
  content: string
  similarity: number
  metadata: Record<string, any>
}

export interface IndexItem {
  id: string
  content: string
  contentType: string
  metadata: Record<string, any>
}

// ============================================================================
// Chat and LLM Types
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface ChatContext {
  currentPath?: string
  selectedImages?: string[]
  gitStatus?: any
  userPreferences?: Record<string, any>
}

export interface ChatResponse {
  message: string
  model: string
  processingTime: number
  tokensUsed?: number
  metadata?: Record<string, any>
}

// ============================================================================
// TTS Types
// ============================================================================

export interface TTSOptions {
  voice?: string
  speed?: number
  pitch?: number
  volume?: number
  format?: 'wav' | 'mp3' | 'ogg'
  quality?: 'low' | 'medium' | 'high'
}

export interface Voice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  age: 'child' | 'young' | 'adult' | 'elderly'
  description: string
  previewUrl?: string
}

export interface VoiceInfo {
  voice: Voice
  isAvailable: boolean
  sampleRate: number
  bitRate: number
  channels: number
}

// ============================================================================
// ComfyUI Types
// ============================================================================

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  metadata: Record<string, any>
}

export interface WorkflowNode {
  id: string
  type: string
  inputs: Record<string, any>
  outputs: Record<string, any>
  position: { x: number; y: number }
  metadata: Record<string, any>
}

export interface WorkflowConnection {
  from: { nodeId: string; output: string }
  to: { nodeId: string; input: string }
}

export interface JobId {
  id: string
  timestamp: Date
}

export interface JobStatus {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  message?: string
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export interface JobResult {
  id: string
  status: 'completed' | 'failed'
  outputs: Record<string, any>
  error?: string
  completedAt: Date
}

// ============================================================================
// Performance and Monitoring Types
// ============================================================================

export interface PerformanceMetrics {
  operation: string
  duration: number
  memoryUsage: number
  cpuUsage: number
  gpuUsage?: number
  timestamp: Date
  metadata: Record<string, any>
}

export interface MemoryInfo {
  total: number
  used: number
  free: number
  available: number
  percentage: number
}

export interface GPUInfo {
  name: string
  memory: {
    total: number
    used: number
    free: number
  }
  utilization: number
  temperature: number
  powerUsage: number
}

// ============================================================================
// Error and Validation Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface MultiValidationResult {
  isValid: boolean
  results: Record<string, ValidationResult>
  errors: string[]
  warnings: string[]
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export class ModelError extends AIError {
  constructor(message: string, public modelName: string, context?: Record<string, any>) {
    super(message, 'MODEL_ERROR', { modelName, ...context })
    this.name = 'ModelError'
  }
}

export class ServiceError extends AIError {
  constructor(message: string, public serviceName: string, context?: Record<string, any>) {
    super(message, 'SERVICE_ERROR', { serviceName, ...context })
    this.name = 'ServiceError'
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface GlobalAIConfig {
  defaultModels: Record<ModelType, string>
  gpuAcceleration: boolean
  maxConcurrentModels: number
  defaultBatchSize: number
  cacheEnabled: boolean
  cacheSize: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  performanceMonitoring: boolean
  autoCleanup: boolean
  cleanupInterval: number
}

export interface ServiceConfig {
  name: string
  dependencies?: string[]
  requiredPackages?: string[]
  startupPriority?: number
  healthCheckInterval?: number
  autoStart?: boolean
  config?: Record<string, any>
}

// ============================================================================
// Utility Types
// ============================================================================

export type AsyncResult<T, E = Error> = Promise<{ success: true; data: T } | { success: false; error: E }>

export type ProgressCallback = (progress: number, message?: string) => void

export type HealthCheckCallback = () => Promise<ServiceHealthInfo>

export type ShutdownCallback = () => Promise<void>

export type InitializationCallback = () => Promise<void>

// ============================================================================
// Export all types
// ============================================================================

export * from './index'
