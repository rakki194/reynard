/**
 * Database-Backed Quality Gate Manager
 *
 * 🦊 *whiskers twitch with strategic precision* Centralized quality gate management
 * using PostgreSQL instead of JSON files. Integrates with the Reynard backend
 * quality gates service for enterprise-grade quality standards enforcement.
 */

import { EventEmitter } from "events";

export interface QualityGateCondition {
  metric: string;
  operator: "GT" | "LT" | "EQ" | "NE" | "GTE" | "LTE";
  threshold: number | string;
  errorThreshold?: number | string;
  warningThreshold?: number | string;
  description?: string;
}

export interface QualityGate {
  id: string;
  name: string;
  description?: string;
  conditions: QualityGateCondition[];
  enabled: boolean;
  environment: "development" | "staging" | "production" | "all";
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityGateResult {
  gateId: string;
  gateName: string;
  status: "PASSED" | "FAILED" | "WARN";
  conditions: QualityGateConditionResult[];
  overallScore: number;
  passedConditions: number;
  totalConditions: number;
  failedConditions: number;
  warningConditions: number;
  evaluationId?: string;
}

export interface QualityGateConditionResult {
  condition: QualityGateCondition;
  status: "PASSED" | "FAILED" | "WARN";
  actualValue: number | string;
  threshold: number | string;
  message: string;
}

export interface QualityGateConfiguration {
  gates: QualityGate[];
  defaultGate: string;
  environments: {
    development: string;
    staging: string;
    production: string;
  };
}

export class DatabaseQualityGateManager extends EventEmitter {
  private readonly backendUrl: string;
  private readonly apiKey?: string;

  constructor(backendUrl: string = "http://localhost:8000", apiKey?: string) {
    super();
    this.backendUrl = backendUrl;
    this.apiKey = apiKey;
  }

  /**
   * 🦊 Load quality gate configuration from database
   */
  async loadConfiguration(): Promise<void> {
    try {
      const response = await this._makeRequest("GET", "/api/quality-gates");
      if (response.ok) {
        const data = await response.json();
        this.emit("configurationLoaded", data);
      } else {
        console.warn("⚠️ Could not load quality gate configuration from database");
        // Initialize with default gates if none exist
        await this.initializeDefaultGates();
      }
    } catch (error) {
      console.warn("⚠️ Could not connect to quality gates service, using fallback");
      await this.initializeDefaultGates();
    }
  }

  /**
   * 🦦 Initialize default Reynard quality gates
   */
  async initializeDefaultGates(): Promise<void> {
    try {
      const response = await this._makeRequest("POST", "/api/quality-gates/initialize");
      if (response.ok) {
        console.log("✅ Initialized default Reynard quality gates");
        this.emit("defaultGatesInitialized");
      } else {
        console.warn("⚠️ Could not initialize default quality gates");
      }
    } catch (error) {
      console.warn("⚠️ Could not initialize default quality gates:", error);
    }
  }

