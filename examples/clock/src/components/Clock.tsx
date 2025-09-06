/**
 * Clock Component
 * Digital and analog clock display with real-time updates
 */

import { Component, createSignal, onMount, onCleanup, Show, createEffect } from "solid-js";
import { Button, Card } from "@reynard/components";

interface TimeState {
  hours: number;
  minutes: number;
  seconds: number;
  date: string;
}

export const Clock: Component = () => {
  const [time, setTime] = createSignal<TimeState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    date: "",
  });
  const [showAnalog, setShowAnalog] = createSignal(false);

  let intervalId: NodeJS.Timeout;
  let styleElement: HTMLStyleElement;

  const updateTime = () => {
    const now = new Date();
    setTime({
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      date: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  };

  // Create style element for dynamic CSS custom properties
  onMount(() => {
    styleElement = document.createElement('style');
    styleElement.id = 'clock-dynamic-styles';
    document.head.appendChild(styleElement);
    
    updateTime();
    intervalId = setInterval(updateTime, 1000);
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  });

  // Update CSS custom properties when time changes
  createEffect(() => {
    if (styleElement) {
      const hourRotation = getHourRotation();
      const minuteRotation = getMinuteRotation();
      const secondRotation = getSecondRotation();
      
      // Generate CSS for clock ticks
      let tickStyles = '';
      for (let i = 0; i < 12; i++) {
        tickStyles += `.clock-tick.tick-major-${i} { --rotation: ${i * 30}deg; }\n`;
      }
      for (let i = 0; i < 60; i++) {
        if (i % 5 !== 0) {
          tickStyles += `.clock-tick.tick-minor-${i} { --rotation: ${i * 6}deg; }\n`;
        }
      }
      
      // Generate CSS for clock numbers
      let numberStyles = '';
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30) - 90;
        const radius = 120;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        numberStyles += `.clock-number.number-${i} { --x: ${x}px; --y: ${y}px; }\n`;
      }
      
      styleElement.textContent = `
        .clock-hand.hour-hand { --rotation: ${hourRotation}deg; }
        .clock-hand.minute-hand { --rotation: ${minuteRotation}deg; }
        .clock-hand.second-hand { --rotation: ${secondRotation}deg; }
        ${tickStyles}
        ${numberStyles}
      `;
    }
  });

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  const getAnalogHandRotation = (value: number, max: number) => {
    return (value / max) * 360;
  };

  const getHourRotation = () => {
    const hour = time().hours % 12;
    const minute = time().minutes;
    return getAnalogHandRotation(hour * 5 + (minute / 12), 60);
  };

  const getMinuteRotation = () => {
    return getAnalogHandRotation(time().minutes, 60);
  };

  const getSecondRotation = () => {
    return getAnalogHandRotation(time().seconds, 60);
  };

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
          <div class="digital-clock">
            <div class="clock-display">
              {formatTime(time().hours)}:{formatTime(time().minutes)}:{formatTime(time().seconds)}
            </div>
            <div class="clock-date">{time().date}</div>
          </div>
        </Show>

        <Show when={showAnalog()}>
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
                  return (
                    <div class={`clock-tick tick-minor tick-minor-${i}`} />
                  );
                }
                return null;
              })}
            </div>

            {/* Clock numbers */}
            <div class="clock-numbers">
              {Array.from({ length: 12 }, (_, i) => {
                const number = i === 0 ? 12 : i;
                
                return (
                  <div class={`clock-number number-${i}`}>
                    {number}
                  </div>
                );
              })}
            </div>

            {/* Clock hands */}
            <div class="clock-hand hour-hand" />
            <div class="clock-hand minute-hand" />
            <div class="clock-hand second-hand" />
            <div class="clock-center" />
          </div>
        </Show>
      </Card>
    </div>
  );
};
