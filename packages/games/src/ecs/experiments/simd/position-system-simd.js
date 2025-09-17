// SIMD position system implementation - main orchestrator
import { WasmLoader } from "./wasm-loader.js";
import { MockPositionSystem } from "./mock-position-system.js";
export class PositionSystemSIMD {
    constructor(maxEntities = 100000) {
        Object.defineProperty(this, "maxEntities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxEntities
        });
        Object.defineProperty(this, "wasmSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "mockSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "useMock", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "wasmLoader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.wasmLoader = WasmLoader.getInstance();
        this.mockSystem = new MockPositionSystem(maxEntities);
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            console.log("Initializing SIMD Position System...");
            this.wasmSystem = await this.wasmLoader.initializeWasm(this.maxEntities);
            console.log(`SIMD System initialized with ${this.maxEntities} max entities`);
        }
        catch (error) {
            console.warn("Failed to initialize WASM SIMD, falling back to mock:", error);
            this.useMock = true;
        }
        this.isInitialized = true;
    }
    addEntity(position, velocity, acceleration, mass) {
        if (this.useMock) {
            this.mockSystem.addEntity(position, velocity, acceleration, mass);
        }
        else if (this.wasmSystem) {
            this.wasmSystem.add_entity(position.x, position.y, velocity.vx, velocity.vy, acceleration.ax, acceleration.ay, mass.mass);
        }
    }
    updatePositions(deltaTime) {
        if (this.useMock) {
            this.mockSystem.updatePositions(deltaTime);
        }
        else if (this.wasmSystem) {
            this.wasmSystem.update_positions(deltaTime);
        }
    }
    detectCollisions(radius) {
        if (this.useMock) {
            return this.mockSystem.detectCollisions(radius);
        }
        else if (this.wasmSystem) {
            return Array.from(this.wasmSystem.detect_collisions(radius));
        }
        return [];
    }
    spatialQuery(queryX, queryY, radius) {
        if (this.useMock) {
            return this.mockSystem.spatialQuery(queryX, queryY, radius);
        }
        else if (this.wasmSystem) {
            return Array.from(this.wasmSystem.spatial_query(queryX, queryY, radius));
        }
        return [];
    }
    clear() {
        if (this.useMock) {
            this.mockSystem.clear();
        }
        else if (this.wasmSystem) {
            this.wasmSystem.clear();
        }
    }
    simdVectorAdd(a, b) {
        const simdVectorAdd = this.wasmLoader.getSimdVectorAdd();
        if (simdVectorAdd && !this.useMock) {
            const result = new Float32Array(a.length);
            simdVectorAdd(a, b, result);
            return result;
        }
        else {
            // Mock implementation
            const result = new Float32Array(a.length);
            for (let i = 0; i < a.length; i++) {
                result[i] = a[i] + b[i];
            }
            return result;
        }
    }
    destroy() {
        if (this.wasmSystem) {
            this.wasmSystem.free();
            this.wasmSystem = null;
        }
        this.isInitialized = false;
    }
}
