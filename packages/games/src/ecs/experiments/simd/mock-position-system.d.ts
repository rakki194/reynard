export interface MockPositionSystemInterface {
    addEntity(position: {
        x: number;
        y: number;
    }, velocity: {
        vx: number;
        vy: number;
    }, acceleration: {
        ax: number;
        ay: number;
    }, mass: {
        mass: number;
    }): void;
    updatePositions(deltaTime: number): void;
    detectCollisions(radius: number): number[];
    spatialQuery(queryX: number, queryY: number, radius: number): number[];
    clear(): void;
    getEntityCount(): number;
}
export declare class MockPositionSystem implements MockPositionSystemInterface {
    private maxEntities;
    private positions;
    private velocities;
    private accelerations;
    private masses;
    private entityCount;
    constructor(maxEntities?: number);
    addEntity(position: {
        x: number;
        y: number;
    }, velocity: {
        vx: number;
        vy: number;
    }, acceleration: {
        ax: number;
        ay: number;
    }, mass: {
        mass: number;
    }): void;
    updatePositions(deltaTime: number): void;
    detectCollisions(radius: number): number[];
    spatialQuery(queryX: number, queryY: number, radius: number): number[];
    clear(): void;
    getEntityCount(): number;
}
