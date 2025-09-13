/**
 * DataTable Module Exports
 * Barrel exports for the modular DataTable system
 */

export { DataTable } from "./DataTable";
export { DataTableHeader } from "./DataTableHeader";
export { DataTableBody } from "./DataTableBody";
export { DataTablePagination } from "./DataTablePagination";
export { useDataTableHandlers } from "./useDataTableHandlers";
export { useDataTableData } from "./useDataTableData";
export { useDataTableSetup } from "./useDataTableSetup";

export type {
  Column,
  DataTableProps,
  SortDirection,
  DataTableState,
  DataTableUtils,
} from "./DataTable.types";

export {
  getCellValue,
  getTableClasses,
  getSortIcon,
  sortData,
  paginateData,
} from "./DataTable.utils";