  /**
   * 🐺 Evaluate quality gates against metrics
   */
  async evaluateQualityGates(
    metrics: Record<string, any>,
    environment: string = "development"
  ): Promise<QualityGateResult[]> {
    try {
      const response = await this._makeRequest("POST", "/api/quality-gates/evaluate", {
        metrics,
        environment,
      });

      if (response.ok) {
        const results = await response.json();
        this.emit("qualityGatesEvaluated", results);
        return results;
      } else {
        throw new Error(`Evaluation failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Quality gate evaluation failed:", error);
      throw error;
    }
  }

  /**
   * 🦊 Add a new quality gate
   */
  async addQualityGate(gate: Omit<QualityGate, "createdAt" | "updatedAt">): Promise<void> {
    try {
      const response = await this._makeRequest("POST", "/api/quality-gates", gate);
      if (response.ok) {
        const newGate = await response.json();
        this.emit("qualityGateAdded", newGate);
      } else {
        throw new Error(`Failed to add quality gate: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to add quality gate:", error);
      throw error;
    }
  }

  /**
   * 🦦 Update an existing quality gate
   */
  async updateQualityGate(gateId: string, updates: Partial<QualityGate>): Promise<void> {
    try {
      const response = await this._makeRequest("PUT", `/api/quality-gates/${gateId}`, updates);
      if (response.ok) {
        const updatedGate = await response.json();
        this.emit("qualityGateUpdated", updatedGate);
      } else {
        throw new Error(`Failed to update quality gate: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to update quality gate:", error);
      throw error;
    }
  }

  /**
   * 🐺 Remove a quality gate
   */
  async removeQualityGate(gateId: string): Promise<void> {
    try {
      const response = await this._makeRequest("DELETE", `/api/quality-gates/${gateId}`);
      if (response.ok) {
        this.emit("qualityGateRemoved", { gateId });
      } else {
        throw new Error(`Failed to remove quality gate: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to remove quality gate:", error);
      throw error;
    }
  }

  /**
   * 🦊 Get all quality gates
   */
  async getQualityGates(): Promise<QualityGate[]> {
    try {
      const response = await this._makeRequest("GET", "/api/quality-gates");
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get quality gates: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to get quality gates:", error);
      return [];
    }
  }

  /**
   * 🦦 Get quality gate by ID
   */
  async getQualityGate(gateId: string): Promise<QualityGate | null> {
    try {
      const response = await this._makeRequest("GET", `/api/quality-gates/${gateId}`);
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error(`Failed to get quality gate: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to get quality gate:", error);
      return null;
    }
  }

  /**
   * 🐺 Get quality gates for environment
   */
  async getQualityGatesForEnvironment(environment: string): Promise<QualityGate[]> {
    try {
      const response = await this._makeRequest("GET", `/api/quality-gates?environment=${environment}`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get quality gates for environment: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to get quality gates for environment:", error);
      return [];
    }
  }

  /**
   * 🦊 Set default quality gate for environment
   */
  async setDefaultQualityGate(environment: string, gateId: string): Promise<void> {
    try {
      const response = await this._makeRequest("PUT", `/api/quality-gates/environments/${environment}`, {
        defaultGateId: gateId,
      });
      if (response.ok) {
        this.emit("defaultQualityGateChanged", { environment, gateId });
      } else {
        throw new Error(`Failed to set default quality gate: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to set default quality gate:", error);
      throw error;
    }
  }

  /**
   * 🦦 Get default quality gate for environment
   */
  async getDefaultQualityGate(environment: string): Promise<QualityGate | null> {
    try {
      const response = await this._makeRequest("GET", `/api/quality-gates/environments/${environment}`);
      if (response.ok) {
        const envConfig = await response.json();
        if (envConfig.defaultGateId) {
          return await this.getQualityGate(envConfig.defaultGateId);
        }
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to get default quality gate:", error);
      return null;
    }
  }

  /**
   * 🐺 Get evaluation history
   */
  async getEvaluationHistory(
    gateId?: string,
    environment?: string,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (gateId) params.append("gateId", gateId);
      if (environment) params.append("environment", environment);
      params.append("limit", limit.toString());

      const response = await this._makeRequest("GET", `/api/quality-gates/evaluations?${params}`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get evaluation history: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to get evaluation history:", error);
      return [];
    }
  }

  /**
   * 🦊 Get evaluation statistics
   */
  async getEvaluationStats(
    gateId?: string,
    environment?: string,
    days: number = 30
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (gateId) params.append("gateId", gateId);
      if (environment) params.append("environment", environment);
      params.append("days", days.toString());

      const response = await this._makeRequest("GET", `/api/quality-gates/stats?${params}`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get evaluation stats: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to get evaluation stats:", error);
      return {
        totalEvaluations: 0,
        passedRate: 0,
        failedRate: 0,
        warningRate: 0,
        averageScore: 0,
      };
    }
  }

  /**
   * 🦦 Create Reynard-specific quality gates
   */
  async createReynardQualityGates(): Promise<void> {
    try {
      const response = await this._makeRequest("POST", "/api/quality-gates/reynard-defaults");
      if (response.ok) {
        console.log("✅ Created Reynard quality gates");
        this.emit("reynardGatesCreated");
      } else {
        throw new Error(`Failed to create Reynard quality gates: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to create Reynard quality gates:", error);
      throw error;
    }
  }

  /**
   * 🐺 Export quality gate configuration
   */
  async exportConfiguration(): Promise<QualityGateConfiguration> {
    try {
      const gates = await this.getQualityGates();
      const environments = {
        development: "reynard-development",
        staging: "reynard-development",
        production: "reynard-production",
      };

      return {
        gates,
        defaultGate: "",
        environments,
      };
    } catch (error) {
      console.error("❌ Failed to export configuration:", error);
      return {
        gates: [],
        defaultGate: "",
        environments: {
          development: "reynard-development",
          staging: "reynard-development",
          production: "reynard-production",
        },
      };
    }
  }

  /**
   * 🦊 Import quality gate configuration
   */
  async importConfiguration(config: QualityGateConfiguration): Promise<void> {
    try {
      const response = await this._makeRequest("POST", "/api/quality-gates/import", config);
      if (response.ok) {
        this.emit("configurationImported", config);
      } else {
        throw new Error(`Failed to import configuration: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Failed to import configuration:", error);
      throw error;
    }
  }

  /**
   * 🦦 Validate quality gate configuration
   */
  async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const gates = await this.getQualityGates();
      const errors: string[] = [];

      // Check for duplicate gate IDs
      const gateIds = gates.map(gate => gate.id);
      const duplicateIds = gateIds.filter((id, index) => gateIds.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate quality gate IDs: ${duplicateIds.join(", ")}`);
      }

      // Validate each gate
      for (const gate of gates) {
        if (!gate.id || !gate.name) {
          errors.push(`Quality gate missing required fields: ${gate.id || "unknown"}`);
        }

        if (gate.conditions.length === 0) {
          errors.push(`Quality gate '${gate.id}' has no conditions`);
        }

        for (const condition of gate.conditions) {
          if (!condition.metric || !condition.operator || condition.threshold === undefined) {
            errors.push(`Invalid condition in gate '${gate.id}': missing required fields`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error("❌ Failed to validate configuration:", error);
      return {
        valid: false,
        errors: [`Validation failed: ${error}`],
      };
    }
  }

  /**
   * 🐺 Make HTTP request to backend
   */
  private async _makeRequest(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<Response> {
    const url = `${this.backendUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetch(url, options);
  }

  /**
   * 🦊 Check backend connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await this._makeRequest("GET", "/api/health");
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * 🦦 Get backend status
   */
  async getBackendStatus(): Promise<any> {
    try {
      const response = await this._makeRequest("GET", "/api/health");
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Backend health check failed: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Backend connectivity failed: ${error}`);
    }
  }
}
