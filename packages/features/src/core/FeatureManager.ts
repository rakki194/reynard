import { createSignal, onCleanup } from 'solid-js';
import type { 
  FeatureDefinition, 
  FeatureStatus, 
  FeatureConfig, 
  FeatureManager as IFeatureManager,
  FeatureRegistry
} from './types';
import { FeatureRegistry as FeatureRegistryImpl } from './FeatureRegistry';

/**
 * Feature manager implementation
 */
export class FeatureManager implements IFeatureManager {
  public registry: FeatureRegistry;
  private config: FeatureConfig;
  private featureStatusesSignal = createSignal<Record<string, FeatureStatus>>({});
  private featureConfigsSignal = createSignal<Record<string, Record<string, any>>>({});
  private refreshTimer: number | undefined;

  constructor(config: FeatureConfig) {
    this.config = config;
    this.registry = new FeatureRegistryImpl();

    // Register features from config
    if (config.features) {
      config.features.forEach(feature => this.registry.register(feature));
    }

    // Initialize feature configurations
    config.features?.forEach(feature => {
      if (feature.defaultConfig) {
        this.configureFeature(feature.id, feature.defaultConfig);
      }
    });

    // Set up auto-refresh if enabled
    if (config.autoRefresh && config.refreshInterval) {
      this.refreshTimer = window.setInterval(() => {
        this.updateFeatureStatuses();
      }, config.refreshInterval);
    }

    // Initial status update
    this.updateFeatureStatuses();

    // Cleanup on destroy
    onCleanup(() => {
      if (this.refreshTimer) {
        window.clearInterval(this.refreshTimer);
      }
    });
  }

  /**
   * Check if a feature is available based on its dependencies
   */
  private checkFeatureAvailability(feature: FeatureDefinition): FeatureStatus {
    const missingServices: string[] = [];
    const degradedServices: string[] = [];
    let available = true;
    let degraded = false;
    let message: string | undefined;
    let healthScore = 100;

    // Check each dependency
    for (const dependency of feature.dependencies) {
      const unavailableServices = dependency.services.filter(serviceName => {
        if (this.config.serviceChecker) {
          return !this.config.serviceChecker(serviceName);
        }
        // Default service checker - assume all services are available
        return false;
      });

      if (unavailableServices.length > 0) {
        if (dependency.required !== false) {
          // Required dependency - feature is unavailable
          missingServices.push(...unavailableServices);
          available = false;
          healthScore = 0;
          message = dependency.message || `Required services unavailable: ${unavailableServices.join(', ')}`;
        } else {
          // Optional dependency - feature is degraded
          degradedServices.push(...unavailableServices);
          degraded = true;
          healthScore = Math.max(0, healthScore - 20);
          if (!message) {
            message = `Some services unavailable: ${unavailableServices.join(', ')}`;
          }
        }
      }
    }

    return {
      id: feature.id,
      name: feature.name,
      available,
      degraded,
      message,
      missingServices,
      degradedServices,
      config: this.getFeatureConfig(feature.id),
      lastUpdated: Date.now(),
      healthScore
    };
  }

  /**
   * Update all feature statuses
   */
  public updateFeatureStatuses(): void {
    const statuses: Record<string, FeatureStatus> = {};
    const features = this.registry.getAll();

    for (const feature of features) {
      const status = this.checkFeatureAvailability(feature);
      statuses[feature.id] = status;

      // Notify status change
      if (this.config.onStatusChange) {
        this.config.onStatusChange(feature.id, status);
      }

      // Notify availability change
      if (this.config.onAvailabilityChange) {
        const previousStatus = this.featureStatusesSignal[0]()[feature.id];
        if (!previousStatus || previousStatus.available !== status.available) {
          this.config.onAvailabilityChange(feature.id, status.available);
        }
      }
    }

    this.featureStatusesSignal[1](statuses);
  }

  /**
   * Get feature status by ID
   */
  public getFeatureStatus(featureId: string): FeatureStatus | null {
    return this.featureStatusesSignal[0]()[featureId] || null;
  }

  /**
   * Check if a feature is available
   */
  public isFeatureAvailable(featureId: string): boolean {
    const status = this.getFeatureStatus(featureId);
    return status?.available ?? false;
  }

