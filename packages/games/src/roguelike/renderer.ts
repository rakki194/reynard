// Pixel art renderer for rogue-like game

import { Entity, World } from "../ecs/types";
import { EnemyType, Health, HealthType, PlayerType, Position, PositionType, RoguelikeItemType, Sprite, SpriteType, Stats, StatsType } from "./components";
import { Camera, CameraType, DungeonMap, DungeonMapType, GameConfig, GameConfigType, GameTime, GameTimeType, MessageLog, MessageLogType } from "./resources";

export class PixelArtRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private tileSize: number;
    private fontFamily: string;
    private fontSize: number;

    constructor(canvas: HTMLCanvasElement, config: GameConfig) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.tileSize = config.tileSize;
        this.fontFamily = config.fontFamily;
        this.fontSize = config.fontSize;

        this.setupCanvas();
    }

    private setupCanvas(): void {
        this.ctx.imageSmoothingEnabled = false; // Pixel perfect rendering
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }

    render(world: World): void {
        const dungeon = world.getResource(DungeonMapType) as DungeonMap;
        const camera = world.getResource(CameraType) as Camera;
        const config = world.getResource(GameConfigType) as GameConfig;
        const messageLog = world.getResource(MessageLogType) as MessageLog;

        if (!dungeon || !camera || !config) return;

        // Clear canvas
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate visible area
        const tilesX = Math.floor(this.canvas.width / this.tileSize);
        const tilesY = Math.floor(this.canvas.height / this.tileSize);

        const startX = Math.max(0, camera.x - Math.floor(tilesX / 2));
        const startY = Math.max(0, camera.y - Math.floor(tilesY / 2));
        const endX = Math.min(dungeon.width, startX + tilesX);
        const endY = Math.min(dungeon.height, startY + tilesY);

        // Render dungeon tiles
        this.renderDungeon(dungeon, startX, startY, endX, endY, camera);

        // Render entities
        this.renderEntities(world, startX, startY, endX, endY, camera);

        // Render UI
        this.renderUI(world, messageLog);
    }

    private renderDungeon(
        dungeon: DungeonMap,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        _camera: Camera
    ): void {
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = dungeon.tiles[y][x];

                if (!tile.explored) continue;

                const screenX = (x - startX) * this.tileSize;
                const screenY = (y - startY) * this.tileSize;

                if (tile.visible) {
                    // Visible tiles - bright colors
                    this.renderTile(x, y, tile.type, screenX, screenY, true);
                } else {
                    // Explored but not visible - dim colors
                    this.renderTile(x, y, tile.type, screenX, screenY, false);
                }
            }
        }
    }

    private renderTile(_x: number, _y: number, type: string, screenX: number, screenY: number, visible: boolean): void {
        const alpha = visible ? 1.0 : 0.3;

        switch (type) {
            case "floor":
                this.ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                break;

            case "wall":
                this.ctx.fillStyle = `rgba(50, 50, 50, ${alpha})`;
                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                // Add wall texture
                this.ctx.fillStyle = `rgba(70, 70, 70, ${alpha})`;
                this.ctx.fillRect(screenX + 1, screenY + 1, this.tileSize - 2, this.tileSize - 2);
                break;

            case "door":
                this.ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                break;

            case "stairs":
                this.ctx.fillStyle = `rgba(150, 150, 150, ${alpha})`;
                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                // Draw stairs symbol
                this.ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
                this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
                this.ctx.fillText(">", screenX + this.tileSize / 2, screenY + this.tileSize / 2);
                break;
        }
    }

    private renderEntities(
        world: World,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        _camera: Camera
    ): void {
        // Render items first (so they appear behind entities)
        const itemQuery = world.query(PositionType, SpriteType, RoguelikeItemType);
        itemQuery.forEach((_entity: Entity, position: any, sprite: any) => {
            const pos = position as Position;
            const spr = sprite as Sprite;
            if (pos.x >= startX && pos.x < endX &&
                pos.y >= startY && pos.y < endY) {
                const screenX = (pos.x - startX) * this.tileSize;
                const screenY = (pos.y - startY) * this.tileSize;
                this.renderEntity(spr, screenX, screenY);
            }
        });

        // Render enemies
        const enemyQuery = world.query(PositionType, SpriteType, EnemyType);
        enemyQuery.forEach((_entity: Entity, position: any, sprite: any) => {
            const pos = position as Position;
            const spr = sprite as Sprite;
            if (pos.x >= startX && pos.x < endX &&
                pos.y >= startY && pos.y < endY) {
                const screenX = (pos.x - startX) * this.tileSize;
                const screenY = (pos.y - startY) * this.tileSize;
                this.renderEntity(spr, screenX, screenY);
            }
        });

        // Render player last (so they appear on top)
        const playerQuery = world.query(PositionType, SpriteType, PlayerType);
        playerQuery.forEach((_entity: Entity, position: any, sprite: any) => {
            const pos = position as Position;
            const spr = sprite as Sprite;
            if (pos.x >= startX && pos.x < endX &&
                pos.y >= startY && pos.y < endY) {
                const screenX = (pos.x - startX) * this.tileSize;
                const screenY = (pos.y - startY) * this.tileSize;
                this.renderEntity(spr, screenX, screenY);
            }
        });
    }

    private renderEntity(sprite: Sprite, screenX: number, screenY: number): void {
        // Draw background
        this.ctx.fillStyle = sprite.bg;
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

        // Draw character
        this.ctx.fillStyle = sprite.fg;
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.fillText(
            sprite.char,
            screenX + this.tileSize / 2,
            screenY + this.tileSize / 2
        );
    }

    private renderUI(world: World, messageLog: MessageLog | null): void {
        const config = world.getResource(GameConfigType) as GameConfig;
        if (!config) return;

        // Render message log
        if (messageLog && messageLog.messages.length > 0) {
            this.renderMessageLog(messageLog);
        }

        // Render player stats
        this.renderPlayerStats(world);

        // Render FPS if enabled
        if (config.showFPS) {
            this.renderFPS(world);
        }
    }

    private renderMessageLog(messageLog: MessageLog): void {
        const maxMessages = 5;
        const startIndex = Math.max(0, messageLog.messages.length - maxMessages);
        const recentMessages = messageLog.messages.slice(startIndex);

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(10, this.canvas.height - 120, 400, 110);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "12px monospace";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";

        recentMessages.forEach((message, index) => {
            this.ctx.fillStyle = message.color;
            this.ctx.fillText(
                message.text,
                15,
                this.canvas.height - 110 + index * 20
            );
        });

        // Reset text alignment
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }

    private renderPlayerStats(world: World): void {
        const playerQuery = world.query(PositionType, SpriteType, PlayerType);
        const healthQuery = world.query(HealthType, PlayerType);
        const statsQuery = world.query(StatsType, PlayerType);

        let playerEntity: any = null;
        let position: Position | null = null;
        let _sprite: Sprite | null = null;

        playerQuery.forEach((entity: Entity, pos: any, spr: any) => {
            playerEntity = entity;
            position = pos as Position;
            _sprite = spr as Sprite;
        });

        if (!playerEntity || !position) return;

        let health: Health | null = null;
        let stats: Stats | null = null;

        healthQuery.forEach((entity: Entity, h: any) => {
            if (entity === playerEntity) {
                health = h as Health;
            }
        });

        statsQuery.forEach((entity: Entity, s: any) => {
            if (entity === playerEntity) {
                stats = s as Stats;
            }
        });

        // Type assertions to help TypeScript understand the types
        const pos = position as Position;
        const healthComp = health as Health | null;
        const statsComp = stats as Stats | null;

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(10, 10, 200, 100);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "12px monospace";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";

        let y = 20;
        this.ctx.fillText(`Position: ${pos.x}, ${pos.y}`, 15, y);
        y += 15;

        if (healthComp) {
            this.ctx.fillText(`Health: ${healthComp.current}/${healthComp.max}`, 15, y);
            y += 15;
        }

        if (statsComp) {
            this.ctx.fillText(`Level: ${statsComp.level}`, 15, y);
            y += 15;
            this.ctx.fillText(`XP: ${statsComp.experience}`, 15, y);
        }

        // Reset text alignment
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }

    private renderFPS(world: World): void {
        const gameTime = world.getResource(GameTimeType) as GameTime;
        if (!gameTime) return;

        const fps = gameTime.deltaTime > 0 ? Math.round(1000 / gameTime.deltaTime) : 0;

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(this.canvas.width - 80, 10, 70, 25);

        this.ctx.fillStyle = "#00ff00";
        this.ctx.font = "12px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`FPS: ${fps}`, this.canvas.width - 45, 22);
    }

    resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.setupCanvas();
    }
}
