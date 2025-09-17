// Complete ECS game example
import { createWorld, schedule, StorageType, system, systemSet, } from "../index";
import { Bullet, Camera, Color, Damage, Enemy, GameState, GameTime, Health, InputState, Player, Position, Size, Velocity, } from "./components";
import { collisionSystem, damageSystem, enemyAISystem, gameStateSystem, lifetimeSystem, movementSystem, playerInputSystem, renderingSystem, shootingSystem, } from "./systems";
/**
 * ECS Game class that demonstrates a complete game setup.
 */
export class ECSGame {
    constructor() {
        Object.defineProperty(this, "world", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gameLoop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "lastTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        // Component types
        Object.defineProperty(this, "positionType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "velocityType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "healthType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "damageType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "playerType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "enemyType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bulletType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "colorType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sizeType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Resource types
        Object.defineProperty(this, "gameTimeType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gameStateType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputStateType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cameraType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.world = createWorld();
        this.setupComponentTypes();
        this.setupResourceTypes();
        this.setupSystems();
        this.setupInitialEntities();
    }
    setupComponentTypes() {
        const registry = this.world.getComponentRegistry();
        this.positionType = registry.register("Position", StorageType.Table, () => new Position(0, 0));
        this.velocityType = registry.register("Velocity", StorageType.Table, () => new Velocity(0, 0));
        this.healthType = registry.register("Health", StorageType.Table, () => new Health(100, 100));
        this.damageType = registry.register("Damage", StorageType.Table, () => new Damage(10));
        this.playerType = registry.register("Player", StorageType.Table, () => new Player("Player1"));
        this.enemyType = registry.register("Enemy", StorageType.Table, () => new Enemy("Basic"));
        this.bulletType = registry.register("Bullet", StorageType.Table, () => new Bullet(300));
        this.colorType = registry.register("Color", StorageType.Table, () => new Color(1, 1, 1));
        this.sizeType = registry.register("Size", StorageType.Table, () => new Size(20, 20));
    }
    setupResourceTypes() {
        const registry = this.world.getResourceRegistry();
        this.gameTimeType = registry.register("GameTime", () => new GameTime(0, 0));
        this.gameStateType = registry.register("GameState", () => new GameState(0, 1));
        this.inputStateType = registry.register("InputState", () => new InputState());
        this.cameraType = registry.register("Camera", () => new Camera(0, 0, 1));
    }
    setupSystems() {
        // Create system sets for organization
        const inputSet = systemSet("input");
        const updateSet = systemSet("update");
        const renderSet = systemSet("render");
        // Add systems to sets
        inputSet.add("playerInput").add("shooting");
        updateSet
            .add("movement")
            .add("lifetime")
            .add("damage")
            .add("enemyAI")
            .add("collision")
            .add("gameState");
        renderSet.add("rendering");
        // Create and add systems
        this.world.addSystem(system("playerInput", playerInputSystem).build());
        this.world.addSystem(system("shooting", shootingSystem).build());
        this.world.addSystem(system("movement", movementSystem).build());
        this.world.addSystem(system("lifetime", lifetimeSystem).build());
        this.world.addSystem(system("damage", damageSystem).build());
        this.world.addSystem(system("enemyAI", enemyAISystem).build());
        this.world.addSystem(system("collision", collisionSystem).build());
        this.world.addSystem(system("gameState", gameStateSystem).build());
        this.world.addSystem(system("rendering", renderingSystem).build());
        // Create main schedule
        const mainSchedule = schedule("main");
        mainSchedule.addSystem(system("playerInput", playerInputSystem).build());
        mainSchedule.addSystem(system("shooting", shootingSystem).build());
        mainSchedule.addSystem(system("movement", movementSystem).build());
        mainSchedule.addSystem(system("lifetime", lifetimeSystem).build());
        mainSchedule.addSystem(system("damage", damageSystem).build());
        mainSchedule.addSystem(system("enemyAI", enemyAISystem).build());
        mainSchedule.addSystem(system("collision", collisionSystem).build());
        mainSchedule.addSystem(system("gameState", gameStateSystem).build());
        mainSchedule.addSystem(system("rendering", renderingSystem).build());
    }
    setupInitialEntities() {
        // Create player
        const player = this.world.spawn(new Position(400, 500), new Velocity(0, 0), new Health(100, 100), new Player("Player1"), new Color(0, 0, 1), // Blue
        new Size(30, 30));
        // Create some enemies
        for (let i = 0; i < 5; i++) {
            const enemy = this.world.spawn(new Position(Math.random() * 800, Math.random() * 200), new Velocity(0, 0), new Health(50, 50), new Enemy("Basic"), new Color(1, 0, 0), // Red
            new Size(25, 25));
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
    start() {
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    /**
     * Stops the game loop.
     */
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    /**
     * Updates the game state.
     */
    update(currentTime) {
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
     * Handles keyboard input.
     */
    handleKeyDown(key) {
        const inputState = this.world.getResource(this.inputStateType);
        if (inputState) {
            inputState.keys.add(key);
        }
    }
    /**
     * Handles keyboard input release.
     */
    handleKeyUp(key) {
        const inputState = this.world.getResource(this.inputStateType);
        if (inputState) {
            inputState.keys.delete(key);
        }
    }
    /**
     * Gets the current game state.
     */
    getGameState() {
        return this.world.getResource(this.gameStateType);
    }
    /**
     * Gets the current score.
     */
    getScore() {
        const gameState = this.getGameState();
        return gameState ? gameState.score : 0;
    }
    /**
     * Gets the number of entities in the world.
     */
    getEntityCount() {
        return this.world.getEntityCount();
    }
    /**
     * Spawns a new enemy at a random position.
     */
    spawnEnemy() {
        const enemy = this.world.spawn(new Position(Math.random() * 800, -50), new Velocity(0, 50), new Health(50, 50), new Enemy("Basic"), new Color(1, 0, 0), // Red
        new Size(25, 25));
    }
}
/**
 * Creates and returns a new ECS game instance.
 */
export function createECSGame() {
    return new ECSGame();
}
