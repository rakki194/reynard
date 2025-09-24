/**
 * 🦊 Spring Physics Tests
 * 
 * Test spring physics system with mass, stiffness, damping parameters
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SpringPhysics, SpringEasing, MultiSpringPhysics, SpringAnimationLoop } from '../physics/SpringPhysics';
import { useSpringAnimation, useSpring2D, useSpring3D, getSpringEasing, createSpringEasing } from '../composables/useSpringAnimation';

describe('Spring Physics System', () => {
  beforeEach(() => {
    // Setup for tests
  });

  afterEach(() => {
    // Cleanup after tests
  });

  describe('SpringPhysics', () => {
    it('should create spring physics instance', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      expect(spring).toBeDefined();
      expect(spring.getState().position).toBe(0);
      expect(spring.getState().velocity).toBe(0);
    });

    it('should set target and update position', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      spring.setTarget(100);
      expect(spring.getTarget()).toBe(100);

      // Update spring for several frames
      for (let i = 0; i < 100; i++) {
        const result = spring.update(16);
        expect(result.position).toBeGreaterThanOrEqual(0);
        expect(result.velocity).toBeDefined();
      }
    });

    it('should reach target position within precision', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 200,
        damping: 20,
        precision: 0.01,
      });

      spring.setTarget(50);

      // Simulate animation until spring reaches target
      let iterations = 0;
      while (!spring.isAtRest() && iterations < 1000) {
        spring.update(16);
        iterations++;
      }

      expect(spring.isAtRest()).toBe(true);
      expect(Math.abs(spring.getState().position - 50)).toBeLessThan(0.01);
    });

    it('should handle different spring configurations', () => {
      const configs = [
        { mass: 1, stiffness: 100, damping: 10 },
        { mass: 2, stiffness: 200, damping: 20 },
        { mass: 0.5, stiffness: 50, damping: 5 },
      ];

      configs.forEach(config => {
        const spring = new SpringPhysics(config);
        spring.setTarget(100);

        // Update spring
        for (let i = 0; i < 50; i++) {
          const result = spring.update(16);
          expect(result.position).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should reset to initial state', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      spring.setTarget(100);
      spring.update(16);
      spring.update(16);

      spring.reset();

      const state = spring.getState();
      expect(state.position).toBe(0);
      expect(state.velocity).toBe(0);
      expect(spring.getTarget()).toBe(0);
    });

    it('should handle initial velocity', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
        velocity: 50,
      });

      expect(spring.getState().velocity).toBe(50);
    });
  });

  describe('SpringEasing', () => {
    it('should create spring easing function', () => {
      const easing = SpringEasing.create({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      expect(typeof easing).toBe('function');
      expect(easing(0)).toBe(0);
      expect(easing(1)).toBe(1);
    });

    it('should provide predefined spring presets', () => {
      const presets = ['gentle', 'wobbly', 'stiff', 'slow', 'bouncy', 'noBounce'] as const;
      
      presets.forEach(preset => {
        const easing = SpringEasing.getPreset(preset);
        expect(typeof easing).toBe('function');
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    it('should create smooth easing curves', () => {
      const easing = SpringEasing.getPreset('gentle');
      
      // Test multiple points along the curve
      const points = [0, 0.25, 0.5, 0.75, 1];
      points.forEach(point => {
        const value = easing(point);
        expect(value).toBeGreaterThanOrEqual(0);
        // Spring physics can overshoot, so allow values slightly above 1
        expect(value).toBeLessThanOrEqual(1.1);
      });
    });
  });

  describe('MultiSpringPhysics', () => {
    it('should create multi-dimensional spring system', () => {
      const multiSpring = new MultiSpringPhysics(2, {
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      expect(multiSpring).toBeDefined();
    });

    it('should handle 2D spring animations', () => {
      const multiSpring = new MultiSpringPhysics(2, {
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      multiSpring.setTarget([100, 200]);

      // Update spring
      for (let i = 0; i < 50; i++) {
        const positions = multiSpring.update(16);
        expect(positions).toHaveLength(2);
        expect(positions[0]).toBeGreaterThanOrEqual(0);
        expect(positions[1]).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle 3D spring animations', () => {
      const multiSpring = new MultiSpringPhysics(3, {
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      multiSpring.setTarget([100, 200, 300]);

      // Update spring
      for (let i = 0; i < 50; i++) {
        const positions = multiSpring.update(16);
        expect(positions).toHaveLength(3);
        positions.forEach(pos => {
          expect(pos).toBeGreaterThanOrEqual(0);
        });
      }
    });
  });

  describe('SpringAnimationLoop', () => {
    it('should create animation loop', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      const onUpdate = () => {};
      const onComplete = () => {};

      const loop = new SpringAnimationLoop(spring, onUpdate, onComplete);
      expect(loop).toBeDefined();
    });

    it('should start and stop animation loop', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      spring.setTarget(100);

      const updates: SpringResult[] = [];
      const onUpdate = (result: SpringResult) => {
        updates.push(result);
      };

      const loop = new SpringAnimationLoop(spring, onUpdate);
      
      loop.start();
      expect(updates.length).toBeGreaterThan(0);
      
      loop.stop();
    });
  });

  describe('useSpringAnimation Composable', () => {
    it('should create spring animation composable', () => {
      const springAnimation = useSpringAnimation({
        mass: 1,
        stiffness: 100,
        damping: 10,
      });

      expect(springAnimation).toBeDefined();
      expect(typeof springAnimation.value).toBe('function');
      expect(typeof springAnimation.setTarget).toBe('function');
      expect(typeof springAnimation.reset).toBe('function');
    });

    it('should handle target changes', () => {
      const springAnimation = useSpringAnimation({
        mass: 1,
        stiffness: 200,
        damping: 20,
        precision: 0.01,
      });

      springAnimation.setTarget(100);
      expect(springAnimation.value()).toBeGreaterThanOrEqual(0);
    });

    it('should provide velocity and rest state', () => {
      const springAnimation = useSpringAnimation({
        mass: 1,
        stiffness: 100,
        damping: 10,
      });

      expect(typeof springAnimation.velocity()).toBe('number');
      expect(typeof springAnimation.isAtRest()).toBe('boolean');
    });
  });

  describe('useSpring2D Composable', () => {
    it('should create 2D spring animation', () => {
      const spring2D = useSpring2D({
        mass: 1,
        stiffness: 100,
        damping: 10,
      });

      expect(spring2D).toBeDefined();
      expect(typeof spring2D.x).toBe('function');
      expect(typeof spring2D.y).toBe('function');
      expect(typeof spring2D.setTarget).toBe('function');
    });

    it('should handle 2D target changes', () => {
      const spring2D = useSpring2D({
        mass: 1,
        stiffness: 200,
        damping: 20,
      });

      spring2D.setTarget(100, 200);
      expect(spring2D.x()).toBeGreaterThanOrEqual(0);
      expect(spring2D.y()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('useSpring3D Composable', () => {
    it('should create 3D spring animation', () => {
      const spring3D = useSpring3D({
        mass: 1,
        stiffness: 100,
        damping: 10,
      });

      expect(spring3D).toBeDefined();
      expect(typeof spring3D.x).toBe('function');
      expect(typeof spring3D.y).toBe('function');
      expect(typeof spring3D.z).toBe('function');
      expect(typeof spring3D.setTarget).toBe('function');
    });

    it('should handle 3D target changes', () => {
      const spring3D = useSpring3D({
        mass: 1,
        stiffness: 200,
        damping: 20,
      });

      spring3D.setTarget(100, 200, 300);
      expect(spring3D.x()).toBeGreaterThanOrEqual(0);
      expect(spring3D.y()).toBeGreaterThanOrEqual(0);
      expect(spring3D.z()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Spring Easing Functions', () => {
    it('should provide spring easing presets', () => {
      const presets = ['gentle', 'wobbly', 'stiff', 'slow', 'bouncy', 'noBounce'] as const;
      
      presets.forEach(preset => {
        const easing = getSpringEasing(preset);
        expect(typeof easing).toBe('function');
        expect(easing(0)).toBe(0);
        expect(easing(1)).toBe(1);
      });
    });

    it('should create custom spring easing', () => {
      const easing = createSpringEasing({
        mass: 1,
        stiffness: 150,
        damping: 15,
        precision: 0.01,
      });

      expect(typeof easing).toBe('function');
      expect(easing(0)).toBe(0);
      expect(easing(1)).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should handle multiple spring updates efficiently', () => {
      const spring = new SpringPhysics({
        mass: 1,
        stiffness: 100,
        damping: 10,
        precision: 0.01,
      });

      spring.setTarget(100);

      const startTime = performance.now();
      
      // Simulate many spring updates
      for (let i = 0; i < 1000; i++) {
        spring.update(16);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`1000 spring updates: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(50); // Should be very fast
    });

    it('should handle multiple spring instances efficiently', () => {
      const springs: SpringPhysics[] = [];
      
      // Create many spring instances
      for (let i = 0; i < 100; i++) {
        springs.push(new SpringPhysics({
          mass: 1,
          stiffness: 100,
          damping: 10,
          precision: 0.01,
        }));
      }

      const startTime = performance.now();
      
      // Update all springs
      springs.forEach(spring => {
        spring.setTarget(100);
        for (let i = 0; i < 10; i++) {
          spring.update(16);
        }
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`100 springs with 10 updates each: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(100); // Should be reasonably fast
    });
  });
});
