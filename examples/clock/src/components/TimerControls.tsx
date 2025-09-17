/**
 * TimerControls Component
 * Control buttons for timer operations
 */

import { Component, Show } from "solid-js";
import { Button } from "reynard-components";
import type { TimerTime, TimerStateType } from "../types/timer";
import { isTimeZero } from "../utils/timerUtils";

interface TimerControlsProps {
  time: TimerTime;
  state: TimerStateType;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const TimerControls: Component<TimerControlsProps> = props => {
  return (
    <div class="timer-controls">
      <Show when={props.state === "stopped"}>
        <Button onClick={props.onStart} class="btn btn-success" disabled={isTimeZero(props.time)}>
          ▶️ Start
        </Button>
      </Show>

      <Show when={props.state === "running"}>
        <Button onClick={props.onPause} class="btn btn-warning">
          ⏸️ Pause
        </Button>
        <Button onClick={props.onStop} class="btn btn-danger">
          ⏹️ Stop
        </Button>
      </Show>

      <Show when={props.state === "paused"}>
        <Button onClick={props.onStart} class="btn btn-success">
          ▶️ Resume
        </Button>
        <Button onClick={props.onStop} class="btn btn-danger">
          ⏹️ Stop
        </Button>
      </Show>

      <Button onClick={props.onReset} class="btn btn-secondary" disabled={props.state === "running"}>
        🔄 Reset
      </Button>
    </div>
  );
};
