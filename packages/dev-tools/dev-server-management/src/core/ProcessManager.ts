/**
 * 🦊 Dev Server Management Process Manager
 *
 * Cross-platform process management leveraging existing Reynard patterns.
 * Integrates with service-manager for consistent process lifecycle management.
 */

import { spawn, ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { resolve } from "node:path";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { ProcessInfo, ProcessOptions, ServerStatus, ProjectConfig } from "../types/index.js";
import { ProcessStartError } from "../types/index.js";

// ============================================================================
// Process Manager Class
// ============================================================================

export class ProcessManager extends EventEmitter {
  private processes = new Map<string, ProcessInfo>();
  private processOptions = new Map<string, ProcessOptions>();

  constructor() {
    super();
    this.setupEventHandlers();
  }

  /**
   * Start a process for a project
   */
  async startProcess(project: string, config: ProjectConfig, options: ProcessOptions): Promise<ProcessInfo> {
    if (this.processes.has(project)) {
      throw new Error(`Process for project '${project}' is already running`);
    }

    try {
      const processInfo = await this.createProcess(project, config, options);
      this.processes.set(project, processInfo);
      this.processOptions.set(project, options);

      this.emit("processStarted", { project, processInfo });
      return processInfo;
    } catch (error) {
      throw new ProcessStartError(project, options.command, error as Error);
    }
  }

  /**
   * Stop a process
   */
  async stopProcess(project: string, signal: NodeJS.Signals = "SIGTERM"): Promise<void> {
    const processInfo = this.processes.get(project);
    if (!processInfo) {
      throw new Error(`No process found for project '${project}'`);
    }

    try {
      await this.terminateProcess(processInfo, signal);
      this.processes.delete(project);
      this.processOptions.delete(project);

      this.emit("processStopped", { project, processInfo });
    } catch (error) {
      this.emit("processError", { project, error });
      throw error;
    }
  }

  /**
   * Restart a process
   */
  async restartProcess(project: string): Promise<ProcessInfo> {
    const options = this.processOptions.get(project);
    if (!options) {
      throw new Error(`No process options found for project '${project}'`);
    }

    // Stop the current process
    await this.stopProcess(project);

    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start a new process (we'll need the config, but for now we'll use defaults)
    const config: ProjectConfig = {
      name: project,
      port: 3000,
      description: "",
      category: "package",
      autoReload: true,
      hotReload: true,
    };

    return this.startProcess(project, config, options);
  }

  /**
   * Get process information
   */
  getProcess(project: string): ProcessInfo | undefined {
    return this.processes.get(project);
  }

  /**
   * Get all processes
   */
  getAllProcesses(): Map<string, ProcessInfo> {
    return new Map(this.processes);
  }

  /**
   * Check if a process is running
   */
  isProcessRunning(project: string): boolean {
    const processInfo = this.processes.get(project);
    return processInfo ? processInfo.status === "running" : false;
  }

  /**
   * Get process status
   */
  getProcessStatus(project: string): ServerStatus | undefined {
    const processInfo = this.processes.get(project);
    return processInfo?.status;
  }

  /**
   * Kill all processes
   */
  async killAllProcesses(signal: NodeJS.Signals = "SIGTERM"): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const project of this.processes.keys()) {
      promises.push(this.stopProcess(project, signal));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Create a new process
   */
  private async createProcess(project: string, config: ProjectConfig, options: ProcessOptions): Promise<ProcessInfo> {
    const cwd = options.cwd || config.cwd || process.cwd();
    const env: Record<string, string> = {};

    // Add process.env, filtering out undefined values
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }

    // Add options.env and config.env
    if (options.env) {
      Object.assign(env, options.env);
    }
    if (config.env) {
      Object.assign(env, config.env);
    }

    // Set PORT environment variable
    env.PORT = config.port.toString();

    // Determine command and args
    const command = options.command || config.command || "pnpm";
    const args = options.args || config.args || ["run", "dev"];

    // Prepare stdio configuration
    let stdioConfig: any;
    if (options.detached) {
      // For detached processes, redirect stdio to files
      const logDir = join(cwd, ".dev-server-logs");

      // Ensure log directory exists
      try {
        await fs.mkdir(logDir, { recursive: true });
      } catch (error) {
        // Directory might already exist, ignore error
      }

      const outFile = join(logDir, `${project}-out.log`);
      const errFile = join(logDir, `${project}-err.log`);

      const out = await fs.open(outFile, "a");
      const err = await fs.open(errFile, "a");

      stdioConfig = ["ignore", out.fd, err.fd];
    } else {
      stdioConfig = options.inheritStdio ? "inherit" : "pipe";
    }

    // Spawn the process
    const childProcess = spawn(command, args, {
      cwd,
      env,
      stdio: stdioConfig,
      detached: options.detached || false,
    });

    // If detached, unref the process to allow parent to exit
    if (options.detached) {
      childProcess.unref();
    }

    // Create process info
    const processInfo: ProcessInfo = {
      pid: childProcess.pid!,
      project,
      status: "starting",
      startTime: new Date(),
      command: `${command} ${args.join(" ")}`,
      cwd,
      env,
      streams: {
        stdout: childProcess.stdout,
        stderr: childProcess.stderr,
      },
    };

    // Set up process event handlers
    this.setupProcessEventHandlers(childProcess, processInfo);

    // Wait for process to start (skip for detached processes)
    if (!options.detached) {
      await this.waitForProcessStart(childProcess, options.timeout);
    }

    return processInfo;
  }

  /**
   * Set up process event handlers
   */
  private setupProcessEventHandlers(childProcess: ChildProcess, processInfo: ProcessInfo): void {
    childProcess.on("spawn", () => {
      processInfo.status = "running";
      this.emit("processSpawned", { project: processInfo.project, processInfo });
    });

    childProcess.on("error", error => {
      processInfo.status = "error";
      processInfo.lastError = error.message;
      this.emit("processError", { project: processInfo.project, error, processInfo });
    });

    childProcess.on("exit", (code, signal) => {
      processInfo.status = "stopped";
      processInfo.exitCode = code || undefined;
      processInfo.exitSignal = signal || undefined;
      this.emit("processExit", { project: processInfo.project, code, signal, processInfo });
    });

    // Handle stdout
    if (childProcess.stdout) {
      childProcess.stdout.on("data", data => {
        this.emit("processOutput", {
          project: processInfo.project,
          stream: "stdout",
          data: data.toString(),
          processInfo,
        });
      });
    }

    // Handle stderr
    if (childProcess.stderr) {
      childProcess.stderr.on("data", data => {
        this.emit("processOutput", {
          project: processInfo.project,
          stream: "stderr",
          data: data.toString(),
          processInfo,
        });
      });
    }
  }

  /**
   * Wait for process to start
   */
  private async waitForProcessStart(childProcess: ChildProcess, timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutMs = timeout || 30000; // Default 30 seconds

      const timeoutId = setTimeout(() => {
        reject(new Error(`Process failed to start within ${timeoutMs}ms`));
      }, timeoutMs);

      childProcess.on("spawn", () => {
        clearTimeout(timeoutId);
        resolve();
      });

      childProcess.on("error", error => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  /**
   * Terminate a process
   */
  private async terminateProcess(processInfo: ProcessInfo, signal: NodeJS.Signals): Promise<void> {
    return new Promise((resolve, reject) => {
      const childProcess = processInfo.streams.stdout as any; // This is a hack, we need to store the actual process

      if (!childProcess || !childProcess.kill) {
        resolve();
        return;
      }

      childProcess.kill(signal);

      const timeout = setTimeout(() => {
        // Force kill if graceful termination fails
        childProcess.kill("SIGKILL");
        reject(new Error(`Process ${processInfo.project} did not terminate gracefully`));
      }, 10000); // 10 second timeout

      childProcess.on("exit", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    // Handle uncaught exceptions
    process.on("uncaughtException", error => {
      this.emit("uncaughtException", error);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (reason, promise) => {
      this.emit("unhandledRejection", { reason, promise });
    });

    // Handle process exit
    process.on("exit", () => {
      this.killAllProcesses("SIGTERM");
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      this.killAllProcesses("SIGINT");
      process.exit(0);
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
      this.killAllProcesses("SIGTERM");
      process.exit(0);
    });
  }

  /**
   * Get process statistics
   */
  getProcessStats(): {
    totalProcesses: number;
    runningProcesses: number;
    stoppedProcesses: number;
    errorProcesses: number;
    processesByStatus: Record<ServerStatus, number>;
  } {
    const processesByStatus: Record<ServerStatus, number> = {
      stopped: 0,
      starting: 0,
      running: 0,
      stopping: 0,
      error: 0,
      health_check_failed: 0,
    };

    let runningProcesses = 0;
    let stoppedProcesses = 0;
    let errorProcesses = 0;

    for (const processInfo of this.processes.values()) {
      processesByStatus[processInfo.status]++;

      switch (processInfo.status) {
        case "running":
          runningProcesses++;
          break;
        case "stopped":
          stoppedProcesses++;
          break;
        case "error":
        case "health_check_failed":
          errorProcesses++;
          break;
      }
    }

    return {
      totalProcesses: this.processes.size,
      runningProcesses,
      stoppedProcesses,
      errorProcesses,
      processesByStatus,
    };
  }

  /**
   * Get process output history
   */
  getProcessOutput(
    project: string,
    limit: number = 100
  ): Array<{
    timestamp: Date;
    stream: "stdout" | "stderr";
    data: string;
  }> {
    // This would need to be implemented with output buffering
    // For now, return empty array
    return [];
  }

  /**
   * Clear process output history
   */
  clearProcessOutput(project: string): void {
    // This would need to be implemented with output buffering
    // For now, do nothing
  }

  /**
   * Get process resource usage
   */
  async getProcessResourceUsage(project: string): Promise<{
    cpu: number;
    memory: number;
    uptime: number;
  } | null> {
    const processInfo = this.processes.get(project);
    if (!processInfo) {
      return null;
    }

    try {
      // This would need platform-specific implementation
      // For now, return mock data
      return {
        cpu: 0,
        memory: 0,
        uptime: Date.now() - processInfo.startTime.getTime(),
      };
    } catch (error) {
      return null;
    }
  }
}
