/**
 * Color Info Component
 * Displays color metadata and values
 */

import { Component } from "solid-js";
import { useI18n } from "reynard-i18n";

interface ColorInfoProps {
  color: string;
  lightness: number;
  chroma: number;
  hue: number;
  title?: string;
}

export const ColorInfo: Component<ColorInfoProps> = props => {
  const { t } = useI18n();

  return (
    <div class="color-info">
      <h3>{props.title || t("components.colorPicker.currentColor")}</h3>
      <code>{props.color}</code>
      <p>
        {t("components.colorPicker.lightnessLabel")}: {props.lightness}% | {t("components.colorPicker.chromaLabel")}:{" "}
        {props.chroma.toFixed(2)} | {t("components.colorPicker.hueLabel")}: {props.hue}°
      </p>
    </div>
  );
};
