/**
 * 🦊 Dev Server Management Manager
 *
 * Main orchestrator that integrates all components for comprehensive
 * development server management. Leverages existing Reynard patterns.
 */

import { EventEmitter } from "node:events";
import { ConfigManager } from "./ConfigManager.js";
import { PortManager } from "./PortManager.js";
import { ProcessManager } from "./ProcessManager.js";
import { HealthChecker } from "./HealthChecker.js";
import type {
  DevServerManager as IDevServerManager,
  ServerInfo,
  ProjectConfig,
  HealthStatus,
  DevServerEvent,
  DevServerEventType,
} from "../types/index.js";
import { ProjectNotFoundError } from "../types/index.js";

// ============================================================================
// Dev Server Manager Class
// ============================================================================

export class DevServerManager extends EventEmitter implements IDevServerManager {
  private configManager: ConfigManager;
  private portManager: PortManager;
  private processManager: ProcessManager;
  private healthChecker: HealthChecker;
  private isInitialized = false;

  constructor(configPath?: string) {
    super();
    this.configManager = new ConfigManager(configPath);
    this.portManager = new PortManager();
    this.processManager = new ProcessManager();
    this.healthChecker = new HealthChecker();

    this.setupEventHandlers();
  }

  /**
   * Initialize the dev server manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load configuration
      const config = await this.configManager.loadConfig();

      // Set up port ranges from configuration
      for (const [category, range] of Object.entries(config.portRanges)) {
        this.portManager.setPortRange(category as any, range);
      }

      this.isInitialized = true;
      this.emit("initialized", { config });
    } catch (error) {
      this.emit("initializationError", { error });
      throw error;
    }
  }

  /**
   * Start a development server
   */
  async start(project: string): Promise<void> {
    await this.ensureInitialized();

    const config = this.configManager.getProject(project);
    if (!config) {
      throw new ProjectNotFoundError(project);
    }

    try {
      this.emitEvent("server_starting", project);

      // Allocate port
      const portAllocation = await this.portManager.allocatePort(project, config.port, config.category);

      // Update config with allocated port
      const updatedConfig = { ...config, port: portAllocation.allocated };
      this.configManager.setProject(project, updatedConfig);

      // Start process
      const processOptions = {
        command: updatedConfig.command || "pnpm",
        args: updatedConfig.args || ["run", "dev"],
        cwd: updatedConfig.cwd,
        env: updatedConfig.env,
        timeout: updatedConfig.startupTimeout || 30000,
      };

      const processInfo = await this.processManager.startProcess(project, updatedConfig, processOptions);

      // Start health checking
      this.healthChecker.startHealthCheck(project, updatedConfig);

      this.emitEvent("server_started", project, {
        port: portAllocation.allocated,
        processInfo,
      });
    } catch (error) {
      this.emitEvent("server_error", project, { error });
      throw error;
    }
  }

  /**
   * Stop a development server
   */
  async stop(project: string): Promise<void> {
    await this.ensureInitialized();

    const config = this.configManager.getProject(project);
    if (!config) {
      throw new ProjectNotFoundError(project);
    }

    try {
      this.emitEvent("server_stopping", project);

      // Stop health checking
      this.healthChecker.stopHealthCheck(project);

      // Stop process
      await this.processManager.stopProcess(project);

      // Release port
      this.portManager.releasePort(config.port);

      this.emitEvent("server_stopped", project);
    } catch (error) {
      this.emitEvent("server_error", project, { error });
      throw error;
    }
  }

  /**
   * Restart a development server
   */
  async restart(project: string): Promise<void> {
    await this.ensureInitialized();

    const config = this.configManager.getProject(project);
    if (!config) {
      throw new ProjectNotFoundError(project);
    }

    try {
      // Stop the server
      await this.stop(project);

      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start the server
      await this.start(project);
    } catch (error) {
      this.emitEvent("server_error", project, { error });
      throw error;
    }
  }

  /**
   * Get server status
   */
  async status(project?: string): Promise<ServerInfo[]> {
    await this.ensureInitialized();

    if (project) {
      const config = this.configManager.getProject(project);
      if (!config) {
        throw new ProjectNotFoundError(project);
      }

      const processInfo = this.processManager.getProcess(project);
      const healthStatus = this.healthChecker.getHealthStatus(project);

      return [
        {
          name: project,
          status: processInfo?.status || "stopped",
          health: healthStatus?.health || "unknown",
          port: config.port,
          pid: processInfo?.pid,
          startTime: processInfo?.startTime,
          lastHealthCheck: healthStatus?.lastCheck,
          lastError: processInfo?.lastError || healthStatus?.error,
          metadata: {
            category: config.category,
            autoReload: config.autoReload,
            hotReload: config.hotReload,
          },
        },
      ];
    }

    // Return status for all projects
    const allProjects = this.configManager.getAllProjects();
    const statuses: ServerInfo[] = [];

    for (const [name, config] of Object.entries(allProjects)) {
      const processInfo = this.processManager.getProcess(name);
      const healthStatus = this.healthChecker.getHealthStatus(name);

      statuses.push({
        name,
        status: processInfo?.status || "stopped",
        health: healthStatus?.health || "unknown",
        port: config.port,
        pid: processInfo?.pid,
        startTime: processInfo?.startTime,
        lastHealthCheck: healthStatus?.lastCheck,
        lastError: processInfo?.lastError || healthStatus?.error,
        metadata: {
          category: config.category,
          autoReload: config.autoReload,
          hotReload: config.hotReload,
        },
      });
    }

    return statuses;
  }

