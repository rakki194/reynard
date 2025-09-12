/**
 * NLWeb Service
 *
 * Main service that orchestrates the NLWeb assistant tooling and routing system.
 * Provides a unified interface for tool suggestion, performance monitoring, and configuration.
 */

import {
  NLWebService as INLWebService,
  NLWebRouter,
  NLWebToolRegistry,
  NLWebConfiguration,
  NLWebHealthStatus,
  NLWebTool,
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
  NLWebEvent,
  NLWebEventEmitter,
} from "../types/index.js";
import { NLWebRouter as NLWebRouterImpl } from "../router/NLWebRouter.js";
import { NLWebToolRegistry as NLWebToolRegistryImpl } from "../router/NLWebToolRegistry.js";

export class NLWebService implements INLWebService {
  private router: NLWebRouter;
  private toolRegistry: NLWebToolRegistry;
  private configuration: NLWebConfiguration;
  private eventEmitter: NLWebEventEmitter;
  private initialized = false;

  constructor(
    configuration: NLWebConfiguration,
    eventEmitter: NLWebEventEmitter,
  ) {
    this.configuration = configuration;
    this.eventEmitter = eventEmitter;
    this.toolRegistry = new NLWebToolRegistryImpl();
    this.router = new NLWebRouterImpl(this.toolRegistry, eventEmitter);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize the router
      await this.router.initialize();

      // Register default tools if configuration is enabled
      if (this.configuration.enabled) {
        await this.registerDefaultTools();
      }

      this.initialized = true;
      this.emitEvent("health_check", { status: "initialized" });
    } catch (error) {
      this.emitEvent("error", {
        error: error instanceof Error ? error.message : String(error),
        phase: "initialization",
      });
      throw error;
    }
  }

  /**
   * Get the router instance
   */
  getRouter(): NLWebRouter {
    return this.router;
  }

  /**
   * Get the tool registry
   */
  getToolRegistry(): NLWebToolRegistry {
    return this.toolRegistry;
  }

  /**
   * Get service configuration
   */
  getConfiguration(): NLWebConfiguration {
    return { ...this.configuration };
  }

  /**
   * Update service configuration
   */
  async updateConfiguration(
    config: Partial<NLWebConfiguration>,
  ): Promise<void> {
    this.configuration = { ...this.configuration, ...config };

    // Reinitialize if configuration changed significantly
    if (config.enabled !== undefined || config.cache || config.performance) {
      await this.router.shutdown();
      await this.router.initialize();
    }

    this.emitEvent("health_check", { status: "configuration_updated" });
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<NLWebHealthStatus> {
    if (!this.initialized) {
      return {
        status: "unhealthy",
        available: false,
        lastCheck: Date.now(),
        performance: {
          totalRequests: 0,
          avgProcessingTime: 0,
          p95ProcessingTime: 0,
          p99ProcessingTime: 0,
          cacheHitRate: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cacheSize: 0,
          maxCacheSize: 0,
        },
        configuration: {
          enabled: this.configuration.enabled,
          canaryEnabled: this.configuration.canary.enabled,
          rollbackEnabled: this.configuration.rollback.enabled,
          performanceMonitoring: this.configuration.performance.enabled,
        },
        error: "Service not initialized",
      };
    }

    return this.router.getHealthStatus();
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await this.router.shutdown();
      this.initialized = false;
      this.emitEvent("health_check", { status: "shutdown" });
    } catch (error) {
      this.emitEvent("error", {
        error: error instanceof Error ? error.message : String(error),
        phase: "shutdown",
      });
      throw error;
    }
  }

  /**
   * Register default tools for common operations
   */
  private async registerDefaultTools(): Promise<void> {
    const defaultTools: NLWebTool[] = [
      {
        name: "git_status",
        description: "Check the status of a git repository",
        category: "git",
        tags: ["git", "status", "repository"],
        path: "/api/tools/git_status",
        method: "POST",
        parameters: [
          {
            name: "dataset_path",
            type: "string",
            description: "Directory path to inspect",
            required: true,
          },
        ],
        examples: [
          "git status",
          "check repository status",
          "what files are changed",
        ],
        enabled: true,
        priority: 80,
        timeout: 5000,
      },
      {
        name: "list_directory",
        description: "List files and directories in a path",
        category: "file-operations",
        tags: ["file", "directory", "list", "browse"],
        path: "/api/files/list",
        method: "POST",
        parameters: [
          {
            name: "path",
            type: "string",
            description: "Directory to list",
            required: true,
          },
          {
            name: "limit",
            type: "number",
            description: "Maximum number of entries to return",
            required: false,
            default: 100,
            constraints: {
              min: 1,
              max: 1000,
            },
          },
        ],
        examples: [
          "list files",
          "show directory contents",
          "what files are here",
        ],
        enabled: true,
        priority: 70,
        timeout: 3000,
      },
      {
        name: "git_commit",
        description: "Commit changes to a git repository",
        category: "git",
        tags: ["git", "commit", "save"],
        path: "/api/tools/git_commit",
        method: "POST",
        parameters: [
          {
            name: "dataset_path",
            type: "string",
            description: "Directory path",
            required: true,
          },
          {
            name: "message",
            type: "string",
            description: "Commit message",
            required: true,
            constraints: {
              minLength: 1,
              maxLength: 500,
            },
          },
        ],
        examples: ["commit changes", "save changes", "commit with message"],
        enabled: true,
        priority: 75,
        timeout: 10000,
      },
      {
        name: "git_create_branch",
        description: "Create a new git branch",
        category: "git",
        tags: ["git", "branch", "create"],
        path: "/api/tools/git_create_branch",
        method: "POST",
        parameters: [
          {
            name: "dataset_path",
            type: "string",
            description: "Directory path",
            required: true,
          },
          {
            name: "branch_name",
            type: "string",
            description: "Name of the new branch",
            required: true,
            constraints: {
              minLength: 1,
              maxLength: 100,
              pattern: "^[a-zA-Z0-9\\-_./]+$",
            },
          },
        ],
        examples: ["create new branch", "make branch", "new branch"],
        enabled: true,
        priority: 65,
        timeout: 5000,
      },
      {
        name: "generate_captions",
        description: "Generate captions for images",
        category: "ai",
        tags: ["caption", "image", "ai", "generate"],
        path: "/api/caption/generate",
        method: "POST",
        parameters: [
          {
            name: "images",
            type: "array",
            description: "List of image paths to caption",
            required: true,
          },
          {
            name: "generator",
            type: "string",
            description: "Caption generator to use",
            required: false,
            default: "auto",
            constraints: {
              enum: ["auto", "jtp2", "florence2", "wdv3", "joy"],
            },
          },
        ],
        examples: ["generate captions", "caption images", "describe images"],
        enabled: true,
        priority: 85,
        timeout: 30000,
      },
      {
        name: "batch_process",
        description: "Process multiple files in batch",
        category: "batch-operations",
        tags: ["batch", "process", "multiple", "files"],
        path: "/api/batch/process",
        method: "POST",
        parameters: [
          {
            name: "files",
            type: "array",
            description: "List of files to process",
            required: true,
          },
          {
            name: "operation",
            type: "string",
            description: "Operation to perform on files",
            required: true,
            constraints: {
              enum: ["caption", "resize", "convert", "analyze"],
            },
          },
        ],
        examples: [
          "batch process files",
          "process multiple images",
          "bulk operation",
        ],
        enabled: true,
        priority: 60,
        timeout: 60000,
      },
    ];

    // Register all default tools
    for (const tool of defaultTools) {
      this.toolRegistry.register(tool);
    }

    this.emitEvent("health_check", {
      status: "tools_registered",
      count: defaultTools.length,
    });
  }

  /**
   * Emit an event
   */
  private emitEvent(type: NLWebEvent["type"], data: any): void {
    const event: NLWebEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    this.eventEmitter.emit(event);
  }
}

/**
 * Create a default NLWeb configuration
 */
export function createDefaultNLWebConfiguration(): NLWebConfiguration {
  return {
    enabled: true,
    configDir: "./config/nlweb",
    cache: {
      ttl: 600, // 10 minutes
      maxEntries: 1000,
      allowStaleOnError: true,
    },
    performance: {
      enabled: true,
      suggestionTimeout: 1500, // 1.5 seconds
      maxSuggestions: 3,
      minScore: 30,
    },
    rateLimit: {
      requestsPerMinute: 60,
      windowSeconds: 60,
    },
    canary: {
      enabled: false,
      percentage: 5.0,
    },
    rollback: {
      enabled: false,
    },
  };
}

/**
 * Create a simple event emitter implementation
 */
export class SimpleEventEmitter implements NLWebEventEmitter {
  private listeners = new Map<NLWebEvent["type"], Set<NLWebEventListener>>();

  on(eventType: NLWebEvent["type"], listener: NLWebEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  off(eventType: NLWebEvent["type"], listener: NLWebEventListener): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  emit(event: NLWebEvent): void {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      }
    }
  }
}
