/**
 * Custom hook for tracking current time with automatic updates
 */

import { createSignal, createEffect } from "solid-js";

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = createSignal(
    new Date().toLocaleTimeString(),
  );

  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  });

  return currentTime;
};
