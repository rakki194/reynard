/**
 * Feature Manager
 *
 * Main feature manager implementation.
 */

import type {
  FeatureStatus,
  FeatureConfig,
  FeatureManager as IFeatureManager,
} from "./types.js";
import { createFeatureManagerCore, FeatureManagerCore } from "./FeatureManagerCore.js";
import { getFeatureStatus, setFeatureStatus, getAllFeatureStatuses, refreshFeatureStatuses } from "./FeatureManagerStatus.js";
import { getFeatureConfig, setFeatureConfig, getAllFeatureConfigs } from "./FeatureManagerConfig.js";

/**
 * Feature manager implementation
 */
export class FeatureManager implements IFeatureManager {
  private core: FeatureManagerCore;

  constructor(config: FeatureConfig) {
    this.core = createFeatureManagerCore(config);
    this.startRefreshTimer();
  }

  /**
   * Get feature status
   */
  getFeatureStatus(featureId: string): FeatureStatus {
    return getFeatureStatus(this.core, featureId);
  }

  /**
   * Set feature status
   */
  setFeatureStatus(featureId: string, status: FeatureStatus): void {
    setFeatureStatus(this.core, featureId, status);
  }

  /**
   * Get all feature statuses
   */
  getAllFeatureStatuses(): Record<string, FeatureStatus> {
    return getAllFeatureStatuses(this.core);
  }

  /**
   * Get feature config
   */
  getFeatureConfig(featureId: string): Record<string, unknown> {
    return getFeatureConfig(this.core, featureId);
  }

  /**
   * Set feature config
   */
  setFeatureConfig(featureId: string, config: Record<string, unknown>): void {
    setFeatureConfig(this.core, featureId, config);
  }

  /**
   * Get all feature configs
   */
  getAllFeatureConfigs(): Record<string, Record<string, unknown>> {
    return getAllFeatureConfigs(this.core);
  }

  /**
   * Refresh feature statuses
   */
  refreshFeatureStatuses(): void {
    refreshFeatureStatuses(this.core);
  }

  /**
   * Start refresh timer
   */
  private startRefreshTimer(): void {
    if (this.core.config.refreshInterval) {
      this.core.refreshTimer = setInterval(() => {
        this.refreshFeatureStatuses();
      }, this.core.config.refreshInterval);
    }
  }

  /**
   * Stop refresh timer
   */
  private stopRefreshTimer(): void {
    if (this.core.refreshTimer) {
      clearInterval(this.core.refreshTimer);
      this.core.refreshTimer = undefined;
    }
  }

  /**
   * Cleanup
   */
  onCleanup(): void {
    this.stopRefreshTimer();
  }
}