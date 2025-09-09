/**
 * Clock Component
 * Main clock component that orchestrates digital and analog displays
 */

import { Component, createSignal, Show } from "solid-js";
import { Button, Card } from "reynard-components";
import { useTime } from "../composables/useTime";
import { useClockStyles } from "../composables/useClockStyles";
import { DigitalClock } from "./DigitalClock";
import { AnalogClock } from "./AnalogClock";

export const Clock: Component = () => {
  const [showAnalog, setShowAnalog] = createSignal(false);
  const { time, rotations } = useTime();

  useClockStyles(rotations);

  return (
    <div class="clock-container">
      <Card class="clock-card">
        <div class="clock-toggle-container">
          <Button
            onClick={() => setShowAnalog(!showAnalog())}
            class="btn btn-secondary"
          >
            {showAnalog() ? "Show Digital" : "Show Analog"}
          </Button>
        </div>

        <Show when={!showAnalog()}>
          <DigitalClock time={time()} />
        </Show>

        <Show when={showAnalog()}>
          <AnalogClock />
        </Show>
      </Card>
    </div>
  );
};
