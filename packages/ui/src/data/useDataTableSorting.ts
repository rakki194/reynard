/**
 * DataTable Sorting Composable
 * Handles sorting state and logic for the DataTable component
 */

import { createSignal, Setter } from "solid-js";
import { Column, SortDirection } from "./DataTable.types";

export interface DataTableSorting<T = unknown> {
  sortColumn: () => string | null;
  setSortColumn: Setter<string | null>;
  sortDirection: () => SortDirection;
  setSortDirection: Setter<SortDirection>;
  handleSort: (column: Column<T>) => void;
}

export const useDataTableSorting = <T = unknown>(
  onSort?: (column: string, direction: SortDirection) => void
): DataTableSorting<T> => {
  const [sortColumn, setSortColumn] = createSignal<string | null>(null);
  const [sortDirection, setSortDirection] = createSignal<SortDirection>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const currentDirection = sortColumn() === column.id ? sortDirection() : null;
    let newDirection: SortDirection;

    if (currentDirection === null) {
      newDirection = "asc";
    } else if (currentDirection === "asc") {
      newDirection = "desc";
    } else {
      newDirection = null;
    }

    setSortColumn(newDirection ? column.id : null);
    setSortDirection(newDirection);
    onSort?.(column.id, newDirection);
  };

  return {
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    handleSort,
  };
};