  /**
   * List available projects
   */
  async list(): Promise<ProjectConfig[]> {
    await this.ensureInitialized();
    return Object.values(this.configManager.getAllProjects());
  }

  /**
   * Get health status
   */
  async health(project?: string): Promise<HealthStatus[]> {
    await this.ensureInitialized();

    if (project) {
      const healthStatus = this.healthChecker.getHealthStatus(project);
      return healthStatus ? [healthStatus] : [];
    }

    return Array.from(this.healthChecker.getAllHealthStatuses().values());
  }

  /**
   * Start multiple servers
   */
  async startMultiple(projects: string[]): Promise<void> {
    await this.ensureInitialized();

    // Start servers in parallel, but respect dependencies
    const startedProjects = new Set<string>();
    const remainingProjects = [...projects];

    while (remainingProjects.length > 0) {
      const batch: string[] = [];

      for (const project of remainingProjects) {
        const config = this.configManager.getProject(project);
        if (!config) continue;

        // Check if all dependencies are started
        const dependenciesMet = !config.dependencies || config.dependencies.every(dep => startedProjects.has(dep));

        if (dependenciesMet) {
          batch.push(project);
        }
      }

      if (batch.length === 0) {
        throw new Error("Circular dependency detected or missing dependencies");
      }

      // Start batch in parallel
      await Promise.all(batch.map(project => this.start(project)));

      // Update tracking
      batch.forEach(project => startedProjects.add(project));
      remainingProjects.splice(0, remainingProjects.length, ...remainingProjects.filter(p => !batch.includes(p)));
    }
  }

  /**
   * Stop all servers
   */
  async stopAll(): Promise<void> {
    await this.ensureInitialized();

    // Stop all health checks
    this.healthChecker.stopAllHealthChecks();

    // Stop all processes
    await this.processManager.killAllProcesses();

    // Release all ports
    const allocatedPorts = this.portManager.getAllocatedPorts();
    for (const port of allocatedPorts.keys()) {
      this.portManager.releasePort(port);
    }
  }

  /**
   * Reload configuration
   */
  async reloadConfig(): Promise<void> {
    await this.configManager.loadConfig();
    this.emitEvent("config_loaded", "system");
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Process manager events
    this.processManager.on("processStarted", ({ project, processInfo }) => {
      this.emitEvent("server_started", project, { processInfo });
    });

    this.processManager.on("processStopped", ({ project, processInfo }) => {
      this.emitEvent("server_stopped", project, { processInfo });
    });

    this.processManager.on("processError", ({ project, error }) => {
      this.emitEvent("server_error", project, { error });
    });

    // Health checker events
    this.healthChecker.on("healthCheckStarted", ({ project }) => {
      this.emitEvent("health_check_started", project);
    });

    this.healthChecker.on("healthCheckCompleted", ({ project, result }) => {
      this.emitEvent("health_check_completed", project, { result });
    });

    this.healthChecker.on("healthCheckFailed", ({ project, error }) => {
      this.emitEvent("health_check_failed", project, { error });
    });
  }

  /**
   * Emit a dev server event
   */
  private emitEvent(type: DevServerEventType, project: string, data?: any): void {
    const event: DevServerEvent = {
      type,
      project,
      timestamp: new Date(),
      data,
    };

    this.emit("event", event);
    this.emit(type, event);
  }

  /**
   * Ensure the manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Get manager statistics
   */
  getStats(): {
    isInitialized: boolean;
    totalProjects: number;
    runningProjects: number;
    processStats: any;
    healthStats: any;
    portStats: any;
  } {
    const allProjects = this.configManager.getAllProjects();
    const processStats = this.processManager.getProcessStats();
    const healthStats = this.healthChecker.getHealthSummary();
    const portStats = this.portManager.getPortUsageStats();

    return {
      isInitialized: this.isInitialized,
      totalProjects: Object.keys(allProjects).length,
      runningProjects: processStats.runningProcesses,
      processStats,
      healthStats,
      portStats,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopAll();
    this.removeAllListeners();
  }
}
