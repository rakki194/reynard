/**
 * GridItem Component
 * Individual grid item with positioning and spanning capabilities
 */

import { Component, splitProps } from "solid-js";
import type { GridItemProps } from "./types";
import { generateGridItemSpanClasses, generateGridItemPositionClasses } from "./utils";

export const GridItem: Component<GridItemProps> = props => {
  const [local, others] = splitProps(props, [
    "colSpan",
    "rowSpan",
    "colStart",
    "rowStart",
    "colEnd",
    "rowEnd",
    "class",
    "children",
  ]);

  const getClasses = () => {
    const classes = ["reynard-grid-item"];

    // Add column span classes
    classes.push(...generateGridItemSpanClasses(local.colSpan));

    // Add positioning classes
    classes.push(
      ...generateGridItemPositionClasses(local.rowSpan, local.colStart, local.colEnd, local.rowStart, local.rowEnd)
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
