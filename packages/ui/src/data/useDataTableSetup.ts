/**
 * DataTable Setup Composable
 * Handles component initialization and setup logic
 */

import { DataTableProps } from "./DataTable.types";
import { useDataTableHandlers } from "./useDataTableHandlers";
import { useDataTableData } from "./useDataTableData";
import { mergeDataTableProps, splitDataTableProps } from "./DataTable.utils";

export interface DataTableSetup<T = unknown> {
  local: DataTableProps<T>;
  others: Record<string, unknown>;
  handlers: ReturnType<typeof useDataTableHandlers>;
  data: ReturnType<typeof useDataTableData>;
}

export const useDataTableSetup = <T = unknown>(
  props: DataTableProps<T>
): DataTableSetup<T> => {
  const merged = mergeDataTableProps(props);
  const [local, others] = splitDataTableProps(merged);

  const handlers = useDataTableHandlers(
    local.data,
    local.onRowSelect,
    local.onSort
  );

  const data = useDataTableData(
    local.data,
    local.columns,
    handlers.sortColumn,
    handlers.sortDirection,
    local.page!,
    local.pageSize!,
    local.showPagination!
  );

  return {
    local,
    others,
    handlers,
    data,
  };
};
