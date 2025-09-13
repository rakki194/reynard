/**
 * @fileoverview Tests for ComponentExtractor
 *
 * @example
 * ```typescript
 * import { ComponentExtractor } from './component-extractor';
 * import { Position, Velocity, Acceleration, Mass } from '../examples/components';
 *
 * const extractor = new ComponentExtractor();
 * const components = [new Position(10, 20), new Velocity(1, 2)];
 *
 * const position = extractor.extractPosition(components);
 * console.log(position); // { x: 10, y: 20 }
 * ```
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */

import { ComponentExtractor } from "../component-extractor";
import {
  Position,
  Velocity,
  Acceleration,
  Mass,
} from "../../examples/components";

describe("ComponentExtractor", () => {
  let extractor: ComponentExtractor;

  beforeEach(() => {
    extractor = new ComponentExtractor();
  });

  describe("extractPosition", () => {
    it("should extract position data from components", () => {
      const components = [new Position(10, 20), new Velocity(1, 2)];
      const result = extractor.extractPosition(components);

      expect(result).toEqual({ x: 10, y: 20 });
    });

    it("should return null if no position component found", () => {
      const components = [new Velocity(1, 2), new Mass(5)];
      const result = extractor.extractPosition(components);

      expect(result).toBeNull();
    });
  });

  describe("extractVelocity", () => {
    it("should extract velocity data from components", () => {
      const components = [new Position(10, 20), new Velocity(1, 2)];
      const result = extractor.extractVelocity(components);

      expect(result).toEqual({ x: 1, y: 2 });
    });

    it("should return null if no velocity component found", () => {
      const components = [new Position(10, 20), new Mass(5)];
      const result = extractor.extractVelocity(components);

      expect(result).toBeNull();
    });
  });

  describe("extractAcceleration", () => {
    it("should extract acceleration data from components", () => {
      const components = [new Position(10, 20), new Acceleration(0.5, -0.3)];
      const result = extractor.extractAcceleration(components);

      expect(result).toEqual({ ax: 0.5, ay: -0.3 });
    });

    it("should return null if no acceleration component found", () => {
      const components = [new Position(10, 20), new Mass(5)];
      const result = extractor.extractAcceleration(components);

      expect(result).toBeNull();
    });
  });

  describe("extractMass", () => {
    it("should extract mass data from components", () => {
      const components = [new Position(10, 20), new Mass(5.5)];
      const result = extractor.extractMass(components);

      expect(result).toEqual({ mass: 5.5 });
    });

    it("should return null if no mass component found", () => {
      const components = [new Position(10, 20), new Velocity(1, 2)];
      const result = extractor.extractMass(components);

      expect(result).toBeNull();
    });
  });

  describe("isPositionVelocityEntity", () => {
    it("should return true if entity has both position and velocity", () => {
      const components = [new Position(10, 20), new Velocity(1, 2)];
      const result = extractor.isPositionVelocityEntity(components);

      expect(result).toBe(true);
    });

    it("should return false if entity only has position", () => {
      const components = [new Position(10, 20), new Mass(5)];
      const result = extractor.isPositionVelocityEntity(components);

      expect(result).toBe(false);
    });

    it("should return false if entity only has velocity", () => {
      const components = [new Velocity(1, 2), new Mass(5)];
      const result = extractor.isPositionVelocityEntity(components);

      expect(result).toBe(false);
    });

    it("should return false if entity has neither position nor velocity", () => {
      const components = [new Mass(5), new Acceleration(0.5, -0.3)];
      const result = extractor.isPositionVelocityEntity(components);

      expect(result).toBe(false);
    });
  });
});
