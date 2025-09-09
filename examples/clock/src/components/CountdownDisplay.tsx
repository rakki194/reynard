/**
 * CountdownDisplay Component
 * Displays countdown timer with status
 */

import { Component } from "solid-js";
import type { CountdownTime, CountdownTarget } from "../types/countdown";
import { formatTargetDate } from "../utils/countdownUtils";

interface CountdownDisplayProps {
  countdown: CountdownTime;
  target: CountdownTarget;
  isActive: boolean;
  isCompleted: boolean;
}

export const CountdownDisplay: Component<CountdownDisplayProps> = (props) => {
  const getStatusText = (): string => {
    if (props.isCompleted) return "Countdown completed!";
    if (props.isActive) return "Countdown is running...";
    return "Countdown is stopped";
  };

  return (
    <div class="countdown-display-section">
      <h2 class="countdown-title">{props.target.label}</h2>

      <div class="countdown-target-date">{formatTargetDate(props.target)}</div>

      <div
        class={`countdown-status ${props.isActive ? "active" : props.isCompleted ? "completed" : ""}`}
      >
        {getStatusText()}
      </div>

      <div class="countdown-display">
        <div class="countdown-unit">
          <div class="countdown-value">{props.countdown.days}</div>
          <div class="countdown-label">Days</div>
        </div>
        <div class="countdown-unit">
          <div class="countdown-value">{props.countdown.hours}</div>
          <div class="countdown-label">Hours</div>
        </div>
        <div class="countdown-unit">
          <div class="countdown-value">{props.countdown.minutes}</div>
          <div class="countdown-label">Minutes</div>
        </div>
        <div class="countdown-unit">
          <div class="countdown-value">{props.countdown.seconds}</div>
          <div class="countdown-label">Seconds</div>
        </div>
      </div>
    </div>
  );
};
