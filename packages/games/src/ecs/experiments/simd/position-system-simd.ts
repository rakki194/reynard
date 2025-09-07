// SIMD position system implementation

import { Position, Velocity, Acceleration, Mass } from './position-system.js';

// Try to import WASM, fall back to mock if not available
let init: any, initSync: any, WasmPositionSystemSIMD: any, simd_vector_add: any;

// Type definition for the WASM class
type WasmPositionSystemSIMDType = typeof WasmPositionSystemSIMD;

try {
  const wasmModule = await import('./pkg/ecs_simd.js');
  init = wasmModule.default;
  initSync = wasmModule.initSync;
  WasmPositionSystemSIMD = wasmModule.PositionSystemSIMD;
  simd_vector_add = wasmModule.simd_vector_add;
} catch (error) {
  console.warn('🦊> WASM module not available, using mock implementation');
  // Mock implementations will be used
}

export class PositionSystemSIMD {
  private wasmSystem: WasmPositionSystemSIMDType | null = null;
  private isInitialized: boolean = false;
  private useMock: boolean = false;
  
  // Mock implementation data
  private positions: Position[] = [];
  private velocities: Velocity[] = [];
  private accelerations: Acceleration[] = [];
  private masses: Mass[] = [];
  private entityCount: number = 0;

  constructor(private maxEntities: number = 100000) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing SIMD Position System...');
      
      if (WasmPositionSystemSIMD) {
        // Load the WebAssembly module - use sync init for Node.js
        if (typeof window === 'undefined') {
          // Node.js environment
          const { readFileSync } = await import('fs');
          const { fileURLToPath } = await import('url');
          const { dirname, join } = await import('path');
          const wasmPath = join(dirname(fileURLToPath(import.meta.url)), 'pkg', 'ecs_simd_bg.wasm');
          const wasmBytes = readFileSync(wasmPath);
          initSync(wasmBytes);
        } else {
          // Browser environment
          await init();
        }
        
        // Create the SIMD system instance
        this.wasmSystem = new WasmPositionSystemSIMD(this.maxEntities);
        console.log(`SIMD System initialized with ${this.maxEntities} max entities`);
      } else {
        // Use mock implementation
        this.useMock = true;
        console.log(`Mock SIMD System initialized with ${this.maxEntities} max entities`);
      }
      
      this.isInitialized = true;
      
    } catch (error) {
      console.warn('Failed to initialize WASM SIMD, falling back to mock:', error);
      this.useMock = true;
      this.isInitialized = true;
    }
  }

  addEntity(position: { x: number; y: number }, velocity: { vx: number; vy: number }, acceleration: { ax: number; ay: number }, mass: { mass: number }): void {
    if (this.useMock) {
      if (this.entityCount >= this.maxEntities) return;
      
      this.positions.push({ x: position.x, y: position.y });
      this.velocities.push({ vx: velocity.vx, vy: velocity.vy });
      this.accelerations.push({ ax: acceleration.ax, ay: acceleration.ay });
      this.masses.push({ mass: mass.mass });
      this.entityCount++;
    } else if (this.wasmSystem) {
      this.wasmSystem.add_entity(position.x, position.y, velocity.vx, velocity.vy, acceleration.ax, acceleration.ay, mass.mass);
    }
  }

  updatePositions(deltaTime: number): void {
    if (this.useMock) {
      // Mock SIMD implementation - same as non-SIMD for now
      for (let i = 0; i < this.entityCount; i++) {
        const pos = this.positions[i];
        const vel = this.velocities[i];
        const acc = this.accelerations[i];
        
        // Update velocity
        vel.vx += acc.ax * deltaTime;
        vel.vy += acc.ay * deltaTime;
        
        // Update position
        pos.x += vel.vx * deltaTime;
        pos.y += vel.vy * deltaTime;
      }
    } else if (this.wasmSystem) {
      this.wasmSystem.update_positions(deltaTime);
    }
  }

  detectCollisions(radius: number): number[] {
    if (this.useMock) {
      const collisions: number[] = [];
      for (let i = 0; i < this.entityCount; i++) {
        for (let j = i + 1; j < this.entityCount; j++) {
          const dx = this.positions[i].x - this.positions[j].x;
          const dy = this.positions[i].y - this.positions[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < radius * 2) {
            collisions.push(i, j);
          }
        }
      }
      return collisions;
    } else if (this.wasmSystem) {
      return Array.from(this.wasmSystem.detect_collisions(radius));
    }
    return [];
  }

  spatialQuery(queryX: number, queryY: number, radius: number): number[] {
    if (this.useMock) {
      const results: number[] = [];
      for (let i = 0; i < this.entityCount; i++) {
        const dx = this.positions[i].x - queryX;
        const dy = this.positions[i].y - queryY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius) {
          results.push(i);
        }
      }
      return results;
    } else if (this.wasmSystem) {
      return Array.from(this.wasmSystem.spatial_query(queryX, queryY, radius));
    }
    return [];
  }

  clear(): void {
    if (this.useMock) {
      this.positions.length = 0;
      this.velocities.length = 0;
      this.accelerations.length = 0;
      this.masses.length = 0;
      this.entityCount = 0;
    } else if (this.wasmSystem) {
      this.wasmSystem.clear();
    }
  }

  simdVectorAdd(a: Float32Array, b: Float32Array): Float32Array {
    if (simd_vector_add && !this.useMock) {
      const result = new Float32Array(a.length);
      simd_vector_add(a, b, result);
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