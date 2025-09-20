// Common component hook implementations

import { Entity, Component, ComponentType, World } from "./types";
import { ComponentHook } from "./component-hook-types";

/**
 * Common component hook implementations.
 */
export const CommonHooks = {
  /**
   * Logs when a component is added.
   */
  logOnAdd<T extends Component>(componentType: ComponentType<T>): ComponentHook {
    return (_world, entity, component) => {
      console.log(`Component ${componentType.name} added to entity ${entity.index}v${entity.generation}:`, component);
    };
  },

  /**
   * Logs when a component is removed.
   */
  logOnRemove<T extends Component>(componentType: ComponentType<T>): ComponentHook {
    return (_world, entity, component) => {
      console.log(
        `Component ${componentType.name} removed from entity ${entity.index}v${entity.generation}:`,
        component
      );
    };
  },

  /**
   * Validates component data on add.
   */
  validateOnAdd<T extends Component>(
    componentType: ComponentType<T>,
    validator: (component: T) => boolean
  ): ComponentHook {
    return (_world, entity, component) => {
      if (!validator(component as T)) {
        console.warn(`Invalid component ${componentType.name} added to entity ${entity.index}v${entity.generation}`);
      }
    };
  },

  /**
   * Triggers an event when a component is added.
   */
  eventOnAdd<T extends Component>(eventType: string): ComponentHook {
    return (_world, entity, component) => {
      // This would trigger an event in the event system
      console.log(
        `Event ${eventType} triggered for component added to entity ${entity.index}v${entity.generation}:`,
        component
      );
    };
  },

  /**
   * Updates a counter when a component is added.
   */
  counterOnAdd<T extends Component>(counterResource: any): ComponentHook {
    return (world, _entity, _component) => {
      const counter = world.getResource(counterResource) as any;
      if (counter) {
        counter.count++;
      }
    };
  },

  /**
   * Updates a counter when a component is removed.
   */
  counterOnRemove<T extends Component>(counterResource: any): ComponentHook {
    return (world, _entity, _component) => {
      const counter = world.getResource(counterResource) as any;
      if (counter) {
        counter.count--;
      }
    };
  },

  /**
   * Cleans up resources when a component is removed.
   */
  cleanupOnRemove<T extends Component>(cleanup: (component: T) => void): ComponentHook {
    return (_world, _entity, component) => {
      cleanup(component as T);
    };
  },

  /**
   * Initializes component state on add.
   */
  initializeOnAdd<T extends Component>(initializer: (component: T) => void): ComponentHook {
    return (_world, _entity, component) => {
      initializer(component as T);
    };
  },
};
