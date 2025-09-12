// Advanced ECS game example demonstrating all new features

import {
  CommonHooks,
  ComponentHookRegistry,
  ComponentType,
  ConditionCombinators,
  Conditions,
  createComponentHooks,
  createWorld,
  ResourceType,
  schedule,
  StorageType,
  system,
  systemSet,
  TASK_POOL,
  TaskPool,
} from "../index";

import {
  Bullet,
  Camera,
  Color,
  Damage,
  Enemy,
  GameState,
  GameTime,
  Health,
  InputState,
  Player,
  Position,
  Size,
  Velocity,
} from "./components";

/**
 * Advanced ECS Game demonstrating all new features.
 */
export class AdvancedECSGame {
  private world: any;
  private gameLoop: number | null = null;
  private lastTime = 0;
  private hookRegistry: ComponentHookRegistry;
  private taskPool: TaskPool;

  // Component types
  private positionType!: ComponentType<Position>;
  private velocityType!: ComponentType<Velocity>;
  private healthType!: ComponentType<Health>;
  private damageType!: ComponentType<Damage>;
  private playerType!: ComponentType<Player>;
  private enemyType!: ComponentType<Enemy>;
  private bulletType!: ComponentType<Bullet>;
  private colorType!: ComponentType<Color>;
  private sizeType!: ComponentType<Size>;

  // Resource types
  private gameTimeType!: ResourceType<GameTime>;
  private gameStateType!: ResourceType<GameState>;
  private inputStateType!: ResourceType<InputState>;
  private cameraType!: ResourceType<Camera>;

  constructor() {
    this.world = createWorld();
    this.hookRegistry = new ComponentHookRegistry();
    this.taskPool = TASK_POOL;
    this.setupComponentTypes();
    this.setupResourceTypes();
    this.setupComponentHooks();
    this.setupSystems();
    this.setupInitialEntities();
  }

  private setupComponentTypes(): void {
    const registry = this.world.getComponentRegistry();

    this.positionType = registry.register(
      "Position",
      StorageType.Table,
      () => new Position(0, 0),
    );
    this.velocityType = registry.register(
      "Velocity",
      StorageType.Table,
      () => new Velocity(0, 0),
    );
    this.healthType = registry.register(
      "Health",
      StorageType.Table,
      () => new Health(100, 100),
    );
    this.damageType = registry.register(
      "Damage",
      StorageType.Table,
      () => new Damage(10),
    );
    this.playerType = registry.register(
      "Player",
      StorageType.Table,
      () => new Player("Player1"),
    );
    this.enemyType = registry.register(
      "Enemy",
      StorageType.Table,
      () => new Enemy("Basic"),
    );
    this.bulletType = registry.register(
      "Bullet",
      StorageType.Table,
      () => new Bullet(300),
    );
    this.colorType = registry.register(
      "Color",
      StorageType.Table,
      () => new Color(1, 1, 1),
    );
    this.sizeType = registry.register(
      "Size",
      StorageType.Table,
      () => new Size(20, 20),
    );
  }

  private setupResourceTypes(): void {
    const registry = this.world.getResourceRegistry();

    this.gameTimeType = registry.register("GameTime", () => new GameTime(0, 0));
    this.gameStateType = registry.register(
      "GameState",
      () => new GameState(0, 1),
    );
    this.inputStateType = registry.register(
      "InputState",
      () => new InputState(),
    );
    this.cameraType = registry.register("Camera", () => new Camera(0, 0, 1));
  }

  private setupComponentHooks(): void {
    // Add logging hooks for debugging
    this.hookRegistry.registerHooks(
      this.playerType,
      createComponentHooks({
        onAdd: CommonHooks.logOnAdd(this.playerType),
        onRemove: CommonHooks.logOnRemove(this.playerType),
      }),
    );

    this.hookRegistry.registerHooks(
      this.enemyType,
      createComponentHooks({
        onAdd: CommonHooks.logOnAdd(this.enemyType),
        onRemove: CommonHooks.logOnRemove(this.enemyType),
      }),
    );

    // Add validation hooks
    this.hookRegistry.registerHooks(
      this.healthType,
      createComponentHooks({
        onAdd: CommonHooks.validateOnAdd(
          this.healthType,
          (health) => health.current >= 0 && health.max > 0,
        ),
      }),
    );
  }

