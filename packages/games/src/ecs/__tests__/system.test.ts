/**
 * @fileoverview Tests for ECS System scheduling, execution, and dependency management.
 *
 * These tests verify the system scheduling system can properly order and execute
 * systems based on dependencies, conditions, and system sets.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  World,
  ComponentType,
  ResourceType,
  StorageType,
  Component,
  Resource,
  System,
  SystemSet,
  SystemCondition,
} from "../types";
import { createWorld } from "../world";
import { system, schedule, systemSet } from "../system";

// Test components
class Position implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Velocity implements Component {
  readonly __component = true;
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Health implements Component {
  readonly __component = true;
  constructor(
    public current: number,
    public maximum: number,
  ) {}
}

// Test resources
class GameTime implements Resource {
  readonly __resource = true;
  constructor(
    public deltaTime: number,
    public totalTime: number,
  ) {}
}

class GameState implements Resource {
  readonly __resource = true;
  constructor(
    public score: number,
    public level: number,
    public isRunning: boolean = true,
  ) {}
}

// Component types
const PositionType: ComponentType<Position> = {
  name: "Position",
  id: 0,
  storage: StorageType.Table,
  create: () => new Position(0, 0),
};

const VelocityType: ComponentType<Velocity> = {
  name: "Velocity",
  id: 1,
  storage: StorageType.Table,
  create: () => new Velocity(0, 0),
};

const HealthType: ComponentType<Health> = {
  name: "Health",
  id: 2,
  storage: StorageType.SparseSet,
  create: () => new Health(100, 100),
};

// Resource types
const GameTimeType: ResourceType<GameTime> = {
  name: "GameTime",
  id: 0,
  create: () => new GameTime(0, 0),
};

const GameStateType: ResourceType<GameState> = {
  name: "GameState",
  id: 1,
  create: () => new GameState(0, 1, true),
};

describe("System System", () => {
  let world: World;
  let gameTime: GameTime;
  let gameState: GameState;

  beforeEach(() => {
    world = createWorld();

    // Register component types
    world.getComponentRegistry().register(PositionType);
    world.getComponentRegistry().register(VelocityType);
    world.getComponentRegistry().register(HealthType);

    // Register resource types
    world.getResourceRegistry().register(GameTimeType);
    world.getResourceRegistry().register(GameStateType);

    // Add resources
    gameTime = new GameTime(16.67, 1000);
    gameState = new GameState(0, 1, true);
    world.addResource(GameTimeType, gameTime);
    world.addResource(GameStateType, gameState);

    // Create test entities
    const entity1 = world.spawn();
    world.add(entity1, PositionType, new Position(0, 0));
    world.add(entity1, VelocityType, new Velocity(10, 10));

    const entity2 = world.spawn();
    world.add(entity2, PositionType, new Position(100, 100));
    world.add(entity2, VelocityType, new Velocity(-5, -5));
    world.add(entity2, HealthType, new Health(50, 100));
  });

  describe("Basic System Execution", () => {
    it("should execute a simple system", () => {
      const mockSystem = vi.fn((world: World) => {
        const query = world.query(PositionType);
        query.forEach((entity, position) => {
          position.x += 1;
          position.y += 1;
        });
      });

      const systemInstance = system(mockSystem);

      // Execute system
      systemInstance.run(world);

      expect(mockSystem).toHaveBeenCalledTimes(1);
      expect(mockSystem).toHaveBeenCalledWith(world);

      // Check that positions were modified
      const query = world.query(PositionType);
      const positions: Position[] = [];
      query.forEach((entity, position) => {
        positions.push(position);
      });

      expect(positions[0].x).toBe(1);
      expect(positions[0].y).toBe(1);
      expect(positions[1].x).toBe(101);
      expect(positions[1].y).toBe(101);
    });

    it("should execute multiple systems in order", () => {
      const executionOrder: string[] = [];

      const system1 = system((world: World) => {
        executionOrder.push("system1");
        const query = world.query(PositionType);
        query.forEach((entity, position) => {
          position.x += 1;
        });
      });

      const system2 = system((world: World) => {
        executionOrder.push("system2");
        const query = world.query(PositionType);
        query.forEach((entity, position) => {
          position.y += 1;
        });
      });

      // Execute systems
      system1.run(world);
      system2.run(world);

      expect(executionOrder).toEqual(["system1", "system2"]);

      // Check that both modifications were applied
      const query = world.query(PositionType);
      const positions: Position[] = [];
      query.forEach((entity, position) => {
        positions.push(position);
      });

      expect(positions[0].x).toBe(1);
      expect(positions[0].y).toBe(1);
      expect(positions[1].x).toBe(101);
      expect(positions[1].y).toBe(101);
    });

    it("should handle systems that modify resources", () => {
      const timeSystem = system((world: World) => {
        const gameTime = world.getResource(GameTimeType) as GameTime;
        if (gameTime) {
          gameTime.totalTime += gameTime.deltaTime;
        }
      });

      const initialState = gameTime.totalTime;

      timeSystem.run(world);

      expect(gameTime.totalTime).toBe(initialState + gameTime.deltaTime);
    });
  });

  describe("System Dependencies", () => {
    it("should execute systems in dependency order", () => {
      const executionOrder: string[] = [];

      const movementSystem = system((world: World) => {
        executionOrder.push("movement");
        const query = world.query(PositionType, VelocityType);
        query.forEach((entity, position, velocity) => {
          position.x += velocity.x * 0.016; // 16ms delta time
          position.y += velocity.y * 0.016;
        });
      });

      const collisionSystem = system((world: World) => {
        executionOrder.push("collision");
        const query = world.query(PositionType);
        query.forEach((entity, position) => {
          // Simple boundary collision
          if (position.x < 0) position.x = 0;
          if (position.y < 0) position.y = 0;
        });
      });

      const renderSystem = system((world: World) => {
        executionOrder.push("render");
        // Just mark that rendering happened
      });

      // Set up dependencies: movement -> collision -> render
      movementSystem.addDependency(collisionSystem);
      collisionSystem.addDependency(renderSystem);

      // Create schedule and run
      const gameSchedule = schedule()
        .addSystem(movementSystem)
        .addSystem(collisionSystem)
        .addSystem(renderSystem);

      gameSchedule.run(world);

      // Should execute in dependency order: movement, collision, render
      expect(executionOrder).toEqual(["movement", "collision", "render"]);
    });

    it("should handle circular dependencies gracefully", () => {
      const system1 = system((world: World) => {
        // System 1 logic
      });

      const system2 = system((world: World) => {
        // System 2 logic
      });

      // Create circular dependency
      system1.addDependency(system2);
      system2.addDependency(system1);

      const gameSchedule = schedule().addSystem(system1).addSystem(system2);

      // Should not throw error, but may not execute in expected order
      expect(() => {
        gameSchedule.run(world);
      }).not.toThrow();
    });

    it("should handle complex dependency chains", () => {
      const executionOrder: string[] = [];

      const systems = {
        input: system((world: World) => {
          executionOrder.push("input");
        }),
        physics: system((world: World) => {
          executionOrder.push("physics");
        }),
        ai: system((world: World) => {
          executionOrder.push("ai");
        }),
        collision: system((world: World) => {
          executionOrder.push("collision");
        }),
        render: system((world: World) => {
          executionOrder.push("render");
        }),
      };

      // Set up complex dependencies
      systems.physics.addDependency(systems.input);
      systems.ai.addDependency(systems.input);
      systems.collision.addDependency(systems.physics);
      systems.collision.addDependency(systems.ai);
      systems.render.addDependency(systems.collision);

      const gameSchedule = schedule()
        .addSystem(systems.input)
        .addSystem(systems.physics)
        .addSystem(systems.ai)
        .addSystem(systems.collision)
        .addSystem(systems.render);

      gameSchedule.run(world);

      // Input should run first, then physics and ai (order may vary),
      // then collision, then render
      expect(executionOrder).toContain("input");
      expect(executionOrder).toContain("physics");
      expect(executionOrder).toContain("ai");
      expect(executionOrder).toContain("collision");
      expect(executionOrder).toContain("render");

      const inputIndex = executionOrder.indexOf("input");
      const collisionIndex = executionOrder.indexOf("collision");
      const renderIndex = executionOrder.indexOf("render");

      expect(inputIndex).toBeLessThan(collisionIndex);
      expect(collisionIndex).toBeLessThan(renderIndex);
    });
  });

  describe("System Conditions", () => {
    it("should execute system only when condition is met", () => {
      let executionCount = 0;

      const condition: SystemCondition = {
        name: "gameRunning",
        run: (world: World) => {
          const gameState = world.getResource(GameStateType) as GameState;
          return gameState ? gameState.isRunning : false;
        },
      };

      const conditionalSystem = system((world: World) => {
        executionCount++;
      }).withCondition(condition);

      // First execution - game is running
      conditionalSystem.run(world);
      expect(executionCount).toBe(1);

      // Stop the game
      gameState.isRunning = false;

      // Second execution - game is stopped
      conditionalSystem.run(world);
      expect(executionCount).toBe(1); // Should not execute

      // Start the game again
      gameState.isRunning = true;

      // Third execution - game is running again
      conditionalSystem.run(world);
      expect(executionCount).toBe(2);
    });

    it("should handle multiple conditions", () => {
      let executionCount = 0;

      const condition1: SystemCondition = {
        name: "gameRunning",
        run: (world: World) => {
          const gameState = world.getResource(GameStateType) as GameState;
          return gameState ? gameState.isRunning : false;
        },
      };

      const condition2: SystemCondition = {
        name: "hasEntities",
        run: (world: World) => {
          const query = world.query(PositionType);
          let count = 0;
          query.forEach(() => {
            count++;
          });
          return count > 0;
        },
      };

      const conditionalSystem = system((world: World) => {
        executionCount++;
      })
        .withCondition(condition1)
        .withCondition(condition2);

      // Both conditions are met
      conditionalSystem.run(world);
      expect(executionCount).toBe(1);

      // Stop the game
      gameState.isRunning = false;

      // One condition is not met
      conditionalSystem.run(world);
      expect(executionCount).toBe(1); // Should not execute
    });

    it("should handle condition errors gracefully", () => {
      let executionCount = 0;

      const errorCondition: SystemCondition = {
        name: "errorCondition",
        run: (world: World) => {
          throw new Error("Condition error");
        },
      };

      const conditionalSystem = system((world: World) => {
        executionCount++;
      }).withCondition(errorCondition);

      // Should not execute due to condition error
      expect(() => {
        conditionalSystem.run(world);
      }).not.toThrow();

      expect(executionCount).toBe(0);
    });
  });

  describe("System Sets", () => {
    it("should execute systems in a set together", () => {
      const executionOrder: string[] = [];

      const movementSystem = system((world: World) => {
        executionOrder.push("movement");
      });

      const physicsSystem = system((world: World) => {
        executionOrder.push("physics");
      });

      const physicsSet = systemSet("physics")
        .addSystem(movementSystem)
        .addSystem(physicsSystem);

      const renderSystem = system((world: World) => {
        executionOrder.push("render");
      });

      const gameSchedule = schedule()
        .addSystemSet(physicsSet)
        .addSystem(renderSystem);

      gameSchedule.run(world);

      expect(executionOrder).toContain("movement");
      expect(executionOrder).toContain("physics");
      expect(executionOrder).toContain("render");
    });

    it("should handle system set dependencies", () => {
      const executionOrder: string[] = [];

      const inputSystem = system((world: World) => {
        executionOrder.push("input");
      });

      const inputSet = systemSet("input").addSystem(inputSystem);

      const physicsSystem = system((world: World) => {
        executionOrder.push("physics");
      });

      const physicsSet = systemSet("physics").addSystem(physicsSystem);

      const renderSystem = system((world: World) => {
        executionOrder.push("render");
      });

      const renderSet = systemSet("render").addSystem(renderSystem);

      // Set up dependencies: input -> physics -> render
      physicsSet.addDependency(inputSet);
      renderSet.addDependency(physicsSet);

      const gameSchedule = schedule()
        .addSystemSet(inputSet)
        .addSystemSet(physicsSet)
        .addSystemSet(renderSet);

      gameSchedule.run(world);

      const inputIndex = executionOrder.indexOf("input");
      const physicsIndex = executionOrder.indexOf("physics");
      const renderIndex = executionOrder.indexOf("render");

      expect(inputIndex).toBeLessThan(physicsIndex);
      expect(physicsIndex).toBeLessThan(renderIndex);
    });

    it("should handle mixed system and system set dependencies", () => {
      const executionOrder: string[] = [];

      const inputSystem = system((world: World) => {
        executionOrder.push("input");
      });

      const physicsSystem = system((world: World) => {
        executionOrder.push("physics");
      });

      const physicsSet = systemSet("physics").addSystem(physicsSystem);

      const renderSystem = system((world: World) => {
        executionOrder.push("render");
      });

      // Set up dependencies: input -> physics -> render
      physicsSet.addDependency(inputSystem);
      renderSystem.addDependency(physicsSet);

      const gameSchedule = schedule()
        .addSystem(inputSystem)
        .addSystemSet(physicsSet)
        .addSystem(renderSystem);

      gameSchedule.run(world);

      const inputIndex = executionOrder.indexOf("input");
      const physicsIndex = executionOrder.indexOf("physics");
      const renderIndex = executionOrder.indexOf("render");

      expect(inputIndex).toBeLessThan(physicsIndex);
      expect(physicsIndex).toBeLessThan(renderIndex);
    });
  });

  describe("System Performance", () => {
    it("should handle many systems efficiently", () => {
      const systems: System[] = [];

      // Create 100 simple systems
      for (let i = 0; i < 100; i++) {
        const systemInstance = system((world: World) => {
          // Simple system that does nothing
        });
        systems.push(systemInstance);
      }

      const gameSchedule = schedule();
      systems.forEach((sys) => gameSchedule.addSystem(sys));

      const startTime = performance.now();
      gameSchedule.run(world);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle systems with many entities efficiently", () => {
      // Create many entities
      for (let i = 0; i < 1000; i++) {
        const entity = world.spawn();
        world.add(entity, PositionType, new Position(i, i));
        world.add(entity, VelocityType, new Velocity(1, 1));
      }

      const movementSystem = system((world: World) => {
        const query = world.query(PositionType, VelocityType);
        query.forEach((entity, position, velocity) => {
          position.x += velocity.x * 0.016;
          position.y += velocity.y * 0.016;
        });
      });

      const startTime = performance.now();
      movementSystem.run(world);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  describe("Error Handling", () => {
    it("should handle system execution errors gracefully", () => {
      const errorSystem = system((world: World) => {
        throw new Error("System execution error");
      });

      expect(() => {
        errorSystem.run(world);
      }).toThrow("System execution error");
    });

    it("should continue executing other systems after error", () => {
      const executionOrder: string[] = [];

      const system1 = system((world: World) => {
        executionOrder.push("system1");
      });

      const errorSystem = system((world: World) => {
        executionOrder.push("errorSystem");
        throw new Error("System error");
      });

      const system3 = system((world: World) => {
        executionOrder.push("system3");
      });

      const gameSchedule = schedule()
        .addSystem(system1)
        .addSystem(errorSystem)
        .addSystem(system3);

      expect(() => {
        gameSchedule.run(world);
      }).toThrow("System error");

      // Should have executed system1 and errorSystem
      expect(executionOrder).toContain("system1");
      expect(executionOrder).toContain("errorSystem");
      // system3 should not have executed due to error
      expect(executionOrder).not.toContain("system3");
    });

    it("should handle schedule creation errors", () => {
      expect(() => {
        schedule().addSystem(null as any);
      }).toThrow();
    });
  });
});
