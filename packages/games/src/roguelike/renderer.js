// Pixel art renderer for rogue-like game
import { EnemyType, HealthType, PlayerType, PositionType, RoguelikeItemType, SpriteType, StatsType, } from "./components";
import { CameraType, DungeonMapType, GameConfigType, GameTimeType, MessageLogType, } from "./resources";
export class PixelArtRenderer {
    constructor(canvas, config) {
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ctx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tileSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fontFamily", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fontSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tileSize = config.tileSize;
        this.fontFamily = config.fontFamily;
        this.fontSize = config.fontSize;
        this.setupCanvas();
    }
    setupCanvas() {
        this.ctx.imageSmoothingEnabled = false; // Pixel perfect rendering
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }
    render(world) {
        const dungeon = world.getResource(DungeonMapType);
        const camera = world.getResource(CameraType);
        const config = world.getResource(GameConfigType);
        const messageLog = world.getResource(MessageLogType);
        if (!dungeon || !camera || !config)
            return;
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
    renderDungeon(dungeon, startX, startY, endX, endY, _camera) {
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = dungeon.tiles[y][x];
                if (!tile.explored)
                    continue;
                const screenX = (x - startX) * this.tileSize;
                const screenY = (y - startY) * this.tileSize;
                if (tile.visible) {
                    // Visible tiles - bright colors
                    this.renderTile(x, y, tile.type, screenX, screenY, true);
                }
                else {
                    // Explored but not visible - dim colors
                    this.renderTile(x, y, tile.type, screenX, screenY, false);
                }
            }
        }
    }
    renderTile(_x, _y, type, screenX, screenY, visible) {
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
    renderEntities(world, startX, startY, endX, endY, _camera) {
        // Render items first (so they appear behind entities)
        const itemQuery = world.query(PositionType, SpriteType, RoguelikeItemType);
        itemQuery.forEach((_entity, position, sprite) => {
            const pos = position;
            const spr = sprite;
            if (pos.x >= startX && pos.x < endX && pos.y >= startY && pos.y < endY) {
                const screenX = (pos.x - startX) * this.tileSize;
                const screenY = (pos.y - startY) * this.tileSize;
                this.renderEntity(spr, screenX, screenY);
            }
        });
        // Render enemies
        const enemyQuery = world.query(PositionType, SpriteType, EnemyType);
        enemyQuery.forEach((_entity, position, sprite) => {
            const pos = position;
            const spr = sprite;
            if (pos.x >= startX && pos.x < endX && pos.y >= startY && pos.y < endY) {
                const screenX = (pos.x - startX) * this.tileSize;
                const screenY = (pos.y - startY) * this.tileSize;
                this.renderEntity(spr, screenX, screenY);
            }
        });
        // Render player last (so they appear on top)
        const playerQuery = world.query(PositionType, SpriteType, PlayerType);
        playerQuery.forEach((_entity, position, sprite) => {
            const pos = position;
            const spr = sprite;
            if (pos.x >= startX && pos.x < endX && pos.y >= startY && pos.y < endY) {
                const screenX = (pos.x - startX) * this.tileSize;
                const screenY = (pos.y - startY) * this.tileSize;
                this.renderEntity(spr, screenX, screenY);
            }
        });
    }
    renderEntity(sprite, screenX, screenY) {
        // Draw background
        this.ctx.fillStyle = sprite.bg;
        this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
        // Draw character
        this.ctx.fillStyle = sprite.fg;
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.fillText(sprite.char, screenX + this.tileSize / 2, screenY + this.tileSize / 2);
    }
    renderUI(world, messageLog) {
        const config = world.getResource(GameConfigType);
        if (!config)
            return;
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
    renderMessageLog(messageLog) {
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
            this.ctx.fillText(message.text, 15, this.canvas.height - 110 + index * 20);
        });
        // Reset text alignment
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    }
    renderPlayerStats(world) {
        const playerQuery = world.query(PositionType, SpriteType, PlayerType);
        const healthQuery = world.query(HealthType, PlayerType);
        const statsQuery = world.query(StatsType, PlayerType);
        let playerEntity = null;
        let position = null;
        let _sprite = null;
        playerQuery.forEach((entity, pos, spr) => {
            playerEntity = entity;
            position = pos;
            _sprite = spr;
        });
        if (!playerEntity || !position)
            return;
        let health = null;
        let stats = null;
        healthQuery.forEach((entity, h) => {
            if (entity === playerEntity) {
                health = h;
            }
        });
        statsQuery.forEach((entity, s) => {
            if (entity === playerEntity) {
                stats = s;
            }
        });
        // Type assertions to help TypeScript understand the types
        const pos = position;
        const healthComp = health;
        const statsComp = stats;
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
    renderFPS(world) {
        const gameTime = world.getResource(GameTimeType);
        if (!gameTime)
            return;
        const fps = gameTime.deltaTime > 0 ? Math.round(1000 / gameTime.deltaTime) : 0;
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(this.canvas.width - 80, 10, 70, 25);
        this.ctx.fillStyle = "#00ff00";
        this.ctx.font = "12px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`FPS: ${fps}`, this.canvas.width - 45, 22);
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.setupCanvas();
    }
}
