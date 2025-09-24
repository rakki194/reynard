// World implementation - the central ECS container

import { World as IWorld } from "./types";
import { WorldProxy } from "./world-proxy";

// Re-export the main classes for backward compatibility
export { CommandsImpl } from "./commands";
export { WorldProxy as WorldImpl };

/**
 * Creates a new world instance.
 */
export function createWorld(): IWorld {
  return WorldProxy.create();
}
