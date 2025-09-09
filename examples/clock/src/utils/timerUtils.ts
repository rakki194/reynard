/**
 * Timer Utilities
 * Utility functions for timer calculations and formatting
 */

import type { TimerTime } from "../types/timer";

export const formatTime = (time: TimerTime): string => {
  const { hours, minutes, seconds } = time;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const timeToSeconds = (time: TimerTime): number => {
  return time.hours * 3600 + time.minutes * 60 + time.seconds;
};

export const secondsToTime = (totalSeconds: number): TimerTime => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
};

export const isTimeZero = (time: TimerTime): boolean => {
  return time.hours === 0 && time.minutes === 0 && time.seconds === 0;
};

export const getDefaultTimerTime = (): TimerTime => {
  return { hours: 0, minutes: 5, seconds: 0 };
};
