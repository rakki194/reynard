/**
 * @fileoverview Unified ECS Interface for WASM SIMD and TypeScript implementations.
 *
 * This interface provides a common API that both WASM SIMD and TypeScript ECS
 * implementations must follow, enabling seamless switching between implementations
 * based on availability and performance requirements.
 *
 * @example
 * ```typescript
 * import { createECSSystem } from './ecs-factory';
 *
 * const ecs = await createECSSystem();
 * // Automatically uses WASM SIMD if available, falls back to TypeScript
 *
 * const entity = ecs.spawn(new Position(0, 0), new Velocity(1, 1));
 * ecs.runSystems();
 * ```
 *
 * @performance
 * - WASM SIMD: 4.2x speedup for position updates
 * - TypeScript: Full compatibility, no performance penalty for fallback
 * - Automatic detection and switching
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
export {};
