/**
 * 🦊 Scroll Animations Tests
 * 
 * Test scroll observer and scroll animation types
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScrollObserver } from '../scroll/ScrollObserver';
import { ScrollAnimations } from '../scroll/ScrollAnimations';
import { useScrollAnimation, useParallax, useReveal, useProgressAnimation } from '../composables/useScrollAnimation';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.scrollY and window.innerHeight
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 800,
});

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  width: 100,
  height: 100,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

describe('Scroll Animations', () => {
  let testElement: HTMLElement;
  let scrollObserver: ScrollObserver;
  let scrollAnimations: ScrollAnimations;

  beforeEach(() => {
    // Create test element
    testElement = document.createElement('div');
    testElement.style.width = '100px';
    testElement.style.height = '100px';
    testElement.style.position = 'absolute';
    testElement.style.top = '0';
    testElement.style.left = '0';
    document.body.appendChild(testElement);

    // Create fresh instances
    scrollObserver = new ScrollObserver();
    scrollAnimations = new ScrollAnimations(scrollObserver);
  });

  afterEach(() => {
    // Clean up
    scrollObserver.disconnect();
    scrollAnimations.destroy();
    
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('ScrollObserver', () => {
    it('should create scroll observer', () => {
      expect(scrollObserver).toBeDefined();
    });

    it('should observe elements', () => {
      const onEnter = vi.fn();
      const onExit = vi.fn();
      
      scrollObserver.observe(testElement, {
        onEnter,
        onExit,
      });

      expect(scrollObserver).toBeDefined();
    });

    it('should calculate scroll progress', () => {
      const progress = scrollObserver.getScrollProgress(testElement);
      expect(typeof progress).toBe('number');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('should get scroll position', () => {
      const position = scrollObserver.getScrollPosition();
      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
    });

    it('should get element position', () => {
      const position = scrollObserver.getElementPosition(testElement);
      expect(position).toHaveProperty('top');
      expect(position).toHaveProperty('bottom');
      expect(position).toHaveProperty('height');
      expect(typeof position.top).toBe('number');
      expect(typeof position.bottom).toBe('number');
      expect(typeof position.height).toBe('number');
    });

    it('should handle scroll events efficiently', () => {
      const onProgress = vi.fn();
      
      scrollObserver.observe(testElement, {
        onProgress,
      });

      // Simulate scroll events
      for (let i = 0; i < 10; i++) {
        window.scrollY = i * 100;
        scrollObserver['handleScroll']();
      }

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('ScrollAnimations', () => {
    it('should create parallax animation', () => {
      const cleanup = scrollAnimations.createParallax(testElement, {
        speed: 0.5,
        direction: 'vertical',
      });

      expect(cleanup).toBeDefined();
      expect(typeof cleanup).toBe('function');

      // Test cleanup
      cleanup();
    });

    it('should create reveal animation', () => {
      const cleanup = scrollAnimations.createReveal(testElement, {
        direction: 'up',
        distance: 50,
        duration: 300,
      });

      expect(cleanup).toBeDefined();
      expect(typeof cleanup).toBe('function');

      // Test cleanup
      cleanup();
    });

    it('should create progress animation', () => {
      const cleanup = scrollAnimations.createProgressAnimation(testElement, {
        properties: {
          translateY: (progress) => progress * 100,
          opacity: (progress) => progress,
        },
      });

      expect(cleanup).toBeDefined();
      expect(typeof cleanup).toBe('function');

      // Test cleanup
      cleanup();
    });

    it('should create animation sequence', () => {
      const elements = [testElement, testElement.cloneNode() as HTMLElement];
      const cleanup = scrollAnimations.createSequence(elements, {
        stagger: 100,
        direction: 'up',
        distance: 50,
      });

      expect(cleanup).toBeDefined();
      expect(typeof cleanup).toBe('function');

      // Test cleanup
      cleanup();
    });

    it('should handle parallax with different directions', () => {
      const verticalCleanup = scrollAnimations.createParallax(testElement, {
        speed: 0.5,
        direction: 'vertical',
      });

      const horizontalCleanup = scrollAnimations.createParallax(testElement, {
        speed: 0.5,
        direction: 'horizontal',
      });

      const bothCleanup = scrollAnimations.createParallax(testElement, {
        speed: 0.5,
        direction: 'both',
      });

      expect(verticalCleanup).toBeDefined();
      expect(horizontalCleanup).toBeDefined();
      expect(bothCleanup).toBeDefined();

      // Cleanup
      verticalCleanup();
      horizontalCleanup();
      bothCleanup();
    });

    it('should handle reveal with different directions', () => {
      const directions = ['up', 'down', 'left', 'right', 'fade'] as const;
      
      directions.forEach(direction => {
        const cleanup = scrollAnimations.createReveal(testElement, {
          direction,
          distance: 50,
        });
        
        expect(cleanup).toBeDefined();
        cleanup();
      });
    });
  });

  describe('useScrollAnimation Composable', () => {
    it('should create scroll animation composable', () => {
      const scrollAnimation = useScrollAnimation({
        type: 'parallax',
        parallax: {
          speed: 0.5,
          direction: 'vertical',
        },
      });

      expect(scrollAnimation).toBeDefined();
      expect(typeof scrollAnimation.ref).toBe('function');
      expect(typeof scrollAnimation.isVisible).toBe('function');
      expect(typeof scrollAnimation.progress).toBe('function');
      expect(typeof scrollAnimation.cleanup).toBe('function');
    });

    it('should handle element ref', () => {
      const scrollAnimation = useScrollAnimation({
        type: 'reveal',
        reveal: {
          direction: 'up',
          distance: 50,
        },
      });
      
      // This should not throw
      expect(() => scrollAnimation.ref(testElement)).not.toThrow();
    });

    it('should provide state getters', () => {
      const scrollAnimation = useScrollAnimation({
        type: 'progress',
        progress: {
          properties: {
            translateY: (progress) => progress * 100,
          },
        },
      });
      
      scrollAnimation.ref(testElement);
      
      const isVisible = scrollAnimation.isVisible();
      const progress = scrollAnimation.progress();
      
      expect(typeof isVisible).toBe('boolean');
      expect(typeof progress).toBe('number');
    });
  });

  describe('Convenience Composables', () => {
    it('should create parallax composable', () => {
      const parallax = useParallax({
        speed: 0.5,
        direction: 'vertical',
      });

      expect(parallax).toBeDefined();
      expect(typeof parallax.ref).toBe('function');
    });

    it('should create reveal composable', () => {
      const reveal = useReveal({
        direction: 'up',
        distance: 50,
      });

      expect(reveal).toBeDefined();
      expect(typeof reveal.ref).toBe('function');
    });

    it('should create progress animation composable', () => {
      const progressAnimation = useProgressAnimation({
        properties: {
          translateY: (progress) => progress * 100,
        },
      });

      expect(progressAnimation).toBeDefined();
      expect(typeof progressAnimation.ref).toBe('function');
    });
  });

  describe('Performance', () => {
    it('should handle multiple scroll animations efficiently', () => {
      const startTime = performance.now();
      
      // Create many parallax animations
      const cleanups: (() => void)[] = [];
      for (let i = 0; i < 50; i++) {
        const element = testElement.cloneNode() as HTMLElement;
        document.body.appendChild(element);
        
        const cleanup = scrollAnimations.createParallax(element, {
          speed: 0.5,
          direction: 'vertical',
        });
        cleanups.push(cleanup);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`50 parallax animations creation: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(100); // Should be reasonably fast
      
      // Cleanup
      cleanups.forEach(cleanup => cleanup());
    });

    it('should handle scroll events efficiently', () => {
      const onProgress = vi.fn();
      
      scrollObserver.observe(testElement, {
        onProgress,
      });

      const startTime = performance.now();
      
      // Simulate many scroll events
      for (let i = 0; i < 100; i++) {
        window.scrollY = i * 10;
        scrollObserver['handleScroll']();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`100 scroll events: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(50); // Should be very fast
    });
  });
});
