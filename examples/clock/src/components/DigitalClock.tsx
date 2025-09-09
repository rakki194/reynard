/**
 * DigitalClock Component
 * Digital clock display with time and date
 */

import { Component } from "solid-js";
import type { TimeState } from "../types/clock";
import { formatTime } from "../utils/timeUtils";

interface DigitalClockProps {
  time: TimeState;
}

export const DigitalClock: Component<DigitalClockProps> = (props) => {
  return (
    <div class="digital-clock">
      <div class="clock-display">
        {formatTime(props.time.hours)}:{formatTime(props.time.minutes)}:
        {formatTime(props.time.seconds)}
      </div>
      <div class="clock-date">{props.time.date}</div>
    </div>
  );
};
