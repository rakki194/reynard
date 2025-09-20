// SIMD position system implementation - main orchestrator

import { WasmLoader, WasmSystemInterface } from "./wasm-loader.js";
import { MockPositionSystem } from "./mock-position-system.js";

export class PositionSystemSIMD {
  private wasmSystem: WasmSystemInterface | null = null;
  private mockSystem: MockPositionSystem;
  private isInitialized: boolean = false;
  private useMock: boolean = false;
  private wasmLoader: WasmLoader;

  constructor(private maxEntities: number = 100000) {
    this.wasmLoader = WasmLoader.getInstance();
    this.mockSystem = new MockPositionSystem(maxEntities);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("Initializing SIMD Position System...");

      this.wasmSystem = await this.wasmLoader.initializeWasm(this.maxEntities);
      console.log(`SIMD System initialized with ${this.maxEntities} max entities`);
    } catch (error) {
      console.warn("Failed to initialize WASM SIMD, falling back to mock:", error);
      this.useMock = true;
    }

    this.isInitialized = true;
  }

  addEntity(
    position: { x: number; y: number },
    velocity: { vx: number; vy: number },
    acceleration: { ax: number; ay: number },
    mass: { mass: number }
  ): void {
    if (this.useMock) {
      this.mockSystem.addEntity(position, velocity, acceleration, mass);
    } else if (this.wasmSystem) {
      this.wasmSystem.add_entity(
        position.x,
        position.y,
        velocity.vx,
        velocity.vy,
        acceleration.ax,
        acceleration.ay,
        mass.mass
      );
    }
  }

  updatePositions(deltaTime: number): void {
    if (this.useMock) {
      this.mockSystem.updatePositions(deltaTime);
    } else if (this.wasmSystem) {
      this.wasmSystem.update_positions(deltaTime);
    }
  }

  detectCollisions(radius: number): number[] {
    if (this.useMock) {
      return this.mockSystem.detectCollisions(radius);
    } else if (this.wasmSystem) {
      return Array.from(this.wasmSystem.detect_collisions(radius));
    }
    return [];
  }

  spatialQuery(queryX: number, queryY: number, radius: number): number[] {
    if (this.useMock) {
      return this.mockSystem.spatialQuery(queryX, queryY, radius);
    } else if (this.wasmSystem) {
      return Array.from(this.wasmSystem.spatial_query(queryX, queryY, radius));
    }
    return [];
  }

  clear(): void {
    if (this.useMock) {
      this.mockSystem.clear();
    } else if (this.wasmSystem) {
      this.wasmSystem.clear();
    }
  }

  simdVectorAdd(a: Float32Array, b: Float32Array): Float32Array {
    const simdVectorAdd = this.wasmLoader.getSimdVectorAdd();

    if (simdVectorAdd && !this.useMock) {
      const result = new Float32Array(a.length);
      simdVectorAdd(a, b, result);
      return result;
    } else {
      // Mock implementation
      const result = new Float32Array(a.length);
      for (let i = 0; i < a.length; i++) {
        result[i] = a[i] + b[i];
      }
      return result;
    }
  }

  destroy(): void {
    if (this.wasmSystem) {
      this.wasmSystem.free();
      this.wasmSystem = null;
    }
    this.isInitialized = false;
  }
}
