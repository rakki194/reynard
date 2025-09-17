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
export declare class DungeonGenerator {
    private width;
    private height;
    private minRoomSize;
    private maxRoomSize;
    private maxRooms;
    constructor(width?: number, height?: number, minRoomSize?: number, maxRoomSize?: number, maxRooms?: number);
    generateDungeon(): DungeonMap;
    private createEmptyMap;
    private createRandomRoom;
    private isRoomValid;
    private roomsOverlap;
    private carveRoom;
    private createCorridor;
    private carveCorridor;
    private randomInt;
    generateVariedDungeon(): DungeonMap;
    private addCircularRooms;
    private addIrregularRooms;
    private carveCircle;
}
