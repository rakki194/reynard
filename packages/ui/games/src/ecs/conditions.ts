// System conditions for conditional execution

import { Component, ComponentType, World } from "./types";

/**
 * A system condition that determines if a system should run.
 */
export interface SystemCondition {
  readonly __condition: true;
  readonly name: string;
  readonly run: (world: World) => boolean;
}

/**
 * Creates a system condition.
 */
export function createCondition(name: string, run: (world: World) => boolean): SystemCondition {
  return {
    __condition: true,
    name,
    run,
  };
}

/**
 * Common system conditions.
 */
export const Conditions = {
  /**
   * Runs the system every N frames.
   */
  everyNFrames(n: number): SystemCondition {
    let frameCount = 0;
    return createCondition(`every_${n}_frames`, () => {
      frameCount++;
      return frameCount % n === 0;
    });
  },

  /**
   * Runs the system when a resource changes.
   */
  resourceChanged<T>(resourceType: any): SystemCondition {
    return createCondition(`resource_changed_${resourceType.name}`, world => {
      // This would check if the resource has changed since last run
      // For now, always return true
      return true;
    });
  },

  /**
   * Runs the system when a resource equals a specific value.
   */
  resourceEquals<T>(resourceType: any, value: T): SystemCondition {
    return createCondition(`resource_equals_${resourceType.name}`, world => {
      const resource = world.getResource(resourceType);
      return resource !== undefined && JSON.stringify(resource) === JSON.stringify(value);
    });
  },

  /**
   * Runs the system when a resource exists.
   */
  resourceExists<T>(resourceType: any): SystemCondition {
    return createCondition(`resource_exists_${resourceType.name}`, world => {
      return world.hasResource(resourceType);
    });
  },

  /**
   * Runs the system when a resource does not exist.
   */
  resourceNotExists<T>(resourceType: any): SystemCondition {
    return createCondition(`resource_not_exists_${resourceType.name}`, world => {
      return !world.hasResource(resourceType);
    });
  },

  /**
   * Runs the system when any entity with specific components exists.
   */
  anyEntityWith<T extends Component[]>(...componentTypes: ComponentType<T[number]>[]): SystemCondition {
    return createCondition(`any_entity_with_${componentTypes.map(ct => ct.name).join("_")}`, world => {
      const query = world.query(...componentTypes);
      let hasResults = false;
      query.forEach(() => {
        hasResults = true;
        return false; // Stop iteration
      });
      return hasResults;
    });
  },

  /**
   * Runs the system when no entities with specific components exist.
   */
  noEntityWith<T extends Component[]>(...componentTypes: ComponentType<T[number]>[]): SystemCondition {
    return createCondition(`no_entity_with_${componentTypes.map(ct => ct.name).join("_")}`, world => {
      const query = world.query(...componentTypes);
      let hasResults = false;
      query.forEach(() => {
        hasResults = true;
        return false; // Stop iteration
      });
      return !hasResults;
    });
  },

  /**
   * Runs the system when a specific number of entities exist.
   */
  entityCountEquals(count: number): SystemCondition {
    return createCondition(`entity_count_equals_${count}`, world => {
      return world.getEntityCount() === count;
    });
  },

  /**
   * Runs the system when entity count is greater than a threshold.
   */
  entityCountGreaterThan(threshold: number): SystemCondition {
    return createCondition(`entity_count_greater_than_${threshold}`, world => {
      return world.getEntityCount() > threshold;
    });
  },

  /**
   * Runs the system when entity count is less than a threshold.
   */
  entityCountLessThan(threshold: number): SystemCondition {
    return createCondition(`entity_count_less_than_${threshold}`, world => {
      return world.getEntityCount() < threshold;
    });
  },

  /**
   * Runs the system when a specific event has been sent.
   */
  eventSent<T>(eventType: string): SystemCondition {
    return createCondition(`event_sent_${eventType}`, world => {
      // This would check if the event has been sent since last run
      // For now, always return true
      return true;
    });
  },

  /**
   * Runs the system when a specific event has not been sent.
   */
  eventNotSent<T>(eventType: string): SystemCondition {
    return createCondition(`event_not_sent_${eventType}`, world => {
      // This would check if the event has not been sent since last run
      // For now, always return true
      return true;
    });
  },

  /**
   * Runs the system when a specific time has passed.
   */
  timePassed(seconds: number): SystemCondition {
    let lastRun = 0;
    return createCondition(`time_passed_${seconds}`, world => {
      const now = Date.now() / 1000;
      if (now - lastRun >= seconds) {
        lastRun = now;
        return true;
      }
      return false;
    });
  },

  /**
   * Runs the system when a specific frame count has passed.
   */
  frameCountPassed(frames: number): SystemCondition {
    let frameCount = 0;
    return createCondition(`frame_count_passed_${frames}`, () => {
      frameCount++;
      return frameCount >= frames;
    });
  },

  /**
   * Runs the system when a random condition is met.
   */
  randomChance(chance: number): SystemCondition {
    return createCondition(`random_chance_${chance}`, () => {
      return Math.random() < chance;
    });
  },

  /**
   * Runs the system when a specific key is pressed.
   */
  keyPressed(key: string): SystemCondition {
    return createCondition(`key_pressed_${key}`, world => {
      // This would check if the key is currently pressed
      // For now, always return false
      return false;
    });
  },

  /**
   * Runs the system when a specific mouse button is pressed.
   */
  mousePressed(button: number): SystemCondition {
    return createCondition(`mouse_pressed_${button}`, world => {
      // This would check if the mouse button is currently pressed
      // For now, always return false
      return false;
    });
  },
};

/**
 * Condition combinators for combining multiple conditions.
 */
export const ConditionCombinators = {
  /**
   * Combines conditions with AND logic.
   */
  and(...conditions: SystemCondition[]): SystemCondition {
    return createCondition(`and_${conditions.map(c => c.name).join("_")}`, world => {
      return conditions.every(condition => condition.run(world));
    });
  },

  /**
   * Combines conditions with OR logic.
   */
  or(...conditions: SystemCondition[]): SystemCondition {
    return createCondition(`or_${conditions.map(c => c.name).join("_")}`, world => {
      return conditions.some(condition => condition.run(world));
    });
  },

  /**
   * Negates a condition.
   */
  not(condition: SystemCondition): SystemCondition {
    return createCondition(`not_${condition.name}`, world => {
      return !condition.run(world);
    });
  },

  /**
   * Combines conditions with XOR logic.
   */
  xor(...conditions: SystemCondition[]): SystemCondition {
    return createCondition(`xor_${conditions.map(c => c.name).join("_")}`, world => {
      const results = conditions.map(condition => condition.run(world));
      return results.filter(Boolean).length === 1;
    });
  },
};
