/**
 * useTimeManager Composable
 * Manages current time updates and alarm checking
 */

import { createSignal, onMount, onCleanup } from "solid-js";
import { useNotifications } from "reynard-core";
import type { Alarm } from "../types/alarm";

export const useTimeManager = (alarms: () => Alarm[]) => {
  const [currentTime, setCurrentTime] = createSignal("");
  const { notify } = useNotifications();

  let intervalId: NodeJS.Timeout;

  const updateCurrentTime = (): void => {
    const now = new Date();
    setCurrentTime(now.toTimeString().slice(0, 5));

    // Check for alarms
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const enabledAlarms = alarms().filter(alarm => alarm.enabled);

    enabledAlarms.forEach(alarm => {
      if (alarm.time === currentTimeStr) {
        notify(`Alarm: ${alarm.label || "Wake up!"}`, "warning");
      }
    });
  };

  onMount(() => {
    updateCurrentTime();
    intervalId = setInterval(updateCurrentTime, 1000);
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return { currentTime };
};
