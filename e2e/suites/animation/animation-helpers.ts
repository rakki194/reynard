/**
 * 🎭 Animation Testing Helpers
 *
 * Utility functions for testing animations in E2E tests
 */

import { Page, expect } from "@playwright/test";

export interface AnimationTestConfig {
  timeout?: number;
  frameRate?: number;
  tolerance?: number;
}

export class AnimationTester {
  constructor(private page: Page) {}

  /**
   * Wait for animation to start
   */
  async waitForAnimationStart(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      sel => {
        const element = document.querySelector(sel);
        if (!element) return false;

        const style = getComputedStyle(element);
        const transform = style.transform;
        const opacity = parseFloat(style.opacity);

        // Check if animation has started (transform or opacity changed)
        return (transform !== "none" && transform !== "matrix(1, 0, 0, 1, 0, 0)") || opacity !== 1;
      },
      selector,
      { timeout }
    );
  }

  /**
   * Wait for animation to complete
   */
  async waitForAnimationComplete(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      sel => {
        const element = document.querySelector(sel);
        if (!element) return false;

        const style = getComputedStyle(element);
        const transform = style.transform;
        const opacity = parseFloat(style.opacity);

        // Check if animation is complete (final state reached)
        return transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)" || opacity === 1;
      },
      selector,
      { timeout }
    );
  }

  /**
   * Capture animation frames for analysis
   */
  async captureAnimationFrames(selector: string, duration: number): Promise<string[]> {
    const frames: string[] = [];
    const frameCount = Math.floor(duration / 16); // ~60fps

    for (let i = 0; i < frameCount; i++) {
      const frame = await this.page.locator(selector).screenshot();
      frames.push(frame.toString("base64"));
      await this.page.waitForTimeout(16); // Wait for next frame
    }

    return frames;
  }

  /**
   * Measure animation performance
   */
  async measureAnimationPerformance(
    selector: string,
    duration: number
  ): Promise<{
    frameRate: number;
    droppedFrames: number;
    averageFrameTime: number;
  }> {
    const startTime = Date.now();
    let frameCount = 0;
    let lastFrameTime = startTime;
    const frameTimes: number[] = [];

    // Monitor frames during animation
    await this.page.evaluate(
      (sel, dur) => {
        const element = document.querySelector(sel);
        if (!element) return;

        let frameCount = 0;
        const startTime = performance.now();

        const measureFrame = (currentTime: number) => {
          frameCount++;
          if (currentTime - startTime < dur) {
            requestAnimationFrame(measureFrame);
          }
        };

        requestAnimationFrame(measureFrame);
      },
      selector,
      duration
    );

    await this.page.waitForTimeout(duration);

    const endTime = Date.now();
    const actualDuration = endTime - startTime;
    const expectedFrames = Math.floor(actualDuration / 16.67); // 60fps
    const frameRate = (frameCount / actualDuration) * 1000;
    const droppedFrames = Math.max(0, expectedFrames - frameCount);
    const averageFrameTime = actualDuration / frameCount;

    return {
      frameRate,
      droppedFrames,
      averageFrameTime,
    };
  }

  /**
   * Test staggered animation timing
   */
  async testStaggeredTiming(itemSelector: string, expectedDelays: number[], tolerance = 50): Promise<boolean> {
    const results: boolean[] = [];

    for (let i = 0; i < expectedDelays.length; i++) {
      const item = this.page.locator(itemSelector).nth(i);
      const startTime = Date.now();

      // Wait for item to start animating
      await this.waitForAnimationStart(itemSelector + `:nth-child(${i + 1})`);

      const actualDelay = Date.now() - startTime;
      const expectedDelay = expectedDelays[i];
      const isWithinTolerance = Math.abs(actualDelay - expectedDelay) <= tolerance;

      results.push(isWithinTolerance);
    }

    return results.every(result => result);
  }

  /**
   * Verify animation easing
   */
  async verifyEasing(
    selector: string,
    expectedEasing: "linear" | "ease-in" | "ease-out" | "ease-in-out",
    tolerance = 0.1
  ): Promise<boolean> {
    const frames = await this.captureAnimationFrames(selector, 1000);

    // Analyze frame progression to determine easing
    const progressValues: number[] = [];

    for (const frame of frames) {
      // This is a simplified check - in reality you'd analyze the actual animation values
      const progress = frames.indexOf(frame) / frames.length;
      progressValues.push(progress);
    }

    // Check if progression matches expected easing curve
    switch (expectedEasing) {
      case "linear":
        return this.isLinearProgression(progressValues, tolerance);
      case "ease-in":
        return this.isEaseInProgression(progressValues, tolerance);
      case "ease-out":
        return this.isEaseOutProgression(progressValues, tolerance);
      case "ease-in-out":
        return this.isEaseInOutProgression(progressValues, tolerance);
      default:
        return false;
    }
  }

  private isLinearProgression(values: number[], tolerance: number): boolean {
    for (let i = 1; i < values.length; i++) {
      const expected = i / (values.length - 1);
      if (Math.abs(values[i] - expected) > tolerance) {
        return false;
      }
    }
    return true;
  }

  private isEaseInProgression(values: number[], tolerance: number): boolean {
    // Ease-in should start slow and accelerate
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstHalfProgress = firstHalf[firstHalf.length - 1] - firstHalf[0];
    const secondHalfProgress = secondHalf[secondHalf.length - 1] - secondHalf[0];

    return secondHalfProgress > firstHalfProgress * (1 + tolerance);
  }

  private isEaseOutProgression(values: number[], tolerance: number): boolean {
    // Ease-out should start fast and decelerate
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstHalfProgress = firstHalf[firstHalf.length - 1] - firstHalf[0];
    const secondHalfProgress = secondHalf[secondHalf.length - 1] - secondHalf[0];

    return firstHalfProgress > secondHalfProgress * (1 + tolerance);
  }

  private isEaseInOutProgression(values: number[], tolerance: number): boolean {
    // Ease-in-out should start slow, accelerate, then decelerate
    const firstQuarter = values.slice(0, Math.floor(values.length / 4));
    const secondQuarter = values.slice(Math.floor(values.length / 4), Math.floor(values.length / 2));
    const thirdQuarter = values.slice(Math.floor(values.length / 2), Math.floor((3 * values.length) / 4));
    const fourthQuarter = values.slice(Math.floor((3 * values.length) / 4));

    const firstQuarterProgress = firstQuarter[firstQuarter.length - 1] - firstQuarter[0];
    const secondQuarterProgress = secondQuarter[secondQuarter.length - 1] - secondQuarter[0];
    const thirdQuarterProgress = thirdQuarter[thirdQuarter.length - 1] - thirdQuarter[0];
    const fourthQuarterProgress = fourthQuarter[fourthQuarter.length - 1] - fourthQuarter[0];

    // Should accelerate in first half, decelerate in second half
    return (
      secondQuarterProgress > firstQuarterProgress * (1 + tolerance) &&
      thirdQuarterProgress > fourthQuarterProgress * (1 + tolerance)
    );
  }

  /**
   * Test 3D animation properties
   */
  async test3DAnimation(
    selector: string,
    expectedProperties: {
      rotation?: { x: number; y: number; z: number };
      position?: { x: number; y: number; z: number };
      scale?: { x: number; y: number; z: number };
    }
  ): Promise<boolean> {
    const element = this.page.locator(selector);

    // Wait for 3D animation to start
    await this.waitForAnimationStart(selector);

    // Check if 3D transforms are applied
    const transform = await element.evaluate(el => getComputedStyle(el).transform);

    // Parse 3D transform matrix
    const matrix = this.parse3DMatrix(transform);

    if (expectedProperties.rotation) {
      const rotation = this.extractRotation(matrix);
      const { x, y, z } = expectedProperties.rotation;

      if (Math.abs(rotation.x - x) > 0.1 || Math.abs(rotation.y - y) > 0.1 || Math.abs(rotation.z - z) > 0.1) {
        return false;
      }
    }

    if (expectedProperties.position) {
      const position = this.extractPosition(matrix);
      const { x, y, z } = expectedProperties.position;

      if (Math.abs(position.x - x) > 0.1 || Math.abs(position.y - y) > 0.1 || Math.abs(position.z - z) > 0.1) {
        return false;
      }
    }

    if (expectedProperties.scale) {
      const scale = this.extractScale(matrix);
      const { x, y, z } = expectedProperties.scale;

      if (Math.abs(scale.x - x) > 0.1 || Math.abs(scale.y - y) > 0.1 || Math.abs(scale.z - z) > 0.1) {
        return false;
      }
    }

    return true;
  }

  private parse3DMatrix(transform: string): number[] {
    // Parse CSS 3D transform matrix
    const match = transform.match(/matrix3d\(([^)]+)\)/);
    if (match) {
      return match[1].split(",").map(Number);
    }

    // Fallback to 2D matrix
    const match2D = transform.match(/matrix\(([^)]+)\)/);
    if (match2D) {
      const values = match2D[1].split(",").map(Number);
      // Convert 2D matrix to 3D matrix
      return [values[0], values[1], 0, 0, values[2], values[3], 0, 0, 0, 0, 1, 0, values[4], values[5], 0, 1];
    }

    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; // Identity matrix
  }

  private extractRotation(matrix: number[]): { x: number; y: number; z: number } {
    // Extract rotation from 3D matrix (simplified)
    const x = Math.atan2(matrix[6], matrix[10]);
    const y = Math.atan2(-matrix[2], Math.sqrt(matrix[6] * matrix[6] + matrix[10] * matrix[10]));
    const z = Math.atan2(matrix[1], matrix[0]);

    return { x, y, z };
  }

  private extractPosition(matrix: number[]): { x: number; y: number; z: number } {
    return {
      x: matrix[12],
      y: matrix[13],
      z: matrix[14],
    };
  }

  private extractScale(matrix: number[]): { x: number; y: number; z: number } {
    const x = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2]);
    const y = Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6]);
    const z = Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10]);

    return { x, y, z };
  }
}

/**
 * Create animation tester instance
 */
export function createAnimationTester(page: Page): AnimationTester {
  return new AnimationTester(page);
}

/**
 * Common animation test configurations
 */
export const AnimationConfigs = {
  FAST: { timeout: 1000, frameRate: 60, tolerance: 0.1 },
  NORMAL: { timeout: 2000, frameRate: 60, tolerance: 0.05 },
  SLOW: { timeout: 5000, frameRate: 30, tolerance: 0.02 },
  PRECISE: { timeout: 3000, frameRate: 60, tolerance: 0.01 },
} as const;
