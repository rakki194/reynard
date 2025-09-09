/**
 * useTimer Composable
 * Manages timer state and lifecycle
 */

import { createSignal, onMount, onCleanup } from "solid-js";
import type { TimerTime, TimerStateType } from "../types/timer";
import { getDefaultTimerTime } from "../utils/timerUtils";
import { useTimerOperations } from "./useTimerOperations";

export const useTimer = () => {
  const [time, setTime] = createSignal<TimerTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [inputTime, setInputTime] = createSignal<TimerTime>(
    getDefaultTimerTime(),
  );
  const [state, setState] = createSignal<TimerStateType>("stopped");
  const [originalTime, setOriginalTime] = createSignal<TimerTime>(
    getDefaultTimerTime(),
  );

  let intervalId: NodeJS.Timeout;

  const {
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    updateTimer,
    handleInputChange,
  } = useTimerOperations(
    setTime,
    inputTime,
    setInputTime,
    state,
    setState,
    originalTime,
    setOriginalTime,
  );

  onMount(() => {
    intervalId = setInterval(() => {
      if (state() === "running") {
        updateTimer();
      }
    }, 1000);
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {
    time,
    inputTime,
    state,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    handleInputChange,
  };
};
