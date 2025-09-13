/**
 * Grid Component
 * Responsive CSS Grid layout with flexible configurations
 */

import { Component, splitProps } from "solid-js";
import type { GridProps } from "./types";
import {
  generateGapClasses,
  generateColumnClasses,
  generateAutoRowsClasses,
  generateAutoFlowClasses,
  generateMinWidthClasses,
} from "./utils";

export const Grid: Component<GridProps> = (props) => {
  const [local, others] = splitProps(props, [
    "columns",
    "gap",
    "minColumnWidth",
    "autoRows",
    "autoFlow",
    "autoFit",
    "class",
    "children",
  ]);

  const getClasses = () => {
    const classes = ["reynard-grid"];

    // Add gap classes
    classes.push(...generateGapClasses(local.gap));

    // Add column classes
    if (local.autoFit) {
      classes.push("reynard-grid--auto-fit");
    } else {
      classes.push(...generateColumnClasses(local.columns));
    }

    // Add auto-rows classes
    classes.push(...generateAutoRowsClasses(local.autoRows));

    // Add auto-flow classes
    classes.push(...generateAutoFlowClasses(local.autoFlow));

    // Add min column width classes for auto-fit
    classes.push(
      ...generateMinWidthClasses(local.autoFit, local.minColumnWidth),
    );

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  return (
    <div class={getClasses()} {...others}>
      {local.children}
    </div>
  );
};
