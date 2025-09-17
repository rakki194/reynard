/**
 * @fileoverview Main types export for the Reynard ECS system.
 *
 * This module re-exports all type definitions from the modular type files,
 * providing a single entry point for all ECS types.
 *
 * @example
 * ```typescript
 * import { Entity, Component, Resource, World, SystemFunction } from './types';
 *
 * class Position implements Component {
 *   readonly __component = true;
 *   constructor(public x: number, public y: number) {}
 * }
 *
 * const movementSystem: SystemFunction = (world: World) => {
 *   const query = world.query(Position, Velocity);
 *   // System logic here
 * };
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
export * from "./core";
export * from "./storage";
export * from "./query";
export * from "./system";
export * from "./commands";
export * from "./events";
export * from "./change-detection";
export * from "./bundles";
export * from "./parameters";
export * from "./world";
