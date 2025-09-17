export interface WasmSystemInterface {
    add_entity(x: number, y: number, vx: number, vy: number, ax: number, ay: number, mass: number): void;
    update_positions(deltaTime: number): void;
    detect_collisions(radius: number): number[];
    spatial_query(queryX: number, queryY: number, radius: number): number[];
    clear(): void;
    free(): void;
}
export interface WasmModule {
    init: () => Promise<void>;
    initSync: (wasmBytes: Uint8Array) => void;
    PositionSystemSIMD: new (maxEntities: number) => WasmSystemInterface;
    simd_vector_add: (a: Float32Array, b: Float32Array, result: Float32Array) => void;
}
export interface WasmLoaderResult {
    module: WasmModule | null;
    error?: Error;
}
export declare class WasmLoader {
    private static instance;
    private wasmModule;
    private loadError;
    private constructor();
    static getInstance(): WasmLoader;
    loadWasmModule(): Promise<WasmLoaderResult>;
    initializeWasm(maxEntities: number): Promise<WasmSystemInterface>;
    getSimdVectorAdd(): ((a: Float32Array, b: Float32Array, result: Float32Array) => void) | null;
}
