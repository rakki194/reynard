// Main rogue-like game class using ECS

import { ComponentType, createWorld, ResourceType, system } from "../ecs/index";

import {
  AI,
  AIType,
  DungeonLevel,
  DungeonLevelType,
  Enemy,
  EnemyType,
  Equipment,
  EquipmentType,
  Health,
  HealthType,
  Inventory,
  InventoryType,
  Movement,
  MovementType,
  Player,
  PlayerType,
  Position,
  PositionType,
  RoguelikeItem,
  RoguelikeItemType,
  Sprite,
  SpriteType,
  Stats,
  StatsType,
  Tile,
  TileType,
  Vision,
  VisionType,
} from "./components";

import {
  Camera,
  CameraType,
  DungeonMap,
  DungeonMapType,
  GameConfig,
  GameConfigType,
  GameState,
  GameStateType,
  GameTime,
  GameTimeType,
  MessageLog,
  MessageLogType,
  PlayerInput,
  PlayerInputType,
} from "./resources";

import { aiSystem, combatSystem, gameStateSystem, inputSystem, itemSystem, visionSystem } from "./systems";

import { DungeonGenerator } from "./dungeon-generator";
import { PixelArtRenderer } from "./renderer";

export class RoguelikeGame {
  private world: any;
  private renderer: PixelArtRenderer;
  private gameLoop: number | null = null;
  private lastTime = 0;
  private canvas: HTMLCanvasElement;

  // Component types
  private positionType!: ComponentType<Position>;
  private spriteType!: ComponentType<Sprite>;
  private healthType!: ComponentType<Health>;
  private aiType!: ComponentType<AI>;
  private visionType!: ComponentType<Vision>;
  private movementType!: ComponentType<Movement>;
  private playerType!: ComponentType<Player>;
  private enemyType!: ComponentType<Enemy>;
  private itemType!: ComponentType<RoguelikeItem>;
  private tileType!: ComponentType<Tile>;
  private statsType!: ComponentType<Stats>;
  private inventoryType!: ComponentType<Inventory>;
  private equipmentType!: ComponentType<Equipment>;
  private dungeonLevelType!: ComponentType<DungeonLevel>;

  // Resource types
  private gameStateType!: ResourceType<GameState>;
  private dungeonMapType!: ResourceType<DungeonMap>;
  private playerInputType!: ResourceType<PlayerInput>;
  private cameraType!: ResourceType<Camera>;
  private messageLogType!: ResourceType<MessageLog>;
  private gameConfigType!: ResourceType<GameConfig>;
  private gameTimeType!: ResourceType<GameTime>;

