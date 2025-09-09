// Test data generator for SIMD experiments

import { TestData } from "./benchmark-types.js";

export class TestDataGenerator {
  static generateTestData(entityCount: number): TestData[] {
    const data: TestData[] = [];

    for (let i = 0; i < entityCount; i++) {
      data.push({
        position: {
          x: Math.random() * 1000 - 500,
          y: Math.random() * 1000 - 500,
        },
        velocity: {
          vx: Math.random() * 20 - 10,
          vy: Math.random() * 20 - 10,
        },
        acceleration: {
          ax: Math.random() * 2 - 1,
          ay: Math.random() * 2 - 1,
        },
        mass: {
          mass: Math.random() * 10 + 1,
        },
      });
    }

    return data;
  }

  static generateVectorArrays(size: number): {
    a: Float32Array;
    b: Float32Array;
  } {
    const a = new Float32Array(size);
    const b = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      a[i] = Math.random() * 100 - 50;
      b[i] = Math.random() * 100 - 50;
    }

    return { a, b };
  }
}
