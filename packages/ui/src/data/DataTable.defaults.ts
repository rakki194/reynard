/**
 * DataTable Default Configuration
 * Centralized default values for DataTable props
 */

import { DataTableProps } from "./DataTable.types";

export const getDataTableDefaults = <T = unknown>(): Partial<
  DataTableProps<T>
> => ({
  selectable: false,
  selectAll: true,
  page: 1,
  pageSize: 10,
  showPagination: true,
  showPageSizeSelector: true,
  pageSizes: [5, 10, 25, 50, 100],
  loading: false,
  emptyMessage: "No data available",
});

export const DATA_TABLE_PROP_KEYS = [
  "data",
  "columns",
  "selectable",
  "selectAll",
  "page",
  "pageSize",
  "showPagination",
  "showPageSizeSelector",
  "pageSizes",
  "loading",
  "emptyMessage",
  "class",
  "onRowSelect",
  "onSort",
  "onPageChange",
  "onPageSizeChange",
  "onRowClick",
] as const;
