/**
 * useTimerOperations Composable
 * Manages timer operations and state transitions
 */

import { useNotifications } from "reynard-core";
import type { TimerTime, TimerStateType } from "../types/timer";
import { timeToSeconds, secondsToTime } from "../utils/timerUtils";

export const useTimerOperations = (
  setTime: (value: TimerTime | ((prev: TimerTime) => TimerTime)) => void,
  inputTime: () => TimerTime,
  setInputTime: (value: TimerTime | ((prev: TimerTime) => TimerTime)) => void,
  state: () => TimerStateType,
  setState: (value: TimerStateType) => void,
  originalTime: () => TimerTime,
  setOriginalTime: (value: TimerTime) => void
) => {
  const { notify } = useNotifications();

  const startTimer = (): void => {
    if (state() === "stopped") {
      setTime(inputTime());
      setOriginalTime(inputTime());
    }
    setState("running");
    notify("Timer started", "info");
  };

  const pauseTimer = (): void => {
    setState("paused");
    notify("Timer paused", "warning");
  };

  const stopTimer = (): void => {
    setState("stopped");
    setTime(originalTime());
    notify("Timer stopped", "info");
  };

  const resetTimer = (): void => {
    setState("stopped");
    setTime(inputTime());
    setOriginalTime(inputTime());
    notify("Timer reset", "info");
  };

  const updateTimer = (): void => {
    setTime(currentTime => {
      const totalSeconds = timeToSeconds(currentTime);
      if (totalSeconds <= 1) {
        setState("stopped");
        setTime({ hours: 0, minutes: 0, seconds: 0 });
        notify("Timer finished!", "success");
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      return secondsToTime(totalSeconds - 1);
    });
  };

  const handleInputChange = (field: keyof TimerTime, value: string): void => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setInputTime(prev => ({ ...prev, [field]: numValue }));
  };

  return {
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    updateTimer,
    handleInputChange,
  };
};
