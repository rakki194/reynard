/**
 * useClockStyles Composable
 * Manages dynamic CSS styles for analog clock
 */

import { onMount, onCleanup, createEffect } from "solid-js";
import type { ClockHandRotation } from "../types/clock";

export const useClockStyles = (rotations: () => ClockHandRotation) => {
  let styleElement: HTMLStyleElement;

  const generateTickStyles = (): string => {
    let tickStyles = "";
    for (let i = 0; i < 12; i++) {
      tickStyles += `.clock-tick.tick-major-${i} { --rotation: ${i * 30}deg; }\n`;
    }
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) {
        tickStyles += `.clock-tick.tick-minor-${i} { --rotation: ${i * 6}deg; }\n`;
      }
    }
    return tickStyles;
  };

  const generateNumberStyles = (): string => {
    let numberStyles = "";
    for (let i = 0; i < 12; i++) {
      const angle = i * 30 - 90;
      const radius = 120;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      numberStyles += `.clock-number.number-${i} { --x: ${x}px; --y: ${y}px; }\n`;
    }
    return numberStyles;
  };

  const updateStyles = (): void => {
    if (styleElement) {
      const { hour, minute, second } = rotations();

      styleElement.textContent = `
        .clock-hand.hour-hand { --rotation: ${hour}deg; }
        .clock-hand.minute-hand { --rotation: ${minute}deg; }
        .clock-hand.second-hand { --rotation: ${second}deg; }
        ${generateTickStyles()}
        ${generateNumberStyles()}
      `;
    }
  };

  onMount(() => {
    styleElement = document.createElement("style");
    styleElement.id = "clock-dynamic-styles";
    document.head.appendChild(styleElement);
  });

  onCleanup(() => {
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  });

  createEffect(() => {
    updateStyles();
  });
};
