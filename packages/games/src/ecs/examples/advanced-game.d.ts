import { GameState } from "./components";
/**
 * Advanced ECS Game demonstrating all new features.
 */
export declare class AdvancedECSGame {
    private world;
    private gameLoop;
    private lastTime;
    private hookRegistry;
    private taskPool;
    private positionType;
    private velocityType;
    private healthType;
    private damageType;
    private playerType;
    private enemyType;
    private bulletType;
    private colorType;
    private sizeType;
    private gameTimeType;
    private gameStateType;
    private inputStateType;
    private cameraType;
    constructor();
    private setupComponentTypes;
    private setupResourceTypes;
    private setupComponentHooks;
    private setupSystems;
    private setupInitialEntities;
    /**
     * Starts the game loop.
     */
    start(): void;
    /**
     * Stops the game loop.
     */
    stop(): void;
    /**
     * Updates the game state.
     */
    private update;
    /**
     * Player input system with parallel execution.
     */
    private playerInputSystem;
    /**
     * Shooting system with conditions.
     */
    private shootingSystem;
    /**
     * Movement system with parallel execution.
     */
    private movementSystem;
    /**
     * Enemy AI system with conditions.
     */
    private enemyAISystem;
    /**
     * Collision system with parallel execution.
     */
    private collisionSystem;
    /**
     * Rendering system with conditions.
     */
    private renderingSystem;
    /**
     * Game state system with conditions.
     */
    private gameStateSystem;
    /**
     * Handles keyboard input.
     */
    handleKeyDown(key: string): void;
    /**
     * Handles keyboard input release.
     */
    handleKeyUp(key: string): void;
    /**
     * Gets the current game state.
     */
    getGameState(): GameState | undefined;
    /**
     * Gets the current score.
     */
    getScore(): number;
    /**
     * Gets the number of entities in the world.
     */
    getEntityCount(): number;
    /**
     * Spawns a new enemy at a random position.
     */
    spawnEnemy(): void;
}
/**
 * Creates and returns a new advanced ECS game instance.
 */
export declare function createAdvancedECSGame(): AdvancedECSGame;
