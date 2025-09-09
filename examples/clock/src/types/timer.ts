/**
 * Timer Types
 * Type definitions for timer functionality
 */

export type TimerStateType = "stopped" | "running" | "paused";

export interface TimerTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimerState {
  time: TimerTime;
  inputTime: TimerTime;
  state: TimerStateType;
  originalTime: TimerTime;
}
