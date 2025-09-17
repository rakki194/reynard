import { GameState } from "./components";
/**
 * ECS Game class that demonstrates a complete game setup.
 */
export declare class ECSGame {
    private world;
    private gameLoop;
    private lastTime;
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
 * Creates and returns a new ECS game instance.
 */
export declare function createECSGame(): ECSGame;
