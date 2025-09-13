/**
 * DataTable Utility Functions
 * Helper functions for data processing, sorting, and UI utilities
 */

import { JSX } from "solid-js";
import { Column, SortDirection } from "./DataTable.types";

export const getCellValue = (row: unknown, column: Column): unknown => {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }
  if (typeof row === "object" && row !== null) {
    return (row as Record<string, unknown>)[column.accessor];
  }
  return undefined;
};

export const getTableClasses = (
  loading: boolean,
  customClass?: string,
): string => {
  const classes = ["reynard-data-table"];
  if (loading) classes.push("reynard-data-table--loading");
  if (customClass) classes.push(customClass);
  return classes.join(" ");
};

export const getSortIcon = (
  column: Column,
  sortColumn: string | null,
  sortDirection: SortDirection,
): JSX.Element | null => {
  if (!column.sortable) return null;

  const isActive = sortColumn === column.id;
  const direction = isActive ? sortDirection : null;

  return (
    <span class="reynard-data-table__sort-icon">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
        class={`reynard-data-table__sort-svg ${
          isActive
            ? "reynard-data-table__sort-svg--active"
            : "reynard-data-table__sort-svg--inactive"
        } ${direction === "desc" ? "reynard-data-table__sort-svg--desc" : ""}`}
      >
        <path d="M6 1l4 4H8v5H4V5H2z" />
      </svg>
    </span>
  );
};

export const sortData = <T,>(
  data: T[],
  columns: Column<T>[],
  sortColumn: string | null,
  sortDirection: SortDirection,
): T[] => {
  if (!sortColumn || !sortDirection) return data;

  const column = columns.find((col) => col.id === sortColumn);
  if (!column) return data;

  return [...data].sort((a, b) => {
    let aVal: unknown;
    let bVal: unknown;

    if (typeof column.accessor === "function") {
      aVal = column.accessor(a);
      bVal = column.accessor(b);
    } else {
      aVal = (a as Record<string, unknown>)[column.accessor as string];
      bVal = (b as Record<string, unknown>)[column.accessor as string];
    }

    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDirection === "asc" ? -1 : 1;
    if (bVal == null) return sortDirection === "asc" ? 1 : -1;

    // Convert to strings for comparison if needed
    if (typeof aVal === "string" && typeof bVal === "string") {
      const aStr = aVal.toLowerCase();
      const bStr = bVal.toLowerCase();
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }

    // Handle numeric comparisons
    if (typeof aVal === "number" && typeof bVal === "number") {
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }

    // Fallback: convert to strings for comparison
    const aStr = String(aVal);
    const bStr = String(bVal);
    if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
    if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
};

export const paginateData = <T,>(
  data: T[],
  page: number,
  pageSize: number,
  showPagination: boolean,
): T[] => {
  if (!showPagination) return data;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
};
