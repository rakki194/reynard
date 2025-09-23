/**
 * 🦊 Dev Server Management Health Checker
 *
 * Real-time health monitoring leveraging existing Reynard patterns.
 * Integrates with service-manager for consistent health monitoring.
 */

import { EventEmitter } from "node:events";
// Note: fetch is available globally in Node.js 18+
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type {
  HealthStatus,
  HealthCheckResult,
  HealthCheckConfig,
  ServerHealth,
  ProjectConfig,
} from "../types/index.js";
import { HealthCheckError } from "../types/index.js";

const execAsync = promisify(exec);

// ============================================================================
// Health Checker Class
// ============================================================================

export class HealthChecker extends EventEmitter {
  private healthStatuses = new Map<string, HealthStatus>();
  private healthCheckIntervals = new Map<string, NodeJS.Timeout>();
  private defaultConfig: HealthCheckConfig;

  constructor(defaultConfig: HealthCheckConfig = {}) {
    super();
    this.defaultConfig = {
      timeout: 5000,
      interval: 10000,
      ...defaultConfig,
    };
  }

  /**
   * Check health for a project (alias for performHealthCheck)
   */
  async checkHealth(project: string, config: ProjectConfig): Promise<HealthCheckResult> {
    return this.performHealthCheck(project, config);
  }

  /**
   * Start monitoring a project (alias for startHealthCheck)
   */
  async startMonitoring(project: string, config: ProjectConfig): Promise<void> {
    return this.startHealthCheck(project, config);
  }

  /**
   * Listen for health status changes
   */
  onHealthStatusChange(callback: (project: string, status: HealthStatus) => void): void {
    this.on("healthStatusChange", callback);
  }

  /**
   * Validate health check configuration
   */
  validateHealthCheckConfig(config: HealthCheckConfig): boolean {
    if (!config) return false;
    if (config.timeout && (config.timeout < 1000 || config.timeout > 60000)) return false;
    if (config.interval && (config.interval < 5000 || config.interval > 300000)) return false;
    if (config.type && !["http", "command"].includes(config.type)) return false;
    if (config.type === "http" && !config.path) return false;
    if (config.type === "command" && !config.command) return false;
    return true;
  }

  /**
   * Listen for health check events
   */
  onHealthCheckEvent(callback: (event: string, data: any) => void): void {
    this.on("healthCheckEvent", callback);
  }

  /**
   * Start health checking for a project
   */
  startHealthCheck(project: string, config: ProjectConfig): void {
    if (this.healthCheckIntervals.has(project)) {
      this.stopHealthCheck(project);
    }

    const healthConfig = { ...this.defaultConfig, ...config.healthCheck };

    // Perform initial health check
    this.performHealthCheck(project, config, healthConfig);

    // Set up interval for periodic health checks
    const interval = setInterval(() => {
      this.performHealthCheck(project, config, healthConfig);
    }, healthConfig.interval || 10000);

    this.healthCheckIntervals.set(project, interval);
  }

  /**
   * Stop health checking for a project
   */
  stopHealthCheck(project: string): void {
    const interval = this.healthCheckIntervals.get(project);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(project);
    }

