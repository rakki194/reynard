/**
 * Color Info Component
 * Displays color metadata and values
 */

import { Component } from "solid-js";

interface ColorInfoProps {
  color: string;
  lightness: number;
  chroma: number;
  hue: number;
  title?: string;
}

export const ColorInfo: Component<ColorInfoProps> = (props) => {
  return (
    <div class="color-info">
      <h3>{props.title || "Current Color"}</h3>
      <code>{props.color}</code>
      <p>L: {props.lightness}% | C: {props.chroma.toFixed(2)} | H: {props.hue}°</p>
    </div>
  );
};
