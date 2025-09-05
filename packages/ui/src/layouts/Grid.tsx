/**
 * Grid Component
 * Responsive CSS Grid layout with flexible configurations
 */

import { Component, JSX, splitProps } from "solid-js";

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
      // Handle string gaps by adding custom gap class
      classes.push("reynard-grid--custom-gap");
      // Add specific gap size classes for common values
      if (local.gap === "0.25rem")
        classes.push("reynard-grid--custom-gap-025rem");
      else if (local.gap === "0.5rem")
        classes.push("reynard-grid--custom-gap-05rem");
      else if (local.gap === "1rem")
        classes.push("reynard-grid--custom-gap-1rem");
      else if (local.gap === "1.5rem")
        classes.push("reynard-grid--custom-gap-15rem");
      else if (local.gap === "2rem")
        classes.push("reynard-grid--custom-gap-2rem");
      else if (local.gap === "4px")
        classes.push("reynard-grid--custom-gap-4px");
      else if (local.gap === "8px")
        classes.push("reynard-grid--custom-gap-8px");
      else if (local.gap === "16px")
        classes.push("reynard-grid--custom-gap-16px");
      else if (local.gap === "24px")
        classes.push("reynard-grid--custom-gap-24px");
      else if (local.gap === "32px")
        classes.push("reynard-grid--custom-gap-32px");
    }

    // Add column classes
    if (local.autoFit) {
      classes.push("reynard-grid--auto-fit");
    } else if (typeof local.columns === "number") {
      if (local.columns <= 12) {
        classes.push(`reynard-grid--cols-${local.columns}`);
      }
    } else if (typeof local.columns === "object") {
      // Add responsive column classes
      if (local.columns.xs) {
        classes.push("reynard-grid--cols-responsive-xs");
        classes.push(`reynard-grid--cols-${local.columns.xs}`);
      }
      if (local.columns.sm) {
        classes.push("reynard-grid--cols-responsive-sm");
        classes.push(`reynard-grid--cols-${local.columns.sm}`);
      }
      if (local.columns.md) {
        classes.push("reynard-grid--cols-responsive-md");
        classes.push(`reynard-grid--cols-${local.columns.md}`);
      }
      if (local.columns.lg) {
        classes.push("reynard-grid--cols-responsive-lg");
        classes.push(`reynard-grid--cols-${local.columns.lg}`);
      }
      if (local.columns.xl) {
        classes.push("reynard-grid--cols-responsive-xl");
        classes.push(`reynard-grid--cols-${local.columns.xl}`);
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

    // Add min column width classes for auto-fit
    if (local.autoFit && local.minColumnWidth) {
      if (local.minColumnWidth === "200px")
        classes.push("reynard-grid--min-width-200");
      else if (local.minColumnWidth === "250px")
        classes.push("reynard-grid--min-width-250");
      else if (local.minColumnWidth === "300px")
        classes.push("reynard-grid--min-width-300");
      else if (local.minColumnWidth === "400px")
        classes.push("reynard-grid--min-width-400");
      else if (local.minColumnWidth === "500px")
        classes.push("reynard-grid--min-width-500");
    }

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  return (
    <div class={getClasses()} {...others}>
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
    } else if (typeof local.colSpan === "object") {
      // Add responsive column span classes
      if (local.colSpan.xs) {
        classes.push("reynard-grid-item--span-responsive-xs");
        classes.push(`reynard-grid-item--span-${local.colSpan.xs}`);
      }
      if (local.colSpan.sm) {
        classes.push("reynard-grid-item--span-responsive-sm");
        classes.push(`reynard-grid-item--span-${local.colSpan.sm}`);
      }
      if (local.colSpan.md) {
        classes.push("reynard-grid-item--span-responsive-md");
        classes.push(`reynard-grid-item--span-${local.colSpan.md}`);
      }
      if (local.colSpan.lg) {
        classes.push("reynard-grid-item--span-responsive-lg");
        classes.push(`reynard-grid-item--span-${local.colSpan.lg}`);
      }
      if (local.colSpan.xl) {
        classes.push("reynard-grid-item--span-responsive-xl");
        classes.push(`reynard-grid-item--span-${local.colSpan.xl}`);
      }
    }

    // Add positioning classes
    if (local.rowSpan && local.rowSpan <= 6) {
      classes.push(`reynard-grid-item--row-span-${local.rowSpan}`);
    }
    if (local.colStart && local.colStart <= 6) {
      classes.push(`reynard-grid-item--col-start-${local.colStart}`);
    }
    if (local.colEnd && local.colEnd <= 6) {
      classes.push(`reynard-grid-item--col-end-${local.colEnd}`);
    }
    if (local.rowStart && local.rowStart <= 6) {
      classes.push(`reynard-grid-item--row-start-${local.rowStart}`);
    }
    if (local.rowEnd && local.rowEnd <= 6) {
      classes.push(`reynard-grid-item--row-end-${local.rowEnd}`);
    }

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  return (
    <div class={getClasses()} {...others}>
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

  return (
    <div class={getClasses()} {...others}>
      {local.children}
    </div>
  );
};
