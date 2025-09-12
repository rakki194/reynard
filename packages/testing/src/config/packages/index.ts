/**
 * Package Configuration Aggregator
 * Combines all package configurations into a single export
 */

import { uiPackages } from "./ui-packages";
import { featurePackages } from "./feature-packages";
import { mediaPackages } from "./media-packages";
import { specializedPackages } from "./specialized-packages";
import { disabledPackages } from "./disabled-packages";

export const allPackages = [
  ...uiPackages,
  ...featurePackages,
  ...mediaPackages,
  ...specializedPackages,
  ...disabledPackages,
];

export * from "./ui-packages";
export * from "./feature-packages";
export * from "./media-packages";
export * from "./specialized-packages";
export * from "./disabled-packages";
