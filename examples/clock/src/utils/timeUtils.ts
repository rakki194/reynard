/**
 * Time Utilities
 * Utility functions for time formatting and calculations
 */

import type { TimeState, ClockHandRotation } from "../types/clock";

export const formatTime = (value: number): string => {
  return value.toString().padStart(2, "0");
};

export const getCurrentTimeState = (): TimeState => {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    date: now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
};

export const getAnalogHandRotation = (value: number, max: number): number => {
  return (value / max) * 360;
};

export const getClockHandRotations = (time: TimeState): ClockHandRotation => {
  const hour = time.hours % 12;
  const minute = time.minutes;

  return {
    hour: getAnalogHandRotation(hour * 5 + minute / 12, 60),
    minute: getAnalogHandRotation(time.minutes, 60),
    second: getAnalogHandRotation(time.seconds, 60),
  };
};
