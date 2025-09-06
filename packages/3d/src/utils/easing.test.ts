import { describe, it, expect } from 'vitest';
import { Easing, applyEasing, interpolate, interpolateVector3, interpolateColor } from './easing';

describe('Easing Functions', () => {
  describe('Easing', () => {
    it('linear easing returns the same value', () => {
      expect(Easing.linear(0)).toBe(0);
      expect(Easing.linear(0.5)).toBe(0.5);
      expect(Easing.linear(1)).toBe(1);
    });

    it('easeInQuad produces correct values', () => {
      expect(Easing.easeInQuad(0)).toBe(0);
      expect(Easing.easeInQuad(0.5)).toBe(0.25);
      expect(Easing.easeInQuad(1)).toBe(1);
    });

    it('easeOutQuad produces correct values', () => {
      expect(Easing.easeOutQuad(0)).toBe(0);
      expect(Easing.easeOutQuad(0.5)).toBe(0.75);
      expect(Easing.easeOutQuad(1)).toBe(1);
    });

    it('easeInOutQuad produces correct values', () => {
      expect(Easing.easeInOutQuad(0)).toBe(0);
      expect(Easing.easeInOutQuad(0.5)).toBe(0.5);
      expect(Easing.easeInOutQuad(1)).toBe(1);
    });

    it('easeInCubic produces correct values', () => {
      expect(Easing.easeInCubic(0)).toBe(0);
      expect(Easing.easeInCubic(0.5)).toBe(0.125);
      expect(Easing.easeInCubic(1)).toBe(1);
    });

    it('easeOutCubic produces correct values', () => {
      expect(Easing.easeOutCubic(0)).toBe(0);
      expect(Easing.easeOutCubic(0.5)).toBe(0.875);
      expect(Easing.easeOutCubic(1)).toBe(1);
    });

    it('easeInOutCubic produces correct values', () => {
      expect(Easing.easeInOutCubic(0)).toBe(0);
      expect(Easing.easeInOutCubic(0.5)).toBe(0.5);
      expect(Easing.easeInOutCubic(1)).toBe(1);
    });

    it('elastic easing functions handle edge cases', () => {
      expect(Easing.easeInElastic(0)).toBe(0);
      expect(Easing.easeInElastic(1)).toBe(1);
      expect(Easing.easeOutElastic(0)).toBe(0);
      expect(Easing.easeOutElastic(1)).toBe(1);
      expect(Easing.easeInOutElastic(0)).toBe(0);
      expect(Easing.easeInOutElastic(1)).toBe(1);
    });
  });

  describe('applyEasing', () => {
    it('applies linear easing correctly', () => {
      expect(applyEasing(0.5, 'linear')).toBe(0.5);
    });

    it('applies easeInQuad correctly', () => {
      expect(applyEasing(0.5, 'easeInQuad')).toBe(0.25);
    });

    it('applies easeOutQuad correctly', () => {
      expect(applyEasing(0.5, 'easeOutQuad')).toBe(0.75);
    });
  });

  describe('interpolate', () => {
    it('interpolates between two numbers with linear easing', () => {
      expect(interpolate(0, 10, 0, 'linear')).toBe(0);
      expect(interpolate(0, 10, 0.5, 'linear')).toBe(5);
      expect(interpolate(0, 10, 1, 'linear')).toBe(10);
    });

    it('interpolates between two numbers with easeInQuad', () => {
      expect(interpolate(0, 10, 0.5, 'easeInQuad')).toBe(2.5);
    });

    it('interpolates between two numbers with easeOutQuad', () => {
      expect(interpolate(0, 10, 0.5, 'easeOutQuad')).toBe(7.5);
    });
  });

  describe('interpolateVector3', () => {
    it('interpolates between two 3D vectors with linear easing', () => {
      const start: [number, number, number] = [0, 0, 0];
      const end: [number, number, number] = [10, 20, 30];
      
      expect(interpolateVector3(start, end, 0, 'linear')).toEqual([0, 0, 0]);
      expect(interpolateVector3(start, end, 0.5, 'linear')).toEqual([5, 10, 15]);
      expect(interpolateVector3(start, end, 1, 'linear')).toEqual([10, 20, 30]);
    });

    it('interpolates between two 3D vectors with easeInQuad', () => {
      const start: [number, number, number] = [0, 0, 0];
      const end: [number, number, number] = [10, 20, 30];
      
      const result = interpolateVector3(start, end, 0.5, 'easeInQuad');
      expect(result[0]).toBeCloseTo(2.5);
      expect(result[1]).toBeCloseTo(5);
      expect(result[2]).toBeCloseTo(7.5);
    });
  });

  describe('interpolateColor', () => {
    it('interpolates between two colors with linear easing', () => {
      const start: [number, number, number] = [0, 0, 0];
      const end: [number, number, number] = [1, 1, 1];
      
      expect(interpolateColor(start, end, 0, 'linear')).toEqual([0, 0, 0]);
      expect(interpolateColor(start, end, 0.5, 'linear')).toEqual([0.5, 0.5, 0.5]);
      expect(interpolateColor(start, end, 1, 'linear')).toEqual([1, 1, 1]);
    });

    it('interpolates between two colors with easeInQuad', () => {
      const start: [number, number, number] = [0, 0, 0];
      const end: [number, number, number] = [1, 1, 1];
      
      const result = interpolateColor(start, end, 0.5, 'easeInQuad');
      expect(result[0]).toBeCloseTo(0.25);
      expect(result[1]).toBeCloseTo(0.25);
      expect(result[2]).toBeCloseTo(0.25);
    });
  });
});
