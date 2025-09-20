/**
 * Data Table Component
 * Feature-rich table with sorting, filtering, pagination, and selection
 * Orchestrates smaller modular components for maintainability
 */

import { Component } from "solid-js";
import { DataTableProps } from "./DataTable.types";
import { getTableClasses } from "./DataTable.utils";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { useDataTableSetup } from "./useDataTableSetup";

export const DataTable: Component<DataTableProps> = props => {
  const { local, others, handlers, data } = useDataTableSetup(props);

  return (
    <div class={getTableClasses(local.loading ?? false, local.class)} {...others}>
      <div class="reynard-data-table__wrapper">
        <table class="reynard-data-table__table">
          <DataTableHeader
            columns={local.columns!}
            selectable={local.selectable ?? false}
            selectAll={local.selectAll ?? true}
            selectedRows={handlers.selectedRows()}
            dataLength={local.data!.length}
            sortColumn={handlers.sortColumn()}
            sortDirection={handlers.sortDirection()}
            onSort={handlers.handleSort}
            onSelectAll={handlers.handleSelectAll}
          />
          <DataTableBody
            data={data.paginatedData()}
            columns={local.columns!}
            selectable={local.selectable ?? false}
            loading={local.loading ?? false}
            emptyMessage={local.emptyMessage ?? "No data available"}
            selectedRows={handlers.selectedRows()}
            onRowSelect={handlers.handleRowSelect}
            onRowClick={local.onRowClick}
          />
        </table>
      </div>

      <DataTablePagination
        showPagination={local.showPagination ?? true}
        showPageSizeSelector={local.showPageSizeSelector ?? true}
        page={local.page ?? 1}
        pageSize={local.pageSize ?? 10}
        pageSizes={local.pageSizes ?? [5, 10, 25, 50, 100]}
        totalItems={data.sortedData().length}
        onPageChange={local.onPageChange}
        onPageSizeChange={local.onPageSizeChange}
      />
    </div>
  );
};