    this.healthStatuses.delete(project);
  }

  /**
   * Stop all health checks
   */
  stopAllHealthChecks(): void {
    for (const project of this.healthCheckIntervals.keys()) {
      this.stopHealthCheck(project);
    }
  }

  /**
   * Perform a health check
   */
  async performHealthCheck(
    project: string,
    config: ProjectConfig,
    healthConfig: HealthCheckConfig
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      this.emit("healthCheckStarted", { project, config });

      let result: HealthCheckResult;

      if (healthConfig.endpoint) {
        result = await this.performHttpHealthCheck(healthConfig);
      } else if (healthConfig.command) {
        result = await this.performCommandHealthCheck(healthConfig);
      } else {
        result = await this.performDefaultHealthCheck(config);
      }

      const duration = Date.now() - startTime;
      result.duration = duration;

      // Update health status
      const healthStatus: HealthStatus = {
        project,
        health: result.health,
        lastCheck: new Date(),
        checkDuration: duration,
        error: result.error,
        metrics: result.response,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
      };

      this.healthStatuses.set(project, healthStatus);

      this.emit("healthCheckCompleted", { project, result, healthStatus });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      const result: HealthCheckResult = {
        success: false,
        health: "unhealthy",
        duration,
        error: errorMessage,
      };

      const healthStatus: HealthStatus = {
        project,
        health: "unhealthy",
        lastCheck: new Date(),
        checkDuration: duration,
        error: errorMessage,
      };

      this.healthStatuses.set(project, healthStatus);

      this.emit("healthCheckFailed", { project, error, healthStatus });

      return result;
    }
  }

  /**
   * Perform HTTP health check
   */
  private async performHttpHealthCheck(healthConfig: HealthCheckConfig): Promise<HealthCheckResult> {
    if (!healthConfig.endpoint) {
      throw new Error("HTTP health check requires an endpoint");
    }

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), healthConfig.timeout || 5000);

      const response = await fetch(healthConfig.endpoint, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "Reynard-Dev-Server-Health-Check",
        },
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const responseText = await response.text();

      // Check if response matches expected response
      let matchesExpected = true;
      if (healthConfig.expectedResponse) {
        if (typeof healthConfig.expectedResponse === "string") {
          matchesExpected = responseText.includes(healthConfig.expectedResponse);
        } else {
          matchesExpected = healthConfig.expectedResponse.test(responseText);
        }
      }

      const isHealthy = response.ok && matchesExpected;

      return {
        success: isHealthy,
        health: isHealthy ? "healthy" : "unhealthy",
        duration: responseTime,
        response: responseText,
        responseTime,
        statusCode: response.status,
        error: isHealthy ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw new HealthCheckError("http", healthConfig.endpoint, error as Error);
    }
  }

  /**
   * Perform command-based health check
   */
  private async performCommandHealthCheck(healthConfig: HealthCheckConfig): Promise<HealthCheckResult> {
    if (!healthConfig.command) {
      throw new Error("Command health check requires a command");
    }

    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(healthConfig.command, {
        timeout: healthConfig.timeout || 5000,
      });

      const duration = Date.now() - startTime;

      // Check if command output matches expected response
      let matchesExpected = true;
      if (healthConfig.expectedResponse) {
        if (typeof healthConfig.expectedResponse === "string") {
          matchesExpected = stdout.includes(healthConfig.expectedResponse);
        } else {
          matchesExpected = healthConfig.expectedResponse.test(stdout);
        }
      }

      const isHealthy = !stderr && matchesExpected;

      return {
        success: isHealthy,
        health: isHealthy ? "healthy" : "unhealthy",
        duration,
        response: { stdout, stderr },
        error: isHealthy ? undefined : stderr || "Command output did not match expected response",
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new HealthCheckError("command", healthConfig.command, error as Error);
    }
  }

  /**
   * Perform default health check (port availability)
   */
  private async performDefaultHealthCheck(config: ProjectConfig): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Simple port check - try to connect to the port
      const isPortOpen = await this.checkPortOpen(config.port);
      const duration = Date.now() - startTime;

      return {
        success: isPortOpen,
        health: isPortOpen ? "healthy" : "unhealthy",
        duration,
        response: { port: config.port, open: isPortOpen },
        error: isPortOpen ? undefined : `Port ${config.port} is not accessible`,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      throw new HealthCheckError("port", config.port.toString(), error as Error);
    }
  }

  /**
   * Check if a port is open
   */
  private async checkPortOpen(port: number): Promise<boolean> {
    return new Promise(resolve => {
      const net = require("node:net");
      const socket = new net.Socket();

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 1000);

      socket.connect(port, "localhost", () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });

      socket.on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  /**
   * Get health status for a project
   */
  getHealthStatus(project: string): HealthStatus | undefined {
    return this.healthStatuses.get(project);
  }

  /**
   * Get all health statuses
   */
  getAllHealthStatuses(): Map<string, HealthStatus> {
    return new Map(this.healthStatuses);
  }

  /**
   * Get health statuses by health level
   */
  getHealthStatusesByLevel(health: ServerHealth): HealthStatus[] {
    return Array.from(this.healthStatuses.values()).filter(status => status.health === health);
  }

  /**
   * Get overall health summary
   */
  getHealthSummary(): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
    lastCheck: Date | null;
  } {
    const statuses = Array.from(this.healthStatuses.values());

    let healthy = 0;
    let degraded = 0;
    let unhealthy = 0;
    let unknown = 0;
    let lastCheck: Date | null = null;

    for (const status of statuses) {
      switch (status.health) {
        case "healthy":
          healthy++;
          break;
        case "degraded":
          degraded++;
          break;
        case "unhealthy":
          unhealthy++;
          break;
        case "unknown":
          unknown++;
          break;
      }

      if (!lastCheck || status.lastCheck > lastCheck) {
        lastCheck = status.lastCheck;
      }
    }

    return {
      total: statuses.length,
      healthy,
      degraded,
      unhealthy,
      unknown,
      lastCheck,
    };
  }

  /**
   * Force a health check for a project
   */
  async forceHealthCheck(project: string, config: ProjectConfig): Promise<HealthCheckResult> {
    const healthConfig = { ...this.defaultConfig, ...config.healthCheck };
    return this.performHealthCheck(project, config, healthConfig);
  }

  /**
   * Update health check configuration
   */
  updateHealthCheckConfig(project: string, config: Partial<HealthCheckConfig>): void {
    const currentStatus = this.healthStatuses.get(project);
    if (currentStatus) {
      // Update the configuration and restart health checking
      // This would require storing the project config, which we don't currently do
      // For now, just emit an event
      this.emit("healthCheckConfigUpdated", { project, config });
    }
  }

  /**
   * Get health check statistics
   */
  getHealthCheckStats(): {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    averageCheckDuration: number;
    lastCheckTime: Date | null;
  } {
    const statuses = Array.from(this.healthStatuses.values());

    let totalChecks = 0;
    let successfulChecks = 0;
    let failedChecks = 0;
    let totalDuration = 0;
    let lastCheckTime: Date | null = null;

    for (const status of statuses) {
      totalChecks++;
      totalDuration += status.checkDuration;

      if (status.health === "healthy") {
        successfulChecks++;
      } else {
        failedChecks++;
      }

      if (!lastCheckTime || status.lastCheck > lastCheckTime) {
        lastCheckTime = status.lastCheck;
      }
    }

    return {
      totalChecks,
      successfulChecks,
      failedChecks,
      averageCheckDuration: totalChecks > 0 ? totalDuration / totalChecks : 0,
      lastCheckTime,
    };
  }
}