  private setupSystems(): void {
    // Create system sets for organization
    const inputSet = systemSet("input");
    const updateSet = systemSet("update");
    const renderSet = systemSet("render");

    // Add systems with conditions
    this.world.addSystem(
      system("playerInput", this.playerInputSystem.bind(this))
        .runIf(Conditions.resourceExists(this.inputStateType))
        .build(),
    );

    this.world.addSystem(
      system("shooting", this.shootingSystem.bind(this))
        .runIf(
          ConditionCombinators.and(
            Conditions.resourceExists(this.inputStateType),
            Conditions.anyEntityWith(this.playerType, this.positionType),
          ),
        )
        .build(),
    );

    this.world.addSystem(
      system("movement", this.movementSystem.bind(this))
        .runIf(Conditions.resourceExists(this.gameTimeType))
        .build(),
    );

    this.world.addSystem(
      system("enemyAI", this.enemyAISystem.bind(this))
        .runIf(
          ConditionCombinators.and(
            Conditions.anyEntityWith(this.enemyType),
            Conditions.timePassed(0.5), // Run every 0.5 seconds
          ),
        )
        .build(),
    );

    this.world.addSystem(
      system("collision", this.collisionSystem.bind(this))
        .runIf(Conditions.anyEntityWith(this.playerType, this.enemyType))
        .build(),
    );

    this.world.addSystem(
      system("rendering", this.renderingSystem.bind(this))
        .runIf(Conditions.everyNFrames(1)) // Run every frame
        .build(),
    );

    this.world.addSystem(
      system("gameState", this.gameStateSystem.bind(this))
        .runIf(Conditions.resourceExists(this.gameStateType))
        .build(),
    );

    // Create main schedule
    const mainSchedule = schedule("main");
    mainSchedule.addSystem(
      system("playerInput", this.playerInputSystem.bind(this))
        .runIf(Conditions.resourceExists(this.inputStateType))
        .build(),
    );
    mainSchedule.addSystem(
      system("shooting", this.shootingSystem.bind(this))
        .runIf(
          ConditionCombinators.and(
            Conditions.resourceExists(this.inputStateType),
            Conditions.anyEntityWith(this.playerType, this.positionType),
          ),
        )
        .build(),
    );
    mainSchedule.addSystem(
      system("movement", this.movementSystem.bind(this))
        .runIf(Conditions.resourceExists(this.gameTimeType))
        .build(),
    );
    mainSchedule.addSystem(
      system("enemyAI", this.enemyAISystem.bind(this))
        .runIf(
          ConditionCombinators.and(
            Conditions.anyEntityWith(this.enemyType),
            Conditions.timePassed(0.5),
          ),
        )
        .build(),
    );
    mainSchedule.addSystem(
      system("collision", this.collisionSystem.bind(this))
        .runIf(Conditions.anyEntityWith(this.playerType, this.enemyType))
        .build(),
    );
    mainSchedule.addSystem(
      system("rendering", this.renderingSystem.bind(this))
        .runIf(Conditions.everyNFrames(1))
        .build(),
    );
    mainSchedule.addSystem(
      system("gameState", this.gameStateSystem.bind(this))
        .runIf(Conditions.resourceExists(this.gameStateType))
        .build(),
    );
  }

  private setupInitialEntities(): void {
    // Create player
    const player = this.world.spawn(
      new Position(400, 500),
      new Velocity(0, 0),
      new Health(100, 100),
      new Player("Player1"),
      new Color(0, 0, 1), // Blue
      new Size(30, 30),
    );

    // Create some enemies
    for (let i = 0; i < 5; i++) {
      const enemy = this.world.spawn(
        new Position(Math.random() * 800, Math.random() * 200),
        new Velocity(0, 0),
        new Health(50, 50),
        new Enemy("Basic"),
        new Color(1, 0, 0), // Red
        new Size(25, 25),
      );
    }

    // Initialize resources
    this.world.insertResource(new GameTime(0, 0));
    this.world.insertResource(new GameState(0, 1));
    this.world.insertResource(new InputState());
    this.world.insertResource(new Camera(0, 0, 1));
  }

