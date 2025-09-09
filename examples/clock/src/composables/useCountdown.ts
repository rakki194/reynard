/**
 * useCountdown Composable
 * Manages countdown state and logic
 */

import { createSignal, onMount, onCleanup } from "solid-js";
import { useNotifications } from "reynard-core";
import type { CountdownTime, CountdownTarget } from "../types/countdown";
import {
  calculateCountdown,
  isTargetInFuture,
  getDefaultTarget,
} from "../utils/countdownUtils";

export const useCountdown = () => {
  const [countdown, setCountdown] = createSignal<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [target, setTarget] = createSignal<CountdownTarget>(getDefaultTarget());
  const [isActive, setIsActive] = createSignal(false);
  const [isCompleted, setIsCompleted] = createSignal(false);

  const { notify } = useNotifications();

  let intervalId: NodeJS.Timeout;

  const updateCountdown = (): void => {
    const currentTarget = target();
    const newCountdown = calculateCountdown(currentTarget);
    setCountdown(newCountdown);

    if (
      newCountdown.days === 0 &&
      newCountdown.hours === 0 &&
      newCountdown.minutes === 0 &&
      newCountdown.seconds === 0
    ) {
      setIsActive(false);
      setIsCompleted(true);
      notify(`Countdown completed: ${currentTarget.label}!`, "success");
    }
  };

  const startCountdown = (): void => {
    const currentTarget = target();

    if (!currentTarget.date || !currentTarget.time) {
      notify("Please set a target date and time", "warning");
      return;
    }

    if (!isTargetInFuture(currentTarget)) {
      notify("Target date must be in the future", "warning");
      return;
    }

    setIsActive(true);
    setIsCompleted(false);
    updateCountdown();

    intervalId = setInterval(updateCountdown, 1000);
    notify(`Countdown started for ${currentTarget.label}`, "info");
  };

  const stopCountdown = (): void => {
    setIsActive(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
    notify("Countdown stopped", "info");
  };

  const resetCountdown = (): void => {
    setIsActive(false);
    setIsCompleted(false);
    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    if (intervalId) {
      clearInterval(intervalId);
    }
    notify("Countdown reset", "info");
  };

  onMount(() => {
    setTarget(getDefaultTarget());
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {
    countdown,
    target,
    isActive,
    isCompleted,
    setTarget,
    startCountdown,
    stopCountdown,
    resetCountdown,
  };
};