  /**
   * Check if a feature is degraded
   */
  public isFeatureDegraded(featureId: string): boolean {
    const status = this.getFeatureStatus(featureId);
    return status?.degraded ?? false;
  }

  /**
   * Get all available features
   */
  public getAvailableFeatures(): FeatureDefinition[] {
    return this.registry.getAll().filter(feature => this.isFeatureAvailable(feature.id));
  }

  /**
   * Get all degraded features
   */
  public getDegradedFeatures(): FeatureDefinition[] {
    return this.registry.getAll().filter(feature => this.isFeatureDegraded(feature.id));
  }

  /**
   * Get features by category
   */
  public getFeaturesByCategory(category: string): FeatureDefinition[] {
    return this.registry.getByCategory(category);
  }

  /**
   * Get features by priority
   */
  public getFeaturesByPriority(priority: string): FeatureDefinition[] {
    return this.registry.getByPriority(priority);
  }

  /**
   * Get unavailable critical features
   */
  public getUnavailableCriticalFeatures(): FeatureDefinition[] {
    return this.registry.getAll().filter(feature => 
      feature.priority === 'critical' && !this.isFeatureAvailable(feature.id)
    );
  }

  /**
   * Get features that depend on a specific service
   */
  public getFeaturesDependentOnService(serviceName: string): FeatureDefinition[] {
    return this.registry.getAll().filter(feature => 
      feature.dependencies.some(dep => dep.services.includes(serviceName))
    );
  }

  /**
   * Get critical services
   */
  public getCriticalServices(): string[] {
    const criticalServices = new Set<string>();

    this.registry.getAll().forEach(feature => {
      if (feature.priority === 'critical') {
        feature.dependencies.forEach(dep => {
          if (dep.required !== false) {
            dep.services.forEach(service => criticalServices.add(service));
          }
        });
      }
    });

    return Array.from(criticalServices);
  }

  /**
   * Check if critical features are available
   */
  public areCriticalFeaturesAvailable(): boolean {
    const criticalFeatures = this.getFeaturesByPriority('critical');
    return criticalFeatures.every(feature => this.isFeatureAvailable(feature.id));
  }

  /**
   * Get feature availability summary
   */
  public getFeatureSummary() {
    const total = this.registry.size;
    const available = this.getAvailableFeatures().length;
    const degraded = this.getDegradedFeatures().length;
    const unavailable = total - available - degraded;
    const criticalUnavailable = this.getUnavailableCriticalFeatures().length;

    return {
      total,
      available,
      degraded,
      unavailable,
      criticalUnavailable,
      successRate: total > 0 ? (available / total) * 100 : 0,
    };
  }

  /**
   * Refresh feature statuses (alias for updateFeatureStatuses)
   */
  public refreshFeatureStatuses(): void {
    this.updateFeatureStatuses();
  }

  /**
   * Configure a feature
   */
  public configureFeature(featureId: string, config: Record<string, any>): void {
    const currentConfigs = this.featureConfigsSignal[0]();
    this.featureConfigsSignal[1]({
      ...currentConfigs,
      [featureId]: {
        ...currentConfigs[featureId],
        ...config
      }
    });

    // Update feature status to reflect new configuration
    this.updateFeatureStatuses();
  }

  /**
   * Get feature configuration
   */
  public getFeatureConfig(featureId: string): Record<string, any> | undefined {
    return this.featureConfigsSignal[0]()[featureId];
  }

  /**
   * Get feature statuses signal
   */
  public getFeatureStatusesSignal() {
    return this.featureStatusesSignal[0];
  }

  /**
   * Get available features signal
   */
  public getAvailableFeaturesSignal() {
    return createSignal(() => this.getAvailableFeatures());
  }

  /**
   * Get degraded features signal
   */
  public getDegradedFeaturesSignal() {
    return createSignal(() => this.getDegradedFeatures());
  }

  /**
   * Get feature summary signal
   */
  public getFeatureSummarySignal() {
    return createSignal(() => this.getFeatureSummary());
  }

  /**
   * Update service checker
   */
  public updateServiceChecker(serviceChecker: (serviceName: string) => boolean): void {
    this.config.serviceChecker = serviceChecker;
    this.updateFeatureStatuses();
  }

}
