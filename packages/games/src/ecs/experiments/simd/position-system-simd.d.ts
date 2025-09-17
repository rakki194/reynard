export declare class PositionSystemSIMD {
    private maxEntities;
    private wasmSystem;
    private mockSystem;
    private isInitialized;
    private useMock;
    private wasmLoader;
    constructor(maxEntities?: number);
    initialize(): Promise<void>;
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
    simdVectorAdd(a: Float32Array, b: Float32Array): Float32Array;
    destroy(): void;
}
