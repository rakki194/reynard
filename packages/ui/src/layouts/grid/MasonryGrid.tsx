/**
 * MasonryGrid Component
 * Masonry-style grid layout for dynamic heights
 */

import { Component, splitProps } from "solid-js";
import type { MasonryGridProps } from "./types";
import { generateGapClasses } from "./utils";

export const MasonryGrid: Component<MasonryGridProps> = props => {
  const [local, others] = splitProps(props, ["columns", "gap", "class", "children"]);

  const getColumns = () => {
    if (typeof local.columns === "number") return local.columns;
    if (typeof local.columns === "object") {
      // Default to medium breakpoint
      return local.columns.md || local.columns.sm || local.columns.xs || 2;
    }
    return 2;
  };

  const getClasses = () => {
    const classes = ["reynard-masonry-grid"];

    // Add column classes
    const cols = getColumns();
    if (cols <= 12) {
      classes.push(`reynard-grid--cols-${cols}`);
    }

    // Add gap classes
    classes.push(...generateGapClasses(local.gap));

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  return (
    <div class={getClasses()} {...others}>
      {local.children}
    </div>
  );
};
