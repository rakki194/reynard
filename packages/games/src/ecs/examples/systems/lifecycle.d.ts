import { World } from "../../types";
/**
 * Lifetime system - removes entities when their lifetime expires.
 */
export declare function lifetimeSystem(world: World): void;
/**
 * Damage system - applies damage to entities and removes them if health reaches zero.
 */
export declare function damageSystem(world: World): void;