  /**
   * Starts the game loop.
   */
  start(): void {
    this.lastTime = performance.now();
    this.gameLoop = requestAnimationFrame((time) => this.update(time));
  }

  /**
   * Stops the game loop.
   */
  stop(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }

  /**
   * Updates the game state.
   */
  private update(currentTime: number): void {
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update game time resource
    const gameTime = this.world.getResource(this.gameTimeType);
    if (gameTime) {
      gameTime.deltaTime = deltaTime;
      gameTime.totalTime += deltaTime;
    }

    // Run the main schedule
    this.world.runSchedule("main");

    // Continue the game loop
    this.gameLoop = requestAnimationFrame((time) => this.update(time));
  }

  /**
   * Player input system with parallel execution.
   */
  private playerInputSystem(world: any): void {
    const inputState = world.getResource(this.inputStateType);
    if (!inputState) return;

    const query = world.query(this.playerType, this.velocityType);
    const speed = 200; // pixels per second

    // Use parallel execution for better performance
    query.forEach((entity: any, player: any, velocity: any) => {
      // Reset velocity
      velocity.x = 0;
      velocity.y = 0;

      // Apply movement based on input
      if (inputState.keys.has("ArrowLeft") || inputState.keys.has("KeyA")) {
        velocity.x = -speed;
      }
      if (inputState.keys.has("ArrowRight") || inputState.keys.has("KeyD")) {
        velocity.x = speed;
      }
      if (inputState.keys.has("ArrowUp") || inputState.keys.has("KeyW")) {
        velocity.y = -speed;
      }
      if (inputState.keys.has("ArrowDown") || inputState.keys.has("KeyS")) {
        velocity.y = speed;
      }
    });
  }

  /**
   * Shooting system with conditions.
   */
  private shootingSystem(world: any): void {
    const inputState = world.getResource(this.inputStateType);
    if (!inputState) return;

    const query = world.query(this.playerType, this.positionType);
    const bulletSpeed = 300; // pixels per second

    query.forEach((entity: any, player: any, position: any) => {
      if (inputState.keys.has("Space")) {
        // Create bullet
        const bullet = world.spawn(
          new Position(position.x, position.y),
          new Velocity(0, -bulletSpeed),
          new Bullet(bulletSpeed),
          new Color(1, 1, 0), // Yellow
          new Size(5, 10),
        );
      }
    });
  }

  /**
   * Movement system with parallel execution.
   */
  private movementSystem(world: any): void {
    const gameTime = world.getResource(this.gameTimeType);
    if (!gameTime) return;

    const query = world.query(this.positionType, this.velocityType);

    // Use parallel execution for better performance
    query.forEach((entity: any, position: any, velocity: any) => {
      position.x += velocity.x * gameTime.deltaTime;
      position.y += velocity.y * gameTime.deltaTime;
    });
  }

