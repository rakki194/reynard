/**
 * Animation State Manager
 * 
 * Advanced state management system that integrates with global animation control.
 * Provides intelligent state management, performance optimizations, and accessibility compliance.
 * 
 * @author Agile-Prime-90 (Reynard Lizard Specialist)
 * @since 1.0.0
 */

import { createSignal, onCleanup } from "solid-js";
import { SmartAnimationCore, SmartAnimationConfig, SmartAnimationState } from "../engines/SmartAnimationCore";
import { AccessibilityComplianceMonitor, AccessibilityCompliance } from "./AccessibilityComplianceMonitor";

export interface AnimationStateConfig {
  /** Whether to integrate with global animation control */
  integrateGlobalControl: boolean;
  /** Whether to enable performance mode optimizations */
  enablePerformanceMode: boolean;
  /** Whether to enable accessibility compliance checks */
  enableAccessibilityChecks: boolean;
  /** Whether to enable immediate completion for disabled animations */
  enableImmediateCompletion: boolean;
  /** Whether to enable state persistence */
  enableStatePersistence: boolean;
  /** Whether to enable logging */
  enableLogging: boolean;
  /** State update debounce delay in milliseconds */
  debounceDelay: number;
}

export interface AnimationState {
  /** Whether animations are globally disabled */
  isGloballyDisabled: boolean;
  /** Whether the animation package is available */
  isPackageAvailable: boolean;
  /** Whether performance mode is active */
  isPerformanceMode: boolean;
  /** Whether accessibility mode is active */
  isAccessibilityMode: boolean;
  /** Whether fallback mode is active */
  isFallbackMode: boolean;
  /** Current engine type */
  engineType: "full" | "fallback" | "no-op";
  /** Whether immediate completion is enabled */
  immediateCompletion: boolean;
  /** Performance metrics */
  performanceMetrics: {
    averageAnimationTime: number;
    totalAnimations: number;
    disabledAnimations: number;
    fallbackAnimations: number;
    noOpAnimations: number;
  };
  /** Accessibility compliance status */
  accessibilityCompliance: AccessibilityCompliance;
  /** State persistence data */
  persistenceData: {
    lastUpdate: number;
    stateHistory: SmartAnimationState[];
    userPreferences: Record<string, unknown>;
  };
}

export interface AnimationStateUpdate {
  /** Type of state update */
  type: "global" | "package" | "performance" | "accessibility" | "engine" | "metrics";
  /** Updated state data */
  data: Partial<AnimationState>;
  /** Timestamp of the update */
  timestamp: number;
  /** Source of the update */
  source: string;
}

/**
 * Animation State Manager
 */
export class AnimationStateManager {
  private config: AnimationStateConfig;
  private smartAnimationCore: SmartAnimationCore;
  private accessibilityMonitor: AccessibilityComplianceMonitor | null = null;
  private state = createSignal<AnimationState>({
    isGloballyDisabled: false,
    isPackageAvailable: false,
    isPerformanceMode: false,
    isAccessibilityMode: false,
    isFallbackMode: false,
    engineType: "no-op",
    immediateCompletion: false,
    performanceMetrics: {
      averageAnimationTime: 0,
      totalAnimations: 0,
      disabledAnimations: 0,
      fallbackAnimations: 0,
      noOpAnimations: 0,
    },
    accessibilityCompliance: {
      respectsReducedMotion: false,
      respectsHighContrast: false,
      respectsReducedData: false,
      complianceScore: 0,
    },
    persistenceData: {
      lastUpdate: Date.now(),
      stateHistory: [],
      userPreferences: {},
    },
  });

  private stateUpdateQueue: AnimationStateUpdate[] = [];
  private debounceTimeout: NodeJS.Timeout | null = null;
  private globalControlIntegration: unknown = null;

  constructor(
    smartAnimationCore: SmartAnimationCore,
    config: Partial<AnimationStateConfig> = {}
  ) {
    this.smartAnimationCore = smartAnimationCore;
    this.config = {
      integrateGlobalControl: true,
      enablePerformanceMode: true,
      enableAccessibilityChecks: true,
      enableImmediateCompletion: true,
      enableStatePersistence: true,
      enableLogging: false,
      debounceDelay: 100,
      ...config,
    };

    this.initialize();
  }

