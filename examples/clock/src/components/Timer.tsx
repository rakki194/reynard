/**
 * Timer Component
 * Main timer component that orchestrates display, inputs, and controls
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";
import { useTimer } from "../composables/useTimer";
import { TimerDisplay } from "./TimerDisplay";
import { TimerInputs } from "./TimerInputs";
import { TimerControls } from "./TimerControls";

export const Timer: Component = () => {
  const { time, inputTime, state, startTimer, pauseTimer, stopTimer, resetTimer, handleInputChange } = useTimer();

  return (
    <div class="timer-container">
      <Card class="timer-card">
        <TimerDisplay time={time()} state={state()} />
        <TimerInputs inputTime={inputTime()} state={state()} onInputChange={handleInputChange} />
        <TimerControls
          time={time()}
          state={state()}
          onStart={startTimer}
          onPause={pauseTimer}
          onStop={stopTimer}
          onReset={resetTimer}
        />
      </Card>
    </div>
  );
};
