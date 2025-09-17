// Main rogue-like game class using ECS
import { createWorld, system } from "../ecs/index";
import { AI, AIType, DungeonLevelType, Enemy, EnemyType, Equipment, EquipmentType, Health, HealthType, Inventory, InventoryType, Movement, MovementType, Player, PlayerType, Position, PositionType, RoguelikeItem, RoguelikeItemType, Sprite, SpriteType, Stats, StatsType, TileType, Vision, VisionType, } from "./components";
import { Camera, CameraType, DungeonMapType, GameConfig, GameConfigType, GameState, GameStateType, GameTime, GameTimeType, MessageLog, MessageLogType, PlayerInput, PlayerInputType, } from "./resources";
import { aiSystem, combatSystem, gameStateSystem, inputSystem, itemSystem, visionSystem, } from "./systems";
import { DungeonGenerator } from "./dungeon-generator";
import { PixelArtRenderer } from "./renderer";
export class RoguelikeGame {
    constructor(canvas) {
        Object.defineProperty(this, "world", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "renderer", {
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
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Component types
        Object.defineProperty(this, "positionType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "spriteType", {
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
        Object.defineProperty(this, "aiType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "visionType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "movementType", {
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
        Object.defineProperty(this, "itemType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tileType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "statsType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inventoryType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "equipmentType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dungeonLevelType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Resource types
        Object.defineProperty(this, "gameStateType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dungeonMapType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "playerInputType", {
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
        Object.defineProperty(this, "messageLogType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gameConfigType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gameTimeType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.canvas = canvas;
        this.world = createWorld();
        this.setupComponentTypes();
        this.setupResourceTypes();
        this.setupSystems();
        this.setupInitialGame();
        this.setupInputHandlers();
        const config = this.world.getResource(GameConfig);
        this.renderer = new PixelArtRenderer(canvas, config);
    }
    setupComponentTypes() {
        const registry = this.world.getComponentRegistry();
        this.positionType = registry.register(PositionType);
        this.spriteType = registry.register(SpriteType);
        this.healthType = registry.register(HealthType);
        this.aiType = registry.register(AIType);
        this.visionType = registry.register(VisionType);
        this.movementType = registry.register(MovementType);
        this.playerType = registry.register(PlayerType);
        this.enemyType = registry.register(EnemyType);
        this.itemType = registry.register(RoguelikeItemType);
        this.tileType = registry.register(TileType);
        this.statsType = registry.register(StatsType);
        this.inventoryType = registry.register(InventoryType);
        this.equipmentType = registry.register(EquipmentType);
        this.dungeonLevelType = registry.register(DungeonLevelType);
    }
    setupResourceTypes() {
        const registry = this.world.getResourceRegistry();
        this.gameStateType = registry.register(GameStateType);
        this.dungeonMapType = registry.register(DungeonMapType);
        this.playerInputType = registry.register(PlayerInputType);
        this.cameraType = registry.register(CameraType);
        this.messageLogType = registry.register(MessageLogType);
        this.gameConfigType = registry.register(GameConfigType);
        this.gameTimeType = registry.register(GameTimeType);
    }
    setupSystems() {
        const systems = [
            system(inputSystem),
            system(visionSystem),
            system(aiSystem),
            system(combatSystem),
            system(itemSystem),
            system(gameStateSystem),
        ];
        const schedule = this.world.getSchedule();
        schedule.addSystems(systems);
    }
    setupInitialGame() {
        // Create game resources
        this.world.insertResource(new GameState("playing"));
        this.world.insertResource(new PlayerInput());
        this.world.insertResource(new Camera(40, 12));
        this.world.insertResource(new MessageLog());
        this.world.insertResource(new GameConfig(16, 1280, 720));
        this.world.insertResource(new GameTime());
        // Generate dungeon
        this.generateNewDungeon();
        // Create player
        this.createPlayer();
        // Create some enemies
        this.createEnemies();
        // Create some items
        this.createItems();
        // Add welcome message
        const messageLog = this.world.getResource(MessageLogType);
        if (messageLog) {
            messageLog.messages.push({
                text: "Welcome to the dungeon! Use WASD or arrow keys to move.", // TODO: i18n
                color: "#4ecdc4",
                timestamp: Date.now(),
            });
        }
    }
    generateNewDungeon() {
        const generator = new DungeonGenerator(80, 25, 4, 12, 15);
        const dungeon = generator.generateVariedDungeon();
        this.world.insertResource(dungeon);
    }
    createPlayer() {
        const dungeon = this.world.getResource(DungeonMapType);
        if (!dungeon)
            return;
        // Find a suitable starting position (in a room)
        let startX = 0, startY = 0;
        for (const room of dungeon.rooms) {
            if (room.width > 4 && room.height > 4) {
                startX = room.x + Math.floor(room.width / 2);
                startY = room.y + Math.floor(room.height / 2);
                break;
            }
        }
        const playerEntity = this.world.spawn();
        this.world.insertComponent(playerEntity, this.positionType, new Position(startX, startY));
        this.world.insertComponent(playerEntity, this.spriteType, new Sprite("@", "#ffff00", "#000000"));
        this.world.insertComponent(playerEntity, this.healthType, new Health(100, 100));
        this.world.insertComponent(playerEntity, this.visionType, new Vision(8));
        this.world.insertComponent(playerEntity, this.movementType, new Movement(1));
        this.world.insertComponent(playerEntity, this.playerType, new Player("Hero"));
        this.world.insertComponent(playerEntity, this.statsType, new Stats(1, 0, 12, 14, 13, 10));
        this.world.insertComponent(playerEntity, this.inventoryType, new Inventory());
        this.world.insertComponent(playerEntity, this.equipmentType, new Equipment());
    }
    createEnemies() {
        const dungeon = this.world.getResource(DungeonMapType);
        if (!dungeon)
            return;
        const enemyTypes = [
            {
                char: "g",
                fg: "#ff0000",
                bg: "#000000",
                health: 30,
                ai: "wander",
            },
            {
                char: "o",
                fg: "#ff8800",
                bg: "#000000",
                health: 50,
                ai: "aggressive",
            },
            {
                char: "T",
                fg: "#8800ff",
                bg: "#000000",
                health: 80,
                ai: "guard",
            },
        ];
        // Place enemies in rooms (not in the starting room)
        for (let i = 1; i < dungeon.rooms.length && i < 8; i++) {
            const room = dungeon.rooms[i];
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const x = room.x + Math.floor(Math.random() * room.width);
            const y = room.y + Math.floor(Math.random() * room.height);
            if (dungeon.tiles[y][x].type === "floor") {
                const enemyEntity = this.world.spawn();
                this.world.insertComponent(enemyEntity, this.positionType, new Position(x, y));
                this.world.insertComponent(enemyEntity, this.spriteType, new Sprite(enemyType.char, enemyType.fg, enemyType.bg));
                this.world.insertComponent(enemyEntity, this.healthType, new Health(enemyType.health, enemyType.health));
                this.world.insertComponent(enemyEntity, this.aiType, new AI(enemyType.ai));
                this.world.insertComponent(enemyEntity, this.movementType, new Movement(1));
                this.world.insertComponent(enemyEntity, this.enemyType, new Enemy(enemyType.char));
            }
        }
    }
    createItems() {
        const dungeon = this.world.getResource(DungeonMapType);
        if (!dungeon)
            return;
        const itemTypes = [
            {
                name: "Health Potion",
                char: "!",
                fg: "#ff0000",
                bg: "#000000",
                type: "potion",
            },
            {
                name: "Magic Scroll",
                char: "?",
                fg: "#00ff00",
                bg: "#000000",
                type: "scroll",
            },
            {
                name: "Gold Coin",
                char: "$",
                fg: "#ffff00",
                bg: "#000000",
                type: "food",
            },
            {
                name: "Iron Sword",
                char: ")",
                fg: "#888888",
                bg: "#000000",
                type: "weapon",
            },
        ];
        // Place items in rooms
        for (let i = 1; i < dungeon.rooms.length && i < 6; i++) {
            const room = dungeon.rooms[i];
            const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            const x = room.x + Math.floor(Math.random() * room.width);
            const y = room.y + Math.floor(Math.random() * room.height);
            if (dungeon.tiles[y][x].type === "floor") {
                const itemEntity = this.world.spawn();
                this.world.insertComponent(itemEntity, this.positionType, new Position(x, y));
                this.world.insertComponent(itemEntity, this.spriteType, new Sprite(itemType.char, itemType.fg, itemType.bg));
                this.world.insertComponent(itemEntity, this.itemType, new RoguelikeItem(itemType.name, itemType.type, 10, "A useful item"));
            }
        }
    }
    setupInputHandlers() {
        const input = this.world.getResource(PlayerInputType);
        if (!input)
            return;
        // Keyboard input
        document.addEventListener("keydown", (event) => {
            input.keys.add(event.key);
            input.lastKey = event.key;
            // Handle special keys
            if (event.key === "r" || event.key === "R") {
                this.restartGame();
            }
        });
        document.addEventListener("keyup", (event) => {
            input.keys.delete(event.key);
        });
        // Mouse input
        this.canvas.addEventListener("mousemove", (event) => {
            const rect = this.canvas.getBoundingClientRect();
            input.mouseX = event.clientX - rect.left;
            input.mouseY = event.clientY - rect.top;
        });
        this.canvas.addEventListener("mousedown", () => {
            input.mousePressed = true;
        });
        this.canvas.addEventListener("mouseup", () => {
            input.mousePressed = false;
        });
    }
    restartGame() {
        // Clear all entities
        this.world.clear();
        // Reset resources
        this.world.insertResource(new GameState("playing"));
        this.world.insertResource(new PlayerInput());
        this.world.insertResource(new Camera(40, 12));
        this.world.insertResource(new MessageLog());
        // Generate new dungeon and entities
        this.generateNewDungeon();
        this.createPlayer();
        this.createEnemies();
        this.createItems();
        // Add restart message
        const messageLog = this.world.getResource(MessageLogType);
        if (messageLog) {
            messageLog.messages.push({
                text: "Game restarted! Good luck!",
                color: "#4ecdc4",
                timestamp: Date.now(),
            });
        }
    }
    start() {
        if (this.gameLoop)
            return;
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    stop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    update(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        // Update game time
        const gameTime = this.world.getResource(GameTimeType);
        if (gameTime) {
            gameTime.deltaTime = deltaTime;
            gameTime.totalTime += deltaTime;
            gameTime.lastUpdate = currentTime;
        }
        // Run ECS systems
        this.world.run();
        // Render
        this.renderer.render(this.world);
        // Continue game loop
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }
    resize(width, height) {
        this.renderer.resize(width, height);
    }
}
