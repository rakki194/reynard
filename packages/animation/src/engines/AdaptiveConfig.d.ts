/**
 * 🦊 Adaptive Animation Configuration
 * Default configuration for adaptive animation engine
 */
import type { AnimationConfig } from "../types";
export interface AdaptiveConfig extends AnimationConfig {
    targetFPS: number;
    qualityLevels: number[];
    adaptationThreshold: number;
}
export declare const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig;
