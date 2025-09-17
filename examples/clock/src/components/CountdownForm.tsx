/**
 * CountdownForm Component
 * Form for setting countdown target and controls
 */

import { Component, Show } from "solid-js";
import { Button } from "reynard-components";
import type { CountdownTarget } from "../types/countdown";

interface CountdownFormProps {
  target: CountdownTarget;
  isActive: boolean;
  onTargetChange: (target: CountdownTarget) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export const CountdownForm: Component<CountdownFormProps> = props => {
  const handleDateChange = (value: string): void => {
    props.onTargetChange({ ...props.target, date: value });
  };

  const handleTimeChange = (value: string): void => {
    props.onTargetChange({ ...props.target, time: value });
  };

  const handleLabelChange = (value: string): void => {
    props.onTargetChange({ ...props.target, label: value });
  };

  return (
    <div class="countdown-form">
      <h3>Set Countdown Target</h3>

      <div class="form-group">
        <label>Event Label</label>
        <input
          type="text"
          placeholder="Birthday, Holiday, Deadline..."
          value={props.target.label}
          onInput={e => handleLabelChange(e.currentTarget.value)}
        />
      </div>

      <div class="form-group">
        <label>Target Date</label>
        <input
          type="date"
          value={props.target.date}
          onInput={e => handleDateChange(e.currentTarget.value)}
          title="Select target date"
        />
      </div>

      <div class="form-group">
        <label>Target Time</label>
        <input
          type="time"
          value={props.target.time}
          onInput={e => handleTimeChange(e.currentTarget.value)}
          title="Select target time"
        />
      </div>

      <div class="countdown-controls">
        <Show when={!props.isActive}>
          <Button onClick={props.onStart} class="btn btn-success countdown-control-button">
            ▶️ Start Countdown
          </Button>
        </Show>

        <Show when={props.isActive}>
          <Button onClick={props.onStop} class="btn btn-danger countdown-control-button">
            ⏹️ Stop
          </Button>
        </Show>

        <Button onClick={props.onReset} class="btn btn-secondary countdown-control-button">
          🔄 Reset
        </Button>
      </div>
    </div>
  );
};
