/**
 * 🦊 Adaptive Callbacks
 * Creates adaptive callbacks for the animation engine
 */
import type { AnimationCallbacks } from "../types";
import type { QualityManager } from "./QualityManager";
export declare function createAdaptiveCallbacks(callbacks: AnimationCallbacks, qualityManager: QualityManager, engine: any): AnimationCallbacks;