  /**
   * Initialize the animation state manager
   */
  private async initialize(): Promise<void> {
    if (this.config.enableLogging) {
      console.log("AnimationStateManager: Initializing animation state management");
    }

    // Set up global animation control integration
    if (this.config.integrateGlobalControl) {
      await this.setupGlobalControlIntegration();
    }

    // Set up accessibility compliance monitoring
    if (this.config.enableAccessibilityChecks) {
      this.setupAccessibilityComplianceMonitoring();
    }

    // Set up performance monitoring
    if (this.config.enablePerformanceMode) {
      this.setupPerformanceMonitoring();
    }

    // Set up state persistence
    if (this.config.enableStatePersistence) {
      this.setupStatePersistence();
    }

    // Initial state update
    await this.updateState();
  }

  /**
   * Set up global animation control integration
   */
  private async setupGlobalControlIntegration(): Promise<void> {
    try {
      // Try to import the global animation control system
      const globalControl = await import("reynard-core/composables");
      
      if (globalControl && globalControl.useAnimationControl) {
        this.globalControlIntegration = globalControl.useAnimationControl();
        
        if (this.config.enableLogging) {
          console.log("AnimationStateManager: Global animation control integrated");
        }
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn("AnimationStateManager: Global animation control not available:", error);
      }
    }
  }

  /**
   * Set up accessibility compliance monitoring
   */
  private setupAccessibilityComplianceMonitoring(): void {
    this.accessibilityMonitor = new AccessibilityComplianceMonitor((compliance) => {
      this.queueStateUpdate({
        type: "accessibility",
        data: { accessibilityCompliance: compliance },
        timestamp: Date.now(),
        source: "accessibility-compliance-monitor",
      });
    });
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor performance mode changes
    const performanceObserver = new MutationObserver(() => {
      const isPerformanceMode = document.documentElement.classList.contains("performance-mode");
      const currentState = this.getState();
      
      if (isPerformanceMode !== currentState.isPerformanceMode) {
        this.queueStateUpdate({
          type: "performance",
          data: { isPerformanceMode },
          timestamp: Date.now(),
          source: "performance-mode-class",
        });
      }
    });

    performanceObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Cleanup on destroy
    onCleanup(() => {
      performanceObserver.disconnect();
    });
  }

  /**
   * Set up state persistence
   */
  private setupStatePersistence(): void {
    // Load persisted state
    this.loadPersistedState();

    // Set up periodic state persistence
    const persistenceInterval = setInterval(() => {
      this.persistState();
    }, 30000); // Persist every 30 seconds

    // Cleanup on destroy
    onCleanup(() => {
      clearInterval(persistenceInterval);
    });
  }

