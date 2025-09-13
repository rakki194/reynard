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
import {
  createFeatureManagerCore,
  FeatureManagerCore,
} from "./FeatureManagerCore.js";
import {
  getFeatureStatus,
  setFeatureStatus,
  getAllFeatureStatuses,
  refreshFeatureStatuses,
} from "./FeatureManagerStatus.js";
import {
  getFeatureConfig,
  setFeatureConfig,
  getAllFeatureConfigs,
} from "./FeatureManagerConfig.js";

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
   * Get registry
   */
  get registry() {
    return this.core.registry;
  }

  /**
   * Check if feature is available
   */
  isFeatureAvailable(featureId: string): boolean {
    const status = this.getFeatureStatus(featureId);
    return status?.available === true;
  }

  /**
   * Check if feature is degraded
   */
  isFeatureDegraded(featureId: string): boolean {
    const status = this.getFeatureStatus(featureId);
    return status?.degraded === true;
  }

  /**
   * Get available features
   */
  getAvailableFeatures() {
    const allFeatures = this.core.registry.getAll();
    const statuses = this.getAllFeatureStatuses();
    return allFeatures.filter(
      (feature) => statuses[feature.id]?.available === true,
    );
  }

  /**
   * Get degraded features
   */
  getDegradedFeatures() {
    const allFeatures = this.core.registry.getAll();
    const statuses = this.getAllFeatureStatuses();
    return allFeatures.filter(
      (feature) => statuses[feature.id]?.degraded === true,
    );
  }

  /**
   * Get features by category
   */
  getFeaturesByCategory(category: string) {
    return this.core.registry.getByCategory(category);
  }

  /**
   * Get features by priority
   */
  getFeaturesByPriority(priority: string) {
    return this.core.registry.getByPriority(priority);
  }

  /**
   * Get unavailable critical features
   */
  getUnavailableCriticalFeatures() {
    const criticalFeatures = this.getFeaturesByPriority("critical");
    const statuses = this.getAllFeatureStatuses();
    return criticalFeatures.filter(
      (feature) => statuses[feature.id]?.available !== true,
    );
  }

  /**
   * Get features dependent on service
   */
  getFeaturesDependentOnService(serviceName: string) {
    const allFeatures = this.core.registry.getAll();
    return allFeatures.filter((feature) =>
      feature.dependencies.some((dep) => dep.services.includes(serviceName)),
    );
  }

  /**
   * Get critical services
   */
  getCriticalServices(): string[] {
    const criticalFeatures = this.getFeaturesByPriority("critical");
    const services = new Set<string>();
    criticalFeatures.forEach((feature) => {
      feature.dependencies.forEach((dep) => {
        if (dep.required !== false) {
          dep.services.forEach((service) => services.add(service));
        }
      });
    });
    return Array.from(services);
  }

  /**
   * Check if critical features are available
   */
  areCriticalFeaturesAvailable(): boolean {
    const unavailableCritical = this.getUnavailableCriticalFeatures();
    return unavailableCritical.length === 0;
  }

  /**
   * Get feature summary
   */
  getFeatureSummary() {
    const allFeatures = this.core.registry.getAll();
    const statuses = this.getAllFeatureStatuses();
    const total = allFeatures.length;
    let available = 0;
    let degraded = 0;
    let unavailable = 0;
    let criticalUnavailable = 0;

    allFeatures.forEach((feature) => {
      const status = statuses[feature.id];
      if (status?.available === true) {
        if (status?.degraded === true) {
          degraded++;
        } else {
          available++;
        }
      } else {
        unavailable++;
        if (feature.priority === "critical") {
          criticalUnavailable++;
        }
      }
    });

    const successRate =
      total > 0 ? ((available + degraded) / total) * 100 : 100;

    return {
      total,
      available,
      degraded,
      unavailable,
      criticalUnavailable,
      successRate,
    };
  }

  /**
   * Update feature statuses (alias for refresh)
   */
  updateFeatureStatuses(): void {
    this.refreshFeatureStatuses();
  }

  /**
   * Configure feature
   */
  configureFeature(featureId: string, config: Record<string, any>): void {
    this.setFeatureConfig(featureId, config);
  }

  /**
   * Get feature statuses signal
   */
  getFeatureStatusesSignal() {
    return this.core.featureStatusesSignal[0];
  }

  /**
   * Cleanup
   */
  onCleanup(): void {
    this.stopRefreshTimer();
  }
}
