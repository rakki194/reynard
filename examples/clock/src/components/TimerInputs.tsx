/**
 * TimerInputs Component
 * Input fields for setting timer duration
 */

import { Component } from "solid-js";
import type { TimerTime, TimerStateType } from "../types/timer";

interface TimerInputsProps {
  inputTime: TimerTime;
  state: TimerStateType;
  onInputChange: (field: keyof TimerTime, value: string) => void;
}

export const TimerInputs: Component<TimerInputsProps> = (props) => {
  const handleInputChange = (field: keyof TimerTime, value: string): void => {
    const numValue = Math.max(0, parseInt(value) || 0);
    props.onInputChange(field, numValue.toString());
  };

  return (
    <div class="timer-inputs">
      <div class="time-input">
        <label>Hours</label>
        <input
          type="number"
          min="0"
          max="23"
          value={props.inputTime.hours}
          onInput={(e) => handleInputChange("hours", e.currentTarget.value)}
          disabled={props.state === "running"}
          title="Hours (0-23)"
        />
      </div>
      <div class="time-input">
        <label>Minutes</label>
        <input
          type="number"
          min="0"
          max="59"
          value={props.inputTime.minutes}
          onInput={(e) => handleInputChange("minutes", e.currentTarget.value)}
          disabled={props.state === "running"}
          title="Minutes (0-59)"
        />
      </div>
      <div class="time-input">
        <label>Seconds</label>
        <input
          type="number"
          min="0"
          max="59"
          value={props.inputTime.seconds}
          onInput={(e) => handleInputChange("seconds", e.currentTarget.value)}
          disabled={props.state === "running"}
          title="Seconds (0-59)"
        />
      </div>
    </div>
  );
};