  /**
   * Queue a state update with debouncing
   */
  private queueStateUpdate(update: AnimationStateUpdate): void {
    this.stateUpdateQueue.push(update);

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.processStateUpdates();
    }, this.config.debounceDelay);
  }

  /**
   * Process queued state updates
   */
  private async processStateUpdates(): Promise<void> {
    if (this.stateUpdateQueue.length === 0) {
      return;
    }

    const updates = [...this.stateUpdateQueue];
    this.stateUpdateQueue = [];

    // Process updates in order
    for (const update of updates) {
      await this.applyStateUpdate(update);
    }

    // Persist state if enabled
    if (this.config.enableStatePersistence) {
      this.persistState();
    }
  }

  /**
   * Apply a state update
   */
  private async applyStateUpdate(update: AnimationStateUpdate): Promise<void> {
    const [state, setState] = this.state;
    const currentState = state();

    // Apply the update
    const newState = { ...currentState, ...update.data };

    // Add to state history
    if (this.config.enableStatePersistence) {
      newState.persistenceData = {
        ...newState.persistenceData,
        lastUpdate: update.timestamp,
        stateHistory: [
          ...newState.persistenceData.stateHistory.slice(-9), // Keep last 10 states
          {
            isAnimationsDisabled: newState.isGloballyDisabled,
            isAnimationPackageAvailable: newState.isPackageAvailable,
            isPerformanceMode: newState.isPerformanceMode,
            isAccessibilityMode: newState.isAccessibilityMode,
            isFallbackMode: newState.isFallbackMode,
            engineType: newState.engineType,
          },
        ],
      };
    }

    setState(newState);

    // Update smart animation core configuration
    await this.updateSmartAnimationCoreConfig(newState);

    if (this.config.enableLogging) {
      console.log(`AnimationStateManager: State updated (${update.type}):`, update.data);
    }
  }

  /**
   * Update smart animation core configuration
   */
  private async updateSmartAnimationCoreConfig(state: AnimationState): Promise<void> {
    const config: Partial<SmartAnimationConfig> = {
      performanceMode: state.isPerformanceMode,
      respectAccessibility: state.accessibilityCompliance.respectsReducedMotion,
      useFallback: state.isFallbackMode,
      enableLogging: this.config.enableLogging,
    };

    this.smartAnimationCore.updateConfig(config);
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(animationResult: {
    duration: number;
    usedFallback: boolean;
    usedNoOp: boolean;
  }): void {
    const [state, _setState] = this.state;
    const currentState = state();
    const metrics = currentState.performanceMetrics;

    const newMetrics = {
      ...metrics,
      totalAnimations: metrics.totalAnimations + 1,
      averageAnimationTime: (metrics.averageAnimationTime * metrics.totalAnimations + animationResult.duration) / (metrics.totalAnimations + 1),
    };

    if (animationResult.usedNoOp) {
      newMetrics.noOpAnimations += 1;
    } else if (animationResult.usedFallback) {
      newMetrics.fallbackAnimations += 1;
    }

    if (currentState.isGloballyDisabled) {
      newMetrics.disabledAnimations += 1;
    }

    this.queueStateUpdate({
      type: "metrics",
      data: { performanceMetrics: newMetrics },
      timestamp: Date.now(),
      source: "performance-metrics-update",
    });
  }

  /**
   * Get current state
   */
  getState(): AnimationState {
    return this.state[0]();
  }

  /**
   * Get reactive state
   */
  getReactiveState() {
    return this.state;
  }

  /**
   * Update state manually
   */
  async updateState(): Promise<void> {
    const smartState = this.smartAnimationCore.getState();
    
    this.queueStateUpdate({
      type: "global",
      data: {
        isGloballyDisabled: smartState.isAnimationsDisabled,
        isPackageAvailable: smartState.isAnimationPackageAvailable,
        isPerformanceMode: smartState.isPerformanceMode,
        isAccessibilityMode: smartState.isAccessibilityMode,
        isFallbackMode: smartState.isFallbackMode,
        engineType: smartState.engineType,
        immediateCompletion: this.config.enableImmediateCompletion && smartState.isAnimationsDisabled,
      },
      timestamp: Date.now(),
      source: "manual-state-update",
    });
  }

  /**
   * Persist state to localStorage
   */
  private persistState(): void {
    if (!this.config.enableStatePersistence) {
      return;
    }

    try {
      const state = this.getState();
      const persistenceData = {
        ...state.persistenceData,
        lastUpdate: Date.now(),
      };

      localStorage.setItem("reynard-animation-state", JSON.stringify(persistenceData));
      
      if (this.config.enableLogging) {
        console.log("AnimationStateManager: State persisted");
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn("AnimationStateManager: Failed to persist state:", error);
      }
    }
  }

  /**
   * Load persisted state from localStorage
   */
  private loadPersistedState(): void {
    if (!this.config.enableStatePersistence) {
      return;
    }

    try {
      const persistedData = localStorage.getItem("reynard-animation-state");
      if (persistedData) {
        const data = JSON.parse(persistedData);
        
        this.queueStateUpdate({
          type: "global",
          data: {
            persistenceData: data,
          },
          timestamp: Date.now(),
          source: "persisted-state-load",
        });

        if (this.config.enableLogging) {
          console.log("AnimationStateManager: Persisted state loaded");
        }
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn("AnimationStateManager: Failed to load persisted state:", error);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnimationStateConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enableLogging) {
      console.log("AnimationStateManager: Configuration updated", this.config);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Clear debounce timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Cleanup accessibility monitor
    if (this.accessibilityMonitor) {
      this.accessibilityMonitor.cleanup();
    }

    // Persist final state
    if (this.config.enableStatePersistence) {
      this.persistState();
    }

    if (this.config.enableLogging) {
      console.log("AnimationStateManager: Cleaned up");
    }
  }
}

// Global animation state manager instance
let globalAnimationStateManager: AnimationStateManager | null = null;

/**
 * Get or create the global animation state manager
 */
export function getAnimationStateManager(
  smartAnimationCore: SmartAnimationCore,
  config?: Partial<AnimationStateConfig>
): AnimationStateManager {
  if (!globalAnimationStateManager) {
    globalAnimationStateManager = new AnimationStateManager(smartAnimationCore, config);
  }
  return globalAnimationStateManager;
}

/**
 * Create a new animation state manager instance
 */
export function createAnimationStateManager(
  smartAnimationCore: SmartAnimationCore,
  config?: Partial<AnimationStateConfig>
): AnimationStateManager {
  return new AnimationStateManager(smartAnimationCore, config);
}

/**
 * Cleanup the global animation state manager
 */
export function cleanupAnimationStateManager(): void {
  if (globalAnimationStateManager) {
    globalAnimationStateManager.cleanup();
    globalAnimationStateManager = null;
  }
}
