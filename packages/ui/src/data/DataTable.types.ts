/**
 * DataTable Types and Interfaces
 * Core type definitions for the DataTable component system
 */

import { JSX } from "solid-js";

export interface Column<T = unknown> {
  /** Unique column identifier */
  id: string;
  /** Column header text */
  header: string | JSX.Element;
  /** Data accessor function or property key */
  accessor: keyof T | ((row: T) => unknown);
  /** Custom cell renderer */
  cell?: (value: unknown, row: T, index: number) => JSX.Element;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Column width */
  width?: string | number;
  /** Column alignment */
  align?: "left" | "center" | "right";
  /** Whether column can be hidden */
  hideable?: boolean;
  /** Whether column is initially visible */
  visible?: boolean;
}

export interface DataTableProps<T = unknown> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Whether to show select all checkbox */
  selectAll?: boolean;
  /** Current page (1-based) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Whether to show page size selector */
  showPageSizeSelector?: boolean;
  /** Available page sizes */
  pageSizes?: number[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom class name */
  class?: string;
  /** Row selection handler */
  onRowSelect?: (selectedRows: T[]) => void;
  /** Sort change handler */
  onSort?: (column: string, direction: "asc" | "desc" | null) => void;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
}

export type SortDirection = "asc" | "desc" | null;

export interface DataTableState {
  selectedRows: Set<number>;
  sortColumn: string | null;
  sortDirection: SortDirection;
}

export interface DataTableUtils {
  getCellValue: (row: unknown, column: Column) => unknown;
  getTableClasses: (loading: boolean, customClass?: string) => string;
  getSortIcon: (
    column: Column,
    sortColumn: string | null,
    sortDirection: SortDirection,
  ) => JSX.Element | null;
}
