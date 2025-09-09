/**
 * NLWeb Types
 * 
 * Type definitions for the NLWeb assistant tooling and routing system.
 */

export interface NLWebTool {
  /** Unique identifier for the tool */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** Category for grouping tools */
  category: string;
  /** Tags for search and filtering */
  tags: string[];
  /** Tool execution path or endpoint */
  path: string;
  /** HTTP method for tool execution */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Required parameters for tool execution */
  parameters: NLWebToolParameter[];
  /** Example usage prompts */
  examples: string[];
  /** Whether the tool is currently enabled */
  enabled: boolean;
  /** Priority for tool selection (higher = more likely to be selected) */
  priority: number;
  /** Execution timeout in milliseconds */
  timeout: number;
}

export interface NLWebToolParameter {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Human-readable description */
  description: string;
  /** Whether the parameter is required */
  required: boolean;
  /** Default value if not provided */
  default?: any;
  /** Validation constraints */
  constraints?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

export interface NLWebSuggestion {
  /** Tool that was suggested */
  tool: NLWebTool;
  /** Confidence score (0-100) */
  score: number;
  /** Suggested parameters for the tool */
  parameters: Record<string, any>;
  /** Reasoning for why this tool was suggested */
  reasoning: string;
  /** Parameter hints for better execution */
  parameterHints: Record<string, any>;
}

export interface NLWebContext {
  /** Current working directory or path */
  currentPath?: string;
  /** Selected files or items */
  selectedItems?: string[];
  /** Git repository status */
  gitStatus?: {
    isRepository: boolean;
    branch?: string;
    isDirty: boolean;
    modifiedFiles?: string[];
    stagedFiles?: string[];
    untrackedFiles?: string[];
  };
  /** User preferences and settings */
  userPreferences?: Record<string, any>;
  /** Current application state */
  applicationState?: Record<string, any>;
  /** User identifier for personalization */
  userId?: string;
  /** Session information */
  sessionId?: string;
}

export interface NLWebQuery {
  /** The natural language query */
  text: string;
  /** Additional context for the query */
  context: NLWebContext;
  /** Maximum number of suggestions to return */
  maxSuggestions?: number;
  /** Minimum confidence score for suggestions */
  minScore?: number;
  /** Whether to include reasoning in suggestions */
  includeReasoning?: boolean;
}

export interface NLWebSuggestionRequest {
  /** The query to process */
  query: NLWebQuery;
  /** Request metadata */
  metadata?: {
    requestId?: string;
    timestamp?: number;
    source?: string;
  };
}

export interface NLWebSuggestionResponse {
  /** List of tool suggestions */
  suggestions: NLWebSuggestion[];
  /** Query processing time in milliseconds */
  processingTime: number;
  /** Cache hit information */
  cacheInfo?: {
    hit: boolean;
    key: string;
    age: number;
  };
  /** Request metadata */
  metadata: {
    requestId: string;
    timestamp: number;
    version: string;
  };
}

export interface NLWebPerformanceStats {
  /** Total number of requests processed */
  totalRequests: number;
  /** Average processing time in milliseconds */
  avgProcessingTime: number;
  /** 95th percentile processing time */
  p95ProcessingTime: number;
  /** 99th percentile processing time */
  p99ProcessingTime: number;
  /** Cache hit rate percentage */
  cacheHitRate: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of cache misses */
  cacheMisses: number;
  /** Current cache size */
  cacheSize: number;
  /** Maximum cache size */
  maxCacheSize: number;
}

export interface NLWebHealthStatus {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Service availability */
  available: boolean;
  /** Last health check timestamp */
  lastCheck: number;
  /** Performance statistics */
  performance: NLWebPerformanceStats;
  /** Configuration status */
  configuration: {
    enabled: boolean;
    canaryEnabled: boolean;
    rollbackEnabled: boolean;
    performanceMonitoring: boolean;
  };
  /** Error information if unhealthy */
  error?: string;
}

export interface NLWebConfiguration {
  /** Whether NLWeb integration is enabled */
  enabled: boolean;
  /** Configuration directory path */
  configDir: string;
  /** External NLWeb server URL (optional) */
  baseUrl?: string;
  /** Cache configuration */
  cache: {
    /** Cache TTL in seconds */
    ttl: number;
    /** Maximum cache entries */
    maxEntries: number;
    /** Whether to allow stale cache on errors */
    allowStaleOnError: boolean;
  };
  /** Performance monitoring */
  performance: {
    /** Whether performance monitoring is enabled */
    enabled: boolean;
    /** Suggestion timeout in milliseconds */
    suggestionTimeout: number;
    /** Maximum number of suggestions to return */
    maxSuggestions: number;
    /** Minimum confidence score */
    minScore: number;
  };
  /** Rate limiting */
  rateLimit: {
    /** Maximum requests per minute */
    requestsPerMinute: number;
    /** Rate limit window in seconds */
    windowSeconds: number;
  };
  /** Canary rollout settings */
  canary: {
    /** Whether canary rollout is enabled */
    enabled: boolean;
    /** Percentage of users in canary */
    percentage: number;
  };
  /** Emergency rollback */
  rollback: {
    /** Whether emergency rollback is enabled */
    enabled: boolean;
    /** Reason for rollback */
    reason?: string;
  };
}

export interface NLWebToolRegistry {
  /** Register a new tool */
  register(tool: NLWebTool): void;
  /** Unregister a tool */
  unregister(toolName: string): void;
  /** Get all registered tools */
  getAllTools(): NLWebTool[];
  /** Get tools by category */
  getToolsByCategory(category: string): NLWebTool[];
  /** Get tools by tags */
  getToolsByTags(tags: string[]): NLWebTool[];
  /** Get a specific tool by name */
  getTool(toolName: string): NLWebTool | undefined;
  /** Check if a tool is registered */
  hasTool(toolName: string): boolean;
  /** Get tool statistics */
  getStats(): {
    totalTools: number;
    toolsByCategory: Record<string, number>;
    toolsByTag: Record<string, number>;
  };
}

export interface NLWebRouter {
  /** Initialize the router */
  initialize(): Promise<void>;
  /** Get tool suggestions for a query */
  suggest(request: NLWebSuggestionRequest): Promise<NLWebSuggestionResponse>;
  /** Get router health status */
  getHealthStatus(): Promise<NLWebHealthStatus>;
  /** Get performance statistics */
  getPerformanceStats(): NLWebPerformanceStats;
  /** Force a health check */
  forceHealthCheck(): Promise<NLWebHealthStatus>;
  /** Shutdown the router */
  shutdown(): Promise<void>;
}

export interface NLWebService {
  /** Initialize the service */
  initialize(): Promise<void>;
  /** Get the router instance */
  getRouter(): NLWebRouter;
  /** Get the tool registry */
  getToolRegistry(): NLWebToolRegistry;
  /** Get service configuration */
  getConfiguration(): NLWebConfiguration;
  /** Update service configuration */
  updateConfiguration(config: Partial<NLWebConfiguration>): Promise<void>;
  /** Get service health status */
  getHealthStatus(): Promise<NLWebHealthStatus>;
  /** Shutdown the service */
  shutdown(): Promise<void>;
}

// Event types for NLWeb system
export interface NLWebEvent {
  type: 'tool_suggested' | 'tool_executed' | 'cache_hit' | 'cache_miss' | 'error' | 'health_check';
  timestamp: number;
  data: any;
}

export interface NLWebEventListener {
  (event: NLWebEvent): void;
}

export interface NLWebEventEmitter {
  /** Add an event listener */
  on(eventType: NLWebEvent['type'], listener: NLWebEventListener): void;
  /** Remove an event listener */
  off(eventType: NLWebEvent['type'], listener: NLWebEventListener): void;
  /** Emit an event */
  emit(event: NLWebEvent): void;
}
