/**
 * DataTable Event Handlers Composable
 * Centralized event handling logic for the DataTable component
 */

import { SortDirection } from "./DataTable.types";
import { useDataTableSorting, DataTableSorting } from "./useDataTableSorting";
import { useDataTableSelection, DataTableSelection } from "./useDataTableSelection";

export interface DataTableHandlers<T = unknown> extends DataTableSorting<T>, DataTableSelection<T> {}

export const useDataTableHandlers = <T = unknown>(
  data: T[],
  onRowSelect?: (selectedRows: T[]) => void,
  onSort?: (column: string, direction: SortDirection) => void
): DataTableHandlers<T> => {
  const sorting = useDataTableSorting<T>(onSort);
  const selection = useDataTableSelection<T>(data, onRowSelect);

  return {
    ...sorting,
    ...selection,
  };
};
