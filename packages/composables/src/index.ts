// State management composables
export { createAuthFetch, useAuthFetch } from './state/useAuthFetch';
export type { AuthFetchOptions } from './state/useAuthFetch';

export { useServiceManager } from './state/useServiceManager';
export type { 
  ServiceStatus, 
  ServiceSummary, 
  ServiceProgress, 
  ServiceManagerState,
  ServiceManagerOptions 
} from './state/useServiceManager';

// UI composables
export { useDragAndDrop } from './ui/useDragAndDrop';
export type { DragAndDropOptions } from './ui/useDragAndDrop';

// Performance monitoring
export { usePerformanceMonitor } from './performance/usePerformanceMonitor';
export type { 
  PerformanceMetrics, 
  PerformanceWarning, 
  PerformanceDebugger 
} from './performance/usePerformanceMonitor';

// AI/RAG composables
export { createRAGClient, useRAG } from './ai/useRAG';
export type { 
  RAGModality,
  RAGQueryParams,
  RAGQueryHit,
  RAGQueryResponse,
  RAGIngestItem,
  RAGStreamEvent,
  RAGConfig,
  RAGIndexingStatus,
  RAGMetrics,
  RAGClientOptions
} from './ai/useRAG';

// File handling
export { useFileUpload } from './file/useFileUpload';
export type { FileUploadOptions, UploadProgress } from './file/useFileUpload';

// Content/storage composables
export { useLocalStorage, useSessionStorage } from './content/useLocalStorage';
export type { LocalStorageOptions } from './content/useLocalStorage';