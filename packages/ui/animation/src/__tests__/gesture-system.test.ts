/**
 * 🦊 Gesture System Tests
 *
 * Test gesture detection and animation integration
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GestureDetector } from "../gestures/GestureDetector";
import { GestureAnimationSystem } from "../gestures/GestureAnimationSystem";
import { useGestureAnimation } from "../composables/useGestureAnimation";

describe("Gesture System", () => {
  let testElement: HTMLElement;

  beforeEach(() => {
    // Create test element
    testElement = document.createElement("div");
    testElement.style.width = "100px";
    testElement.style.height = "100px";
    testElement.style.position = "absolute";
    testElement.style.top = "0";
    testElement.style.left = "0";
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // Clean up test element
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe("GestureDetector", () => {
    it("should detect drag gestures", () => {
      const events: { type: string; gesture: any }[] = [];
      const detector = new GestureDetector(testElement, {
        onStart: event => events.push({ type: "start", gesture: event }),
        onMove: event => events.push({ type: "move", gesture: event }),
        onEnd: event => events.push({ type: "end", gesture: event }),
      });

      // Simulate mouse drag
      const mouseDownEvent = new MouseEvent("mousedown", {
        clientX: 10,
        clientY: 10,
        bubbles: true,
      });
      testElement.dispatchEvent(mouseDownEvent);

      const mouseMoveEvent = new MouseEvent("mousemove", {
        clientX: 50,
        clientY: 50,
        bubbles: true,
      });
      testElement.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent("mouseup", {
        clientX: 50,
        clientY: 50,
        bubbles: true,
      });
      testElement.dispatchEvent(mouseUpEvent);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("start");
      expect(events[events.length - 1].type).toBe("end");

      // Check gesture types
      const startEvent = events.find(e => e.type === "start");
      const endEvent = events.find(e => e.type === "end");
      expect(startEvent).toBeDefined();
      expect(endEvent).toBeDefined();
      expect(startEvent?.gesture.type).toBe("drag");

      detector.destroy();
    });

    it("should detect touch gestures", () => {
      const events: { type: string; gesture: any }[] = [];
      const detector = new GestureDetector(testElement, {
        onStart: event => events.push({ type: "start", gesture: event }),
        onMove: event => events.push({ type: "move", gesture: event }),
        onEnd: event => events.push({ type: "end", gesture: event }),
      });

      // Simulate touch drag
      const touchStartEvent = new TouchEvent("touchstart", {
        touches: [
          {
            clientX: 10,
            clientY: 10,
          } as Touch,
        ],
        bubbles: true,
      });
      testElement.dispatchEvent(touchStartEvent);

      const touchMoveEvent = new TouchEvent("touchmove", {
        touches: [
          {
            clientX: 50,
            clientY: 50,
          } as Touch,
        ],
        bubbles: true,
      });
      testElement.dispatchEvent(touchMoveEvent);

      const touchEndEvent = new TouchEvent("touchend", {
        bubbles: true,
      });
      testElement.dispatchEvent(touchEndEvent);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("start");

      // Check gesture types
      const startEvent = events.find(e => e.type === "start");
      expect(startEvent).toBeDefined();
      expect(startEvent?.gesture.type).toBe("drag");

      detector.destroy();
    });

    it("should detect pinch gestures", () => {
      const events: { type: string; gesture: any }[] = [];
      const detector = new GestureDetector(testElement, {
        onStart: event => events.push({ type: "start", gesture: event }),
        onMove: event => events.push({ type: "move", gesture: event }),
        onEnd: event => events.push({ type: "end", gesture: event }),
      });

      // Simulate pinch gesture
      const touchStartEvent = new TouchEvent("touchstart", {
        touches: [{ clientX: 10, clientY: 10 } as Touch, { clientX: 20, clientY: 10 } as Touch],
        bubbles: true,
      });
      testElement.dispatchEvent(touchStartEvent);

      const touchMoveEvent = new TouchEvent("touchmove", {
        touches: [{ clientX: 5, clientY: 10 } as Touch, { clientX: 25, clientY: 10 } as Touch],
        bubbles: true,
      });
      testElement.dispatchEvent(touchMoveEvent);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("start");

      // Check gesture types
      const startEvent = events.find(e => e.type === "start");
      expect(startEvent).toBeDefined();
      expect(startEvent?.gesture.type).toBe("pinch");

      detector.destroy();
    });
  });

  describe("GestureAnimationSystem", () => {
    it("should create gesture animation system", () => {
      const system = new GestureAnimationSystem({
        element: testElement,
        properties: {
          translateX: true,
          translateY: true,
        },
      });

      expect(system).toBeDefined();
      expect(system.getState()).toBeDefined();

      system.destroy();
    });

    it("should apply transforms to element", () => {
      const system = new GestureAnimationSystem({
        element: testElement,
        properties: {
          translateX: true,
          translateY: true,
          scale: true,
        },
      });

      system.setState({
        translateX: 100,
        translateY: 50,
        scale: 1.5,
      });

      const transform = testElement.style.transform;
      expect(transform).toContain("translate3d(100px, 50px, 0)");
      expect(transform).toContain("scale(1.5)");

      system.destroy();
    });

    it("should respect bounds", () => {
      const system = new GestureAnimationSystem({
        element: testElement,
        properties: {
          translateX: true,
          translateY: true,
        },
        bounds: {
          minX: 0,
          maxX: 200,
          minY: 0,
          maxY: 200,
        },
      });

      system.setState({
        translateX: -50, // Should be clamped to 0
        translateY: 300, // Should be clamped to 200
      });

      const state = system.getState();
      expect(state.translateX).toBe(0);
      expect(state.translateY).toBe(200);

      system.destroy();
    });

    it("should animate to target state", async () => {
      const system = new GestureAnimationSystem({
        element: testElement,
        properties: {
          translateX: true,
          translateY: true,
        },
      });

      system.animateTo(
        {
          translateX: 100,
          translateY: 100,
        },
        100
      );

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      const state = system.getState();
      expect(state.translateX).toBeCloseTo(100, 0);
      expect(state.translateY).toBeCloseTo(100, 0);

      system.destroy();
    });
  });

  describe("useGestureAnimation Composable", () => {
    it("should create gesture animation composable", () => {
      const gestureAnimation = useGestureAnimation({
        properties: {
          translateX: true,
          translateY: true,
        },
      });

      expect(gestureAnimation).toBeDefined();
      expect(typeof gestureAnimation.ref).toBe("function");
      expect(typeof gestureAnimation.animateTo).toBe("function");
      expect(typeof gestureAnimation.reset).toBe("function");
    });

    it("should handle element ref", () => {
      const gestureAnimation = useGestureAnimation();

      // This should not throw
      expect(() => gestureAnimation.ref(testElement)).not.toThrow();
    });

    it("should provide state getter", () => {
      const gestureAnimation = useGestureAnimation();
      gestureAnimation.ref(testElement);

      const state = gestureAnimation.state();
      expect(state).toBeDefined();
      expect(typeof state.translateX).toBe("number");
      expect(typeof state.translateY).toBe("number");
      expect(typeof state.scale).toBe("number");
    });
  });

  describe("Performance", () => {
    it("should handle multiple gesture events efficiently", () => {
      const system = new GestureAnimationSystem({
        element: testElement,
        properties: {
          translateX: true,
          translateY: true,
        },
      });

      const startTime = performance.now();

      // Simulate many state updates
      for (let i = 0; i < 100; i++) {
        system.setState({
          translateX: i,
          translateY: i * 2,
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`100 gesture state updates: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(10); // Should be very fast

      system.destroy();
    });

    it("should handle gesture detection efficiently", () => {
      const events: any[] = [];
      const detector = new GestureDetector(testElement, {
        onMove: event => events.push(event),
      });

      const startTime = performance.now();

      // Simulate rapid mouse movements
      for (let i = 0; i < 50; i++) {
        const mouseMoveEvent = new MouseEvent("mousemove", {
          clientX: i * 2,
          clientY: i * 2,
          bubbles: true,
        });
        testElement.dispatchEvent(mouseMoveEvent);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`50 gesture move events: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(50); // Should be reasonably fast

      detector.destroy();
    });
  });
});
