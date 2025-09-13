/**
 * DataTable Data Processing Composable
 * Handles data sorting and pagination logic
 */

import { createMemo } from "solid-js";
import { Column, SortDirection } from "./DataTable.types";
import { sortData, paginateData } from "./DataTable.utils";

export interface DataTableData<T = unknown> {
  sortedData: () => T[];
  paginatedData: () => T[];
}

export const useDataTableData = <T = unknown>(
  data: T[],
  columns: Column<T>[],
  sortColumn: () => string | null,
  sortDirection: () => SortDirection,
  page: number,
  pageSize: number,
  showPagination: boolean
): DataTableData<T> => {
  const sortedData = createMemo(() =>
    sortData(data, columns, sortColumn(), sortDirection())
  );

  const paginatedData = createMemo(() =>
    paginateData(sortedData(), page, pageSize, showPagination)
  );

  return {
    sortedData,
    paginatedData,
  };
};
