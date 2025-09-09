/**
 * TimerDisplay Component
 * Displays timer time and status
 */

import { Component } from "solid-js";
import type { TimerTime, TimerStateType } from "../types/timer";
import { formatTime } from "../utils/timerUtils";

interface TimerDisplayProps {
  time: TimerTime;
  state: TimerStateType;
}

export const TimerDisplay: Component<TimerDisplayProps> = (props) => {
  const getStatusText = (): string => {
    switch (props.state) {
      case "running":
        return "Timer is running...";
      case "paused":
        return "Timer is paused";
      case "stopped":
        return "Timer is stopped";
      default:
        return "";
    }
  };

  return (
    <div class="timer-display-section">
      <div class="timer-display">{formatTime(props.time)}</div>

      <div class={`timer-status ${props.state}`}>{getStatusText()}</div>
    </div>
  );
};
