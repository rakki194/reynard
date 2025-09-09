/**
 * Countdown Utilities
 * Utility functions for countdown calculations and formatting
 */

import type { CountdownTime, CountdownTarget } from "../types/countdown";

export const calculateCountdown = (target: CountdownTarget): CountdownTime => {
  const targetDate = new Date(`${target.date}T${target.time}`);
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

export const isTargetInFuture = (target: CountdownTarget): boolean => {
  const targetDate = new Date(`${target.date}T${target.time}`);
  const now = new Date();
  return targetDate > now;
};

export const formatTargetDate = (target: CountdownTarget): string => {
  if (!target.date) return "";
  const date = new Date(`${target.date}T${target.time}`);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getDefaultTarget = (): CountdownTarget => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    date: tomorrow.toISOString().split("T")[0],
    time: "00:00",
    label: "New Day",
  };
};
