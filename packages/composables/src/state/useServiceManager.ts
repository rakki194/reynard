import { createSignal, createEffect, onCleanup, createMemo } from 'solid-js';

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'failed' | 'starting' | 'stopping';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message?: string;
  lastCheck?: string;
  uptime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  startupTime?: number;
  isRunning: boolean;
  isHealthy: boolean;
}

export interface ServiceSummary {
  totalServices: number;
  runningServices: number;
  healthyServices: number;
  failedServices: number;
  successRate: number;
}

export interface ServiceProgress {
  isStarting: boolean;
  totalStartupTime?: number;
  progress: Record<string, any>;
}

export interface ServiceManagerState {
  services: Record<string, ServiceStatus>;
  summary: ServiceSummary;
  progress: ServiceProgress;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

export interface ServiceManagerOptions {
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  notify?: (message: string, type?: 'error' | 'success' | 'info' | 'warning') => void;
  websocketUrl?: string;
  refreshInterval?: number;
}

class ServiceManagerWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessage: ((data: any) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onReconnect: (() => void) | null = null;

  constructor(
    private url: string,
    private token: string
  ) {}

  connect() {
    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`);

      this.ws.onopen = () => {
        console.log('[ServiceManager] WebSocket connected');
        this.reconnectAttempts = 0;
        this.onReconnect?.();
      };

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage?.(data);
        } catch (error) {
          console.error('[ServiceManager] Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[ServiceManager] WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = error => {
        console.error('[ServiceManager] WebSocket error:', error);
        this.onError?.('WebSocket connection error');
      };
    } catch (error) {
      console.error('[ServiceManager] Failed to create WebSocket:', error);
      this.onError?.('Failed to create WebSocket connection');
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[ServiceManager] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('[ServiceManager] Max reconnection attempts reached');
      this.onError?.('Failed to reconnect after multiple attempts');
    }
  }

  setMessageHandler(handler: (data: any) => void) {
    this.onMessage = handler;
  }

  setErrorHandler(handler: (error: string) => void) {
    this.onError = handler;
  }

  setReconnectHandler(handler: () => void) {
    this.onReconnect = handler;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * Service Manager composable for monitoring and managing services
 * 
 * @param options Configuration options including authFetch and notification functions
 * @returns Service manager state and methods
 */
export function useServiceManager(options: ServiceManagerOptions) {
  const { authFetch, notify, websocketUrl, refreshInterval = 30000 } = options;

  const [services, setServices] = createSignal<Record<string, ServiceStatus>>({});
  const [summary, setSummary] = createSignal<ServiceSummary>({
    totalServices: 0,
    runningServices: 0,
    healthyServices: 0,
    failedServices: 0,
    successRate: 0,
  });
  const [progress, setProgress] = createSignal<ServiceProgress>({
    isStarting: false,
    progress: {},
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [lastUpdate, setLastUpdate] = createSignal<string | null>(null);

  const [ws, setWs] = createSignal<ServiceManagerWebSocket | null>(null);

  // Fetch service status from REST API
  const fetchServiceStatus = async (): Promise<ServiceManagerState> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authFetch('/api/services/status');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[useServiceManager] API response:', data);

      const result = {
        services: data.services || {},
        summary: {
          totalServices: data.summary?.total_services ?? 0,
          runningServices: data.summary?.running_services ?? 0,
          healthyServices: data.summary?.healthy_services ?? 0,
          failedServices: data.summary?.failed_services ?? 0,
          successRate: data.summary?.success_rate ?? 0,
        },
        progress: {
          isStarting: false,
          progress: {},
        },
        isLoading: false,
        error: null,
        lastUpdate: data.timestamp || new Date().toISOString(),
      };

      // Update state
      setServices(result.services);
      setSummary(result.summary);
      setProgress(result.progress);
      setLastUpdate(result.lastUpdate);

      return result;
    } catch (error) {
      console.error('[ServiceManager] Failed to fetch service status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      return {
        services: {},
        summary: {
          totalServices: 0,
          runningServices: 0,
          healthyServices: 0,
          failedServices: 0,
          successRate: 0,
        },
        progress: {
          isStarting: false,
          progress: {},
        },
        isLoading: false,
        error: errorMessage,
        lastUpdate: null,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch service health information
  const fetchServiceHealth = async (): Promise<Record<string, any>> => {
    try {
      const response = await authFetch('/api/services/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.services || {};
    } catch (error) {
      console.error('[ServiceManager] Failed to fetch service health:', error);
      return {};
    }
  };

  // Fetch startup progress
  const fetchStartupProgress = async (): Promise<ServiceProgress> => {
    try {
      const response = await authFetch('/api/services/progress');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        isStarting: data.is_starting || false,
        totalStartupTime: data.startup_info?.startup_time,
        progress: data.progress || {},
      };
    } catch (error) {
      console.error('[ServiceManager] Failed to fetch startup progress:', error);
      return {
        isStarting: false,
        progress: {},
      };
    }
  };

  // Check if a specific service is available
  const isServiceAvailable = (serviceName: string): boolean => {
    const service = services()[serviceName];
    return Boolean(service?.isRunning && service?.isHealthy);
  };

  // Check if multiple services are available
  const areServicesAvailable = (serviceNames: string[]): boolean => {
    return serviceNames.every(name => isServiceAvailable(name));
  };

  // Get service status by name
  const getServiceStatus = (serviceName: string): ServiceStatus | null => {
    return services()[serviceName] || null;
  };

  // Refresh service status
  const refreshStatus = async () => {
    try {
      await fetchServiceStatus();
    } catch (error) {
      console.error('[ServiceManager] Failed to refresh service status:', error);
    }
  };

  // Restart a specific service
  const restartService = async (serviceName: string): Promise<boolean> => {
    try {
      const response = await authFetch(`/api/services/restart/${serviceName}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      notify?.(`Service ${serviceName} restart initiated`, 'info');

      // Refresh status after a short delay
      setTimeout(() => {
        refreshStatus();
      }, 2000);

      return true;
    } catch (error) {
      console.error(`[ServiceManager] Failed to restart service ${serviceName}:`, error);
      notify?.(
        `Failed to restart service ${serviceName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
      return false;
    }
  };

  // Get service metrics
  const getServiceMetrics = async (serviceName?: string) => {
    try {
      const url = serviceName ? `/api/services/metrics/${serviceName}` : '/api/services/metrics';

      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[ServiceManager] Failed to fetch service metrics:', error);
      return null;
    }
  };

  // Get service dependencies
  const getServiceDependencies = async (serviceName: string) => {
    try {
      const response = await authFetch(`/api/services/dependencies/${serviceName}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[ServiceManager] Failed to fetch dependencies for ${serviceName}:`, error);
      return null;
    }
  };

  // Auto-refresh setup
  let refreshTimer: number | undefined;

  createEffect(() => {
    if (refreshInterval > 0) {
      refreshTimer = window.setInterval(refreshStatus, refreshInterval);
    }

    onCleanup(() => {
      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }
    });
  });

  // WebSocket setup (optional)
  createEffect(() => {
    if (websocketUrl) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        const websocket = new ServiceManagerWebSocket(websocketUrl, token);
        
        websocket.setMessageHandler((data) => {
          // Handle real-time updates
          if (data.type === 'service_update') {
            setServices(prev => ({
              ...prev,
              [data.service]: data.status
            }));
          }
        });

        websocket.setErrorHandler((error) => {
          console.error('[ServiceManager] WebSocket error:', error);
          setError(error);
        });

        websocket.connect();
        setWs(websocket);
      }
    }

    onCleanup(() => {
      const websocket = ws();
      if (websocket) {
        websocket.disconnect();
        setWs(null);
      }
    });
  });

  return {
    // State
    services,
    summary,
    progress,
    isLoading,
    error,
    lastUpdate,

    // Methods
    refreshStatus,
    restartService,
    getServiceMetrics,
    getServiceDependencies,
    isServiceAvailable,
    areServicesAvailable,
    getServiceStatus,
  };
}