/**
 * Grid Component
 * Responsive CSS Grid layout with flexible configurations
 */

import {
  Component,
  JSX,
  splitProps,
  createMemo,
  For,
  children as resolveChildren,
} from "solid-js";

export interface GridProps {
  /** Number of columns (can be responsive object) */
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
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
  colSpan?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
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

const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

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

  const gridStyles = createMemo((): JSX.CSSProperties => {
    const styles: JSX.CSSProperties = {
      display: "grid",
      gap: typeof local.gap === "number" ? `${local.gap}px` : local.gap || "1rem",
    };

    if (local.autoFit && local.minColumnWidth) {
      styles["grid-template-columns"] = `repeat(auto-fit, minmax(${local.minColumnWidth}, 1fr))`;
    } else if (typeof local.columns === "number") {
      styles["grid-template-columns"] = `repeat(${local.columns}, 1fr)`;
    } else if (typeof local.columns === "object") {
      // For responsive columns, we'll use CSS custom properties
      // and handle responsiveness with CSS media queries
      styles["grid-template-columns"] = `repeat(var(--grid-columns, ${local.columns.md || 1}), 1fr)`;
    } else {
      styles["grid-template-columns"] = "repeat(auto-fit, minmax(250px, 1fr))";
    }

    if (local.autoRows) {
      styles["grid-auto-rows"] = local.autoRows;
    }

    if (local.autoFlow) {
      styles["grid-auto-flow"] = local.autoFlow;
    }

    return styles;
  });

  const getClasses = () => {
    const classes = ["reynard-grid"];
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  // Generate CSS custom properties for responsive columns
  const getCustomProperties = createMemo(() => {
    if (typeof local.columns !== "object") return {};

    const properties: Record<string, string> = {};
    
    if (local.columns.xs) properties["--grid-columns-xs"] = local.columns.xs.toString();
    if (local.columns.sm) properties["--grid-columns-sm"] = local.columns.sm.toString();
    if (local.columns.md) properties["--grid-columns-md"] = local.columns.md.toString();
    if (local.columns.lg) properties["--grid-columns-lg"] = local.columns.lg.toString();
    if (local.columns.xl) properties["--grid-columns-xl"] = local.columns.xl.toString();

    return properties;
  });

  return (
    <div
      class={getClasses()}
      style={{ ...gridStyles(), ...getCustomProperties() }}
      {...others}
    >
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

  const itemStyles = createMemo((): JSX.CSSProperties => {
    const styles: JSX.CSSProperties = {};

    if (typeof local.colSpan === "number") {
      styles["grid-column"] = `span ${local.colSpan}`;
    } else if (typeof local.colSpan === "object") {
      // For responsive spans, use CSS custom properties
      styles["grid-column"] = `span var(--col-span, ${local.colSpan.md || 1})`;
    }

    if (local.rowSpan) {
      styles["grid-row"] = `span ${local.rowSpan}`;
    }

    if (local.colStart) {
      styles["grid-column-start"] = local.colStart.toString();
    }

    if (local.colEnd) {
      styles["grid-column-end"] = local.colEnd.toString();
    }

    if (local.rowStart) {
      styles["grid-row-start"] = local.rowStart.toString();
    }

    if (local.rowEnd) {
      styles["grid-row-end"] = local.rowEnd.toString();
    }

    return styles;
  });

  const getClasses = () => {
    const classes = ["reynard-grid-item"];
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getCustomProperties = createMemo(() => {
    if (typeof local.colSpan !== "object") return {};

    const properties: Record<string, string> = {};
    
    if (local.colSpan.xs) properties["--col-span-xs"] = local.colSpan.xs.toString();
    if (local.colSpan.sm) properties["--col-span-sm"] = local.colSpan.sm.toString();
    if (local.colSpan.md) properties["--col-span-md"] = local.colSpan.md.toString();
    if (local.colSpan.lg) properties["--col-span-lg"] = local.colSpan.lg.toString();
    if (local.colSpan.xl) properties["--col-span-xl"] = local.colSpan.xl.toString();

    return properties;
  });

  return (
    <div
      class={getClasses()}
      style={{ ...itemStyles(), ...getCustomProperties() }}
      {...others}
    >
      {local.children}
    </div>
  );
};

// Masonry Grid for dynamic heights
export interface MasonryGridProps {
  /** Number of columns */
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
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

  const gap = typeof local.gap === "number" ? `${local.gap}px` : local.gap || "1rem";

  const getClasses = () => {
    const classes = ["reynard-masonry-grid"];
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const masonryStyles = (): JSX.CSSProperties => ({
    display: "grid",
    "grid-template-columns": `repeat(${getColumns()}, 1fr)`,
    gap,
    "align-items": "start",
  });

  return (
    <div
      class={getClasses()}
      style={masonryStyles()}
      {...others}
    >
      {local.children}
    </div>
  );
};




