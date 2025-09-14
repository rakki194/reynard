import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PerformanceTimer } from "../../performance/timer";

describe("PerformanceTimer", () => {
  let timer: PerformanceTimer;

  beforeEach(() => {
    vi.useFakeTimers();
    timer = new PerformanceTimer();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("start", () => {
    it("should start the timer", () => {
      timer.start();
      expect(timer.getElapsed()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("stop", () => {
    it("should stop the timer and return elapsed time", () => {
      timer.start();

      // Advance fake timers by 10ms
      vi.advanceTimersByTime(10);

      const elapsed = timer.stop();
      expect(elapsed).toBe(10);
    });

    it("should throw error when stopping a timer that is not running", () => {
      expect(() => timer.stop()).toThrow("Timer is not running");
    });

    it("should throw error when stopping a timer that was already stopped", () => {
      timer.start();
      timer.stop();
      expect(() => timer.stop()).toThrow("Timer is not running");
    });
  });

  describe("getElapsed", () => {
    it("should return elapsed time while timer is running", () => {
      timer.start();

      // Advance fake timers by 5ms
      vi.advanceTimersByTime(5);

      const elapsed = timer.getElapsed();
      expect(elapsed).toBe(5);
    });

    it("should return final elapsed time when timer is stopped", () => {
      timer.start();

      // Advance fake timers by 5ms
      vi.advanceTimersByTime(5);

      const finalElapsed = timer.stop();
      const elapsed = timer.getElapsed();

      expect(elapsed).toBe(finalElapsed);
      expect(elapsed).toBe(5);
    });

    it("should return 0 when timer has not been started", () => {
      expect(timer.getElapsed()).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset the timer to initial state", () => {
      timer.start();
      timer.stop();

      timer.reset();

      expect(timer.getElapsed()).toBe(0);
      expect(() => timer.stop()).toThrow("Timer is not running");
    });

    it("should allow starting after reset", () => {
      timer.start();
      timer.stop();
      timer.reset();

      timer.start();
      expect(timer.getElapsed()).toBeGreaterThanOrEqual(0);
    });
  });

  describe("integration", () => {
    it("should work correctly for multiple start/stop cycles", () => {
      // First cycle
      timer.start();
      vi.advanceTimersByTime(5);
      const firstElapsed = timer.stop();

      // Reset and second cycle
      timer.reset();
      timer.start();
      vi.advanceTimersByTime(5);
      const secondElapsed = timer.stop();

      expect(firstElapsed).toBe(5);
      expect(secondElapsed).toBe(5);
    });

    it("should maintain precision for very short durations", () => {
      timer.start();
      vi.advanceTimersByTime(1);
      const elapsed = timer.stop();

      expect(elapsed).toBe(1);
    });
  });
});
