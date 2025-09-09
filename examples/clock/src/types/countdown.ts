/**
 * Countdown Types
 * Type definitions for countdown functionality
 */

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CountdownTarget {
  date: string;
  time: string;
  label: string;
}

export interface CountdownState {
  countdown: CountdownTime;
  target: CountdownTarget;
  isActive: boolean;
  isCompleted: boolean;
}