  /**
   * Enemy AI system with conditions.
   */
  private enemyAISystem(world: any): void {
    const query = world.query(
      this.enemyType,
      this.positionType,
      this.velocityType,
    );
    const speed = 100; // pixels per second

    query.forEach((entity: any, enemy: any, position: any, velocity: any) => {
      // Simple AI: move towards player
      const pos = position as Position;
      const vel = velocity as Velocity;
      const playerQuery = world.query(this.playerType, this.positionType);
      let playerPosition: Position | null = null;

      playerQuery.forEach((playerEntity: any, player: any, playerPos: any) => {
        playerPosition = playerPos as Position;
      });

      if (playerPosition) {
        const playerPos = playerPosition as Position;
        const dx = playerPos.x - pos.x;
        const dy = playerPos.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          vel.x = (dx / distance) * speed;
          vel.y = (dy / distance) * speed;
        }
      }
    });
  }

  /**
   * Collision system with parallel execution.
   */
  private collisionSystem(world: any): void {
    const playerQuery = world.query(this.playerType, this.positionType);
    const enemyQuery = world.query(this.enemyType, this.positionType);
    const bulletQuery = world.query(this.bulletType, this.positionType);

    // Check player-enemy collisions
    playerQuery.forEach((playerEntity: any, player: any, playerPos: any) => {
      enemyQuery.forEach((enemyEntity: any, enemy: any, enemyPos: any) => {
        const dx = playerPos.x - enemyPos.x;
        const dy = playerPos.y - enemyPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 30) {
          // Collision threshold
          // Apply damage to player
          const playerHealth = world.get(playerEntity, this.healthType);
          if (playerHealth) {
            playerHealth.current -= 10;
          }

          // Remove enemy
          world.despawn(enemyEntity);
        }
      });
    });

    // Check bullet-enemy collisions
    bulletQuery.forEach((bulletEntity: any, bullet: any, bulletPos: any) => {
      enemyQuery.forEach((enemyEntity: any, enemy: any, enemyPos: any) => {
        const dx = bulletPos.x - enemyPos.x;
        const dy = bulletPos.y - enemyPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          // Collision threshold
          // Remove bullet and enemy
          world.despawn(bulletEntity);
          world.despawn(enemyEntity);

          // Update score
          const gameState = world.getResource(this.gameStateType);
          if (gameState) {
            gameState.score += 10;
          }
        }
      });
    });
  }

  /**
   * Rendering system with conditions.
   */
  private renderingSystem(world: any): void {
    // This would typically interface with a rendering engine
    // For now, we'll just log the entities that need to be rendered
    const query = world.query(this.positionType, this.colorType);

    console.log("Rendering entities:");
    query.forEach((entity: any, position: any, color: any) => {
      console.log(
        `Entity ${entity.index}: pos(${position.x}, ${position.y}), color(${color.r}, ${color.g}, ${color.b})`,
      );
    });
  }

  /**
   * Game state system with conditions.
   */
  private gameStateSystem(world: any): void {
    const gameState = world.getResource(this.gameStateType);
    if (!gameState) return;

    // Check if player is dead
    const playerQuery = world.query(this.playerType, this.healthType);
    let playerAlive = false;

    playerQuery.forEach((entity: any, player: any, health: any) => {
      if (health.current > 0) {
        playerAlive = true;
      }
    });

    if (!playerAlive && !gameState.isGameOver) {
      gameState.isGameOver = true;
      console.log("Game Over! Final Score:", gameState.score);
    }
  }

  /**
   * Handles keyboard input.
   */
  handleKeyDown(key: string): void {
    const inputState = this.world.getResource(this.inputStateType);
    if (inputState) {
      inputState.keys.add(key);
    }
  }

  /**
   * Handles keyboard input release.
   */
  handleKeyUp(key: string): void {
    const inputState = this.world.getResource(this.inputStateType);
    if (inputState) {
      inputState.keys.delete(key);
    }
  }

  /**
   * Gets the current game state.
   */
  getGameState(): GameState | undefined {
    return this.world.getResource(this.gameStateType);
  }

  /**
   * Gets the current score.
   */
  getScore(): number {
    const gameState = this.getGameState();
    return gameState ? gameState.score : 0;
  }

  /**
   * Gets the number of entities in the world.
   */
  getEntityCount(): number {
    return this.world.getEntityCount();
  }

  /**
   * Spawns a new enemy at a random position.
   */
  spawnEnemy(): void {
    const enemy = this.world.spawn(
      new Position(Math.random() * 800, -50),
      new Velocity(0, 50),
      new Health(50, 50),
      new Enemy("Basic"),
      new Color(1, 0, 0), // Red
      new Size(25, 25),
    );
  }
}

/**
 * Creates and returns a new advanced ECS game instance.
 */
export function createAdvancedECSGame(): AdvancedECSGame {
  return new AdvancedECSGame();
}
