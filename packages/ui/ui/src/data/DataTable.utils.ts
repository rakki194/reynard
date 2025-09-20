/**
 * DataTable Utility Functions
 * Helper functions for prop handling and data processing
 */

import { splitProps } from "solid-js";
import { DataTableProps, Column, SortDirection } from "./DataTable.types";
import { getDataTableDefaults, DATA_TABLE_PROP_KEYS } from "./DataTable.defaults";

/**
 * Merges default props with provided props
 */
export const mergeDataTableProps = <T = unknown>(props: DataTableProps<T>): DataTableProps<T> => {
  const defaults = getDataTableDefaults<T>();
  return { ...defaults, ...props };
};

/**
 * Splits props into local and others based on DataTable prop keys
 */
export const splitDataTableProps = <T = unknown>(
  props: DataTableProps<T>
): [DataTableProps<T>, Record<string, unknown>] => {
  return splitProps(props, DATA_TABLE_PROP_KEYS);
};

/**
 * Gets the appropriate sort icon for a column
 */
export const getSortIcon = <T = unknown>(
  column: Column<T>,
  sortColumn: string | null,
  sortDirection: SortDirection
) => {
  if (!column.sortable || sortColumn !== column.id) {
    return null;
  }

  return sortDirection === "asc" ? "↑" : "↓";
};

/**
 * Gets the cell value for a given row and column
 */
export const getCellValue = <T = unknown>(row: T, column: Column<T>): unknown => {
  if (column.accessor) {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    if (typeof column.accessor === "string") {
      return (row as any)[column.accessor];
    }
  }
  return null;
};

/**
 * Sorts data based on column and direction
 */
export const sortData = <T = unknown>(
  data: T[],
  columns: Column<T>[],
  sortColumn: string | null,
  sortDirection: SortDirection
): T[] => {
  if (!sortColumn) return data;

  const column = columns.find(col => col.id === sortColumn);
  if (!column || !column.sortable) return data;

  return [...data].sort((a, b) => {
    const aValue = getCellValue(a, column);
    const bValue = getCellValue(b, column);

    if (aValue === bValue) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });
};

/**
 * Paginates data based on page and page size
 */
export const paginateData = <T = unknown>(data: T[], page: number, pageSize: number, showPagination: boolean): T[] => {
  if (!showPagination) return data;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};

/**
 * Gets the CSS classes for the data table
 */
export const getTableClasses = (loading: boolean, customClass?: string): string => {
  const baseClasses = "reynard-data-table";
  const loadingClass = loading ? "reynard-data-table--loading" : "";
  const customClasses = customClass ? customClass : "";

  return [baseClasses, loadingClass, customClasses].filter(Boolean).join(" ");
};
