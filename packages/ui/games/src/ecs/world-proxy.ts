// World proxy - uses Proxy to delegate all method calls

import { World as IWorld } from "./types";
import { WorldInitialization } from "./world-initialization";

/**
 * World proxy - uses Proxy to delegate all method calls to initialization.
 */
export class WorldProxy implements IWorld {
  private init: WorldInitialization;

  constructor() {
    this.init = new WorldInitialization();
  }

  // Create a proxy that delegates all method calls
  private createProxy(): any {
    return new Proxy(this, {
      get(target, prop) {
        // Handle special cases
        if (prop === "init") {
          return target.init;
        }

        // Delegate to appropriate mixin based on method name
        const methodName = String(prop);

        // Entity operations
        if (["spawn", "spawnEmpty", "despawn", "contains", "isAlive", "getEntityCount"].includes(methodName)) {
          return target.init.entityOps[methodName]?.bind(target.init.entityOps);
        }

        // Component operations
        if (["insert", "add", "remove", "get", "getMut", "has", "getComponentCount"].includes(methodName)) {
          return target.init.componentOps[methodName]?.bind(target.init.componentOps);
        }

        // Resource operations
        if (
          ["insertResource", "addResource", "removeResource", "getResource", "getResourceMut", "hasResource"].includes(
            methodName
          )
        ) {
          return target.init.resourceOps[methodName]?.bind(target.init.resourceOps);
        }

        // Query operations
        if (["query", "queryFiltered"].includes(methodName)) {
          if (methodName === "query") {
            return (...args: any[]) => target.init.queryMixin.createQueryBuilder(...args);
          }
          return target.init.queryMixin[methodName]?.bind(target.init.queryMixin);
        }

        // System operations
        if (["addSystem", "removeSystem", "runSystem", "runSchedule"].includes(methodName)) {
          const boundMethod = target.init.systemOps[methodName]?.bind(target.init.systemOps);
          if (methodName === "runSystem" || methodName === "runSchedule") {
            return (...args: any[]) => boundMethod(...args, target);
          }
          return boundMethod;
        }

        // Registry access
        if (["getComponentRegistry", "getResourceRegistry"].includes(methodName)) {
          const registryName = methodName.replace("get", "").replace("Registry", "").toLowerCase() + "Registry";
          return target.init[registryName];
        }

        // Archetype access
        if (methodName === "getArchetype") {
          return target.init.archetypeOps.getArchetype.bind(target.init.archetypeOps);
        }

        // Change detection access
        if (methodName === "getChangeDetection") {
          return target.init.changeDetection;
        }

        // Commands
        if (methodName === "commands") {
          return () => {
            const { CommandsImpl } = require("./commands");
            return new CommandsImpl(target);
          };
        }

        return undefined;
      },
    });
  }

  // Expose the proxy as the main interface
  static create(): IWorld {
    const instance = new WorldProxy();
    return instance.createProxy() as IWorld;
  }
}
