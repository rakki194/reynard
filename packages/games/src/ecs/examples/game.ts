// Complete ECS game example

import { 
  createWorld, 
  ComponentType, 
  ResourceType, 
  StorageType,
  system,
  schedule,
  systemSet
} from '../index';

import {
  Position,
  Velocity,
  Health,
  Damage,
  Player,
  Enemy,
  Bullet,
  Color,
  Size,
  GameTime,
  GameState,
  InputState,
  Camera
} from './components';

import {
  movementSystem,
  lifetimeSystem,
  damageSystem,
  playerInputSystem,
  enemyAISystem,
  collisionSystem,
  shootingSystem,
  renderingSystem,
  gameStateSystem
} from './systems';

/**
 * ECS Game class that demonstrates a complete game setup.
 */
export class ECSGame {
  private world: any;
  private gameLoop: number | null = null;
  private lastTime = 0;

  // Component types
  private positionType: ComponentType<Position>;
  private velocityType: ComponentType<Velocity>;
  private healthType: ComponentType<Health>;
  private damageType: ComponentType<Damage>;
  private playerType: ComponentType<Player>;
  private enemyType: ComponentType<Enemy>;
  private bulletType: ComponentType<Bullet>;
  private colorType: ComponentType<Color>;
  private sizeType: ComponentType<Size>;

  // Resource types
  private gameTimeType: ResourceType<GameTime>;
  private gameStateType: ResourceType<GameState>;
  private inputStateType: ResourceType<InputState>;
  private cameraType: ResourceType<Camera>;

  constructor() {
    this.world = createWorld();
    this.setupComponentTypes();
    this.setupResourceTypes();
    this.setupSystems();
    this.setupInitialEntities();
  }

  private setupComponentTypes(): void {
    const registry = this.world.getComponentRegistry();
    
    this.positionType = registry.register('Position', StorageType.Table, () => new Position(0, 0));
    this.velocityType = registry.register('Velocity', StorageType.Table, () => new Velocity(0, 0));
    this.healthType = registry.register('Health', StorageType.Table, () => new Health(100, 100));
    this.damageType = registry.register('Damage', StorageType.Table, () => new Damage(10));
    this.playerType = registry.register('Player', StorageType.Table, () => new Player('Player1'));
    this.enemyType = registry.register('Enemy', StorageType.Table, () => new Enemy('Basic'));
    this.bulletType = registry.register('Bullet', StorageType.Table, () => new Bullet(300));
    this.colorType = registry.register('Color', StorageType.Table, () => new Color(1, 1, 1));
    this.sizeType = registry.register('Size', StorageType.Table, () => new Size(20, 20));
  }

  private setupResourceTypes(): void {
    const registry = this.world.getResourceRegistry();
    
    this.gameTimeType = registry.register('GameTime', () => new GameTime(0, 0));
    this.gameStateType = registry.register('GameState', () => new GameState(0, 1));
    this.inputStateType = registry.register('InputState', () => new InputState());
    this.cameraType = registry.register('Camera', () => new Camera(0, 0, 1));
  }

  private setupSystems(): void {
    // Create system sets for organization
    const inputSet = systemSet('input');
    const updateSet = systemSet('update');
    const renderSet = systemSet('render');

    // Add systems to sets
    inputSet.add('playerInput').add('shooting');
    updateSet.add('movement').add('lifetime').add('damage').add('enemyAI').add('collision').add('gameState');
    renderSet.add('rendering');

    // Create and add systems
    this.world.addSystem(system('playerInput', playerInputSystem).build());
    this.world.addSystem(system('shooting', shootingSystem).build());
    this.world.addSystem(system('movement', movementSystem).build());
    this.world.addSystem(system('lifetime', lifetimeSystem).build());
    this.world.addSystem(system('damage', damageSystem).build());
    this.world.addSystem(system('enemyAI', enemyAISystem).build());
    this.world.addSystem(system('collision', collisionSystem).build());
    this.world.addSystem(system('gameState', gameStateSystem).build());
    this.world.addSystem(system('rendering', renderingSystem).build());

    // Create main schedule
    const mainSchedule = schedule('main');
    mainSchedule.addSystem(system('playerInput', playerInputSystem).build());
    mainSchedule.addSystem(system('shooting', shootingSystem).build());
    mainSchedule.addSystem(system('movement', movementSystem).build());
    mainSchedule.addSystem(system('lifetime', lifetimeSystem).build());
    mainSchedule.addSystem(system('damage', damageSystem).build());
    mainSchedule.addSystem(system('enemyAI', enemyAISystem).build());
    mainSchedule.addSystem(system('collision', collisionSystem).build());
    mainSchedule.addSystem(system('gameState', gameStateSystem).build());
    mainSchedule.addSystem(system('rendering', renderingSystem).build());
  }

  private setupInitialEntities(): void {
    // Create player
    const player = this.world.spawn(
      new Position(400, 500),
      new Velocity(0, 0),
      new Health(100, 100),
      new Player('Player1'),
      new Color(0, 0, 1), // Blue
      new Size(30, 30)
    );

    // Create some enemies
    for (let i = 0; i < 5; i++) {
      const enemy = this.world.spawn(
        new Position(Math.random() * 800, Math.random() * 200),
        new Velocity(0, 0),
        new Health(50, 50),
        new Enemy('Basic'),
        new Color(1, 0, 0), // Red
        new Size(25, 25)
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
    this.world.runSchedule('main');

    // Continue the game loop
    this.gameLoop = requestAnimationFrame((time) => this.update(time));
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
      new Enemy('Basic'),
      new Color(1, 0, 0), // Red
      new Size(25, 25)
    );
  }
}

/**
 * Creates and returns a new ECS game instance.
 */
export function createECSGame(): ECSGame {
  return new ECSGame();
}

