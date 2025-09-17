/**
 * 🦊 Quality Manager
 * Manages quality levels and adaptation logic for adaptive animation
 */
import type { AdaptiveConfig } from "./AdaptiveConfig";
export interface QualityManager {
    getCurrentQuality: () => number;
    getQualityLevel: () => number;
    adaptQuality: (currentFPS: number) => void;
    reset: () => void;
}
export declare function createQualityManager(config: AdaptiveConfig): QualityManager;