  constructor(canvas: HTMLCanvasElement) {
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

  private setupComponentTypes(): void {
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

  private setupResourceTypes(): void {
    const registry = this.world.getResourceRegistry();

    this.gameStateType = registry.register(GameStateType);
    this.dungeonMapType = registry.register(DungeonMapType);
    this.playerInputType = registry.register(PlayerInputType);
    this.cameraType = registry.register(CameraType);
    this.messageLogType = registry.register(MessageLogType);
    this.gameConfigType = registry.register(GameConfigType);
    this.gameTimeType = registry.register(GameTimeType);
  }

  private setupSystems(): void {
    // Add systems directly to the world
    this.world.addSystem(system("input", inputSystem).build());
    this.world.addSystem(system("vision", visionSystem).build());
    this.world.addSystem(system("ai", aiSystem).build());
    this.world.addSystem(system("combat", combatSystem).build());
    this.world.addSystem(system("item", itemSystem).build());
    this.world.addSystem(system("gameState", gameStateSystem).build());
  }

  private setupInitialGame(): void {
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
    const messageLog = this.world.getResource(MessageLogType) as MessageLog;
    if (messageLog) {
      messageLog.messages.push({
        text: "Welcome to the dungeon! Use WASD or arrow keys to move.", // TODO: i18n
        color: "#4ecdc4",
        timestamp: Date.now(),
      });
    }
  }

  private generateNewDungeon(): void {
    const generator = new DungeonGenerator(80, 25, 4, 12, 15);
    const dungeon = generator.generateVariedDungeon();
    this.world.insertResource(dungeon);
  }

  private createPlayer(): void {
    const dungeon = this.world.getResource(DungeonMapType) as DungeonMap;
    if (!dungeon) return;

    // Find a suitable starting position (in a room)
    let startX = 0,
      startY = 0;
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

  private createEnemies(): void {
    const dungeon = this.world.getResource(DungeonMapType) as DungeonMap;
    if (!dungeon) return;

    const enemyTypes = [
      {
        char: "g",
        fg: "#ff0000",
        bg: "#000000",
        health: 30,
        ai: "wander" as const,
      },
      {
        char: "o",
        fg: "#ff8800",
        bg: "#000000",
        health: 50,
        ai: "aggressive" as const,
      },
      {
        char: "T",
        fg: "#8800ff",
        bg: "#000000",
        health: 80,
        ai: "guard" as const,
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
        this.world.insertComponent(
          enemyEntity,
          this.spriteType,
          new Sprite(enemyType.char, enemyType.fg, enemyType.bg)
        );
        this.world.insertComponent(enemyEntity, this.healthType, new Health(enemyType.health, enemyType.health));
        this.world.insertComponent(enemyEntity, this.aiType, new AI(enemyType.ai));
        this.world.insertComponent(enemyEntity, this.movementType, new Movement(1));
        this.world.insertComponent(enemyEntity, this.enemyType, new Enemy(enemyType.char));
      }
    }
  }

  private createItems(): void {
    const dungeon = this.world.getResource(DungeonMapType) as DungeonMap;
    if (!dungeon) return;

    const itemTypes = [
      {
        name: "Health Potion",
        char: "!",
        fg: "#ff0000",
        bg: "#000000",
        type: "potion" as const,
      },
      {
        name: "Magic Scroll",
        char: "?",
        fg: "#00ff00",
        bg: "#000000",
        type: "scroll" as const,
      },
      {
        name: "Gold Coin",
        char: "$",
        fg: "#ffff00",
        bg: "#000000",
        type: "food" as const,
      },
      {
        name: "Iron Sword",
        char: ")",
        fg: "#888888",
        bg: "#000000",
        type: "weapon" as const,
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
        this.world.insertComponent(
          itemEntity,
          this.itemType,
          new RoguelikeItem(itemType.name, itemType.type, 10, "A useful item")
        );
      }
    }
  }

  private setupInputHandlers(): void {
    const input = this.world.getResource(PlayerInputType) as PlayerInput;
    if (!input) return;

    // Keyboard input
    document.addEventListener("keydown", event => {
      input.keys.add(event.key);
      input.lastKey = event.key;

      // Handle special keys
      if (event.key === "r" || event.key === "R") {
        this.restartGame();
      }
    });

    document.addEventListener("keyup", event => {
      input.keys.delete(event.key);
    });

    // Mouse input
    this.canvas.addEventListener("mousemove", event => {
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

  private restartGame(): void {
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
    const messageLog = this.world.getResource(MessageLogType) as MessageLog;
    if (messageLog) {
      messageLog.messages.push({
        text: "Game restarted! Good luck!",
        color: "#4ecdc4",
        timestamp: Date.now(),
      });
    }
  }

  start(): void {
    if (this.gameLoop) return;

    this.lastTime = performance.now();
    this.gameLoop = requestAnimationFrame(time => this.update(time));
  }

  stop(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private update(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game time
    const gameTime = this.world.getResource(GameTimeType) as GameTime;
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
    this.gameLoop = requestAnimationFrame(time => this.update(time));
  }

  resize(width: number, height: number): void {
    this.renderer.resize(width, height);
  }
}
