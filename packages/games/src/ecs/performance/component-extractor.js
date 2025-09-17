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
import { Acceleration, Mass, Position, Velocity } from "../examples/components";
/**
 * Type guard to check if an object is a valid component.
 */
function isComponent(obj) {
    return (obj !== null &&
        typeof obj === "object" &&
        "__component" in obj &&
        obj.__component === true);
}
/**
 * Type guard to check if a component is a Position component.
 */
function isPositionComponent(component) {
    return (component instanceof Position ||
        (component.constructor.name === "Position" &&
            "x" in component &&
            "y" in component &&
            typeof component.x === "number" &&
            typeof component.y === "number"));
}
/**
 * Type guard to check if a component is a Velocity component.
 */
function isVelocityComponent(component) {
    return (component instanceof Velocity ||
        (component.constructor.name === "Velocity" &&
            "x" in component &&
            "y" in component &&
            typeof component.x === "number" &&
            typeof component.y === "number"));
}
/**
 * Type guard to check if a component is an Acceleration component.
 */
function isAccelerationComponent(component) {
    return (component instanceof Acceleration ||
        (component.constructor.name === "Acceleration" &&
            "ax" in component &&
            "ay" in component &&
            typeof component.ax === "number" &&
            typeof component.ay === "number"));
}
/**
 * Type guard to check if a component is a Mass component.
 */
function isMassComponent(component) {
    return (component instanceof Mass ||
        (component.constructor.name === "Mass" &&
            "mass" in component &&
            typeof component.mass === "number"));
}
/**
 * Component data extractor for WASM operations.
 *
 * Provides methods to extract specific component data from
 * component arrays for use in WASM SIMD operations.
 */
export class ComponentExtractor {
    /**
     * Extract position data from components.
     */
    extractPosition(components) {
        for (const component of components) {
            if (isComponent(component) && isPositionComponent(component)) {
                return { x: component.x, y: component.y };
            }
        }
        return null;
    }
    /**
     * Extract velocity data from components.
     */
    extractVelocity(components) {
        for (const component of components) {
            if (isComponent(component) && isVelocityComponent(component)) {
                return { x: component.x, y: component.y };
            }
        }
        return null;
    }
    /**
     * Extract acceleration data from components.
     */
    extractAcceleration(components) {
        for (const component of components) {
            if (isComponent(component) && isAccelerationComponent(component)) {
                return { ax: component.ax, ay: component.ay };
            }
        }
        return null;
    }
    /**
     * Extract mass data from components.
     */
    extractMass(components) {
        for (const component of components) {
            if (isComponent(component) && isMassComponent(component)) {
                return { mass: component.mass };
            }
        }
        return null;
    }
    /**
     * Check if an entity has position/velocity components.
     */
    isPositionVelocityEntity(components) {
        let hasPosition = false;
        let hasVelocity = false;
        for (const component of components) {
            if (isComponent(component)) {
                if (isPositionComponent(component)) {
                    hasPosition = true;
                }
                else if (isVelocityComponent(component)) {
                    hasVelocity = true;
                }
            }
        }
        return hasPosition && hasVelocity;
    }
}
