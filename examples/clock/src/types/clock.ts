/**
 * Clock Types
 * Type definitions for clock functionality
 */

export interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  date: string;
}

export interface ClockHandRotation {
  hour: number;
  minute: number;
  second: number;
}
