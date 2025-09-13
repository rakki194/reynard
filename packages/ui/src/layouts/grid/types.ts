/**
 * Grid Component Types
 * Shared type definitions for grid components
 */

import { JSX } from "solid-js";

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
