/**
 * useDebounce composable tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot, createSignal } from 'solid-js';
import { useDebounce, useDebouncedCallback } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should debounce rapid value changes', () => {
      createRoot(() => {
        const [value, setValue] = createSignal('initial');
        const debouncedValue = useDebounce(value, 300);

        expect(debouncedValue()).toBe('initial');

        setValue('update1');
        expect(debouncedValue()).toBe('initial'); // Not updated yet

        setValue('update2');
        expect(debouncedValue()).toBe('initial'); // Still not updated

        // Fast forward past debounce delay
        vi.advanceTimersByTime(300);
        expect(debouncedValue()).toBe('update2'); // Now updated to latest value
      });
    });

    it('should update immediately for first value', () => {
      createRoot(() => {
        const [value] = createSignal('test');
        const debouncedValue = useDebounce(value, 300);

        expect(debouncedValue()).toBe('test');
      });
    });

    it('should reset timer on each value change', () => {
      createRoot(() => {
        const [value, setValue] = createSignal('initial');
        const debouncedValue = useDebounce(value, 300);

        setValue('update1');
        vi.advanceTimersByTime(200); // Not enough time

        setValue('update2');
        vi.advanceTimersByTime(200); // Still not enough time

        expect(debouncedValue()).toBe('initial');

        vi.advanceTimersByTime(100); // Now 300ms since last update
        expect(debouncedValue()).toBe('update2');
      });
    });

    it('should work with different data types', () => {
      createRoot(() => {
        const [numberValue, setNumberValue] = createSignal(0);
        const debouncedNumber = useDebounce(numberValue, 100);

        expect(debouncedNumber()).toBe(0);

        setNumberValue(42);
        vi.advanceTimersByTime(100);
        expect(debouncedNumber()).toBe(42);
      });

      createRoot(() => {
        const [objectValue, setObjectValue] = createSignal({ count: 0 });
        const debouncedObject = useDebounce(objectValue, 100);

        const newObject = { count: 5 };
        setObjectValue(newObject);
        vi.advanceTimersByTime(100);
        expect(debouncedObject()).toBe(newObject);
      });
    });
  });

  describe('useDebouncedCallback', () => {
    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 300);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenLastCalledWith('arg3');
    });

    it('should call function with latest arguments', () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 200);

      debouncedFn('first', 1);
      debouncedFn('second', 2);
      debouncedFn('third', 3);

      vi.advanceTimersByTime(200);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third', 3);
    });

    it('should reset timer on each call', () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 300);

      debouncedFn('call1');
      vi.advanceTimersByTime(200);

      debouncedFn('call2');
      vi.advanceTimersByTime(200);

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100); // Total 300ms since last call
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call2');
    });

    it('should handle functions with no arguments', () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith();
    });

    it('should clear previous timeout when called multiple times', () => {
      const mockFn = vi.fn();
      const debouncedFn = useDebouncedCallback(mockFn, 300);

      debouncedFn('first');
      vi.advanceTimersByTime(100);

      debouncedFn('second');
      vi.advanceTimersByTime(100);

      debouncedFn('third');
      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });
});
