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

import { Component } from '../types';
import { Position, Velocity, Acceleration, Mass } from '../examples/components';

/**
 * Type guard to check if an object is a valid component.
 */
function isComponent(obj: unknown): obj is Component {
  return obj !== null && 
         typeof obj === 'object' && 
         '__component' in obj && 
         (obj as Component).__component === true;
}

/**
 * Type guard to check if a component is a Position component.
 */
function isPositionComponent(component: Component): component is Position {
  return 'x' in component && 'y' in component && 
         typeof (component as Position).x === 'number' && 
         typeof (component as Position).y === 'number';
}

/**
 * Type guard to check if a component is a Velocity component.
 */
function isVelocityComponent(component: Component): component is Velocity {
  return 'x' in component && 'y' in component && 
         typeof (component as Velocity).x === 'number' && 
         typeof (component as Velocity).y === 'number';
}

/**
 * Type guard to check if a component is an Acceleration component.
 */
function isAccelerationComponent(component: Component): component is Acceleration {
  return 'ax' in component && 'ay' in component && 
         typeof (component as Acceleration).ax === 'number' && 
         typeof (component as Acceleration).ay === 'number';
}

/**
 * Type guard to check if a component is a Mass component.
 */
function isMassComponent(component: Component): component is Mass {
  return 'mass' in component && 
         typeof (component as Mass).mass === 'number';
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
  extractPosition(components: Component[]): { x: number; y: number } | null {
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
  extractVelocity(components: Component[]): { x: number; y: number } | null {
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
  extractAcceleration(components: Component[]): { ax: number; ay: number } | null {
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
  extractMass(components: Component[]): { mass: number } | null {
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
  isPositionVelocityEntity(components: Component[]): boolean {
    let hasPosition = false;
    let hasVelocity = false;
    
    for (const component of components) {
      if (isComponent(component)) {
        if (isPositionComponent(component)) {
          hasPosition = true;
        } else if (isVelocityComponent(component)) {
          hasVelocity = true;
        }
      }
    }
    
    return hasPosition && hasVelocity;
  }
}
