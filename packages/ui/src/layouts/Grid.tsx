/**
 * Grid Component
 * Responsive CSS Grid layout with flexible configurations
 */

import { Component, JSX, splitProps, createMemo } from "solid-js";

export interface GridProps {
  /** Number of columns (can be responsive object) */
  columns?:
    | number
    | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Gap between grid items */
  gap?: string | number;
  /** Minimum column width (for auto-fit grids) */
  minColumnWidth?: string;
  /** Grid auto-rows setting */
  autoRows?: string;
  /** Grid auto-flow setting */
  autoFlow?: "row" | "column" | "row dense" | "column dense";
  /** Whether to use auto-fit instead of fixed columns */
  autoFit?: boolean;
  /** Custom class name */
  class?: string;
  /** Grid items */
  children: JSX.Element;
}

export interface GridItemProps {
  /** Column span */
  colSpan?:
    | number
    | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Row span */
  rowSpan?: number;
  /** Column start position */
  colStart?: number;
  /** Row start position */
  rowStart?: number;
  /** Column end position */
  colEnd?: number;
  /** Row end position */
  rowEnd?: number;
  /** Custom class name */
  class?: string;
  /** Grid item content */
  children: JSX.Element;
}

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
    if (typeof local.gap === "number") {
      if (local.gap <= 4) classes.push("reynard-grid--gap-xs");
      else if (local.gap <= 8) classes.push("reynard-grid--gap-sm");
      else if (local.gap <= 16) classes.push("reynard-grid--gap-md");
      else if (local.gap <= 24) classes.push("reynard-grid--gap-lg");
      else classes.push("reynard-grid--gap-xl");
    } else if (local.gap) {
      // Handle string gaps by adding custom CSS variable
      classes.push("reynard-grid--custom-gap");
    }

    // Add column classes
    if (local.autoFit) {
      classes.push("reynard-grid--auto-fit");
    } else if (typeof local.columns === "number") {
      if (local.columns <= 12) {
        classes.push(`reynard-grid--cols-${local.columns}`);
      }
    }

    // Add auto-rows classes
    if (local.autoRows) {
      if (local.autoRows === "min-content")
        classes.push("reynard-grid--auto-rows-min");
      else if (local.autoRows === "max-content")
        classes.push("reynard-grid--auto-rows-max");
      else if (local.autoRows === "auto")
        classes.push("reynard-grid--auto-rows-auto");
    }

    // Add auto-flow classes
    if (local.autoFlow) {
      if (local.autoFlow === "row") classes.push("reynard-grid--flow-row");
      else if (local.autoFlow === "column")
        classes.push("reynard-grid--flow-column");
      else if (local.autoFlow === "row dense")
        classes.push("reynard-grid--flow-row-dense");
      else if (local.autoFlow === "column dense")
        classes.push("reynard-grid--flow-column-dense");
    }

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  // Generate CSS custom properties for responsive columns and custom gaps
  const getCustomProperties = createMemo(() => {
    const properties: Record<string, string> = {};

    // Handle responsive columns
    if (typeof local.columns === "object") {
      if (local.columns.xs)
        properties["--grid-columns-xs"] = local.columns.xs.toString();
      if (local.columns.sm)
        properties["--grid-columns-sm"] = local.columns.sm.toString();
      if (local.columns.md)
        properties["--grid-columns-md"] = local.columns.md.toString();
      if (local.columns.lg)
        properties["--grid-columns-lg"] = local.columns.lg.toString();
      if (local.columns.xl)
        properties["--grid-columns-xl"] = local.columns.xl.toString();
    }

    // Handle custom gap
    if (typeof local.gap === "string" && local.gap) {
      properties["--custom-gap"] = local.gap;
    }

    // Handle custom minColumnWidth for auto-fit
    if (local.autoFit && local.minColumnWidth) {
      properties["--min-column-width"] = local.minColumnWidth;
    }

    return properties;
  });

  return (
    <div class={getClasses()} style={getCustomProperties()} {...others}>
      {local.children}
    </div>
  );
};

export const GridItem: Component<GridItemProps> = (props) => {
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
    if (typeof local.colSpan === "number") {
      if (local.colSpan <= 12) {
        classes.push(`reynard-grid-item--span-${local.colSpan}`);
      }
    }

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getCustomProperties = createMemo(() => {
    const properties: Record<string, string> = {};

    // Handle responsive column spans
    if (typeof local.colSpan === "object") {
      if (local.colSpan.xs)
        properties["--col-span-xs"] = local.colSpan.xs.toString();
      if (local.colSpan.sm)
        properties["--col-span-sm"] = local.colSpan.sm.toString();
      if (local.colSpan.md)
        properties["--col-span-md"] = local.colSpan.md.toString();
      if (local.colSpan.lg)
        properties["--col-span-lg"] = local.colSpan.lg.toString();
      if (local.colSpan.xl)
        properties["--col-span-xl"] = local.colSpan.xl.toString();
    }

    // Handle positioning properties that can't be easily converted to classes
    if (local.rowSpan) properties["--row-span"] = local.rowSpan.toString();
    if (local.colStart) properties["--col-start"] = local.colStart.toString();
    if (local.colEnd) properties["--col-end"] = local.colEnd.toString();
    if (local.rowStart) properties["--row-start"] = local.rowStart.toString();
    if (local.rowEnd) properties["--row-end"] = local.rowEnd.toString();

    return properties;
  });

  return (
    <div class={getClasses()} style={getCustomProperties()} {...others}>
      {local.children}
    </div>
  );
};

// Masonry Grid for dynamic heights
export interface MasonryGridProps {
  /** Number of columns */
  columns?:
    | number
    | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Gap between items */
  gap?: string | number;
  /** Custom class name */
  class?: string;
  /** Masonry items */
  children: JSX.Element;
}

export const MasonryGrid: Component<MasonryGridProps> = (props) => {
  const [local, others] = splitProps(props, [
    "columns",
    "gap",
    "class",
    "children",
  ]);

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
    if (typeof local.gap === "number") {
      if (local.gap <= 4) classes.push("reynard-grid--gap-xs");
      else if (local.gap <= 8) classes.push("reynard-grid--gap-sm");
      else if (local.gap <= 16) classes.push("reynard-grid--gap-md");
      else if (local.gap <= 24) classes.push("reynard-grid--gap-lg");
      else classes.push("reynard-grid--gap-xl");
    } else if (local.gap) {
      classes.push("reynard-grid--custom-gap");
    }

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getCustomProperties = createMemo(() => {
    const properties: Record<string, string> = {};

    // Handle custom gap
    if (typeof local.gap === "string" && local.gap) {
      properties["--custom-gap"] = local.gap;
    }

    return properties;
  });

  return (
    <div class={getClasses()} style={getCustomProperties()} {...others}>
      {local.children}
    </div>
  );
};
