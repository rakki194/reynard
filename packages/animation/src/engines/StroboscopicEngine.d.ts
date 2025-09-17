/**
 * 🦊 Advanced Stroboscopic Animation Engine
 * Implements cutting-edge stroboscopic effects based on latest research
 * Based on "The Mathematics of Phyllotactic Spirals and Their Animated Perception"
 */
import type { StroboscopicConfig, StroboscopicState } from "../types";
export declare class StroboscopicEngine {
    private config;
    private state;
    private frameHistory;
    private readonly maxFrameHistory;
    constructor(config?: Partial<StroboscopicConfig>);
    /**
     * Calculate stroboscopic effect based on rotation speed and frame rate
     * Implements the mathematical model from the research paper
     */
    calculateStroboscopicEffect(deltaTime: number): StroboscopicState;
    /**
     * Apply stroboscopic transformation to spiral points
     * Implements the morphing effects from the research
     */
    applyStroboscopicTransform(points: Array<{
        x: number;
        y: number;
        radius: number;
        angle: number;
    }>, deltaTime: number): Array<{
        x: number;
        y: number;
        radius: number;
        angle: number;
        stroboscopicIntensity: number;
    }>;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<StroboscopicConfig>): void;
    /**
     * Get current state
     */
    getState(): StroboscopicState;
    /**
     * Calculate optimal rotation speed for stroboscopic effect
     * Based on the research paper's mathematical model
     */
    calculateOptimalRotationSpeed(frameRate?: number): number;
    /**
     * Enable advanced morphing effects based on research
     */
    enableAdvancedMorphing(): void;
    /**
     * Disable morphing effects for performance
     */
    disableAdvancedMorphing(): void;
}
