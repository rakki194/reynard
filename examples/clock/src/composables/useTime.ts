/**
 * useTime Composable
 * Manages time state and updates
 */

import { createSignal, onMount, onCleanup } from "solid-js";
import type { TimeState } from "../types/clock";
import { getCurrentTimeState, getClockHandRotations } from "../utils/timeUtils";

export const useTime = () => {
  const [time, setTime] = createSignal<TimeState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    date: "",
  });

  let intervalId: NodeJS.Timeout;

  const updateTime = (): void => {
    setTime(getCurrentTimeState());
  };

  onMount(() => {
    updateTime();
    intervalId = setInterval(updateTime, 1000);
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  const rotations = () => getClockHandRotations(time());

  return {
    time,
    rotations,
  };
};
