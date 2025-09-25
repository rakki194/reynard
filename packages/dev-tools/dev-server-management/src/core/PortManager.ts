/**
 * 🦊 Dev Server Management Port Manager
 *
 * Intelligent port management with conflict detection and resolution.
 * Leverages existing Reynard patterns for consistent behavior.
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { PortInfo, PortAllocation, ProjectCategory, PortRange } from "../types/index.js";
import { PortConflictError } from "../types/index.js";

const execAsync = promisify(exec);

// ============================================================================
// Port Manager Class
// ============================================================================

export class PortManager {
  private allocatedPorts = new Map<number, string>(); // port -> project name
  private portRanges = new Map<ProjectCategory, PortRange>();

  constructor() {
    this.initializeDefaultRanges();
  }

  /**
   * Initialize default port ranges
   */
  private initializeDefaultRanges(): void {
    this.portRanges.set("package", { start: 3000, end: 3009 });
    this.portRanges.set("example", { start: 3010, end: 3019 });
    this.portRanges.set("backend", { start: 8000, end: 8009 });
    this.portRanges.set("e2e", { start: 3020, end: 3029 });
    this.portRanges.set("template", { start: 3030, end: 3039 });
  }

  /**
   * Set port range for a category
   */
  setPortRange(category: ProjectCategory, range: PortRange): void {
    // Validate port range
    if (range.start < 1 || range.start > 65535) {
      throw new Error(`Invalid start port: ${range.start}. Must be between 1 and 65535.`);
    }
    if (range.end < 1 || range.end > 65535) {
      throw new Error(`Invalid end port: ${range.end}. Must be between 1 and 65535.`);
    }
    if (range.end < range.start) {
      throw new Error(
        `Invalid port range: end port ${range.end} must be greater than or equal to start port ${range.start}.`
      );
    }

    this.portRanges.set(category, range);
  }

  /**
   * Get port range for a category
   */
  getPortRange(category: ProjectCategory): PortRange | undefined {
    return this.portRanges.get(category);
  }

  /**
   * Allocate a port for a project
   */
  async allocatePort(project: string, preferredPort: number, category: ProjectCategory): Promise<PortAllocation> {
    // Check if preferred port is available
    if (await this.isPortAvailable(preferredPort)) {
      this.allocatedPorts.set(preferredPort, project);
      return {
        requested: preferredPort,
        allocated: preferredPort,
        wasAvailable: true,
      };
    }

    // Find alternative port in range
    const range = this.getPortRange(category);
    if (!range) {
      throw new Error(`No port range configured for category: ${category}`);
    }

    const alternativePort = await this.findAvailablePortInRange(range, category);
    if (alternativePort === null) {
      throw new Error(`No available ports in range ${range.start}-${range.end} for category: ${category}`);
    }

    this.allocatedPorts.set(alternativePort, project);
    return {
      requested: preferredPort,
      allocated: alternativePort,
      wasAvailable: false,
      alternativeRange: range,
    };
  }

  /**
   * Release a port
   */
  releasePort(port: number): boolean {
    return this.allocatedPorts.delete(port);
  }

  /**
   * Release all ports for a project
   */
  releaseProjectPorts(project: string): number[] {
    const releasedPorts: number[] = [];
    for (const [port, projectName] of this.allocatedPorts.entries()) {
      if (projectName === project) {
        this.allocatedPorts.delete(port);
        releasedPorts.push(port);
      }
    }
    return releasedPorts;
  }

  /**
   * Get port information
   */
  async getPortInfo(port: number): Promise<PortInfo> {
    const inUse = await this.isPortInUse(port);
    const project = this.allocatedPorts.get(port);

    let process: PortInfo["process"];
    if (inUse) {
      try {
        const processInfo = await this.getProcessUsingPort(port);
        process = processInfo;
      } catch (error) {
        // Port is in use but we can't get process info
        process = undefined;
      }
    }

    return {
      port,
      inUse,
      process,
      project,
      allocatedAt: project ? new Date() : undefined,
    };
  }

  /**
   * Get all allocated ports
   */
  getAllocatedPorts(): Map<number, string> {
    return new Map(this.allocatedPorts);
  }

  /**
   * Check if a port is available
   */
  async isPortAvailable(port: number): Promise<boolean> {
    // Check if we've allocated it
    if (this.allocatedPorts.has(port)) {
      return false;
    }

    // Check if it's in use by system
    return !(await this.isPortInUse(port));
  }

  /**
   * Check if a port is in use by the system
   */
  async isPortInUse(port: number): Promise<boolean> {
    try {
      // Use lsof to check if port is in use
      const { stdout } = await execAsync(`lsof -ti :${port}`);
      return stdout.trim().length > 0;
    } catch (error) {
      // lsof returns non-zero exit code if port is not in use
      return false;
    }
  }

  /**
   * Find an available port in a range
   */
  async findAvailablePortInRange(range: PortRange, category: ProjectCategory): Promise<number | null> {
    for (let port = range.start; port <= range.end; port++) {
      // Skip reserved ports
      if (range.reserved?.includes(port)) {
        continue;
      }

      // Check if port is available
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    return null;
  }

  /**
   * Get process information for a port
   */
  async getProcessUsingPort(port: number): Promise<PortInfo["process"]> {
    try {
      const { stdout } = await execAsync(`lsof -ti :${port} -c`);
      const lines = stdout.trim().split("\n");

      if (lines.length === 0) {
        return undefined;
      }

      // Parse lsof output
      const pid = parseInt(lines[0].trim());
      if (isNaN(pid)) {
        return undefined;
      }

      // Get process name and command
      const { stdout: psOutput } = await execAsync(`ps -p ${pid} -o comm=,args=`);
      const [name, ...args] = psOutput.trim().split(" ");
      const command = args.join(" ");

      return {
        pid,
        name: name || "unknown",
        command: command || "unknown",
      };
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Validate port range
   */
  validatePortRange(range: PortRange): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (range.start < 1 || range.start > 65535) {
      errors.push(`Port range start must be between 1 and 65535, got ${range.start}`);
    }

    if (range.end < 1 || range.end > 65535) {
      errors.push(`Port range end must be between 1 and 65535, got ${range.end}`);
    }

    if (range.start > range.end) {
      errors.push(`Port range start (${range.start}) cannot be greater than end (${range.end})`);
    }

    if (range.reserved) {
      for (const port of range.reserved) {
        if (port < range.start || port > range.end) {
          errors.push(`Reserved port ${port} is outside range ${range.start}-${range.end}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get port usage statistics
   */
  getPortUsageStats(): {
    totalAllocated: number;
    allocatedByCategory: Record<ProjectCategory, number>;
    availableByCategory: Record<ProjectCategory, number>;
  } {
    const allocatedByCategory: Record<ProjectCategory, number> = {
      package: 0,
      example: 0,
      backend: 0,
      e2e: 0,
      template: 0,
    };

    const availableByCategory: Record<ProjectCategory, number> = {
      package: 0,
      example: 0,
      backend: 0,
      e2e: 0,
      template: 0,
    };

    // Count allocated ports by category
    for (const [port, project] of this.allocatedPorts.entries()) {
      const category = this.getCategoryForPort(port);
      if (category) {
        allocatedByCategory[category]++;
      }
    }

    // Count available ports by category
    for (const [category, range] of this.portRanges.entries()) {
      const totalPorts = range.end - range.start + 1;
      const reservedPorts = range.reserved?.length || 0;
      const allocatedPorts = allocatedByCategory[category];
      availableByCategory[category] = totalPorts - reservedPorts - allocatedPorts;
    }

    return {
      totalAllocated: this.allocatedPorts.size,
      allocatedByCategory,
      availableByCategory,
    };
  }

  /**
   * Get category for a port
   */
  private getCategoryForPort(port: number): ProjectCategory | null {
    for (const [category, range] of this.portRanges.entries()) {
      if (port >= range.start && port <= range.end) {
        return category;
      }
    }
    return null;
  }

  /**
   * Check for port conflicts
   */
  async checkPortConflicts(): Promise<{
    conflicts: Array<{
      port: number;
      project: string;
      systemProcess?: PortInfo["process"];
    }>;
    warnings: string[];
  }> {
    const conflicts: Array<{
      port: number;
      project: string;
      systemProcess?: PortInfo["process"];
    }> = [];

    const warnings: string[] = [];

    for (const [port, project] of this.allocatedPorts.entries()) {
      const portInfo = await this.getPortInfo(port);

      if (portInfo.inUse && portInfo.process) {
        // Port is in use by system process
        conflicts.push({
          port,
          project,
          systemProcess: portInfo.process,
        });
      }
    }

    // Check for overlapping port ranges
    const ranges = Array.from(this.portRanges.entries());
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const [category1, range1] = ranges[i];
        const [category2, range2] = ranges[j];

        if (this.rangesOverlap(range1, range2)) {
          warnings.push(`Port ranges for ${category1} and ${category2} overlap`);
        }
      }
    }

    return { conflicts, warnings };
  }

  /**
   * Check if two port ranges overlap
   */
  private rangesOverlap(range1: PortRange, range2: PortRange): boolean {
    return range1.start <= range2.end && range2.start <= range1.end;
  }

  /**
   * Reserve a port (mark as unavailable without allocating to a project)
   */
  reservePort(port: number): boolean {
    if (this.allocatedPorts.has(port)) {
      return false;
    }

    // Add to reserved ports for the appropriate category
    const category = this.getCategoryForPort(port);
    if (category) {
      const range = this.portRanges.get(category);
      if (range) {
        if (!range.reserved) {
          range.reserved = [];
        }
        if (!range.reserved.includes(port)) {
          range.reserved.push(port);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Unreserve a port
   */
  unreservePort(port: number): boolean {
    const category = this.getCategoryForPort(port);
    if (category) {
      const range = this.portRanges.get(category);
      if (range?.reserved) {
        const index = range.reserved.indexOf(port);
        if (index !== -1) {
          range.reserved.splice(index, 1);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get all reserved ports
   */
  getAllReservedPorts(): number[] {
    const reserved: number[] = [];
    for (const range of this.portRanges.values()) {
      if (range.reserved) {
        reserved.push(...range.reserved);
      }
    }
    return reserved;
  }
}
