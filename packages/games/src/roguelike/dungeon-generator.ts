// Procedural dungeon generation for rogue-like game

import { DungeonMap } from "./resources";

export interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Corridor {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export class DungeonGenerator {
    private width: number;
    private height: number;
    private minRoomSize: number;
    private maxRoomSize: number;
    private maxRooms: number;

    constructor(
        width: number = 80,
        height: number = 25,
        minRoomSize: number = 4,
        maxRoomSize: number = 12,
        maxRooms: number = 15,
    ) {
        this.width = width;
        this.height = height;
        this.minRoomSize = minRoomSize;
        this.maxRoomSize = maxRoomSize;
        this.maxRooms = maxRooms;
    }

    generateDungeon(): DungeonMap {
        const tiles = this.createEmptyMap();
        const rooms: Room[] = [];
        const corridors: Corridor[] = [];

        // Generate rooms
        for (let i = 0; i < this.maxRooms; i++) {
            const room = this.createRandomRoom();
            if (this.isRoomValid(room, rooms)) {
                this.carveRoom(tiles, room);
                rooms.push(room);
            }
        }

        // Connect rooms with corridors
        for (let i = 1; i < rooms.length; i++) {
            const prevRoom = rooms[i - 1];
            const currentRoom = rooms[i];
            const corridor = this.createCorridor(prevRoom, currentRoom);
            this.carveCorridor(tiles, corridor);
            corridors.push(corridor);
        }

        return new DungeonMap(this.width, this.height, tiles, rooms, corridors);
    }

    private createEmptyMap(): Array<Array<{ type: string; explored: boolean; visible: boolean }>> {
        const tiles: Array<Array<{ type: string; explored: boolean; visible: boolean }>> = [];

        for (let y = 0; y < this.height; y++) {
            tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                tiles[y][x] = { type: "wall", explored: false, visible: false };
            }
        }

        return tiles;
    }

    private createRandomRoom(): Room {
        const width = this.randomInt(this.minRoomSize, this.maxRoomSize);
        const height = this.randomInt(this.minRoomSize, this.maxRoomSize);
        const x = this.randomInt(1, this.width - width - 1);
        const y = this.randomInt(1, this.height - height - 1);

        return { x, y, width, height };
    }

    private isRoomValid(room: Room, existingRooms: Room[]): boolean {
        // Check if room is within bounds
        if (room.x < 1 || room.y < 1 ||
            room.x + room.width >= this.width - 1 ||
            room.y + room.height >= this.height - 1) {
            return false;
        }

        // Check if room overlaps with existing rooms
        for (const existingRoom of existingRooms) {
            if (this.roomsOverlap(room, existingRoom)) {
                return false;
            }
        }

        return true;
    }

    private roomsOverlap(room1: Room, room2: Room): boolean {
        return !(room1.x + room1.width < room2.x ||
            room2.x + room2.width < room1.x ||
            room1.y + room1.height < room2.y ||
            room2.y + room2.height < room1.y);
    }

    private carveRoom(
        tiles: Array<Array<{ type: string; explored: boolean; visible: boolean }>>,
        room: Room
    ): void {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                tiles[y][x].type = "floor";
            }
        }
    }

    private createCorridor(room1: Room, room2: Room): Corridor {
        const center1 = {
            x: Math.floor(room1.x + room1.width / 2),
            y: Math.floor(room1.y + room1.height / 2)
        };
        const center2 = {
            x: Math.floor(room2.x + room2.width / 2),
            y: Math.floor(room2.y + room2.height / 2)
        };

        return {
            x1: center1.x,
            y1: center1.y,
            x2: center2.x,
            y2: center2.y
        };
    }

    private carveCorridor(
        tiles: Array<Array<{ type: string; explored: boolean; visible: boolean }>>,
        corridor: Corridor
    ): void {
        // Create L-shaped corridor
        const { x1, y1, x2, y2 } = corridor;

        // Horizontal part
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        for (let x = startX; x <= endX; x++) {
            if (x >= 0 && x < this.width && y1 >= 0 && y1 < this.height) {
                tiles[y1][x].type = "floor";
            }
        }

        // Vertical part
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        for (let y = startY; y <= endY; y++) {
            if (x2 >= 0 && x2 < this.width && y >= 0 && y < this.height) {
                tiles[y][x2].type = "floor";
            }
        }
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Add some variety with different room shapes
    generateVariedDungeon(): DungeonMap {
        const baseDungeon = this.generateDungeon();

        // Add some circular rooms
        this.addCircularRooms(baseDungeon);

        // Add some irregular rooms
        this.addIrregularRooms(baseDungeon);

        return baseDungeon;
    }

    private addCircularRooms(dungeon: DungeonMap): void {
        // Add a few circular rooms for variety
        for (let i = 0; i < 3; i++) {
            const radius = this.randomInt(3, 6);
            const x = this.randomInt(radius + 1, this.width - radius - 1);
            const y = this.randomInt(radius + 1, this.height - radius - 1);

            this.carveCircle(dungeon.tiles, x, y, radius);
        }
    }

    private addIrregularRooms(dungeon: DungeonMap): void {
        // Add some irregular shaped rooms
        for (let i = 0; i < 2; i++) {
            const width = this.randomInt(6, 15);
            const height = this.randomInt(4, 10);
            const x = this.randomInt(1, this.width - width - 1);
            const y = this.randomInt(1, this.height - height - 1);

            // Create irregular shape by removing some tiles
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    if (Math.random() > 0.1) { // 90% chance to place floor
                        const tileX = x + dx;
                        const tileY = y + dy;
                        if (tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height) {
                            dungeon.tiles[tileY][tileX].type = "floor";
                        }
                    }
                }
            }
        }
    }

    private carveCircle(
        tiles: Array<Array<{ type: string; explored: boolean; visible: boolean }>>,
        centerX: number,
        centerY: number,
        radius: number
    ): void {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                if (distance <= radius && x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    tiles[y][x].type = "floor";
                }
            }
        }
    }
}
