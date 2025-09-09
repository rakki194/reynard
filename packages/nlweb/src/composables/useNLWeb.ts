/**
 * NLWeb Composable
 * 
 * React composable for integrating with the NLWeb assistant tooling and routing system.
 * Provides reactive state management and API integration.
 */

import { createSignal, createEffect, onCleanup } from 'solid-js';
import { 
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
  NLWebHealthStatus,
  NLWebConfiguration,
  NLWebTool,
  NLWebContext
} from '../types/index.js';

export interface UseNLWebOptions {
  /** Base URL for NLWeb API */
  baseUrl?: string;
  /** Default context for suggestions */
  defaultContext?: NLWebContext;
  /** Whether to enable automatic health checks */
  enableHealthChecks?: boolean;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
  /** Request timeout in milliseconds */
  requestTimeout?: number;
}

export interface UseNLWebReturn {
  // State
  suggestions: () => NLWebSuggestionResponse | null;
  health: () => NLWebHealthStatus | null;
  configuration: () => NLWebConfiguration | null;
  tools: () => NLWebTool[];
  loading: () => boolean;
  error: () => string | null;

  // Actions
  suggest: (query: string, context?: NLWebContext) => Promise<NLWebSuggestionResponse>;
  getHealth: () => Promise<NLWebHealthStatus>;
  getConfiguration: () => Promise<NLWebConfiguration>;
  getTools: (category?: string, tags?: string[]) => Promise<NLWebTool[]>;
  registerTool: (tool: NLWebTool) => Promise<void>;
  unregisterTool: (toolName: string) => Promise<void>;
  updateConfiguration: (config: Partial<NLWebConfiguration>) => Promise<void>;
  enableRollback: (reason?: string) => Promise<void>;
  disableRollback: () => Promise<void>;

  // Utilities
  isHealthy: () => boolean;
  isAvailable: () => boolean;
  getPerformanceStats: () => any;
}

export function useNLWeb(options: UseNLWebOptions = {}): UseNLWebReturn {
  const {
    baseUrl = '/api/nlweb',
    defaultContext = {},
    enableHealthChecks = true,
    healthCheckInterval = 30000, // 30 seconds
    requestTimeout = 10000 // 10 seconds
  } = options;

  // State signals
  const [suggestions, setSuggestions] = createSignal<NLWebSuggestionResponse | null>(null);
  const [health, setHealth] = createSignal<NLWebHealthStatus | null>(null);
  const [configuration, setConfiguration] = createSignal<NLWebConfiguration | null>(null);
  const [tools, setTools] = createSignal<NLWebTool[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Health check interval
  let healthCheckTimer: number | null = null;

  // Initialize health checks
  createEffect(() => {
    if (enableHealthChecks) {
      // Initial health check
      getHealth();

      // Set up interval
      healthCheckTimer = setInterval(() => {
        getHealth();
      }, healthCheckInterval);
    }

    onCleanup(() => {
      if (healthCheckTimer) {
        clearInterval(healthCheckTimer);
      }
    });
  });

  /**
   * Make API request with error handling
   */
  async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get tool suggestions for a query
   */
  async function suggest(query: string, context: NLWebContext = {}): Promise<NLWebSuggestionResponse> {
    const mergedContext = { ...defaultContext, ...context };
    
    const response = await apiRequest<NLWebSuggestionResponse>('/suggest', {
      method: 'POST',
      body: JSON.stringify({
        query,
        context: mergedContext,
        maxSuggestions: 3,
        minScore: 30,
        includeReasoning: true
      })
    });

    setSuggestions(response);
    return response;
  }

  /**
   * Get service health status
   */
  async function getHealth(): Promise<NLWebHealthStatus> {
    const response = await apiRequest<NLWebHealthStatus>('/health');
    setHealth(response);
    return response;
  }

  /**
   * Get service configuration
   */
  async function getConfiguration(): Promise<NLWebConfiguration> {
    const response = await apiRequest<{ configuration: NLWebConfiguration }>('/status');
    setConfiguration(response.configuration);
    return response.configuration;
  }

  /**
   * Get registered tools
   */
  async function getTools(category?: string, tags?: string[]): Promise<NLWebTool[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (tags && tags.length > 0) params.append('tags', tags.join(','));

    const endpoint = `/tools${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiRequest<{ tools: NLWebTool[] }>(endpoint);
    
    setTools(response.tools);
    return response.tools;
  }

  /**
   * Register a new tool
   */
  async function registerTool(tool: NLWebTool): Promise<void> {
    await apiRequest('/tools', {
      method: 'POST',
      body: JSON.stringify(tool)
    });

    // Refresh tools list
    await getTools();
  }

  /**
   * Unregister a tool
   */
  async function unregisterTool(toolName: string): Promise<void> {
    await apiRequest(`/tools/${encodeURIComponent(toolName)}`, {
      method: 'DELETE'
    });

    // Refresh tools list
    await getTools();
  }

  /**
   * Update service configuration
   */
  async function updateConfiguration(config: Partial<NLWebConfiguration>): Promise<void> {
    await apiRequest('/configuration', {
      method: 'PUT',
      body: JSON.stringify(config)
    });

    // Refresh configuration
    await getConfiguration();
  }

  /**
   * Enable emergency rollback
   */
  async function enableRollback(reason?: string): Promise<void> {
    await apiRequest('/rollback', {
      method: 'POST',
      body: JSON.stringify({
        enable: true,
        reason: reason || 'Manual rollback'
      })
    });
  }

  /**
   * Disable emergency rollback
   */
  async function disableRollback(): Promise<void> {
    await apiRequest('/rollback', {
      method: 'POST',
      body: JSON.stringify({
        enable: false,
        reason: 'Manual disable'
      })
    });
  }

  /**
   * Check if service is healthy
   */
  function isHealthy(): boolean {
    const healthStatus = health();
    return healthStatus?.status === 'healthy';
  }

  /**
   * Check if service is available
   */
  function isAvailable(): boolean {
    const healthStatus = health();
    return healthStatus?.available === true;
  }

  /**
   * Get performance statistics
   */
  function getPerformanceStats(): any {
    const healthStatus = health();
    return healthStatus?.performance || null;
  }

  return {
    // State
    suggestions,
    health,
    configuration,
    tools,
    loading,
    error,

    // Actions
    suggest,
    getHealth,
    getConfiguration,
    getTools,
    registerTool,
    unregisterTool,
    updateConfiguration,
    enableRollback,
    disableRollback,

    // Utilities
    isHealthy,
    isAvailable,
    getPerformanceStats
  };
}
