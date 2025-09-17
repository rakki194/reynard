/**
 * @fileoverview Component Data Extractor for WASM Operations.
 *
 * Provides utilities for extracting and converting component data
 * between TypeScript and WASM formats for SIMD operations.
 *
 * @example
 * ```typescript
 * import { ComponentExtractor } from './component-extractor';
 *
 * const extractor = new ComponentExtractor();
 * const position = extractor.extractPosition(components);
 * const velocity = extractor.extractVelocity(components);
 * ```
 *
 * @performance
 * - Fast component data extraction
 * - Type-safe component access
 * - Optimized for WASM integration
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { Component } from "../types";
/**
 * Component data extractor for WASM operations.
 *
 * Provides methods to extract specific component data from
 * component arrays for use in WASM SIMD operations.
 */
export declare class ComponentExtractor {
    /**
     * Extract position data from components.
     */
    extractPosition(components: Component[]): {
        x: number;
        y: number;
    } | null;
    /**
     * Extract velocity data from components.
     */
    extractVelocity(components: Component[]): {
        x: number;
        y: number;
    } | null;
    /**
     * Extract acceleration data from components.
     */
    extractAcceleration(components: Component[]): {
        ax: number;
        ay: number;
    } | null;
    /**
     * Extract mass data from components.
     */
    extractMass(components: Component[]): {
        mass: number;
    } | null;
    /**
     * Check if an entity has position/velocity components.
     */
    isPositionVelocityEntity(components: Component[]): boolean;
}
