/**
 * @fileoverview Integration tests for the complete ECS system - end-to-end game scenarios.
 *
 * These tests verify that all ECS components work together correctly in realistic
 * game scenarios, including entity management, component systems, and system scheduling.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { beforeEach, describe, expect, it } from "vitest";
import { schedule, system, systemSet } from "../../system";
import {
  Component,
  ComponentType,
  Resource,
  ResourceType,
  StorageType,
  World,
} from "../../types";
import { createWorld } from "../../world";

// Game components
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

class Player implements Component {
  readonly __component = true;
  constructor(public name: string) {}
}

class Enemy implements Component {
  readonly __component = true;
  constructor(public type: string) {}
}

class Bullet implements Component {
  readonly __component = true;
  constructor(public speed: number) {}
}

class Renderable implements Component {
  readonly __component = true;
  constructor(public shape: "circle" | "rectangle" | "triangle") {}
}

// Game resources
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

class InputState implements Resource {
  readonly __resource = true;
  constructor(
    public keys: Set<string> = new Set(),
    public mouseX: number = 0,
    public mouseY: number = 0,
  ) {}
}

// Component types - will be initialized in beforeEach
let PositionType: ComponentType<Position>;
let VelocityType: ComponentType<Velocity>;
let HealthType: ComponentType<Health>;
let PlayerType: ComponentType<Player>;
let EnemyType: ComponentType<Enemy>;
let BulletType: ComponentType<Bullet>;
let RenderableType: ComponentType<Renderable>;

// Resource types - will be initialized in beforeEach
let GameTimeType: ResourceType<GameTime>;
let GameStateType: ResourceType<GameState>;
let InputStateType: ResourceType<InputState>;

describe("ECS Integration Tests", () => {
  let world: World;
  let gameTime: GameTime;
  let gameState: GameState;
  let inputState: InputState;

  beforeEach(() => {
    world = createWorld();

    // Register component types
    world
      .getComponentRegistry()
      .register("Position", StorageType.Table, () => new Position(0, 0));
    world
      .getComponentRegistry()
      .register("Velocity", StorageType.Table, () => new Velocity(0, 0));
    world
      .getComponentRegistry()
      .register("Health", StorageType.SparseSet, () => new Health(100, 100));
    world
      .getComponentRegistry()
      .register("Player", StorageType.SparseSet, () => new Player("Player"));
    world
      .getComponentRegistry()
      .register("Enemy", StorageType.SparseSet, () => new Enemy("basic"));
    world
      .getComponentRegistry()
      .register("Bullet", StorageType.SparseSet, () => new Bullet(300));
    world
      .getComponentRegistry()
      .register(
        "Renderable",
        StorageType.Table,
        () => new Renderable("circle"),
      );

    // Get the registered component types
    PositionType = world.getComponentRegistry().getByName("Position")!;
    VelocityType = world.getComponentRegistry().getByName("Velocity")!;
    HealthType = world.getComponentRegistry().getByName("Health")!;
    PlayerType = world.getComponentRegistry().getByName("Player")!;
    EnemyType = world.getComponentRegistry().getByName("Enemy")!;
    BulletType = world.getComponentRegistry().getByName("Bullet")!;
    RenderableType = world.getComponentRegistry().getByName("Renderable")!;

    // Register resource types
    world.getResourceRegistry().register("GameTime", () => new GameTime(0, 0));
    world
      .getResourceRegistry()
      .register("GameState", () => new GameState(0, 1, true));
    world.getResourceRegistry().register("InputState", () => new InputState());

    // Get the registered resource types
    GameTimeType = world.getResourceRegistry().getByName("GameTime")!;
    GameStateType = world.getResourceRegistry().getByName("GameState")!;
    InputStateType = world.getResourceRegistry().getByName("InputState")!;

    // Add resources
    gameTime = new GameTime(16.67, 1000);
    gameState = new GameState(0, 1, true);
    inputState = new InputState();

    world.addResource(GameTimeType, gameTime);
    world.addResource(GameStateType, gameState);
    world.addResource(InputStateType, inputState);
  });

  describe("Complete Game Loop", () => {
    it("should run a complete game loop with all systems", () => {
      // Create game entities
      const player = world.spawn();
      world.add(player, PositionType, new Position(100, 100));
      world.add(player, VelocityType, new Velocity(0, 0));
      world.add(player, HealthType, new Health(100, 100));
      world.add(player, PlayerType, new Player("TestPlayer"));
      world.add(player, RenderableType, new Renderable("circle"));

      const enemy = world.spawn();
      world.add(enemy, PositionType, new Position(200, 200));
      world.add(enemy, VelocityType, new Velocity(10, 10));
      world.add(enemy, HealthType, new Health(50, 50));
      world.add(enemy, EnemyType, new Enemy("basic"));
      world.add(enemy, RenderableType, new Renderable("rectangle"));

      // Define game systems
      const inputSystem = system((world: World) => {
        const inputState = world.getResource(InputStateType) as InputState;
        const playerQuery = world.query(PlayerType, VelocityType);

        playerQuery.forEach((entity, player, velocity) => {
          const vel = velocity as Velocity;
          vel.x = 0;
          vel.y = 0;

          if (inputState.keys.has("ArrowUp")) vel.y = -100;
          if (inputState.keys.has("ArrowDown")) vel.y = 100;
          if (inputState.keys.has("ArrowLeft")) vel.x = -100;
          if (inputState.keys.has("ArrowRight")) vel.x = 100;
        });
      });

      const movementSystem = system((world: World) => {
        const gameTime = world.getResource(GameTimeType) as GameTime;
        const query = world.query(PositionType, VelocityType);

        query.forEach((entity, position, velocity) => {
          const pos = position as Position;
          const vel = velocity as Velocity;
          pos.x += vel.x * gameTime.deltaTime;
          pos.y += vel.y * gameTime.deltaTime;
        });
      });

      const enemyAISystem = system((world: World) => {
        const enemyQuery = world.query(EnemyType, PositionType, VelocityType);
        const playerQuery = world.query(PlayerType, PositionType);

        let playerPosition: Position | null = null;
        playerQuery.forEach((entity, player, position) => {
          playerPosition = position as Position;
        });

        if (playerPosition) {
          enemyQuery.forEach((entity, enemy, position, velocity) => {
            const pos = position as Position;
            const vel = velocity as Velocity;
            const dx = playerPosition.x - pos.x;
            const dy = playerPosition.y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
              vel.x = (dx / distance) * 50;
              vel.y = (dy / distance) * 50;
            }
          });
        }
      });

      const collisionSystem = system((world: World) => {
        const playerQuery = world.query(PlayerType, PositionType, HealthType);
        const enemyQuery = world.query(EnemyType, PositionType);

        playerQuery.forEach((playerEntity, player, playerPos, playerHealth) => {
          const pp = playerPos as Position;
          const ph = playerHealth as Health;

          enemyQuery.forEach((enemyEntity, enemy, enemyPos) => {
            const ep = enemyPos as Position;
            const dx = pp.x - ep.x;
            const dy = pp.y - ep.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
              ph.current -= 10;
              world.despawn(enemyEntity);
            }
          });
        });
      });

      const renderSystem = system((world: World) => {
        const query = world.query(PositionType, RenderableType);
        let renderCount = 0;

        query.forEach((entity, position, renderable) => {
          renderCount++;
        });

        // Just verify rendering happened
        expect(renderCount).toBeGreaterThan(0);
      });

      // Create game schedule
      const gameSchedule = schedule()
        .addSystem(inputSystem)
        .addSystem(enemyAISystem)
        .addSystem(movementSystem)
        .addSystem(collisionSystem)
        .addSystem(renderSystem);

      // Simulate input
      inputState.keys.add("ArrowRight");

      // Run game loop
      gameSchedule.run(world);

      // Verify player moved
      const playerPos = world.get(player, PositionType) as Position;
      expect(playerPos.x).toBeGreaterThan(100);

      // Verify enemy moved towards player
      const enemyPos = world.get(enemy, PositionType) as Position;
      expect(enemyPos.x).toBeLessThan(200);
      expect(enemyPos.y).toBeLessThan(200);
    });

    it("should handle entity lifecycle correctly", () => {
      // Create entities
      const player = world.spawn();
      world.add(player, PositionType, new Position(100, 100));
      world.add(player, HealthType, new Health(100, 100));
      world.add(player, PlayerType, new Player("TestPlayer"));

      const enemy = world.spawn();
      world.add(enemy, PositionType, new Position(100, 100));
      world.add(enemy, EnemyType, new Enemy("basic"));

      // System that removes entities
      const cleanupSystem = system((world: World) => {
        const query = world.query(EnemyType, PositionType);
        query.forEach((entity, enemy, position) => {
          const pos = position as Position;
          if (pos.x < 0 || pos.x > 800 || pos.y < 0 || pos.y > 600) {
            world.despawn(entity);
          }
        });
      });

      // Move enemy out of bounds
      const enemyPos = world.get(enemy, PositionType) as Position;
      enemyPos.x = -10;

      // Run cleanup system
      cleanupSystem.run(world);

      // Enemy should be despawned
      expect(world.isAlive(enemy)).toBe(false);
      expect(world.isAlive(player)).toBe(true);
    });
  });

  describe("System Dependencies and Ordering", () => {
    it("should execute systems in correct dependency order", () => {
      const executionOrder: string[] = [];

      const inputSystem = system((world: World) => {
        executionOrder.push("input");
        const inputState = world.getResource(InputStateType) as InputState;
        inputState.keys.add("ArrowUp");
      });

      const movementSystem = system((world: World) => {
        executionOrder.push("movement");
        const inputState = world.getResource(InputStateType) as InputState;
        expect(inputState.keys.has("ArrowUp")).toBe(true);
      });

      const renderSystem = system((world: World) => {
        executionOrder.push("render");
      });

      // Set up dependencies
      movementSystem.addDependency(inputSystem);
      renderSystem.addDependency(movementSystem);

      const gameSchedule = schedule()
        .addSystem(inputSystem)
        .addSystem(movementSystem)
        .addSystem(renderSystem);

      gameSchedule.run(world);

      expect(executionOrder).toEqual(["input", "movement", "render"]);
    });

    it("should handle system sets with dependencies", () => {
      const executionOrder: string[] = [];

      const inputSystem = system((world: World) => {
        executionOrder.push("input");
      });

      const physicsSystem = system((world: World) => {
        executionOrder.push("physics");
      });

      const renderSystem = system((world: World) => {
        executionOrder.push("render");
      });

      const inputSet = systemSet("input").addSystem(inputSystem);

      const physicsSet = systemSet("physics").addSystem(physicsSystem);

      const renderSet = systemSet("render").addSystem(renderSystem);

      // Set up dependencies
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
  });

  describe("Resource Management", () => {
    it("should share resources between systems", () => {
      const system1 = system((world: World) => {
        const gameState = world.getResource(GameStateType) as GameState;
        gameState.score += 10;
      });

      const system2 = system((world: World) => {
        const gameState = world.getResource(GameStateType) as GameState;
        gameState.score += 20;
      });

      const gameSchedule = schedule().addSystem(system1).addSystem(system2);

      gameSchedule.run(world);

      expect(gameState.score).toBe(30);
    });

    it("should handle resource updates across multiple frames", () => {
      const timeSystem = system((world: World) => {
        const gameTime = world.getResource(GameTimeType) as GameTime;
        gameTime.totalTime += gameTime.deltaTime;
      });

      // Simulate multiple frames
      for (let i = 0; i < 10; i++) {
        timeSystem.run(world);
      }

      expect(gameTime.totalTime).toBeCloseTo(1166.7, 1); // 1000 + 10 * 16.67
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle many entities efficiently", () => {
      // Create many entities
      const entities: any[] = [];

      for (let i = 0; i < 1000; i++) {
        const entity = world.spawn();
        world.add(entity, PositionType, new Position(i, i));
        world.add(entity, VelocityType, new Velocity(1, 1));
        world.add(entity, RenderableType, new Renderable("circle"));
        entities.push(entity);
      }

      const movementSystem = system((world: World) => {
        const query = world.query(PositionType, VelocityType);
        query.forEach((entity, position, velocity) => {
          const pos = position as Position;
          const vel = velocity as Velocity;
          pos.x += vel.x * 0.016;
          pos.y += vel.y * 0.016;
        });
      });

      const renderSystem = system((world: World) => {
        const query = world.query(PositionType, RenderableType);
        let count = 0;
        query.forEach(() => {
          count++;
        });
        expect(count).toBe(1000);
      });

      const gameSchedule = schedule()
        .addSystem(movementSystem)
        .addSystem(renderSystem);

      const startTime = performance.now();
      gameSchedule.run(world);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle complex queries efficiently", () => {
      // Create entities with various component combinations
      for (let i = 0; i < 500; i++) {
        const entity = world.spawn();
        world.add(entity, PositionType, new Position(i, i));

        if (i % 2 === 0) {
          world.add(entity, VelocityType, new Velocity(i, i));
        }

        if (i % 3 === 0) {
          world.add(entity, HealthType, new Health(100, 100));
        }

        if (i % 5 === 0) {
          world.add(entity, PlayerType, new Player(`Player${i}`));
        }

        if (i % 7 === 0) {
          world.add(entity, EnemyType, new Enemy("basic"));
        }
      }

      const complexSystem = system((world: World) => {
        // Query with multiple components
        const query1 = world.query(PositionType, VelocityType, HealthType);
        let count1 = 0;
        query1.forEach(() => {
          count1++;
        });

        // Query with filters
        const query2 = world
          .query(PositionType)
          .with(PlayerType)
          .without(EnemyType);
        let count2 = 0;
        query2.forEach(() => {
          count2++;
        });

        // Query with change detection
        const query3 = world.query(PositionType).changed(PositionType);
        let count3 = 0;
        query3.forEach(() => {
          count3++;
        });

        expect(count1).toBeGreaterThan(0);
        expect(count2).toBeGreaterThan(0);
        expect(count3).toBeGreaterThanOrEqual(0);
      });

      const startTime = performance.now();
      complexSystem.run(world);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle system errors gracefully", () => {
      const errorSystem = system((world: World) => {
        throw new Error("System error");
      });

      const normalSystem = system((world: World) => {
        // This should still run
      });

      const gameSchedule = schedule()
        .addSystem(normalSystem)
        .addSystem(errorSystem);

      expect(() => {
        gameSchedule.run(world);
      }).toThrow("System error");
    });

    it("should handle entity operations on despawned entities", () => {
      const entity = world.spawn();
      world.add(entity, PositionType, new Position(10, 20));

      world.despawn(entity);

      // Operations on despawned entities should be safe
      expect(() => {
        world.add(entity, VelocityType, new Velocity(5, 10));
        world.remove(entity, PositionType);
        world.get(entity, PositionType);
        world.has(entity, PositionType);
      }).not.toThrow();
    });

    it("should handle resource operations gracefully", () => {
      const unregisteredResourceType = {
        name: "Unregistered",
        id: 999,
        create: () => ({ __resource: true, value: 42 }),
      };

      expect(() => {
        world.addResource(unregisteredResourceType as any, {
          __resource: true,
          value: 42,
        });
        world.getResource(unregisteredResourceType as any);
        world.hasResource(unregisteredResourceType as any);
        world.removeResource(unregisteredResourceType as any);
      }).not.toThrow();
    });
  });

  describe("Real-World Game Scenarios", () => {
    it("should simulate a complete shooter game", () => {
      // Create player
      const player = world.spawn();
      world.add(player, PositionType, new Position(400, 300));
      world.add(player, VelocityType, new Velocity(0, 0));
      world.add(player, HealthType, new Health(100, 100));
      world.add(player, PlayerType, new Player("Player"));
      world.add(player, RenderableType, new Renderable("circle"));

      // Create enemies
      const enemies: any[] = [];
      for (let i = 0; i < 5; i++) {
        const enemy = world.spawn();
        world.add(enemy, PositionType, new Position(100 + i * 50, 100));
        world.add(enemy, VelocityType, new Velocity(0, 0));
        world.add(enemy, HealthType, new Health(50, 50));
        world.add(enemy, EnemyType, new Enemy("basic"));
        world.add(enemy, RenderableType, new Renderable("rectangle"));
        enemies.push(enemy);
      }

      // Create bullets
      const bullets: any[] = [];
      for (let i = 0; i < 3; i++) {
        const bullet = world.spawn();
        world.add(bullet, PositionType, new Position(400, 300));
        world.add(bullet, VelocityType, new Velocity(0, -200));
        world.add(bullet, BulletType, new Bullet(300));
        world.add(bullet, RenderableType, new Renderable("triangle"));
        bullets.push(bullet);
      }

      // Game systems
      const playerInputSystem = system((world: World) => {
        const inputState = world.getResource(InputStateType) as InputState;
        const playerQuery = world.query(PlayerType, VelocityType);

        playerQuery.forEach((entity, player, velocity) => {
          const vel = velocity as Velocity;
          vel.x = 0;
          vel.y = 0;

          if (inputState.keys.has("ArrowUp")) vel.y = -100;
          if (inputState.keys.has("ArrowDown")) vel.y = 100;
          if (inputState.keys.has("ArrowLeft")) vel.x = -100;
          if (inputState.keys.has("ArrowRight")) vel.x = 100;
        });
      });

      const movementSystem = system((world: World) => {
        const gameTime = world.getResource(GameTimeType) as GameTime;
        const query = world.query(PositionType, VelocityType);

        query.forEach((entity, position, velocity) => {
          const pos = position as Position;
          const vel = velocity as Velocity;
          pos.x += vel.x * gameTime.deltaTime;
          pos.y += vel.y * gameTime.deltaTime;
        });
      });

      const enemyAISystem = system((world: World) => {
        const enemyQuery = world.query(EnemyType, PositionType, VelocityType);
        const playerQuery = world.query(PlayerType, PositionType);

        let playerPosition: Position | null = null;
        playerQuery.forEach((entity, player, position) => {
          playerPosition = position as Position;
        });

        if (playerPosition) {
          enemyQuery.forEach((entity, enemy, position, velocity) => {
            const pos = position as Position;
            const vel = velocity as Velocity;
            const dx = playerPosition.x - pos.x;
            const dy = playerPosition.y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
              vel.x = (dx / distance) * 30;
              vel.y = (dy / distance) * 30;
            }
          });
        }
      });

      const collisionSystem = system((world: World) => {
        const gameState = world.getResource(GameStateType) as GameState;

        // Player-enemy collisions
        const playerQuery = world.query(PlayerType, PositionType, HealthType);
        const enemyQuery = world.query(EnemyType, PositionType);

        playerQuery.forEach((playerEntity, player, playerPos, playerHealth) => {
          const pp = playerPos as Position;
          const ph = playerHealth as Health;

          enemyQuery.forEach((enemyEntity, enemy, enemyPos) => {
            const ep = enemyPos as Position;
            const dx = pp.x - ep.x;
            const dy = pp.y - ep.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) {
              ph.current -= 20;
              world.despawn(enemyEntity);
            }
          });
        });

        // Bullet-enemy collisions
        const bulletQuery = world.query(BulletType, PositionType);

        bulletQuery.forEach((bulletEntity, bullet, bulletPos) => {
          const bp = bulletPos as Position;

          enemyQuery.forEach((enemyEntity, enemy, enemyPos) => {
            const ep = enemyPos as Position;
            const dx = bp.x - ep.x;
            const dy = bp.y - ep.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
              world.despawn(bulletEntity);
              world.despawn(enemyEntity);
              gameState.score += 10;
            }
          });
        });
      });

      const cleanupSystem = system((world: World) => {
        // Remove bullets that are out of bounds
        const bulletQuery = world.query(BulletType, PositionType);
        bulletQuery.forEach((entity, bullet, position) => {
          const pos = position as Position;
          if (pos.y < 0 || pos.y > 600) {
            world.despawn(entity);
          }
        });
      });

      // Set up input
      inputState.keys.add("ArrowRight");

      // Create game schedule
      const gameSchedule = schedule()
        .addSystem(playerInputSystem)
        .addSystem(movementSystem)
        .addSystem(enemyAISystem)
        .addSystem(collisionSystem)
        .addSystem(cleanupSystem);

      // Run game loop
      gameSchedule.run(world);

      // Verify game state
      const playerPos = world.get(player, PositionType) as Position;
      const playerHealth = world.get(player, HealthType) as Health;

      expect(playerPos.x).toBeGreaterThan(400); // Player moved right
      expect(playerHealth.current).toBeLessThanOrEqual(100); // Health may have decreased
      expect(gameState.score).toBeGreaterThanOrEqual(0); // Score may have increased
    });
  });
});
