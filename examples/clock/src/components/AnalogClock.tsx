/**
 * AnalogClock Component
 * Analog clock display with hands, ticks, and numbers
 */

import { Component } from "solid-js";

export const AnalogClock: Component = () => {
  return (
    <div class="analog-clock">
      {/* Clock face */}
      <div class="clock-ticks">
        {/* Hour ticks */}
        {Array.from({ length: 12 }, (_, i) => (
          <div class={`clock-tick tick-major tick-major-${i}`} />
        ))}
        {/* Minute ticks */}
        {Array.from({ length: 60 }, (_, i) => {
          if (i % 5 !== 0) {
            return <div class={`clock-tick tick-minor tick-minor-${i}`} />;
          }
          return null;
        })}
      </div>

      {/* Clock numbers */}
      <div class="clock-numbers">
        {Array.from({ length: 12 }, (_, i) => {
          const number = i === 0 ? 12 : i;

          return <div class={`clock-number number-${i}`}>{number}</div>;
        })}
      </div>

      {/* Clock hands */}
      <div class="clock-hand hour-hand" />
      <div class="clock-hand minute-hand" />
      <div class="clock-hand second-hand" />
      <div class="clock-center" />
    </div>
  );
};
