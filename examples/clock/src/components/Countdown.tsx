/**
 * Countdown Component
 * Main countdown component that orchestrates display and form
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";
import { useCountdown } from "../composables/useCountdown";
import { CountdownDisplay } from "./CountdownDisplay";
import { CountdownForm } from "./CountdownForm";

export const Countdown: Component = () => {
  const {
    countdown,
    target,
    isActive,
    isCompleted,
    setTarget,
    startCountdown,
    stopCountdown,
    resetCountdown,
  } = useCountdown();

  return (
    <div class="countdown-container">
      <Card class="countdown-card">
        <CountdownDisplay
          countdown={countdown()}
          target={target()}
          isActive={isActive()}
          isCompleted={isCompleted()}
        />

        <CountdownForm
          target={target()}
          isActive={isActive()}
          onTargetChange={setTarget}
          onStart={startCountdown}
          onStop={stopCountdown}
          onReset={resetCountdown}
        />
      </Card>
    </div>
  );
};
