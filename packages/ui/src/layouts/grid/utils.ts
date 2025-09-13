/**
 * Grid Component Utilities
 * Helper functions for grid class generation
 */

import type { GridProps, GridItemProps } from "./types";

export const generateGapClasses = (gap?: string | number): string[] => {
  const classes: string[] = [];

  if (typeof gap === "number") {
    if (gap <= 4) classes.push("reynard-grid--gap-xs");
    else if (gap <= 8) classes.push("reynard-grid--gap-sm");
    else if (gap <= 16) classes.push("reynard-grid--gap-md");
    else if (gap <= 24) classes.push("reynard-grid--gap-lg");
    else classes.push("reynard-grid--gap-xl");
  } else if (gap) {
    classes.push("reynard-grid--custom-gap");
    // Add specific gap size classes for common values
    if (gap === "0.25rem") classes.push("reynard-grid--custom-gap-025rem");
    else if (gap === "0.5rem") classes.push("reynard-grid--custom-gap-05rem");
    else if (gap === "1rem") classes.push("reynard-grid--custom-gap-1rem");
    else if (gap === "1.5rem") classes.push("reynard-grid--custom-gap-15rem");
    else if (gap === "2rem") classes.push("reynard-grid--custom-gap-2rem");
    else if (gap === "4px") classes.push("reynard-grid--custom-gap-4px");
    else if (gap === "8px") classes.push("reynard-grid--custom-gap-8px");
    else if (gap === "16px") classes.push("reynard-grid--custom-gap-16px");
    else if (gap === "24px") classes.push("reynard-grid--custom-gap-24px");
    else if (gap === "32px") classes.push("reynard-grid--custom-gap-32px");
  }

  return classes;
};

export const generateColumnClasses = (
  columns?: GridProps["columns"],
): string[] => {
  const classes: string[] = [];

  if (typeof columns === "number") {
    if (columns <= 12) {
      classes.push(`reynard-grid--cols-${columns}`);
    }
  } else if (typeof columns === "object") {
    // Add responsive column classes
    if (columns.xs) {
      classes.push("reynard-grid--cols-responsive-xs");
      classes.push(`reynard-grid--cols-${columns.xs}`);
    }
    if (columns.sm) {
      classes.push("reynard-grid--cols-responsive-sm");
      classes.push(`reynard-grid--cols-${columns.sm}`);
    }
    if (columns.md) {
      classes.push("reynard-grid--cols-responsive-md");
      classes.push(`reynard-grid--cols-${columns.md}`);
    }
    if (columns.lg) {
      classes.push("reynard-grid--cols-responsive-lg");
      classes.push(`reynard-grid--cols-${columns.lg}`);
    }
    if (columns.xl) {
      classes.push("reynard-grid--cols-responsive-xl");
      classes.push(`reynard-grid--cols-${columns.xl}`);
    }
  }

  return classes;
};

export const generateAutoRowsClasses = (autoRows?: string): string[] => {
  const classes: string[] = [];

  if (autoRows) {
    if (autoRows === "min-content") classes.push("reynard-grid--auto-rows-min");
    else if (autoRows === "max-content")
      classes.push("reynard-grid--auto-rows-max");
    else if (autoRows === "auto") classes.push("reynard-grid--auto-rows-auto");
  }

  return classes;
};

export const generateAutoFlowClasses = (
  autoFlow?: GridProps["autoFlow"],
): string[] => {
  const classes: string[] = [];

  if (autoFlow) {
    if (autoFlow === "row") classes.push("reynard-grid--flow-row");
    else if (autoFlow === "column") classes.push("reynard-grid--flow-column");
    else if (autoFlow === "row dense")
      classes.push("reynard-grid--flow-row-dense");
    else if (autoFlow === "column dense")
      classes.push("reynard-grid--flow-column-dense");
  }

  return classes;
};

export const generateMinWidthClasses = (
  autoFit?: boolean,
  minColumnWidth?: string,
): string[] => {
  const classes: string[] = [];

  if (autoFit && minColumnWidth) {
    if (minColumnWidth === "200px") classes.push("reynard-grid--min-width-200");
    else if (minColumnWidth === "250px")
      classes.push("reynard-grid--min-width-250");
    else if (minColumnWidth === "300px")
      classes.push("reynard-grid--min-width-300");
    else if (minColumnWidth === "400px")
      classes.push("reynard-grid--min-width-400");
    else if (minColumnWidth === "500px")
      classes.push("reynard-grid--min-width-500");
  }

  return classes;
};

export const generateGridItemSpanClasses = (
  colSpan?: GridItemProps["colSpan"],
): string[] => {
  const classes: string[] = [];

  if (typeof colSpan === "number") {
    if (colSpan <= 12) {
      classes.push(`reynard-grid-item--span-${colSpan}`);
    }
  } else if (typeof colSpan === "object") {
    // Add responsive column span classes
    if (colSpan.xs) {
      classes.push("reynard-grid-item--span-responsive-xs");
      classes.push(`reynard-grid-item--span-${colSpan.xs}`);
    }
    if (colSpan.sm) {
      classes.push("reynard-grid-item--span-responsive-sm");
      classes.push(`reynard-grid-item--span-${colSpan.sm}`);
    }
    if (colSpan.md) {
      classes.push("reynard-grid-item--span-responsive-md");
      classes.push(`reynard-grid-item--span-${colSpan.md}`);
    }
    if (colSpan.lg) {
      classes.push("reynard-grid-item--span-responsive-lg");
      classes.push(`reynard-grid-item--span-${colSpan.lg}`);
    }
    if (colSpan.xl) {
      classes.push("reynard-grid-item--span-responsive-xl");
      classes.push(`reynard-grid-item--span-${colSpan.xl}`);
    }
  }

  return classes;
};

export const generateGridItemPositionClasses = (
  rowSpan?: number,
  colStart?: number,
  colEnd?: number,
  rowStart?: number,
  rowEnd?: number,
): string[] => {
  const classes: string[] = [];

  if (rowSpan && rowSpan <= 6) {
    classes.push(`reynard-grid-item--row-span-${rowSpan}`);
  }
  if (colStart && colStart <= 6) {
    classes.push(`reynard-grid-item--col-start-${colStart}`);
  }
  if (colEnd && colEnd <= 6) {
    classes.push(`reynard-grid-item--col-end-${colEnd}`);
  }
  if (rowStart && rowStart <= 6) {
    classes.push(`reynard-grid-item--row-start-${rowStart}`);
  }
  if (rowEnd && rowEnd <= 6) {
    classes.push(`reynard-grid-item--row-end-${rowEnd}`);
  }

  return classes;
};
