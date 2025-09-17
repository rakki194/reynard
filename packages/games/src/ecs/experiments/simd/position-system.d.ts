export interface Position {
    x: number;
    y: number;
}
export interface Velocity {
    vx: number;
    vy: number;
}
export interface Acceleration {
    ax: number;
    ay: number;
}
export interface Mass {
    mass: number;
}
export declare class PositionSystem {
    private maxEntities;
    private positions;
    private velocities;
    private accelerations;
    private masses;
    private entityCount;
    constructor(maxEntities?: number);
    addEntity(position: Position, velocity: Velocity, acceleration: Acceleration, mass: Mass): void;
    updatePositions(deltaTime: number): void;
    detectCollisions(radius: number): number[];
    spatialQuery(queryX: number, queryY: number, radius: number): number[];
    clear(): void;
}
